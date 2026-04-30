package com.adjuster.system.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "consultation_sessions")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
public class ConsultationSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String roomId;

    @Column
    private Long userId;

    @Column(length = 100)
    private String userEmail;

    @Column(length = 20)
    private String insuranceType;

    @Column(length = 200)
    private String title;

    @Column(columnDefinition = "LONGTEXT")
    private String transcript;

    @Column(columnDefinition = "LONGTEXT")
    private String aiAnalysis;

    @Column(length = 500)
    private String keywords;

    @Column
    private Integer duration;

    @Column
    private LocalDateTime sessionDate;

    @Column(length = 20)
    private String status = "ACTIVE";

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
