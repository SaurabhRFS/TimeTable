package com.kits.timetable.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration; 
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration // 1. Tells Spring: "Load this file before the app starts"
public class WebConfig implements WebMvcConfigurer {

    // 2. Inject the value from application.properties
    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // 3. Apply this rule to ALL endpoints (/**)
        registry.addMapping("/**")
                .allowedOrigins(frontendUrl) // Only allow our specific Frontend
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Allow these actions
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}