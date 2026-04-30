package com.adjuster.system.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class AuthController {

    @GetMapping("/login")
    public String loginPage(
            @RequestParam(required = false) String error,
            @RequestParam(required = false) String logout,
            @RequestParam(required = false) String locked,
            Model model) {

        if (error != null) {
            model.addAttribute("errorMsg", "이메일 또는 비밀번호를 확인하세요.");
        }
        if (locked != null) {
            model.addAttribute("errorMsg", "계정이 잠겼습니다. 관리자에게 문의하세요.");
        }
        if (logout != null) {
            model.addAttribute("logoutMsg", "로그아웃 되었습니다.");
        }
        return "auth/login";
    }
}
