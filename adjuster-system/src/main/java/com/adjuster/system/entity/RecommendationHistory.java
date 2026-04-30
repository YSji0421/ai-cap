package com.adjuster.system.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "recommendation_history")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
public class RecommendationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private Long userId;

    @Column(length = 50)
    private String customerName;

    @Column(columnDefinition = "TEXT")
    private String customerConcerns;

    @Column(columnDefinition = "TEXT")
    private String recommendedProducts;

    @Column
    private Long selectedProductId;

    @Column(length = 100)
    private String consultationRoomId;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
