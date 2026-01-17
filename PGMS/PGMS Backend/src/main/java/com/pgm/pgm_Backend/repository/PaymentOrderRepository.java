package com.pgm.pgm_Backend.repository;

import com.pgm.pgm_Backend.model.PaymentOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentOrderRepository extends JpaRepository<PaymentOrder, Long> {

    Optional<PaymentOrder> findByRazorpayOrderId(String razorpayOrderId);

    List<PaymentOrder> findByAdminEmail(String adminEmail);

    List<PaymentOrder> findByAdminEmailOrderByCreatedAtDesc(String adminEmail);
}
