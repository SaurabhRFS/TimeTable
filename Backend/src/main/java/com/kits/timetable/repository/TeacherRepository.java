package com.kits.timetable.repository;

import com.kits.timetable.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository // Marks this interface as a Spring Data repository (component for DB operations)
public interface TeacherRepository extends JpaRepository<Teacher, Long> { // Provides built-in CRUD operations for Teacher entity with Primary Key type Long
    // No code needed here because JpaRepository already provides:
    // save(), findById(), findAll(), deleteById(), update(), etc.
}