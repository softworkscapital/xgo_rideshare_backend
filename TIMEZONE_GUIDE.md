# Timezone Handling Guide

## Overview

This project uses a **consistent timezone strategy** to avoid timezone-related bugs:

- **Database:** Stores all timestamps in **UTC**
- **Server:** Operates in **Africa/Harare timezone (UTC+2)**
- **Frontend:** Displays times in **user's local timezone**

## Timezone Utility Module

Location: `utils/timezone.js`

### Key Functions

```javascript
const { 
  getLocalTime,      // Convert UTC DB time to local time
  getUTCTime,        // Convert local time to UTC for DB
  getCurrentUTC,     // Get current time in UTC
  getCurrentLocal,   // Get current local time
  minutesSince,      // Calculate minutes since UTC time
  isExpired,         // Check if UTC time is expired
  formatLocalTime    // Format UTC time for display
} = require('./utils/timezone');
```

## Usage Examples

### 1. Checking if a database timestamp is expired

```javascript
// WRONG - Direct comparison with timezone issues
const createdTime = new Date(item.created_at); // UTC from DB
const now = new Date(); // Local time
const diff = (now - createdTime) / (1000 * 60); // WRONG! Comparing different timezones

// CORRECT - Using timezone utility
const { isExpired } = require('./utils/timezone');
const expired = isExpired(item.created_at, 5); // Properly handles UTC to local conversion
```

### 2. Calculating time elapsed

```javascript
// WRONG
const elapsed = (Date.now() - new Date(item.created_at)) / (1000 * 60);

// CORRECT
const { minutesSince } = require('./utils/timezone');
const elapsed = minutesSince(item.created_at);
```

### 3. Getting current time for database insert

```javascript
// WRONG - Stores local time in DB
const now = new Date();
pool.query('INSERT INTO table (created_at) VALUES (?)', [now]);

// CORRECT - Stores UTC in DB
const { getCurrentUTC } = require('./utils/timezone');
const now = getCurrentUTC();
pool.query('INSERT INTO table (created_at) VALUES (?)', [now]);
```

### 4. Formatting time for display

```javascript
// WRONG - Shows UTC time to user
const displayTime = item.created_at.toString();

// CORRECT - Shows local time to user
const { formatLocalTime } = require('./utils/timezone');
const displayTime = formatLocalTime(item.created_at, 'readable');
```

## Common Pitfalls

### ❌ DON'T DO THIS:

```javascript
// Comparing UTC database time with local server time
const dbTime = new Date(row.created_at); // UTC
const now = new Date(); // Local (UTC+2)
if (now - dbTime > 5 * 60 * 1000) { // WRONG! 2-hour offset!
  // This will always be true due to timezone difference
}
```

### ✅ DO THIS INSTEAD:

```javascript
const { isExpired } = require('./utils/timezone');
if (isExpired(row.created_at, 5)) { // CORRECT!
  // Properly converts UTC to local before comparing
}
```

## Database Schema

All timestamp columns should be:
- Type: `TIMESTAMP` or `DATETIME`
- Default: `CURRENT_TIMESTAMP` (stores in UTC)
- On Update: `CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` (if needed)

## Frontend Handling

The frontend should:
1. Receive UTC timestamps from API
2. Convert to user's local timezone for display
3. Send UTC timestamps back to API

```javascript
// Frontend example
const displayTime = new Date(utcTimestamp).toLocaleString();
```

## Migration Checklist

When updating existing code:

- [ ] Replace `new Date()` comparisons with `minutesSince()` or `isExpired()`
- [ ] Replace `Date.now()` in time calculations with timezone utility functions
- [ ] Use `getCurrentUTC()` for database inserts
- [ ] Use `formatLocalTime()` for user-facing displays
- [ ] Test with different timezones to verify correctness

## Files Updated

### Backend
- ✅ `utils/timezone.js` - Centralized timezone utility
- ✅ `cruds/rideshare.js` - Updated `getNegotiationHistory()`
- 🔄 Other files need review (see grep results)

### Frontend
- 🔄 Create timezone utility for React Native
- 🔄 Update time displays to use utility

## Testing

Test scenarios:
1. Create record at 09:00 local time → Should store as 07:00 UTC
2. Check expiration at 09:06 local time → Should correctly identify 6 minutes elapsed
3. Display time to user → Should show 09:00 local time, not 07:00 UTC

## Support

For questions or issues with timezone handling, refer to this guide or the `utils/timezone.js` module documentation.
