-- Simple SQL to make type column nullable
-- Run this in MySQL Workbench or your database tool

-- First, find your admin ID (replace X with your actual admin ID)
-- You can find it by running: SELECT id FROM admins WHERE email = 'your_email@example.com';

-- Then run this for your specific admin room table:
ALTER TABLE admin_1_rooms MODIFY COLUMN type INT NULL;

-- If you have multiple admins, run for each:
-- ALTER TABLE admin_2_rooms MODIFY COLUMN type INT NULL;
-- ALTER TABLE admin_3_rooms MODIFY COLUMN type INT NULL;
-- etc.
