package com.adjuster.system.enums;

public enum ReportStatus {
    DRAFT("초안"),
    FINAL("최종");

    private final String displayName;

    ReportStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
