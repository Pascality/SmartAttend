package com.smartattend.attendance.repository;

import com.smartattend.attendance.model.AttendanceRecord;
import com.smartattend.attendance.model.AttendanceSession;
import com.smartattend.attendance.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {

    // Prevent duplicate scan: check if student already marked in this session
    boolean existsByStudentAndSession(Student student, AttendanceSession session);

    // Live dashboard: list of students marked in a session
    List<AttendanceRecord> findAllBySessionOrderByTimestampDesc(AttendanceSession session);

    // Report: count how many sessions a student attended in a specific class
    long countByStudentAndSession_Clazz_Id(Student student, Long classId);

    // Optimized Report: count sessions attended for all students in a class
    @org.springframework.data.jpa.repository.Query("SELECT r.student.id, COUNT(r) FROM AttendanceRecord r WHERE r.session.clazz.id = :classId GROUP BY r.student.id")
    List<Object[]> countAttendanceByClassGroupedByStudent(@org.springframework.data.repository.query.Param("classId") Long classId);
}
