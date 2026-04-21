package com.smartattend.attendance.controller;

import com.smartattend.attendance.dto.*;
import com.smartattend.attendance.service.AttendanceService;
import com.smartattend.attendance.service.ClazzService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final ClazzService clazzService;

    /**
     * Start a new attendance session for a class.
     */
    @PostMapping("/session/start/{classId}")
    public ResponseEntity<SessionResponse> startSession(@PathVariable Long classId) {
        var clazz = clazzService.getClazzEntity(classId);
        return ResponseEntity.ok(attendanceService.startSession(clazz));
    }

    /**
     * End an active attendance session.
     */
    @PostMapping("/session/end/{sessionId}")
    public ResponseEntity<SessionResponse> endSession(@PathVariable Long sessionId) {
        return ResponseEntity.ok(attendanceService.endSession(sessionId));
    }

    /**
     * Scan a face for attendance marking.
     * Returns the matched student or 404 if no match.
     */
    @PostMapping("/scan/{sessionId}")
    public ResponseEntity<AttendanceResponse> scan(@PathVariable Long sessionId,
                                                    @RequestBody AttendanceScanRequest request) {
        AttendanceResponse response = attendanceService.markAttendance(sessionId, request);

        if (response == null) {
            return ResponseEntity.status(404).build();
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Get session history for a class.
     */
    @GetMapping("/session/{classId}/history")
    public ResponseEntity<List<SessionHistoryDTO>> getHistory(@PathVariable Long classId) {
        return ResponseEntity.ok(attendanceService.getSessionHistory(classId));
    }
}
