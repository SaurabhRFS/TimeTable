package com.kits.timetable.config;

import com.kits.timetable.entity.Room;
import com.kits.timetable.entity.TimeSlot;
import com.kits.timetable.repository.RoomRepository;
import com.kits.timetable.repository.TimeSlotRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalTime;
import java.util.Arrays;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(TimeSlotRepository timeSlotRepository, RoomRepository roomRepository) {
        return args -> {
            // 1. Load Time Slots (Bell Timings)
            if (timeSlotRepository.count() == 0) {
                timeSlotRepository.saveAll(Arrays.asList(
                    new TimeSlot(null, LocalTime.of(10, 0), LocalTime.of(10, 55), 1, "LECTURE"),
                    new TimeSlot(null, LocalTime.of(10, 55), LocalTime.of(11, 50), 2, "LECTURE"),
                    new TimeSlot(null, LocalTime.of(11, 50), LocalTime.of(12, 0), 3, "BREAK"),
                    new TimeSlot(null, LocalTime.of(12, 0), LocalTime.of(12, 55), 4, "LECTURE"),
                    new TimeSlot(null, LocalTime.of(12, 55), LocalTime.of(13, 35), 5, "LUNCH"),
                    new TimeSlot(null, LocalTime.of(13, 35), LocalTime.of(14, 30), 6, "LECTURE"),
                    new TimeSlot(null, LocalTime.of(14, 30), LocalTime.of(15, 25), 7, "LECTURE"),
                    new TimeSlot(null, LocalTime.of(15, 25), LocalTime.of(15, 35), 8, "BREAK"),
                    new TimeSlot(null, LocalTime.of(15, 35), LocalTime.of(16, 30), 9, "LECTURE")
                ));
                System.out.println("✅ Time Slots initialized!");
            }

            // 2. Load Rooms (From your PDF)
            if (roomRepository.count() == 0) {
                roomRepository.saveAll(Arrays.asList(
                    // Theory Rooms (Page 1 & 2 of PDF)
                    new Room(null, "267", 60, "CLASSROOM", "CT"), // Section A Base Room
                    new Room(null, "268", 60, "CLASSROOM", "CT"), // Section B Base Room
                    
                    // Lab Rooms (From PDF Timetable)
                    new Room(null, "264", 30, "LAB", "CT"), // Used for CO-LAB
                    new Room(null, "206", 30, "LAB", "CT")  // Used for DWM-LAB
                ));
                System.out.println("✅ Rooms initialized from PDF Data!");
            }
        };
    }
}