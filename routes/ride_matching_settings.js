const express = require('express');
const router = express.Router();
const pool = require('../cruds/poolfile');

// GET current detour distance settings
router.get('/ride-matching/detour-settings', (req, res) => {
    console.log('Fetching ride-matching detour distance settings...');
    
    // Query database for settings
    const query = `
        SELECT * FROM ride_matching_settings 
        WHERE setting_type = 'detour_distance' 
        ORDER BY created_at DESC 
        LIMIT 1
    `;
    
    pool.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching detour settings:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch detour settings'
            });
        }
        
        let settings = {
            default_detour_distance: 3.0,
            min_detour_distance: 0.5,
            max_detour_distance: 10.0,
            detour_increment: 0.5,
            auto_detour_expansion: false,
            expansion_time_limit: 300,
            max_auto_expansions: 3
        };
        
        if (results.length > 0) {
            const dbSettings = JSON.parse(results[0].settings_json);
            settings = { ...settings, ...dbSettings };
        }
        
        res.json({
            success: true,
            data: settings
        });
    });
});

// POST update detour distance settings
router.post('/ride-matching/detour-settings', (req, res) => {
    const newSettings = req.body;
    
    // Validate settings
    const validatedSettings = {
        default_detour_distance: Math.max(newSettings.min_detour_distance || 0.5, Math.min(newSettings.max_detour_distance || 10.0, newSettings.default_detour_distance || 3.0)),
        min_detour_distance: Math.max(0.1, Math.min(2, newSettings.min_detour_distance || 0.5)),
        max_detour_distance: Math.max(5, Math.min(25, newSettings.max_detour_distance || 10.0)),
        detour_increment: Math.max(0.1, Math.min(2, newSettings.detour_increment || 0.5)),
        auto_detour_expansion: Boolean(newSettings.auto_detour_expansion || false),
        expansion_time_limit: Math.max(60, Math.min(1800, newSettings.expansion_time_limit || 300)),
        max_auto_expansions: Math.max(1, Math.min(10, newSettings.max_auto_expansions || 3))
    };

    // Insert or update settings in database
    const query = `
        INSERT INTO ride_matching_settings (setting_type, settings_json, created_at, updated_at)
        VALUES ('detour_distance', ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE 
        settings_json = VALUES(settings_json),
        updated_at = NOW()
    `;
    
    pool.query(query, [JSON.stringify(validatedSettings)], (err, results) => {
        if (err) {
            console.error('Error updating detour settings:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to update detour settings'
            });
        }
        
        console.log('Updated ride-matching detour distance settings:', validatedSettings);
        
        res.json({
            success: true,
            message: 'Detour distance settings updated successfully',
            data: validatedSettings
        });
    });
});

// GET current detour distance for a specific driver
router.get('/ride-matching/current-detour/:driverId', (req, res) => {
    const { driverId } = req.params;
    
    // Get current settings
    const settingsQuery = `
        SELECT settings_json FROM ride_matching_settings 
        WHERE setting_type = 'detour_distance' 
        ORDER BY created_at DESC 
        LIMIT 1
    `;
    
    pool.query(settingsQuery, (err, settingsResults) => {
        if (err) {
            console.error('Error getting settings for driver:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to get current detour'
            });
        }
        
        let settings = {
            default_detour_distance: 3.0,
            auto_detour_expansion: false,
            expansion_time_limit: 300,
            max_auto_expansions: 3,
            detour_increment: 0.5,
            max_detour_distance: 10.0
        };
        
        if (settingsResults.length > 0) {
            const dbSettings = JSON.parse(settingsResults[0].settings_json);
            settings = { ...settings, ...dbSettings };
        }
        
        let currentDetour = settings.default_detour_distance;
        let expansionCount = 0;
        
        if (settings.auto_detour_expansion) {
            // Check if driver has an active trip and how long they've been waiting
            const tripQuery = `
                SELECT created_at, detour_expansion_count 
                FROM trip 
                WHERE driver_id = ? AND status IN ('active', 'waiting_for_passengers')
                ORDER BY created_at DESC 
                LIMIT 1
            `;
            
            pool.query(tripQuery, [driverId], (tripErr, tripResults) => {
                if (tripErr) {
                    console.error('Error getting driver trip:', tripErr);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to get current detour'
                    });
                }
                
                if (tripResults.length > 0) {
                    const trip = tripResults[0];
                    const waitTime = Math.floor((Date.now() - new Date(trip.created_at).getTime()) / 1000);
                    expansionCount = trip.detour_expansion_count || 0;
                    
                    // Check if it's time for auto-expansion
                    const nextExpansionTime = (expansionCount + 1) * settings.expansion_time_limit;
                    if (waitTime >= nextExpansionTime && expansionCount < settings.max_auto_expansions) {
                        expansionCount++;
                        currentDetour = Math.min(
                            settings.default_detour_distance + (expansionCount * settings.detour_increment),
                            settings.max_detour_distance
                        );
                        
                        // Update the trip with new expansion count and detour distance
                        const updateQuery = `
                            UPDATE trip 
                            SET detour_expansion_count = ?, 
                                current_detour_distance = ?
                            WHERE driver_id = ? AND status IN ('active', 'waiting_for_passengers')
                            ORDER BY created_at DESC 
                            LIMIT 1
                        `;
                        
                        pool.query(updateQuery, [expansionCount, currentDetour, driverId], (updateErr) => {
                            if (updateErr) {
                                console.error('Error updating trip detour:', updateErr);
                                // Continue with response even if update fails
                            }
                        });
                    } else {
                        currentDetour = Math.min(
                            settings.default_detour_distance + (expansionCount * settings.detour_increment),
                            settings.max_detour_distance
                        );
                    }
                }
                
                res.json({
                    success: true,
                    data: {
                        driverId,
                        currentDetour,
                        originalDetour: settings.default_detour_distance,
                        expansionCount,
                        maxDetour: settings.max_detour_distance,
                        autoExpansionEnabled: settings.auto_detour_expansion
                    }
                });
            });
        } else {
            // If auto-expansion is disabled, return default values
            res.json({
                success: true,
                data: {
                    driverId,
                    currentDetour,
                    originalDetour: settings.default_detour_distance,
                    expansionCount,
                    maxDetour: settings.max_detour_distance,
                    autoExpansionEnabled: settings.auto_detour_expansion
                }
            });
        }
    });
});

// POST request detour expansion for a specific driver
router.post('/ride-matching/expand-detour/:driverId', (req, res) => {
    const { driverId } = req.params;
    const { currentDetour, expansionCount } = req.body;
    
    // Get current settings
    const settingsQuery = `
        SELECT settings_json FROM ride_matching_settings 
        WHERE setting_type = 'detour_distance' 
        ORDER BY created_at DESC 
        LIMIT 1
    `;
    
    pool.query(settingsQuery, (err, settingsResults) => {
        if (err) {
            console.error('Error getting settings for expansion:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to expand detour'
            });
        }
        
        let settings = {
            max_auto_expansions: 3,
            detour_increment: 0.5,
            max_detour_distance: 10.0
        };
        
        if (settingsResults.length > 0) {
            const dbSettings = JSON.parse(settingsResults[0].settings_json);
            settings = { ...settings, ...dbSettings };
        }
        
        if (expansionCount >= settings.max_auto_expansions) {
            return res.json({
                success: false,
                message: 'Maximum expansion limit reached'
            });
        }
        
        const newDetour = Math.min(
            currentDetour + settings.detour_increment,
            settings.max_detour_distance
        );
        
        // Update the trip with new expansion count and detour distance
        const updateQuery = `
            UPDATE trip 
            SET detour_expansion_count = ?, 
                current_detour_distance = ?
            WHERE driver_id = ? AND status IN ('active', 'waiting_for_passengers')
            ORDER BY created_at DESC 
            LIMIT 1
        `;
        
        pool.query(updateQuery, [expansionCount + 1, newDetour, driverId], (updateErr) => {
            if (updateErr) {
                console.error('Error expanding detour for driver:', updateErr);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to expand detour'
                });
            }
            
            res.json({
                success: true,
                message: 'Detour distance expanded successfully',
                data: {
                    driverId,
                    previousDetour: currentDetour,
                    newDetour,
                    expansionCount: expansionCount + 1,
                    maxDetour: settings.max_detour_distance
                }
            });
        });
    });
});

module.exports = router;
