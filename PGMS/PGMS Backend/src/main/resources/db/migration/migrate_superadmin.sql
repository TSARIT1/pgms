-- Migration script to separate SuperAdmin into its own table
-- This script should be run ONCE to migrate existing SuperAdmin data

-- Step 1: Create the super_admins table
CREATE TABLE IF NOT EXISTS super_admins (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(10) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    photo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Step 2: Copy existing SuperAdmin records from admins to super_admins
-- This assumes SuperAdmin has role = 'SUPER_ADMIN'
INSERT INTO super_admins (id, name, email, phone, password, photo_url, created_at, updated_at)
SELECT id, name, email, phone, password, photo_url, created_at, updated_at
FROM admins
WHERE role = 'SUPER_ADMIN';

-- Step 3: Delete SuperAdmin records from admins table
DELETE FROM admins WHERE role = 'SUPER_ADMIN';

-- Step 4 (Optional): Remove the role column from admins table
-- WARNING: This is optional and irreversible. Only run if you're sure.
-- ALTER TABLE admins DROP COLUMN role;

-- Verification queries (run these to check the migration)
-- SELECT * FROM super_admins;
-- SELECT * FROM admins WHERE role = 'SUPER_ADMIN'; -- Should return 0 rows
