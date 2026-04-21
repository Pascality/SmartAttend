package com.smartattend.attendance.dto;

public record SessionResponse(
        Long sessionId,
        String className,
        String startTime,
        boolean isActive
) {}
