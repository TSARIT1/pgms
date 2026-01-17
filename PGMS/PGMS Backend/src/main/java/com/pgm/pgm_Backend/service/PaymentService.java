package com.pgm.pgm_Backend.service;

import com.pgm.pgm_Backend.model.Payment;

import java.time.LocalDate;
import java.util.List;

public interface PaymentService {
    List<Payment> getAllPayments();
    Payment getPaymentById(Long id);
    Payment createPayment(Payment payment);
    Payment updatePayment(Long id, Payment payment);
    void deletePayment(Long id);
    List<Payment> getPaymentsByTenantId(Long tenantId);
    List<Payment> getPaymentsByStatus(String status);
    List<Payment> getPaymentsByDateRange(LocalDate startDate, LocalDate endDate);
    List<Payment> getPaymentsByStudent(String student);
    List<Payment> getPaymentsByMethod(String method);
}
