package com.kits.timetable.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "rooms")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String roomNumber; // e.g., "267", "206"

    @Column(nullable = false)
    private int capacity; // e.g., 60

    // CRITICAL: This is how we distinguish "Theory" vs "Practical" spaces.
    // We will store values like "CLASSROOM" or "LAB" here.
    @Column(nullable = false)
    private String type; 

    // This ensures we only book CT rooms for CT subjects.
    @Column(nullable = false)
    private String department; 
}