package com.kits.timetable.repository;

import com.kits.timetable.entity.TimetableEntry;
import com.kits.timetable.entity.Teacher;
import com.kits.timetable.entity.Room;
import com.kits.timetable.entity.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TimetableRepository extends JpaRepository<TimetableEntry, Long> {

    // 1. Fetch the final Timetable for the Frontend (e.g., CT Sem 6 Section A)
    List<TimetableEntry> findByDepartmentAndSemesterAndSection(String department, int semester, String section);

    // 2. The "Teacher Conflict" Check
    // "Check if Teacher X is busy on Monday at 10:00"
    boolean existsByTeacherAndDayAndTimeSlot(Teacher teacher, String day, TimeSlot timeSlot);

    // 3. The "Room Conflict" Check
    // "Check if Room 264 is occupied on Monday at 10:00"
    boolean existsByRoomAndDayAndTimeSlot(Room room, String day, TimeSlot timeSlot);

    // 4. The "Student Conflict" Check
    // "Check if Section A already has a class at this time" (Prevents double booking students)
    boolean existsByDepartmentAndSemesterAndSectionAndDayAndTimeSlot(
        String department, int semester, String section, String day, TimeSlot timeSlot
    );
}