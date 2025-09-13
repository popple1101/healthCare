package com.example.health_care.entity;

import lombok.*;
import java.util.Date;
import jakarta.persistence.*;
import com.example.health_care.entity.Gender;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "body")
public class BodyEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "body_seq_generator")
    @SequenceGenerator(name = "body_seq_generator", sequenceName = "BODY_SEQ", allocationSize = 1)
    @Column(name = "idx")
    private Long idx;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private CustomersEntity customer;

    @Column(name = "target_weight")
    private Double targetWeight;

    @Column(name = "target_calories")
    private Integer targetCalories;

    @Column(name = "weight")
    private Double weight;

    @Column(name = "age")
    private Integer age;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", length = 1)
    private Gender gender;

    @Column(name = "height")
    private Double height;
    
    @Column(name = "inbody")
    private Double inbody;

    @Column(name = "record_date", nullable = false)
    private Date recordDate;
}