package com.kits.timetable.controller;

import com.kits.timetable.entity.Subject;
import com.kits.timetable.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    @Autowired
    private SubjectRepository subjectRepository;

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

    // --- FULL EDIT FEATURE ---
    @PutMapping("/{id}")
    public Subject updateSubject(@PathVariable Long id, @RequestBody Subject updatedData) {
        return subjectRepository.findById(id).map(subject -> {
            subject.setName(updatedData.getName());
            subject.setCode(updatedData.getCode());
            subject.setAlias(updatedData.getAlias());
            subject.setWeeklyLectureCount(updatedData.getWeeklyLectureCount());
            subject.setWeeklyLabCount(updatedData.getWeeklyLabCount());
            subject.setLabDuration(updatedData.getLabDuration());
            
            // Save custom batch settings
            subject.setHasBatches(updatedData.getHasBatches());
            subject.setBatchesPerSection(updatedData.getBatchesPerSection());
            
            return subjectRepository.save(subject);
        }).orElseThrow(() -> new RuntimeException("Subject not found"));
    }

    // --- FULL DELETE FEATURE ---
    @DeleteMapping("/{id}")
    public void deleteSubject(@PathVariable Long id) {
        subjectRepository.deleteById(id);
    }
}