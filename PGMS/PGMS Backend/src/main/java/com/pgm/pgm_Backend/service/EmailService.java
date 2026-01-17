package com.pgm.pgm_Backend.service;

public interface EmailService {

        void sendOtpEmail(String toEmail, String otp, String adminName);

        void sendPasswordResetConfirmation(String toEmail, String adminName);

        void sendWelcomeEmail(String toEmail, String adminName, String pgHostelName);

        void sendAppointmentConfirmationEmail(String toEmail, String candidateName, String appointmentDate,
                        String appointmentTime, String adminName, String adminPhone, String message);

        void sendPaymentSuccessEmail(String adminEmail, String adminName, String transactionId,
                        Double amount, String paymentMethod, String paymentDate, String hostelName);

        void sendTicketResponseEmail(String toEmail, String adminName, Long ticketId, String ticketTitle,
                        String response, String status);

        void sendAccountFrozenEmail(String toEmail, String adminName, String hostelName);

        void sendAccountUnfrozenEmail(String toEmail, String adminName, String hostelName);
}
