package com.kits.timetable.entity;

import jakarta.persistence.*; // JPA annotations
import lombok.Data; // Generates getters/setters automatically
import lombok.NoArgsConstructor; // Generates default constructor
import lombok.AllArgsConstructor; // Generates all-args constructor

@Entity // Marks this class as a database table
@Data // Auto generates getters, setters, toString, etc.
@NoArgsConstructor // Required by JPA (empty constructor)
@AllArgsConstructor // Constructor with all fields
@Table(name = "rooms") // Table name will be "rooms"
public class Room {

    @Id // Primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment ID
    private Long id;

    @Column(nullable = false, unique = true) // Cannot be null & must be unique
    private String roomNumber; // Example: "267"

    @Column(nullable = false) // Cannot be null
    private int capacity; // Example: 60

    @Column(nullable = false) // Cannot be null
    private String type; // "CLASSROOM" or "LAB"

    @Column(nullable = false) // Cannot be null
    private String department; // Example: "CT"
}