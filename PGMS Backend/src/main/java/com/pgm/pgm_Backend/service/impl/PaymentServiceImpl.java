package com.pgm.pgm_Backend.service.impl;

import com.pgm.pgm_Backend.exception.ResourceNotFoundException;
import com.pgm.pgm_Backend.model.Payment;
import com.pgm.pgm_Backend.repository.DynamicPaymentRepository;
import com.pgm.pgm_Backend.service.PaymentService;
import com.pgm.pgm_Backend.utils.AdminContextUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final DynamicPaymentRepository dynamicPaymentRepository;
    private final AdminContextUtil adminContextUtil;
    
    

    public PaymentServiceImpl(DynamicPaymentRepository dynamicPaymentRepository, AdminContextUtil adminContextUtil) {
		super();
		this.dynamicPaymentRepository = dynamicPaymentRepository;
		this.adminContextUtil = adminContextUtil;
	}

	@Override
    public List<Payment> getAllPayments() {
        Long adminId = adminContextUtil.getCurrentAdminId();
        return dynamicPaymentRepository.findAll(adminId);
    }

    @Override
    public Payment getPaymentById(Long id) {
        Long adminId = adminContextUtil.getCurrentAdminId();
        return dynamicPaymentRepository.findById(adminId, id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));
    }

    @Override
    public Payment createPayment(Payment payment) {
        Long adminId = adminContextUtil.getCurrentAdminId();
        return dynamicPaymentRepository.save(adminId, payment);
    }

    @Override
    public Payment updatePayment(Long id, Payment paymentDetails) {
        Long adminId = adminContextUtil.getCurrentAdminId();
        Payment payment = getPaymentById(id);

        if (paymentDetails.getStudent() != null) {
            payment.setStudent(paymentDetails.getStudent());
        }
        if (paymentDetails.getAmount() != null) {
            payment.setAmount(paymentDetails.getAmount());
        }
        if (paymentDetails.getPaymentDate() != null) {
            payment.setPaymentDate(paymentDetails.getPaymentDate());
        }
        if (paymentDetails.getMethod() != null) {
            payment.setMethod(paymentDetails.getMethod());
        }
        if (paymentDetails.getStatus() != null) {
            payment.setStatus(paymentDetails.getStatus());
        }
        if (paymentDetails.getNotes() != null) {
            payment.setNotes(paymentDetails.getNotes());
        }
        if (paymentDetails.getTenantId() != null) {
            payment.setTenantId(paymentDetails.getTenantId());
        }

        return dynamicPaymentRepository.save(adminId, payment);
    }

    @Override
    public void deletePayment(Long id) {
        Long adminId = adminContextUtil.getCurrentAdminId();
        Payment payment = getPaymentById(id);
        dynamicPaymentRepository.deleteById(adminId, id);
    }

    @Override
    public List<Payment> getPaymentsByTenantId(Long tenantId) {
        Long adminId = adminContextUtil.getCurrentAdminId();
        // Filter by tenantId manually
        return dynamicPaymentRepository.findAll(adminId).stream()
                .filter(p -> tenantId.equals(p.getTenantId()))
                .toList();
    }

    @Override
    public List<Payment> getPaymentsByStatus(String status) {
        Long adminId = adminContextUtil.getCurrentAdminId();
        return dynamicPaymentRepository.findByStatus(adminId, status);
    }

    @Override
    public List<Payment> getPaymentsByDateRange(LocalDate startDate, LocalDate endDate) {
        Long adminId = adminContextUtil.getCurrentAdminId();
        return dynamicPaymentRepository.findByPaymentDateBetween(adminId, startDate, endDate);
    }

    @Override
    public List<Payment> getPaymentsByStudent(String student) {
        Long adminId = adminContextUtil.getCurrentAdminId();
        return dynamicPaymentRepository.findByStudent(adminId, student);
    }

    @Override
    public List<Payment> getPaymentsByMethod(String method) {
        Long adminId = adminContextUtil.getCurrentAdminId();
        return dynamicPaymentRepository.findByMethod(adminId, method);
    }
}
