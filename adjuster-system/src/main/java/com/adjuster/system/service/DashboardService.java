package com.adjuster.system.service;

import com.adjuster.system.dto.response.CaseSummaryResponse;
import com.adjuster.system.dto.response.DashboardResponse;
import com.adjuster.system.enums.CaseStatus;
import com.adjuster.system.repository.CaseRepository;
import com.adjuster.system.repository.ConsultationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final CaseRepository caseRepository;
    private final ConsultationRepository consultationRepository;

    private static final DateTimeFormatter DATETIME_FMT =
        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    public DashboardResponse getDashboard(String email) {
        long total = caseRepository.findByUserEmailAndFilter(email, null, null,
            PageRequest.of(0, Integer.MAX_VALUE)).getTotalElements();
        long received    = caseRepository.countByUserEmailAndStatus(email, CaseStatus.RECEIVED);
        long inProgress  = caseRepository.countByUserEmailAndStatus(email, CaseStatus.IN_PROGRESS);
        long completed   = caseRepository.countByUserEmailAndStatus(email, CaseStatus.COMPLETED);
        long onHold      = caseRepository.countByUserEmailAndStatus(email, CaseStatus.ON_HOLD);

        List<CaseSummaryResponse> recentCases = caseRepository
            .findRecentByUserEmail(email, PageRequest.of(0, 5))
            .map(CaseSummaryResponse::from)
            .toList();

        List<DashboardResponse.RecentConsultation> recentConsultations =
            consultationRepository.findRecentByUserEmail(email, PageRequest.of(0, 3))
                .map(c -> new DashboardResponse.RecentConsultation(
                    c.getId(),
                    c.getCaseEntity().getId(),
                    c.getCaseEntity().getCaseName(),
                    c.getConsultDatetime().format(DATETIME_FMT),
                    c.getConsultMethod().getDisplayName()
                )).toList();

        return new DashboardResponse(total, received, inProgress, completed, onHold,
            recentCases, recentConsultations);
    }
}
