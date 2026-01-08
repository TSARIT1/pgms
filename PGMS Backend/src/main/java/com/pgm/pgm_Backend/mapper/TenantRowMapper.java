package com.pgm.pgm_Backend.mapper;

import com.pgm.pgm_Backend.model.Tenant;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class TenantRowMapper implements RowMapper<Tenant> {

    @Override
    public Tenant mapRow(ResultSet rs, int rowNum) throws SQLException {
        Tenant tenant = new Tenant();
        tenant.setId(rs.getLong("id"));
        tenant.setName(rs.getString("name"));

        // Handle nullable age
        int age = rs.getInt("age");
        if (!rs.wasNull()) {
            tenant.setAge(age);
        }

        tenant.setGender(rs.getString("gender"));
        tenant.setPhone(rs.getString("phone"));
        tenant.setEmail(rs.getString("email"));
        tenant.setRoomNumber(rs.getString("room_number"));

        // Handle nullable bed number
        int bedNumber = rs.getInt("bed_number");
        if (!rs.wasNull()) {
            tenant.setBedNumber(bedNumber);
        }

        tenant.setAddress(rs.getString("address"));
        tenant.setJoiningDate(rs.getDate("joining_date").toLocalDate());
        tenant.setIdentityProofType(rs.getString("identity_proof_type"));
        tenant.setIdentityProof(rs.getString("identity_proof"));
        tenant.setStatus(rs.getString("status"));

        // Handle timestamps
        if (rs.getTimestamp("created_at") != null) {
            tenant.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        }
        if (rs.getTimestamp("updated_at") != null) {
            tenant.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime());
        }

        return tenant;
    }
}
