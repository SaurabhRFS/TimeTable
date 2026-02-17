package com.kits.timetable.repository;

import com.kits.timetable.entity.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long> {
    
    // We ALWAYS want slots sorted by time (10:00, then 11:00...)
    // Spring Data JPA does this magic automatically with "OrderBy..."
    List<TimeSlot> findAllByOrderBySlotOrderAsc();
}