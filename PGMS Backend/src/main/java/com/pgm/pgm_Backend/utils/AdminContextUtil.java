package com.pgm.pgm_Backend.utils;

import com.pgm.pgm_Backend.model.Admin;
import com.pgm.pgm_Backend.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class AdminContextUtil {

    @Autowired
    private AdminRepository adminRepository;

    /**
     * Get the currently logged-in admin's ID from the security context
     * 
     * @return Admin ID
     * @throws RuntimeException if admin is not found
     */
    public Long getCurrentAdminId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("No authenticated user found");
        }

        String email = authentication.getName();
        Admin admin = adminRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Admin not found with email: " + email));

        return admin.getId();
    }

    /**
     * Get the currently logged-in admin entity
     * 
     * @return Admin entity
     * @throws RuntimeException if admin is not found
     */
    public Admin getCurrentAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("No authenticated user found");
        }

        String email = authentication.getName();
        return adminRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Admin not found with email: " + email));
    }
}
