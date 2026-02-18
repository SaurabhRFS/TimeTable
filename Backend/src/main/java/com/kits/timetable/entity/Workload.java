package com.kits.timetable.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "workload")
public class Workload {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String department; 

    @Column(nullable = false)
    private int semester; 

    @Column(nullable = false)
    private String section; // "A" or "B"

    // --- NEW FIELD ---
    @Column(nullable = false)
    private String batch; // "ALL" (for Theory), "A1", "A2" (for Labs)

    @ManyToOne
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;
}