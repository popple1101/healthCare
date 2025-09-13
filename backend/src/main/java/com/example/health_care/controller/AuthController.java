package com.example.health_care.controller;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.Map; // >>> [ADDED] 401 응답 JSON 생성을 위해

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.util.StringUtils;
import com.example.health_care.dto.LoginRequest;
import com.example.health_care.dto.LoginResponse;
import com.example.health_care.dto.LogoutResponse;
import com.example.health_care.dto.SignupRequest;
import com.example.health_care.dto.SignupResponse;
import com.example.health_care.entity.CustomersEntity;
import com.example.health_care.security.JwtTokenProvider;
import com.example.health_care.service.CustomersService;
import com.example.health_care.service.TokenBlacklistService;

import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final CustomersService customersService;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final TokenBlacklistService tokenBlacklistService;

    @PostMapping("/signup")
    public ResponseEntity<SignupResponse> signup(@Valid @RequestBody SignupRequest request) {
        log.info("[SIGNUP] request id = {}, weight = {}, age = {}, gender = {}, height = {}", request.getId(),
                request.getWeight(), request.getAge(), request.getGender(), request.getHeight()); // log 확인
        CustomersEntity saved = customersService.signup(request);
        log.info("[SIGNUP] saved id = {}", saved.getId()); // log 확인

        // 지금까지는 CustomersEntity를 그대로 반환해서 비밀번호 같은 민감한 정보가 노출됐음
        // 응답 전용 DTO(SignupResponse)로 변환해서 필요한 데이터만 반환
        SignupResponse response = SignupResponse.fromEntity(saved);
        return ResponseEntity.created(URI.create("/api/users/" + saved.getId()))
                .body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) { // >>> [CHANGED] 타입만 와일드카드
        try {
            // 사용자 인증
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getId(),
                            request.getPassword()));

            // JWT 토큰 생성
            String token = jwtTokenProvider.createToken(authentication);

            // 사용자 정보 조회 -> Principal만 가져오기
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            LoginResponse response = LoginResponse.builder()
                    .token(token)
                    .tokenType("Bearer")
                    .id(userDetails.getUsername())
                    .build();

            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {
            // >>> [ADDED] 로그인 실패 시 401 + 명확한 메시지(JSON) 반환
            return ResponseEntity.status(401).body(
                Map.of(
                    "error", "invalid_credentials",
                    "message", "아이디 또는 비밀번호가 올바르지 않습니다."
                )
            );
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<LogoutResponse> logout(
            @Parameter(in = ParameterIn.HEADER, name = HttpHeaders.AUTHORIZATION, description = "Bearer <JWT>", required = false) @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
            @AuthenticationPrincipal UserDetails user,
            HttpServletRequest request) {
        // 전역 Authorize가 안 붙거나 프록시에서 빠질 수 있어 추가 확인
        if (!StringUtils.hasText(authorization)) {
            authorization = request.getHeader(HttpHeaders.AUTHORIZATION);
        }

        // Bearer 접두사 유무 모두 허용
        String token = null;
        if (StringUtils.hasText(authorization)) {
            token = authorization.startsWith("Bearer ")
                    ? authorization.substring(7)
                    : authorization.trim();
        }

        if (!StringUtils.hasText(token)) {
            return ResponseEntity.badRequest()
                    .body(LogoutResponse.builder()
                            .message("Missing Authorization header (expected: Bearer <token>)")
                            .build());
        }

        // 토큰에서 사용자/만료시각 추출 (메서드명은 현재 구현과 동일 사용)
        String userId = (user != null) ? user.getUsername() : jwtTokenProvider.getUsernameFromToken(token);
        LocalDateTime exp = jwtTokenProvider.getExpiry(token);

        if (!StringUtils.hasText(userId) || exp == null) {
            return ResponseEntity.badRequest()
                    .body(LogoutResponse.builder().message("Invalid token").build());
        }

        tokenBlacklistService.blacklist(token, userId, exp, "USER_LOGOUT");
        return ResponseEntity.ok(LogoutResponse.builder().message("Logged out").build());
    }
}
