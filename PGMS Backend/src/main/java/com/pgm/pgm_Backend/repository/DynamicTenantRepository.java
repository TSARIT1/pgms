package com.pgm.pgm_Backend.repository;

import com.pgm.pgm_Backend.mapper.TenantRowMapper;
import com.pgm.pgm_Backend.model.Tenant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public class DynamicTenantRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private String getTableName(Long adminId) {
        return "admin_" + adminId + "_tenants";
    }

    public List<Tenant> findAll(Long adminId) {
        String sql = "SELECT * FROM " + getTableName(adminId);
        return jdbcTemplate.query(sql, new TenantRowMapper());
    }

    public Optional<Tenant> findById(Long adminId, Long id) {
        String sql = "SELECT * FROM " + getTableName(adminId) + " WHERE id = ?";
        List<Tenant> results = jdbcTemplate.query(sql, new TenantRowMapper(), id);
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    public Tenant save(Long adminId, Tenant tenant) {
        if (tenant.getId() == null) {
            return insert(adminId, tenant);
        } else {
            return update(adminId, tenant);
        }
    }

    private Tenant insert(Long adminId, Tenant tenant) {
        String sql = "INSERT INTO " + getTableName(adminId) +
                " (name, age, gender, phone, email, room_number, bed_number, address, joining_date, " +
                "identity_proof_type, identity_proof, status, created_at, updated_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        KeyHolder keyHolder = new GeneratedKeyHolder();

        LocalDateTime now = LocalDateTime.now();
        String status = tenant.getStatus() != null ? tenant.getStatus() : "ACTIVE";

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, tenant.getName());
            if (tenant.getAge() != null) {
                ps.setInt(2, tenant.getAge());
            } else {
                ps.setNull(2, java.sql.Types.INTEGER);
            }
            ps.setString(3, tenant.getGender());
            ps.setString(4, tenant.getPhone());
            ps.setString(5, tenant.getEmail());
            ps.setString(6, tenant.getRoomNumber());
            if (tenant.getBedNumber() != null) {
                ps.setInt(7, tenant.getBedNumber());
            } else {
                ps.setNull(7, java.sql.Types.INTEGER);
            }
            ps.setString(8, tenant.getAddress());
            ps.setDate(9, java.sql.Date.valueOf(tenant.getJoiningDate()));
            ps.setString(10, tenant.getIdentityProofType());
            ps.setString(11, tenant.getIdentityProof());
            ps.setString(12, status);
            ps.setObject(13, now);
            ps.setObject(14, now);
            return ps;
        }, keyHolder);

        tenant.setId(keyHolder.getKey().longValue());
        tenant.setCreatedAt(now);
        tenant.setUpdatedAt(now);
        tenant.setStatus(status);
        return tenant;
    }

    private Tenant update(Long adminId, Tenant tenant) {
        String sql = "UPDATE " + getTableName(adminId) +
                " SET name = ?, age = ?, gender = ?, phone = ?, email = ?, room_number = ?, bed_number = ?, " +
                "address = ?, joining_date = ?, identity_proof_type = ?, identity_proof = ?, " +
                "status = ?, updated_at = ? WHERE id = ?";

        LocalDateTime now = LocalDateTime.now();

        jdbcTemplate.update(sql,
                tenant.getName(),
                tenant.getAge(),
                tenant.getGender(),
                tenant.getPhone(),
                tenant.getEmail(),
                tenant.getRoomNumber(),
                tenant.getBedNumber(),
                tenant.getAddress(),
                tenant.getJoiningDate(),
                tenant.getIdentityProofType(),
                tenant.getIdentityProof(),
                tenant.getStatus(),
                now,
                tenant.getId());

        tenant.setUpdatedAt(now);
        return tenant;
    }

    public void deleteById(Long adminId, Long id) {
        String sql = "DELETE FROM " + getTableName(adminId) + " WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }

    public List<Tenant> findByRoomNumber(Long adminId, String roomNumber) {
        String sql = "SELECT * FROM " + getTableName(adminId) + " WHERE room_number = ?";
        return jdbcTemplate.query(sql, new TenantRowMapper(), roomNumber);
    }

    public Optional<Tenant> findByEmail(Long adminId, String email) {
        String sql = "SELECT * FROM " + getTableName(adminId) + " WHERE email = ?";
        List<Tenant> results = jdbcTemplate.query(sql, new TenantRowMapper(), email);
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    public Optional<Tenant> findByPhone(Long adminId, String phone) {
        String sql = "SELECT * FROM " + getTableName(adminId) + " WHERE phone = ?";
        List<Tenant> results = jdbcTemplate.query(sql, new TenantRowMapper(), phone);
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    public List<Tenant> searchByName(Long adminId, String name) {
        String sql = "SELECT * FROM " + getTableName(adminId) + " WHERE name LIKE ?";
        return jdbcTemplate.query(sql, new TenantRowMapper(), "%" + name + "%");
    }
}
