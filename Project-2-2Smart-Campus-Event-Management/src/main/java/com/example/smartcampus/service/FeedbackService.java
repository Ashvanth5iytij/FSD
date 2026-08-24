package com.example.smartcampus.service;

import com.example.smartcampus.entity.Feedback;
import com.example.smartcampus.entity.Event;
import com.example.smartcampus.repository.FeedbackRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FeedbackService {
    private final FeedbackRepository feedbackRepository;

    public FeedbackService(FeedbackRepository feedbackRepository){ this.feedbackRepository = feedbackRepository; }

    public Feedback submit(Feedback f){ return feedbackRepository.save(f); }
    public List<Feedback> findByEvent(Event e){ return feedbackRepository.findByEvent(e); }
}
