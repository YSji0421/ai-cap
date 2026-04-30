package com.adjuster.system.enums;

public enum HistoryActionType {
    CASE_CREATED("사건 등록"),
    CLIENT_UPDATED("고객 정보 입력/수정"),
    CONSULTATION_ADDED("상담 기록 추가"),
    SUMMARY_GENERATED("AI 요약 생성"),
    KEYWORDS_EXTRACTED("키워드 추출"),
    REPORT_CREATED("보고서 초안 생성"),
    REPORT_FINALIZED("보고서 최종 완료"),
    STATUS_CHANGED("상태 변경");

    private final String displayName;

    HistoryActionType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
