package com.smartattend.attendance.service;

import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AIService {

    private final RestClient aiRestClient;

    /**
     * Sends a base64 image to the Python service to extract the 128-d face vector.
     * Used during Student Registration.
     */
    public List<Double> getFaceEncoding(String base64Image) {
        Map<String, Object> response = aiRestClient.post()
                .uri("/encode")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("image_base64", base64Image))
                .retrieve()
                .body(new ParameterizedTypeReference<Map<String, Object>>() {});

        if (response == null || !response.containsKey("encoding")) {
            throw new RuntimeException("AI Service failed to return face encoding");
        }

        @SuppressWarnings("unchecked")
        List<Double> encoding = (List<Double>) response.get("encoding");
        return encoding;
    }

    /**
     * Sends a live base64 image and candidate encodings to Python for matching.
     * Used during the Attendance scanning process.
     */
    public Long findBestMatch(String base64Image, List<Map<String, Object>> candidates) {
        Map<String, Object> response = aiRestClient.post()
                .uri("/match")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "image_base64", base64Image,
                        "known_encodings", candidates
                ))
                .retrieve()
                .body(new ParameterizedTypeReference<Map<String, Object>>() {});

        if (response == null || response.get("student_id") == null) {
            return null;
        }

        Object studentId = response.get("student_id");
        if (studentId instanceof Number) {
            return ((Number) studentId).longValue();
        }

        return null;
    }
}
