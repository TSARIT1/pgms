package com.pgm.pgm_Backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "admins")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Admin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name cannot be blank")
    @Column(nullable = false)
    private String name;

    @Email(message = "Email should be valid")
    @NotBlank(message = "Email cannot be blank")
    @Column(nullable = false, unique = true)
    private String email;

    @NotBlank(message = "Phone cannot be blank")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone must be 10 digits")
    @Column(nullable = false, unique = true)
    private String phone;

    @NotBlank(message = "Password cannot be blank")
    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 50)
    private String type; // e.g., "Admin", "Manager"

    @Column(nullable = false, length = 20, columnDefinition = "VARCHAR(20) DEFAULT 'ADMIN'")
    private String role = "ADMIN"; // ADMIN or SUPER_ADMIN

    @Column(name = "photo_url")
    private String photoUrl;

    @Column(name = "hostel_address")
    private String hostelAddress;

    @Column(name = "hostel_name")
    private String hostelName;

    @Column(name = "location_link", length = 500)
    private String locationLink;

    @Column(name = "hostel_photos", length = 2000)
    private String hostelPhotos; // JSON array of photo URLs

    @Column(name = "hostel_type", length = 50)
    private String hostelType; // Normal, Co-living, Boys, Girls, Others

    @Column(name = "subscription_plan", length = 50)
    private String subscriptionPlan; // BASIC, PREMIUM, ENTERPRISE

    @Column(name = "subscription_start_date")
    private java.time.LocalDateTime subscriptionStartDate;

    @Column(name = "subscription_end_date")
    private java.time.LocalDateTime subscriptionEndDate;

    @Column(name = "is_frozen", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean isFrozen = false;

    @Column(name = "referred_by")
    private String referredBy; // Optional field to track who referred this admin

    @jakarta.persistence.Transient
    private Long planId; // Temporary field to receive plan ID from frontend (not stored in DB)

    @Column(nullable = false, updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private java.time.LocalDateTime createdAt;

    @Column(columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    private java.time.LocalDateTime updatedAt;

    
    
    public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getRole() {
		return role;
	}

	public void setRole(String role) {
		this.role = role;
	}

	public String getPhotoUrl() {
		return photoUrl;
	}

	public void setPhotoUrl(String photoUrl) {
		this.photoUrl = photoUrl;
	}

	public String getHostelAddress() {
		return hostelAddress;
	}

	public void setHostelAddress(String hostelAddress) {
		this.hostelAddress = hostelAddress;
	}

	public String getHostelName() {
		return hostelName;
	}

	public void setHostelName(String hostelName) {
		this.hostelName = hostelName;
	}

	public String getLocationLink() {
		return locationLink;
	}

	public void setLocationLink(String locationLink) {
		this.locationLink = locationLink;
	}

	public String getHostelPhotos() {
		return hostelPhotos;
	}

	public void setHostelPhotos(String hostelPhotos) {
		this.hostelPhotos = hostelPhotos;
	}

	public String getHostelType() {
		return hostelType;
	}

	public void setHostelType(String hostelType) {
		this.hostelType = hostelType;
	}

	public String getSubscriptionPlan() {
		return subscriptionPlan;
	}

	public void setSubscriptionPlan(String subscriptionPlan) {
		this.subscriptionPlan = subscriptionPlan;
	}

	public java.time.LocalDateTime getSubscriptionStartDate() {
		return subscriptionStartDate;
	}

	public void setSubscriptionStartDate(java.time.LocalDateTime subscriptionStartDate) {
		this.subscriptionStartDate = subscriptionStartDate;
	}

	public java.time.LocalDateTime getSubscriptionEndDate() {
		return subscriptionEndDate;
	}

	public void setSubscriptionEndDate(java.time.LocalDateTime subscriptionEndDate) {
		this.subscriptionEndDate = subscriptionEndDate;
	}

	public Boolean getIsFrozen() {
		return isFrozen;
	}

	public void setIsFrozen(Boolean isFrozen) {
		this.isFrozen = isFrozen;
	}

	public String getReferredBy() {
		return referredBy;
	}

	public void setReferredBy(String referredBy) {
		this.referredBy = referredBy;
	}

	public Long getPlanId() {
		return planId;
	}

	public void setPlanId(Long planId) {
		this.planId = planId;
	}

	public java.time.LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(java.time.LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public java.time.LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(java.time.LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}

	@PrePersist
    protected void onCreate() {
        createdAt = java.time.LocalDateTime.now();
        updatedAt = java.time.LocalDateTime.now();
        if (isFrozen == null) {
            isFrozen = false;
        }
        if (role == null || role.isEmpty()) {
            role = "ADMIN";
        }
        if (type == null || type.isEmpty()) {
            type = "PG/Hostel Owner";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = java.time.LocalDateTime.now();
    }
}
