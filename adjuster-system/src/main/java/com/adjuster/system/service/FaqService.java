package com.adjuster.system.service;

import com.adjuster.system.entity.FaqEntry;
import com.adjuster.system.entity.LegalClause;
import com.adjuster.system.repository.FaqEntryRepository;
import com.adjuster.system.repository.LegalClauseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FaqService {

    private final FaqEntryRepository faqRepository;
    private final LegalClauseRepository clauseRepository;

    public Map<String, Object> search(String query, String insuranceType) {
        List<String> tokens = tokenize(query);
        Map<FaqEntry, Integer> scored = new LinkedHashMap<>();

        for (String token : tokens) {
            List<FaqEntry> matches;
            if (insuranceType != null && !insuranceType.isEmpty()) {
                matches = faqRepository.searchByKeyword(insuranceType, token);
            } else {
                matches = faqRepository.searchAllByKeyword(token);
            }
            for (FaqEntry faq : matches) {
                scored.merge(faq, 1 + faq.getPriority(), Integer::sum);
            }
        }

        List<Map<String, Object>> faqResults = scored.entrySet().stream()
            .sorted(Map.Entry.<FaqEntry, Integer>comparingByValue().reversed())
            .limit(5)
            .map(entry -> {
                FaqEntry faq = entry.getKey();
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("id", faq.getId());
                map.put("question", faq.getQuestion());
                map.put("answer", faq.getAnswer());
                map.put("category", faq.getCategory());
                map.put("legalReference", faq.getLegalReference());
                map.put("relevanceScore", entry.getValue());
                return map;
            })
            .collect(Collectors.toList());

        List<Map<String, Object>> clauseResults = new ArrayList<>();
        for (String token : tokens) {
            List<LegalClause> clauses;
            if (insuranceType != null && !insuranceType.isEmpty()) {
                clauses = clauseRepository.searchByKeyword(insuranceType, token);
            } else {
                clauses = clauseRepository.findAll();
            }
            for (LegalClause clause : clauses) {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("id", clause.getId());
                map.put("clauseNumber", clause.getClauseNumber());
                map.put("clauseTitle", clause.getClauseTitle());
                map.put("clauseContent", clause.getClauseContent());
                clauseResults.add(map);
            }
        }

        List<Map<String, Object>> uniqueClauses = clauseResults.stream()
            .collect(Collectors.collectingAndThen(
                Collectors.toCollection(() -> new TreeSet<>(Comparator.comparing(m -> (Long) m.get("id")))),
                ArrayList::new
            ));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("faqResults", faqResults);
        result.put("clauseResults", uniqueClauses.stream().limit(5).collect(Collectors.toList()));
        result.put("hasResults", !faqResults.isEmpty());
        return result;
    }

    public List<FaqEntry> getByType(String insuranceType) {
        return faqRepository.findByInsuranceTypeOrderByPriorityDesc(insuranceType);
    }

    public List<LegalClause> getClausesByType(String insuranceType) {
        return clauseRepository.findByInsuranceType(insuranceType);
    }

    private List<String> tokenize(String query) {
        if (query == null || query.isBlank()) return Collections.emptyList();
        String[] words = query.replaceAll("[^가-힣a-zA-Z0-9\\s]", "").split("\\s+");
        return Arrays.stream(words)
            .filter(w -> w.length() >= 2)
            .distinct()
            .collect(Collectors.toList());
    }
}
