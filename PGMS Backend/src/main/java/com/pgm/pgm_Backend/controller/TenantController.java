package com.pgm.pgm_Backend.controller;

import com.pgm.pgm_Backend.model.Tenant;
import com.pgm.pgm_Backend.service.TenantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tenants")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class TenantController {

    private final TenantService tenantService;
    
    

    public TenantController(TenantService tenantService) {
		super();
		this.tenantService = tenantService;
	}

	@GetMapping
    public ResponseEntity<?> getAllTenants() {
        try {
            List<Tenant> tenants = tenantService.getAllTenants();
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "All tenants retrieved successfully");
            response.put("data", tenants);
            response.put("count", tenants.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTenantById(@PathVariable Long id) {
        try {
            Tenant tenant = tenantService.getTenantById(id);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Tenant retrieved successfully");
            response.put("data", tenant);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // JSON-based endpoint (alternative to multipart)
    @PostMapping(consumes = { "application/json" })
    public ResponseEntity<?> createTenantJson(@Valid @RequestBody Tenant tenant) {
        try {
            Tenant createdTenant = tenantService.createTenant(tenant);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Tenant created successfully");
            response.put("data", createdTenant);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping(consumes = { "multipart/form-data" })
    public ResponseEntity<?> createTenant(
            @RequestParam("name") String name,
            @RequestParam("age") Integer age,
            @RequestParam(value = "gender", required = false) String gender,
            @RequestParam("phone") String phone,
            @RequestParam("email") String email,
            @RequestParam("roomNumber") String roomNumber,
            @RequestParam(value = "bedNumber", required = false) Integer bedNumber,
            @RequestParam("address") String address,
            @RequestParam("joiningDate") String joiningDate,
            @RequestParam(value = "identityProofType", required = false) String identityProofType,
            @RequestParam(value = "identityProof", required = false) org.springframework.web.multipart.MultipartFile identityProof) {
        try {
            Tenant tenant = new Tenant();
            tenant.setName(name);
            tenant.setAge(age);
            tenant.setGender(gender);
            tenant.setPhone(phone);
            tenant.setEmail(email);
            tenant.setRoomNumber(roomNumber);
            tenant.setBedNumber(bedNumber);
            tenant.setAddress(address);
            tenant.setJoiningDate(java.time.LocalDate.parse(joiningDate));
            tenant.setIdentityProofType(identityProofType);

            // Handle file upload
            if (identityProof != null && !identityProof.isEmpty()) {
                byte[] bytes = identityProof.getBytes();
                String base64 = java.util.Base64.getEncoder().encodeToString(bytes);
                tenant.setIdentityProof(base64);
            }

            Tenant createdTenant = tenantService.createTenant(tenant);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Tenant created successfully");
            response.put("data", createdTenant);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping(value = "/{id}", consumes = { "multipart/form-data" })
    public ResponseEntity<?> updateTenant(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("age") Integer age,
            @RequestParam(value = "gender", required = false) String gender,
            @RequestParam("phone") String phone,
            @RequestParam("email") String email,
            @RequestParam("roomNumber") String roomNumber,
            @RequestParam(value = "bedNumber", required = false) Integer bedNumber,
            @RequestParam("address") String address,
            @RequestParam("joiningDate") String joiningDate,
            @RequestParam(value = "identityProofType", required = false) String identityProofType,
            @RequestParam(value = "identityProof", required = false) org.springframework.web.multipart.MultipartFile identityProof) {
        try {
            Tenant tenant = tenantService.getTenantById(id);

            // Update tenant fields
            tenant.setName(name);
            tenant.setAge(age);
            tenant.setGender(gender);
            tenant.setPhone(phone);
            tenant.setEmail(email);
            tenant.setRoomNumber(roomNumber);
            tenant.setBedNumber(bedNumber);
            tenant.setAddress(address);
            tenant.setJoiningDate(java.time.LocalDate.parse(joiningDate));
            tenant.setIdentityProofType(identityProofType);

            // Handle file upload if provided
            if (identityProof != null && !identityProof.isEmpty()) {
                byte[] bytes = identityProof.getBytes();
                String base64 = java.util.Base64.getEncoder().encodeToString(bytes);
                tenant.setIdentityProof(base64);
            }

            Tenant updatedTenant = tenantService.updateTenant(id, tenant);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Tenant updated successfully");
            response.put("data", updatedTenant);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTenant(@PathVariable Long id) {
        try {
            tenantService.deleteTenant(id);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Tenant deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<?> getTenantsByStatus(@PathVariable String status) {
        try {
            List<Tenant> tenants = tenantService.getTenantsByStatus(status);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Tenants retrieved by status successfully");
            response.put("data", tenants);
            response.put("count", tenants.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
