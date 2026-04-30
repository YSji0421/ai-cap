package com.adjuster.system.entity;

import com.adjuster.system.enums.AccidentType;
import com.adjuster.system.enums.CaseStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cases")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
public class Case {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true, length = 30)
    private String caseNumber;

    @Column(nullable = false, length = 100)
    private String caseName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AccidentType accidentType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CaseStatus status = CaseStatus.RECEIVED;

    @Column(nullable = false)
    private LocalDate receivedDate;

    @Column(columnDefinition = "TEXT")
    private String memo;

    @OneToOne(mappedBy = "caseEntity", cascade = CascadeType.ALL,
              fetch = FetchType.LAZY, orphanRemoval = true)
    private Client client;

    @OneToMany(mappedBy = "caseEntity", cascade = CascadeType.ALL,
               fetch = FetchType.LAZY)
    @OrderBy("consultSeq ASC")
    private List<Consultation> consultations = new ArrayList<>();

    @OneToMany(mappedBy = "caseEntity", cascade = CascadeType.ALL,
               fetch = FetchType.LAZY)
    @OrderBy("createdAt DESC")
    private List<Report> reports = new ArrayList<>();

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
