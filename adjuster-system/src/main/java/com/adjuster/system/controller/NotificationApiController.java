package com.adjuster.system.controller;

import com.adjuster.system.service.EmailService;
import com.adjuster.system.service.DocumentExportService;
import com.adjuster.system.service.TelegramService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationApiController {

    private final TelegramService telegramService;
    private final EmailService emailService;
    private final DocumentExportService documentExportService;

    @PostMapping("/telegram/send")
    public ResponseEntity<?> sendTelegram(@RequestBody Map<String, String> request) {
        String chatId = request.get("chatId");
        String message = request.get("message");

        if (!telegramService.isConfigured()) {
            return ResponseEntity.ok(Map.of(
                "success", false,
                "message", "텔레그램 봇 토큰이 설정되지 않았습니다. application.yml에서 telegram.bot.token을 설정해주세요."
            ));
        }

        boolean sent = telegramService.sendMessage(chatId, message);
        return ResponseEntity.ok(Map.of("success", sent));
    }

    @PostMapping("/telegram/test")
    public ResponseEntity<?> testTelegram(@RequestBody Map<String, String> request) {
        String chatId = request.get("chatId");
        boolean sent = telegramService.sendMessage(chatId, "✅ AI 보험 상담 시스템 텔레그램 알림 테스트 메시지입니다.");
        return ResponseEntity.ok(Map.of("success", sent, "configured", telegramService.isConfigured()));
    }

    @PostMapping("/email/send")
    public ResponseEntity<?> sendEmail(@RequestBody Map<String, String> request) {
        String to = request.get("to");
        String subject = request.getOrDefault("subject", "AI 보험 상담 요약 보고서");
        String roomId = request.get("roomId");

        if (!emailService.isConfigured()) {
            return ResponseEntity.ok(Map.of(
                "success", false,
                "message", "이메일 SMTP가 설정되지 않았습니다. application.yml에서 spring.mail 설정을 해주세요."
            ));
        }

        try {
            byte[] pdf = null;
            String attachmentName = null;
            if (roomId != null && !roomId.isEmpty()) {
                try {
                    pdf = documentExportService.generatePdf(roomId);
                    attachmentName = "consultation-report-" + roomId + ".pdf";
                } catch (Exception e) {
                    // PDF generation failed, send without attachment
                }
            }

            String body = "<h2>AI 보험 상담 요약 보고서</h2>" +
                "<p>안녕하세요, AI 보험 상담 시스템에서 보내드리는 상담 요약 보고서입니다.</p>" +
                "<p>첨부된 PDF 파일에서 상세 내용을 확인하실 수 있습니다.</p>" +
                "<br><p>감사합니다.</p>" +
                "<p><em>AI 원격 상담 솔루션</em></p>";

            boolean sent = emailService.sendEmailWithAttachment(to, subject, body, pdf, attachmentName);
            return ResponseEntity.ok(Map.of("success", sent));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/config")
    public ResponseEntity<?> getConfig() {
        return ResponseEntity.ok(Map.of(
            "telegramConfigured", telegramService.isConfigured(),
            "emailConfigured", emailService.isConfigured()
        ));
    }
}
