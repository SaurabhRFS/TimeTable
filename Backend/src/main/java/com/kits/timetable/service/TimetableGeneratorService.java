package com.kits.timetable.service;

import com.kits.timetable.dto.TimetableResponse;
import com.kits.timetable.entity.*;
import com.kits.timetable.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class TimetableGeneratorService {

    @Autowired private WorkloadRepository workloadRepository;
    @Autowired private TimeSlotRepository timeSlotRepository;
    @Autowired private RoomRepository roomRepository;
    @Autowired private TimetableRepository timetableRepository;

    private final String[] DAYS = {"MON", "TUE", "WED", "THU", "FRI", "SAT"};

    public TimetableResponse generateTimetable(String dept, int sem, boolean force) {
        List<String> warnings = new ArrayList<>();
        List<TimetableEntry> proposedSchedule = new ArrayList<>();

        // 1. Fetch Resources
        List<Workload> workloads = workloadRepository.findByDepartmentAndSemester(dept, sem);
        List<TimeSlot> lectureSlots = timeSlotRepository.findAll().stream()
                .filter(slot -> slot.getCategory().equals("LECTURE")).toList();
        List<Room> allRooms = roomRepository.findAll();

        // 2. The Core Algorithm (Simulation)
        for (Workload w : workloads) {
            Subject sub = w.getSubject();
            
            if (w.getBatch().equals("ALL")) {
                int scheduled = scheduleBlocks(w, sub.getWeeklyLectureCount(), 1, "CLASSROOM", lectureSlots, allRooms, proposedSchedule);
                if (scheduled < sub.getWeeklyLectureCount()) {
                    warnings.add("Failed to schedule " + (sub.getWeeklyLectureCount() - scheduled) + " theory lectures for " + sub.getAlias() + " (Section " + w.getSection() + "). Teacher " + w.getTeacher().getAlias() + " might be busy.");
                }
            } else {
                int scheduled = scheduleBlocks(w, w.getSubject().getWeeklyLabCount(), sub.getLabDuration(), "LAB", lectureSlots, allRooms, proposedSchedule);
                if (scheduled < sub.getWeeklyLabCount()) {
                    warnings.add("Failed to schedule Lab for " + sub.getAlias() + " (Batch " + w.getBatch() + "). Need " + sub.getLabDuration() + " consecutive slots.");
                }
            }
        }

        // 3. The Warning Check
        if (!warnings.isEmpty() && !force) {
            return new TimetableResponse("WARNING", warnings, null);
        }

        // 4. FIX: Delete ALL old entries for this Department and Semester (Cleans Section A, B, C...)
        timetableRepository.deleteByDepartmentAndSemester(dept, sem);

        // Save the fresh data
        timetableRepository.saveAll(proposedSchedule);
        return new TimetableResponse("SUCCESS", warnings, proposedSchedule);
    }


    // ---------------- HELPER METHOD ----------------
    private int scheduleBlocks(
            Workload w,
            int sessionsNeeded,
            int durationNeeded,
            String roomType,
            List<TimeSlot> slots,
            List<Room> rooms,
            List<TimetableEntry> currentSchedule
    ) {

        int scheduledCount = 0;

        for (int i = 0; i < sessionsNeeded; i++) {

            boolean placed = false;

            for (String day : DAYS) {

                if (placed) break;

                for (int sIndex = 0; sIndex <= slots.size() - durationNeeded; sIndex++) {

                    final int startIndex = sIndex;

                    // 1. Check Teacher & Section availability
                    boolean timeIsFree = true;

                    for (int d = 0; d < durationNeeded; d++) {
                        if (isConflict(
                                currentSchedule,
                                w,
                                day,
                                slots.get(startIndex + d)
                        )) {
                            timeIsFree = false;
                            break;
                        }
                    }

                    if (!timeIsFree) continue;

                    // 2. Find free room for full duration
                    Room freeRoom = rooms.stream()
                            .filter(r -> r.getType().equals(roomType))
                            .filter(r -> {
                                for (int d = 0; d < durationNeeded; d++) {
                                    if (!isRoomFree(
                                            currentSchedule,
                                            r,
                                            day,
                                            slots.get(startIndex + d)
                                    )) {
                                        return false;
                                    }
                                }
                                return true;
                            })
                            .findFirst()
                            .orElse(null);

                    if (freeRoom != null) {

                        // 3. Assign consecutive slots
                        for (int d = 0; d < durationNeeded; d++) {

                            TimetableEntry entry = new TimetableEntry();

                            entry.setDepartment(w.getDepartment());
                            entry.setSemester(w.getSemester());
                            entry.setSection(w.getSection());
                            entry.setBatch(w.getBatch());
                            entry.setSubject(w.getSubject());
                            entry.setTeacher(w.getTeacher());
                            entry.setDay(day);
                            entry.setTimeSlot(slots.get(startIndex + d));
                            entry.setRoom(freeRoom);

                            currentSchedule.add(entry);
                        }

                        scheduledCount++;
                        placed = true;
                        break;
                    }
                }
            }
        }

        return scheduledCount;
    }


    // Teacher or Section conflict check
    private boolean isConflict(
            List<TimetableEntry> schedule,
            Workload w,
            String day,
            TimeSlot slot
    ) {

        return schedule.stream().anyMatch(e ->
                e.getDay().equals(day)
                        && e.getTimeSlot().getId().equals(slot.getId())
                        && (
                        e.getTeacher().getId().equals(w.getTeacher().getId())
                                ||
                                (
                                        e.getSection().equals(w.getSection())
                                                &&
                                                (
                                                        e.getBatch().equals("ALL")
                                                                || w.getBatch().equals("ALL")
                                                                || e.getBatch().equals(w.getBatch())
                                                )
                                )
                )
        );
    }

    // Room availability check
    private boolean isRoomFree(
            List<TimetableEntry> schedule,
            Room room,
            String day,
            TimeSlot slot
    ) {

        return schedule.stream().noneMatch(e ->
                e.getDay().equals(day)
                        && e.getTimeSlot().getId().equals(slot.getId())
                        && e.getRoom().getId().equals(room.getId())
        );
    }
}