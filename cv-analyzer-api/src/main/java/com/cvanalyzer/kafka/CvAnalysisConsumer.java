package com.cvanalyzer.kafka;

import com.cvanalyzer.services.EvaluationService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class CvAnalysisConsumer {

    private final EvaluationService evaluationService;

    public CvAnalysisConsumer(EvaluationService evaluationService) {
        this.evaluationService = evaluationService;
    }

    //Topici sürekli dinliyor. Mesaj gelince ayırma işlemi yapıyor. ayırdıktan sonra servisi çağırıyor.
    @KafkaListener(topics = "cv-analysis-topic", groupId = "cv-analyzer-group")
    public void consumeAnalysisRequest(String message) {
        System.out.println("Received request to topic: " + message);

        try{
            String[] parts = message.split(":", 2);
            Long cvId = Long.valueOf(parts[0].trim());
            Long userId = Long.valueOf(parts[1].trim());

            evaluationService.analyzeCvAndVerifyUser(cvId, userId);
            System.out.println("Analysis request sent" + cvId);
        }
        catch(Exception e){
            System.err.println("Error" + e.getMessage());
        }
    }
}
