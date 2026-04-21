package com.smartattend.attendance.controller;

import com.smartattend.attendance.config.JwtUtil;
import com.smartattend.attendance.dto.*;
import com.smartattend.attendance.model.Teacher;
import com.smartattend.attendance.service.TeacherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final TeacherService teacherService;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<TeacherResponse> register(@Valid @RequestBody TeacherRegistrationRequest request) {
        return ResponseEntity.ok(teacherService.registerTeacher(request));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        // 1. Validate credentials — throws if invalid
        Teacher teacher = teacherService.login(request);

        // 2. Generate JWT token
        String token = jwtUtil.generateToken(teacher.getId(), teacher.getEmail());

        // 3. Return token + teacher info
        return ResponseEntity.ok(new LoginResponse(token, teacher.getId(), teacher.getName()));
    }
}
