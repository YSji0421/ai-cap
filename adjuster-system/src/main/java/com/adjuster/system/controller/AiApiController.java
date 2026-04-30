package com.adjuster.system.controller;

import com.adjuster.system.dto.response.AiSummaryResponse;
import com.adjuster.system.service.AiSummaryService;
import com.adjuster.system.service.ConsultationService;
import com.adjuster.system.service.KeywordExtractService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AiApiController {

    private final AiSummaryService aiSummaryService;
    private final KeywordExtractService keywordExtractService;
    private final ConsultationService consultationService;

    @PostMapping("/consultations/{cid}/summary")
    public ResponseEntity<AiSummaryResponse> generateSummary(@PathVariable Long cid) {
        try {
            String summary = aiSummaryService.generateSummaryByConsultationId(cid);
            consultationService.saveSummary(cid, summary);
            return ResponseEntity.ok(new AiSummaryResponse(true, summary, "요약이 생성되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.ok(
                new AiSummaryResponse(false, null, "요약 생성에 실패했습니다. 직접 입력해 주세요."));
        }
    }

    @PostMapping("/consultations/{cid}/keywords")
    public ResponseEntity<Map<String, Object>> extractKeywords(@PathVariable Long cid) {
        try {
            List<String> keywords = keywordExtractService.extractByConsultationId(cid);
            consultationService.saveKeywords(cid, keywords);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "keywords", keywords,
                "message", keywords.size() + "개 키워드가 추출되었습니다."
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "success", false,
                "keywords", List.of(),
                "message", "키워드 추출에 실패했습니다."
            ));
        }
    }

    @PostMapping("/consultations/{cid}/summary/manual")
    public ResponseEntity<Map<String, Object>> saveManualSummary(
            @PathVariable Long cid,
            @RequestBody Map<String, String> body) {
        consultationService.saveSummary(cid, body.get("summary"));
        return ResponseEntity.ok(Map.of("success", true, "message", "요약이 저장되었습니다."));
    }
}
