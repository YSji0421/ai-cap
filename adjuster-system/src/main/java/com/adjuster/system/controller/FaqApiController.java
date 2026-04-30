package com.adjuster.system.controller;

import com.adjuster.system.entity.FaqEntry;
import com.adjuster.system.entity.LegalClause;
import com.adjuster.system.service.FaqService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/faq")
@RequiredArgsConstructor
public class FaqApiController {

    private final FaqService faqService;

    @PostMapping("/search")
    public ResponseEntity<Map<String, Object>> search(@RequestBody Map<String, String> request) {
        String query = request.get("query");
        String insuranceType = request.get("insuranceType");
        return ResponseEntity.ok(faqService.search(query, insuranceType));
    }

    @GetMapping("/{insuranceType}")
    public ResponseEntity<List<FaqEntry>> getByType(@PathVariable String insuranceType) {
        return ResponseEntity.ok(faqService.getByType(insuranceType));
    }

    @GetMapping("/clauses/{insuranceType}")
    public ResponseEntity<List<LegalClause>> getClauses(@PathVariable String insuranceType) {
        return ResponseEntity.ok(faqService.getClausesByType(insuranceType));
    }
}
