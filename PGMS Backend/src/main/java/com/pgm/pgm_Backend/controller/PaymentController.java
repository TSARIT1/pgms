/*
 * package com.pgm.pgm_Backend.controller;
 * 
 * import com.pgm.pgm_Backend.model.Payment; import
 * com.pgm.pgm_Backend.service.PaymentService; import
 * com.pgm.pgm_Backend.service.EmailService; import jakarta.validation.Valid;
 * import lombok.RequiredArgsConstructor; import lombok.extern.slf4j.Slf4j;
 * import org.springframework.http.HttpStatus; import
 * org.springframework.http.ResponseEntity; import
 * org.springframework.web.bind.annotation.*;
 * 
 * import java.time.LocalDate; import java.util.HashMap; import java.util.List;
 * import java.util.Map;
 * 
 * @RestController
 * 
 * @RequestMapping("/api/payments")
 * 
 * @CrossOrigin(origins = "*")
 * 
 * @RequiredArgsConstructor
 * 
 * @Slf4j public class PaymentController {
 * 
 * private final PaymentService paymentService; private final EmailService
 * emailService;
 * 
 * 
 * 
 * 
 * public PaymentController(PaymentService paymentService, EmailService
 * emailService) { super(); this.paymentService = paymentService;
 * this.emailService = emailService; }
 * 
 * @GetMapping public ResponseEntity<?> getAllPayments() { try { List<Payment>
 * payments = paymentService.getAllPayments(); Map<String, Object> response =
 * new HashMap<>(); response.put("status", "success"); response.put("message",
 * "All payments retrieved successfully"); response.put("data", payments);
 * response.put("count", payments.size()); return ResponseEntity.ok(response); }
 * catch (Exception e) { Map<String, Object> response = new HashMap<>();
 * response.put("status", "error"); response.put("message", e.getMessage());
 * return ResponseEntity.badRequest().body(response); } }
 * 
 * @GetMapping("/{id}") public ResponseEntity<?> getPaymentById(@PathVariable
 * Long id) { try { Payment payment = paymentService.getPaymentById(id);
 * Map<String, Object> response = new HashMap<>(); response.put("status",
 * "success"); response.put("message", "Payment retrieved successfully");
 * response.put("data", payment); return ResponseEntity.ok(response); } catch
 * (Exception e) { Map<String, Object> response = new HashMap<>();
 * response.put("status", "error"); response.put("message", e.getMessage());
 * return ResponseEntity.badRequest().body(response); } }
 * 
 * @PostMapping public ResponseEntity<?> createPayment(@Valid @RequestBody
 * Payment payment) { try { Payment createdPayment =
 * paymentService.createPayment(payment);
 * 
 * // Send payment success email to admin try { // Get current admin from
 * context com.pgm.pgm_Backend.utils.AdminContextUtil adminContextUtil = new
 * com.pgm.pgm_Backend.utils.AdminContextUtil(); com.pgm.pgm_Backend.model.Admin
 * admin = adminContextUtil.getCurrentAdmin();
 * 
 * if (admin != null) { emailService.sendPaymentSuccessEmail( admin.getEmail(),
 * admin.getName(), createdPayment.getTransactionId(),
 * createdPayment.getAmount(), createdPayment.getMethod(),
 * createdPayment.getPaymentDate().toString(), admin.getHostelName());
 * log.info("Payment success email sent to admin: {}", admin.getEmail()); } }
 * catch (Exception emailException) { // Log email failure but don't fail the
 * payment log.error("Failed to send payment success email: {}",
 * emailException.getMessage()); }
 * 
 * Map<String, Object> response = new HashMap<>(); response.put("status",
 * "success"); response.put("message", "Payment created successfully");
 * response.put("data", createdPayment); return
 * ResponseEntity.status(HttpStatus.CREATED).body(response); } catch (Exception
 * e) { Map<String, Object> response = new HashMap<>(); response.put("status",
 * "error"); response.put("message", e.getMessage()); return
 * ResponseEntity.badRequest().body(response); } }
 * 
 * @PutMapping("/{id}") public ResponseEntity<?> updatePayment(@PathVariable
 * Long id, @Valid @RequestBody Payment payment) { try { Payment updatedPayment
 * = paymentService.updatePayment(id, payment); Map<String, Object> response =
 * new HashMap<>(); response.put("status", "success"); response.put("message",
 * "Payment updated successfully"); response.put("data", updatedPayment); return
 * ResponseEntity.ok(response); } catch (Exception e) { Map<String, Object>
 * response = new HashMap<>(); response.put("status", "error");
 * response.put("message", e.getMessage()); return
 * ResponseEntity.badRequest().body(response); } }
 * 
 * @DeleteMapping("/{id}") public ResponseEntity<?> deletePayment(@PathVariable
 * Long id) { try { paymentService.deletePayment(id); Map<String, Object>
 * response = new HashMap<>(); response.put("status", "success");
 * response.put("message", "Payment deleted successfully"); return
 * ResponseEntity.ok(response); } catch (Exception e) { Map<String, Object>
 * response = new HashMap<>(); response.put("status", "error");
 * response.put("message", e.getMessage()); return
 * ResponseEntity.badRequest().body(response); } }
 * 
 * @GetMapping("/tenant/{tenantId}") public ResponseEntity<?>
 * getPaymentsByTenantId(@PathVariable Long tenantId) { try { List<Payment>
 * payments = paymentService.getPaymentsByTenantId(tenantId); Map<String,
 * Object> response = new HashMap<>(); response.put("status", "success");
 * response.put("message", "Payments retrieved by tenant successfully");
 * response.put("data", payments); response.put("count", payments.size());
 * return ResponseEntity.ok(response); } catch (Exception e) { Map<String,
 * Object> response = new HashMap<>(); response.put("status", "error");
 * response.put("message", e.getMessage()); return
 * ResponseEntity.badRequest().body(response); } }
 * 
 * @GetMapping("/status/{status}") public ResponseEntity<?>
 * getPaymentsByStatus(@PathVariable String status) { try { List<Payment>
 * payments = paymentService.getPaymentsByStatus(status); Map<String, Object>
 * response = new HashMap<>(); response.put("status", "success");
 * response.put("message", "Payments retrieved by status successfully");
 * response.put("data", payments); response.put("count", payments.size());
 * return ResponseEntity.ok(response); } catch (Exception e) { Map<String,
 * Object> response = new HashMap<>(); response.put("status", "error");
 * response.put("message", e.getMessage()); return
 * ResponseEntity.badRequest().body(response); } }
 * 
 * @GetMapping("/date-range") public ResponseEntity<?> getPaymentsByDateRange(
 * 
 * @RequestParam String startDate,
 * 
 * @RequestParam String endDate) { try { LocalDate start =
 * LocalDate.parse(startDate); LocalDate end = LocalDate.parse(endDate);
 * List<Payment> payments = paymentService.getPaymentsByDateRange(start, end);
 * Map<String, Object> response = new HashMap<>(); response.put("status",
 * "success"); response.put("message",
 * "Payments retrieved by date range successfully"); response.put("data",
 * payments); response.put("count", payments.size()); return
 * ResponseEntity.ok(response); } catch (Exception e) { Map<String, Object>
 * response = new HashMap<>(); response.put("status", "error");
 * response.put("message", e.getMessage()); return
 * ResponseEntity.badRequest().body(response); } } }
 */













package com.pgm.pgm_Backend.controller;

import com.pgm.pgm_Backend.model.Payment;
import com.pgm.pgm_Backend.service.PaymentService;
import com.pgm.pgm_Backend.service.EmailService;
import com.pgm.pgm_Backend.model.Admin;
import com.pgm.pgm_Backend.utils.AdminContextUtil;

import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    private final PaymentService paymentService;
    private final EmailService emailService;

    public PaymentController(PaymentService paymentService, EmailService emailService) {
        this.paymentService = paymentService;
        this.emailService = emailService;
    }

    // 🔹 Get all payments
    @GetMapping
    public ResponseEntity<?> getAllPayments() {
        try {
            List<Payment> payments = paymentService.getAllPayments();

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "All payments retrieved successfully");
            response.put("data", payments);
            response.put("count", payments.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return errorResponse(e);
        }
    }

    // 🔹 Get payment by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getPaymentById(@PathVariable Long id) {
        try {
            Payment payment = paymentService.getPaymentById(id);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Payment retrieved successfully");
            response.put("data", payment);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return errorResponse(e);
        }
    }

    // 🔹 Create payment
    @PostMapping
    public ResponseEntity<?> createPayment(@Valid @RequestBody Payment payment) {
        try {
            Payment createdPayment = paymentService.createPayment(payment);

            // Send email (non-blocking)
            try {
                AdminContextUtil adminContextUtil = new AdminContextUtil();
                Admin admin = adminContextUtil.getCurrentAdmin();

                if (admin != null) {
                    emailService.sendPaymentSuccessEmail(
                            admin.getEmail(),
                            admin.getName(),
                            createdPayment.getTransactionId(),
                            createdPayment.getAmount(),
                            createdPayment.getMethod(),
                            createdPayment.getPaymentDate().toString(),
                            admin.getHostelName()
                    );
                    log.info("Payment success email sent to {}", admin.getEmail());
                }
            } catch (Exception ex) {
                log.error("Email sending failed: {}", ex.getMessage());
            }

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Payment created successfully");
            response.put("data", createdPayment);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            return errorResponse(e);
        }
    }

    // 🔹 Update payment
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePayment(@PathVariable Long id, @Valid @RequestBody Payment payment) {
        try {
            Payment updatedPayment = paymentService.updatePayment(id, payment);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Payment updated successfully");
            response.put("data", updatedPayment);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return errorResponse(e);
        }
    }

    // 🔹 Delete payment
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePayment(@PathVariable Long id) {
        try {
            paymentService.deletePayment(id);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Payment deleted successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return errorResponse(e);
        }
    }

    // 🔹 Payments by tenant
    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<?> getPaymentsByTenantId(@PathVariable Long tenantId) {
        try {
            List<Payment> payments = paymentService.getPaymentsByTenantId(tenantId);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Payments retrieved successfully");
            response.put("data", payments);
            response.put("count", payments.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return errorResponse(e);
        }
    }

    // 🔹 Payments by status
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getPaymentsByStatus(@PathVariable String status) {
        try {
            List<Payment> payments = paymentService.getPaymentsByStatus(status);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Payments retrieved successfully");
            response.put("data", payments);
            response.put("count", payments.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return errorResponse(e);
        }
    }

    // 🔹 Payments by date range
    @GetMapping("/date-range")
    public ResponseEntity<?> getPaymentsByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);

            List<Payment> payments = paymentService.getPaymentsByDateRange(start, end);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Payments retrieved successfully");
            response.put("data", payments);
            response.put("count", payments.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return errorResponse(e);
        }
    }

    // 🔹 Common error response
    private ResponseEntity<?> errorResponse(Exception e) {
        log.error("Error occurred: {}", e.getMessage());

        Map<String, Object> response = new HashMap<>();
        response.put("status", "error");
        response.put("message", e.getMessage());

        return ResponseEntity.badRequest().body(response);
    }
}