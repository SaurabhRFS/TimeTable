package com.kits.timetable.repository;

import com.kits.timetable.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    
    // Algorithm Helper: "Give me all Labs for CT Department"
    List<Room> findByTypeAndDepartment(String type, String department);
}