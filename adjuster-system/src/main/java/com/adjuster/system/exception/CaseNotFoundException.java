package com.adjuster.system.exception;

public class CaseNotFoundException extends RuntimeException {
    public CaseNotFoundException(Long id) {
        super("존재하지 않는 사건입니다. ID: " + id);
    }
}
