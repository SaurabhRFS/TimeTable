package com.kits.timetable.config;

import com.kits.timetable.entity.Room;
import com.kits.timetable.entity.TimeSlot;
import com.kits.timetable.repository.RoomRepository;
import com.kits.timetable.repository.TimeSlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalTime; 

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private TimeSlotRepository timeSlotRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Override
    public void run(String... args) throws Exception {
        
        // ONLY insert if the database is 100% empty.
        if (timeSlotRepository.count() == 0) {
            System.out.println("Seeding Time Slots safely...");
            
            createTimeSlot(1, "10:00", "11:00", "LECTURE");
            createTimeSlot(2, "11:00", "12:00", "LECTURE");
            createTimeSlot(3, "12:00", "13:00", "LECTURE");
            createTimeSlot(4, "13:00", "14:00", "BREAK");
            createTimeSlot(5, "14:00", "15:00", "LECTURE");
            createTimeSlot(6, "15:00", "16:00", "LECTURE");
            createTimeSlot(7, "16:00", "17:00", "LECTURE");
        }

        if (roomRepository.count() == 0) {
            System.out.println("Seeding Ghost Room safely...");
            Room defaultRoom = new Room();
            
            
            // If your Room entity uses a different field (like setRoomId), change this line!
            defaultRoom.setRoomNumber("Default"); 
            roomRepository.save(defaultRoom);
        }
    }

    private void createTimeSlot(int order, String start, String end, String category) {
        TimeSlot slot = new TimeSlot();
        slot.setSlotOrder(order);
        
       
        slot.setStartTime(LocalTime.parse(start));
        slot.setEndTime(LocalTime.parse(end));
        
        slot.setCategory(category);
        timeSlotRepository.save(slot);
    }
}