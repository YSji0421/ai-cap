package com.adjuster.system.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "risk_profiles")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
public class RiskProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String riskCategory;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 500)
    private String relatedKeywords;

    @Column(length = 200)
    private String recommendedInsuranceTypes;

    @Column
    private int severityWeight = 1;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
