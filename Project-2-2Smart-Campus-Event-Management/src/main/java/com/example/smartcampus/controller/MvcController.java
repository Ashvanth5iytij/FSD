package com.example.smartcampus.controller;

import com.example.smartcampus.entity.Event;
import com.example.smartcampus.entity.User;
import com.example.smartcampus.service.EventService;
import com.example.smartcampus.service.RegistrationService;
import com.example.smartcampus.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@Controller
public class MvcController {
    private final EventService eventService;
    private final UserService userService;
    private final RegistrationService registrationService;

    public MvcController(EventService eventService, UserService userService, RegistrationService registrationService){
        this.eventService = eventService;
        this.userService = userService;
        this.registrationService = registrationService;
    }

    @GetMapping({"/","/index"})
    public String index(Model model){
        model.addAttribute("events", eventService.listAll());
        return "index";
    }

    @GetMapping("/events/{id}")
    public String eventDetails(@PathVariable Long id, Model model){
        Optional<Event> e = eventService.get(id);
        if(e.isEmpty()) return "error";
        model.addAttribute("event", e.get());
        return "event-details";
    }

    @GetMapping("/login")
    public String login(){ return "login"; }

}
