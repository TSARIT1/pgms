package com.pgm.pgm_Backend.controller;

import com.pgm.pgm_Backend.model.SubscriptionPlan;
import com.pgm.pgm_Backend.service.SubscriptionPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/subscription-plans")
@RequiredArgsConstructor
@CrossOrigin("*")
public class SubscriptionPlanController {

    private final SubscriptionPlanService subscriptionPlanService;
    
    

    public SubscriptionPlanController(SubscriptionPlanService subscriptionPlanService) {
		super();
		this.subscriptionPlanService = subscriptionPlanService;
	}

	@GetMapping
    public ResponseEntity<List<SubscriptionPlan>> getAllPlans() {
        return ResponseEntity.ok(subscriptionPlanService.getAllPlans());
    }

    @GetMapping("/active")
    public ResponseEntity<List<SubscriptionPlan>> getActivePlans() {
        return ResponseEntity.ok(subscriptionPlanService.getActivePlans());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubscriptionPlan> getPlanById(@PathVariable Long id) {
        return ResponseEntity.ok(subscriptionPlanService.getPlanById(id));
    }

    @PostMapping
    public ResponseEntity<?> createPlan(@RequestBody SubscriptionPlan plan) {
        try {
            SubscriptionPlan createdPlan = subscriptionPlanService.createPlan(plan);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Subscription plan created successfully");
            response.put("data", createdPlan);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePlan(@PathVariable Long id, @RequestBody SubscriptionPlan plan) {
        try {
            SubscriptionPlan updatedPlan = subscriptionPlanService.updatePlan(id, plan);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Subscription plan updated successfully");
            response.put("data", updatedPlan);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePlan(@PathVariable Long id) {
        try {
            subscriptionPlanService.deletePlan(id);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Subscription plan deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<?> togglePlanStatus(@PathVariable Long id) {
        try {
            SubscriptionPlan updatedPlan = subscriptionPlanService.togglePlanStatus(id);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Plan status toggled successfully");
            response.put("data", updatedPlan);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
