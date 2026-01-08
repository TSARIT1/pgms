package com.pgm.pgm_Backend.controller;

import com.pgm.pgm_Backend.model.Staff;
import com.pgm.pgm_Backend.service.StaffService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class StaffController {

    private final StaffService staffService;
    
    

    public StaffController(StaffService staffService) {
		super();
		this.staffService = staffService;
	}

	@GetMapping
    public ResponseEntity<?> getAllStaff() {
        try {
            List<Staff> staff = staffService.getAllStaff();
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "All staff retrieved successfully");
            response.put("data", staff);
            response.put("count", staff.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getStaffById(@PathVariable Long id) {
        try {
            Staff staff = staffService.getStaffById(id);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Staff retrieved successfully");
            response.put("data", staff);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping
    public ResponseEntity<?> createStaff(@Valid @RequestBody Staff staff) {
        try {
            Staff created = staffService.createStaff(staff);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Staff created successfully");
            response.put("data", created);
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
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateStaff(@PathVariable Long id, @Valid @RequestBody Staff staff) {
        try {
            Staff updated = staffService.updateStaff(id, staff);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Staff updated successfully");
            response.put("data", updated);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStaff(@PathVariable Long id) {
        try {
            staffService.deleteStaff(id);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Staff deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
