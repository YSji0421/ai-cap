package com.adjuster.system.service;

import com.adjuster.system.entity.Consultation;
import com.adjuster.system.exception.AiSummaryException;
import com.adjuster.system.exception.ConsultationNotFoundException;
import com.adjuster.system.repository.ConsultationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiSummaryService {

    private final ConsultationRepository consultationRepository;

    @Value("${ai.mode:local}")
    private String aiMode;

    private static final List<String> CORE_KEYWORDS = List.of(
        "사고", "진단", "치료", "보험", "청구", "합의", "보장", "후유",
        "입원", "수술", "골절", "염좌", "화재", "손해", "부상", "통증",
        "병원", "치료비", "보상", "장해"
    );

    public String generateSummaryByConsultationId(Long consultationId) {
        Consultation consultation = consultationRepository.findById(consultationId)
            .orElseThrow(() -> new ConsultationNotFoundException(consultationId));
        return generateSummaryWithFallback(consultation.getContent());
    }

    public String generateSummaryWithFallback(String content) {
        try {
            return generateLocalSummary(content);
        } catch (Exception e) {
            log.warn("로컬 요약 실패: {}", e.getMessage());
            return content.length() > 200 ? content.substring(0, 200) + "..." : content;
        }
    }

    public String generateLocalSummary(String content) {
        if (content == null || content.isBlank()) {
            throw new AiSummaryException("요약할 내용이 없습니다.");
        }

        // 문장 분리
        String[] sentences = content.split("[.!?。\\n]+");

        // 핵심 키워드 포함 문장 스코어링
        List<String> scored = Arrays.stream(sentences)
            .map(String::trim)
            .filter(s -> s.length() > 5)
            .sorted(Comparator.comparingLong(
                s -> -CORE_KEYWORDS.stream().filter(s::contains).count()
            ))
            .limit(3)
            .collect(Collectors.toList());

        if (scored.isEmpty()) {
            scored = Arrays.stream(sentences)
                .map(String::trim)
                .filter(s -> s.length() > 5)
                .limit(3)
                .collect(Collectors.toList());
        }

        if (scored.isEmpty()) {
            return content.length() > 200 ? content.substring(0, 200) + "..." : content;
        }

        return String.join(". ", scored) + ".";
    }
}
