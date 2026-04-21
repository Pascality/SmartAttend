package com.smartattend.attendance.dto;

public record LoginResponse(String token, Long teacherId, String teacherName) {}
