package com.example.health_care.entity;

import jakarta.persistence.*;
import lombok.*;
import com.example.health_care.entity.Gender;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "customers")
public class CustomersEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "customers_seq")
    @SequenceGenerator(name = "customers_seq", sequenceName = "CUSTOMERS_SEQ", allocationSize = 1)
    @Column(name = "idx")
    private Long idx;

    @Column(name = "id", length = 100, nullable = false, updatable = false, unique = true)
    private String id;

    @Column(name = "password", length = 255, nullable = false) // length 60 -> 50 수정
    private String password;

    @Column(name = "weight")
    private Double weight;

    @Column(name = "age")
    private Integer age;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", length = 1)
    private Gender gender;

    @Column(name = "height")
    private Double height;
}
/*tlqkf */
/*..? */