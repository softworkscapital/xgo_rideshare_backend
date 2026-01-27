-- Fix detour settings in database
UPDATE ride_matching_settings 
SET settings_json = '{
  "default_detour_distance": 20.0,
  "min_detour_distance": 0.5,
  "max_detour_distance": 30.0,
  "detour_increment": 0.5,
  "auto_detour_expansion": false,
  "expansion_time_limit": 300,
  "max_auto_expansions": 3
}',
updated_at = NOW()
WHERE setting_type = 'detour_distance';

-- If no record exists, insert one
INSERT IGNORE INTO ride_matching_settings (
  setting_type, 
  settings_json, 
  created_at, 
  updated_at
) VALUES (
  'detour_distance',
  '{
    "default_detour_distance": 20.0,
    "min_detour_distance": 0.5,
    "max_detour_distance": 30.0,
    "detour_increment": 0.5,
    "auto_detour_expansion": false,
    "expansion_time_limit": 300,
    "max_auto_expansions": 3
  }',
  NOW(),
  NOW()
);
