package com.adjuster.system.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "reservations",
    uniqueConstraints = @UniqueConstraint(columnNames = {"consultantId", "reservationDate", "timeSlot"}))
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long consultantId;

    @Column(nullable = false, length = 50)
    private String customerName;

    @Column(nullable = false, length = 20)
    private String customerPhone;

    @Column(length = 100)
    private String customerEmail;

    @Column(length = 50)
    private String customerTelegramChatId;

    @Column(length = 20)
    private String insuranceType;

    @Column(nullable = false)
    private LocalDate reservationDate;

    @Column(nullable = false, length = 20)
    private String timeSlot;

    @Column(nullable = false, length = 20)
    private String status = "PENDING";

    @Column(length = 200)
    private String roomLink;

    @Column(columnDefinition = "TEXT")
    private String memo;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
