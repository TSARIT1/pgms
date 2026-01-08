package com.pgm.pgm_Backend.repository;

import com.pgm.pgm_Backend.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByAdminId(Long adminId);

    List<Appointment> findByStatus(String status);
}
