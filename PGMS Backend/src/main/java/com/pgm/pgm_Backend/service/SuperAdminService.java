package com.pgm.pgm_Backend.service;

import com.pgm.pgm_Backend.model.SuperAdmin;

public interface SuperAdminService {
    SuperAdmin register(SuperAdmin superAdmin);

    SuperAdmin getById(Long id);

    // Profile management
    SuperAdmin getProfile();

    SuperAdmin updateProfile(SuperAdmin superAdmin);

    String uploadPhoto(org.springframework.web.multipart.MultipartFile file);

    void deletePhoto();

    // Email lookup for OTP-based authentication
    java.util.Optional<SuperAdmin> findByEmail(String email);
}
