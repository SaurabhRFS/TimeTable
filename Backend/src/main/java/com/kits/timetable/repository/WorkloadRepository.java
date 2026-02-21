package com.kits.timetable.repository;

import com.kits.timetable.entity.Workload;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkloadRepository extends JpaRepository<Workload, Long> {
    
    // Used by WorkloadController
    List<Workload> findByDepartmentAndSemester(String department, int semester);
    
    // Used by WorkloadController
    Workload findBySubjectIdAndSectionAndBatch(Long subjectId, String section, String batch);
    
    // Required by TimetableGeneratorService for auto-fill
    List<Workload> findByDepartmentAndSemesterAndSection(String department, int semester, String section);
}