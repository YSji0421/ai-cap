package com.adjuster.system.repository;

import com.adjuster.system.entity.Case;
import com.adjuster.system.entity.Consultation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ConsultationRepository extends JpaRepository<Consultation, Long> {
    long countByCaseEntity(Case caseEntity);

    List<Consultation> findByCaseEntityOrderByConsultSeqAsc(Case caseEntity);

    @Query("""
        SELECT c FROM Consultation c
        JOIN c.caseEntity ca
        WHERE ca.user.email = :email
        ORDER BY c.consultDatetime DESC
    """)
    Page<Consultation> findRecentByUserEmail(@Param("email") String email, Pageable pageable);
}
