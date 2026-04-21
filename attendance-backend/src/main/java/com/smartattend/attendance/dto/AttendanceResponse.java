package com.smartattend.attendance.dto;

public record AttendanceResponse(String studentName,
                                 String rollNumber,
                                 String status,
                                 String timestamp) {}
