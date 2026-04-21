package com.smartattend.attendance.dto;

public record AttendanceReportDTO(
        String studentName,
        String rollNumber,
        long totalSessions,
        long attendedSessions,
        double percentage
) {}
