package com.pgm.pgm_Backend.service;

import com.pgm.pgm_Backend.model.Staff;
import com.pgm.pgm_Backend.repository.DynamicStaffRepository;
import com.pgm.pgm_Backend.utils.AdminContextUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StaffService {

    private final DynamicStaffRepository dynamicStaffRepository;
    private final AdminContextUtil adminContextUtil;
    
    

    public StaffService(DynamicStaffRepository dynamicStaffRepository, AdminContextUtil adminContextUtil) {
		super();
		this.dynamicStaffRepository = dynamicStaffRepository;
		this.adminContextUtil = adminContextUtil;
	}

	public List<Staff> getAllStaff() {
        Long adminId = adminContextUtil.getCurrentAdminId();
        return dynamicStaffRepository.findAll(adminId);
    }

    public Staff getStaffById(Long id) {
        Long adminId = adminContextUtil.getCurrentAdminId();
        return dynamicStaffRepository.findById(adminId, id)
                .orElseThrow(() -> new IllegalArgumentException("Staff not found"));
    }

    public Staff createStaff(Staff staff) {
        Long adminId = adminContextUtil.getCurrentAdminId();

        // Check uniqueness for this admin
        if (dynamicStaffRepository.findByUsername(adminId, staff.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (dynamicStaffRepository.findByEmail(adminId, staff.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

        return dynamicStaffRepository.save(adminId, staff);
    }

    public Staff updateStaff(Long id, Staff staff) {
        Long adminId = adminContextUtil.getCurrentAdminId();
        Staff existing = getStaffById(id);

        if (staff.getUsername() != null) {
            existing.setUsername(staff.getUsername());
        }
        if (staff.getEmail() != null) {
            existing.setEmail(staff.getEmail());
        }
        if (staff.getPhone() != null) {
            existing.setPhone(staff.getPhone());
        }
        if (staff.getRole() != null) {
            existing.setRole(staff.getRole());
        }

        return dynamicStaffRepository.save(adminId, existing);
    }

    public void deleteStaff(Long id) {
        Long adminId = adminContextUtil.getCurrentAdminId();
        dynamicStaffRepository.deleteById(adminId, id);
    }
}
