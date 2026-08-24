package com.example.smartcampus.repository;

import com.example.smartcampus.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByDepartment(String department);
    List<Event> findByType(String type);
    List<Event> findByDate(LocalDate date);
}
