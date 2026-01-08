package com.pgm.pgm_Backend.controller;

import com.pgm.pgm_Backend.model.Admin;
import com.pgm.pgm_Backend.model.SuperAdmin;
import com.pgm.pgm_Backend.repository.AdminRepository;
import com.pgm.pgm_Backend.repository.DynamicTenantRepository;
import com.pgm.pgm_Backend.repository.SubscriptionPlanRepository;
import com.pgm.pgm_Backend.service.AdminService;
import com.pgm.pgm_Backend.service.EmailService;
import com.pgm.pgm_Backend.service.OtpService;
import com.pgm.pgm_Backend.service.SuperAdminService;
import com.pgm.pgm_Backend.service.impl.CustomUserDetailsService;
import com.pgm.pgm_Backend.utils.JwtUtils;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/superadmin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SuperAdminController {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private com.pgm.pgm_Backend.repository.SubscriptionPlanRepository subscriptionPlanRepository;

    @Autowired
    private DynamicTenantRepository tenantRepository;

    private final SuperAdminService superAdminService;
    private final org.springframework.security.authentication.AuthenticationManager authenticationManager;
    private final com.pgm.pgm_Backend.utils.JwtUtils jwtUtils;
    private final com.pgm.pgm_Backend.service.impl.CustomUserDetailsService userDetailsService;
    private final com.pgm.pgm_Backend.service.OtpService otpService;
    private final com.pgm.pgm_Backend.service.EmailService emailService;
    private final com.pgm.pgm_Backend.service.AdminService adminService;

    
    
    
    public SuperAdminController(AdminRepository adminRepository, SubscriptionPlanRepository subscriptionPlanRepository,
			DynamicTenantRepository tenantRepository, SuperAdminService superAdminService,
			AuthenticationManager authenticationManager, JwtUtils jwtUtils, CustomUserDetailsService userDetailsService,
			OtpService otpService, EmailService emailService, AdminService adminService) {
		super();
		this.adminRepository = adminRepository;
		this.subscriptionPlanRepository = subscriptionPlanRepository;
		this.tenantRepository = tenantRepository;
		this.superAdminService = superAdminService;
		this.authenticationManager = authenticationManager;
		this.jwtUtils = jwtUtils;
		this.userDetailsService = userDetailsService;
		this.otpService = otpService;
		this.emailService = emailService;
		this.adminService = adminService;
	}

	// Authentication Endpoints

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody SuperAdmin superAdmin) {
        try {
            SuperAdmin registeredSuperAdmin = superAdminService.register(superAdmin);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "SuperAdmin registered successfully");
            response.put("data", registeredSuperAdmin);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Note: SuperAdmin login is now handled via OTP-based authentication only
    // Use /send-otp and /verify-otp endpoints for login

    // Profile Management Endpoints

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        try {
            SuperAdmin superAdmin = superAdminService.getProfile();
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Profile retrieved successfully");
            response.put("data", superAdmin);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody SuperAdmin superAdmin) {
        try {
            SuperAdmin updatedSuperAdmin = superAdminService.updateProfile(superAdmin);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Profile updated successfully");
            response.put("data", updatedSuperAdmin);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/profile/photo")
    public ResponseEntity<?> uploadPhoto(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            if (file.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("status", "error");
                response.put("message", "Please select a file to upload");
                return ResponseEntity.badRequest().body(response);
            }

            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                Map<String, Object> response = new HashMap<>();
                response.put("status", "error");
                response.put("message", "Only image files are allowed");
                return ResponseEntity.badRequest().body(response);
            }

            String photoUrl = superAdminService.uploadPhoto(file);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Photo uploaded successfully");
            response.put("photoUrl", photoUrl);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/profile/photo")
    public ResponseEntity<?> deletePhoto() {
        try {
            superAdminService.deletePhoto();
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Photo deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Password Reset Endpoints

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestParam String email) {
        try {
            java.util.Optional<SuperAdmin> superAdminOpt = superAdminService.findByEmail(email);
            if (!superAdminOpt.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("status", "error");
                response.put("message", "SuperAdmin not found with this email");
                return ResponseEntity.badRequest().body(response);
            }

            // Send OTP with email as name (since SuperAdmin doesn't have name field)
            otpService.generateAndSendOtp(email, "Super Admin");

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "OTP sent to your email successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to send OTP: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestParam String email, @RequestParam String otp) {
        try {
            boolean isValid = otpService.verifyOtp(email, otp);

            if (isValid) {
                Map<String, Object> response = new HashMap<>();
                response.put("status", "success");
                response.put("message", "OTP verified successfully");
                response.put("verified", true);
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("status", "error");
                response.put("message", "Invalid or expired OTP");
                response.put("verified", false);
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to verify OTP: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Note: SuperAdmin password reset removed - using OTP-based authentication only
    // Password field no longer exists in SuperAdmin model

    // Dashboard Endpoints

    @GetMapping("/dashboard/stats")
    public ResponseEntity<?> getDashboardStats() {
        try {
            // Get all admins (PG/Hostel owners only - no role field needed anymore)
            List<Admin> allAdmins = adminRepository.findAll();

            long totalPGHostels = allAdmins.size();
            // Note: Total students count not available with separate tables per admin

            // Group admins by their actual subscription plan
            Map<String, Long> planCounts = allAdmins.stream()
                    .collect(java.util.stream.Collectors.groupingBy(
                            admin -> {
                                String plan = admin.getSubscriptionPlan();
                                // Treat null, empty, or BASIC as "free plan"
                                if (plan == null || plan.isEmpty() || plan.equalsIgnoreCase("BASIC")) {
                                    return "free plan";
                                }
                                return plan;
                            },
                            java.util.stream.Collectors.counting()));

            // Convert to list format for response
            List<Map<String, Object>> subscriptionStats = new ArrayList<>();
            for (Map.Entry<String, Long> entry : planCounts.entrySet()) {
                Map<String, Object> planStat = new HashMap<>();
                planStat.put("planName", entry.getKey());
                planStat.put("count", entry.getValue());
                subscriptionStats.add(planStat);
            }

            java.time.LocalDateTime thirtyDaysAgo = java.time.LocalDateTime.now().minusDays(30);
            long recentRegistrations = allAdmins.stream()
                    .filter(admin -> admin.getCreatedAt() != null && admin.getCreatedAt().isAfter(thirtyDaysAgo))
                    .count();

            // Count total candidates across all admin tables
            long totalCandidates = 0;
            for (Admin admin : allAdmins) {
                try {
                    totalCandidates += tenantRepository.findAll(admin.getId()).size();
                } catch (Exception e) {
                    // Skip if table doesn't exist yet
                }
            }

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalPGHostels", totalPGHostels);
            stats.put("totalStudents", totalCandidates);
            stats.put("subscriptionStats", subscriptionStats);
            stats.put("recentRegistrations", recentRegistrations);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", stats);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to fetch dashboard stats: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/pg-hostels")
    public ResponseEntity<?> getAllPGHostels() {
        try {
            // All admins are now PG/Hostel owners (SuperAdmin is in separate table)
            List<Admin> allAdmins = adminRepository.findAll();

            List<Map<String, Object>> pgHostelsList = allAdmins.stream()
                    .map(admin -> {
                        Map<String, Object> pgData = new HashMap<>();
                        pgData.put("id", admin.getId());
                        pgData.put("name", admin.getName());
                        pgData.put("email", admin.getEmail());
                        pgData.put("phone", admin.getPhone());
                        pgData.put("hostelName", admin.getHostelName());
                        pgData.put("hostelAddress", admin.getHostelAddress());
                        pgData.put("referredBy", admin.getReferredBy());
                        pgData.put("subscriptionPlan",
                                admin.getSubscriptionPlan() != null ? admin.getSubscriptionPlan() : "BASIC");
                        pgData.put("subscriptionStartDate", admin.getSubscriptionStartDate());
                        pgData.put("subscriptionEndDate", admin.getSubscriptionEndDate());
                        pgData.put("isFrozen", admin.getIsFrozen() != null ? admin.getIsFrozen() : false);
                        pgData.put("createdAt", admin.getCreatedAt());
                        // Count candidates for this specific admin
                        long candidateCount = 0;
                        try {
                            candidateCount = tenantRepository.findAll(admin.getId()).size();
                        } catch (Exception e) {
                            // Table doesn't exist yet or error occurred
                        }
                        pgData.put("studentCount", candidateCount);

                        return pgData;
                    })
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", pgHostelsList);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to fetch PG/Hostels: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/students/total")
    public ResponseEntity<?> getTotalStudents() {
        try {
            // With separate tables per admin, total student count requires querying all
            // admin tables
            // This is not implemented in the current architecture
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("totalStudents", 0);
            response.put("message", "Total student count not available with separate table architecture");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to fetch total students: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/subscriptions/stats")
    public ResponseEntity<?> getSubscriptionStats() {
        try {
            // All admins are now PG/Hostel owners
            List<Admin> allAdmins = adminRepository.findAll();

            // Dynamic subscription stats - fetch all active subscription plans
            List<com.pgm.pgm_Backend.model.SubscriptionPlan> allPlans = subscriptionPlanRepository.findByIsActiveTrue();

            List<Map<String, Object>> subscriptionStats = new ArrayList<>();
            for (com.pgm.pgm_Backend.model.SubscriptionPlan plan : allPlans) {
                long count = allAdmins.stream()
                        .filter(admin -> plan.getName().equalsIgnoreCase(admin.getSubscriptionPlan()))
                        .count();

                Map<String, Object> planStat = new HashMap<>();
                planStat.put("planName", plan.getName());
                planStat.put("count", count);
                subscriptionStats.add(planStat);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", subscriptionStats);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to fetch subscription stats: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Delete Admin/PG Hostel Account
    @DeleteMapping("/admins/{id}")
    public ResponseEntity<?> deleteAdmin(@PathVariable Long id) {
        try {
            adminService.deleteAdmin(id);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Admin account deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to delete admin: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
