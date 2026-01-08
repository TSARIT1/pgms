package com.pgm.pgm_Backend.controller;

import com.pgm.pgm_Backend.model.Admin;
import com.pgm.pgm_Backend.model.PaymentOrder;
import com.pgm.pgm_Backend.model.SubscriptionPlan;
import com.pgm.pgm_Backend.repository.AdminRepository;
import com.pgm.pgm_Backend.repository.PaymentOrderRepository;
import com.pgm.pgm_Backend.repository.SubscriptionPlanRepository;
import com.pgm.pgm_Backend.service.RazorpayService;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/subscription-payment")
@CrossOrigin(origins = "*")
public class SubscriptionPaymentController {

    @Autowired
    private RazorpayService razorpayService;

    @Autowired
    private PaymentOrderRepository paymentOrderRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private SubscriptionPlanRepository subscriptionPlanRepository;

    @Value("${razorpay.currency}")
    private String currency;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    /**
     * Create a payment order for subscription
     */
    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> orderData, Authentication authentication) {
        try {
            String adminEmail = authentication.getName();
            String planName = (String) orderData.get("planName");
            Double amount = Double.parseDouble(orderData.get("amount").toString());

            // Generate unique receipt ID
            String receipt = "sub_" + System.currentTimeMillis();

            // Create Razorpay order
            JSONObject razorpayOrder = razorpayService.createOrder(amount, currency, receipt);

            // Save payment order in database
            PaymentOrder paymentOrder = new PaymentOrder();
            paymentOrder.setRazorpayOrderId(razorpayOrder.getString("id"));
            paymentOrder.setAdminEmail(adminEmail);
            paymentOrder.setSubscriptionPlanName(planName);
            paymentOrder.setAmount(amount);
            paymentOrder.setCurrency(currency);
            paymentOrder.setStatus("CREATED");

            paymentOrderRepository.save(paymentOrder);

            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("razorpayOrderId", razorpayOrder.getString("id"));
            response.put("amount", razorpayOrder.getInt("amount"));
            response.put("currency", razorpayOrder.getString("currency"));
            response.put("keyId", razorpayKeyId);

            return ResponseEntity.ok(response);
        } catch (RazorpayException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Failed to create payment order: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "An error occurred: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Verify payment and activate subscription
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> paymentData,
            Authentication authentication) {
        try {
            String adminEmail = authentication.getName();
            String orderId = paymentData.get("orderId");
            String paymentId = paymentData.get("paymentId");
            String signature = paymentData.get("signature");

            // Verify payment signature
            boolean isValid = razorpayService.verifyPaymentSignature(orderId, paymentId, signature);

            if (!isValid) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("status", "error");
                errorResponse.put("message", "Invalid payment signature");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }

            // Find payment order
            Optional<PaymentOrder> paymentOrderOpt = paymentOrderRepository.findByRazorpayOrderId(orderId);
            if (paymentOrderOpt.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("status", "error");
                errorResponse.put("message", "Payment order not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }

            PaymentOrder paymentOrder = paymentOrderOpt.get();

            // Update payment order status
            paymentOrder.setStatus("PAID");
            paymentOrder.setRazorpayPaymentId(paymentId);
            paymentOrder.setRazorpaySignature(signature);
            paymentOrder.setPaidAt(LocalDateTime.now());
            paymentOrderRepository.save(paymentOrder);

            // Activate subscription for admin
            Optional<Admin> adminOpt = adminRepository.findByEmail(adminEmail);
            if (adminOpt.isPresent()) {
                Admin admin = adminOpt.get();
                admin.setSubscriptionPlan(paymentOrder.getSubscriptionPlanName());

                // Fetch plan details to get correct duration
                Optional<SubscriptionPlan> planOpt = subscriptionPlanRepository
                        .findByName(paymentOrder.getSubscriptionPlanName());
                LocalDateTime startDate = LocalDateTime.now();
                LocalDateTime endDate;

                if (planOpt.isPresent()) {
                    SubscriptionPlan plan = planOpt.get();
                    // Calculate end date based on plan's duration and type
                    if ("DAY".equalsIgnoreCase(plan.getDurationType())) {
                        endDate = startDate.plusDays(plan.getDuration());
                    } else if ("MONTH".equalsIgnoreCase(plan.getDurationType())) {
                        endDate = startDate.plusMonths(plan.getDuration());
                    } else {
                        // Default to 1 month if duration type is unknown
                        endDate = startDate.plusMonths(1);
                    }
                } else {
                    // Fallback to 1 month if plan not found
                    endDate = startDate.plusMonths(1);
                }

                admin.setSubscriptionStartDate(startDate);
                admin.setSubscriptionEndDate(endDate);
                adminRepository.save(admin);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Payment verified and subscription activated");
            response.put("subscriptionPlan", paymentOrder.getSubscriptionPlanName());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Payment verification failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get payment history for logged-in admin
     */
    @GetMapping("/orders")
    public ResponseEntity<?> getPaymentOrders(Authentication authentication) {
        try {
            String adminEmail = authentication.getName();
            List<PaymentOrder> orders = paymentOrderRepository.findByAdminEmailOrderByCreatedAtDesc(adminEmail);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("orders", orders);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Failed to fetch payment orders: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Activate a free subscription plan (price = 0) without payment
     */
    @PostMapping("/activate-free-plan")
    public ResponseEntity<?> activateFreePlan(@RequestBody Map<String, String> planData,
            Authentication authentication) {
        try {
            String adminEmail = authentication.getName();
            String planName = planData.get("planName");

            // Get admin
            Optional<Admin> adminOpt = adminRepository.findByEmail(adminEmail);
            if (adminOpt.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("status", "error");
                errorResponse.put("message", "Admin not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }

            Admin admin = adminOpt.get();

            // Fetch plan details to get correct duration
            Optional<SubscriptionPlan> planOpt = subscriptionPlanRepository.findByName(planName);
            LocalDateTime startDate = LocalDateTime.now();
            LocalDateTime endDate;

            if (planOpt.isPresent()) {
                SubscriptionPlan plan = planOpt.get();
                // Calculate end date based on plan's duration and type
                if ("DAY".equalsIgnoreCase(plan.getDurationType())) {
                    endDate = startDate.plusDays(plan.getDuration());
                } else if ("MONTH".equalsIgnoreCase(plan.getDurationType())) {
                    endDate = startDate.plusMonths(plan.getDuration());
                } else {
                    // Default to 1 month if duration type is unknown
                    endDate = startDate.plusMonths(1);
                }
            } else {
                // Fallback to 1 month if plan not found
                endDate = startDate.plusMonths(1);
            }

            // Set subscription plan and dates
            admin.setSubscriptionPlan(planName);
            admin.setSubscriptionStartDate(startDate);
            admin.setSubscriptionEndDate(endDate);
            adminRepository.save(admin);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Free plan activated successfully");
            response.put("subscriptionPlan", planName);
            response.put("subscriptionStartDate", admin.getSubscriptionStartDate());
            response.put("subscriptionEndDate", admin.getSubscriptionEndDate());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Failed to activate free plan: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
