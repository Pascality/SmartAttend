package com.smartattend.attendance.dto;

public record SessionHistoryDTO(
        Long sessionId,
        String date,
        int studentCount
) {}
