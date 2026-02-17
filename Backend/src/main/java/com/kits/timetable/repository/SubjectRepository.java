package com.kits.timetable.repository;

import com.kits.timetable.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    
    // Custom Query: Spring writes the SQL automatically!
    // SQL: SELECT * FROM subjects WHERE department = ? AND semester = ?
    List<Subject> findByDepartmentAndSemester(String department, int semester);
}