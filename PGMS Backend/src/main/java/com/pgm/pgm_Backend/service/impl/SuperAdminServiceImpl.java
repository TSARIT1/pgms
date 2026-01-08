package com.pgm.pgm_Backend.service.impl;

import com.pgm.pgm_Backend.exception.ResourceNotFoundException;
import com.pgm.pgm_Backend.model.SuperAdmin;
import com.pgm.pgm_Backend.repository.SuperAdminRepository;
import com.pgm.pgm_Backend.service.SuperAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SuperAdminServiceImpl implements SuperAdminService {

    private final SuperAdminRepository superAdminRepository;
    
    

    public SuperAdminServiceImpl(SuperAdminRepository superAdminRepository) {
		super();
		this.superAdminRepository = superAdminRepository;
	}

	@Override
    public SuperAdmin register(SuperAdmin superAdmin) {
        if (superAdminRepository.existsByEmail(superAdmin.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }
        return superAdminRepository.save(superAdmin);
    }

    @Override
    public SuperAdmin getById(Long id) {
        return superAdminRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SuperAdmin not found with id: " + id));
    }

    @Override
    public SuperAdmin getProfile() {
        // Get the currently authenticated user's email from SecurityContext
        String email = org.springframework.security.core.context.SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return superAdminRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("SuperAdmin not found with email: " + email));
    }

    @Override
    public SuperAdmin updateProfile(SuperAdmin superAdminDetails) {
        SuperAdmin superAdmin = getProfile();

        if (superAdminDetails.getEmail() != null && !superAdminDetails.getEmail().equals(superAdmin.getEmail())) {
            // Check if new email is already taken
            if (superAdminRepository.existsByEmail(superAdminDetails.getEmail())) {
                throw new IllegalArgumentException("Email already in use");
            }
            superAdmin.setEmail(superAdminDetails.getEmail());
        }

        return superAdminRepository.save(superAdmin);
    }

    @Override
    public String uploadPhoto(org.springframework.web.multipart.MultipartFile file) {
        // SuperAdmin doesn't have photo functionality
        throw new UnsupportedOperationException("SuperAdmin does not support photo upload");
    }

    @Override
    public void deletePhoto() {
        // SuperAdmin doesn't have photo functionality
        throw new UnsupportedOperationException("SuperAdmin does not support photo deletion");
    }

    private void deletePhotoFile(String photoUrl) {
        // Not needed for SuperAdmin
    }

    @Override
    public java.util.Optional<SuperAdmin> findByEmail(String email) {
        return superAdminRepository.findByEmail(email);
    }

}
