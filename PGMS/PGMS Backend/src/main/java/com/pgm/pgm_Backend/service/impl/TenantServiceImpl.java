package com.pgm.pgm_Backend.service.impl;

import com.pgm.pgm_Backend.exception.ResourceNotFoundException;
import com.pgm.pgm_Backend.model.Tenant;
import com.pgm.pgm_Backend.repository.DynamicTenantRepository;
import com.pgm.pgm_Backend.service.RoomService;
import com.pgm.pgm_Backend.service.TenantService;
import com.pgm.pgm_Backend.utils.AdminContextUtil;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
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
    public List<Tenant> getAllTenantsIncludingDeleted() {
        Long adminId = adminContextUtil.getCurrentAdminId();
        return dynamicTenantRepository.findAllIncludingDeleted(adminId);
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

        // Auto-assign bed if room is provided but bed is not
        if (tenant.getRoomNumber() != null && tenant.getBedNumber() == null) {
            try {
                Integer autoBed = roomService.findFirstAvailableBed(tenant.getRoomNumber());
                if (autoBed != null) {
                    tenant.setBedNumber(autoBed);
                }
            } catch (Exception e) {
                // Ignore errors in auto-assignment, occupant count will still be synced
            }
        }

        Tenant savedTenant = dynamicTenantRepository.save(adminId, tenant);

        // Sync room occupancy
        if (savedTenant.getRoomNumber() != null) {
            roomService.syncRoomOccupancy(savedTenant.getRoomNumber());
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

        // Sync room occupancy if room or bed changed
        boolean roomChanged = !oldRoomNumber.equals(updatedTenant.getRoomNumber());
        boolean bedChanged = (oldBedNumber == null && updatedTenant.getBedNumber() != null) ||
                (oldBedNumber != null && !oldBedNumber.equals(updatedTenant.getBedNumber()));

        if (roomChanged || bedChanged) {
            // Sync old room
            if (oldRoomNumber != null) {
                try {
                    roomService.syncRoomOccupancy(oldRoomNumber);
                } catch (Exception e) {
                    /* ignore */ }
            }
            // Sync new room
            if (updatedTenant.getRoomNumber() != null) {
                try {
                    roomService.syncRoomOccupancy(updatedTenant.getRoomNumber());
                } catch (Exception e) {
                    /* ignore */ }
            }
        }

        return updatedTenant;
    }

    @Override
    public void deleteTenant(Long id) {
        Long adminId = adminContextUtil.getCurrentAdminId();
        Tenant tenant = getTenantById(id);

        // Soft delete: mark as deleted instead of removing from database
        tenant.setIsDeleted(true);
        dynamicTenantRepository.save(adminId, tenant);

        // Sync room occupancy after deletion
        if (tenant.getRoomNumber() != null) {
            roomService.syncRoomOccupancy(tenant.getRoomNumber());
        }
    }

    @Override
    public List<Tenant> getTenantsByStatus(String status) {
        Long adminId = adminContextUtil.getCurrentAdminId();
        // We need to filter manually since we don't have a specific method
        return dynamicTenantRepository.findAll(adminId).stream()
                .filter(t -> status.equals(t.getStatus()))
                .toList();
    }

    @Override
    public Tenant updateTenantStatus(Long id, String status) {
        Long adminId = adminContextUtil.getCurrentAdminId();
        Tenant tenant = getTenantById(id);
        tenant.setStatus(status);
        return dynamicTenantRepository.save(adminId, tenant);
    }
}
