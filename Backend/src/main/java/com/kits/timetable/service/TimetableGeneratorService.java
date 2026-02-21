package com.kits.timetable.service;

import com.kits.timetable.dto.TimetableResponse;
import com.kits.timetable.entity.*;
import com.kits.timetable.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class TimetableGeneratorService {

    @Autowired private TimetableRepository timetableRepository;
    @Autowired private TimeSlotRepository timeSlotRepository;
    @Autowired private WorkloadRepository workloadRepository;
    @Autowired private RoomRepository roomRepository;

    private final List<String> MAIN_DAYS = Arrays.asList("MON", "TUE", "WED", "THU", "FRI");
    private final List<String> WEEKEND = Arrays.asList("SAT");

    public TimetableResponse generateTimetable(String dept, int sem, boolean force) {
        return null; 
    }

    @Transactional
    public void generateTheoryTimetable(String dept, int sem) {
        
        List<String> sections = Arrays.asList("A", "B");
        Room defaultRoom = roomRepository.findAll().get(0);

        for (String currentSection : sections) {
            List<TimetableEntry> existingGrid = timetableRepository.findByDepartmentAndSemesterAndSection(dept, sem, currentSection);
            
            List<Workload> theoryWorkloads = workloadRepository.findByDepartmentAndSemesterAndSection(dept, sem, currentSection)
                    .stream()
                    .filter(w -> w.getSubject().getSubjectType().equals("THEORY"))
                    .collect(Collectors.toList());

            for (Workload workload : theoryWorkloads) {
                Subject subject = workload.getSubject();
                Teacher teacher = workload.getTeacher();
                
                int requiredLectures = subject.getWeeklyLectureCount();
                
                long initialScheduledCount = existingGrid.stream()
                        .filter(e -> e.getSubject().getId().equals(subject.getId()))
                        .count();
                int currentlyScheduled = (int) initialScheduledCount;

                // Pass 1: Strict constraint (Max 1 per day)
                while (currentlyScheduled < requiredLectures) {
                    boolean placed = attemptToPlaceSubject(subject, teacher, dept, sem, currentSection, defaultRoom, existingGrid, MAIN_DAYS, 1);
                    if (!placed) {
                        placed = attemptToPlaceSubject(subject, teacher, dept, sem, currentSection, defaultRoom, existingGrid, WEEKEND, 1);
                    }

                    if (placed) {
                        currentlyScheduled++;
                    } else {
                        break; 
                    }
                }

                // Pass 2: Relaxed constraint (Max 2 per day) for remaining lectures
                while (currentlyScheduled < requiredLectures) {
                    boolean placed = attemptToPlaceSubject(subject, teacher, dept, sem, currentSection, defaultRoom, existingGrid, MAIN_DAYS, 2);
                    if (!placed) {
                        placed = attemptToPlaceSubject(subject, teacher, dept, sem, currentSection, defaultRoom, existingGrid, WEEKEND, 2);
                    }

                    if (placed) {
                        currentlyScheduled++;
                    } else {
                        System.out.println("Could not find a valid slot for " + subject.getAlias() + " in Section " + currentSection);
                        break; 
                    }
                }
            }
        }
    }

    private boolean attemptToPlaceSubject(Subject subject, Teacher teacher, String dept, int sem, String section, 
                                          Room room, List<TimetableEntry> grid, List<String> daysToTry, int maxPerDay) {
        
        List<String> shuffledDays = new ArrayList<>(daysToTry);
        Collections.shuffle(shuffledDays); // Keep days randomized so Section A and B don't look identical

        long totalScheduledThisWeek = grid.stream()
                .filter(e -> e.getSubject().getId().equals(subject.getId()))
                .count();

        List<Integer> allSlotsToTry = new ArrayList<>();

        // STRICT SLOT ORDERING (No Random Shuffling)
        if (totalScheduledThisWeek % 2 == 0) {
            // 1st, 3rd, 5th classes prioritize mornings strictly: 10-11, then 11-12, then 12-1. If all full, go to afternoon.
            allSlotsToTry.addAll(Arrays.asList(1, 2, 3, 5, 6));
        } else {
            // 2nd, 4th, 6th classes prioritize afternoons strictly: 2-3, then 3-4. If all full, go to morning.
            allSlotsToTry.addAll(Arrays.asList(5, 6, 1, 2, 3));
        }

        for (String day : shuffledDays) {
            long countToday = grid.stream()
                    .filter(e -> e.getDay().equals(day) && e.getSubject().getId().equals(subject.getId()))
                    .count();

            if (countToday >= maxPerDay) continue; 

            for (Integer slotOrder : allSlotsToTry) {
                boolean isSectionBusy = grid.stream().anyMatch(e -> e.getDay().equals(day) && e.getTimeSlot().getSlotOrder() == slotOrder);
                boolean isTeacherBusy = timetableRepository.existsByTeacherAndDayAndTimeSlot_SlotOrder(teacher, day, slotOrder);

                if (!isSectionBusy && !isTeacherBusy) {
                    TimeSlot slotToAssign = timeSlotRepository.findAll().stream()
                            .filter(ts -> ts.getSlotOrder() == slotOrder).findFirst().get();

                    TimetableEntry newEntry = new TimetableEntry();
                    newEntry.setDay(day);
                    newEntry.setDepartment(dept);
                    newEntry.setSemester(sem);
                    newEntry.setSection(section);
                    newEntry.setBatch("ALL");
                    newEntry.setTimeSlot(slotToAssign);
                    newEntry.setSubject(subject);
                    newEntry.setTeacher(teacher);
                    newEntry.setRoom(room);

                    timetableRepository.save(newEntry);
                    grid.add(newEntry); 
                    
                    return true; 
                }
            }
        }
        return false; 
    }
}