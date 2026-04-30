package com.adjuster.system.service;

import com.adjuster.system.dto.request.ConsultationCreateRequest;
import com.adjuster.system.entity.Case;
import com.adjuster.system.entity.Consultation;
import com.adjuster.system.enums.HistoryActionType;
import com.adjuster.system.exception.ConsultationNotFoundException;
import com.adjuster.system.exception.ValidationException;
import com.adjuster.system.repository.ConsultationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final CaseService caseService;
    private final CaseHistoryService caseHistoryService;
    private final AiSummaryService aiSummaryService;

    public Long createConsultation(Long caseId, String email,
                                   ConsultationCreateRequest request, boolean autoSummary) {
        Case caseEntity = caseService.findMyCaseById(caseId, email);

        // 상담일시 유효성 검사
        if (request.getConsultDatetime().toLocalDate().isBefore(caseEntity.getReceivedDate())) {
            throw new ValidationException("상담일은 사건 접수일 이후여야 합니다.");
        }

        int seq = (int) consultationRepository.countByCaseEntity(caseEntity) + 1;

        Consultation consultation = new Consultation();
        consultation.setCaseEntity(caseEntity);
        consultation.setConsultSeq(seq);
        consultation.setConsultDatetime(request.getConsultDatetime());
        consultation.setConsultMethod(request.getConsultMethod());
        consultation.setContent(request.getContent());
        consultation.setSpecialNote(request.getSpecialNote());

        if (autoSummary) {
            try {
                String summary = aiSummaryService.generateLocalSummary(request.getContent());
                consultation.setSummaryContent(summary);
                consultation.setSummaryGenerated(true);
            } catch (Exception e) {
                // 요약 실패 시 저장은 계속
            }
        }

        Consultation saved = consultationRepository.save(consultation);

        caseHistoryService.record(caseId, HistoryActionType.CONSULTATION_ADDED,
            seq + "회 " + request.getConsultMethod().getDisplayName() + " 상담 기록 저장");

        if (autoSummary && saved.isSummaryGenerated()) {
            caseHistoryService.record(caseId, HistoryActionType.SUMMARY_GENERATED,
                seq + "회 상담 AI 요약 완료");
        }

        return saved.getId();
    }

    public void saveSummary(Long consultationId, String summary) {
        Consultation consultation = consultationRepository.findById(consultationId)
            .orElseThrow(() -> new ConsultationNotFoundException(consultationId));
        consultation.setSummaryContent(summary);
        consultation.setSummaryGenerated(true);
        consultationRepository.save(consultation);

        caseHistoryService.record(consultation.getCaseEntity().getId(),
            HistoryActionType.SUMMARY_GENERATED,
            consultation.getConsultSeq() + "회 상담 AI 요약 완료");
    }

    public void saveKeywords(Long consultationId, List<String> keywords) {
        Consultation consultation = consultationRepository.findById(consultationId)
            .orElseThrow(() -> new ConsultationNotFoundException(consultationId));
        consultation.setKeywords(String.join(",", keywords));
        consultationRepository.save(consultation);

        caseHistoryService.record(consultation.getCaseEntity().getId(),
            HistoryActionType.KEYWORDS_EXTRACTED,
            "키워드 추출: " + String.join(", ", keywords));
    }

    @Transactional(readOnly = true)
    public Consultation findById(Long consultationId) {
        return consultationRepository.findById(consultationId)
            .orElseThrow(() -> new ConsultationNotFoundException(consultationId));
    }

    public void updateConsultation(Long consultationId, ConsultationCreateRequest request) {
        Consultation consultation = consultationRepository.findById(consultationId)
            .orElseThrow(() -> new ConsultationNotFoundException(consultationId));
        consultation.setConsultDatetime(request.getConsultDatetime());
        consultation.setConsultMethod(request.getConsultMethod());
        consultation.setContent(request.getContent());
        consultation.setSpecialNote(request.getSpecialNote());
        consultationRepository.save(consultation);
    }
}
