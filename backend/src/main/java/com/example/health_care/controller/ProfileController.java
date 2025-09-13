package com.example.health_care.controller;
import com.example.health_care.controller.ProfileController;
import com.example.health_care.dto.CustomersProfileDTO;
import com.example.health_care.dto.UpdateAccountRequest;
import com.example.health_care.service.CustomersService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/profile") // 프로필 전용 경로
public class ProfileController {

    private final CustomersService customersService;

    // 프로필 정보 조회 API (GET api/profile)
    @GetMapping
    public ResponseEntity<CustomersProfileDTO> getCustomerProfile(Authentication authentication) {
        String customerId = authentication.getName();
        CustomersProfileDTO cpd = customersService.getCustomerProfile(customerId);
        if (cpd != null) {
            return ResponseEntity.ok(cpd);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // 프로필 및 목표 정보 수정 API (PUT api/profile)
    @PutMapping
    public ResponseEntity<Void> updateProfileAndGoals(
            @RequestBody UpdateAccountRequest updateRequest,
            Authentication authentication) {
        String customerId = authentication.getName();
        customersService.updateProfileAndSaveGoal(customerId, updateRequest);
        return ResponseEntity.noContent().build();
    }
}