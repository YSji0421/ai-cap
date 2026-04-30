package com.adjuster.system.service;

import com.adjuster.system.entity.InsuranceProduct;
import com.adjuster.system.entity.RecommendationHistory;
import com.adjuster.system.entity.RiskProfile;
import com.adjuster.system.repository.InsuranceProductRepository;
import com.adjuster.system.repository.RecommendationHistoryRepository;
import com.adjuster.system.repository.RiskProfileRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InsuranceRecommendationService {

    private final InsuranceProductRepository productRepository;
    private final RiskProfileRepository riskProfileRepository;
    private final RecommendationHistoryRepository historyRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public Map<String, Object> recommend(String concerns, String customerName,
                                          Integer age, String occupation,
                                          List<String> riskChecklist, Long userId) {
        // Step 1: Tokenize concerns
        List<String> tokens = tokenize(concerns);
        if (riskChecklist != null) {
            tokens.addAll(riskChecklist);
        }

        // Step 2: Find matching risk profiles
        Set<RiskProfile> matchedProfiles = new LinkedHashSet<>();
        Set<String> recommendedTypes = new LinkedHashSet<>();
        for (String token : tokens) {
            List<RiskProfile> profiles = riskProfileRepository.searchByKeyword(token);
            matchedProfiles.addAll(profiles);
            for (RiskProfile p : profiles) {
                if (p.getRecommendedInsuranceTypes() != null) {
                    Arrays.stream(p.getRecommendedInsuranceTypes().split(","))
                        .map(String::trim)
                        .forEach(recommendedTypes::add);
                }
            }
        }

        // Step 3: Find matching products
        Map<InsuranceProduct, Integer> scoredProducts = new LinkedHashMap<>();

        // Search by keywords from concerns
        for (String token : tokens) {
            List<InsuranceProduct> products = productRepository.searchByKeyword(token);
            for (InsuranceProduct p : products) {
                scoredProducts.merge(p, 1, Integer::sum);
            }
        }

        // Boost products matching recommended types
        if (!recommendedTypes.isEmpty()) {
            List<InsuranceProduct> typeProducts = productRepository.findByInsuranceTypeIn(new ArrayList<>(recommendedTypes));
            for (InsuranceProduct p : typeProducts) {
                scoredProducts.merge(p, 2, Integer::sum);
            }
        }

        // Filter by age if provided
        List<Map<String, Object>> recommendations = scoredProducts.entrySet().stream()
            .sorted(Map.Entry.<InsuranceProduct, Integer>comparingByValue().reversed())
            .filter(entry -> {
                if (age == null) return true;
                String ageRange = entry.getKey().getAgeRange();
                if (ageRange == null || ageRange.isEmpty()) return true;
                return isAgeInRange(age, ageRange);
            })
            .limit(5)
            .map(entry -> {
                InsuranceProduct p = entry.getKey();
                Map<String, Object> rec = new LinkedHashMap<>();
                rec.put("productId", p.getId());
                rec.put("productName", p.getProductName());
                rec.put("provider", p.getProvider());
                rec.put("insuranceType", p.getInsuranceType());
                rec.put("description", p.getDescription());
                rec.put("coverageDetails", p.getCoverageDetails());
                rec.put("monthlyPremiumRange", p.getMonthlyPremiumRange());
                rec.put("matchScore", entry.getValue());
                rec.put("recommendReason", generateReason(p, matchedProfiles, tokens));
                return rec;
            })
            .collect(Collectors.toList());

        // Step 4: Save recommendation history
        try {
            RecommendationHistory history = new RecommendationHistory();
            history.setUserId(userId);
            history.setCustomerName(customerName);
            history.setCustomerConcerns(concerns);
            history.setRecommendedProducts(objectMapper.writeValueAsString(recommendations));
            historyRepository.save(history);
        } catch (Exception e) {
            log.error("Failed to save recommendation history", e);
        }

        // Step 5: Build response
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("recommendations", recommendations);
        result.put("matchedRisks", matchedProfiles.stream()
            .map(p -> Map.of("category", p.getRiskCategory(), "description", p.getDescription()))
            .collect(Collectors.toList()));
        result.put("totalFound", recommendations.size());
        return result;
    }

    public List<RecommendationHistory> getHistory(Long userId) {
        return historyRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public Map<String, Object> startConsultation(Long recommendationId) {
        RecommendationHistory history = historyRepository.findById(recommendationId)
            .orElseThrow(() -> new RuntimeException("추천 이력을 찾을 수 없습니다."));

        String roomId = "room-rec-" + System.currentTimeMillis();
        history.setConsultationRoomId(roomId);
        historyRepository.save(history);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("roomId", roomId);
        result.put("recommendationId", recommendationId);
        result.put("customerConcerns", history.getCustomerConcerns());
        return result;
    }

    private String generateReason(InsuranceProduct product, Set<RiskProfile> profiles, List<String> tokens) {
        StringBuilder reason = new StringBuilder();
        String type = product.getInsuranceType();
        Map<String, String> typeNames = Map.of(
            "TRAFFIC", "교통사고", "INJURY", "상해", "FIRE", "화재", "LIFE", "생명"
        );

        reason.append(typeNames.getOrDefault(type, type)).append(" 관련 보장이 포함되어 있습니다. ");

        // Find which risk profiles match
        for (RiskProfile p : profiles) {
            if (p.getRecommendedInsuranceTypes() != null && p.getRecommendedInsuranceTypes().contains(type)) {
                reason.append("고객의 '").append(p.getRiskCategory()).append("' 위험에 적합합니다. ");
                break;
            }
        }

        // Match specific keywords
        String keywords = product.getTargetKeywords();
        if (keywords != null) {
            for (String token : tokens) {
                if (keywords.toLowerCase().contains(token.toLowerCase())) {
                    reason.append("'").append(token).append("' 관련 보장이 있습니다.");
                    break;
                }
            }
        }

        return reason.toString();
    }

    private boolean isAgeInRange(int age, String ageRange) {
        try {
            String[] parts = ageRange.split("-");
            int min = Integer.parseInt(parts[0].trim());
            int max = parts.length > 1 ? Integer.parseInt(parts[1].trim()) : 100;
            return age >= min && age <= max;
        } catch (Exception e) {
            return true;
        }
    }

    private List<String> tokenize(String text) {
        if (text == null || text.isBlank()) return new ArrayList<>();
        String[] words = text.replaceAll("[^가-힣a-zA-Z0-9\\s]", "").split("\\s+");
        return Arrays.stream(words)
            .filter(w -> w.length() >= 2)
            .distinct()
            .collect(Collectors.toList());
    }
}
