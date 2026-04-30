package com.adjuster.system.repository;

import com.adjuster.system.entity.FaqEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FaqEntryRepository extends JpaRepository<FaqEntry, Long> {
    List<FaqEntry> findByInsuranceTypeOrderByPriorityDesc(String insuranceType);

    @Query("SELECT f FROM FaqEntry f WHERE f.insuranceType = :type AND " +
           "(LOWER(f.keywords) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(f.question) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<FaqEntry> searchByKeyword(@Param("type") String insuranceType, @Param("keyword") String keyword);

    @Query("SELECT f FROM FaqEntry f WHERE " +
           "LOWER(f.keywords) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(f.question) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<FaqEntry> searchAllByKeyword(@Param("keyword") String keyword);
}
