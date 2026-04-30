package com.adjuster.system.enums;

public enum AccidentType {
    TRAFFIC("교통사고"),
    INJURY("상해"),
    FIRE("화재"),
    OTHER("기타");

    private final String displayName;

    AccidentType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
