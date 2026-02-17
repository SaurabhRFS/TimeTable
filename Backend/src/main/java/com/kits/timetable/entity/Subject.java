package com.kits.timetable.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "subjects")
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    // 1. FIX for "Bad Request": Ensure 'code' field exists
    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String alias;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private int semester;

    private int weeklyLectureCount;
    private int weeklyLabCount;
    private int labDuration;

    // 2. FIX for "JSON parse error": Change 'boolean' to 'Boolean'
    // This allows the Backend to accept 'null' from the frontend without crashing
    private Boolean isElective = false; 
}