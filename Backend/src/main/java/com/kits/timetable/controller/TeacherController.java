package com.kits.timetable.controller;

import com.kits.timetable.entity.Teacher;
import com.kits.timetable.repository.TeacherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teachers")
public class TeacherController {

    @Autowired
    private TeacherRepository teacherRepository;

    @GetMapping
    public List<Teacher> getAllTeachers() {
        return teacherRepository.findAll();
    }

    @PostMapping
    public Teacher addTeacher(@RequestBody Teacher teacher) {
        return teacherRepository.save(teacher);
    }

    // --- ADD THIS: EDIT FEATURE ---
    @PutMapping("/{id}")
    public Teacher updateTeacher(@PathVariable Long id, @RequestBody Teacher updatedData) {
        return teacherRepository.findById(id).map(teacher -> {
            teacher.setName(updatedData.getName());
            teacher.setDepartment(updatedData.getDepartment());
            teacher.setAlias(updatedData.getAlias());
            return teacherRepository.save(teacher);
        }).orElseThrow(() -> new RuntimeException("Teacher not found"));
    }

    // --- ADD THIS: DELETE FEATURE ---
    @DeleteMapping("/{id}")
    public void deleteTeacher(@PathVariable Long id) {
        teacherRepository.deleteById(id);
    }
}