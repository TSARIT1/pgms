package com.pgm.pgm_Backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "payment_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String razorpayOrderId;

    @Column(nullable = false)
    private String adminEmail;

    @Column(nullable = false)
    private String subscriptionPlanName;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String currency;

    @Column(nullable = false)
    private String status; // CREATED, PAID, FAILED

    private String razorpayPaymentId;

    private String razorpaySignature;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime paidAt;

    
    
    public Long getId() {
		return id;
	}



	public void setId(Long id) {
		this.id = id;
	}



	public String getRazorpayOrderId() {
		return razorpayOrderId;
	}



	public void setRazorpayOrderId(String razorpayOrderId) {
		this.razorpayOrderId = razorpayOrderId;
	}



	public String getAdminEmail() {
		return adminEmail;
	}



	public void setAdminEmail(String adminEmail) {
		this.adminEmail = adminEmail;
	}



	public String getSubscriptionPlanName() {
		return subscriptionPlanName;
	}



	public void setSubscriptionPlanName(String subscriptionPlanName) {
		this.subscriptionPlanName = subscriptionPlanName;
	}



	public Double getAmount() {
		return amount;
	}



	public void setAmount(Double amount) {
		this.amount = amount;
	}



	public String getCurrency() {
		return currency;
	}



	public void setCurrency(String currency) {
		this.currency = currency;
	}



	public String getStatus() {
		return status;
	}



	public void setStatus(String status) {
		this.status = status;
	}



	public String getRazorpayPaymentId() {
		return razorpayPaymentId;
	}



	public void setRazorpayPaymentId(String razorpayPaymentId) {
		this.razorpayPaymentId = razorpayPaymentId;
	}



	public String getRazorpaySignature() {
		return razorpaySignature;
	}



	public void setRazorpaySignature(String razorpaySignature) {
		this.razorpaySignature = razorpaySignature;
	}



	public LocalDateTime getCreatedAt() {
		return createdAt;
	}



	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}



	public LocalDateTime getPaidAt() {
		return paidAt;
	}



	public void setPaidAt(LocalDateTime paidAt) {
		this.paidAt = paidAt;
	}



	@PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = "CREATED";
        }
    }
}
