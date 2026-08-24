package com.example.smartcampus.repository;

import com.example.smartcampus.entity.Feedback;
import com.example.smartcampus.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByEvent(Event event);
}
