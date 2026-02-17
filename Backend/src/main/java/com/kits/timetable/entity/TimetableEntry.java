package com.kits.timetable.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "timetable_entries")
public class TimetableEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 1. The "When"
    @Column(nullable = false)
    private String day; // "MON", "TUE", "WED"

    @ManyToOne
    @JoinColumn(name = "time_slot_id", nullable = false)
    private TimeSlot timeSlot; // Links to "10:00 - 10:55"

    // 2. The "Who" & "What"
    @ManyToOne
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher; // Links to "Mr. Deshpande"

    @ManyToOne
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject; // Links to "DWM"

    // 3. The "Where"
    @ManyToOne
    @JoinColumn(name = "room_id", nullable = false)
    private Room room; // Links to "Room 264"

    // 4. The Context
    @Column(nullable = false)
    private String department; // "CT"

    @Column(nullable = false)
    private int semester; // 6

    @Column(nullable = false)
    private String section; // "A" or "B"

    // 5. The "Lab" Fix
    // If it's a Lecture, this is "ALL".
    // If it's a Lab, this is "A1", "B1", etc.
    @Column(nullable = false)
    private String batch; 
}