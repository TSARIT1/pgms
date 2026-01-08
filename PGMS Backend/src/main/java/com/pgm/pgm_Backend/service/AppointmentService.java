package com.pgm.pgm_Backend.service;

import com.pgm.pgm_Backend.model.Appointment;
import java.util.List;

public interface AppointmentService {
    Appointment createAppointment(Appointment appointment);

    List<Appointment> getAllAppointments();

    List<Appointment> getAppointmentsByAdminId(Long adminId);

    Appointment getAppointmentById(Long id);

    Appointment updateAppointmentStatus(Long id, String status);

    void deleteAppointment(Long id);
}
