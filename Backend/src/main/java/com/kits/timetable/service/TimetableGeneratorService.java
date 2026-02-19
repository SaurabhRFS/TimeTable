package com.kits.timetable.service;

import com.kits.timetable.dto.TimetableResponse;
import com.kits.timetable.entity.*;
import com.kits.timetable.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class TimetableGeneratorService {

    @Autowired private WorkloadRepository workloadRepository;
    @Autowired private TimeSlotRepository timeSlotRepository;
    @Autowired private RoomRepository roomRepository;
    @Autowired private TimetableRepository timetableRepository;

    public TimetableResponse generateTimetable(String dept, int sem, boolean force) {
        List<String> warnings = new ArrayList<>();
        List<TimetableEntry> proposedSchedule = new ArrayList<>();

        List<Workload> workloads = workloadRepository.findByDepartmentAndSemester(dept, sem);
        
        // 1. SEPARATE LABS AND THEORY
        List<Workload> labWorkloads = new ArrayList<>();
        List<Workload> theoryWorkloads = new ArrayList<>();
        
        for (Workload w : workloads) {
            if (w.getBatch().equals("ALL")) theoryWorkloads.add(w);
            else labWorkloads.add(w);
        }

        List<TimeSlot> lectureSlots = timeSlotRepository.findAll().stream()
                .filter(slot -> slot.getCategory().equals("LECTURE")).toList();
        List<Room> allRooms = roomRepository.findAll();

        // 2. SCHEDULE LABS FIRST (WITH STRICT ZONING)
        for (Workload lab : labWorkloads) {
            int needed = lab.getSubject().getWeeklyLabCount();
            int duration = lab.getSubject().getLabDuration();
            if (duration <= 0) duration = 2; // Failsafe
            
            int scheduled = scheduleLabWithParallelSync(lab, needed, duration, lectureSlots, allRooms, proposedSchedule);
            if (scheduled < needed) {
                warnings.add("Failed to schedule Lab: " + lab.getSubject().getAlias() + " (Sec " + lab.getSection() + ", Batch " + lab.getBatch() + ")");
            }
        }

        // 3. SCHEDULE THEORY AROUND THE LABS
        for (Workload theory : theoryWorkloads) {
            int scheduled = scheduleTheory(theory, theory.getSubject().getWeeklyLectureCount(), lectureSlots, allRooms, proposedSchedule);
            if (scheduled < theory.getSubject().getWeeklyLectureCount()) {
                warnings.add("Failed to schedule Theory: " + theory.getSubject().getAlias() + " (Sec " + theory.getSection() + ")");
            }
        }

        if (!warnings.isEmpty() && !force) {
            return new TimetableResponse("WARNING", warnings, null);
        }

        timetableRepository.deleteByDepartmentAndSemester(dept, sem);
        timetableRepository.saveAll(proposedSchedule);
        
        return new TimetableResponse("SUCCESS", warnings, proposedSchedule);
    }

    // =========================================================================================
    // THE FIX 1: PARALLEL LAB SYNC & STRICT ZONING
    // =========================================================================================
    private int scheduleLabWithParallelSync(Workload w, int sessionsNeeded, int durationNeeded, 
                                            List<TimeSlot> slots, List<Room> rooms, List<TimetableEntry> schedule) {
        int scheduledCount = 0;
        List<String> weekdays = Arrays.asList("MON", "TUE", "WED", "THU", "FRI");

        // STRICT ZONING: Labs can ONLY start at these indices so they NEVER cross the 11:50 break.
        // Index 4 = 2:00 PM, Index 3 = 1:00 PM, Index 5 = 2:55 PM, Index 0 = 10:00 AM
        List<Integer> validStarts = Arrays.asList(4, 3, 5, 0); 

        for (int i = 0; i < sessionsNeeded; i++) {
            boolean placed = false;

            Optional<TimetableEntry> peerLab = schedule.stream()
                .filter(e -> e.getSection().equals(w.getSection()) && !e.getBatch().equals("ALL") && !e.getBatch().equals(w.getBatch()))
                .findFirst();

            if (peerLab.isPresent()) {
                String targetDay = peerLab.get().getDay();
                int targetSlotIndex = slots.indexOf(peerLab.get().getTimeSlot());
                
                if (targetSlotIndex != -1 && isTimeAndRoomFree(w, targetDay, slots, targetSlotIndex, durationNeeded, "LAB", rooms, schedule) != null) {
                    assignEntry(w, targetDay, slots, targetSlotIndex, durationNeeded, "LAB", rooms, schedule);
                    scheduledCount++;
                    continue; 
                }
            }

            Collections.shuffle(weekdays);
            for (String day : weekdays) {
                if (placed) break;
                
                for (int sIndex : validStarts) {
                    if (sIndex > slots.size() - durationNeeded) continue;
                    
                    if (isTimeAndRoomFree(w, day, slots, sIndex, durationNeeded, "LAB", rooms, schedule) != null) {
                        assignEntry(w, day, slots, sIndex, durationNeeded, "LAB", rooms, schedule);
                        scheduledCount++;
                        placed = true;
                        break;
                    }
                }
            }
        }
        return scheduledCount;
    }

    // =========================================================================================
    // THE FIX 2: THEORY SPACING (Morning / Afternoon balance)
    // =========================================================================================
    private int scheduleTheory(Workload w, int sessionsNeeded, List<TimeSlot> slots, List<Room> rooms, List<TimetableEntry> schedule) {
        int scheduledCount = 0;
        List<String> weekdays = Arrays.asList("MON", "TUE", "WED", "THU", "FRI", "SAT");

        for (int i = 0; i < sessionsNeeded; i++) {
            boolean placed = false;
            Collections.shuffle(weekdays);

            for (String day : weekdays) {
                if (placed) break;

                if (schedule.stream().anyMatch(e -> e.getDay().equals(day) && e.getSubject().getId().equals(w.getSubject().getId()) && e.getSection().equals(w.getSection()))) {
                    continue;
                }

                // RANDOMIZE SLOTS: This stops the algorithm from packing all theory classes into 
                // the morning, scattering them evenly across the 1st and 2nd half of the day.
                List<Integer> theoryStarts = Arrays.asList(0, 1, 2, 3, 4, 5, 6);
                Collections.shuffle(theoryStarts);

                for (int sIndex : theoryStarts) {
                    if (isTimeAndRoomFree(w, day, slots, sIndex, 1, "CLASSROOM", rooms, schedule) != null) {
                        assignEntry(w, day, slots, sIndex, 1, "CLASSROOM", rooms, schedule);
                        scheduledCount++;
                        placed = true;
                        break;
                    }
                }
            }
        }
        return scheduledCount;
    }

    // --- UTILITY METHODS ---

    private Room isTimeAndRoomFree(Workload w, String day, List<TimeSlot> slots, int startIndex, int duration, String roomType, List<Room> rooms, List<TimetableEntry> schedule) {
        for (int d = 0; d < duration; d++) {
            TimeSlot currentSlot = slots.get(startIndex + d);
            boolean conflict = schedule.stream().anyMatch(e -> 
                e.getDay().equals(day) && e.getTimeSlot().getId().equals(currentSlot.getId()) &&
                (e.getTeacher().getId().equals(w.getTeacher().getId()) || 
                (e.getSection().equals(w.getSection()) && (e.getBatch().equals("ALL") || w.getBatch().equals("ALL") || e.getBatch().equals(w.getBatch()))))
            );
            if (conflict) return null;
        }

        return rooms.stream()
            .filter(r -> r.getType().equals(roomType))
            .filter(r -> {
                if (roomType.equals("CLASSROOM")) {
                    if (w.getSection().equalsIgnoreCase("A") && !r.getRoomNumber().equals("267")) return false;
                    if (w.getSection().equalsIgnoreCase("B") && !r.getRoomNumber().equals("268")) return false;
                }
                return true;
            })
            .filter(r -> {
                for (int d = 0; d < duration; d++) {
                    TimeSlot currentSlot = slots.get(startIndex + d);
                    if (schedule.stream().anyMatch(e -> e.getDay().equals(day) && e.getTimeSlot().getId().equals(currentSlot.getId()) && e.getRoom().getId().equals(r.getId()))) {
                        return false;
                    }
                }
                return true;
            }).findFirst().orElse(null);
    }

    private void assignEntry(Workload w, String day, List<TimeSlot> slots, int startIndex, int duration, String roomType, List<Room> rooms, List<TimetableEntry> schedule) {
        Room room = isTimeAndRoomFree(w, day, slots, startIndex, duration, roomType, rooms, schedule);
        for (int d = 0; d < duration; d++) {
            TimetableEntry entry = new TimetableEntry();
            entry.setDepartment(w.getDepartment());
            entry.setSemester(w.getSemester());
            entry.setSection(w.getSection());
            entry.setBatch(w.getBatch());
            entry.setSubject(w.getSubject());
            entry.setTeacher(w.getTeacher());
            entry.setDay(day);
            entry.setTimeSlot(slots.get(startIndex + d));
            entry.setRoom(room);
            schedule.add(entry);
        }
    }
}







// package com.kits.timetable.service;

// import com.kits.timetable.dto.TimetableResponse;
// import com.kits.timetable.entity.*;
// import com.kits.timetable.repository.*;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;

// import java.time.LocalTime;
// import java.util.ArrayList;
// import java.util.Arrays;
// import java.util.Collections;
// import java.util.List;
// import java.util.Optional;

// @Service
// public class TimetableGeneratorService {

//     @Autowired private WorkloadRepository workloadRepository;
//     @Autowired private TimeSlotRepository timeSlotRepository;
//     @Autowired private RoomRepository roomRepository;
//     @Autowired private TimetableRepository timetableRepository;

//     public TimetableResponse generateTimetable(String dept, int sem, boolean force) {
//         List<String> warnings = new ArrayList<>();
//         List<TimetableEntry> proposedSchedule = new ArrayList<>();

//         List<Workload> workloads = workloadRepository.findByDepartmentAndSemester(dept, sem);
        
//         // 1. SEPARATE LABS AND THEORY
//         List<Workload> labWorkloads = new ArrayList<>();
//         List<Workload> theoryWorkloads = new ArrayList<>();
        
//         for (Workload w : workloads) {
//             if (w.getBatch().equals("ALL")) theoryWorkloads.add(w);
//             else labWorkloads.add(w);
//         }

//         List<TimeSlot> lectureSlots = timeSlotRepository.findAll().stream()
//                 .filter(slot -> slot.getCategory().equals("LECTURE")).toList();
//         List<Room> allRooms = roomRepository.findAll();

//         // 2. SCHEDULE LABS FIRST (WITH PARALLEL SYNCING)
//         for (Workload lab : labWorkloads) {
//             int needed = lab.getSubject().getWeeklyLabCount();
//             int duration = lab.getSubject().getLabDuration();
//             if (duration <= 0) duration = 2; // Failsafe if UI left it at 0
            
//             int scheduled = scheduleLabWithParallelSync(lab, needed, duration, lectureSlots, allRooms, proposedSchedule);
//             if (scheduled < needed) {
//                 warnings.add("Failed to schedule Lab: " + lab.getSubject().getAlias() + " (Sec " + lab.getSection() + ", Batch " + lab.getBatch() + ")");
//             }
//         }

//         // 3. SCHEDULE THEORY AROUND THE LABS
//         for (Workload theory : theoryWorkloads) {
//             int scheduled = scheduleTheory(theory, theory.getSubject().getWeeklyLectureCount(), lectureSlots, allRooms, proposedSchedule);
//             if (scheduled < theory.getSubject().getWeeklyLectureCount()) {
//                 warnings.add("Failed to schedule Theory: " + theory.getSubject().getAlias() + " (Sec " + theory.getSection() + ")");
//             }
//         }

//         if (!warnings.isEmpty() && !force) {
//             return new TimetableResponse("WARNING", warnings, null);
//         }

//         timetableRepository.deleteByDepartmentAndSemester(dept, sem);
//         timetableRepository.saveAll(proposedSchedule);
        
//         return new TimetableResponse("SUCCESS", warnings, proposedSchedule);
//     }

//     // =========================================================================================
//     // REVERSE-ENGINEERED LOGIC 1: PARALLEL LAB SYNC
//     // =========================================================================================
//     private int scheduleLabWithParallelSync(Workload w, int sessionsNeeded, int durationNeeded, 
//                                             List<TimeSlot> slots, List<Room> rooms, List<TimetableEntry> schedule) {
//         int scheduledCount = 0;
//         List<String> weekdays = Arrays.asList("MON", "TUE", "WED", "THU", "FRI");

//         for (int i = 0; i < sessionsNeeded; i++) {
//             boolean placed = false;

//             // STRATEGY A: Hunt for a "Peer Lab" (e.g., If Batch 1 is already scheduled, put Batch 2 at the EXACT same time)
//             Optional<TimetableEntry> peerLab = schedule.stream()
//                 .filter(e -> e.getSection().equals(w.getSection()) && !e.getBatch().equals("ALL") && !e.getBatch().equals(w.getBatch()))
//                 .findFirst();

//             if (peerLab.isPresent()) {
//                 String targetDay = peerLab.get().getDay();
//                 int targetSlotIndex = slots.indexOf(peerLab.get().getTimeSlot());
                
//                 if (targetSlotIndex != -1 && isTimeAndRoomFree(w, targetDay, slots, targetSlotIndex, durationNeeded, "LAB", rooms, schedule) != null) {
//                     assignEntry(w, targetDay, slots, targetSlotIndex, durationNeeded, "LAB", rooms, schedule);
//                     scheduledCount++;
//                     continue; // Successfully synced perfectly in parallel!
//                 }
//             }

//             // STRATEGY B: Find a fresh Afternoon block (Reverse-engineering the PDF preference)
//             Collections.shuffle(weekdays);
//             for (String day : weekdays) {
//                 if (placed) break;
//                 // Favor indices 3 or 4 (Post-Lunch slots) to mimic your college PDF exactly
//                 for (int sIndex = 0; sIndex <= slots.size() - durationNeeded; sIndex++) {
//                     if (crossesLunch(slots, sIndex, durationNeeded)) continue;
                    
//                     if (isTimeAndRoomFree(w, day, slots, sIndex, durationNeeded, "LAB", rooms, schedule) != null) {
//                         assignEntry(w, day, slots, sIndex, durationNeeded, "LAB", rooms, schedule);
//                         scheduledCount++;
//                         placed = true;
//                         break;
//                     }
//                 }
//             }
//         }
//         return scheduledCount;
//     }

//     // =========================================================================================
//     // REVERSE-ENGINEERED LOGIC 2: THEORY SPACING
//     // =========================================================================================
//     private int scheduleTheory(Workload w, int sessionsNeeded, List<TimeSlot> slots, List<Room> rooms, List<TimetableEntry> schedule) {
//         int scheduledCount = 0;
//         List<String> weekdays = Arrays.asList("MON", "TUE", "WED", "THU", "FRI", "SAT");

//         for (int i = 0; i < sessionsNeeded; i++) {
//             boolean placed = false;
//             Collections.shuffle(weekdays);

//             for (String day : weekdays) {
//                 if (placed) break;

//                 // CONSTRAINT: 1 Theory class per subject per day
//                 if (schedule.stream().anyMatch(e -> e.getDay().equals(day) && e.getSubject().getId().equals(w.getSubject().getId()) && e.getSection().equals(w.getSection()))) {
//                     continue;
//                 }

//                 for (int sIndex = 0; sIndex < slots.size(); sIndex++) {
//                     if (isTimeAndRoomFree(w, day, slots, sIndex, 1, "CLASSROOM", rooms, schedule) != null) {
//                         assignEntry(w, day, slots, sIndex, 1, "CLASSROOM", rooms, schedule);
//                         scheduledCount++;
//                         placed = true;
//                         break;
//                     }
//                 }
//             }
//         }
//         return scheduledCount;
//     }

//     // --- UTILITY METHODS ---

//     private Room isTimeAndRoomFree(Workload w, String day, List<TimeSlot> slots, int startIndex, int duration, String roomType, List<Room> rooms, List<TimetableEntry> schedule) {
//         // 1. Check if Teacher or Section is busy
//         for (int d = 0; d < duration; d++) {
//             TimeSlot currentSlot = slots.get(startIndex + d);
//             boolean conflict = schedule.stream().anyMatch(e -> 
//                 e.getDay().equals(day) && e.getTimeSlot().getId().equals(currentSlot.getId()) &&
//                 (e.getTeacher().getId().equals(w.getTeacher().getId()) || 
//                 (e.getSection().equals(w.getSection()) && (e.getBatch().equals("ALL") || w.getBatch().equals("ALL") || e.getBatch().equals(w.getBatch()))))
//             );
//             if (conflict) return null;
//         }

//         // 2. Find a free room
//         return rooms.stream()
//             .filter(r -> r.getType().equals(roomType))
//             .filter(r -> {
//                 if (roomType.equals("CLASSROOM")) {
//                     if (w.getSection().equalsIgnoreCase("A") && !r.getRoomNumber().equals("267")) return false;
//                     if (w.getSection().equalsIgnoreCase("B") && !r.getRoomNumber().equals("268")) return false;
//                 }
//                 return true;
//             })
//             .filter(r -> {
//                 for (int d = 0; d < duration; d++) {
//                     TimeSlot currentSlot = slots.get(startIndex + d);
//                     if (schedule.stream().anyMatch(e -> e.getDay().equals(day) && e.getTimeSlot().getId().equals(currentSlot.getId()) && e.getRoom().getId().equals(r.getId()))) {
//                         return false;
//                     }
//                 }
//                 return true;
//             }).findFirst().orElse(null);
//     }

//     private void assignEntry(Workload w, String day, List<TimeSlot> slots, int startIndex, int duration, String roomType, List<Room> rooms, List<TimetableEntry> schedule) {
//         Room room = isTimeAndRoomFree(w, day, slots, startIndex, duration, roomType, rooms, schedule);
//         for (int d = 0; d < duration; d++) {
//             TimetableEntry entry = new TimetableEntry();
//             entry.setDepartment(w.getDepartment());
//             entry.setSemester(w.getSemester());
//             entry.setSection(w.getSection());
//             entry.setBatch(w.getBatch());
//             entry.setSubject(w.getSubject());
//             entry.setTeacher(w.getTeacher());
//             entry.setDay(day);
//             entry.setTimeSlot(slots.get(startIndex + d));
//             entry.setRoom(room);
//             schedule.add(entry);
//         }
//     }

//     private boolean crossesLunch(List<TimeSlot> slots, int startIndex, int durationNeeded) {
//         if (durationNeeded <= 1) return false;
//         LocalTime start = slots.get(startIndex).getStartTime();
//         LocalTime end = slots.get(startIndex + durationNeeded - 1).getEndTime();
//         return start.isBefore(LocalTime.of(12, 55)) && end.isAfter(LocalTime.of(13, 35));
//     }
// }