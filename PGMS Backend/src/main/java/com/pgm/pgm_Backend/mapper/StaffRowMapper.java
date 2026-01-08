package com.pgm.pgm_Backend.mapper;

import com.pgm.pgm_Backend.model.Staff;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class StaffRowMapper implements RowMapper<Staff> {

    @Override
    public Staff mapRow(ResultSet rs, int rowNum) throws SQLException {
        Staff staff = new Staff();
        staff.setId(rs.getLong("id"));
        staff.setUsername(rs.getString("username"));
        staff.setEmail(rs.getString("email"));
        staff.setPhone(rs.getString("phone"));
        staff.setRole(rs.getString("role"));

        // Handle timestamps
        if (rs.getTimestamp("created_at") != null) {
            staff.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        }
        if (rs.getTimestamp("updated_at") != null) {
            staff.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime());
        }

        return staff;
    }
}
