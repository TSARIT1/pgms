package com.pgm.pgm_Backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "admin_id", nullable = false)
    private Admin admin; // The PG/Hostel owner

    @Column(name = "candidate_name", nullable = false)
    private String candidateName;

    @Column(name = "candidate_phone", nullable = false)
    private String candidatePhone;

    @Column(name = "candidate_email", nullable = false)
    private String candidateEmail;

    @Column(name = "appointment_date", nullable = false)
    private LocalDateTime appointmentDate;

    @Column(name = "message")
    private String message;

    @Column(name = "status")
    private String status = "PENDING"; // PENDING, CONFIRMED, CANCELLED

    @Column(nullable = false, updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    
    
    public Long getId() {
		return id;
	}



	public void setId(Long id) {
		this.id = id;
	}



	public Admin getAdmin() {
		return admin;
	}



	public void setAdmin(Admin admin) {
		this.admin = admin;
	}



	public String getCandidateName() {
		return candidateName;
	}



	public void setCandidateName(String candidateName) {
		this.candidateName = candidateName;
	}



	public String getCandidatePhone() {
		return candidatePhone;
	}



	public void setCandidatePhone(String candidatePhone) {
		this.candidatePhone = candidatePhone;
	}



	public String getCandidateEmail() {
		return candidateEmail;
	}



	public void setCandidateEmail(String candidateEmail) {
		this.candidateEmail = candidateEmail;
	}



	public LocalDateTime getAppointmentDate() {
		return appointmentDate;
	}



	public void setAppointmentDate(LocalDateTime appointmentDate) {
		this.appointmentDate = appointmentDate;
	}



	public String getMessage() {
		return message;
	}



	public void setMessage(String message) {
		this.message = message;
	}



	public String getStatus() {
		return status;
	}



	public void setStatus(String status) {
		this.status = status;
	}



	public LocalDateTime getCreatedAt() {
		return createdAt;
	}



	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}



	@PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
