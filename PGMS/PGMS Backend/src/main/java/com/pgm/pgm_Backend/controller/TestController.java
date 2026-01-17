package com.pgm.pgm_Backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin("*")
public class TestController {

    @Autowired
    private com.pgm.pgm_Backend.repository.SuperAdminRepository superAdminRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @GetMapping("/superadmin-check")
    public ResponseEntity<?> checkSuperAdmin(@RequestParam String email) {
        Map<String, Object> response = new HashMap<>();

        var superAdminOpt = superAdminRepository.findByEmail(email);

        if (superAdminOpt.isPresent()) {
            var superAdmin = superAdminOpt.get();
            response.put("found", true);
            response.put("email", superAdmin.getEmail());
            response.put("authMethod", "OTP-based (no password)");
            response.put("createdAt", superAdmin.getCreatedAt());

        } else {
            response.put("found", false);
            response.put("message", "SuperAdmin not found with email: " + email);
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/test-password")
    public ResponseEntity<?> testPassword(@RequestParam String plainPassword) {
        Map<String, Object> response = new HashMap<>();

        String encoded = passwordEncoder.encode(plainPassword);
        response.put("plainPassword", plainPassword);
        response.put("encodedPassword", encoded);
        response.put("matches", passwordEncoder.matches(plainPassword, encoded));
        response.put("note", "This is for Admin password testing only. SuperAdmin uses OTP-based auth.");

        return ResponseEntity.ok(response);
    }

    // Note: Password-related SuperAdmin test endpoints removed
    // SuperAdmin now uses OTP-based authentication only
}
