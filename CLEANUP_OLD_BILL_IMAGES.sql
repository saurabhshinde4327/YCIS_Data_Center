-- Cleanup Script for Old Bill Placeholder Images
-- This script helps identify and clean up bills with old placeholder URLs
-- Run this to see which bills need image re-upload

-- ============================================
-- STEP 1: Identify Bills with Placeholder URLs
-- ============================================

-- Show bills with old placeholder URLs that need fixing
SELECT 
    id,
    description,
    vendor,
    date,
    amount,
    image_url,
    image_name,
    status,
    created_at
FROM bills
WHERE image_url IS NOT NULL
  AND image_url NOT LIKE 'data:%'
  AND (image_url LIKE '/uploads/%' OR image_url LIKE '%placeholder%')
ORDER BY date DESC;

-- Count of bills that need fixing
SELECT 
    'Bills needing image re-upload' as status,
    COUNT(*) as count
FROM bills
WHERE image_url IS NOT NULL
  AND image_url NOT LIKE 'data:%'
  AND (image_url LIKE '/uploads/%' OR image_url LIKE '%placeholder%');

-- ============================================
-- STEP 2: View Current Bill Image Status
-- ============================================

-- Summary of all bills by image status
SELECT 
    CASE 
        WHEN image_url IS NULL THEN 'No Image'
        WHEN image_url LIKE 'data:%' THEN 'Valid Base64 Image'
        WHEN image_url LIKE '/uploads/%' THEN 'Placeholder - Needs Re-upload'
        ELSE 'Other URL'
    END as image_status,
    COUNT(*) as count,
    ROUND(AVG(amount), 2) as avg_amount
FROM bills
GROUP BY 
    CASE 
        WHEN image_url IS NULL THEN 'No Image'
        WHEN image_url LIKE 'data:%' THEN 'Valid Base64 Image'
        WHEN image_url LIKE '/uploads/%' THEN 'Placeholder - Needs Re-upload'
        ELSE 'Other URL'
    END
ORDER BY count DESC;

-- ============================================
-- STEP 3: OPTIONAL - Clear Placeholder URLs
-- ============================================

-- WARNING: This will remove the placeholder URLs from bills
-- Bills will show as "No Image" after this
-- Only run this if you want to clean up the invalid URLs

-- UNCOMMENT THE NEXT LINE TO EXECUTE (REMOVE THE -- at the start)
-- UPDATE bills 
-- SET image_url = NULL, image_name = NULL 
-- WHERE image_url IS NOT NULL
--   AND image_url NOT LIKE 'data:%'
--   AND (image_url LIKE '/uploads/%' OR image_url LIKE '%placeholder%');

-- ============================================
-- STEP 4: Verify Cleanup (if you ran Step 3)
-- ============================================

-- After cleanup, verify the results
-- SELECT 
--     CASE 
--         WHEN image_url IS NULL THEN 'No Image'
--         WHEN image_url LIKE 'data:%' THEN 'Valid Base64 Image'
--         ELSE 'Other URL'
--     END as image_status,
--     COUNT(*) as count
-- FROM bills
-- GROUP BY 
--     CASE 
--         WHEN image_url IS NULL THEN 'No Image'
--         WHEN image_url LIKE 'data:%' THEN 'Valid Base64 Image'
--         ELSE 'Other URL'
--     END;

-- ============================================
-- STEP 5: Export Bills Needing Images
-- ============================================

-- Export list for manual re-upload
-- Copy this data to spreadsheet and use as checklist
SELECT 
    id,
    vendor,
    description,
    CONCAT('₹', FORMAT(amount, 2)) as amount_formatted,
    DATE_FORMAT(date, '%d-%b-%Y') as date_formatted,
    category,
    status,
    CASE 
        WHEN notes IS NOT NULL THEN 'Yes'
        ELSE 'No'
    END as has_notes,
    'NEEDS IMAGE RE-UPLOAD' as action_required
FROM bills
WHERE image_url IS NOT NULL
  AND image_url NOT LIKE 'data:%'
  AND (image_url LIKE '/uploads/%' OR image_url LIKE '%placeholder%')
ORDER BY date DESC, vendor;

-- ============================================
-- USAGE INSTRUCTIONS
-- ============================================

/*
HOW TO USE THIS SCRIPT:

1. RUN STEP 1 - Identify Problem Bills
   - Shows which bills have invalid placeholder URLs
   - These bills will show "Not Found" error when trying to view/download

2. RUN STEP 2 - Check Status
   - See overall status of all bills
   - Understand how many bills need fixing

3. OPTIONAL - Run Step 3 to Clean Up
   - This removes invalid placeholder URLs
   - Bills will show as "No Image Available"
   - This is cleaner than showing "Not Found" errors

4. RE-UPLOAD IMAGES
   - For each bill identified in Step 1 or Step 5:
     a. Go to Bills page in the application
     b. Find the bill
     c. Click Edit (if edit is available) or delete and recreate
     d. Upload the actual bill image
     e. Save

5. VERIFY
   - Run Step 2 again to see updated counts
   - All bills should now be "No Image" or "Valid Base64 Image"

TIPS:
- Keep physical/digital copies of bill images organized by vendor and date
- Consider naming files as: vendor_date_amount.jpg (e.g., ISP_Provider_2025-10-15_2500.jpg)
- Upload images in JPG or PNG format for best compatibility
- Recommended max size: 5MB per image
*/

-- ============================================
-- ADDITIONAL QUERIES
-- ============================================

-- Find bills without images (might need images added)
SELECT 
    id, vendor, description, amount, date, category, status
FROM bills
WHERE image_url IS NULL
ORDER BY date DESC
LIMIT 20;

-- Find the largest image files (for optimization)
SELECT 
    id,
    vendor,
    description,
    LENGTH(image_url) as size_bytes,
    ROUND(LENGTH(image_url) / 1024, 2) as size_kb,
    ROUND(LENGTH(image_url) / 1024 / 1024, 2) as size_mb
FROM bills
WHERE image_url LIKE 'data:%'
ORDER BY LENGTH(image_url) DESC
LIMIT 10;

-- Script completed
-- Date: 2025-11-11
-- Purpose: Help identify and clean up bills with invalid placeholder images

