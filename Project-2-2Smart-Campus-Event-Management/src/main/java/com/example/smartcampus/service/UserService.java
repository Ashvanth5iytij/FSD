package com.example.smartcampus.service;

import com.example.smartcampus.entity.User;
import com.example.smartcampus.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User createStudent(User u){
        u.setPassword(passwordEncoder.encode(u.getPassword()));
        u.setRole("STUDENT");
        return userRepository.save(u);
    }

    public Optional<User> findByEmail(String email){
        return userRepository.findByEmail(email);
    }
}
