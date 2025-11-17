-- Bill View Feature - Database Migration Script
-- This script updates the bills table to support large base64 image storage
-- Run this if the automatic migration doesn't work

-- ============================================
-- BACKUP RECOMMENDATION
-- ============================================
-- Before running this migration, backup your database:
-- mysqldump -u root -p ycis_datacenter bills > bills_backup.sql

-- ============================================
-- MIGRATION: Update image_url column type
-- ============================================

-- Check current column type
-- SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
-- FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_SCHEMA = 'ycis_datacenter' 
-- AND TABLE_NAME = 'bills' 
-- AND COLUMN_NAME = 'image_url';

-- Update column to support large base64 images
ALTER TABLE bills MODIFY COLUMN image_url LONGTEXT;

-- Verify the change
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'ycis_datacenter' 
AND TABLE_NAME = 'bills' 
AND COLUMN_NAME = 'image_url';

-- ============================================
-- CLEANUP: Remove old placeholder URLs (optional)
-- ============================================
-- If you have bills with old placeholder URLs that don't work,
-- you can clean them up with this query:

-- Update bills with placeholder URLs to NULL
-- UPDATE bills 
-- SET image_url = NULL, image_name = NULL 
-- WHERE image_url LIKE '/uploads/bills/%' 
-- AND image_url NOT LIKE 'data:%';

-- ============================================
-- VERIFICATION
-- ============================================

-- Check bills with images
SELECT 
    id,
    description,
    vendor,
    date,
    CASE 
        WHEN image_url IS NULL THEN 'No Image'
        WHEN image_url LIKE 'data:%' THEN 'Base64 Image'
        ELSE 'URL Path'
    END as image_type,
    image_name,
    LENGTH(image_url) as image_size_bytes,
    ROUND(LENGTH(image_url) / 1024, 2) as image_size_kb
FROM bills
ORDER BY date DESC
LIMIT 20;

-- Count bills by image status
SELECT 
    CASE 
        WHEN image_url IS NULL THEN 'No Image'
        WHEN image_url LIKE 'data:%' THEN 'Base64 Image'
        ELSE 'URL Path'
    END as image_type,
    COUNT(*) as count,
    ROUND(AVG(LENGTH(image_url)) / 1024, 2) as avg_size_kb
FROM bills
GROUP BY 
    CASE 
        WHEN image_url IS NULL THEN 'No Image'
        WHEN image_url LIKE 'data:%' THEN 'Base64 Image'
        ELSE 'URL Path'
    END;

-- ============================================
-- ROLLBACK (if needed)
-- ============================================
-- If you need to rollback the migration:
-- ALTER TABLE bills MODIFY COLUMN image_url VARCHAR(500);

-- ============================================
-- NOTES
-- ============================================
-- 1. LONGTEXT can store up to 4GB of data (but practically use <16MB for images)
-- 2. Base64 encoding increases image size by approximately 33%
-- 3. A 1MB image will be stored as approximately 1.33MB in base64
-- 4. Recommended max image size: 5MB (becomes ~6.7MB in base64)
-- 5. The database will automatically update on next server start if using Node.js app
-- 6. This manual migration is only needed if automatic migration fails

-- ============================================
-- PERFORMANCE CONSIDERATIONS
-- ============================================
-- For large databases with many bills, consider:
-- 1. Running during low-traffic hours
-- 2. Monitoring database size growth
-- 3. Setting up image compression in the application
-- 4. Using cloud storage (S3, Cloudinary) for very large deployments

-- Migration completed successfully!
-- Date: 2025-11-11
-- Version: 1.0

