package com.pgm.pgm_Backend.service.impl;

import com.pgm.pgm_Backend.exception.ResourceNotFoundException;
import com.pgm.pgm_Backend.model.Room;
import com.pgm.pgm_Backend.repository.DynamicRoomRepository;
import com.pgm.pgm_Backend.service.RoomService;
import com.pgm.pgm_Backend.utils.AdminContextUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.Arrays;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final DynamicRoomRepository dynamicRoomRepository;
    private final AdminContextUtil adminContextUtil;
    
    

    public RoomServiceImpl(DynamicRoomRepository dynamicRoomRepository, AdminContextUtil adminContextUtil) {
		super();
		this.dynamicRoomRepository = dynamicRoomRepository;
		this.adminContextUtil = adminContextUtil;
	}

	@Override
    public List<Room> getAllRooms() {
        Long adminId = adminContextUtil.getCurrentAdminId();
        return dynamicRoomRepository.findAll(adminId);
    }

    @Override
    public Room getRoomById(Long id) {
        Long adminId = adminContextUtil.getCurrentAdminId();
        return dynamicRoomRepository.findById(adminId, id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));
    }

    @Override
    public Room createRoom(Room room) {
        Long adminId = adminContextUtil.getCurrentAdminId();

        // Check if room number already exists for THIS admin
        if (dynamicRoomRepository.findByRoomNumber(adminId, room.getRoomNumber()).isPresent()) {
            throw new IllegalArgumentException("Room number already exists");
        }

        return dynamicRoomRepository.save(adminId, room);
    }

    @Override
    public Room updateRoom(Long id, Room roomDetails) {
        Long adminId = adminContextUtil.getCurrentAdminId();
        Room room = getRoomById(id);

        if (roomDetails.getRoomNumber() != null) {
            room.setRoomNumber(roomDetails.getRoomNumber());
        }
        if (roomDetails.getCapacity() != null) {
            room.setCapacity(roomDetails.getCapacity());
        }
        if (roomDetails.getOccupiedBeds() != null) {
            room.setOccupiedBeds(roomDetails.getOccupiedBeds());
        }
        if (roomDetails.getRent() != null) {
            room.setRent(roomDetails.getRent());
        }
        if (roomDetails.getStatus() != null) {
            room.setStatus(roomDetails.getStatus());
        }
        if (roomDetails.getDescription() != null) {
            room.setDescription(roomDetails.getDescription());
        }

        return dynamicRoomRepository.save(adminId, room);
    }

    @Override
    public void deleteRoom(Long id) {
        Long adminId = adminContextUtil.getCurrentAdminId();
        Room room = getRoomById(id);
        dynamicRoomRepository.deleteById(adminId, id);
    }

    @Override
    public List<Room> getRoomsByStatus(String status) {
        Long adminId = adminContextUtil.getCurrentAdminId();
        return dynamicRoomRepository.findByStatus(adminId, status);
    }

    @Override
    public Room getRoomByRoomNumber(String roomNumber) {
        Long adminId = adminContextUtil.getCurrentAdminId();
        return dynamicRoomRepository.findByRoomNumber(adminId, roomNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + roomNumber));
    }

    @Override
    public void addOccupiedBed(String roomNumber, Integer bedNumber) {
        if (bedNumber == null)
            return;

        Long adminId = adminContextUtil.getCurrentAdminId();
        Room room = getRoomByRoomNumber(roomNumber);

        // Parse current occupied bed numbers
        String currentOccupied = room.getOccupiedBedNumbers();
        Set<Integer> occupiedSet = new HashSet<>();

        if (currentOccupied != null && !currentOccupied.isEmpty()) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                Integer[] arr = mapper.readValue(currentOccupied, Integer[].class);
                occupiedSet.addAll(Arrays.asList(arr));
            } catch (Exception e) {
                // If parsing fails, start fresh
            }
        }

        // Add new bed number
        occupiedSet.add(bedNumber);

        // Convert back to JSON
        try {
            ObjectMapper mapper = new ObjectMapper();
            room.setOccupiedBedNumbers(mapper.writeValueAsString(occupiedSet));
            room.setOccupiedBeds(occupiedSet.size());
            dynamicRoomRepository.save(adminId, room);
        } catch (Exception e) {
            throw new RuntimeException("Failed to update occupied beds", e);
        }
    }

    @Override
    public void removeOccupiedBed(String roomNumber, Integer bedNumber) {
        if (bedNumber == null)
            return;

        Long adminId = adminContextUtil.getCurrentAdminId();
        Room room = getRoomByRoomNumber(roomNumber);

        // Parse current occupied bed numbers
        String currentOccupied = room.getOccupiedBedNumbers();
        Set<Integer> occupiedSet = new HashSet<>();

        if (currentOccupied != null && !currentOccupied.isEmpty()) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                Integer[] arr = mapper.readValue(currentOccupied, Integer[].class);
                occupiedSet.addAll(Arrays.asList(arr));
            } catch (Exception e) {
                // If parsing fails, nothing to remove
                return;
            }
        }

        // Remove bed number
        occupiedSet.remove(bedNumber);

        // Convert back to JSON
        try {
            ObjectMapper mapper = new ObjectMapper();
            room.setOccupiedBedNumbers(mapper.writeValueAsString(occupiedSet));
            room.setOccupiedBeds(occupiedSet.size());
            dynamicRoomRepository.save(adminId, room);
        } catch (Exception e) {
            throw new RuntimeException("Failed to update occupied beds", e);
        }
    }
}
