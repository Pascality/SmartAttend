package com.smartattend.attendance.mapper;

import com.smartattend.attendance.dto.*;
import com.smartattend.attendance.model.*;

import java.time.format.DateTimeFormatter;

public class AttendanceMapper {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    // ── Teacher ──────────────────────────────────

    public static TeacherResponse toTeacherResponse(Teacher teacher) {
        return new TeacherResponse(
                teacher.getId(),
                teacher.getName(),
                teacher.getEmail()
        );
    }

    // ── Class ────────────────────────────────────

    public static ClassResponse toClassResponse(Clazz clazz) {
        return new ClassResponse(
                clazz.getId(),
                clazz.getClassName(),
                clazz.getClassCode(),
                clazz.getEnrolledStudents().size()
        );
    }

    // ── Student ──────────────────────────────────

    public static StudentShortResponse toStudentShortResponse(Student student) {
        return new StudentShortResponse(
                student.getId(),
                student.getName(),
                student.getRollNumber()
        );
    }

    // ── Session ──────────────────────────────────

    public static SessionResponse toSessionResponse(AttendanceSession session) {
        return new SessionResponse(
                session.getId(),
                session.getClazz().getClassName(),
                session.getStartTime().format(FORMATTER),
                session.isActive()
        );
    }

    // ── Attendance Record ────────────────────────

    public static AttendanceResponse toAttendanceResponse(AttendanceRecord record) {
        return new AttendanceResponse(
                record.getStudent().getName(),
                record.getStudent().getRollNumber(),
                record.getStatus().name(),
                record.getTimestamp().format(FORMATTER)
        );
    }

    // ── Session History ──────────────────────────

    public static SessionHistoryDTO toSessionHistoryDTO(AttendanceSession session) {
        return new SessionHistoryDTO(
                session.getId(),
                session.getStartTime().format(FORMATTER),
                session.getAttendanceRecords() != null ? session.getAttendanceRecords().size() : 0
        );
    }
}
