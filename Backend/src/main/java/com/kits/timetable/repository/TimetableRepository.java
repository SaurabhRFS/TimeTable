package com.kits.timetable.repository;

import com.kits.timetable.entity.TimetableEntry;
import com.kits.timetable.entity.Teacher;
import com.kits.timetable.entity.Room;
import com.kits.timetable.entity.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface TimetableRepository extends JpaRepository<TimetableEntry, Long> {

    List<TimetableEntry> findByDepartmentAndSemesterAndSection(String department, int semester, String section);

    // --- NEW: Command to clean the slate for ALL sections before generating ---
    @Transactional
    void deleteByDepartmentAndSemester(String department, int semester);

    boolean existsByTeacherAndDayAndTimeSlot(Teacher teacher, String day, TimeSlot timeSlot);
    boolean existsByRoomAndDayAndTimeSlot(Room room, String day, TimeSlot timeSlot);
    boolean existsByDepartmentAndSemesterAndSectionAndDayAndTimeSlot(
        String department, int semester, String section, String day, TimeSlot timeSlot
    );
}