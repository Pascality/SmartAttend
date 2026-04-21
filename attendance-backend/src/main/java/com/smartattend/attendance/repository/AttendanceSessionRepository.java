package com.smartattend.attendance.repository;

import com.smartattend.attendance.model.AttendanceSession;
import com.smartattend.attendance.model.Clazz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, Long> {

    // Find the currently active session for a class (prevents overlapping sessions)
    Optional<AttendanceSession> findByClazzAndIsActiveTrue(Clazz clazz);

    // Session history for a class, newest first
    List<AttendanceSession> findAllByClazzOrderByStartTimeDesc(Clazz clazz);

    // Count total sessions for a class (used in attendance percentage calculation)
    long countByClazz(Clazz clazz);
}
