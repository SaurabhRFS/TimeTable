package com.kits.timetable.repository;

import com.kits.timetable.entity.Workload;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WorkloadRepository extends JpaRepository<Workload, Long> {
    List<Workload> findByDepartmentAndSemester(String department, int semester);
    
    // UPDATED: Now checks Subject + Section + Batch
    Workload findBySubjectIdAndSectionAndBatch(Long subjectId, String section, String batch);
}