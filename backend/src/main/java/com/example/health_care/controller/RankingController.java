package com.example.health_care.controller;

import com.example.health_care.dto.CustomersProfileDTO;
import com.example.health_care.service.RankingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/ranking")
@RequiredArgsConstructor
public class RankingController {

    private final RankingService rankingService;

    @GetMapping
    public ResponseEntity<List<CustomersProfileDTO>> getAllCustomersProfile() {
        List<CustomersProfileDTO> customers = rankingService.getAllCustomersProfile();
        return ResponseEntity.ok(customers);
    }
}