package com.adjuster.system.repository;

import com.adjuster.system.entity.Case;
import com.adjuster.system.entity.CaseHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CaseHistoryRepository extends JpaRepository<CaseHistory, Long> {
    List<CaseHistory> findByCaseEntityOrderByCreatedAtAsc(Case caseEntity);
}
