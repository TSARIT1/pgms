package com.pgm.pgm_Backend.model;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Room {

    private Long id;

    @NotBlank(message = "Room number cannot be blank")
    private String roomNumber;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @Min(value = 0, message = "Occupied beds cannot be negative")
    private Integer occupiedBeds;

    // JSON array storing occupied bed numbers, e.g., "[1,3,5]"
    private String occupiedBedNumbers;

    @DecimalMin(value = "0.0", inclusive = false, message = "Rent must be greater than 0")
    @NotNull(message = "Rent cannot be null")
    private Double rent;

    private String status;

    private String description;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getRoomNumber() {
		return roomNumber;
	}

	public void setRoomNumber(String roomNumber) {
		this.roomNumber = roomNumber;
	}

	public Integer getCapacity() {
		return capacity;
	}

	public void setCapacity(Integer capacity) {
		this.capacity = capacity;
	}

	public Integer getOccupiedBeds() {
		return occupiedBeds;
	}

	public void setOccupiedBeds(Integer occupiedBeds) {
		this.occupiedBeds = occupiedBeds;
	}

	public String getOccupiedBedNumbers() {
		return occupiedBedNumbers;
	}

	public void setOccupiedBedNumbers(String occupiedBedNumbers) {
		this.occupiedBedNumbers = occupiedBedNumbers;
	}

	public Double getRent() {
		return rent;
	}

	public void setRent(Double rent) {
		this.rent = rent;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}
    
    
    
}
