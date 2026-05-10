package com.smartattend.attendance.service;

import com.smartattend.attendance.dto.ClassResponse;
import com.smartattend.attendance.dto.CreateClassRequest;
import com.smartattend.attendance.mapper.AttendanceMapper;
import com.smartattend.attendance.model.Clazz;
import com.smartattend.attendance.model.Teacher;
import com.smartattend.attendance.repository.ClazzRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClazzService {

    private final ClazzRepository clazzRepository;
    private final TeacherService teacherService;

    private final SecureRandom random = new SecureRandom();
    private static final String ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    /**
     * Create a new class for a teacher. Generates a unique 6-char code.
     */
    public ClassResponse createClass(CreateClassRequest request, Long teacherId) {
        Teacher teacher = teacherService.getTeacherEntity(teacherId);

        Clazz clazz = new Clazz();
        clazz.setClassName(request.className());
        clazz.setTeacher(teacher);
        clazz.setClassCode(generateUniqueCode());

        Clazz saved = clazzRepository.save(clazz);
        return AttendanceMapper.toClassResponse(saved);
    }

    /**
     * Get all classes belonging to a teacher.
     */
    public List<ClassResponse> getClassesByTeacher(Long teacherId) {
        return clazzRepository.findAllByTeacherId(teacherId).stream()
                .map(AttendanceMapper::toClassResponse)
                .toList();
    }

    /**
     * Internal: get the raw entity for service-to-service use.
     */
    public Clazz getClazzEntity(Long id) {
        return clazzRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Class not found"));
    }

    /**
     * Delete a class. Only the owning teacher can delete it.
     * Clears enrollments and cascades to sessions/records.
     */
    @Transactional
    public void deleteClass(Long classId, Long teacherId) {
        Clazz clazz = getClazzEntity(classId);
        if (!clazz.getTeacher().getId().equals(teacherId)) {
            throw new RuntimeException("You are not authorized to delete this class.");
        }
        // Clear the many-to-many enrollments before deleting
        clazz.getEnrolledStudents().clear();
        clazzRepository.save(clazz);
        clazzRepository.delete(clazz);
    }

    /**
     * Generate a unique 6-character alphanumeric code.
     */
    private String generateUniqueCode() {
        String code;
        do {
            StringBuilder sb = new StringBuilder(6);
            for (int i = 0; i < 6; i++) {
                sb.append(ALPHABET.charAt(random.nextInt(ALPHABET.length())));
            }
            code = sb.toString();
        } while (clazzRepository.existsByClassCode(code));
        return code;
    }
}
