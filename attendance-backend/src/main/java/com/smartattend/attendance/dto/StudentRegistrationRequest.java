package com.smartattend.attendance.dto;

import jakarta.validation.constraints.NotBlank;

public record StudentRegistrationRequest(
        @NotBlank(message = "Name is required") String name,
        @NotBlank(message = "Roll number is required") String rollNumber,
        @NotBlank(message = "Image is required") String image,
        @NotBlank(message = "Class code is required") String classCode
) {}
