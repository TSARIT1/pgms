package com.pgm.pgm_Backend.service.impl;

import com.pgm.pgm_Backend.exception.ResourceNotFoundException;
import com.pgm.pgm_Backend.model.Appointment;
import com.pgm.pgm_Backend.repository.AppointmentRepository;
import com.pgm.pgm_Backend.service.AppointmentService;
import com.pgm.pgm_Backend.service.EmailService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final com.pgm.pgm_Backend.service.EmailService emailService;
    
    

    public AppointmentServiceImpl(AppointmentRepository appointmentRepository, EmailService emailService) {
		super();
		this.appointmentRepository = appointmentRepository;
		this.emailService = emailService;
	}

	@Override
    public Appointment createAppointment(Appointment appointment) {
        return appointmentRepository.save(appointment);
    }

    @Override
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    @Override
    public List<Appointment> getAppointmentsByAdminId(Long adminId) {
        return appointmentRepository.findByAdminId(adminId);
    }

    @Override
    public Appointment getAppointmentById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
    }

    @Override
    public Appointment updateAppointmentStatus(Long id, String status) {
        Appointment appointment = getAppointmentById(id);
        appointment.setStatus(status);
        Appointment updatedAppointment = appointmentRepository.save(appointment);

        // Send confirmation email if status is confirmed
        if ("Confirmed".equalsIgnoreCase(status) || "Approved".equalsIgnoreCase(status)) {
            try {
                emailService.sendAppointmentConfirmationEmail(
                        updatedAppointment.getCandidateEmail(),
                        updatedAppointment.getCandidateName(),
                        updatedAppointment.getAppointmentDate().toLocalDate().toString(),
                        updatedAppointment.getAppointmentDate().toLocalTime().toString(),
                        updatedAppointment.getAdmin().getName(),
                        updatedAppointment.getAdmin().getPhone(),
                        updatedAppointment.getMessage());
            } catch (Exception e) {
                System.err.println("Failed to send appointment confirmation email: " + e.getMessage());
            }
        }

        return updatedAppointment;
    }

    @Override
    public void deleteAppointment(Long id) {
        Appointment appointment = getAppointmentById(id);
        appointmentRepository.delete(appointment);
    }
}
