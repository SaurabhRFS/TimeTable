package com.kits.timetable.dto;

import com.kits.timetable.entity.TimetableEntry;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class TimetableResponse {
    private String status; // "SUCCESS" or "WARNING"
    private List<String> warnings; // e.g., ["Could not schedule DWM for Sec A"]
    private List<TimetableEntry> entries; // The generated timetable (if saved)
}