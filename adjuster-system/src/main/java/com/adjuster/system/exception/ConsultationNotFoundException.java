package com.adjuster.system.exception;

public class ConsultationNotFoundException extends RuntimeException {
    public ConsultationNotFoundException(Long id) {
        super("존재하지 않는 상담 기록입니다. ID: " + id);
    }
}
