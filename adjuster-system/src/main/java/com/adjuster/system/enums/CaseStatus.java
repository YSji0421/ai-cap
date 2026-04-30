package com.adjuster.system.enums;

public enum CaseStatus {
    RECEIVED("접수"),
    IN_PROGRESS("진행중"),
    COMPLETED("완료"),
    ON_HOLD("보류");

    private final String displayName;

    CaseStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
