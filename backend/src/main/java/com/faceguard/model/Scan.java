package com.faceguard.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "scans")
public class Scan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String result;
    private double confidence;
    private double depthScore;
    private double textureScore;
    private double fusionScore;
    private LocalDateTime createdAt;

    public Scan() {}

    public Scan(Long userId, String result, double confidence,
                double depthScore, double textureScore, double fusionScore) {
        this.userId = userId;
        this.result = result;
        this.confidence = confidence;
        this.depthScore = depthScore;
        this.textureScore = textureScore;
        this.fusionScore = fusionScore;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public String getResult() { return result; }
    public double getConfidence() { return confidence; }
    public double getDepthScore() { return depthScore; }
    public double getTextureScore() { return textureScore; }
    public double getFusionScore() { return fusionScore; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
