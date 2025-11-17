-- ================================================================
-- FIX DATABASE PERMISSIONS FOR YCIS DATA CENTER
-- ================================================================
-- This script grants necessary permissions to the root user
-- to fix the "Access denied" error when deleting/updating projects
-- ================================================================

-- Run these commands on your MySQL database server (91.108.105.168)
-- as a user with GRANT privileges (typically root from localhost)

-- 1. Grant full privileges on the ycis_datacenter database to root user
GRANT ALL PRIVILEGES ON ycis_datacenter.* TO 'root'@'%';

-- 2. If you want to be more specific, grant only required permissions:
-- GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON ycis_datacenter.* TO 'root'@'%';

-- 3. Grant privileges for the specific IP address that's connecting
GRANT ALL PRIVILEGES ON ycis_datacenter.* TO 'root'@'103.102.95.217';

-- 4. Flush privileges to apply changes immediately
FLUSH PRIVILEGES;

-- 5. Verify the grants (optional)
SHOW GRANTS FOR 'root'@'%';
SHOW GRANTS FOR 'root'@'103.102.95.217';

-- ================================================================
-- ALTERNATIVE: Create a dedicated application user (RECOMMENDED)
-- ================================================================
-- Instead of using root, create a dedicated user for your application

-- 1. Create new user with specific password
CREATE USER IF NOT EXISTS 'ycis_app'@'%' IDENTIFIED BY 'YourSecurePassword123!';

-- 2. Grant all necessary privileges
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, DROP ON ycis_datacenter.* TO 'ycis_app'@'%';

-- 3. Flush privileges
FLUSH PRIVILEGES;

-- 4. Then update your .env file or database config to use:
--    DB_USER=ycis_app
--    DB_PASSWORD=YourSecurePassword123!

-- ================================================================
-- TROUBLESHOOTING
-- ================================================================
-- If you still have issues, check these:

-- 1. Check current user and host
SELECT USER(), CURRENT_USER();

-- 2. Check existing grants for root user
SHOW GRANTS FOR 'root'@'%';
SHOW GRANTS FOR 'root'@'103.102.95.217';
SHOW GRANTS FOR 'root'@'localhost';

-- 3. See all users in MySQL
SELECT user, host FROM mysql.user WHERE user = 'root';

-- 4. If root@'%' doesn't exist, create it:
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY 'Saurabh@2000';
GRANT ALL PRIVILEGES ON ycis_datacenter.* TO 'root'@'%';
FLUSH PRIVILEGES;

-- ================================================================
-- NOTES
-- ================================================================
-- - Your database has TWO different passwords configured:
--   * In projects/[id]/route.ts: "Ycis@2025"  
--   * In lib/database.ts: "Saurabh@2000"
-- - The lib/database.ts password ("Saurabh@2000") is the correct one
-- - Make sure both use the same configuration
-- - The error occurs because the connecting IP (103.102.95.217) 
--   doesn't have proper permissions
-- ================================================================

