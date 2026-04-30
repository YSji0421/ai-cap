package com.adjuster.system.service;

import com.adjuster.system.entity.Consultation;
import com.adjuster.system.enums.AccidentType;
import com.adjuster.system.exception.ConsultationNotFoundException;
import com.adjuster.system.repository.ConsultationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class KeywordExtractService {

    private final ConsultationRepository consultationRepository;

    private static final Map<AccidentType, List<String>> KEYWORD_DICT = new EnumMap<>(AccidentType.class);

    static {
        KEYWORD_DICT.put(AccidentType.TRAFFIC, Arrays.asList(
            "후유장해", "치료비", "합의금", "과실비율", "대인배상",
            "자기신체사고", "자동차보험", "진단서", "입원일수",
            "통원치료", "한방치료", "MRI", "CT", "수술비", "장해등급"
        ));
        KEYWORD_DICT.put(AccidentType.INJURY, Arrays.asList(
            "입원일당", "수술비", "후유장해", "진단비", "실손의료비",
            "상해보험", "골절진단", "깁스", "응급실", "중환자실",
            "재활치료", "장해판정", "노동능력상실"
        ));
        KEYWORD_DICT.put(AccidentType.FIRE, Arrays.asList(
            "재물손해", "화재손해배상", "임시거주비", "영업손해",
            "화재보험", "가재도구", "건물손해", "잔존물처리",
            "임차인배상", "화재원인조사"
        ));
        KEYWORD_DICT.put(AccidentType.OTHER, Arrays.asList(
            "손해사정", "보험금", "약관", "보장범위", "면책조항",
            "보험사고", "피보험자", "보험료", "청구서류"
        ));
    }

    public List<String> extractKeywords(String content, AccidentType type) {
        List<String> candidates = KEYWORD_DICT.getOrDefault(type, List.of());
        return candidates.stream()
            .filter(keyword -> content != null && content.contains(keyword))
            .collect(Collectors.toList());
    }

    public List<String> extractByConsultationId(Long consultationId) {
        Consultation consultation = consultationRepository.findById(consultationId)
            .orElseThrow(() -> new ConsultationNotFoundException(consultationId));
        return extractKeywords(
            consultation.getContent(),
            consultation.getCaseEntity().getAccidentType()
        );
    }
}
