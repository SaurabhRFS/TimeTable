package com.kits.timetable.repository;

import com.kits.timetable.entity.Workload;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WorkloadRepository extends JpaRepository<Workload, Long> {
    
    // "Give me the config for CT Sem 6"
    List<Workload> findByDepartmentAndSemester(String department, int semester);
    
    // "Who teaches DWM to Section A?" (Used by Algorithm later)
    Workload findBySubjectIdAndSection(Long subjectId, String section);
}