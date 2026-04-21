package com.smartattend.attendance.repository;

import com.smartattend.attendance.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    // Fetch all students enrolled in a specific class
    @Query("SELECT s FROM Student s JOIN s.classes c WHERE c.id = :classId")
    List<Student> findAllByClassId(@Param("classId") Long classId);

    // Fetch ONLY the encoding and ID — minimizes JSON payload sent to Python
    @Query("SELECT s.id, s.faceEncoding FROM Student s JOIN s.classes c WHERE c.id = :classId")
    List<Object[]> findEncodingsByClassId(@Param("classId") Long classId);

    // Search students by name (case-insensitive)
    List<Student> findByNameContainingIgnoreCase(String name);
}
