package com.pgm.pgm_Backend.repository;

import com.pgm.pgm_Backend.mapper.PaymentRowMapper;
import com.pgm.pgm_Backend.model.Payment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public class DynamicPaymentRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private String getTableName(Long adminId) {
        return "admin_" + adminId + "_payments";
    }

    public List<Payment> findAll(Long adminId) {
        String sql = "SELECT * FROM " + getTableName(adminId);
        return jdbcTemplate.query(sql, new PaymentRowMapper());
    }

    public Optional<Payment> findById(Long adminId, Long id) {
        String sql = "SELECT * FROM " + getTableName(adminId) + " WHERE id = ?";
        List<Payment> results = jdbcTemplate.query(sql, new PaymentRowMapper(), id);
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    public Payment save(Long adminId, Payment payment) {
        if (payment.getId() == null) {
            return insert(adminId, payment);
        } else {
            return update(adminId, payment);
        }
    }

    private Payment insert(Long adminId, Payment payment) {
        String sql = "INSERT INTO " + getTableName(adminId) +
                " (tenant_id, student, amount, payment_date, method, status, notes, " +
                "transaction_id, transaction_details, created_at, updated_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        KeyHolder keyHolder = new GeneratedKeyHolder();

        LocalDateTime now = LocalDateTime.now();
        String status = payment.getStatus() != null ? payment.getStatus() : "COMPLETED";

        // Auto-generate transaction ID if not provided
        String transactionId = payment.getTransactionId();
        if (transactionId == null || transactionId.trim().isEmpty()) {
            long timestamp = System.currentTimeMillis();
            int random = (int) (Math.random() * 10000);
            transactionId = String.format("TXN%d%04d", timestamp, random);
        }

        // Auto-generate transaction details if not provided
        String transactionDetails = payment.getTransactionDetails();
        if (transactionDetails == null || transactionDetails.trim().isEmpty()) {
            transactionDetails = String.format("Payment of ₹%.2f by %s via %s on %s",
                    payment.getAmount(), payment.getStudent(), payment.getMethod(), payment.getPaymentDate());
        }

        String finalTransactionId = transactionId;
        String finalTransactionDetails = transactionDetails;

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            if (payment.getTenantId() != null) {
                ps.setLong(1, payment.getTenantId());
            } else {
                ps.setNull(1, java.sql.Types.BIGINT);
            }
            ps.setString(2, payment.getStudent());
            ps.setDouble(3, payment.getAmount());
            ps.setDate(4, java.sql.Date.valueOf(payment.getPaymentDate()));
            ps.setString(5, payment.getMethod());
            ps.setString(6, status);
            ps.setString(7, payment.getNotes());
            ps.setString(8, finalTransactionId);
            ps.setString(9, finalTransactionDetails);
            ps.setObject(10, now);
            ps.setObject(11, now);
            return ps;
        }, keyHolder);

        payment.setId(keyHolder.getKey().longValue());
        payment.setCreatedAt(now);
        payment.setUpdatedAt(now);
        payment.setStatus(status);
        payment.setTransactionId(transactionId);
        payment.setTransactionDetails(transactionDetails);
        return payment;
    }

    private Payment update(Long adminId, Payment payment) {
        String sql = "UPDATE " + getTableName(adminId) +
                " SET tenant_id = ?, student = ?, amount = ?, payment_date = ?, method = ?, " +
                "status = ?, notes = ?, transaction_id = ?, transaction_details = ?, updated_at = ? WHERE id = ?";

        LocalDateTime now = LocalDateTime.now();

        jdbcTemplate.update(sql,
                payment.getTenantId(),
                payment.getStudent(),
                payment.getAmount(),
                payment.getPaymentDate(),
                payment.getMethod(),
                payment.getStatus(),
                payment.getNotes(),
                payment.getTransactionId(),
                payment.getTransactionDetails(),
                now,
                payment.getId());

        payment.setUpdatedAt(now);
        return payment;
    }

    public void deleteById(Long adminId, Long id) {
        String sql = "DELETE FROM " + getTableName(adminId) + " WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }

    public List<Payment> findByStudent(Long adminId, String student) {
        String sql = "SELECT * FROM " + getTableName(adminId) + " WHERE student = ?";
        return jdbcTemplate.query(sql, new PaymentRowMapper(), student);
    }

    public List<Payment> findByPaymentDateBetween(Long adminId, LocalDate startDate, LocalDate endDate) {
        String sql = "SELECT * FROM " + getTableName(adminId) + " WHERE payment_date BETWEEN ? AND ?";
        return jdbcTemplate.query(sql, new PaymentRowMapper(), startDate, endDate);
    }

    public List<Payment> findByMethod(Long adminId, String method) {
        String sql = "SELECT * FROM " + getTableName(adminId) + " WHERE method = ?";
        return jdbcTemplate.query(sql, new PaymentRowMapper(), method);
    }

    public List<Payment> findByStatus(Long adminId, String status) {
        String sql = "SELECT * FROM " + getTableName(adminId) + " WHERE status = ?";
        return jdbcTemplate.query(sql, new PaymentRowMapper(), status);
    }
}
