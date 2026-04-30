package com.adjuster.system.service;

import com.adjuster.system.dto.request.CaseCreateRequest;
import com.adjuster.system.dto.response.CaseDetailResponse;
import com.adjuster.system.dto.response.CaseSummaryResponse;
import com.adjuster.system.entity.Case;
import com.adjuster.system.entity.User;
import com.adjuster.system.enums.CaseStatus;
import com.adjuster.system.enums.HistoryActionType;
import com.adjuster.system.exception.CaseNotFoundException;
import com.adjuster.system.exception.ValidationException;
import com.adjuster.system.repository.CaseRepository;
import com.adjuster.system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Transactional
public class CaseService {

    private final CaseRepository caseRepository;
    private final UserRepository userRepository;
    private final CaseHistoryService caseHistoryService;

    public Long createCase(String email, CaseCreateRequest request) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("사용자 없음"));

        String caseNumber = generateCaseNumber(request.getReceivedDate());

        Case caseEntity = new Case();
        caseEntity.setUser(user);
        caseEntity.setCaseNumber(caseNumber);
        caseEntity.setCaseName(request.getCaseName());
        caseEntity.setAccidentType(request.getAccidentType());
        caseEntity.setReceivedDate(request.getReceivedDate());
        caseEntity.setMemo(request.getMemo());
        caseEntity.setStatus(CaseStatus.RECEIVED);

        Case saved = caseRepository.save(caseEntity);
        caseHistoryService.record(saved.getId(), HistoryActionType.CASE_CREATED,
            "사건 등록: " + saved.getCaseName());
        return saved.getId();
    }

    @Transactional(readOnly = true)
    public CaseDetailResponse findCaseDetail(Long id, String email) {
        Case caseEntity = findMyCaseById(id, email);
        return CaseDetailResponse.from(caseEntity);
    }

    @Transactional(readOnly = true)
    public Case findMyCaseById(Long id, String email) {
        Case caseEntity = caseRepository.findById(id)
            .orElseThrow(() -> new CaseNotFoundException(id));
        if (!caseEntity.getUser().getEmail().equals(email)) {
            throw new AccessDeniedException("접근 권한이 없습니다.");
        }
        return caseEntity;
    }

    @Transactional(readOnly = true)
    public Page<CaseSummaryResponse> findCases(String email, String keyword, String status, Pageable pageable) {
        return caseRepository.findByUserEmailAndFilter(email, keyword, status, pageable)
            .map(CaseSummaryResponse::from);
    }

    public void changeStatus(Long id, CaseStatus newStatus, String email) {
        Case caseEntity = findMyCaseById(id, email);
        CaseStatus current = caseEntity.getStatus();

        validateStatusTransition(caseEntity, newStatus);
        caseEntity.setStatus(newStatus);

        caseHistoryService.record(id, HistoryActionType.STATUS_CHANGED,
            current.getDisplayName() + " → " + newStatus.getDisplayName());
    }

    private void validateStatusTransition(Case c, CaseStatus newStatus) {
        if (newStatus == CaseStatus.IN_PROGRESS && c.getConsultations().isEmpty()) {
            throw new ValidationException("상담 기록이 1건 이상 있어야 진행중으로 변경할 수 있습니다.");
        }
        if (newStatus == CaseStatus.COMPLETED) {
            boolean hasFinalReport = c.getReports().stream()
                .anyMatch(r -> r.getStatus().name().equals("FINAL"));
            if (!hasFinalReport) {
                throw new ValidationException("최종 완료된 보고서가 있어야 완료 처리할 수 있습니다.");
            }
        }
    }

    private String generateCaseNumber(LocalDate date) {
        String dateStr = date.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long todayCount = caseRepository.countByReceivedDate(date);
        return "CASE-" + dateStr + "-" + String.format("%03d", todayCount + 1);
    }
}
