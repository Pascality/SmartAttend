package com.smartattend.attendance.repository;

import com.smartattend.attendance.model.Clazz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClazzRepository extends JpaRepository<Clazz, Long> {

    boolean existsByClassCode(String classCode);

    Optional<Clazz> findByClassCode(String classCode);

    List<Clazz> findAllByTeacherId(Long teacherId);
}
