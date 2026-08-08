package com.cvanalyzer.services;

import com.cvanalyzer.dtos.EvaluationResponse;
import com.cvanalyzer.entities.CvUpload;
import com.cvanalyzer.entities.Evaluation;
import com.cvanalyzer.exceptions.CvNotFoundException;
import com.cvanalyzer.exceptions.EvaluationAlreadyExistsException;
import com.cvanalyzer.exceptions.UnauthorizedAccessException;
import com.cvanalyzer.repos.CvUploadRepository;
import com.cvanalyzer.repos.EvaluationRepository;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import jakarta.transaction.Transactional;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.apache.tika.exception.TikaException;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.parser.AutoDetectParser;
import org.apache.tika.sax.BodyContentHandler;
import org.xml.sax.SAXException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@Service
public class EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final CvUploadRepository cvUploadRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final SimpMessagingTemplate messagingTemplate;


    public EvaluationService(EvaluationRepository evaluationRepository,
                             CvUploadRepository cvUploadRepository,
                             ObjectMapper objectMapper,
                             SimpMessagingTemplate messagingTemplate) {
        this.evaluationRepository = evaluationRepository;
        this.cvUploadRepository = cvUploadRepository;
        this.restTemplate = new RestTemplate();
        this.objectMapper = objectMapper;
        this.messagingTemplate = messagingTemplate;
    }


    @Value("${GEMINI_API_KEY}")
    private String geminiApiKey;

    private EvaluationResponse convertToDto(Evaluation evaluation) {
        return EvaluationResponse.builder()
                .id(evaluation.getId())
                .score(evaluation.getScore())
                .analysisSummary(evaluation.getAnalysisSummary())
                .recommendations(evaluation.getRecommendations())
                .createdAt(evaluation.getCreatedAt())
                .evaluationType(evaluation.getEvaluationType())
                .build();
    }

    @Cacheable(value = "evaluations", key = "#cvId")
    public EvaluationResponse getEvaluationByCvId(Long cvId, Long userId) {
        Evaluation evaluation = evaluationRepository.findByCvUpload_Id(cvId)
                .orElseThrow(() -> new RuntimeException("Bu CV için analiz bulunamadı."));

        if (!evaluation.getCvUpload().getUserId().equals(userId)) {
            throw new UnauthorizedAccessException("Bu analizi görüntüleme yetkiniz yok.");
        }
        // Veritabanı objesini değil, bizim hafif ve güvenli objemizi dönüyoruz
        return convertToDto(evaluation);
    }

    public Evaluation analyzeCvAndVerifyUser(Long cvId, Long userId) throws IOException {
        CvUpload cvUpload = cvUploadRepository.findById(cvId)
                .orElseThrow(() -> new CvNotFoundException("CV bulunamadı."));

        if (!cvUpload.getUserId().equals(userId)) {
            throw new UnauthorizedAccessException("Bu CV'yi analiz etme yetkiniz yok.");
        }

        Optional<Evaluation> existingEvaluation = evaluationRepository.findByCvUpload(cvUpload);
        if (existingEvaluation.isPresent()) {
            throw new EvaluationAlreadyExistsException("Bu CV zaten değerlendirilmiş.");
        }

        String cvText = extractTextFromCv(cvUpload.getFilePath());

        String prompt = """
                Aşağıdaki CV içeriğini titizlikle incele.
                1. CV'yi 0 ile 100 arasında bir puanla değerlendir. Puanı, adayın pozisyona uygunluğu,
                deneyiminin derinliği, beceri setinin çeşitliliği ve CV'nin genel kalitesi gibi faktörlere dayanarak ver.
                2. CV'nin detaylı analizini ve incelemesini içeren kısa bir özet yaz.
                3. Adayın kariyer gelişimine katkı sağlayacak ve CV'yi daha etkili hale getirecek, en az 3,
                en fazla 5 adet, aksiyon odaklı iyileştirme önerisi sun. Öneriler maddeler halinde olmalıdır.
                4. Puanı, özetini ve önerileri sadece ve kesinlikle JSON formatında döndür. JSON anahtarları 'score',
                 'summary' ve 'recommendations' olsun. 'recommendations' alanı, madde işaretlerini içeren tek bir metin dizesi olsun.
                5. CV analizin maximum 3000 karakter uzunluğunda olsun.
                CV içeriği:
                """
                + cvText;

        String aiResponse = callGemini(prompt);

        System.out.println("CV metni çıkarıldı, uzunluk: " + cvText.length());

        double score;
        String summary;
        String recommendations;
        try {
            int jsonStart = aiResponse.indexOf('{');
            int jsonEnd = aiResponse.lastIndexOf('}');
            String cleanedResponse = aiResponse;

            if (jsonStart != -1 && jsonEnd != -1 && jsonEnd > jsonStart) {
                cleanedResponse = aiResponse.substring(jsonStart, jsonEnd + 1);
            }

            JsonNode root = objectMapper.readTree(cleanedResponse);
            score = root.path("score").asDouble();
            summary = root.path("summary").asText();
            recommendations = root.path("recommendations").asText();

            if (summary.length() > 2000) {
                summary = summary.substring(0, 2000);
            }

        } catch (IOException e) {
            score = 0;
            summary = "JSON ayrıştırma hatası oluştu: " + aiResponse;
            recommendations = "Öneri bulunamadı.";

            if (summary.length() > 2000) {
                summary = summary.substring(0, 2000);
            }
            if (recommendations.length() > 3000) {
                recommendations = recommendations.substring(0, 3000);
            }
        }

        Evaluation evaluation = new Evaluation();
        evaluation.setScore(score);
        evaluation.setAnalysisSummary(summary);
        evaluation.setEvaluationType("AI_ANALYSIS");
        evaluation.setCvUpload(cvUpload);
        evaluation.setRecommendations(recommendations);
        evaluation.setUserId(userId);

        if (!cvUploadRepository.existsById(cvId)) {
            System.out.println("Uyarı: Analiz bitti ancak CV (" + cvId + ") veritabanından silinmiş. Kayıt yapılmadı.");
            if (messagingTemplate != null) {
                messagingTemplate.convertAndSend("/topic/analysis/" + cvId, "ERROR:CV_DELETED");
            }
            return null;
        }

        Evaluation savedEvaluation = evaluationRepository.save(evaluation);

        EvaluationResponse responseDto = convertToDto(savedEvaluation);

        if (messagingTemplate != null) {
            messagingTemplate.convertAndSend("/topic/analysis/" + cvId, responseDto);
        }

        return savedEvaluation;

    }

    private String extractTextFromCv(String filePath) throws IOException {
        String fullPath = Paths.get("uploads", new File(filePath).getName()).toAbsolutePath().toString();
        try (FileInputStream inputStream = new FileInputStream(fullPath)) {
            AutoDetectParser parser = new AutoDetectParser();
            BodyContentHandler handler = new BodyContentHandler(-1);
            Metadata metadata = new Metadata();

            parser.parse(inputStream, handler, metadata);
            return handler.toString();
        } catch (TikaException | SAXException e) {
            throw new IOException("Dosya içeriği okunurken bir hata oluştu.", e);
        }
    }

    @Transactional
    public void deleteEvaluation(Long cvId, Long userId) {
        CvUpload cv = cvUploadRepository.findById(cvId)
                .orElseThrow(() -> new CvNotFoundException("CV kaydı bulunamadı. ID: " + cvId));

        if (!cv.getUserId().equals(userId)) {
            throw new UnauthorizedAccessException("Bu analizi silme yetkiniz yok.");
        }

        evaluationRepository.deleteByCvUpload(cv);
    }

    @CircuitBreaker(name = "geminiApi", fallbackMethod = "callGeminiFallback")
    @Retry(name = "geminiApi")
    private String callGemini(String prompt) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key="
                + geminiApiKey;

        String requestBody = """
                {
                    "contents": [{
                        "parts": [{"text": "%s"}]
                    }]
                }
                """.formatted(prompt.replace("\"", "\\\"").replace("\n", "\\n"));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

        try {
            JsonNode root = objectMapper.readTree(response.getBody());
            return root.path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();
        } catch (Exception e) {
            throw new RuntimeException("Gemini yanıtı ayrıştırılamadı.", e);
        }
    }


    public List<Evaluation> getByUserId(Long userId) {
        return evaluationRepository.findByUserId(userId);
    }
}
