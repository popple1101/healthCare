package com.example.health_care.service;

import com.example.health_care.dto.CustomersProfileDTO;
import com.example.health_care.entity.BodyEntity;
import com.example.health_care.entity.CustomersEntity;
import com.example.health_care.repository.CustomersRepository;
import com.example.health_care.repository.BodyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RankingService {

    private final CustomersRepository customersRepository;
    private final BodyRepository bodyRepository;

    public List<CustomersProfileDTO> getAllCustomersProfile() {
        List<CustomersEntity> customers = customersRepository.findAll();
        
        return customers.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private CustomersProfileDTO convertToDto(CustomersEntity customer) {
        // CustomersEntity의 idx를 이용해 BodyRepository에서 최신 BodyEntity를 조회합니다.
        Optional<BodyEntity> latestBodyOptional = bodyRepository.findTopByCustomer_IdxOrderByIdxDesc(customer.getIdx());

        CustomersProfileDTO.CustomersProfileDTOBuilder dtoBuilder = CustomersProfileDTO.builder()
                .id(customer.getId())
                .weight(customer.getWeight())
                .age(customer.getAge())
                .gender(customer.getGender())
                .height(customer.getHeight());

        // 최신 BodyEntity가 존재하면 targetWeight와 targetCalories를 DTO에 추가합니다.
        if (latestBodyOptional.isPresent()) {
            BodyEntity latestBody = latestBodyOptional.get();
            dtoBuilder.targetWeight(latestBody.getTargetWeight())
                      .targetCalories(latestBody.getTargetCalories());
        }

        return dtoBuilder.build();
    }
}