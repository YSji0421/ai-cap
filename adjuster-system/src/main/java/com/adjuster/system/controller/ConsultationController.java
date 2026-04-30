package com.adjuster.system.controller;

import com.adjuster.system.dto.request.ConsultationCreateRequest;
import com.adjuster.system.entity.Consultation;
import com.adjuster.system.enums.ConsultMethod;
import com.adjuster.system.service.CaseService;
import com.adjuster.system.service.ConsultationService;
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
@RequestMapping("/cases/{caseId}/consultations")
@RequiredArgsConstructor
public class ConsultationController {

    private final ConsultationService consultationService;
    private final CaseService caseService;

    @GetMapping("/new")
    public String newForm(@PathVariable Long caseId,
                          @AuthenticationPrincipal UserDetails user,
                          Model model) {
        model.addAttribute("caseDetail", caseService.findCaseDetail(caseId, user.getUsername()));
        model.addAttribute("consultationCreateRequest", new ConsultationCreateRequest());
        model.addAttribute("consultMethods", ConsultMethod.values());
        return "consultations/new";
    }

    @PostMapping
    public String create(@PathVariable Long caseId,
                         @AuthenticationPrincipal UserDetails user,
                         @Valid @ModelAttribute ConsultationCreateRequest request,
                         BindingResult bindingResult,
                         @RequestParam(defaultValue = "false") boolean autoSummary,
                         Model model) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("caseDetail", caseService.findCaseDetail(caseId, user.getUsername()));
            model.addAttribute("consultMethods", ConsultMethod.values());
            return "consultations/new";
        }
        Long consultId = consultationService.createConsultation(caseId, user.getUsername(), request, autoSummary);
        return "redirect:/cases/" + caseId + "/consultations/" + consultId;
    }

    @GetMapping("/{cid}")
    public String detail(@PathVariable Long caseId,
                         @PathVariable Long cid,
                         @AuthenticationPrincipal UserDetails user,
                         Model model) {
        // 사건 접근 권한 확인
        caseService.findMyCaseById(caseId, user.getUsername());
        Consultation consultation = consultationService.findById(cid);
        model.addAttribute("consultation", consultation);
        model.addAttribute("caseId", caseId);

        // 키워드 파싱
        if (consultation.getKeywords() != null && !consultation.getKeywords().isBlank()) {
            model.addAttribute("keywordList",
                java.util.Arrays.asList(consultation.getKeywords().split(",")));
        }
        return "consultations/detail";
    }

    @GetMapping("/{cid}/edit")
    public String editForm(@PathVariable Long caseId,
                           @PathVariable Long cid,
                           @AuthenticationPrincipal UserDetails user,
                           Model model) {
        caseService.findMyCaseById(caseId, user.getUsername());
        Consultation consultation = consultationService.findById(cid);

        ConsultationCreateRequest req = new ConsultationCreateRequest();
        req.setConsultDatetime(consultation.getConsultDatetime());
        req.setConsultMethod(consultation.getConsultMethod());
        req.setContent(consultation.getContent());
        req.setSpecialNote(consultation.getSpecialNote());

        model.addAttribute("caseDetail", caseService.findCaseDetail(caseId, user.getUsername()));
        model.addAttribute("consultationCreateRequest", req);
        model.addAttribute("consultMethods", ConsultMethod.values());
        model.addAttribute("cid", cid);
        return "consultations/edit";
    }

    @PostMapping("/{cid}")
    public String update(@PathVariable Long caseId,
                         @PathVariable Long cid,
                         @AuthenticationPrincipal UserDetails user,
                         @Valid @ModelAttribute ConsultationCreateRequest request,
                         BindingResult bindingResult,
                         RedirectAttributes redirectAttributes,
                         Model model) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("caseDetail", caseService.findCaseDetail(caseId, user.getUsername()));
            model.addAttribute("consultMethods", ConsultMethod.values());
            model.addAttribute("cid", cid);
            return "consultations/edit";
        }
        consultationService.updateConsultation(cid, request);
        redirectAttributes.addFlashAttribute("successMsg", "상담 기록이 수정되었습니다.");
        return "redirect:/cases/" + caseId + "/consultations/" + cid;
    }
}
