package com.smartattend.attendance.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartattend.attendance.dto.StudentRegistrationRequest;
import com.smartattend.attendance.dto.StudentShortResponse;
import com.smartattend.attendance.mapper.AttendanceMapper;
import com.smartattend.attendance.model.Clazz;
import com.smartattend.attendance.model.Student;
import com.smartattend.attendance.repository.ClazzRepository;
import com.smartattend.attendance.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final ClazzRepository clazzRepository;
    private final AIService aiService;
    private final ObjectMapper objectMapper;

    /**
     * Register a student: capture face encoding via AI, save to DB, enroll in class.
     */
    @Transactional
    public StudentShortResponse registerStudent(StudentRegistrationRequest request) {
        // 1. Find the class by code
        Clazz clazz = clazzRepository.findByClassCode(request.classCode())
                .orElseThrow(() -> new RuntimeException("Invalid Class Code: " + request.classCode()));

        // 2. Get face encoding from AI service
        List<Double> encoding = aiService.getFaceEncoding(request.image());

        // 3. Create student entity
        Student student = new Student();
        student.setName(request.name());
        student.setRollNumber(request.rollNumber());

        // 4. Store encoding as proper JSON string
        try {
            student.setFaceEncoding(objectMapper.writeValueAsString(encoding));
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to process face encoding for storage");
        }

        // 5. Link the many-to-many relationship
        student.getClasses().add(clazz);
        clazz.getEnrolledStudents().add(student);

        // 6. Save and return clean DTO
        Student saved = studentRepository.save(student);
        return AttendanceMapper.toStudentShortResponse(saved);
    }

    /**
     * Get all students enrolled in a class.
     */
    public List<StudentShortResponse> getStudentsByClass(Long classId) {
        return studentRepository.findAllByClassId(classId).stream()
                .map(AttendanceMapper::toStudentShortResponse)
                .toList();
    }
}
