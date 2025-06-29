# Database Schema Changes - Removing Data Duplication

## Overview

This document describes the changes made to remove data duplication between the `users` and `user_settings` tables.

## Problem

The original schema had duplicated fields between `users` and `user_settings` tables:
- `name`, `email`, `phone`, `avatar`

This caused data inconsistency and maintenance overhead.

## Solution

### Migration: `20250628091746_remove_user_settings_duplication.sql`

The migration:
1. Backs up existing data
2. Drops and recreates user_settings table without duplicated fields
3. Restores only settings-specific data
4. Adds constraints and recreates security policies
5. Creates a `user_profiles` view for combined data access

### New Schema

#### `users` table (unchanged)
Contains core user data: id, name, email, phone, role, status, avatar, etc.

#### `user_settings` table (updated)
Contains only settings data: department, timezone, language, bio

#### `user_profiles` view (new)
Combines data from both tables for easy access.

## Benefits

1. No more data duplication
2. Clear separation of concerns
3. Easier maintenance
4. Better performance
5. Data consistency

## Migration Notes

- The migration is backward compatible and preserves existing data
- Existing user_settings records are preserved (only duplicated fields are removed)
- The `user_profiles` view provides a seamless way to access combined data
- All existing API endpoints continue to work with the new structure

## Usage Examples

### Getting user profile data:
```sql
-- Use the view for complete profile data
SELECT * FROM user_profiles WHERE id = 'user-uuid';

-- Or query tables separately
SELECT * FROM users WHERE id = 'user-uuid';
SELECT * FROM user_settings WHERE user_id = 'user-uuid';
```

### Updating user data:
```sql
-- Update core user data
UPDATE users SET name = 'New Name', email = 'new@email.com' WHERE id = 'user-uuid';

-- Update settings data
UPDATE user_settings SET timezone = 'America/New_York', language = 'en' WHERE user_id = 'user-uuid';
``` 