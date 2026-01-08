package com.pgm.pgm_Backend.controller;

import com.pgm.pgm_Backend.model.Room;
import com.pgm.pgm_Backend.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin("*")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;
    
    

    public RoomController(RoomService roomService) {
		super();
		this.roomService = roomService;
	}

	@GetMapping
    public ResponseEntity<?> getAllRooms() {
        try {
            List<Room> rooms = roomService.getAllRooms();
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "All rooms retrieved successfully");
            response.put("data", rooms);
            response.put("count", rooms.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRoomById(@PathVariable Long id) {
        try {
            Room room = roomService.getRoomById(id);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Room retrieved successfully");
            response.put("data", room);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping
    public ResponseEntity<?> createRoom(@Valid @RequestBody Room room) {
        try {
            Room createdRoom = roomService.createRoom(room);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Room created successfully");
            response.put("data", createdRoom);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRoom(@PathVariable Long id, @Valid @RequestBody Room room) {
        try {
            Room updatedRoom = roomService.updateRoom(id, room);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Room updated successfully");
            response.put("data", updatedRoom);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRoom(@PathVariable Long id) {
        try {
            roomService.deleteRoom(id);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Room deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<?> getRoomsByStatus(@PathVariable String status) {
        try {
            List<Room> rooms = roomService.getRoomsByStatus(status);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Rooms retrieved by status successfully");
            response.put("data", rooms);
            response.put("count", rooms.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
