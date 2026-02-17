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
    private String name; // e.g., "Data Warehousing & Mining"

    @Column(nullable = false)
    private String alias; // e.g., "DWM" (For the timetable grid)

    @Column(nullable = false)
    private String department; // e.g., "CT"

    @Column(nullable = false)
    private int semester; // e.g., 6

    // The Constraints for the Algorithm
    private int weeklyLectureCount; // e.g., 3 (Theory hours)
    
    private int weeklyLabCount; // e.g., 1 (Number of lab SESSIONS, not hours)
    
    private int labDuration; // e.g., 2 (Hours per session)

    private boolean isElective; // True for subjects like "STQA" or "Embedded Systems"
}