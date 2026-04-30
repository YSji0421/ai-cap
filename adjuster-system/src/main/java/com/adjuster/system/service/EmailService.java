package com.adjuster.system.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    public boolean sendEmailWithAttachment(String to, String subject, String body,
                                           byte[] attachment, String attachmentName) {
        if (fromEmail == null || fromEmail.isBlank()) {
            log.warn("이메일 설정이 되어있지 않습니다. 발송을 건너뜁니다.");
            return false;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true);

            if (attachment != null && attachmentName != null) {
                helper.addAttachment(attachmentName, new ByteArrayResource(attachment));
            }

            mailSender.send(message);
            log.info("이메일 발송 성공: to={}", to);
            return true;
        } catch (Exception e) {
            log.error("이메일 발송 실패: {}", e.getMessage());
            return false;
        }
    }

    public boolean sendSimpleEmail(String to, String subject, String body) {
        return sendEmailWithAttachment(to, subject, body, null, null);
    }

    public boolean isConfigured() {
        return fromEmail != null && !fromEmail.isBlank();
    }
}
