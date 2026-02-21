package com.kits.timetable.controller;

import com.kits.timetable.entity.Subject;
import com.kits.timetable.repository.SubjectRepository;
import com.kits.timetable.repository.TimetableRepository;
import com.kits.timetable.repository.WorkloadRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private WorkloadRepository workloadRepository;

    @Autowired
    private TimetableRepository timetableRepository;

    @GetMapping
    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    @GetMapping("/filter")
    public List<Subject> getSubjectsBySem(@RequestParam String dept, @RequestParam int sem) {
        return subjectRepository.findByDepartmentAndSemester(dept, sem);
    }

    @PostMapping
    public Subject createSubject(@RequestBody Subject subject) {
        return subjectRepository.save(subject);
    }

    @PutMapping("/{id}")
    public Subject updateSubject(@PathVariable Long id, @RequestBody Subject updatedData) {
        return subjectRepository.findById(id).map(subject -> {
            
            // The previously existing fields
            subject.setName(updatedData.getName());
            subject.setCode(updatedData.getCode());
            subject.setAlias(updatedData.getAlias());
            subject.setWeeklyLectureCount(updatedData.getWeeklyLectureCount());
            subject.setWeeklyLabCount(updatedData.getWeeklyLabCount());
            subject.setLabDuration(updatedData.getLabDuration());
            subject.setHasBatches(updatedData.getHasBatches());
            subject.setBatchesPerSection(updatedData.getBatchesPerSection());
            
            subject.setSubjectType(updatedData.getSubjectType());
            subject.setDepartment(updatedData.getDepartment());
            subject.setSemester(updatedData.getSemester());
            
            return subjectRepository.save(subject);
        }).orElseThrow(() -> new RuntimeException("Subject not found"));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteSubject(@PathVariable Long id) {
        try {
            Subject subject = subjectRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Subject not found"));
            
            timetableRepository.deleteBySubject(subject);
            workloadRepository.deleteBySubject(subject);
            subjectRepository.delete(subject);
            
            return ResponseEntity.ok().body(Map.of("message", "Subject deleted successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}