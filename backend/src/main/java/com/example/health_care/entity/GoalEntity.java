package com.example.health_care.entity;

import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "goal")
public class GoalEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "goal_seq_generator")
    @SequenceGenerator(name = "goal_seq_generator", sequenceName = "GOAL_SEQ", allocationSize = 1)
    @Column(name = "idx")
    private Long idx;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private CustomersEntity customer;

    @Column(name = "target_weight") // nullable = false 속성 제거
    private Double targetWeight;

    @Column(name = "target_calories") // nullable = false 속성 제거
    private Integer targetCalories;

 @Builder.Default
    @Column(name = "record_date", nullable = false)
    private Date recordDate = new Date();
}
