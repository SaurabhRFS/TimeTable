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

    // GET workload by department & semester
    @GetMapping
    public List<Workload> getWorkload(
            @RequestParam String dept,
            @RequestParam int sem
    ) {
        return workloadRepository.findByDepartmentAndSemester(dept, sem);
    }

    // DTO class to receive JSON from frontend
    @Data
    static class WorkloadRequest {
        private String department;
        private int semester;
        private String section;
        private String batch;
        private Long subjectId;
        private Long teacherId;
    }

    // ASSIGN / UPDATE teacher workload
    @PostMapping
    public Workload assignTeacher(@RequestBody WorkloadRequest request) {

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        Teacher teacher = teacherRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        Workload existing = workloadRepository
                .findBySubjectIdAndSectionAndBatch(
                        request.getSubjectId(),
                        request.getSection(),
                        request.getBatch()
                );

        Workload workload = (existing != null) ? existing : new Workload();

        workload.setDepartment(request.getDepartment());
        workload.setSemester(request.getSemester());
        workload.setSection(request.getSection());
        workload.setBatch(request.getBatch());
        workload.setSubject(subject);
        workload.setTeacher(teacher);

        return workloadRepository.save(workload);
    }

    // NEW: UNASSIGN (DELETE) teacher workload
    @DeleteMapping
    public void unassignTeacher(
            @RequestParam Long subjectId,
            @RequestParam String section,
            @RequestParam String batch
    ) {

        Workload existing = workloadRepository
                .findBySubjectIdAndSectionAndBatch(subjectId, section, batch);

        if (existing != null) {
            workloadRepository.delete(existing);
        }
    }
}