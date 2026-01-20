// Ride Matching Detour Distance API
// This file provides API endpoints for managing ride-matching detour distance settings

const express = require('express');
const router = express.Router();

// Default detour distance settings (these will be overridden by control panel settings)
let detourSettings = {
    default_detour_distance: 3.0, // Default detour distance in kilometers
    min_detour_distance: 0.5, // Minimum detour distance in kilometers
    max_detour_distance: 10.0, // Maximum detour distance in kilometers
    detour_increment: 0.5, // Increment step for detour distance adjustment
    auto_detour_expansion: false, // Auto-expand detour distance if no matches found
    expansion_time_limit: 300, // Time limit before auto-expansion (seconds)
    max_auto_expansions: 3 // Maximum number of auto-expansions
};

// GET current detour distance settings for mobile app
router.get('/ride-matching/detour-settings', (req, res) => {
    try {
        console.log('Fetching ride-matching detour distance settings...');
        res.json({
            success: true,
            data: detourSettings
        });
    } catch (error) {
        console.error('Error fetching detour settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch detour settings'
        });
    }
});

// POST update detour distance settings (from control panel)
router.post('/ride-matching/detour-settings', (req, res) => {
    try {
        const newSettings = req.body;
        
        // Validate settings
        const validatedSettings = {
            default_detour_distance: Math.max(newSettings.min_detour_distance, Math.min(newSettings.max_detour_distance, newSettings.default_detour_distance || 3.0)),
            min_detour_distance: Math.max(0.1, Math.min(2, newSettings.min_detour_distance || 0.5)),
            max_detour_distance: Math.max(5, Math.min(25, newSettings.max_detour_distance || 10.0)),
            detour_increment: Math.max(0.1, Math.min(2, newSettings.detour_increment || 0.5)),
            auto_detour_expansion: Boolean(newSettings.auto_detour_expansion || false),
            expansion_time_limit: Math.max(60, Math.min(1800, newSettings.expansion_time_limit || 300)),
            max_auto_expansions: Math.max(1, Math.min(10, newSettings.max_auto_expansions || 3))
        };

        // Update settings
        detourSettings = validatedSettings;
        
        console.log('Updated ride-matching detour distance settings:', detourSettings);
        
        res.json({
            success: true,
            message: 'Detour distance settings updated successfully',
            data: detourSettings
        });
    } catch (error) {
        console.error('Error updating detour settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update detour settings'
        });
    }
});

// GET current detour distance for a specific driver (with auto-expansion logic)
router.get('/ride-matching/current-detour/:driverId', (req, res) => {
    try {
        const { driverId } = req.params;
        
        // In a real implementation, you would:
        // 1. Check if driver has an active trip
        // 2. Check how long they've been waiting
        // 3. Apply auto-expansion logic if enabled
        
        let currentDetour = detourSettings.default_detour_distance;
        let expansionCount = 0;
        
        if (detourSettings.auto_detour_expansion) {
            // Simulate auto-expansion logic
            // In real implementation, you'd check actual wait time and expansion count
            const waitTime = Math.floor(Math.random() * 600); // Random wait time for demo
            expansionCount = Math.floor(waitTime / detourSettings.expansion_time_limit);
            
            if (expansionCount > 0 && expansionCount <= detourSettings.max_auto_expansions) {
                currentDetour = Math.min(
                    detourSettings.default_detour_distance + (expansionCount * detourSettings.detour_increment),
                    detourSettings.max_detour_distance
                );
            }
        }
        
        res.json({
            success: true,
            data: {
                driverId,
                currentDetour,
                originalDetour: detourSettings.default_detour_distance,
                expansionCount,
                maxDetour: detourSettings.max_detour_distance,
                autoExpansionEnabled: detourSettings.auto_detour_expansion
            }
        });
    } catch (error) {
        console.error('Error getting current detour for driver:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get current detour'
        });
    }
});

// POST request detour expansion for a specific driver
router.post('/ride-matching/expand-detour/:driverId', (req, res) => {
    try {
        const { driverId } = req.params;
        const { currentDetour, expansionCount } = req.body;
        
        if (expansionCount >= detourSettings.max_auto_expansions) {
            return res.json({
                success: false,
                message: 'Maximum expansion limit reached'
            });
        }
        
        const newDetour = Math.min(
            currentDetour + detourSettings.detour_increment,
            detourSettings.max_detour_distance
        );
        
        res.json({
            success: true,
            message: 'Detour distance expanded successfully',
            data: {
                driverId,
                previousDetour: currentDetour,
                newDetour,
                expansionCount: expansionCount + 1,
                maxDetour: detourSettings.max_detour_distance
            }
        });
    } catch (error) {
        console.error('Error expanding detour for driver:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to expand detour'
        });
    }
});

module.exports = router;
