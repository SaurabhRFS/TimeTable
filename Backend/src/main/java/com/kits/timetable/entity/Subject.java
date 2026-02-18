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
    private Boolean isElective = false;

    // --- NEW: THE CUSTOM BATCH SYSTEM ---
    private Boolean hasBatches = false; // "Does this subject split students into batches?"
    private int batchesPerSection = 0; // "If yes, how many batches? (e.g., 3 means A1, A2, A3)"
}