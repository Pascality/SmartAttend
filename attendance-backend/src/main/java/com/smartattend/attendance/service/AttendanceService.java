package com.smartattend.attendance.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartattend.attendance.dto.*;
import com.smartattend.attendance.mapper.AttendanceMapper;
import com.smartattend.attendance.model.*;
import com.smartattend.attendance.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceSessionRepository sessionRepo;
    private final AttendanceRecordRepository recordRepo;
    private final StudentRepository studentRepo;
    private final AIService aiService;
    private final ObjectMapper objectMapper;
    private final ClazzService clazzService;

    /**
     * Start a new attendance session for a class.
     * Prevents duplicate active sessions.
     */
    public SessionResponse startSession(Clazz clazz) {
        sessionRepo.findByClazzAndIsActiveTrue(clazz).ifPresent(s -> {
            throw new RuntimeException("A session is already active for this class.");
        });

        AttendanceSession session = new AttendanceSession();
        session.setClazz(clazz);
        session.setStartTime(LocalDateTime.now());
        session.setActive(true);

        return AttendanceMapper.toSessionResponse(sessionRepo.save(session));
    }

    /**
     * End an active attendance session.
     */
    public SessionResponse endSession(Long sessionId) {
        AttendanceSession session = sessionRepo.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (!session.isActive()) {
            throw new RuntimeException("Session is already ended.");
        }

        session.setActive(false);
        session.setEndTime(LocalDateTime.now());

        return AttendanceMapper.toSessionResponse(sessionRepo.save(session));
    }

    /**
     * Mark attendance by scanning a face.
     * 1. Fetches all student encodings for the class
     * 2. Sends to Python AI for matching
     * 3. Records attendance if matched
     */
    public AttendanceResponse markAttendance(Long sessionId, AttendanceScanRequest request) {
        AttendanceSession session = sessionRepo.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (!session.isActive()) {
            throw new RuntimeException("Session is no longer active.");
        }

        // 1. Fetch candidate encodings for this class
        List<Object[]> candidateData = studentRepo.findEncodingsByClassId(session.getClazz().getId());

        // 2. Convert DB strings into proper JSON arrays for Python
        List<Map<String, Object>> candidates = candidateData.stream().map(row -> {
            Map<String, Object> map = new HashMap<>();
            map.put("student_id", row[0]);

            try {
                String rawEncoding = (String) row[1];
                List<Double> encodingList = objectMapper.readValue(
                        rawEncoding, new TypeReference<List<Double>>() {}
                );
                map.put("encoding", encodingList);
            } catch (JsonProcessingException e) {
                throw new RuntimeException("Error parsing face encoding for student ID: " + row[0]);
            }
            return map;
        }).toList();

        // 3. Call AI service for matching
        Long matchedId = aiService.findBestMatch(request.image(), candidates);

        if (matchedId == null) {
            return null; // No match found
        }

        // 4. Find the matched student
        Student student = studentRepo.findById(matchedId)
                .orElseThrow(() -> new RuntimeException("Matched student ID " + matchedId + " not found"));

        // 5. Check for duplicate marking
        if (recordRepo.existsByStudentAndSession(student, session)) {
            return new AttendanceResponse(
                    student.getName(),
                    student.getRollNumber(),
                    "ALREADY_MARKED",
                    LocalDateTime.now().toString()
            );
        }

        // 6. Record attendance
        AttendanceRecord record = new AttendanceRecord();
        record.setStudent(student);
        record.setSession(session);
        record.setTimestamp(LocalDateTime.now());
        record.setStatus(AttendanceStatus.PRESENT);
        recordRepo.save(record);

        return AttendanceMapper.toAttendanceResponse(record);
    }

    /**
     * Get session history for a class.
     */
    public List<SessionHistoryDTO> getSessionHistory(Long classId) {
        Clazz clazz = clazzService.getClazzEntity(classId);
        return sessionRepo.findAllByClazzOrderByStartTimeDesc(clazz).stream()
                .map(AttendanceMapper::toSessionHistoryDTO)
                .toList();
    }

    /**
     * Get attendance percentage report for all students in a class.
     */
    public List<AttendanceReportDTO> getAttendanceReport(Long classId) {
        Clazz clazz = clazzService.getClazzEntity(classId);
        long totalSessions = sessionRepo.countByClazz(clazz);

        List<Student> students = studentRepo.findAllByClassId(classId);
        
        List<Object[]> attendanceCounts = recordRepo.countAttendanceByClassGroupedByStudent(classId);
        Map<Long, Long> attendanceMap = attendanceCounts.stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (Long) row[1]
                ));

        return students.stream().map(student -> {
            long attended = attendanceMap.getOrDefault(student.getId(), 0L);
            double percentage = totalSessions > 0 ? (attended * 100.0 / totalSessions) : 0.0;
            return new AttendanceReportDTO(
                    student.getName(),
                    student.getRollNumber(),
                    totalSessions,
                    attended,
                    Math.round(percentage * 10.0) / 10.0
            );
        }).toList();
    }
}
