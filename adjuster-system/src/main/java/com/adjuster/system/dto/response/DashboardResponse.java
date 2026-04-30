package com.adjuster.system.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class DashboardResponse {
    private final long totalCases;
    private final long receivedCount;
    private final long inProgressCount;
    private final long completedCount;
    private final long onHoldCount;
    private final List<CaseSummaryResponse> recentCases;
    private final List<RecentConsultation> recentConsultations;

    @Getter
    @AllArgsConstructor
    public static class RecentConsultation {
        private final Long consultationId;
        private final Long caseId;
        private final String caseName;
        private final String consultDatetime;
        private final String consultMethod;
    }
}
