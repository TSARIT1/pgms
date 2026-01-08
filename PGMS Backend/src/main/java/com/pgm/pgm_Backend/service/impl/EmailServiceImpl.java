package com.pgm.pgm_Backend.service.impl;

import com.pgm.pgm_Backend.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

        private final JavaMailSender mailSender;
        
        

        public EmailServiceImpl(JavaMailSender mailSender) {
			super();
			this.mailSender = mailSender;
		}

		@Override
        public void sendOtpEmail(String toEmail, String otp, String adminName) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(toEmail);
                message.setSubject("Password Reset OTP - PG/Hostel Management System");
                message.setText(String.format(
                                "Hello %s,\n\n" +
                                                "You have requested to reset your password.\n\n" +
                                                "Your OTP code is: %s\n\n" +
                                                "This OTP will expire in 10 minutes.\n\n" +
                                                "If you did not request this password reset, please ignore this email.\n\n"
                                                +
                                                "Best regards,\n" +
                                                "PG/Hostel Management System",
                                adminName, otp));

                mailSender.send(message);
        }

        @Override
        public void sendPasswordResetConfirmation(String toEmail, String adminName) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(toEmail);
                message.setSubject("Password Reset Successful - PG/Hostel Management System");
                message.setText(String.format(
                                "Hello %s,\n\n" +
                                                "Your password has been successfully reset.\n\n" +
                                                "If you did not make this change, please contact support immediately.\n\n"
                                                +
                                                "Best regards,\n" +
                                                "PG/Hostel Management System",
                                adminName));

                mailSender.send(message);
        }

        @Override
        public void sendWelcomeEmail(String toEmail, String adminName, String pgHostelName) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(toEmail);
                message.setSubject("Welcome to PG/Hostel Management System!");
                message.setText(String.format(
                                "Hello %s,\n\n" +
                                                "Welcome to the PG/Hostel Management System!\n\n" +
                                                "Your account for '%s' has been successfully created.\n\n" +
                                                "You can now:\n" +
                                                "• Manage students and rooms\n" +
                                                "• Track payments and attendance\n" +
                                                "• Handle appointments and staff\n" +
                                                "• Generate reports\n\n" +
                                                "Login to your dashboard to get started: http://localhost:5173/login\n\n"
                                                +
                                                "If you have any questions or need assistance, feel free to reach out.\n\n"
                                                +
                                                "Best regards,\n" +
                                                "PG/Hostel Management System Team",
                                adminName, pgHostelName));

                mailSender.send(message);
        }

        @Override
        public void sendAppointmentConfirmationEmail(String toEmail, String candidateName, String appointmentDate,
                        String appointmentTime, String adminName, String adminPhone, String customMessage) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(toEmail);
                message.setSubject("Appointment Confirmed - PG/Hostel Management System");
                message.setText(String.format(
                                "Hello %s,\n\n" +
                                                "Your appointment has been successfully confirmed!\n\n" +
                                                "Details:\n" +
                                                "Date: %s\n" +
                                                "Time: %s\n" +
                                                "Hostel/PG Admin: %s\n" +
                                                "Contact Number: %s\n\n" +
                                                "Message from Admin:\n%s\n\n" +
                                                "Please make sure to arrive on time. If you need to reschedule, please contact the admin directly.\n\n"
                                                +
                                                "Best regards,\n" +
                                                "PG/Hostel Management System",
                                candidateName, appointmentDate, appointmentTime, adminName, adminPhone,
                                (customMessage != null ? customMessage : "Looking forward to meeting you.")));

                mailSender.send(message);
        }

        @Override
        public void sendPaymentSuccessEmail(String adminEmail, String adminName, String transactionId,
                        Double amount, String paymentMethod, String paymentDate, String hostelName) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(adminEmail);
                message.setSubject("Payment Received - " + hostelName);
                message.setText(String.format(
                                "Hello %s,\n\n" +
                                                "A new payment has been successfully received for %s.\n\n" +
                                                "Payment Details:\n" +
                                                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                                                "Transaction ID: %s\n" +
                                                "Amount: ₹%.2f\n" +
                                                "Payment Method: %s\n" +
                                                "Payment Date: %s\n" +
                                                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                                                "This payment has been recorded in your system.\n" +
                                                "You can view detailed payment information in your dashboard.\n\n" +
                                                "Best regards,\n" +
                                                "PG/Hostel Management System",
                                adminName, hostelName, transactionId, amount, paymentMethod, paymentDate));

                mailSender.send(message);
        }

        @Override
        public void sendTicketResponseEmail(String toEmail, String adminName, Long ticketId, String ticketTitle,
                        String response, String status) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(toEmail);
                message.setSubject("Support Ticket Response - Ticket #" + ticketId);
                message.setText(String.format(
                                "Hello %s,\n\n" +
                                                "Your support ticket has been updated by our team.\n\n" +
                                                "Ticket Details:\n" +
                                                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                                                "Ticket ID: #%d\n" +
                                                "Title: %s\n" +
                                                "Status: %s\n" +
                                                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                                                "Response from Support Team:\n" +
                                                "%s\n\n" +
                                                "You can view your ticket details in your dashboard.\n" +
                                                "Login here: http://localhost:5173/login\n\n" +
                                                "If you have any further questions, feel free to raise another ticket.\n\n"
                                                +
                                                "Best regards,\n" +
                                                "PG/Hostel Management System Support Team",
                                adminName, ticketId, ticketTitle, status, response));

                mailSender.send(message);
        }

        @Override
        public void sendAccountFrozenEmail(String toEmail, String adminName, String hostelName) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(toEmail);
                message.setSubject("Account Frozen - Action Required");
                message.setText(String.format(
                                "Hello %s,\n\n" +
                                                "We are writing to inform you that your account for '%s' has been temporarily frozen by the system administrator.\n\n"
                                                +
                                                "Account Details:\n" +
                                                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                                                "PG/Hostel: %s\n" +
                                                "Email: %s\n" +
                                                "Status: FROZEN\n" +
                                                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                                                "What this means:\n" +
                                                "• You will not be able to log in to your account\n" +
                                                "• All system functionalities are temporarily disabled\n" +
                                                "• Your data remains safe and secure\n\n" +
                                                "Next Steps:\n" +
                                                "Please contact the SuperAdmin or support team to understand the reason for this action and discuss the steps needed to reactivate your account.\n\n"
                                                +
                                                "Support Contact:\n" +
                                                "Email: support@pgmanagement.com\n" +
                                                "Phone: +91-XXXXXXXXXX\n\n" +
                                                "We apologize for any inconvenience this may cause.\n\n" +
                                                "Best regards,\n" +
                                                "PG/Hostel Management System Team",
                                adminName, hostelName, hostelName, toEmail));

                mailSender.send(message);
        }

        @Override
        public void sendAccountUnfrozenEmail(String toEmail, String adminName, String hostelName) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(toEmail);
                message.setSubject("Account Reactivated - Welcome Back!");
                message.setText(String.format(
                                "Hello %s,\n\n" +
                                                "Great news! Your account for '%s' has been successfully reactivated by the system administrator.\n\n"
                                                +
                                                "Account Details:\n" +
                                                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                                                "PG/Hostel: %s\n" +
                                                "Email: %s\n" +
                                                "Status: ACTIVE\n" +
                                                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                                                "You can now:\n" +
                                                "• Log in to your dashboard\n" +
                                                "• Access all system features\n" +
                                                "• Manage your PG/Hostel operations\n\n" +
                                                "Login here: http://localhost:5173/login\n\n" +
                                                "If you experience any issues accessing your account, please contact our support team.\n\n"
                                                +
                                                "Support Contact:\n" +
                                                "Email: support@pgmanagement.com\n" +
                                                "Phone: +91-XXXXXXXXXX\n\n" +
                                                "Thank you for your patience and understanding.\n\n" +
                                                "Best regards,\n" +
                                                "PG/Hostel Management System Team",
                                adminName, hostelName, hostelName, toEmail));

                mailSender.send(message);
        }
}
