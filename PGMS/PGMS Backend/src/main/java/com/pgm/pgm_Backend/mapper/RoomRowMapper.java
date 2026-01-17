package com.pgm.pgm_Backend.mapper;

import com.pgm.pgm_Backend.model.Room;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class RoomRowMapper implements RowMapper<Room> {

    @Override
    public Room mapRow(ResultSet rs, int rowNum) throws SQLException {
        Room room = new Room();
        room.setId(rs.getLong("id"));
        room.setRoomNumber(rs.getString("room_number"));
        room.setCapacity(rs.getInt("capacity"));
        room.setOccupiedBeds(rs.getInt("occupied_beds"));
        room.setOccupiedBedNumbers(rs.getString("occupied_bed_numbers"));
        room.setRent(rs.getDouble("rent"));
        room.setStatus(rs.getString("status"));
        room.setDescription(rs.getString("description"));

        // Handle timestamps
        if (rs.getTimestamp("created_at") != null) {
            room.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        }
        if (rs.getTimestamp("updated_at") != null) {
            room.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime());
        }

        return room;
    }
}
