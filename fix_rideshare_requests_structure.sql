-- Fix rideshare_requests table for backwards compatibility and proper passenger data alignment
-- This script addresses the customer ID deprecation issue and restores passenger profile functionality

-- Step 1: Add back the passenger information fields that were removed
ALTER TABLE rideshare_requests 
ADD COLUMN passenger_name VARCHAR(255) DEFAULT NULL COMMENT 'Passenger name from customer_details',
ADD COLUMN passenger_surname VARCHAR(255) DEFAULT NULL COMMENT 'Passenger surname from customer_details', 
ADD COLUMN passenger_username VARCHAR(255) DEFAULT NULL COMMENT 'Passenger username from customer_details',
ADD COLUMN passenger_email VARCHAR(255) DEFAULT NULL COMMENT 'Passenger email from customer_details',
ADD COLUMN passenger_phone VARCHAR(50) DEFAULT NULL COMMENT 'Passenger phone from customer_details',
ADD COLUMN passenger_profile_pic VARCHAR(500) DEFAULT NULL COMMENT 'Passenger profile picture URL',
ADD COLUMN passenger_rating DECIMAL(3,2) DEFAULT NULL COMMENT 'Passenger rating (1-5)',
ADD COLUMN passenger_stars DECIMAL(3,2) DEFAULT NULL COMMENT 'Passenger stars (alternative rating field)',
ADD COLUMN passenger_rating_count INT DEFAULT 0 COMMENT 'Number of ratings received',
ADD COLUMN customerid VARCHAR(50) DEFAULT NULL COMMENT 'Original customer ID for backwards compatibility',
ADD COLUMN passenger_data_json TEXT DEFAULT NULL COMMENT 'Cached passenger profile data as JSON';

-- Step 2: Modify passenger_id to support both old string format and new integer format
ALTER TABLE rideshare_requests 
MODIFY COLUMN passenger_id VARCHAR(50) DEFAULT NULL COMMENT 'Can be integer (new) or string (old format)';

-- Step 3: Add indexes for performance
ALTER TABLE rideshare_requests 
ADD INDEX idx_passenger_name (passenger_name),
ADD INDEX idx_passenger_username (passenger_username),
ADD INDEX idx_customerid (customerid),
ADD INDEX idx_passenger_rating (passenger_rating);

-- Step 4: Create a trigger to automatically populate passenger fields from customer_details when a request is inserted
DELIMITER //
CREATE TRIGGER before_rideshare_request_insert
BEFORE INSERT ON rideshare_requests
FOR EACH ROW
BEGIN
    DECLARE cust_name VARCHAR(255);
    DECLARE cust_surname VARCHAR(255);
    DECLARE cust_username VARCHAR(255);
    DECLARE cust_email VARCHAR(255);
    DECLARE cust_phone VARCHAR(50);
    DECLARE cust_profile_pic VARCHAR(500);
    DECLARE cust_rating DECIMAL(3,2);
    DECLARE cust_stars DECIMAL(3,2);
    DECLARE cust_rating_count INT;
    
    -- Try to get customer details if passenger_id is provided
    IF NEW.passenger_id IS NOT NULL AND NEW.passenger_id != '0' AND NEW.passenger_id != '' THEN
        SELECT 
            COALESCE(name, '') INTO cust_name,
            COALESCE(surname, '') INTO cust_surname, 
            COALESCE(username, '') INTO cust_username,
            COALESCE(email, '') INTO cust_email,
            COALESCE(phone, '') INTO cust_phone,
            COALESCE(profile_pic, '') INTO cust_profile_pic,
            COALESCE(rating, NULL) INTO cust_rating,
            COALESCE(stars, NULL) INTO cust_stars,
            COALESCE(rating_count, 0) INTO cust_rating_count
        FROM customer_details 
        WHERE customerid = NEW.passenger_id OR customerid = CAST(NEW.passenger_id AS CHAR)
        LIMIT 1;
        
        -- Set the passenger fields
        SET NEW.passenger_name = cust_name;
        SET NEW.passenger_surname = cust_surname;
        SET NEW.passenger_username = cust_username;
        SET NEW.passenger_email = cust_email;
        SET NEW.passenger_phone = cust_phone;
        SET NEW.passenger_profile_pic = cust_profile_pic;
        SET NEW.passenger_rating = cust_rating;
        SET NEW.passenger_stars = cust_stars;
        SET NEW.passenger_rating_count = cust_rating_count;
        SET NEW.customerid = NEW.passenger_id;
        
        -- Store full profile as JSON for backup
        SET NEW.passenger_data_json = JSON_OBJECT(
            'customerid', NEW.passenger_id,
            'name', cust_name,
            'surname', cust_surname,
            'username', cust_username,
            'email', cust_email,
            'phone', cust_phone,
            'profile_pic', cust_profile_pic,
            'rating', cust_rating,
            'stars', cust_stars,
            'rating_count', cust_rating_count
        );
    END IF;
END//
DELIMITER ;

-- Step 5: Create a trigger to update passenger fields when passenger_id is updated
DELIMITER //
CREATE TRIGGER before_rideshare_request_update
BEFORE UPDATE ON rideshare_requests
FOR EACH ROW
BEGIN
    DECLARE cust_name VARCHAR(255);
    DECLARE cust_surname VARCHAR(255);
    DECLARE cust_username VARCHAR(255);
    DECLARE cust_email VARCHAR(255);
    DECLARE cust_phone VARCHAR(50);
    DECLARE cust_profile_pic VARCHAR(500);
    DECLARE cust_rating DECIMAL(3,2);
    DECLARE cust_stars DECIMAL(3,2);
    DECLARE cust_rating_count INT;
    
    -- Update passenger fields if passenger_id changed
    IF NEW.passenger_id != OLD.passenger_id THEN
        SELECT 
            COALESCE(name, '') INTO cust_name,
            COALESCE(surname, '') INTO cust_surname,
            COALESCE(username, '') INTO cust_username,
            COALESCE(email, '') INTO cust_email,
            COALESCE(phone, '') INTO cust_phone,
            COALESCE(profile_pic, '') INTO cust_profile_pic,
            COALESCE(rating, NULL) INTO cust_rating,
            COALESCE(stars, NULL) INTO cust_stars,
            COALESCE(rating_count, 0) INTO cust_rating_count
        FROM customer_details 
        WHERE customerid = NEW.passenger_id OR customerid = CAST(NEW.passenger_id AS CHAR)
        LIMIT 1;
        
        -- Update the passenger fields
        SET NEW.passenger_name = cust_name;
        SET NEW.passenger_surname = cust_surname;
        SET NEW.passenger_username = cust_username;
        SET NEW.passenger_email = cust_email;
        SET NEW.passenger_phone = cust_phone;
        SET NEW.passenger_profile_pic = cust_profile_pic;
        SET NEW.passenger_rating = cust_rating;
        SET NEW.passenger_stars = cust_stars;
        SET NEW.passenger_rating_count = cust_rating_count;
        SET NEW.customerid = NEW.passenger_id;
        
        -- Update JSON data
        SET NEW.passenger_data_json = JSON_OBJECT(
            'customerid', NEW.passenger_id,
            'name', cust_name,
            'surname', cust_surname,
            'username', cust_username,
            'email', cust_email,
            'phone', cust_phone,
            'profile_pic', cust_profile_pic,
            'rating', cust_rating,
            'stars', cust_stars,
            'rating_count', cust_rating_count
        );
    END IF;
END//
DELIMITER ;

-- Step 6: Update existing records to populate passenger data from customer_details
UPDATE rideshare_requests r 
SET 
    r.passenger_name = COALESCE(cd.name, ''),
    r.passenger_surname = COALESCE(cd.surname, ''),
    r.passenger_username = COALESCE(cd.username, ''),
    r.passenger_email = COALESCE(cd.email, ''),
    r.passenger_phone = COALESCE(cd.phone, ''),
    r.passenger_profile_pic = COALESCE(cd.profile_pic, ''),
    r.passenger_rating = cd.rating,
    r.passenger_stars = cd.stars,
    r.passenger_rating_count = COALESCE(cd.rating_count, 0),
    r.customerid = r.passenger_id,
    r.passenger_data_json = JSON_OBJECT(
        'customerid', r.passenger_id,
        'name', COALESCE(cd.name, ''),
        'surname', COALESCE(cd.surname, ''),
        'username', COALESCE(cd.username, ''),
        'email', COALESCE(cd.email, ''),
        'phone', COALESCE(cd.phone, ''),
        'profile_pic', COALESCE(cd.profile_pic, ''),
        'rating', cd.rating,
        'stars', cd.stars,
        'rating_count', COALESCE(cd.rating_count, 0)
    )
FROM customer_details cd 
WHERE cd.customerid = r.passenger_id 
   OR cd.customerid = CAST(r.passenger_id AS CHAR)
   OR (r.passenger_id = '0' AND cd.customerid IS NOT NULL);

-- Step 7: Create a stored procedure to refresh passenger data for all requests
DELIMITER //
CREATE PROCEDURE refresh_rideshare_passenger_data()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE req_id INT;
    DECLARE req_passenger_id VARCHAR(50);
    
    DECLARE request_cursor CURSOR FOR 
        SELECT request_id, passenger_id 
        FROM rideshare_requests 
        WHERE passenger_id IS NOT NULL AND passenger_id != '0' AND passenger_id != '';
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN request_cursor;
    
    read_loop: LOOP
        FETCH request_cursor INTO req_id, req_passenger_id;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Update passenger data for this request
        UPDATE rideshare_requests r 
        SET 
            r.passenger_name = COALESCE(cd.name, ''),
            r.passenger_surname = COALESCE(cd.surname, ''),
            r.passenger_username = COALESCE(cd.username, ''),
            r.passenger_email = COALESCE(cd.email, ''),
            r.passenger_phone = COALESCE(cd.phone, ''),
            r.passenger_profile_pic = COALESCE(cd.profile_pic, ''),
            r.passenger_rating = cd.rating,
            r.passenger_stars = cd.stars,
            r.passenger_rating_count = COALESCE(cd.rating_count, 0),
            r.customerid = r.passenger_id,
            r.passenger_data_json = JSON_OBJECT(
                'customerid', r.passenger_id,
                'name', COALESCE(cd.name, ''),
                'surname', COALESCE(cd.surname, ''),
                'username', COALESCE(cd.username, ''),
                'email', COALESCE(cd.email, ''),
                'phone', COALESCE(cd.phone, ''),
                'profile_pic', COALESCE(cd.profile_pic, ''),
                'rating', cd.rating,
                'stars', cd.stars,
                'rating_count', COALESCE(cd.rating_count, 0)
            )
        FROM customer_details cd 
        WHERE r.request_id = req_id
          AND (cd.customerid = req_passenger_id OR cd.customerid = CAST(req_passenger_id AS CHAR))
          AND r.request_id = req_id;
          
    END LOOP;
    
    CLOSE request_cursor;
END//
DELIMITER ;

-- Step 8: Create a view for easy passenger data access
CREATE OR REPLACE VIEW rideshare_requests_with_passenger_data AS
SELECT 
    r.*,
    COALESCE(r.passenger_name, cd.name, '') as display_name,
    COALESCE(r.passenger_username, cd.username, CONCAT('Passenger ', r.passenger_id)) as display_username,
    COALESCE(r.passenger_rating, cd.rating, cd.stars, 0) as display_rating,
    COALESCE(r.passenger_profile_pic, cd.profile_pic, '') as display_profile_pic,
    CASE 
        WHEN r.passenger_id = '0' OR r.passenger_id IS NULL OR r.passenger_id = '' THEN 'Anonymous'
        WHEN COALESCE(r.passenger_name, cd.name, '') != '' THEN CONCAT(COALESCE(r.passenger_name, cd.name, ''), ' ', COALESCE(r.passenger_surname, cd.surname, ''))
        ELSE COALESCE(r.passenger_username, cd.username, CONCAT('Passenger ', r.passenger_id))
    END as full_display_name
FROM rideshare_requests r
LEFT JOIN customer_details cd ON (cd.customerid = r.passenger_id OR cd.customerid = CAST(r.passenger_id AS CHAR));

-- Step 9: Add comment documentation
ALTER TABLE rideshare_requests COMMENT = 'Rideshare passenger requests with integrated passenger profile data for backwards compatibility';
