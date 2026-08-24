package com.example.smartcampus.service;

import com.example.smartcampus.entity.Event;
import com.example.smartcampus.repository.EventRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class EventService {
    private final EventRepository eventRepository;

    public EventService(EventRepository eventRepository){ this.eventRepository = eventRepository; }

    public Event create(Event e){ return eventRepository.save(e); }
    public Optional<Event> get(Long id){ return eventRepository.findById(id); }
    public List<Event> listAll(){ return eventRepository.findAll(); }
    public List<Event> findByDepartment(String dept){ return eventRepository.findByDepartment(dept); }
    public List<Event> findByType(String type){ return eventRepository.findByType(type); }
    public List<Event> findByDate(LocalDate date){ return eventRepository.findByDate(date); }
    public void delete(Long id){ eventRepository.deleteById(id); }
}
