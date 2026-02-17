package com.kits.timetable.controller;

import com.kits.timetable.entity.Subject;
import com.kits.timetable.entity.Teacher;
import com.kits.timetable.entity.Workload;
import com.kits.timetable.repository.SubjectRepository;
import com.kits.timetable.repository.TeacherRepository;
import com.kits.timetable.repository.WorkloadRepository;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workload")
public class WorkloadController {

    @Autowired
    private WorkloadRepository workloadRepository;
    
    @Autowired
    private SubjectRepository subjectRepository;
    
    @Autowired
    private TeacherRepository teacherRepository;

    @GetMapping
    public List<Workload> getWorkload(@RequestParam String dept, @RequestParam int sem) {
        return workloadRepository.findByDepartmentAndSemester(dept, sem);
    }

    // 1. DTO: A simple class to hold the incoming JSON data
    // This matches EXACTLY what the frontend sends
    @Data
    static class WorkloadRequest {
        private String department;
        private int semester;
        private String section;
        private Long subjectId;
        private Long teacherId;
    }

    // 2. The Fixed "Assign" Method
    @PostMapping
    public Workload assignTeacher(@RequestBody WorkloadRequest request) {
        // Find the Real Subject and Teacher from DB
        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Subject not found"));
        
        Teacher teacher = teacherRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        // Check if assignment already exists, if so, update it
        Workload existing = workloadRepository.findBySubjectIdAndSection(request.getSubjectId(), request.getSection());
        
        Workload workload;
        if (existing != null) {
            workload = existing; // Update existing row
        } else {
            workload = new Workload(); // Create new row
        }

        // Set Values
        workload.setDepartment(request.getDepartment());
        workload.setSemester(request.getSemester());
        workload.setSection(request.getSection());
        workload.setSubject(subject);
        workload.setTeacher(teacher);

        return workloadRepository.save(workload);
    }
}