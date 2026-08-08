package com.cvanalyzer.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvaluationResponse implements Serializable { 
    private Long id;
    private double score;
    private String analysisSummary;
    private String recommendations;
    private LocalDateTime createdAt;
    private String evaluationType;
}