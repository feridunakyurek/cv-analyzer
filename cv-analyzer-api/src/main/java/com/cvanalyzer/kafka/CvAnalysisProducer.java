package com.cvanalyzer.kafka;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class CvAnalysisProducer {
    private static final String TOPIC = "cv-analysis-topic";

    private final KafkaTemplate<String, String> kafkaTemplate;

    public CvAnalysisProducer(KafkaTemplate<String, String> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendAnalysisRequest(Long cvId, Long userId){
        String message = cvId+ ":" + userId;
        kafkaTemplate.send(TOPIC, message);
        System.out.println("Sent message to topic: " + message);
    }
}
