package com.adjuster.system.controller;

import com.adjuster.system.dto.request.ReportUpdateRequest;
import com.adjuster.system.entity.Report;
import com.adjuster.system.service.CaseService;
import com.adjuster.system.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/cases/{caseId}/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final CaseService caseService;

    @GetMapping("/{rid}")
    public String detail(@PathVariable Long caseId,
                         @PathVariable Long rid,
                         @AuthenticationPrincipal UserDetails user,
                         Model model) {
        caseService.findMyCaseById(caseId, user.getUsername());
        Report report = reportService.findById(rid);
        model.addAttribute("report", report);
        model.addAttribute("caseId", caseId);
        model.addAttribute("caseDetail", caseService.findCaseDetail(caseId, user.getUsername()));
        return "reports/detail";
    }

    @PostMapping("/{rid}")
    public String update(@PathVariable Long caseId,
                         @PathVariable Long rid,
                         @AuthenticationPrincipal UserDetails user,
                         @ModelAttribute ReportUpdateRequest request,
                         RedirectAttributes redirectAttributes) {
        caseService.findMyCaseById(caseId, user.getUsername());
        reportService.updateReport(rid, request);
        redirectAttributes.addFlashAttribute("successMsg", "보고서가 저장되었습니다.");
        return "redirect:/cases/" + caseId + "/reports/" + rid;
    }

    @PostMapping("/{rid}/finalize")
    public String finalize(@PathVariable Long caseId,
                           @PathVariable Long rid,
                           @AuthenticationPrincipal UserDetails user,
                           RedirectAttributes redirectAttributes) {
        caseService.findMyCaseById(caseId, user.getUsername());
        reportService.finalizeReport(rid, caseId);
        redirectAttributes.addFlashAttribute("successMsg", "보고서가 최종 완료 처리되었습니다.");
        return "redirect:/cases/" + caseId + "/reports/" + rid;
    }
}
