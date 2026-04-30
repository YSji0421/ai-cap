package com.adjuster.system.repository;

import com.adjuster.system.entity.RiskProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RiskProfileRepository extends JpaRepository<RiskProfile, Long> {

    @Query("SELECT r FROM RiskProfile r WHERE " +
           "LOWER(r.relatedKeywords) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<RiskProfile> searchByKeyword(@Param("keyword") String keyword);
}
