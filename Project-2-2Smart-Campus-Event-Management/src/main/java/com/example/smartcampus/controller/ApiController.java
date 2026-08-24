package com.example.smartcampus.controller;

import com.example.smartcampus.entity.Event;
import com.example.smartcampus.entity.Feedback;
import com.example.smartcampus.entity.Registration;
import com.example.smartcampus.entity.User;
import com.example.smartcampus.repository.UserRepository;
import com.example.smartcampus.service.EventService;
import com.example.smartcampus.service.FeedbackService;
import com.example.smartcampus.service.RegistrationService;
import com.example.smartcampus.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class ApiController {
    private final EventService eventService;
    private final UserService userService;
    private final RegistrationService registrationService;
    private final FeedbackService feedbackService;
    private final UserRepository userRepository;

    public ApiController(EventService eventService, UserService userService, RegistrationService registrationService, FeedbackService feedbackService, UserRepository userRepository){
        this.eventService = eventService; this.userService = userService; this.registrationService = registrationService; this.feedbackService = feedbackService; this.userRepository = userRepository;
    }

    @GetMapping("/events")
    public List<Event> listEvents(){ return eventService.listAll(); }

    @GetMapping("/events/{id}")
    public ResponseEntity<Event> getEvent(@PathVariable Long id){
        return eventService.get(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/events/{id}/register")
    public ResponseEntity<?> register(@PathVariable Long id, @RequestParam Long userId){
        Optional<Event> e = eventService.get(id);
        if(e.isEmpty()) return ResponseEntity.badRequest().body("Event not found");
        Optional<User> u = userService.findByEmail(userRepository.findById(userId).map(User::getEmail).orElse(""));
        if(u.isEmpty()) return ResponseEntity.badRequest().body("User not found");
        try{
            Registration r = registrationService.register(u.get(), e.get());
            return ResponseEntity.ok(r);
        }catch(Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PostMapping("/feedback")
    public ResponseEntity<?> feedback(@RequestBody Feedback f){
        Feedback saved = feedbackService.submit(f);
        return ResponseEntity.ok(saved);
    }
}
