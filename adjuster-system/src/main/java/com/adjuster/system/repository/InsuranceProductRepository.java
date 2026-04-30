package com.adjuster.system.repository;

import com.adjuster.system.entity.InsuranceProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface InsuranceProductRepository extends JpaRepository<InsuranceProduct, Long> {
    List<InsuranceProduct> findByInsuranceType(String insuranceType);

    @Query("SELECT p FROM InsuranceProduct p WHERE " +
           "LOWER(p.targetKeywords) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.riskCategories) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<InsuranceProduct> searchByKeyword(@Param("keyword") String keyword);

    @Query("SELECT p FROM InsuranceProduct p WHERE p.insuranceType IN :types")
    List<InsuranceProduct> findByInsuranceTypeIn(@Param("types") List<String> types);
}
