package com.pgm.pgm_Backend.controller;

import com.pgm.pgm_Backend.model.Admin;
import com.pgm.pgm_Backend.model.Appointment;
import com.pgm.pgm_Backend.service.AdminService;
import com.pgm.pgm_Backend.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final AdminService adminService;

    
    
    public AppointmentController(AppointmentService appointmentService, AdminService adminService) {
		super();
		this.appointmentService = appointmentService;
		this.adminService = adminService;
	}

	@PostMapping
    public ResponseEntity<?> createAppointment(@RequestBody Map<String, Object> appointmentData) {
        try {
            Long adminId = Long.valueOf(appointmentData.get("adminId").toString());
            Admin admin = adminService.getById(adminId);

            Appointment appointment = new Appointment();
            appointment.setAdmin(admin);
            appointment.setCandidateName(appointmentData.get("candidateName").toString());
            appointment.setCandidatePhone(appointmentData.get("candidatePhone").toString());
            appointment.setCandidateEmail(appointmentData.get("candidateEmail").toString());
            appointment.setAppointmentDate(
                    java.time.LocalDateTime.parse(appointmentData.get("appointmentDate").toString()));

            if (appointmentData.containsKey("message")) {
                appointment.setMessage(appointmentData.get("message").toString());
            }

            Appointment savedAppointment = appointmentService.createAppointment(appointment);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Appointment booked successfully");
            response.put("data", savedAppointment);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to book appointment: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllAppointments(org.springframework.security.core.Authentication authentication) {
        try {
            // Get admin email from authentication
            String email = authentication.getName();

            // Get admin by email to get the ID
            Admin admin = adminService.getByEmail(email);
            if (admin == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("status", "error");
                response.put("message", "Admin not found");
                return ResponseEntity.badRequest().body(response);
            }

            // Get appointments for this specific admin only
            List<Appointment> appointments = appointmentService.getAppointmentsByAdminId(admin.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", appointments);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to fetch appointments: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAppointmentById(@PathVariable Long id) {
        try {
            Appointment appointment = appointmentService.getAppointmentById(id);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", appointment);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Appointment not found");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateAppointmentStatus(@PathVariable Long id,
            @RequestBody Map<String, String> statusData) {
        try {
            String status = statusData.get("status");
            Appointment updatedAppointment = appointmentService.updateAppointmentStatus(id, status);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Appointment status updated");
            response.put("data", updatedAppointment);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to update status: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAppointment(@PathVariable Long id) {
        try {
            appointmentService.deleteAppointment(id);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Appointment deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to delete appointment: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
