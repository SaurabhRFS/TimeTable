package com.kits.timetable.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

@RestController // Tells Spring "This class handles web requests"
@CrossOrigin(origins = "http://localhost:5173") // ALLOWS React to talk to us!
public class HelloController {

    @GetMapping("/api/hello") // When someone visits /api/hello...
    public String sayHello() {
        return "Connected to KITS Backend Successfully!";
    }
}