package com.adjuster.system.controller;

import com.adjuster.system.entity.RecommendationHistory;
import com.adjuster.system.service.InsuranceRecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recommend")
@RequiredArgsConstructor
public class RecommendationApiController {

    private final InsuranceRecommendationService recommendationService;

    @SuppressWarnings("unchecked")
    @PostMapping
    public ResponseEntity<Map<String, Object>> recommend(@RequestBody Map<String, Object> request) {
        String concerns = (String) request.get("concerns");
        String customerName = (String) request.getOrDefault("customerName", "");
        Integer age = request.get("age") != null ? Integer.valueOf(request.get("age").toString()) : null;
        String occupation = (String) request.getOrDefault("occupation", "");
        List<String> riskChecklist = (List<String>) request.get("riskChecklist");
        Long userId = request.get("userId") != null ? Long.valueOf(request.get("userId").toString()) : null;

        Map<String, Object> result = recommendationService.recommend(
            concerns, customerName, age, occupation, riskChecklist, userId
        );
        return ResponseEntity.ok(result);
    }

    @GetMapping("/history")
    public ResponseEntity<List<RecommendationHistory>> getHistory(
            @RequestParam(required = false) Long userId) {
        if (userId != null) {
            return ResponseEntity.ok(recommendationService.getHistory(userId));
        }
        return ResponseEntity.ok(List.of());
    }

    @PostMapping("/{id}/consult")
    public ResponseEntity<Map<String, Object>> startConsultation(@PathVariable Long id) {
        Map<String, Object> result = recommendationService.startConsultation(id);
        return ResponseEntity.ok(result);
    }
}
