package com.pgm.pgm_Backend.service;

import com.pgm.pgm_Backend.model.Tenant;

import java.util.List;

public interface TenantService {
    List<Tenant> getAllTenants();
    Tenant getTenantById(Long id);
    Tenant createTenant(Tenant tenant);
    Tenant updateTenant(Long id, Tenant tenant);
    void deleteTenant(Long id);
    List<Tenant> getTenantsByStatus(String status);
}
