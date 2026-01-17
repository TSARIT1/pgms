package com.pgm.pgm_Backend;

import com.pgm.pgm_Backend.model.Admin;
import com.pgm.pgm_Backend.repository.AdminRepository;
import com.pgm.pgm_Backend.service.DynamicTableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Utility to create tables for all existing admins
 * This runs once on application startup
 */
@Component
public class TableInitializer implements CommandLineRunner {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private DynamicTableService dynamicTableService;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("=== Checking for admins without tables ===");

        List<Admin> allAdmins = adminRepository.findAll();

        for (Admin admin : allAdmins) {
            try {
                System.out.println("Creating tables for admin ID: " + admin.getId() + " (" + admin.getName() + ")");
                dynamicTableService.createAdminTables(admin.getId());
                System.out.println("✓ Tables created/verified for admin ID: " + admin.getId());
            } catch (Exception e) {
                System.err.println("✗ Failed to create tables for admin ID: " + admin.getId() + " - " + e.getMessage());
            }
        }

        System.out.println("=== Table initialization complete ===");
    }
}
