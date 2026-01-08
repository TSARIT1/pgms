package com.pgm.pgm_Backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class DynamicTableService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Creates all necessary tables for a new admin
     */
    public void createAdminTables(Long adminId) {
        try {
            createTenantsTable(adminId);
            createRoomsTable(adminId);
            createStaffTable(adminId);
            createPaymentsTable(adminId);
            createAttendanceTable(adminId);

            // Verify all tables were created successfully
            if (!verifyAllTablesExist(adminId)) {
                throw new RuntimeException("Table verification failed after creation");
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to create tables for admin " + adminId + ": " + e.getMessage(), e);
        }
    }

    /**
     * Creates the tenants (students) table for a specific admin
     */
    private void createTenantsTable(Long adminId) {
        String tableName = "admin_" + adminId + "_tenants";
        String sql = "CREATE TABLE IF NOT EXISTS " + tableName + " (" +
                "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                "name VARCHAR(255) NOT NULL, " +
                "age INT, " +
                "gender VARCHAR(50), " +
                "phone VARCHAR(10) NOT NULL UNIQUE, " +
                "email VARCHAR(255) NOT NULL UNIQUE, " +
                "room_number VARCHAR(50) NOT NULL, " +
                "bed_number INT, " +
                "address VARCHAR(500) NOT NULL, " +
                "joining_date DATE NOT NULL, " +
                "identity_proof_type VARCHAR(100), " +
                "identity_proof LONGTEXT, " +
                "status VARCHAR(20) DEFAULT 'ACTIVE', " +
                "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" +
                ")";
        jdbcTemplate.execute(sql);
    }

    /**
     * Creates the rooms table for a specific admin
     */
    private void createRoomsTable(Long adminId) {
        String tableName = "admin_" + adminId + "_rooms";
        String sql = "CREATE TABLE IF NOT EXISTS " + tableName + " (" +
                "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                "room_number VARCHAR(50) NOT NULL UNIQUE, " +
                "capacity INT NULL, " +
                "occupied_beds INT NOT NULL DEFAULT 0, " +
                "occupied_bed_numbers TEXT, " +
                "rent DOUBLE NOT NULL, " +
                "status VARCHAR(20) DEFAULT 'AVAILABLE', " +
                "description TEXT, " +
                "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" +
                ")";
        jdbcTemplate.execute(sql);
    }

    /**
     * Creates the staff table for a specific admin
     */
    private void createStaffTable(Long adminId) {
        String tableName = "admin_" + adminId + "_staff";
        String sql = "CREATE TABLE IF NOT EXISTS " + tableName + " (" +
                "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                "username VARCHAR(255) NOT NULL UNIQUE, " +
                "email VARCHAR(255) NOT NULL UNIQUE, " +
                "phone VARCHAR(10), " +
                "role VARCHAR(100) NOT NULL, " +
                "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" +
                ")";
        jdbcTemplate.execute(sql);
    }

    /**
     * Creates the payments table for a specific admin
     */
    private void createPaymentsTable(Long adminId) {
        String tableName = "admin_" + adminId + "_payments";
        String sql = "CREATE TABLE IF NOT EXISTS " + tableName + " (" +
                "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                "tenant_id BIGINT, " +
                "student VARCHAR(255) NOT NULL, " +
                "amount DOUBLE NOT NULL, " +
                "payment_date DATE NOT NULL, " +
                "method VARCHAR(50) NOT NULL, " +
                "status VARCHAR(50), " +
                "notes TEXT, " +
                "transaction_id VARCHAR(255), " +
                "transaction_details TEXT, " +
                "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" +
                ")";
        jdbcTemplate.execute(sql);
    }

    /**
     * Creates the attendance table for a specific admin
     */
    private void createAttendanceTable(Long adminId) {
        String tableName = "admin_" + adminId + "_attendance";
        String sql = "CREATE TABLE IF NOT EXISTS " + tableName + " (" +
                "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                "student_name VARCHAR(255) NOT NULL, " +
                "room_number VARCHAR(50), " +
                "date DATE NOT NULL, " +
                "status VARCHAR(20) NOT NULL, " +
                "notes TEXT, " +
                "UNIQUE KEY unique_attendance (student_name, date)" +
                ")";
        jdbcTemplate.execute(sql);
    }

    /**
     * Verify if a specific table exists
     */
    public boolean tableExists(Long adminId, String entityType) {
        String tableName = getTableName(adminId, entityType);
        String sql = "SELECT COUNT(*) FROM information_schema.tables " +
                "WHERE table_schema = DATABASE() AND table_name = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, tableName);
        return count != null && count > 0;
    }

    /**
     * Verify all required tables exist for an admin
     */
    public boolean verifyAllTablesExist(Long adminId) {
        return tableExists(adminId, "tenants") &&
                tableExists(adminId, "rooms") &&
                tableExists(adminId, "staff") &&
                tableExists(adminId, "payments") &&
                tableExists(adminId, "attendance");
    }

    /**
     * Get detailed status of all tables for an admin
     */
    public Map<String, Boolean> getTableCreationStatus(Long adminId) {
        Map<String, Boolean> status = new HashMap<>();
        status.put("tenants", tableExists(adminId, "tenants"));
        status.put("rooms", tableExists(adminId, "rooms"));
        status.put("staff", tableExists(adminId, "staff"));
        status.put("payments", tableExists(adminId, "payments"));
        status.put("attendance", tableExists(adminId, "attendance"));
        return status;
    }

    /**
     * Get missing tables for an admin
     */
    public java.util.List<String> getMissingTables(Long adminId) {
        java.util.List<String> missingTables = new java.util.ArrayList<>();
        Map<String, Boolean> status = getTableCreationStatus(adminId);

        for (Map.Entry<String, Boolean> entry : status.entrySet()) {
            if (!entry.getValue()) {
                missingTables.add(entry.getKey());
            }
        }

        return missingTables;
    }

    /**
     * Get table name for a specific admin and entity type
     */
    public String getTableName(Long adminId, String entityType) {
        return "admin_" + adminId + "_" + entityType;
    }
}
