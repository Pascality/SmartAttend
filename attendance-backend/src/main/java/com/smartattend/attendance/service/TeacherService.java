package com.smartattend.attendance.service;

import com.smartattend.attendance.dto.LoginRequest;
import com.smartattend.attendance.dto.TeacherRegistrationRequest;
import com.smartattend.attendance.dto.TeacherResponse;
import com.smartattend.attendance.mapper.AttendanceMapper;
import com.smartattend.attendance.model.Teacher;
import com.smartattend.attendance.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    /**
     * Register a new teacher. Hashes the password with BCrypt.
     */
    public TeacherResponse registerTeacher(TeacherRegistrationRequest request) {
        if (teacherRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Email already in use.");
        }

        Teacher teacher = new Teacher();
        teacher.setName(request.name());
        teacher.setEmail(request.email());
        teacher.setPassword(passwordEncoder.encode(request.password()));

        Teacher saved = teacherRepository.save(teacher);
        return AttendanceMapper.toTeacherResponse(saved);
    }

    /**
     * Login: validate email + password, return teacher entity.
     * The controller will handle JWT generation.
     */
    public Teacher login(LoginRequest request) {
        Teacher teacher = teacherRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), teacher.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        return teacher;
    }

    /**
     * Get teacher profile by ID — returns clean DTO.
     */
    public TeacherResponse getTeacherById(Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        return AttendanceMapper.toTeacherResponse(teacher);
    }

    /**
     * Internal: get the raw entity for service-to-service use.
     */
    public Teacher getTeacherEntity(Long id) {
        return teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
    }
}
