package com.adjuster.system.dto.response;

import com.adjuster.system.entity.Case;
import com.adjuster.system.enums.CaseStatus;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class CaseSummaryResponse {
    private final Long id;
    private final String caseNumber;
    private final String caseName;
    private final String clientName;
    private final String accidentTypeDisplay;
    private final LocalDate receivedDate;
    private final CaseStatus status;
    private final String statusDisplay;

    private CaseSummaryResponse(Case c) {
        this.id = c.getId();
        this.caseNumber = c.getCaseNumber();
        this.caseName = c.getCaseName();
        this.clientName = c.getClient() != null ? c.getClient().getClientName() : "-";
        this.accidentTypeDisplay = c.getAccidentType().getDisplayName();
        this.receivedDate = c.getReceivedDate();
        this.status = c.getStatus();
        this.statusDisplay = c.getStatus().getDisplayName();
    }

    public static CaseSummaryResponse from(Case c) {
        return new CaseSummaryResponse(c);
    }
}
