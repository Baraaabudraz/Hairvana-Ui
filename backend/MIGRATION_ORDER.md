# Migration Order Guide

This document outlines the correct order for running migrations based on foreign key dependencies.

## Correct Migration Order

### 1. Base Tables (No Dependencies)
- `20250630083300-create-user.js` - Creates users, salon_owners, customers tables
- `20250630083527-create-salon.js` - Creates salons table (depends on users)
- `20250630083654-create-subscription.js` - Creates subscription_plans table
- `20250630083807-create-service.js` - Creates services table (depends on salons)

### 2. Dependent Tables
- `20250630083929-create-staff.js` - Creates staff table (depends on salons)
- `20250630083935-create-appointment.js` - Creates appointments table (depends on users, salons, staff)
- `20250701000200-create-payment.js` - Creates payments table (depends on users, appointments)
- `20250701000300-create-appointment-services.js` - Creates appointment_services pivot table (depends on appointments, services)

### 3. Independent Tables
- `20250630084159-create-analytic.js` - Creates analytics table
- `20250630084212-create-report.js` - Creates reports table (depends on users, salons)
- `20250701000100-create-hairstyle.js` - Creates hairstyles table
- `20250701112836-create-notification-template.js` - Creates notification_templates table
- `20250701120647-create-notifications-table.js` - Creates notifications table
- `20250701130000-create-user-settings.js` - Creates user_settings table (depends on users)
- `20250701140000-create-billing-history.js` - Creates billing_histories table (depends on subscriptions)
- `20250703130000-create-billing-settings.js` - Creates billing_settings table (depends on users)
- `20250703150000-create-report-templates.js` - Creates report_templates table

### 4. Extension Migrations
- `20250701000300-extend-user.js` - Extends users table
- `20250701000400-extend-salon.js` - Extends salons table
- `20250701110752-add-limits-to-subscription-plan.js` - Extends subscription_plans table
- `20250703140000-alter-billing-address-to-text.js` - Alters billing_settings table

## Foreign Key Dependencies

```
users
├── salon_owners (user_id)
├── customers (user_id)
├── salons (owner_id)
├── appointments (user_id, cancelled_by)
├── payments (user_id)
├── reports (user_id)
├── user_settings (user_id)
├── billing_settings (user_id)

salons
├── services (salon_id)
├── staff (salon_id)
├── appointments (salon_id)
├── subscriptions (salon_id)
├── reports (salon_id)

staff
└── appointments (staff_id)

appointments
├── payments (appointment_id)
└── appointment_services (appointment_id)

services
└── appointment_services (service_id)

subscription_plans
└── subscriptions (plan_id)

subscriptions
└── billing_histories (subscription_id)
```

## Running Migrations

### Fresh Start
```bash
npm run sync:force
npm run seed
```

### Using Migrations
```bash
npm run migrate:undo:all  # Undo all migrations
npm run migrate           # Run all migrations in correct order
npm run seed              # Seed with sample data
```

### Alter Existing Database
```bash
npm run sync:alter        # Sync with alterations (preserves data)
```

## Important Notes

1. **Always run migrations in timestamp order** - Sequelize CLI automatically handles this
2. **Foreign key constraints** are enforced at the database level
3. **Extension migrations** should run after base table migrations
4. **Pivot tables** (like appointment_services) should run after both parent tables
5. **Use `sync:force` for development** when you want to start fresh
6. **Use `sync:alter` for production** when you want to preserve data

## Troubleshooting

If you encounter foreign key constraint errors:
1. Check that dependent tables exist before referencing tables
2. Ensure migration timestamps are in correct order
3. Verify that referenced columns have the correct data types
4. Use `npm run migrate:undo:all` to reset and start fresh 