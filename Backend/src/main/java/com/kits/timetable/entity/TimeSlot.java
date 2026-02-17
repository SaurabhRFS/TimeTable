package com.kits.timetable.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "time_slots")
public class TimeSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // We use LocalTime (Java's standard time format)
    // It stores "10:00", not "10:00 AM on Monday"
    @Column(nullable = false)
    private LocalTime startTime; 

    @Column(nullable = false)
    private LocalTime endTime;

    // 1, 2, 3... (Crucial for "Consecutive" checks)
    @Column(nullable = false, unique = true)
    private int slotOrder;

    // "LECTURE", "BREAK", "LUNCH"
    // The algorithm will SKIP "BREAK" and "LUNCH" slots automatically.
    @Column(nullable = false)
    private String category; 
}