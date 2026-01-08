package com.pgm.pgm_Backend.service.impl;

import com.pgm.pgm_Backend.exception.ResourceNotFoundException;
import com.pgm.pgm_Backend.model.Admin;
import com.pgm.pgm_Backend.repository.AdminRepository;
import com.pgm.pgm_Backend.repository.SubscriptionPlanRepository;
import com.pgm.pgm_Backend.service.AdminService;
import com.pgm.pgm_Backend.service.EmailService;
import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final AdminRepository adminRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final com.pgm.pgm_Backend.repository.SubscriptionPlanRepository subscriptionPlanRepository;
    
    

    public AdminServiceImpl(AdminRepository adminRepository, PasswordEncoder passwordEncoder, EmailService emailService,
			SubscriptionPlanRepository subscriptionPlanRepository) {
		super();
		this.adminRepository = adminRepository;
		this.passwordEncoder = passwordEncoder;
		this.emailService = emailService;
		this.subscriptionPlanRepository = subscriptionPlanRepository;
	}

	@Override
    public Admin register(Admin admin) {
        if (adminRepository.existsByEmail(admin.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }
        admin.setPassword(passwordEncoder.encode(admin.getPassword()));

        // Handle subscription plan if provided
        if (admin.getPlanId() != null) {
            try {
                com.pgm.pgm_Backend.model.SubscriptionPlan plan = subscriptionPlanRepository.findById(admin.getPlanId())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Subscription plan not found with id: " + admin.getPlanId()));

                // Set plan name
                admin.setSubscriptionPlan(plan.getName());

                // Only activate subscription immediately if the plan is FREE (price = 0)
                if (plan.getPrice() != null && plan.getPrice().equals(0.0)) {
                    // Free plan - activate immediately
                    java.time.LocalDateTime startDate = java.time.LocalDateTime.now();
                    java.time.LocalDateTime endDate;

                    if ("DAY".equalsIgnoreCase(plan.getDurationType())) {
                        endDate = startDate.plusDays(plan.getDuration());
                    } else if ("MONTH".equalsIgnoreCase(plan.getDurationType())) {
                        endDate = startDate.plusMonths(plan.getDuration());
                    } else {
                        // Default to 1 month if duration type is unknown
                        endDate = startDate.plusMonths(1);
                    }

                    admin.setSubscriptionStartDate(startDate);
                    admin.setSubscriptionEndDate(endDate);

                    System.out.println("========================================");
                    System.out.println("FREE Subscription Plan Activated:");
                    System.out.println("Plan: " + plan.getName());
                    System.out.println("Price: ₹0 (FREE)");
                    System.out.println("Duration: " + plan.getDuration() + " " + plan.getDurationType());
                    System.out.println("Start Date: " + startDate);
                    System.out.println("End Date: " + endDate);
                    System.out.println("========================================");
                } else {
                    // Paid plan - only store plan name, dates will be set after payment
                    System.out.println("========================================");
                    System.out.println("Paid Subscription Plan Selected:");
                    System.out.println("Plan: " + plan.getName());
                    System.out.println("Price: ₹" + plan.getPrice());
                    System.out.println("Status: Awaiting payment on dashboard");
                    System.out.println("========================================");
                }

            } catch (ResourceNotFoundException e) {
                // Log error but don't fail registration
                System.err.println("Failed to set subscription plan: " + e.getMessage());
            } catch (Exception e) {
                // Log any other errors but don't fail registration
                System.err.println("Unexpected error setting subscription plan: " + e.getMessage());
                e.printStackTrace();
            }
        }

        return adminRepository.save(admin);
    }

    @Override
    public Admin login(String email, String password) {
        Admin admin = adminRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with email: " + email));

        // Check if account is frozen
        if (admin.getIsFrozen() != null && admin.getIsFrozen()) {
            throw new IllegalArgumentException("Account is frozen. Please contact support.");
        }

        if (!passwordEncoder.matches(password, admin.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        return admin;
    }

    @Override
    public Admin getById(Long id) {
        return adminRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with id: " + id));
    }

    @Override
    public Admin updateAdmin(Long id, Admin adminDetails) {
        Admin admin = getById(id);

        if (adminDetails.getName() != null) {
            admin.setName(adminDetails.getName());
        }
        if (adminDetails.getPhone() != null) {
            admin.setPhone(adminDetails.getPhone());
        }
        if (adminDetails.getPassword() != null) {
            admin.setPassword(passwordEncoder.encode(adminDetails.getPassword()));
        }

        return adminRepository.save(admin);
    }

    @Override
    public void deleteAdmin(Long id) {
        Admin admin = getById(id);
        adminRepository.delete(admin);
    }

    @Override
    public Admin getProfile() {
        // Get the currently authenticated user's email from SecurityContext
        String email = org.springframework.security.core.context.SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return adminRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with email: " + email));
    }

    @Override
    public Admin updateProfile(Admin adminDetails) {
        Admin admin = getProfile();

        if (adminDetails.getName() != null) {
            admin.setName(adminDetails.getName());
        }
        // Only update email if it's different from current email
        if (adminDetails.getEmail() != null && !adminDetails.getEmail().equals(admin.getEmail())) {
            // Check if new email is already taken by another admin
            Optional<Admin> existingAdmin = adminRepository.findByEmail(adminDetails.getEmail());
            if (existingAdmin.isPresent() && !existingAdmin.get().getId().equals(admin.getId())) {
                throw new IllegalArgumentException("Email already in use");
            }
            admin.setEmail(adminDetails.getEmail());
        }
        if (adminDetails.getPhone() != null) {
            admin.setPhone(adminDetails.getPhone());
        }
        // Removed dateOfBirth field from update logic as per instruction
        if (adminDetails.getHostelAddress() != null) {
            admin.setHostelAddress(adminDetails.getHostelAddress());
        }
        if (adminDetails.getHostelName() != null) {
            admin.setHostelName(adminDetails.getHostelName());
        }
        if (adminDetails.getHostelPhotos() != null) {
            admin.setHostelPhotos(adminDetails.getHostelPhotos());
        }
        if (adminDetails.getLocationLink() != null) {
            admin.setLocationLink(adminDetails.getLocationLink());
        }
        if (adminDetails.getHostelType() != null) {
            admin.setHostelType(adminDetails.getHostelType());
        }
        if (adminDetails.getSubscriptionPlan() != null) {
            admin.setSubscriptionPlan(adminDetails.getSubscriptionPlan());
        }
        if (adminDetails.getSubscriptionStartDate() != null) {
            admin.setSubscriptionStartDate(adminDetails.getSubscriptionStartDate());
        }
        if (adminDetails.getSubscriptionEndDate() != null) {
            admin.setSubscriptionEndDate(adminDetails.getSubscriptionEndDate());
        }
        if (adminDetails.getPassword() != null && !adminDetails.getPassword().isEmpty()) {
            admin.setPassword(passwordEncoder.encode(adminDetails.getPassword()));
        }

        return adminRepository.save(admin);
    }

    @Override
    public String uploadPhoto(org.springframework.web.multipart.MultipartFile file) {
        Admin admin = getProfile();

        try {
            // Create uploads directory if it doesn't exist
            java.nio.file.Path uploadPath = java.nio.file.Paths.get("uploads/admin-photos");
            if (!java.nio.file.Files.exists(uploadPath)) {
                java.nio.file.Files.createDirectories(uploadPath);
            }

            // Delete old photo if exists
            if (admin.getPhotoUrl() != null && !admin.getPhotoUrl().isEmpty()) {
                deletePhotoFile(admin.getPhotoUrl());
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".jpg";
            String filename = "admin_" + admin.getId() + "_" + System.currentTimeMillis() + extension;

            // Save file
            java.nio.file.Path filePath = uploadPath.resolve(filename);
            java.nio.file.Files.copy(file.getInputStream(), filePath,
                    java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            // Update admin photo URL
            String photoUrl = "/uploads/admin-photos/" + filename;
            admin.setPhotoUrl(photoUrl);
            adminRepository.save(admin);

            return photoUrl;
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload photo: " + e.getMessage());
        }
    }

    @Override
    public void deletePhoto() {
        Admin admin = getProfile();

        if (admin.getPhotoUrl() != null && !admin.getPhotoUrl().isEmpty()) {
            deletePhotoFile(admin.getPhotoUrl());
            admin.setPhotoUrl(null);
            adminRepository.save(admin);
        }
    }

    private void deletePhotoFile(String photoUrl) {
        try {
            java.nio.file.Path filePath = java.nio.file.Paths.get("uploads/admin-photos")
                    .resolve(photoUrl.substring(photoUrl.lastIndexOf("/") + 1));
            java.nio.file.Files.deleteIfExists(filePath);
        } catch (Exception e) {
            // Log error but don't throw exception
            System.err.println("Failed to delete photo file: " + e.getMessage());
        }
    }

    @Override
    public String uploadHostelPhoto(org.springframework.web.multipart.MultipartFile file) {
        Admin admin = getProfile();

        try {
            // Create uploads directory for hostel photos if it doesn't exist
            java.nio.file.Path uploadPath = java.nio.file.Paths.get("uploads/hostel-photos");
            if (!java.nio.file.Files.exists(uploadPath)) {
                java.nio.file.Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".jpg";
            String filename = "hostel_" + admin.getId() + "_" + System.currentTimeMillis() + extension;

            // Save file
            java.nio.file.Path filePath = uploadPath.resolve(filename);
            java.nio.file.Files.copy(file.getInputStream(), filePath,
                    java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            // Return the photo URL (don't save to admin yet, frontend will handle the
            // array)
            String photoUrl = "/uploads/hostel-photos/" + filename;
            return photoUrl;
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload hostel photo: " + e.getMessage());
        }
    }

    @Override
    public Admin getByEmail(String email) {
        return adminRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with email: " + email));
    }

    @Override
    public Admin resetPassword(String email, String newPassword) {
        Admin admin = getByEmail(email);
        admin.setPassword(passwordEncoder.encode(newPassword));
        return adminRepository.save(admin);
    }

    @Override
    public java.util.List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }

    @Override
    public Admin freezeAccount(Long adminId) {
        Admin admin = getById(adminId);
        admin.setIsFrozen(true);
        Admin savedAdmin = adminRepository.save(admin);

        // Send email notification
        try {
            emailService.sendAccountFrozenEmail(
                    admin.getEmail(),
                    admin.getName(),
                    admin.getHostelName() != null ? admin.getHostelName() : "N/A");
        } catch (Exception e) {
            // Log error but don't fail the freeze operation
            System.err.println("Failed to send freeze email: " + e.getMessage());
        }

        return savedAdmin;
    }

    @Override
    public Admin unfreezeAccount(Long adminId) {
        Admin admin = getById(adminId);
        admin.setIsFrozen(false);
        Admin savedAdmin = adminRepository.save(admin);

        // Send email notification
        try {
            emailService.sendAccountUnfrozenEmail(
                    admin.getEmail(),
                    admin.getName(),
                    admin.getHostelName() != null ? admin.getHostelName() : "N/A");
        } catch (Exception e) {
            // Log error but don't fail the unfreeze operation
            System.err.println("Failed to send unfreeze email: " + e.getMessage());
        }

        return savedAdmin;
    }
}
