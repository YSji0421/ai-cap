package com.adjuster.system.service;

import com.adjuster.system.dto.request.ReportUpdateRequest;
import com.adjuster.system.entity.*;
import com.adjuster.system.enums.HistoryActionType;
import com.adjuster.system.enums.ReportStatus;
import com.adjuster.system.exception.ValidationException;
import com.adjuster.system.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;

@Service
@RequiredArgsConstructor
@Transactional
public class ReportService {

    private final ReportRepository reportRepository;
    private final CaseService caseService;
    private final CaseHistoryService caseHistoryService;

    public Long generateReport(Long caseId, String email) {
        Case caseEntity = caseService.findMyCaseById(caseId, email);

        if (caseEntity.getClient() == null) {
            throw new ValidationException("고객 정보를 먼저 입력해야 보고서를 생성할 수 있습니다.");
        }
        if (caseEntity.getConsultations().isEmpty()) {
            throw new ValidationException("상담 기록이 없습니다. 상담 기록 입력 후 보고서를 생성하세요.");
        }

        Consultation latest = caseEntity.getConsultations().stream()
            .max(Comparator.comparing(Consultation::getConsultSeq))
            .orElseThrow();

        String content = buildReportContent(caseEntity, caseEntity.getClient(), latest);

        Report report = new Report();
        report.setCaseEntity(caseEntity);
        report.setTitle(caseEntity.getCaseName() + " 손해사정 보고서");
        report.setReportContent(content);
        report.setStatus(ReportStatus.DRAFT);

        // 키워드가 있으면 초안에 포함
        if (latest.getKeywords() != null) {
            report.setAdjusterOpinion("");
            report.setConclusion("");
        }

        Report saved = reportRepository.save(report);
        caseHistoryService.record(caseId, HistoryActionType.REPORT_CREATED, "보고서 초안 생성");
        return saved.getId();
    }

    public void updateReport(Long reportId, ReportUpdateRequest request) {
        Report report = reportRepository.findById(reportId)
            .orElseThrow(() -> new RuntimeException("보고서를 찾을 수 없습니다."));
        report.setAdjusterOpinion(request.getAdjusterOpinion());
        report.setConclusion(request.getConclusion());
        reportRepository.save(report);
    }

    public void finalizeReport(Long reportId, Long caseId) {
        Report report = reportRepository.findById(reportId)
            .orElseThrow(() -> new RuntimeException("보고서를 찾을 수 없습니다."));
        report.setStatus(ReportStatus.FINAL);
        reportRepository.save(report);
        caseHistoryService.record(caseId, HistoryActionType.REPORT_FINALIZED, "보고서 최종 완료 처리");
    }

    @Transactional(readOnly = true)
    public Report findById(Long reportId) {
        return reportRepository.findById(reportId)
            .orElseThrow(() -> new RuntimeException("보고서를 찾을 수 없습니다."));
    }

    private String buildReportContent(Case c, Client client, Consultation consultation) {
        String keywords = consultation.getKeywords() != null
            ? consultation.getKeywords().replace(",", ", ")
            : "미추출";

        return """
            [손해사정 보고서]
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            작성일    : %s
            사건번호  : %s

            1. 사건 개요
            사건명    : %s
            사고유형  : %s
            접수일    : %s
            사고일자  : %s

            2. 피보험자 정보
            성명      : %s
            생년월일  : %s
            연락처    : %s
            이메일    : %s
            보험사    : %s
            증권번호  : %s
            부상 내용 : %s

            3. 상담 요약 (%d회차 상담 기준)
            %s

            4. 보장 검토 핵심 항목
            %s

            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            """.formatted(
            LocalDate.now(),
            c.getCaseNumber(),
            c.getCaseName(),
            c.getAccidentType().getDisplayName(),
            c.getReceivedDate(),
            nullSafe(client.getAccidentDate()),
            client.getClientName(),
            nullSafe(client.getBirthDate()),
            client.getPhone(),
            nullSafe(client.getEmail()),
            nullSafe(client.getInsurerName()),
            nullSafe(client.getPolicyNumber()),
            nullSafe(client.getInjuryContent()),
            consultation.getConsultSeq(),
            nullSafe(consultation.getSummaryContent()),
            keywords
        );
    }

    private String nullSafe(Object value) {
        return value != null ? value.toString() : "미입력";
    }
}
