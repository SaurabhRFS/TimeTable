package com.kits.timetable.repository;

import com.kits.timetable.entity.Teacher;
import com.kits.timetable.entity.TimetableEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimetableRepository extends JpaRepository<TimetableEntry, Long> {
    
    // Used to fetch the grid
    List<TimetableEntry> findByDepartmentAndSemesterAndSection(String department, int semester, String section);

    // Required by TimetableGeneratorService to prevent teacher clashes
    boolean existsByTeacherAndDayAndTimeSlot_SlotOrder(Teacher teacher, String day, Integer slotOrder);
}