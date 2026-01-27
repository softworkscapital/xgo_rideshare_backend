/**
 * Timezone Utility Module
 * 
 * Handles all timezone conversions consistently across the application.
 * 
 * STRATEGY:
 * - Database stores all times in UTC
 * - Server operates in local timezone (Africa/Harare - UTC+2)
 * - All time comparisons convert UTC to local time before comparing
 * 
 * USAGE:
 * const { getLocalTime, getUTCTime, minutesSince, isExpired } = require('./utils/timezone');
 */

// Zimbabwe timezone (Africa/Harare) is UTC+2
const TIMEZONE_OFFSET_HOURS = 2;
const TIMEZONE_OFFSET_MS = TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000;

/**
 * Convert UTC database time to local server time
 * @param {Date|string} utcTime - UTC time from database
 * @returns {Date} Local time
 */
function getLocalTime(utcTime) {
  if (!utcTime) return null;
  
  const date = new Date(utcTime);
  if (isNaN(date.getTime())) return null;
  
  // Add timezone offset to convert UTC to local time
  return new Date(date.getTime() + TIMEZONE_OFFSET_MS);
}

/**
 * Convert local server time to UTC for database storage
 * @param {Date} localTime - Local time
 * @returns {Date} UTC time
 */
function getUTCTime(localTime = new Date()) {
  if (!localTime) return null;
  
  const date = new Date(localTime);
  if (isNaN(date.getTime())) return null;
  
  // Subtract timezone offset to convert local time to UTC
  return new Date(date.getTime() - TIMEZONE_OFFSET_MS);
}

/**
 * Get current time in UTC (for database inserts)
 * @returns {Date} Current UTC time
 */
function getCurrentUTC() {
  return getUTCTime(new Date());
}

/**
 * Get current time in local timezone
 * @returns {Date} Current local time
 */
function getCurrentLocal() {
  return new Date();
}

/**
 * Calculate minutes elapsed since a UTC database time
 * @param {Date|string} utcTime - UTC time from database
 * @returns {number} Minutes elapsed
 */
function minutesSince(utcTime) {
  if (!utcTime) return Infinity;
  
  const localTime = getLocalTime(utcTime);
  if (!localTime) return Infinity;
  
  const now = getCurrentLocal();
  return (now - localTime) / (1000 * 60);
}

/**
 * Check if a UTC database time is older than specified minutes
 * @param {Date|string} utcTime - UTC time from database
 * @param {number} minutes - Minutes threshold
 * @returns {boolean} True if expired
 */
function isExpired(utcTime, minutes) {
  return minutesSince(utcTime) > minutes;
}

/**
 * Format a UTC database time for display in local timezone
 * @param {Date|string} utcTime - UTC time from database
 * @param {string} format - Format string (default: ISO)
 * @returns {string} Formatted local time
 */
function formatLocalTime(utcTime, format = 'ISO') {
  const localTime = getLocalTime(utcTime);
  if (!localTime) return 'N/A';
  
  if (format === 'ISO') {
    return localTime.toISOString();
  } else if (format === 'readable') {
    return localTime.toLocaleString('en-ZW', { 
      timeZone: 'Africa/Harare',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  return localTime.toString();
}

/**
 * Add minutes to a UTC time
 * @param {Date|string} utcTime - UTC time from database
 * @param {number} minutes - Minutes to add
 * @returns {Date} New UTC time
 */
function addMinutes(utcTime, minutes) {
  const date = new Date(utcTime);
  return new Date(date.getTime() + (minutes * 60 * 1000));
}

/**
 * Check if time1 is before time2 (both in UTC)
 * @param {Date|string} utcTime1 
 * @param {Date|string} utcTime2 
 * @returns {boolean}
 */
function isBefore(utcTime1, utcTime2) {
  const date1 = new Date(utcTime1);
  const date2 = new Date(utcTime2);
  return date1 < date2;
}

/**
 * Check if time1 is after time2 (both in UTC)
 * @param {Date|string} utcTime1 
 * @param {Date|string} utcTime2 
 * @returns {boolean}
 */
function isAfter(utcTime1, utcTime2) {
  const date1 = new Date(utcTime1);
  const date2 = new Date(utcTime2);
  return date1 > date2;
}

module.exports = {
  // Conversion functions
  getLocalTime,
  getUTCTime,
  getCurrentUTC,
  getCurrentLocal,
  
  // Time calculation functions
  minutesSince,
  isExpired,
  addMinutes,
  
  // Comparison functions
  isBefore,
  isAfter,
  
  // Formatting functions
  formatLocalTime,
  
  // Constants
  TIMEZONE_OFFSET_HOURS,
  TIMEZONE_OFFSET_MS
};
