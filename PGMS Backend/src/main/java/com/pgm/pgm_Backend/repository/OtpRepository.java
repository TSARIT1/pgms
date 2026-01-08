package com.pgm.pgm_Backend.repository;

import com.pgm.pgm_Backend.model.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<OtpVerification, Long> {

    Optional<OtpVerification> findByEmailAndOtp(String email, String otp);

    Optional<OtpVerification> findFirstByEmailOrderByCreatedAtDesc(String email);

    List<OtpVerification> findByEmail(String email);

    void deleteByEmail(String email);

    void deleteByExpiryTimeBefore(LocalDateTime dateTime);
}
