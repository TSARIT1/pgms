package com.pgm.pgm_Backend.controller;

import com.pgm.pgm_Backend.model.Admin;
import com.pgm.pgm_Backend.service.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
@CrossOrigin("*")
public class LocationController {

    private final LocationService locationService;

    
    
    public LocationController(LocationService locationService) {
		super();
		this.locationService = locationService;
	}



	@GetMapping("/hostels")
    public ResponseEntity<?> getAllHostelLocations() {
        try {
            List<Admin> admins = locationService.getAllHostelLocations();

            // Map to simplified response with only necessary fields
            List<Map<String, Object>> locations = new ArrayList<>();
            for (Admin admin : admins) {
                Map<String, Object> location = new HashMap<>();
                location.put("id", admin.getId());
                location.put("name", admin.getHostelName() != null ? admin.getHostelName() : admin.getName());
                location.put("address", admin.getHostelAddress());
                location.put("locationLink", admin.getLocationLink());
                locations.add(location);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Hostel locations retrieved successfully");
            response.put("data", locations);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to retrieve hostel locations: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
