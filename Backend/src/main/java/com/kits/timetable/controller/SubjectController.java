package com.kits.timetable.controller;

import com.kits.timetable.entity.Subject;
import com.kits.timetable.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
// @CrossOrigin(origins = "http://localhost:5173")
public class SubjectController {

    @Autowired
    private SubjectRepository subjectRepository;

    // 1. Get All (For debug)
    @GetMapping
    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    // 2. Get specific semester subjects (The one we will actually use)
    // URL Example: /api/subjects/filter?dept=CT&sem=6
    @GetMapping("/filter")
    public List<Subject> getSubjectsBySem(
            @RequestParam String dept, 
            @RequestParam int sem) {
        return subjectRepository.findByDepartmentAndSemester(dept, sem);
    }

    // 3. Add a Subject
    @PostMapping
    public Subject createSubject(@RequestBody Subject subject) {
        return subjectRepository.save(subject);
    }
}