package com.adjuster.system.controller;

import com.adjuster.system.exception.CaseNotFoundException;
import com.adjuster.system.exception.ValidationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(CaseNotFoundException.class)
    public String handleCaseNotFound(CaseNotFoundException e, Model model) {
        model.addAttribute("message", e.getMessage());
        model.addAttribute("returnUrl", "/cases");
        return "error/404";
    }

    @ExceptionHandler(AccessDeniedException.class)
    public String handleAccessDenied(AccessDeniedException e, Model model) {
        model.addAttribute("message", "접근 권한이 없습니다.");
        model.addAttribute("returnUrl", "/dashboard");
        return "error/403";
    }

    @ExceptionHandler(ValidationException.class)
    public String handleValidation(ValidationException e, Model model) {
        model.addAttribute("message", e.getMessage());
        model.addAttribute("returnUrl", "javascript:history.back()");
        return "error/400";
    }

    @ExceptionHandler(Exception.class)
    public String handleGeneral(Exception e, Model model) {
        log.error("처리되지 않은 예외: ", e);
        model.addAttribute("message", "서버 내부 오류가 발생했습니다.");
        return "error/500";
    }
}
