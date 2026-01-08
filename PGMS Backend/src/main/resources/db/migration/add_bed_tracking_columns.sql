-- Migration Script: Add Bed Tracking Columns
-- Run this script to add bed tracking to existing admin tables

-- For each admin, you need to run these commands
-- Replace {adminId} with the actual admin ID (e.g., 14, 15, etc.)

-- Add occupied_bed_numbers column to rooms table
ALTER TABLE admin_14_rooms 
ADD COLUMN IF NOT EXISTS occupied_bed_numbers TEXT;

-- Add bed_number column to tenants table  
ALTER TABLE admin_14_tenants 
ADD COLUMN IF NOT EXISTS bed_number INT;

-- Repeat for other admins:
-- ALTER TABLE admin_15_rooms ADD COLUMN IF NOT EXISTS occupied_bed_numbers TEXT;
-- ALTER TABLE admin_15_tenants ADD COLUMN IF NOT EXISTS bed_number INT;

-- Verify columns were added
DESCRIBE admin_14_rooms;
DESCRIBE admin_14_tenants;
