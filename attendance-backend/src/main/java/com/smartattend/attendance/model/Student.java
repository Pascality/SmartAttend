package com.smartattend.attendance.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "students")
@Getter @Setter @NoArgsConstructor
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String rollNumber;

    @Column(columnDefinition = "LONGTEXT")
    private String faceEncoding; // 128-d vector stored as JSON string

    @ManyToMany(mappedBy = "enrolledStudents")
    private Set<Clazz> classes = new HashSet<>();
}
