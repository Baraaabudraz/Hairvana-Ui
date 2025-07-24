# Database Seeders

This directory contains all the database seeders for the Hairvana application. The seeders are designed to populate the database with sample data for development and testing purposes.

## Overview

The seeder system has been refactored to include all the latest models and migrations. The main seeder file (`index.js`) orchestrates the seeding process in the correct order to avoid foreign key constraint issues.

## Seeder Files

### Main Seeder
- `index.js` - Main seeder orchestrator that runs all seeders in the correct sequence

### Individual Seeders
- `20250630085952-demo-users.js` - Seeds user accounts (super_admin, admin, salon owners, customers)
- `20250701141000-demo-billing-histories.js` - Seeds billing history records
- `20250703150000-demo-report-templates.js` - Seeds report templates
- `20250707000200-demo-services.js` - Seeds salon services
- `20250707000300-demo-hairstyles.js` - Seeds hairstyle catalog (updated with segmented_image_url)
- `20250707000400-demo-salon-services.js` - Seeds salon-service relationships
- `20250707000500-demo-staff.js` - Seeds salon staff members
- `20250709000100-demo-integration-settings.js` - Seeds integration settings
- `20250709001000-demo-notifications.js` - Seeds notification records
- `20250709130000-demo-notification-users.js` - Seeds notification-user relationships

## New Models Added

The following new models have been added to the seeder system:

### Owner Documents
- **Model**: `OwnerDocument`
- **Purpose**: Stores business documentation for salon owners
- **Fields**: commercial_registration_url, certificate_url, additional_info

### Reviews
- **Model**: `Review`
- **Purpose**: Customer reviews for salons and services
- **Fields**: rating, title, comment, service_quality, appointment_id (optional)

### Settings Models
- **BillingSettings**: Payment methods, billing addresses, tax information
- **SecuritySettings**: 2FA, login attempts, IP restrictions, session timeouts
- **PlatformSettings**: System-wide configuration settings
- **BackupSettings**: Backup frequency, retention, storage configuration
- **NotificationPreferences**: User notification preferences
- **IntegrationSettings**: Third-party service integrations

### Mobile Devices
- **Model**: `MobileDevice`
- **Purpose**: Tracks mobile app installations and push notification tokens
- **Fields**: device_token, device_type, app_version, os_version

### Notification Users
- **Model**: `NotificationUser`
- **Purpose**: Junction table for notification-user relationships
- **Fields**: is_read, read_at

## Updated Models

### Hairstyles
- Added `segmented_image_url` field for AR filter generation
- Updated seeder to include sample segmented image URLs

### Salons
- Removed `revenue`, `bookings`, and `rating` fields (moved to separate tables)
- Updated to focus on core salon information

## Seeding Order

The seeders run in the following order to maintain referential integrity:

1. **Users** - Creates all user accounts
2. **Salons** - Creates salon records
3. **Subscription Plans** - Creates subscription plan templates
4. **Subscriptions** - Creates active subscriptions for salons
5. **Notification Templates** - Creates notification templates
6. **Services** - Creates service catalog
7. **Hairstyles** - Creates hairstyle catalog
8. **Salon Services** - Links salons to services
9. **Staff** - Creates staff members
10. **Integration Settings** - Creates integration configurations
11. **Report Templates** - Creates report templates
12. **Owner Documents** - Creates business documentation
13. **Reviews** - Creates customer reviews
14. **Billing Settings** - Creates billing configurations
15. **Security Settings** - Creates security configurations
16. **Platform Settings** - Creates system settings
17. **Backup Settings** - Creates backup configurations
18. **Notification Preferences** - Creates user notification settings
19. **Mobile Devices** - Creates mobile device records
20. **Billing Histories** - Creates billing history records
21. **Notification Users** - Creates notification-user relationships

## Usage

### Run All Seeders
```bash
cd backend
npm run seed
```

### Run Individual Seeder
```bash
cd backend
npx sequelize-cli db:seed --seed 20250707000300-demo-hairstyles.js
```

### Undo All Seeders
```bash
cd backend
npx sequelize-cli db:seed:undo:all
```

## Sample Data

The seeders create realistic sample data including:

- **Users**: 7 users (1 super_admin, 1 admin, 3 salon owners, 2 customers)
- **Salons**: 2 active salons with complete business information
- **Services**: 8 common salon services
- **Hairstyles**: 4 sample hairstyles with AR-ready images
- **Staff**: Multiple staff members per salon
- **Reviews**: Sample customer reviews with ratings
- **Settings**: Complete configuration for all user types

## Notes

- All passwords are set to `admin123` for development
- UUIDs are used for all primary keys
- Timestamps are automatically generated
- Foreign key relationships are properly maintained
- Sample data is realistic but fictional

## Troubleshooting

If you encounter foreign key constraint errors:

1. Ensure migrations have been run: `npx sequelize-cli db:migrate`
2. Clear existing data: `npx sequelize-cli db:seed:undo:all`
3. Run seeders in order: `npm run seed`

For specific model errors, check that the model associations are properly defined in the models directory.