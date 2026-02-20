package com.kits.timetable.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(name = "subjects")
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; 

    @Column(nullable = false)
    private String code; 

    @Column(nullable = false)
    private String alias; 

    @Column(nullable = false)
    private String department = "CT"; 

    @Column(nullable = false)
    private Integer semester = 6; 

    // ✨ NEW FIELD: This makes the app SMART. 
    // It will store "THEORY", "LAB", or "ACTIVITY"
    @Column(name = "subject_type", nullable = false)
    private String subjectType = "THEORY"; 

    @Column(nullable = false)
    private Integer weeklyLectureCount = 0; 

    @Column(nullable = false)
    private Integer weeklyLabCount = 0; 

    @Column(nullable = false)
    private Integer labDuration = 0; 

    @Column(nullable = false)
    private Boolean hasBatches = false; 

    @Column(nullable = false)
    private Integer batchesPerSection = 0; 
}