package com.adjuster.system.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReportUpdateRequest {
    private String adjusterOpinion;
    private String conclusion;
    private String keywords;
}
