package com.cvanalyzer.controllers;

import com.cvanalyzer.dtos.EvaluationResponse;
import com.cvanalyzer.entities.Evaluation;
import com.cvanalyzer.kafka.CvAnalysisProducer;
import com.cvanalyzer.security.JwtValidator;
import com.cvanalyzer.services.EvaluationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/evaluations")
public class EvaluationController {

    private final EvaluationService service;
    private final CvAnalysisProducer producer;
    private final JwtValidator jwtValidator;

    public EvaluationController(EvaluationService service, CvAnalysisProducer producer, JwtValidator jwtValidator) {
        this.service = service;
        this.producer = producer;
        this.jwtValidator = jwtValidator;
    }

    @PostMapping("/analyze/{cvId}")
    public ResponseEntity<Map<String, String>> analyzeCv(@PathVariable Long cvId, @RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserId(authHeader);
        producer.sendAnalysisRequest(cvId, userId);

        return ResponseEntity.accepted() // 202 Accepted
                .body(Map.of("message", "Analiziniz kuyruğa alındı."));
    }

    @GetMapping("/my-evaluations")
    public ResponseEntity<List<Evaluation>> getUserEvaluations(@RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(service.getByUserId(userId));
    }

    @GetMapping("/cv/{cvId}")
    public ResponseEntity<?> getEvaluationByCv(@PathVariable Long cvId, @RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserId(authHeader);
        try {
            EvaluationResponse response = service.getEvaluationByCvId(cvId, userId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/delete/{cvId}")
    public ResponseEntity<Void> deleteCv(@PathVariable Long cvId, @RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserId(authHeader);

        service.deleteEvaluation(cvId, userId);

        return ResponseEntity.noContent().build();
    }

    private Long extractUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Oturum bilgisi bulunamadı veya geçersiz.");
        }
        String token = authHeader.substring(7);
        return jwtValidator.extractUserId(token);
    }
}
