package com.pgm.pgm_Backend.config;

import com.pgm.pgm_Backend.model.SuperAdmin;
import com.pgm.pgm_Backend.repository.SuperAdminRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

        @Bean
        CommandLineRunner initDatabase(SuperAdminRepository superAdminRepository) {
                return args -> {
                        // Always delete and recreate SuperAdmin
                        superAdminRepository.findByEmail("tsaritservices@gmail.com")
                                        .ifPresent(superAdminRepository::delete);

                        // Create SuperAdmin with email only (OTP-based authentication)
                        SuperAdmin superAdmin = new SuperAdmin();
                        superAdmin.setEmail("tsaritservices@gmail.com");

                        superAdminRepository.save(superAdmin);

                        System.out.println("Super Admin created successfully!");
                        System.out.println("tsaritservices@gmail.com");
                        System.out.println("Authentication: OTP-based (Email verification only)");

                };
        }
}
