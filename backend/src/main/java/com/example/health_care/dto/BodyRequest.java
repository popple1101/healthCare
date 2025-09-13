package com.example.health_care.dto;
import com.example.health_care.entity.Gender;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BodyRequest {
  @NotNull
  @Positive
  @Digits(integer = 4, fraction = 1)
  private Double targetWeight;

  @NotNull
  @Positive
  @Digits(integer = 5, fraction = 0)
  private Integer targetCalories;

  @NotNull
  @Positive
  @Digits(integer = 4, fraction = 1)
  private Double weight;

  @NotNull
  @Positive
  @Digits(integer = 3, fraction = 0)
  private Double height;

  @NotNull
  @Positive
  @Digits(integer = 3, fraction = 0)
  private Integer age;

  @NotNull
  private Gender gender;

  @Positive
  @Digits(integer = 5, fraction = 2)
  private Double inbody;
}