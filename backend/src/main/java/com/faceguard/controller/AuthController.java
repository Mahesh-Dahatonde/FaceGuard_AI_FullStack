package com.faceguard.controller;

import com.faceguard.model.User;
import com.faceguard.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {
    private final UserRepository users;
    private final PasswordEncoder encoder;

    public AuthController(UserRepository users, PasswordEncoder encoder) {
        this.users = users;
        this.encoder = encoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String name = body.getOrDefault("name", "").trim();
        String email = body.getOrDefault("email", "").trim().toLowerCase();
        String password = body.getOrDefault("password", "");

        if (name.isBlank() || email.isBlank() || password.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("message", "Enter valid details. Password must be 6+ characters."));
        }
        if (users.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already registered."));
        }

        User user = users.save(new User(name, email, encoder.encode(password)));
        return ResponseEntity.ok(Map.of("message", "Registration successful", "userId", user.getId()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "").trim().toLowerCase();
        String password = body.getOrDefault("password", "");

        return users.findByEmail(email)
            .filter(u -> encoder.matches(password, u.getPassword()))
            .map(u -> ResponseEntity.ok(Map.of(
                "message", "Login successful",
                "userId", u.getId(),
                "name", u.getName(),
                "email", u.getEmail()
            )))
            .orElseGet(() -> ResponseEntity.status(401).body(Map.of("message", "Invalid email or password.")));
    }
}
