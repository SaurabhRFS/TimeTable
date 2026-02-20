package com.kits.timetable.controller;

import com.kits.timetable.entity.TimetableEntry;
import com.kits.timetable.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/timetable")
@CrossOrigin(origins = "*") // Allows React to talk to Spring Boot
public class TimetableController {

    @Autowired private TimetableRepository timetableRepository;
    @Autowired private SubjectRepository subjectRepository;
    @Autowired private TeacherRepository teacherRepository;
    @Autowired private TimeSlotRepository timeSlotRepository;
    @Autowired private RoomRepository roomRepository;

    @GetMapping
    public List<TimetableEntry> getTimetable(
            @RequestParam String dept, 
            @RequestParam int sem, 
            @RequestParam String section) {
        return timetableRepository.findByDepartmentAndSemesterAndSection(dept, sem, section);
    }

    @PostMapping("/manual")
    public TimetableEntry addManualEntry(@RequestBody TimetableEntry entry) {
        
        // 1. Fetch the FULL entities from the database using the IDs sent by React
        // This stops Hibernate from throwing "Detached Entity" or "Foreign Key" errors!
        if (entry.getSubject() != null && entry.getSubject().getId() != null) {
            entry.setSubject(subjectRepository.findById(entry.getSubject().getId()).orElseThrow());
        }
        
        if (entry.getTeacher() != null && entry.getTeacher().getId() != null) {
            entry.setTeacher(teacherRepository.findById(entry.getTeacher().getId()).orElseThrow());
        }
        
        // Safety check for TimeSlot mismatch
        if (entry.getTimeSlot() != null && entry.getTimeSlot().getId() != null) {
            entry.setTimeSlot(timeSlotRepository.findById(entry.getTimeSlot().getId()).orElseThrow());
        }

        // 2. The "Ghost Room" Fix: Automatically assign the first available room in the DB
        if (roomRepository.count() > 0) {
            entry.setRoom(roomRepository.findAll().get(0));
        }

        // Now save it cleanly!
        return timetableRepository.save(entry);
    }

    @DeleteMapping("/{id}")
    public void deleteEntry(@PathVariable Long id) {
        timetableRepository.deleteById(id);
    }
}