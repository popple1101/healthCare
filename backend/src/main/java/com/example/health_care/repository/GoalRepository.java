package com.example.health_care.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.health_care.entity.GoalEntity;

public interface GoalRepository extends JpaRepository <GoalEntity, Long> {

    // 고객이 목표를 최초 설정 한 후 다시 수정했을 때 최신 목표 가져오기
    // 💡 추가: 고객의 가장 최신 목표 1건만 가져오는 메서드
    Optional<GoalEntity> findTopByCustomer_IdxOrderByIdxDesc(Long customerIdx);
    
    Optional<GoalEntity> findByCustomer_Idx(Long idx);
    
    boolean existsByCustomer_Id(String customerId);

}
