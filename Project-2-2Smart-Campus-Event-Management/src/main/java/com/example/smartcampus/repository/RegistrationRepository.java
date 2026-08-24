package com.example.smartcampus.repository;

import com.example.smartcampus.entity.Registration;
import com.example.smartcampus.entity.User;
import com.example.smartcampus.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    List<Registration> findByUser(User user);
    List<Registration> findByEvent(Event event);
    Optional<Registration> findByUserAndEvent(User user, Event event);
}
