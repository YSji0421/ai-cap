package com.adjuster.system.exception;

public class ClientNotFoundException extends RuntimeException {
    public ClientNotFoundException(Long caseId) {
        super("고객 정보가 없습니다. 사건 ID: " + caseId);
    }
}
