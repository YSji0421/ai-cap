package com.adjuster.system.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Getter
@Setter
public class ClientUpdateRequest {

    @NotBlank(message = "고객명은 필수입니다.")
    private String clientName;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate birthDate;

    @NotBlank(message = "연락처는 필수입니다.")
    @Pattern(regexp = "\\d{3}-\\d{3,4}-\\d{4}", message = "올바른 형식으로 입력하세요. 예) 010-1234-5678")
    private String phone;

    @Email(message = "올바른 이메일 형식이 아닙니다.")
    private String email;

    private String insurerName;
    private String policyNumber;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate accidentDate;

    private String injuryContent;
}
