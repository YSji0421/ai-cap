package com.adjuster.system.controller;

import com.adjuster.system.dto.request.ClientUpdateRequest;
import com.adjuster.system.entity.Client;
import com.adjuster.system.service.CaseService;
import com.adjuster.system.service.ClientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/cases/{caseId}/client")
@RequiredArgsConstructor
public class ClientController {

    private final ClientService clientService;
    private final CaseService caseService;

    @GetMapping("/edit")
    public String editForm(@PathVariable Long caseId,
                           @AuthenticationPrincipal UserDetails user,
                           Model model) {
        model.addAttribute("caseDetail", caseService.findCaseDetail(caseId, user.getUsername()));
        Client existing = clientService.findByCaseId(caseId, user.getUsername());

        ClientUpdateRequest req = new ClientUpdateRequest();
        if (existing != null) {
            req.setClientName(existing.getClientName());
            req.setBirthDate(existing.getBirthDate());
            req.setPhone(existing.getPhone());
            req.setEmail(existing.getEmail());
            req.setInsurerName(existing.getInsurerName());
            req.setPolicyNumber(existing.getPolicyNumber());
            req.setAccidentDate(existing.getAccidentDate());
            req.setInjuryContent(existing.getInjuryContent());
        }
        model.addAttribute("clientUpdateRequest", req);
        return "clients/edit";
    }

    @PostMapping
    public String save(@PathVariable Long caseId,
                       @AuthenticationPrincipal UserDetails user,
                       @Valid @ModelAttribute ClientUpdateRequest request,
                       BindingResult bindingResult,
                       RedirectAttributes redirectAttributes,
                       Model model) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("caseDetail", caseService.findCaseDetail(caseId, user.getUsername()));
            return "clients/edit";
        }
        clientService.saveOrUpdate(caseId, user.getUsername(), request);
        redirectAttributes.addFlashAttribute("successMsg", "고객 정보가 저장되었습니다.");
        return "redirect:/cases/" + caseId;
    }
}
