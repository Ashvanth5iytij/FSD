package com.example.smartcampus.config;

import com.example.smartcampus.entity.Event;
import com.example.smartcampus.entity.User;
import com.example.smartcampus.repository.EventRepository;
import com.example.smartcampus.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalTime;

@Configuration
public class DataInitializer {
    @Bean
    CommandLineRunner init(UserRepository userRepository, EventRepository eventRepository, PasswordEncoder passwordEncoder){
        return args -> {
            if(userRepository.count() == 0){
                User admin = new User();
                admin.setName("Admin User");
                admin.setEmail("admin@campus.com");
                admin.setPassword(passwordEncoder.encode("adminpass"));
                admin.setDepartment("Admin");
                admin.setRole("ADMIN");
                userRepository.save(admin);

                User student = new User();
                student.setName("John Student");
                student.setEmail("john@campus.com");
                student.setPassword(passwordEncoder.encode("studentpass"));
                student.setDepartment("CSE");
                student.setRole("STUDENT");
                userRepository.save(student);
            }

            if(eventRepository.count() == 0){
                Event e1 = new Event();
                e1.setTitle("AI Workshop");
                e1.setDescription("Introductory AI workshop for students.");
                e1.setDate(LocalDate.now().plusDays(10));
                e1.setTime(LocalTime.of(10,0));
                e1.setVenue("Lab 1");
                e1.setDepartment("CSE");
                e1.setType("Workshop");
                e1.setCapacity(50);
                eventRepository.save(e1);

                Event e2 = new Event();
                e2.setTitle("Tech Talk: Cloud Computing");
                e2.setDescription("Seminar on cloud technologies.");
                e2.setDate(LocalDate.now().plusDays(20));
                e2.setTime(LocalTime.of(14,0));
                e2.setVenue("Auditorium");
                e2.setDepartment("IT");
                e2.setType("Seminar");
                e2.setCapacity(200);
                eventRepository.save(e2);
            }
        };
    }
}
