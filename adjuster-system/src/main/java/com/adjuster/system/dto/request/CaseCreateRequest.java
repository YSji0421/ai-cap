package com.adjuster.system.dto.request;

import com.adjuster.system.enums.AccidentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.PastOrPresent;
import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Getter
@Setter
public class CaseCreateRequest {

    @NotBlank(message = "사건명은 필수입니다.")
    private String caseName;

    @NotNull(message = "사고유형을 선택하세요.")
    private AccidentType accidentType;

    @NotNull(message = "접수일은 필수입니다.")
    @PastOrPresent(message = "접수일은 오늘 이전이어야 합니다.")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate receivedDate;

    private String memo;
}
