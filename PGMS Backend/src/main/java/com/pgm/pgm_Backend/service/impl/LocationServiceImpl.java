package com.pgm.pgm_Backend.service.impl;

import com.pgm.pgm_Backend.model.Admin;
import com.pgm.pgm_Backend.repository.AdminRepository;
import com.pgm.pgm_Backend.service.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LocationServiceImpl implements LocationService {

    private final AdminRepository adminRepository;
    
    

    public LocationServiceImpl(AdminRepository adminRepository) {
		super();
		this.adminRepository = adminRepository;
	}



	@Override
    public List<Admin> getAllHostelLocations() {
        // Fetch all admins who have a hostel address
        return adminRepository.findAll().stream()
                .filter(admin -> admin.getHostelAddress() != null && !admin.getHostelAddress().isEmpty())
                .collect(Collectors.toList());
    }
}
