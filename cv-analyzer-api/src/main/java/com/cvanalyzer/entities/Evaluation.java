package com.cvanalyzer.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.io.Serializable;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Evaluation implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double score;

    @Column(length = 3000)
    private String analysisSummary;

    @Column(length = 3000)
    private String recommendations;

    private LocalDateTime createdAt;

    private String evaluationType;

    @JsonIgnore
    @Column(name = "user_id")
    private Long userId;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "cv_id", nullable = false)
    private CvUpload cvUpload;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}