package com.kits.timetable.controller;

import com.kits.timetable.entity.TimetableEntry;
import com.kits.timetable.repository.TimetableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/timetable")
public class TimetableController {

    @Autowired
    private TimetableRepository timetableRepository;

    @GetMapping
    public List<TimetableEntry> getTimetable(
            @RequestParam String dept, 
            @RequestParam int sem, 
            @RequestParam String section) {
        
        // Fetches the saved schedule for a specific class (e.g., CT, Sem 6, Section A)
        return timetableRepository.findByDepartmentAndSemesterAndSection(dept, sem, section);
    }
}