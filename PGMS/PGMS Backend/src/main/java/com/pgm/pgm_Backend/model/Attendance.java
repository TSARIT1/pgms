package com.pgm.pgm_Backend.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class Attendance {

    private Long id;

    @NotBlank(message = "Student name cannot be blank")
    private String studentName;

    private String roomNumber;

    @NotNull(message = "Date cannot be null")
    private LocalDate date;

    @NotBlank(message = "Status cannot be blank")
    private String status; // "Present" or "Absent"

    private String notes;

    public Attendance() {
    }

    public Attendance(Long id, String studentName, String roomNumber, LocalDate date, String status, String notes) {
        this.id = id;
        this.studentName = studentName;
        this.roomNumber = roomNumber;
        this.date = date;
        this.status = status;
        this.notes = notes;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
