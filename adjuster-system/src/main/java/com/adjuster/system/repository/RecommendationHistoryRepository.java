package com.adjuster.system.repository;

import com.adjuster.system.entity.RecommendationHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecommendationHistoryRepository extends JpaRepository<RecommendationHistory, Long> {
    List<RecommendationHistory> findByUserIdOrderByCreatedAtDesc(Long userId);
}
