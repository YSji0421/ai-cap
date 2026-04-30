package com.adjuster.system.dto.response;

import com.adjuster.system.entity.Case;
import com.adjuster.system.entity.Client;
import com.adjuster.system.entity.Consultation;
import com.adjuster.system.entity.Report;
import com.adjuster.system.enums.AccidentType;
import com.adjuster.system.enums.CaseStatus;
import com.adjuster.system.enums.ReportStatus;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
public class CaseDetailResponse {
    private final Long id;
    private final String caseNumber;
    private final String caseName;
    private final AccidentType accidentType;
    private final String accidentTypeDisplay;
    private final CaseStatus status;
    private final String statusDisplay;
    private final LocalDate receivedDate;
    private final String memo;

    // 고객 정보 요약
    private final String clientName;
    private final String clientPhone;
    private final String insurerName;
    private final LocalDate accidentDate;
    private final boolean hasClient;

    // 상담 기록
    private final List<ConsultSummary> consultations;

    // 보고서
    private final List<ReportSummary> reports;

    private CaseDetailResponse(Case c) {
        this.id = c.getId();
        this.caseNumber = c.getCaseNumber();
        this.caseName = c.getCaseName();
        this.accidentType = c.getAccidentType();
        this.accidentTypeDisplay = c.getAccidentType().getDisplayName();
        this.status = c.getStatus();
        this.statusDisplay = c.getStatus().getDisplayName();
        this.receivedDate = c.getReceivedDate();
        this.memo = c.getMemo();

        Client client = c.getClient();
        this.hasClient = client != null;
        this.clientName = client != null ? client.getClientName() : null;
        this.clientPhone = client != null ? client.getPhone() : null;
        this.insurerName = client != null ? client.getInsurerName() : null;
        this.accidentDate = client != null ? client.getAccidentDate() : null;

        this.consultations = c.getConsultations().stream()
            .map(ConsultSummary::new).toList();

        this.reports = c.getReports().stream()
            .map(ReportSummary::new).toList();
    }

    public static CaseDetailResponse from(Case c) {
        return new CaseDetailResponse(c);
    }

    @Getter
    public static class ConsultSummary {
        private final Long id;
        private final int consultSeq;
        private final LocalDateTime consultDatetime;
        private final String consultMethodDisplay;
        private final String contentPreview;
        private final boolean summaryGenerated;
        private final String keywords;

        ConsultSummary(Consultation c) {
            this.id = c.getId();
            this.consultSeq = c.getConsultSeq();
            this.consultDatetime = c.getConsultDatetime();
            this.consultMethodDisplay = c.getConsultMethod().getDisplayName();
            this.contentPreview = c.getContent().length() > 50
                ? c.getContent().substring(0, 50) + "..." : c.getContent();
            this.summaryGenerated = c.isSummaryGenerated();
            this.keywords = c.getKeywords();
        }
    }

    @Getter
    public static class ReportSummary {
        private final Long id;
        private final String title;
        private final ReportStatus status;
        private final String statusDisplay;
        private final LocalDateTime createdAt;

        ReportSummary(Report r) {
            this.id = r.getId();
            this.title = r.getTitle();
            this.status = r.getStatus();
            this.statusDisplay = r.getStatus().getDisplayName();
            this.createdAt = r.getCreatedAt();
        }
    }
}
