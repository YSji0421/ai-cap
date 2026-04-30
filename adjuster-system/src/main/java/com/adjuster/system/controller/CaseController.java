package com.adjuster.system.controller;

import com.adjuster.system.dto.request.CaseCreateRequest;
import com.adjuster.system.entity.Case;
import com.adjuster.system.enums.AccidentType;
import com.adjuster.system.enums.CaseStatus;
import com.adjuster.system.service.CaseHistoryService;
import com.adjuster.system.service.CaseService;
import com.adjuster.system.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/cases")
@RequiredArgsConstructor
public class CaseController {

    private final CaseService caseService;
    private final CaseHistoryService caseHistoryService;
    private final ReportService reportService;

    @GetMapping
    public String list(@AuthenticationPrincipal UserDetails user,
                       @RequestParam(required = false) String keyword,
                       @RequestParam(required = false) String status,
                       @RequestParam(defaultValue = "0") int page,
                       Model model) {
        model.addAttribute("cases",
            caseService.findCases(user.getUsername(), keyword, status, PageRequest.of(page, 10)));
        model.addAttribute("keyword", keyword);
        model.addAttribute("status", status);
        model.addAttribute("statuses", CaseStatus.values());
        return "cases/list";
    }

    @GetMapping("/new")
    public String newForm(Model model) {
        model.addAttribute("caseCreateRequest", new CaseCreateRequest());
        model.addAttribute("accidentTypes", AccidentType.values());
        return "cases/new";
    }

    @PostMapping
    public String create(@AuthenticationPrincipal UserDetails user,
                         @Valid @ModelAttribute CaseCreateRequest request,
                         BindingResult bindingResult,
                         Model model) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("accidentTypes", AccidentType.values());
            return "cases/new";
        }
        Long id = caseService.createCase(user.getUsername(), request);
        return "redirect:/cases/" + id;
    }

    @GetMapping("/{id}")
    public String detail(@PathVariable Long id,
                         @AuthenticationPrincipal UserDetails user,
                         Model model) {
        model.addAttribute("caseDetail", caseService.findCaseDetail(id, user.getUsername()));
        model.addAttribute("statuses", CaseStatus.values());
        return "cases/detail";
    }

    @PostMapping("/{id}/status")
    public String changeStatus(@PathVariable Long id,
                               @AuthenticationPrincipal UserDetails user,
                               @RequestParam CaseStatus status,
                               RedirectAttributes redirectAttributes) {
        try {
            caseService.changeStatus(id, status, user.getUsername());
            redirectAttributes.addFlashAttribute("successMsg", "상태가 변경되었습니다.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMsg", e.getMessage());
        }
        return "redirect:/cases/" + id;
    }

    @GetMapping("/{id}/history")
    public String history(@PathVariable Long id,
                          @AuthenticationPrincipal UserDetails user,
                          Model model) {
        // 사건 접근 권한 확인
        model.addAttribute("caseDetail", caseService.findCaseDetail(id, user.getUsername()));
        model.addAttribute("histories", caseHistoryService.getHistory(id));
        return "cases/history";
    }

    @PostMapping("/{id}/reports/generate")
    public String generateReport(@PathVariable Long id,
                                 @AuthenticationPrincipal UserDetails user,
                                 RedirectAttributes redirectAttributes) {
        try {
            Long reportId = reportService.generateReport(id, user.getUsername());
            return "redirect:/cases/" + id + "/reports/" + reportId;
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMsg", e.getMessage());
            return "redirect:/cases/" + id;
        }
    }
}
