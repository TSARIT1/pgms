package com.pgm.pgm_Backend.mapper;

import com.pgm.pgm_Backend.model.Payment;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class PaymentRowMapper implements RowMapper<Payment> {

    @Override
    public Payment mapRow(ResultSet rs, int rowNum) throws SQLException {
        Payment payment = new Payment();
        payment.setId(rs.getLong("id"));

        // Handle nullable tenant_id
        long tenantId = rs.getLong("tenant_id");
        if (!rs.wasNull()) {
            payment.setTenantId(tenantId);
        }

        payment.setStudent(rs.getString("student"));
        payment.setAmount(rs.getDouble("amount"));
        payment.setPaymentDate(rs.getDate("payment_date").toLocalDate());
        payment.setMethod(rs.getString("method"));
        payment.setStatus(rs.getString("status"));
        payment.setNotes(rs.getString("notes"));
        payment.setTransactionId(rs.getString("transaction_id"));
        payment.setTransactionDetails(rs.getString("transaction_details"));

        // Handle timestamps
        if (rs.getTimestamp("created_at") != null) {
            payment.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        }
        if (rs.getTimestamp("updated_at") != null) {
            payment.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime());
        }

        return payment;
    }
}
