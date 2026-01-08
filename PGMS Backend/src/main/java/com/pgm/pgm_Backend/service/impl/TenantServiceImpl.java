package com.pgm.pgm_Backend.service.impl;

import com.pgm.pgm_Backend.exception.ResourceNotFoundException;
import com.pgm.pgm_Backend.model.Tenant;
import com.pgm.pgm_Backend.repository.DynamicTenantRepository;
import com.pgm.pgm_Backend.service.RoomService;
import com.pgm.pgm_Backend.service.TenantService;
import com.pgm.pgm_Backend.utils.AdminContextUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TenantServiceImpl implements TenantService {

    private final DynamicTenantRepository dynamicTenantRepository;
    private final AdminContextUtil adminContextUtil;
    private final com.pgm.pgm_Backend.service.RoomService roomService;
    
    

    public TenantServiceImpl(DynamicTenantRepository dynamicTenantRepository, AdminContextUtil adminContextUtil,
			RoomService roomService) {
		super();
		this.dynamicTenantRepository = dynamicTenantRepository;
		this.adminContextUtil = adminContextUtil;
		this.roomService = roomService;
	}

	@Override
    public List<Tenant> getAllTenants() {
        Long adminId = adminContextUtil.getCurrentAdminId();
        return dynamicTenantRepository.findAll(adminId);
    }

    @Override
    public Tenant getTenantById(Long id) {
        Long adminId = adminContextUtil.getCurrentAdminId();
        return dynamicTenantRepository.findById(adminId, id)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found with id: " + id));
    }

    @Override
    public Tenant createTenant(Tenant tenant) {
        Long adminId = adminContextUtil.getCurrentAdminId();

        // Email duplicates are now allowed

        // Check if phone already exists for this admin
        if (dynamicTenantRepository.findByPhone(adminId, tenant.getPhone()).isPresent()) {
            throw new IllegalArgumentException("Phone number already exists");
        }

        Tenant savedTenant = dynamicTenantRepository.save(adminId, tenant);

        // Update room's occupied beds if bed number is assigned
        if (savedTenant.getBedNumber() != null && savedTenant.getRoomNumber() != null) {
            roomService.addOccupiedBed(savedTenant.getRoomNumber(), savedTenant.getBedNumber());
        }

        return savedTenant;
    }

    @Override
    public Tenant updateTenant(Long id, Tenant tenantDetails) {
        Long adminId = adminContextUtil.getCurrentAdminId();
        Tenant tenant = getTenantById(id);

        // Track old room and bed for cleanup
        String oldRoomNumber = tenant.getRoomNumber();
        Integer oldBedNumber = tenant.getBedNumber();

        if (tenantDetails.getName() != null) {
            tenant.setName(tenantDetails.getName());
        }
        if (tenantDetails.getAge() != null) {
            tenant.setAge(tenantDetails.getAge());
        }
        if (tenantDetails.getGender() != null) {
            tenant.setGender(tenantDetails.getGender());
        }
        if (tenantDetails.getPhone() != null && !tenantDetails.getPhone().equals(tenant.getPhone())) {
            if (dynamicTenantRepository.findByPhone(adminId, tenantDetails.getPhone()).isPresent()) {
                throw new IllegalArgumentException("Phone number already exists");
            }
            tenant.setPhone(tenantDetails.getPhone());
        }
        if (tenantDetails.getEmail() != null && !tenantDetails.getEmail().equals(tenant.getEmail())) {
            // Email duplicates are now allowed
            tenant.setEmail(tenantDetails.getEmail());
        }
        if (tenantDetails.getRoomNumber() != null) {
            tenant.setRoomNumber(tenantDetails.getRoomNumber());
        }
        if (tenantDetails.getBedNumber() != null) {
            tenant.setBedNumber(tenantDetails.getBedNumber());
        }
        if (tenantDetails.getAddress() != null) {
            tenant.setAddress(tenantDetails.getAddress());
        }
        if (tenantDetails.getJoiningDate() != null) {
            tenant.setJoiningDate(tenantDetails.getJoiningDate());
        }
        if (tenantDetails.getStatus() != null) {
            tenant.setStatus(tenantDetails.getStatus());
        }
        if (tenantDetails.getIdentityProofType() != null) {
            tenant.setIdentityProofType(tenantDetails.getIdentityProofType());
        }
        if (tenantDetails.getIdentityProof() != null) {
            tenant.setIdentityProof(tenantDetails.getIdentityProof());
        }

        Tenant updatedTenant = dynamicTenantRepository.save(adminId, tenant);

        // Update room occupancy if room or bed changed
        boolean roomChanged = !oldRoomNumber.equals(updatedTenant.getRoomNumber());
        boolean bedChanged = oldBedNumber != null && !oldBedNumber.equals(updatedTenant.getBedNumber());

        if (roomChanged || bedChanged) {
            // Remove from old bed
            if (oldBedNumber != null && oldRoomNumber != null) {
                roomService.removeOccupiedBed(oldRoomNumber, oldBedNumber);
            }
            // Add to new bed
            if (updatedTenant.getBedNumber() != null && updatedTenant.getRoomNumber() != null) {
                roomService.addOccupiedBed(updatedTenant.getRoomNumber(), updatedTenant.getBedNumber());
            }
        }

        return updatedTenant;
    }

    @Override
    public void deleteTenant(Long id) {
        Long adminId = adminContextUtil.getCurrentAdminId();
        Tenant tenant = getTenantById(id);

        // Free up the bed before deleting
        if (tenant.getBedNumber() != null && tenant.getRoomNumber() != null) {
            roomService.removeOccupiedBed(tenant.getRoomNumber(), tenant.getBedNumber());
        }

        dynamicTenantRepository.deleteById(adminId, id);
    }

    @Override
    public List<Tenant> getTenantsByStatus(String status) {
        Long adminId = adminContextUtil.getCurrentAdminId();
        // We need to filter manually since we don't have a specific method
        return dynamicTenantRepository.findAll(adminId).stream()
                .filter(t -> status.equals(t.getStatus()))
                .toList();
    }
}
