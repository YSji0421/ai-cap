package com.adjuster.system.enums;

public enum ConsultMethod {
    PHONE("전화"),
    IN_PERSON("대면"),
    EMAIL("이메일"),
    OTHER("기타");

    private final String displayName;

    ConsultMethod(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
