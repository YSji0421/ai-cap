package com.adjuster.system.entity;

import com.adjuster.system.enums.ConsultMethod;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "consultations")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
public class Consultation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", nullable = false)
    private Case caseEntity;

    @Column(nullable = false)
    private int consultSeq;

    @Column(nullable = false)
    private LocalDateTime consultDatetime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ConsultMethod consultMethod;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(columnDefinition = "TEXT")
    private String specialNote;

    @Column(columnDefinition = "TEXT")
    private String summaryContent;

    @Column(columnDefinition = "TEXT")
    private String keywords;

    @Column(nullable = false)
    private boolean summaryGenerated = false;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
