package com.adjuster.system.repository;

import com.adjuster.system.entity.LegalClause;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LegalClauseRepository extends JpaRepository<LegalClause, Long> {
    List<LegalClause> findByInsuranceType(String insuranceType);

    @Query("SELECT c FROM LegalClause c WHERE c.insuranceType = :type AND " +
           "(LOWER(c.keywords) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(c.clauseTitle) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<LegalClause> searchByKeyword(@Param("type") String insuranceType, @Param("keyword") String keyword);
}
