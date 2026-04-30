package com.adjuster.system.repository;

import com.adjuster.system.entity.Case;
import com.adjuster.system.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByCaseEntityOrderByCreatedAtDesc(Case caseEntity);
}
