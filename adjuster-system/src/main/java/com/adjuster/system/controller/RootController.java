package com.adjuster.system.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 루트("/") 접근 시 단순 JSON 응답.
 * Thymeleaf 백오피스가 제거된 이후 React SPA 만 사용하므로,
 * 백엔드 도메인을 직접 방문한 사용자에게 API 서버임을 알린다.
 */
@RestController
public class RootController {

    @GetMapping(value = "/", produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> root() {
        return Map.of(
            "service", "adjuster-system API",
            "status", "ok",
            "endpoints", "/api/**",
            "frontend", "별도 React SPA에서 /api/** 호출"
        );
    }
}
