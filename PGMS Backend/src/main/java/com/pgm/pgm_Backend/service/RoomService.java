package com.pgm.pgm_Backend.service;

import com.pgm.pgm_Backend.model.Room;

import java.util.List;

public interface RoomService {
    List<Room> getAllRooms();

    Room getRoomById(Long id);

    Room createRoom(Room room);

    Room updateRoom(Long id, Room room);

    void deleteRoom(Long id);

    List<Room> getRoomsByStatus(String status);

    Room getRoomByRoomNumber(String roomNumber);

    void addOccupiedBed(String roomNumber, Integer bedNumber);

    void removeOccupiedBed(String roomNumber, Integer bedNumber);
}
