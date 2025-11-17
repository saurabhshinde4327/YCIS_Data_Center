-- Fix for Showcase Projects: Update columns to support large base64 images
-- Run this SQL script if you encounter "Failed to create showcase project" error

USE ycis_datacenter;

-- Update logo column to support large images
ALTER TABLE showcase_projects MODIFY COLUMN logo LONGTEXT;

-- Update project_image column to support large images
ALTER TABLE showcase_projects MODIFY COLUMN project_image LONGTEXT;

-- Verify the changes
DESCRIBE showcase_projects;

-- Expected output should show:
-- logo: longtext (nullable)
-- project_image: longtext (nullable)

