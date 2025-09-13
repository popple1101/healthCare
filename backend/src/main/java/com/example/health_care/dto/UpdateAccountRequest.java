package com.example.health_care.dto;

import com.example.health_care.entity.Gender;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@ToString
public class UpdateAccountRequest {

    // 비밀번호 변경 필드 (ChangePasswordRequest에서 가져옴)
    @Size(min = 8, max = 64)
    private String newPassword;

    // 프로필 변경 필드 (UpdateAccountProfileRequest에서 가져옴)
    @Email
    @NotBlank
    private String id;

    @Positive
    @Digits(integer = 3, fraction = 1)
    private Double weight;

    @Positive
    @Max(150)
    private Integer age;

    private Gender gender;

    @Positive
    @Digits(integer = 3, fraction = 1)
    private Double height;

    // 추가로 목표 몸무게, 목표 칼로리 등을 넣을 수 있습니다.
    @NotNull
    @Positive
    @Digits(integer = 4, fraction = 1)
    private Double targetWeight;

    @NotNull
    @Positive
    @Digits(integer = 5, fraction = 0)
    private Integer targetCalories;
}