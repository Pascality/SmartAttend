package com.smartattend.attendance.controller;

import com.smartattend.attendance.dto.StudentRegistrationRequest;
import com.smartattend.attendance.dto.StudentShortResponse;
import com.smartattend.attendance.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    /**
     * Register a student: name + rollNumber + face photo + class code.
     */
    @PostMapping("/register")
    public ResponseEntity<StudentShortResponse> register(@Valid @RequestBody StudentRegistrationRequest request) {
        return ResponseEntity.ok(studentService.registerStudent(request));
    }
}
