package com.adjuster.system.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
@Slf4j
public class TelegramService {

    @Value("${telegram.bot.token:}")
    private String botToken;

    private final WebClient webClient = WebClient.create("https://api.telegram.org");

    public boolean sendMessage(String chatId, String message) {
        if (botToken == null || botToken.isBlank()) {
            log.warn("텔레그램 봇 토큰이 설정되지 않았습니다. 메시지 발송을 건너뜁니다.");
            return false;
        }

        try {
            webClient.post()
                .uri("/bot{token}/sendMessage", botToken)
                .bodyValue(Map.of(
                    "chat_id", chatId,
                    "text", message,
                    "parse_mode", "HTML"
                ))
                .retrieve()
                .bodyToMono(String.class)
                .block();

            log.info("텔레그램 메시지 발송 성공: chatId={}", chatId);
            return true;
        } catch (Exception e) {
            log.error("텔레그램 메시지 발송 실패: {}", e.getMessage());
            return false;
        }
    }

    public boolean isConfigured() {
        return botToken != null && !botToken.isBlank();
    }
}
