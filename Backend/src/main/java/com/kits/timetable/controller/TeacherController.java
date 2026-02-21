package com.kits.timetable.controller;

import com.kits.timetable.entity.Teacher;
import com.kits.timetable.repository.TeacherRepository;
import com.kits.timetable.repository.TimetableRepository;
import com.kits.timetable.repository.WorkloadRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teachers")
public class TeacherController {

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private WorkloadRepository workloadRepository;

    @Autowired
    private TimetableRepository timetableRepository;

    @GetMapping
    public List<Teacher> getAllTeachers() {
        return teacherRepository.findAll();
    }

    @PostMapping
    public Teacher addTeacher(@RequestBody Teacher teacher) {
        return teacherRepository.save(teacher);
    }

    @PutMapping("/{id}")
    public Teacher updateTeacher(@PathVariable Long id, @RequestBody Teacher updatedData) {
        return teacherRepository.findById(id).map(teacher -> {
            teacher.setName(updatedData.getName());
            teacher.setDepartment(updatedData.getDepartment());
            teacher.setAlias(updatedData.getAlias());
            return teacherRepository.save(teacher);
        }).orElseThrow(() -> new RuntimeException("Teacher not found"));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteTeacher(@PathVariable Long id) {
        try {
            Teacher teacher = teacherRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));
            
            timetableRepository.deleteByTeacher(teacher);
            workloadRepository.deleteByTeacher(teacher);
            teacherRepository.delete(teacher);
            
            return ResponseEntity.ok().body(Map.of("message", "Teacher deleted successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}