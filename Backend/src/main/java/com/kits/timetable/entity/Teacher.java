package com.kits.timetable.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Entity // Marks this class as a JPA entity (represents a database table)
@Data   // Lombok: Generates getters, setters, toString, equals, hashCode
@NoArgsConstructor // Lombok: Generates default constructor (required by JPA)
@AllArgsConstructor // Lombok: Generates constructor with all fields
@Table(name = "teachers") // Specifies table name in database
public class Teacher {

    @Id // Marks this field as Primary Key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment ID (MySQL)
    private Long id;

    @Column(nullable = false, unique = true) // Cannot be null and must be unique
    private String name; // e.g., "Mrs. Ketkee Ghawade"

    @Column(nullable = false) // Cannot be null
    private String department; // e.g., "CT"

    private String alias; // Optional short name (can be null), e.g., "KG"

    @ElementCollection // Stores list of simple values in a separate table
    private List<String> busySlots; // Teacher's unavailable time slots
}