package com.smartattend.attendance.controller;

import com.smartattend.attendance.dto.*;
import com.smartattend.attendance.service.AttendanceService;
import com.smartattend.attendance.service.ClazzService;
import com.smartattend.attendance.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classes")
@RequiredArgsConstructor
public class ClazzController {

    private final ClazzService clazzService;
    private final StudentService studentService;
    private final AttendanceService attendanceService;

    /**
     * Create a new class. TeacherId is extracted from JWT.
     */
    @PostMapping("/create")
    public ResponseEntity<ClassResponse> create(@Valid @RequestBody CreateClassRequest request,
                                                 Authentication auth) {
        Long teacherId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(clazzService.createClass(request, teacherId));
    }

    /**
     * List all classes belonging to the authenticated teacher.
     */
    @GetMapping("/my-classes")
    public ResponseEntity<List<ClassResponse>> getMyClasses(Authentication auth) {
        Long teacherId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(clazzService.getClassesByTeacher(teacherId));
    }

    /**
     * List all students enrolled in a class.
     */
    @GetMapping("/{classId}/students")
    public ResponseEntity<List<StudentShortResponse>> getStudents(@PathVariable Long classId) {
        return ResponseEntity.ok(studentService.getStudentsByClass(classId));
    }

    /**
     * Attendance percentage report for all students in a class.
     */
    @GetMapping("/{classId}/report")
    public ResponseEntity<List<AttendanceReportDTO>> getReport(@PathVariable Long classId) {
        return ResponseEntity.ok(attendanceService.getAttendanceReport(classId));
    }

    /**
     * Delete a class. Only the owning teacher can delete it.
     */
    @DeleteMapping("/{classId}")
    public ResponseEntity<Void> deleteClass(@PathVariable Long classId, Authentication auth) {
        Long teacherId = (Long) auth.getPrincipal();
        clazzService.deleteClass(classId, teacherId);
        return ResponseEntity.noContent().build();
    }
}
