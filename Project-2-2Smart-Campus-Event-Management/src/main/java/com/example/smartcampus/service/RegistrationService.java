package com.example.smartcampus.service;

import com.example.smartcampus.entity.Event;
import com.example.smartcampus.entity.Registration;
import com.example.smartcampus.entity.User;
import com.example.smartcampus.repository.EventRepository;
import com.example.smartcampus.repository.RegistrationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RegistrationService {
    private final RegistrationRepository registrationRepository;
    private final EventRepository eventRepository;

    public RegistrationService(RegistrationRepository registrationRepository, EventRepository eventRepository){
        this.registrationRepository = registrationRepository;
        this.eventRepository = eventRepository;
    }

    public Registration register(User user, Event event) throws IllegalStateException{
        // check duplicate
        if(registrationRepository.findByUserAndEvent(user,event).isPresent()){
            throw new IllegalStateException("User already registered for this event");
        }
        if(event.getCapacity() <= 0) throw new IllegalStateException("Event is full");
        // reduce capacity
        event.setCapacity(event.getCapacity() - 1);
        eventRepository.save(event);
        Registration r = new Registration();
        r.setUser(user);
        r.setEvent(event);
        return registrationRepository.save(r);
    }

    public List<Registration> findByUser(User user){ return registrationRepository.findByUser(user); }
}
