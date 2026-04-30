package com.adjuster.system.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AiSummaryResponse {
    private final boolean success;
    private final String summaryContent;
    private final String message;
}
