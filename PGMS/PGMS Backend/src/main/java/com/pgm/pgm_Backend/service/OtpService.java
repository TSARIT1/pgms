package com.pgm.pgm_Backend.service;

public interface OtpService {

    String generateAndSendOtp(String email, String adminName);

    boolean verifyOtp(String email, String otp);

    boolean isOtpVerified(String email, String otp);

    void cleanupExpiredOtps();

    // Login OTP methods
    String generateAndSendLoginOtp(String email, String adminName);

    boolean verifyLoginOtp(String email, String otp);
}
