package com.adjuster.system.repository;

import com.adjuster.system.entity.Case;
import com.adjuster.system.enums.CaseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;

public interface CaseRepository extends JpaRepository<Case, Long> {

    @Query("""
        SELECT c FROM Case c
        LEFT JOIN c.client cl
        WHERE c.user.email = :email
        AND (:keyword IS NULL OR :keyword = '' OR c.caseName LIKE %:keyword% OR cl.clientName LIKE %:keyword%)
        AND (:status IS NULL OR :status = '' OR c.status = :status)
        ORDER BY c.createdAt DESC
    """)
    Page<Case> findByUserEmailAndFilter(
        @Param("email") String email,
        @Param("keyword") String keyword,
        @Param("status") String status,
        Pageable pageable
    );

    long countByReceivedDate(LocalDate receivedDate);

    @Query("SELECT COUNT(c) FROM Case c WHERE c.user.email = :email AND c.status = :status")
    long countByUserEmailAndStatus(@Param("email") String email, @Param("status") CaseStatus status);

    @Query("""
        SELECT c FROM Case c
        WHERE c.user.email = :email
        ORDER BY c.createdAt DESC
    """)
    Page<Case> findRecentByUserEmail(@Param("email") String email, Pageable pageable);
}
