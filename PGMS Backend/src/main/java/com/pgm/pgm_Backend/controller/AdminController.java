package com.pgm.pgm_Backend.controller;

import com.pgm.pgm_Backend.model.Admin;
import com.pgm.pgm_Backend.repository.AdminRepository;
import com.pgm.pgm_Backend.service.AdminService;
import com.pgm.pgm_Backend.service.DynamicTableService;
import com.pgm.pgm_Backend.service.EmailService;
import com.pgm.pgm_Backend.service.OtpService;
import com.pgm.pgm_Backend.service.SuperAdminService;
import com.pgm.pgm_Backend.service.impl.CustomUserDetailsService;
import com.pgm.pgm_Backend.utils.JwtUtils;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AdminController {

    private final AdminService adminService;
    private final DynamicTableService dynamicTableService;
    private final com.pgm.pgm_Backend.service.SuperAdminService superAdminService;
    private final org.springframework.security.authentication.AuthenticationManager authenticationManager;
    private final com.pgm.pgm_Backend.utils.JwtUtils jwtUtils;
    private final com.pgm.pgm_Backend.service.impl.CustomUserDetailsService userDetailsService;
    private final com.pgm.pgm_Backend.service.OtpService otpService;
    private final com.pgm.pgm_Backend.service.EmailService emailService;
    private final com.pgm.pgm_Backend.repository.AdminRepository adminRepository;

    
   
	public AdminController(AdminService adminService, DynamicTableService dynamicTableService,
			SuperAdminService superAdminService, AuthenticationManager authenticationManager, JwtUtils jwtUtils,
			CustomUserDetailsService userDetailsService, OtpService otpService, EmailService emailService,
			AdminRepository adminRepository) {
		super();
		this.adminService = adminService;
		this.dynamicTableService = dynamicTableService;
		this.superAdminService = superAdminService;
		this.authenticationManager = authenticationManager;
		this.jwtUtils = jwtUtils;
		this.userDetailsService = userDetailsService;
		this.otpService = otpService;
		this.emailService = emailService;
		this.adminRepository = adminRepository;
	}

	@PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody Admin admin) {
        try {
            Admin registeredAdmin = adminService.register(admin);
            boolean tablesCreated = false;
            String tableCreationError = null;
            Map<String, Boolean> tableStatus = null;

            // Create dedicated tables for this admin
            try {
                dynamicTableService.createAdminTables(registeredAdmin.getId());
                tablesCreated = true;
                tableStatus = dynamicTableService.getTableCreationStatus(registeredAdmin.getId());
            } catch (Exception tableException) {
                // Log detailed error
                System.err.println("[CRITICAL] Failed to create tables for admin " + registeredAdmin.getId());
                System.err.println("Error: " + tableException.getMessage());
                tableException.printStackTrace();

                tableCreationError = tableException.getMessage();
                tableStatus = dynamicTableService.getTableCreationStatus(registeredAdmin.getId());
            }

            // Send welcome email
            boolean emailSent = false;
            try {
                emailService.sendWelcomeEmail(
                        registeredAdmin.getEmail(),
                        registeredAdmin.getName(),
                        registeredAdmin.getHostelName());
                emailSent = true;
            } catch (Exception emailException) {
                System.err.println("Failed to send welcome email: " + emailException.getMessage());
            }

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Admin registered successfully");
            response.put("data", registeredAdmin);

            // Add table creation status to response
            Map<String, Object> setupStatus = new HashMap<>();
            setupStatus.put("tablesCreated", tablesCreated);
            setupStatus.put("tableStatus", tableStatus);
            setupStatus.put("emailSent", emailSent);
            if (!tablesCreated) {
                setupStatus.put("tableCreationError", tableCreationError);
                setupStatus.put("missingTables", dynamicTableService.getMissingTables(registeredAdmin.getId()));
            }
            response.put("setupStatus", setupStatus);

            // Return warning status if tables failed
            if (!tablesCreated) {
                response.put("status", "warning");
                response.put("message",
                        "Admin registered but table creation failed. Please contact support or use the 'Create Tables' option in your profile.");
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/create-tables/{adminId}")
    public ResponseEntity<?> createTablesForAdmin(@PathVariable Long adminId) {
        try {
            // Verify admin exists
            Admin admin = adminService.getById(adminId);

            // Check which tables are missing before creation
            java.util.List<String> missingTablesBefore = dynamicTableService.getMissingTables(adminId);

            // Create tables for this admin
            dynamicTableService.createAdminTables(adminId);

            // Verify tables were created
            Map<String, Boolean> tableStatus = dynamicTableService.getTableCreationStatus(adminId);
            java.util.List<String> missingTablesAfter = dynamicTableService.getMissingTables(adminId);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Tables created successfully for admin " + adminId);
            response.put("tableStatus", tableStatus);
            response.put("missingTablesBefore", missingTablesBefore);
            response.put("missingTablesAfter", missingTablesAfter);

            if (!missingTablesAfter.isEmpty()) {
                response.put("status", "warning");
                response.put("message", "Some tables failed to create: " + String.join(", ", missingTablesAfter));
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to create tables: " + e.getMessage());
            response.put("tableStatus", dynamicTableService.getTableCreationStatus(adminId));
            response.put("missingTables", dynamicTableService.getMissingTables(adminId));
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody com.pgm.pgm_Backend.dto.LoginRequest loginRequest) {
        try {
            System.out.println("=== LOGIN ATTEMPT ===");
            System.out.println("Email/Phone: " + loginRequest.getEmail());
            System.out.println("Password: '" + loginRequest.getPassword() + "'");
            System.out.println("Password length: "
                    + (loginRequest.getPassword() != null ? loginRequest.getPassword().length() : 0));

            // First, authenticate the user
            authenticationManager.authenticate(
                    new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()));

            System.out.println("Authentication successful!");

            // Generate JWT token
            final org.springframework.security.core.userdetails.UserDetails userDetails = userDetailsService
                    .loadUserByUsername(loginRequest.getEmail());
            final String jwt = jwtUtils.generateToken(userDetails.getUsername());

            // Determine if input is email or phone
            boolean isEmail = loginRequest.getEmail().contains("@");

            // Check which table the user is in
            Optional<com.pgm.pgm_Backend.model.SuperAdmin> superAdminOpt = Optional.empty();
            if (isEmail) {
                superAdminOpt = superAdminService.findByEmail(loginRequest.getEmail());
            }

            if (superAdminOpt.isPresent()) {
                // User is SuperAdmin
                System.out.println("User is SUPER_ADMIN");
                com.pgm.pgm_Backend.model.SuperAdmin superAdmin = superAdminOpt.get();

                Map<String, Object> response = new HashMap<>();
                response.put("status", "success");
                response.put("message", "Login successful");
                response.put("token", jwt);
                response.put("role", "SUPER_ADMIN");
                response.put("data", superAdmin);
                return ResponseEntity.ok(response);
            } else {
                // User is regular Admin
                System.out.println("User is ADMIN");

                // Retrieve admin by email or phone
                Admin admin;
                if (isEmail) {
                    admin = adminService.getByEmail(loginRequest.getEmail());
                } else {
                    // Get by phone
                    admin = adminRepository.findByPhone(loginRequest.getEmail())
                            .orElseThrow(() -> new RuntimeException("Admin not found"));
                }

                // Check if account is frozen
                if (admin.getIsFrozen() != null && admin.getIsFrozen()) {
                    System.out.println("Account is FROZEN - login denied");
                    Map<String, Object> response = new HashMap<>();
                    response.put("status", "error");
                    response.put("message", "Your account has been frozen. Please contact support.");
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
                }

                // AUTO-CREATE TABLES IF MISSING
                boolean tablesExist = dynamicTableService.verifyAllTablesExist(admin.getId());
                if (!tablesExist) {
                    System.out.println("[AUTO-FIX] Tables missing for admin " + admin.getId() + ", creating now...");
                    try {
                        dynamicTableService.createAdminTables(admin.getId());
                        System.out.println("[AUTO-FIX] Tables created successfully for admin " + admin.getId());
                    } catch (Exception tableEx) {
                        System.err.println("[AUTO-FIX] Failed to create tables: " + tableEx.getMessage());
                        tableEx.printStackTrace();
                        // Don't fail login, but warn user
                    }
                }

                Map<String, Object> response = new HashMap<>();
                response.put("status", "success");
                response.put("message", "Login successful");
                response.put("token", jwt);
                response.put("role", "ADMIN");
                response.put("data", admin);

                // Add table status info
                Map<String, Object> tableInfo = new HashMap<>();
                tableInfo.put("allTablesExist", dynamicTableService.verifyAllTablesExist(admin.getId()));
                tableInfo.put("missingTables", dynamicTableService.getMissingTables(admin.getId()));
                response.put("tableInfo", tableInfo);

                return ResponseEntity.ok(response);
            }
        } catch (org.springframework.security.core.AuthenticationException e) {
            System.out.println("=== AUTHENTICATION FAILED ===");
            System.out.println("Error type: " + e.getClass().getName());
            System.out.println("Error message: " + e.getMessage());
            e.printStackTrace();

            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Invalid email/phone or password");
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            System.out.println("=== UNEXPECTED ERROR ===");
            System.out.println("Error type: " + e.getClass().getName());
            System.out.println("Error message: " + e.getMessage());
            e.printStackTrace();

            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Invalid email/phone or password");
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Login OTP Endpoints
    @PostMapping("/send-login-otp")
    public ResponseEntity<?> sendLoginOtp(@RequestParam String email) {
        try {
            // Check if user exists (either Admin or SuperAdmin)
            Optional<com.pgm.pgm_Backend.model.SuperAdmin> superAdminOpt = superAdminService.findByEmail(email);
            String adminName;

            if (superAdminOpt.isPresent()) {
                adminName = "Super Admin"; // SuperAdmin doesn't have a name field, use default
            } else {
                // Check if admin exists
                try {
                    Admin admin = adminService.getByEmail(email);
                    adminName = admin.getName();

                    // Check if account is frozen
                    if (admin.getIsFrozen() != null && admin.getIsFrozen()) {
                        Map<String, Object> response = new HashMap<>();
                        response.put("status", "error");
                        response.put("message", "Your account has been frozen. Please contact support.");
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
                    }
                } catch (Exception e) {
                    Map<String, Object> response = new HashMap<>();
                    response.put("status", "error");
                    response.put("message", "User not found with this email");
                    return ResponseEntity.badRequest().body(response);
                }
            }

            // Generate and send login OTP
            otpService.generateAndSendLoginOtp(email, adminName);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Login OTP sent to your email successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to send login OTP: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/verify-login-otp")
    public ResponseEntity<?> verifyLoginOtp(@RequestParam String email, @RequestParam String otp) {
        try {
            // Verify the OTP
            boolean isValid = otpService.verifyLoginOtp(email, otp);

            if (!isValid) {
                Map<String, Object> response = new HashMap<>();
                response.put("status", "error");
                response.put("message", "Invalid or expired OTP");
                response.put("verified", false);
                return ResponseEntity.badRequest().body(response);
            }

            // Generate JWT token after successful OTP verification
            final org.springframework.security.core.userdetails.UserDetails userDetails = userDetailsService
                    .loadUserByUsername(email);
            final String jwt = jwtUtils.generateToken(userDetails.getUsername());

            // Check which table the user is in
            Optional<com.pgm.pgm_Backend.model.SuperAdmin> superAdminOpt = superAdminService.findByEmail(email);

            if (superAdminOpt.isPresent()) {
                // User is SuperAdmin
                com.pgm.pgm_Backend.model.SuperAdmin superAdmin = superAdminOpt.get();

                Map<String, Object> response = new HashMap<>();
                response.put("status", "success");
                response.put("message", "Login successful");
                response.put("verified", true);
                response.put("token", jwt);
                response.put("role", "SUPER_ADMIN");
                response.put("data", superAdmin);
                return ResponseEntity.ok(response);
            } else {
                // User is regular Admin
                Admin admin = adminService.getByEmail(email);

                // AUTO-CREATE TABLES IF MISSING
                boolean tablesExist = dynamicTableService.verifyAllTablesExist(admin.getId());
                if (!tablesExist) {
                    System.out.println("[AUTO-FIX] Tables missing for admin " + admin.getId() + ", creating now...");
                    try {
                        dynamicTableService.createAdminTables(admin.getId());
                        System.out.println("[AUTO-FIX] Tables created successfully for admin " + admin.getId());
                    } catch (Exception tableEx) {
                        System.err.println("[AUTO-FIX] Failed to create tables: " + tableEx.getMessage());
                        tableEx.printStackTrace();
                    }
                }

                Map<String, Object> response = new HashMap<>();
                response.put("status", "success");
                response.put("message", "Login successful");
                response.put("verified", true);
                response.put("token", jwt);
                response.put("role", "ADMIN");
                response.put("data", admin);

                // Add table status info
                Map<String, Object> tableInfo = new HashMap<>();
                tableInfo.put("allTablesExist", dynamicTableService.verifyAllTablesExist(admin.getId()));
                tableInfo.put("missingTables", dynamicTableService.getMissingTables(admin.getId()));
                response.put("tableInfo", tableInfo);

                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to verify login OTP: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAdmin(@PathVariable Long id) {
        try {
            Admin admin = adminService.getById(id);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Admin retrieved successfully");
            response.put("data", admin);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAdmin(@PathVariable Long id, @Valid @RequestBody Admin admin) {
        try {
            Admin updatedAdmin = adminService.updateAdmin(id, admin);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Admin updated successfully");
            response.put("data", updatedAdmin);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAdmin(@PathVariable Long id) {
        try {
            adminService.deleteAdmin(id);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Admin deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        try {
            Admin admin = adminService.getProfile();

            // Check if tables exist for this admin
            boolean allTablesExist = dynamicTableService.verifyAllTablesExist(admin.getId());
            java.util.List<String> missingTables = dynamicTableService.getMissingTables(admin.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Profile retrieved successfully");
            response.put("data", admin);

            // Add table status information
            Map<String, Object> tableInfo = new HashMap<>();
            tableInfo.put("allTablesExist", allTablesExist);
            if (!allTablesExist) {
                tableInfo.put("missingTables", missingTables);
                tableInfo.put("warning", "Some database tables are missing. Please use 'Create Tables' option.");
            }
            response.put("tableInfo", tableInfo);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Admin admin) {
        try {
            Admin updatedAdmin = adminService.updateProfile(admin);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Profile updated successfully");
            response.put("data", updatedAdmin);
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
            // Validate file
            if (file.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("status", "error");
                response.put("message", "Please select a file to upload");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                Map<String, Object> response = new HashMap<>();
                response.put("status", "error");
                response.put("message", "Only image files are allowed");
                return ResponseEntity.badRequest().body(response);
            }

            String photoUrl = adminService.uploadPhoto(file);
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
            adminService.deletePhoto();
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

    @PostMapping("/profile/hostel-photo")
    public ResponseEntity<?> uploadHostelPhoto(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            // Validate file
            if (file.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("status", "error");
                response.put("message", "Please select a file to upload");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                Map<String, Object> response = new HashMap<>();
                response.put("status", "error");
                response.put("message", "Only image files are allowed");
                return ResponseEntity.badRequest().body(response);
            }

            String photoUrl = adminService.uploadHostelPhoto(file);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Hostel photo uploaded successfully");
            response.put("photoUrl", photoUrl);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // OTP-based Password Reset Endpoints

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestParam String email) {
        try {
            // Find admin by email
            Admin admin = adminService.getByEmail(email);
            if (admin == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("status", "error");
                response.put("message", "Admin not found with this email");
                return ResponseEntity.badRequest().body(response);
            }

            // Generate and send OTP
            otpService.generateAndSendOtp(email, admin.getName());

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

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody com.pgm.pgm_Backend.dto.ResetPasswordRequest request) {
        try {
            // Check if OTP was already verified (don't verify again as it would fail)
            boolean isValid = otpService.isOtpVerified(request.getEmail(), request.getOtp());
            if (!isValid) {
                Map<String, Object> response = new HashMap<>();
                response.put("status", "error");
                response.put("message", "Invalid or expired OTP");
                return ResponseEntity.badRequest().body(response);
            }

            // Reset password
            Admin admin = adminService.resetPassword(request.getEmail(), request.getNewPassword());

            // Send confirmation email
            emailService.sendPasswordResetConfirmation(request.getEmail(), admin.getName());

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Password reset successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to reset password: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllAdmins() {
        try {
            java.util.List<Admin> admins = adminService.getAllAdmins();

            // Return detailed admin data for landing page display
            java.util.List<Map<String, Object>> adminList = admins.stream()
                    .map(admin -> {
                        Map<String, Object> adminData = new HashMap<>();
                        adminData.put("id", admin.getId());
                        adminData.put("name", admin.getName());
                        adminData.put("email", admin.getEmail());
                        adminData.put("phone", admin.getPhone());
                        adminData.put("hostelName", admin.getHostelName());
                        adminData.put("hostelAddress", admin.getHostelAddress());
                        adminData.put("locationLink", admin.getLocationLink());
                        adminData.put("photoUrl", admin.getPhotoUrl());
                        adminData.put("hostelPhotos", admin.getHostelPhotos());
                        return adminData;
                    })
                    .collect(java.util.stream.Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", adminList);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to fetch admins: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/freeze/{id}")
    public ResponseEntity<?> freezeAccount(@PathVariable Long id) {
        try {
            Admin admin = adminService.freezeAccount(id);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Account frozen successfully");
            response.put("data", admin);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to freeze account: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/unfreeze/{id}")
    public ResponseEntity<?> unfreezeAccount(@PathVariable Long id) {
        try {
            Admin admin = adminService.unfreezeAccount(id);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Account unfrozen successfully");
            response.put("data", admin);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to unfreeze account: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
