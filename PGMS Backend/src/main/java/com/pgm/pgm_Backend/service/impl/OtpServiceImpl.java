/*
 * package com.pgm.pgm_Backend.service.impl;
 * 
 * import com.pgm.pgm_Backend.model.OtpVerification; import
 * com.pgm.pgm_Backend.repository.OtpRepository; import
 * com.pgm.pgm_Backend.service.EmailService; import
 * com.pgm.pgm_Backend.service.OtpService; import
 * jakarta.transaction.Transactional; import lombok.RequiredArgsConstructor;
 * import org.springframework.beans.factory.annotation.Value; import
 * org.springframework.stereotype.Service;
 * 
 * import java.time.LocalDateTime; import java.util.Random;
 * 
 * @Service
 * 
 * @RequiredArgsConstructor public class OtpServiceImpl implements OtpService {
 * 
 * private final OtpRepository otpRepository; private final EmailService
 * emailService;
 * 
 * 
 * 
 * public OtpServiceImpl(OtpRepository otpRepository, EmailService emailService,
 * int otpExpiryMinutes) { super(); this.otpRepository = otpRepository;
 * this.emailService = emailService; this.otpExpiryMinutes = otpExpiryMinutes; }
 * 
 * @Value("${otp.expiry.minutes:10}") private int otpExpiryMinutes;
 * 
 * @Override
 * 
 * @Transactional public String generateAndSendOtp(String email, String
 * adminName) { // Delete any existing OTPs for this email
 * otpRepository.deleteByEmail(email);
 * 
 * // Generate 6-digit OTP String otp = String.format("%06d", new
 * Random().nextInt(1000000));
 * 
 * // Create OTP verification record OtpVerification otpVerification = new
 * OtpVerification(); otpVerification.setEmail(email);
 * otpVerification.setOtp(otp); otpVerification.setOtpType("PASSWORD_RESET");
 * otpVerification.setExpiryTime(LocalDateTime.now().plusMinutes(
 * otpExpiryMinutes)); otpVerification.setVerified(false);
 * 
 * otpRepository.save(otpVerification);
 * 
 * // Send OTP via email emailService.sendOtpEmail(email, otp, adminName);
 * 
 * return otp; }
 * 
 * @Override
 * 
 * @Transactional public boolean verifyOtp(String email, String otp) { var
 * otpVerificationOpt = otpRepository.findByEmailAndOtp(email, otp);
 * 
 * if (otpVerificationOpt.isEmpty()) { return false; }
 * 
 * OtpVerification otpVerification = otpVerificationOpt.get();
 * 
 * // Check if OTP is expired if (otpVerification.isExpired()) { return false; }
 * 
 * // Check if already verified if (otpVerification.getVerified()) { return
 * false; }
 * 
 * // Mark as verified otpVerification.setVerified(true);
 * otpRepository.save(otpVerification);
 * 
 * return true; }
 * 
 * @Override public boolean isOtpVerified(String email, String otp) { var
 * otpVerificationOpt = otpRepository.findByEmailAndOtp(email, otp);
 * 
 * if (otpVerificationOpt.isEmpty()) { return false; }
 * 
 * OtpVerification otpVerification = otpVerificationOpt.get();
 * 
 * // Check if OTP is expired if (otpVerification.isExpired()) { return false; }
 * 
 * // Check if it's verified return otpVerification.getVerified(); }
 * 
 * @Override
 * 
 * @Transactional public void cleanupExpiredOtps() {
 * otpRepository.deleteByExpiryTimeBefore(LocalDateTime.now()); }
 * 
 * @Override
 * 
 * @Transactional public String generateAndSendLoginOtp(String email, String
 * adminName) { // Delete any existing LOGIN OTPs for this email
 * otpRepository.deleteByEmail(email);
 * 
 * // Generate 6-digit OTP String otp = String.format("%06d", new
 * Random().nextInt(1000000));
 * 
 * // Create OTP verification record for LOGIN OtpVerification otpVerification =
 * new OtpVerification(); otpVerification.setEmail(email);
 * otpVerification.setOtp(otp); otpVerification.setOtpType("LOGIN");
 * otpVerification.setExpiryTime(LocalDateTime.now().plusMinutes(5)); // 5
 * minutes for login OTP otpVerification.setVerified(false);
 * 
 * otpRepository.save(otpVerification);
 * 
 * // Send OTP via email emailService.sendOtpEmail(email, otp, adminName);
 * 
 * return otp; }
 * 
 * @Override
 * 
 * @Transactional public boolean verifyLoginOtp(String email, String otp) { var
 * otpVerificationOpt = otpRepository.findByEmailAndOtp(email, otp);
 * 
 * if (otpVerificationOpt.isEmpty()) { return false; }
 * 
 * OtpVerification otpVerification = otpVerificationOpt.get();
 * 
 * // Check if it's a LOGIN OTP if
 * (!"LOGIN".equals(otpVerification.getOtpType())) { return false; }
 * 
 * // Check if OTP is expired if (otpVerification.isExpired()) { return false; }
 * 
 * // Check if already verified if (otpVerification.getVerified()) { return
 * false; }
 * 
 * // Mark as verified otpVerification.setVerified(true);
 * otpRepository.save(otpVerification);
 * 
 * // Delete the OTP after successful verification
 * otpRepository.delete(otpVerification);
 * 
 * return true; } }
 */






package com.pgm.pgm_Backend.service.impl;

import com.pgm.pgm_Backend.model.OtpVerification;
import com.pgm.pgm_Backend.repository.OtpRepository;
import com.pgm.pgm_Backend.service.EmailService;
import com.pgm.pgm_Backend.service.OtpService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class OtpServiceImpl implements OtpService {

    private final OtpRepository otpRepository;
    private final EmailService emailService;

    @Value("${otp.expiry.minutes:10}")
    private int otpExpiryMinutes;
    
    
    public OtpServiceImpl(
            OtpRepository otpRepository,
            EmailService emailService,
            @Value("${otp.expiry.minutes:10}") int otpExpiryMinutes) {

        this.otpRepository = otpRepository;
        this.emailService = emailService;
        this.otpExpiryMinutes = otpExpiryMinutes;
    }

    @Override
    @Transactional
    public String generateAndSendOtp(String email, String adminName) {

        otpRepository.deleteByEmail(email);

        String otp = String.format("%06d", new Random().nextInt(1000000));

        OtpVerification otpVerification = new OtpVerification();
        otpVerification.setEmail(email);
        otpVerification.setOtp(otp);
        otpVerification.setOtpType("PASSWORD_RESET");
        otpVerification.setExpiryTime(LocalDateTime.now().plusMinutes(otpExpiryMinutes));
        otpVerification.setVerified(false);

        otpRepository.save(otpVerification);

        emailService.sendOtpEmail(email, otp, adminName);

        return otp;
    }

    @Override
    @Transactional
    public boolean verifyOtp(String email, String otp) {

        var otpVerificationOpt = otpRepository.findByEmailAndOtp(email, otp);
        if (otpVerificationOpt.isEmpty()) return false;

        OtpVerification otpVerification = otpVerificationOpt.get();

        if (otpVerification.isExpired()) return false;
        if (otpVerification.getVerified()) return false;

        otpVerification.setVerified(true);
        otpRepository.save(otpVerification);

        return true;
    }

    @Override
    public boolean isOtpVerified(String email, String otp) {

        var otpVerificationOpt = otpRepository.findByEmailAndOtp(email, otp);
        if (otpVerificationOpt.isEmpty()) return false;

        OtpVerification otpVerification = otpVerificationOpt.get();
        if (otpVerification.isExpired()) return false;

        return otpVerification.getVerified();
    }

    @Override
    @Transactional
    public void cleanupExpiredOtps() {
        otpRepository.deleteByExpiryTimeBefore(LocalDateTime.now());
    }

    @Override
    @Transactional
    public String generateAndSendLoginOtp(String email, String adminName) {

        otpRepository.deleteByEmail(email);

        String otp = String.format("%06d", new Random().nextInt(1000000));

        OtpVerification otpVerification = new OtpVerification();
        otpVerification.setEmail(email);
        otpVerification.setOtp(otp);
        otpVerification.setOtpType("LOGIN");
        otpVerification.setExpiryTime(LocalDateTime.now().plusMinutes(5));
        otpVerification.setVerified(false);

        otpRepository.save(otpVerification);

        emailService.sendOtpEmail(email, otp, adminName);

        return otp;
    }

    @Override
    @Transactional
    public boolean verifyLoginOtp(String email, String otp) {

        var otpVerificationOpt = otpRepository.findByEmailAndOtp(email, otp);
        if (otpVerificationOpt.isEmpty()) return false;

        OtpVerification otpVerification = otpVerificationOpt.get();

        if (!"LOGIN".equals(otpVerification.getOtpType())) return false;
        if (otpVerification.isExpired()) return false;
        if (otpVerification.getVerified()) return false;

        otpVerification.setVerified(true);
        otpRepository.save(otpVerification);
        otpRepository.delete(otpVerification);

        return true;
    }
}