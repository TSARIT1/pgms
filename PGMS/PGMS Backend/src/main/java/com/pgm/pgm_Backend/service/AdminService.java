package com.pgm.pgm_Backend.service;

import com.pgm.pgm_Backend.model.Admin;

public interface AdminService {
    Admin register(Admin admin);

    Admin login(String email, String password);

    Admin getById(Long id);

    Admin updateAdmin(Long id, Admin admin);

    void deleteAdmin(Long id);

    // Profile management
    Admin getProfile();

    Admin updateProfile(Admin admin);

    String uploadPhoto(org.springframework.web.multipart.MultipartFile file);

    void deletePhoto();

    String uploadHostelPhoto(org.springframework.web.multipart.MultipartFile file);

    // Password reset
    Admin getByEmail(String email);

    Admin resetPassword(String email, String newPassword);

    // Get all admins
    java.util.List<Admin> getAllAdmins();

    // Account freeze/unfreeze
    Admin freezeAccount(Long adminId);

    Admin unfreezeAccount(Long adminId);
}
