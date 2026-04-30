package com.adjuster.system.dto.request;

import com.adjuster.system.enums.ConsultMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

@Getter
@Setter
public class ConsultationCreateRequest {

    @NotNull(message = "상담일시는 필수입니다.")
    @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime consultDatetime;

    @NotNull(message = "상담방법을 선택하세요.")
    private ConsultMethod consultMethod;

    @NotBlank(message = "상담 내용을 입력하세요.")
    @Size(min = 10, message = "상담 내용은 최소 10자 이상 입력하세요.")
    private String content;

    private String specialNote;
}
