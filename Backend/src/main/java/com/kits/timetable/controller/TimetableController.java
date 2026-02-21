package com.kits.timetable.controller;

import com.kits.timetable.entity.TimeSlot;
import com.kits.timetable.entity.TimetableEntry;
import com.kits.timetable.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/timetable")
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
    public ResponseEntity<?> addManualEntry(@RequestBody Map<String, Object> payload) {
        
        try {
            TimetableEntry entry = new TimetableEntry();
            
            entry.setDay(String.valueOf(payload.get("day")));
            entry.setDepartment(String.valueOf(payload.get("department")));
            entry.setSemester(Integer.parseInt(String.valueOf(payload.get("semester"))));
            entry.setSection(String.valueOf(payload.get("section")));
            entry.setBatch(String.valueOf(payload.get("batch")));
            
            // 🔥 THE FIX: Search by 'slotOrder' instead of 'ID'. 
            // This makes the app immune to MySQL auto-increment changes!
            int requestedSlotOrder = Integer.parseInt(String.valueOf(payload.get("timeSlotId")));
            TimeSlot matchedSlot = timeSlotRepository.findAll().stream()
                    .filter(slot -> slot.getSlotOrder() == requestedSlotOrder)
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Could not find TimeSlot for order: " + requestedSlotOrder));
            
            entry.setTimeSlot(matchedSlot);
            
            // Fetch remaining entities
            Long subjectId = Long.parseLong(String.valueOf(payload.get("subjectId")));
            entry.setSubject(subjectRepository.findById(subjectId).orElseThrow());
            
            Long teacherId = Long.parseLong(String.valueOf(payload.get("teacherId")));
            entry.setTeacher(teacherRepository.findById(teacherId).orElseThrow());
            
            if (roomRepository.count() > 0) {
                entry.setRoom(roomRepository.findAll().get(0));
            }

            timetableRepository.save(entry);

            return ResponseEntity.ok().body(Map.of("message", "Success"));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEntry(@PathVariable Long id) {
        timetableRepository.deleteById(id);
        return ResponseEntity.ok().body(Map.of("message", "Deleted"));
    }
}