package com.kits.timetable.controller;

import com.kits.timetable.dto.TimetableResponse;
import com.kits.timetable.service.TimetableGeneratorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/generate")
public class GeneratorController {

    @Autowired
    private TimetableGeneratorService generatorService;

    @PostMapping
    public TimetableResponse generate(
            @RequestParam String dept, 
            @RequestParam int sem, 
            @RequestParam(defaultValue = "false") boolean force) {
        
        return generatorService.generateTimetable(dept, sem, force);
    }
}