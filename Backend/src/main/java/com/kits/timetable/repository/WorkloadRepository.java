package com.kits.timetable.repository;

import com.kits.timetable.entity.Workload;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkloadRepository extends JpaRepository<Workload, Long> {
    
    List<Workload> findByDepartmentAndSemester(String department, int semester);
    
    Workload findBySubjectIdAndSectionAndBatch(Long subjectId, String section, String batch);
    
    List<Workload> findByDepartmentAndSemesterAndSection(String department, int semester, String section);

    // Added methods for cascading deletes
    void deleteByTeacher(com.kits.timetable.entity.Teacher teacher);
    void deleteBySubject(com.kits.timetable.entity.Subject subject);
}