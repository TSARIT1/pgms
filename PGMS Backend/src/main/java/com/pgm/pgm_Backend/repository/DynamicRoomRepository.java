package com.pgm.pgm_Backend.repository;

import com.pgm.pgm_Backend.mapper.RoomRowMapper;
import com.pgm.pgm_Backend.model.Room;
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
public class DynamicRoomRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private String getTableName(Long adminId) {
        return "admin_" + adminId + "_rooms";
    }

    public List<Room> findAll(Long adminId) {
        String sql = "SELECT * FROM " + getTableName(adminId);
        return jdbcTemplate.query(sql, new RoomRowMapper());
    }

    public Optional<Room> findById(Long adminId, Long id) {
        String sql = "SELECT * FROM " + getTableName(adminId) + " WHERE id = ?";
        List<Room> results = jdbcTemplate.query(sql, new RoomRowMapper(), id);
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    public Room save(Long adminId, Room room) {
        if (room.getId() == null) {
            return insert(adminId, room);
        } else {
            return update(adminId, room);
        }
    }

    private Room insert(Long adminId, Room room) {
        String sql = "INSERT INTO " + getTableName(adminId) +
                " (room_number, capacity, occupied_beds, occupied_bed_numbers, rent, status, description, created_at, updated_at) "
                +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

        KeyHolder keyHolder = new GeneratedKeyHolder();

        LocalDateTime now = LocalDateTime.now();
        String status = room.getStatus() != null ? room.getStatus() : "AVAILABLE";
        int occupiedBeds = room.getOccupiedBeds() != null ? room.getOccupiedBeds() : 0;

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, room.getRoomNumber());
            // Handle null capacity - use setObject instead of setInt
            if (room.getCapacity() != null) {
                ps.setInt(2, room.getCapacity());
            } else {
                ps.setNull(2, java.sql.Types.INTEGER);
            }
            ps.setInt(3, occupiedBeds);
            ps.setString(4, room.getOccupiedBedNumbers());
            ps.setDouble(5, room.getRent());
            ps.setString(6, status);
            ps.setString(7, room.getDescription());
            ps.setObject(8, now);
            ps.setObject(9, now);
            return ps;
        }, keyHolder);

        room.setId(keyHolder.getKey().longValue());
        room.setCreatedAt(now);
        room.setUpdatedAt(now);
        room.setStatus(status);
        room.setOccupiedBeds(occupiedBeds);
        return room;
    }

    private Room update(Long adminId, Room room) {
        String sql = "UPDATE " + getTableName(adminId) +
                " SET room_number = ?, capacity = ?, occupied_beds = ?, occupied_bed_numbers = ?, rent = ?, "
                +
                "status = ?, description = ?, updated_at = ? WHERE id = ?";

        LocalDateTime now = LocalDateTime.now();

        // Handle null capacity properly
        Object capacityValue = room.getCapacity() != null ? room.getCapacity() : null;

        jdbcTemplate.update(sql,
                room.getRoomNumber(),
                capacityValue,
                room.getOccupiedBeds(),
                room.getOccupiedBedNumbers(),
                room.getRent(),
                room.getStatus(),
                room.getDescription(),
                now,
                room.getId());

        room.setUpdatedAt(now);
        return room;
    }

    public void deleteById(Long adminId, Long id) {
        String sql = "DELETE FROM " + getTableName(adminId) + " WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }

    public Optional<Room> findByRoomNumber(Long adminId, String roomNumber) {
        String sql = "SELECT * FROM " + getTableName(adminId) + " WHERE room_number = ?";
        List<Room> results = jdbcTemplate.query(sql, new RoomRowMapper(), roomNumber);
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    public List<Room> findByStatus(Long adminId, String status) {
        String sql = "SELECT * FROM " + getTableName(adminId) + " WHERE status = ?";
        return jdbcTemplate.query(sql, new RoomRowMapper(), status);
    }
}
