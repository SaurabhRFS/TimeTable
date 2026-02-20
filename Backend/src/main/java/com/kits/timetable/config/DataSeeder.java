package com.kits.timetable.config;

import com.kits.timetable.entity.Room;
import com.kits.timetable.entity.TimeSlot;
import com.kits.timetable.repository.RoomRepository;
import com.kits.timetable.repository.TimeSlotRepository;
import com.kits.timetable.repository.TimetableRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.LocalTime;
import java.util.Arrays;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(TimeSlotRepository timeSlotRepository, 
                                   RoomRepository roomRepository, 
                                   TimetableRepository timetableRepository,
                                   JdbcTemplate jdbcTemplate) { // Added JdbcTemplate
        return args -> {

            // 🛠️ NO-DATA-LOSS FIX: Safely drop old columns that are causing the 500 error
            try { jdbcTemplate.execute("ALTER TABLE subjects DROP COLUMN type"); } catch (Exception e) {}
            try { jdbcTemplate.execute("ALTER TABLE subjects DROP COLUMN required_weekly_hours"); } catch (Exception e) {}
            try { jdbcTemplate.execute("ALTER TABLE subjects DROP COLUMN is_global_elective"); } catch (Exception e) {}
            
            // 1. SAFELY WIPE ONLY THE TIMETABLE AND TIMES (Keeps Subjects and Teachers safe)
            timetableRepository.deleteAll();
            timeSlotRepository.deleteAll();

            // 2. INSERT CLEAN 1-HOUR TIME SLOTS
            timeSlotRepository.saveAll(Arrays.asList(
                new TimeSlot(null, LocalTime.of(10, 0), LocalTime.of(11, 0), 1, "LECTURE"),
                new TimeSlot(null, LocalTime.of(11, 0), LocalTime.of(12, 0), 2, "LECTURE"),
                new TimeSlot(null, LocalTime.of(12, 0), LocalTime.of(13, 0), 3, "LECTURE"),
                new TimeSlot(null, LocalTime.of(13, 0), LocalTime.of(14, 0), 4, "BREAK"),
                new TimeSlot(null, LocalTime.of(14, 0), LocalTime.of(15, 0), 5, "LECTURE"),
                new TimeSlot(null, LocalTime.of(15, 0), LocalTime.of(16, 0), 6, "LECTURE"),
                new TimeSlot(null, LocalTime.of(16, 0), LocalTime.of(17, 0), 7, "LECTURE")
            ));

            // 3. KEEP ROOMS INTACT
            if (roomRepository.count() == 0) {
                roomRepository.saveAll(Arrays.asList(
                    new Room(null, "267", 60, "CLASSROOM", "CT"),
                    new Room(null, "268", 60, "CLASSROOM", "CT"),
                    new Room(null, "264", 30, "LAB", "CT"),
                    new Room(null, "206", 30, "LAB", "CT")
                ));
            }
        };
    }
}