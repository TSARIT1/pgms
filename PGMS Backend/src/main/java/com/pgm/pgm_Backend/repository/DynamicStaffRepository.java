package com.pgm.pgm_Backend.repository;

import com.pgm.pgm_Backend.mapper.StaffRowMapper;
import com.pgm.pgm_Backend.model.Staff;
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
public class DynamicStaffRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private String getTableName(Long adminId) {
        return "admin_" + adminId + "_staff";
    }

    public List<Staff> findAll(Long adminId) {
        String sql = "SELECT * FROM " + getTableName(adminId);
        return jdbcTemplate.query(sql, new StaffRowMapper());
    }

    public Optional<Staff> findById(Long adminId, Long id) {
        String sql = "SELECT * FROM " + getTableName(adminId) + " WHERE id = ?";
        List<Staff> results = jdbcTemplate.query(sql, new StaffRowMapper(), id);
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    public Staff save(Long adminId, Staff staff) {
        if (staff.getId() == null) {
            return insert(adminId, staff);
        } else {
            return update(adminId, staff);
        }
    }

    private Staff insert(Long adminId, Staff staff) {
        String sql = "INSERT INTO " + getTableName(adminId) +
                " (username, email, phone, role, created_at, updated_at) " +
                "VALUES (?, ?, ?, ?, ?, ?)";

        KeyHolder keyHolder = new GeneratedKeyHolder();

        LocalDateTime now = LocalDateTime.now();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, staff.getUsername());
            ps.setString(2, staff.getEmail());
            ps.setString(3, staff.getPhone());
            ps.setString(4, staff.getRole());
            ps.setObject(5, now);
            ps.setObject(6, now);
            return ps;
        }, keyHolder);

        staff.setId(keyHolder.getKey().longValue());
        staff.setCreatedAt(now);
        staff.setUpdatedAt(now);
        return staff;
    }

    private Staff update(Long adminId, Staff staff) {
        String sql = "UPDATE " + getTableName(adminId) +
                " SET username = ?, email = ?, phone = ?, role = ?, updated_at = ? WHERE id = ?";

        LocalDateTime now = LocalDateTime.now();

        jdbcTemplate.update(sql,
                staff.getUsername(),
                staff.getEmail(),
                staff.getPhone(),
                staff.getRole(),
                now,
                staff.getId());

        staff.setUpdatedAt(now);
        return staff;
    }

    public void deleteById(Long adminId, Long id) {
        String sql = "DELETE FROM " + getTableName(adminId) + " WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }

    public Optional<Staff> findByUsername(Long adminId, String username) {
        String sql = "SELECT * FROM " + getTableName(adminId) + " WHERE username = ?";
        List<Staff> results = jdbcTemplate.query(sql, new StaffRowMapper(), username);
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    public Optional<Staff> findByEmail(Long adminId, String email) {
        String sql = "SELECT * FROM " + getTableName(adminId) + " WHERE email = ?";
        List<Staff> results = jdbcTemplate.query(sql, new StaffRowMapper(), email);
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    public List<Staff> findByRole(Long adminId, String role) {
        String sql = "SELECT * FROM " + getTableName(adminId) + " WHERE role = ?";
        return jdbcTemplate.query(sql, new StaffRowMapper(), role);
    }
}
