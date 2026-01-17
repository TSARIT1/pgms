package com.pgm.pgm_Backend.service.impl;

import com.pgm.pgm_Backend.model.Admin;
import com.pgm.pgm_Backend.model.SuperAdmin;
import com.pgm.pgm_Backend.repository.AdminRepository;
import com.pgm.pgm_Backend.repository.SuperAdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private SuperAdminRepository superAdminRepository;

    @Override
    public UserDetails loadUserByUsername(String emailOrPhone) throws UsernameNotFoundException {
        System.out.println("=== CustomUserDetailsService.loadUserByUsername ===");
        System.out.println("Looking for: " + emailOrPhone);

        // Determine if input is email or phone number
        boolean isEmail = emailOrPhone.contains("@");
        boolean isPhone = emailOrPhone.matches("\\d{10}"); // 10 digit phone number

        System.out.println("Is Email: " + isEmail + ", Is Phone: " + isPhone);

        // First, try to find in Admin table (PG/Hostel owners)
        Optional<Admin> adminOpt = Optional.empty();

        if (isEmail) {
            adminOpt = adminRepository.findByEmail(emailOrPhone);
        } else if (isPhone) {
            adminOpt = adminRepository.findByPhone(emailOrPhone);
        }

        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            System.out.println("Found in ADMIN table");
            System.out.println("Password hash: " + admin.getPassword());
            return new org.springframework.security.core.userdetails.User(
                    admin.getEmail(), // Always use email as username
                    admin.getPassword(),
                    new ArrayList<>());
        }

        System.out.println("Not found in ADMIN table, checking SUPER_ADMIN table...");

        // If not found in Admin, try SuperAdmin table (only by email)
        if (isEmail) {
            Optional<SuperAdmin> superAdminOpt = superAdminRepository.findByEmail(emailOrPhone);
            if (superAdminOpt.isPresent()) {
                SuperAdmin superAdmin = superAdminOpt.get();
                System.out.println("Found in SUPER_ADMIN table");
                System.out.println("Authentication: OTP-based (no password)");
                // SuperAdmin uses OTP-based authentication, so return empty password
                return new org.springframework.security.core.userdetails.User(
                        superAdmin.getEmail(),
                        "", // Empty password - SuperAdmin uses OTP-only authentication
                        new ArrayList<>());
            }
        }

        System.out.println("NOT FOUND in either table!");
        // If not found in either table, throw exception
        throw new UsernameNotFoundException(
                "User not found with " + (isEmail ? "email" : "phone") + ": " + emailOrPhone);
    }
}
