package com.adjuster.system.service;

import com.adjuster.system.dto.request.ClientUpdateRequest;
import com.adjuster.system.entity.Case;
import com.adjuster.system.entity.Client;
import com.adjuster.system.enums.HistoryActionType;
import com.adjuster.system.repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class ClientService {

    private final ClientRepository clientRepository;
    private final CaseService caseService;
    private final CaseHistoryService caseHistoryService;

    public void saveOrUpdate(Long caseId, String email, ClientUpdateRequest request) {
        Case caseEntity = caseService.findMyCaseById(caseId, email);

        Optional<Client> existing = clientRepository.findByCaseEntity(caseEntity);
        Client client = existing.orElse(new Client());

        client.setCaseEntity(caseEntity);
        client.setClientName(request.getClientName());
        client.setBirthDate(request.getBirthDate());
        client.setPhone(request.getPhone());
        client.setEmail(request.getEmail());
        client.setInsurerName(request.getInsurerName());
        client.setPolicyNumber(request.getPolicyNumber());
        client.setAccidentDate(request.getAccidentDate());
        client.setInjuryContent(request.getInjuryContent());

        clientRepository.save(client);
        caseHistoryService.record(caseId, HistoryActionType.CLIENT_UPDATED,
            "고객 정보 입력/수정: " + request.getClientName());
    }

    @Transactional(readOnly = true)
    public Client findByCaseId(Long caseId, String email) {
        Case caseEntity = caseService.findMyCaseById(caseId, email);
        return clientRepository.findByCaseEntity(caseEntity).orElse(null);
    }
}
