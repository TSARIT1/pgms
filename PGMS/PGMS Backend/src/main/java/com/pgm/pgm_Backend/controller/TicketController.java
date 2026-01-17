package com.pgm.pgm_Backend.controller;

import com.pgm.pgm_Backend.model.Ticket;
import com.pgm.pgm_Backend.model.Admin;
import com.pgm.pgm_Backend.service.TicketService;
import com.pgm.pgm_Backend.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "*")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @Autowired
    private AdminService adminService;

    @Autowired
    private com.pgm.pgm_Backend.service.EmailService emailService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createTicket(
            @RequestParam("title") String title,
            @RequestParam("priority") String priority,
            @RequestParam("description") String description,
            @RequestParam(value = "attachment", required = false) MultipartFile attachment,
            Authentication authentication) {

        Map<String, Object> response = new HashMap<>();

        try {
            // Get admin email from authentication
            String email = authentication.getName();

            // Get admin by email to get the ID
            Admin admin = adminService.getByEmail(email);
            if (admin == null) {
                response.put("status", "error");
                response.put("message", "Admin not found");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            Long adminId = admin.getId();

            // Upload attachment if provided
            String attachmentUrl = null;
            if (attachment != null && !attachment.isEmpty()) {
                attachmentUrl = ticketService.uploadAttachment(attachment);
            }

            // Create ticket
            Ticket ticket = ticketService.createTicket(
                    adminId,
                    title,
                    Ticket.Priority.valueOf(priority.toUpperCase()),
                    description,
                    attachmentUrl);

            response.put("status", "success");
            response.put("message", "Ticket created successfully");
            response.put("data", ticket);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to create ticket: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/my-tickets")
    public ResponseEntity<Map<String, Object>> getMyTickets(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Get admin email from authentication
            String email = authentication.getName();

            // Get admin by email to get the ID
            Admin admin = adminService.getByEmail(email);
            if (admin == null) {
                response.put("status", "error");
                response.put("message", "Admin not found");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            Long adminId = admin.getId();
            List<Ticket> tickets = ticketService.getTicketsByAdmin(adminId);

            response.put("status", "success");
            response.put("data", tickets);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to fetch tickets: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getTicketById(@PathVariable Long id, Authentication authentication) {
        Map<String, Object> response = new HashMap<>();

        try {
            Ticket ticket = ticketService.getTicketById(id);

            // Get admin email from authentication
            String email = authentication.getName();

            // Get admin by email to get the ID
            Admin admin = adminService.getByEmail(email);
            if (admin == null) {
                response.put("status", "error");
                response.put("message", "Admin not found");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            // Verify ticket belongs to authenticated admin
            if (!ticket.getAdminId().equals(admin.getId())) {
                response.put("status", "error");
                response.put("message", "Unauthorized access to ticket");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            response.put("status", "success");
            response.put("data", ticket);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to fetch ticket: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/upload-attachment")
    public ResponseEntity<Map<String, Object>> uploadAttachment(@RequestParam("file") MultipartFile file) {
        Map<String, Object> response = new HashMap<>();

        try {
            String attachmentUrl = ticketService.uploadAttachment(file);

            response.put("status", "success");
            response.put("attachmentUrl", attachmentUrl);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to upload attachment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // SuperAdmin Endpoints

    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> getAllTickets() {
        Map<String, Object> response = new HashMap<>();

        try {
            List<Ticket> tickets = ticketService.getAllTickets();

            response.put("status", "success");
            response.put("data", tickets);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to fetch tickets: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/{id}/respond")
    public ResponseEntity<Map<String, Object>> respondToTicket(
            @PathVariable Long id,
            @RequestParam("response") String ticketResponse,
            @RequestParam("status") String status) {

        Map<String, Object> response = new HashMap<>();

        try {
            Ticket ticket = ticketService.respondToTicket(
                    id,
                    ticketResponse,
                    Ticket.Status.valueOf(status.toUpperCase()));

            // Get admin details to send email
            Admin admin = adminService.getById(ticket.getAdminId());

            // Send email notification to admin
            try {
                emailService.sendTicketResponseEmail(
                        admin.getEmail(),
                        admin.getName(),
                        ticket.getId(),
                        ticket.getTitle(),
                        ticketResponse,
                        status);
            } catch (Exception emailException) {
                // Log email error but don't fail the response
                System.err.println("Failed to send ticket response email: " + emailException.getMessage());
            }

            response.put("status", "success");
            response.put("message", "Response added successfully");
            response.put("data", ticket);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to respond to ticket: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
