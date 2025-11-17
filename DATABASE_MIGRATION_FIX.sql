-- Migration script to fix gallery table for large base64 images
-- Run this on your production database if the gallery table already exists

USE ycis_datacenter;

-- Check if gallery table exists and modify image_url column
ALTER TABLE gallery MODIFY COLUMN image_url LONGTEXT NOT NULL;

-- Verify the change
DESCRIBE gallery;

-- This will allow base64 encoded images (up to 4GB) to be stored

