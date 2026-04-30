package com.adjuster.system.service;

import com.adjuster.system.entity.Case;
import com.adjuster.system.entity.CaseHistory;
import com.adjuster.system.enums.HistoryActionType;
import com.adjuster.system.exception.CaseNotFoundException;
import com.adjuster.system.repository.CaseHistoryRepository;
import com.adjuster.system.repository.CaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CaseHistoryService {

    private final CaseHistoryRepository caseHistoryRepository;
    private final CaseRepository caseRepository;

    @Transactional
    public void record(Long caseId, HistoryActionType actionType, String description) {
        Case caseEntity = caseRepository.findById(caseId)
            .orElseThrow(() -> new CaseNotFoundException(caseId));

        CaseHistory history = new CaseHistory();
        history.setCaseEntity(caseEntity);
        history.setActionType(actionType);
        history.setDescription(description);
        caseHistoryRepository.save(history);
    }

    @Transactional(readOnly = true)
    public List<CaseHistory> getHistory(Long caseId) {
        Case caseEntity = caseRepository.findById(caseId)
            .orElseThrow(() -> new CaseNotFoundException(caseId));
        return caseHistoryRepository.findByCaseEntityOrderByCreatedAtAsc(caseEntity);
    }
}
