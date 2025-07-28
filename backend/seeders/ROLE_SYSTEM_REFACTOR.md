# Role System Refactor Documentation

## Overview
The role system has been refactored to use more descriptive and user-friendly role names. The new system provides clear role definitions with appropriate permissions for each role type.

## New Role Structure

### 1. Super Admin
- **Name**: `super admin`
- **Description**: Super Administrator with full system access
- **Color**: `#dc2626` (Red)
- **Permissions**: Full access to all resources and actions
- **Users Created**:
  - Super Admin (superadmin@hairvana.com)

### 2. Admin
- **Name**: `admin`
- **Description**: Administrator with management access
- **Color**: `#2563eb` (Blue)
- **Permissions**: All permissions except delete on billing/settings
- **Users Created**:
  - Admin User (admin@hairvana.com)

### 3. Salon Owner
- **Name**: `salon owner`
- **Description**: Salon Owner with business management access
- **Color**: `#16a34a` (Green)
- **Permissions**: View/add/edit on most resources, delete only on reviews/appointments
- **Users Created**:
  - Sarah Johnson (sarah@beautysalon.com)
  - Michael Chen (michael@stylehub.com)
  - Emma Rodriguez (emma@glamourcuts.com)

### 4. Customer
- **Name**: `customer`
- **Description**: Customer with limited access
- **Color**: `#6B7280` (Gray)
- **Permissions**: View on most resources, add/edit/delete own reviews/appointments
- **Users Created**:
  - John Smith (john.smith@email.com)
  - Lisa Davis (lisa.davis@email.com)
  - David Wilson (david.wilson@email.com)
  - Maria Garcia (maria.garcia@email.com)
  - Robert Brown (robert.brown@email.com)

## Permission Matrix

| Resource | Super Admin | Admin | Salon Owner | Customer |
|----------|-------------|-------|-------------|----------|
| users | Full | Full | View/Add/Edit | View |
| salons | Full | Full | View/Add/Edit | View |
| reports | Full | Full | View/Add/Edit | View |
| staff | Full | Full | View/Add/Edit | View |
| services | Full | Full | View/Add/Edit | View |
| appointments | Full | Full | Full | Add/Edit/Delete Own |
| subscriptions | Full | Full | View/Add/Edit | View |
| notifications | Full | Full | View/Add/Edit | View |
| billing | Full | View/Add/Edit | View/Add/Edit | View |
| settings | Full | View/Add/Edit | View/Add/Edit | View |
| reviews | Full | Full | Full | Add/Edit/Delete Own |
| analytics | Full | Full | View/Add/Edit | View |
| roles | Full | Full | View/Add/Edit | View |

## Database Changes

### Updated Files:
1. **Role Seeder** (`20250710192000-seed-roles.js`)
   - Updated role names to use spaces instead of underscores
   - Added descriptive role descriptions
   - Updated role colors for better visual distinction

2. **Permissions Seeder** (`20250710193000-seed-permissions.js`)
   - Updated to reference new role names
   - Maintained the same permission structure
   - Updated role mapping to use new names

3. **User Seeder** (`index.js`)
   - Updated user creation to use new role names
   - Created users with appropriate roles
   - Updated salon owner and customer filtering

4. **Salon Seeder** (`20250724000000-demo-salons.js`)
   - Updated to look for 'salon owner' role instead of 'salon'
   - Fixed salon owner user association

5. **Notification Users Seeder** (`20250709130000-demo-notification-users.js`)
   - Updated to use new role names
   - Fixed user filtering for notifications

6. **Notifications Seeder** (`20250709001000-demo-notifications.js`)
   - Updated user query to use role_id instead of role column
   - Fixed role name references

7. **New User Seeder** (`20250725000000-seed-users-with-roles.js`)
   - Created comprehensive user seeder with all role types
   - Includes test credentials for all users

## Frontend Updates

### Updated Files:
1. **Salon Creation Page** (`src/pages/dashboard/salons/new.tsx`)
   - Updated to use 'salon owner' role name
   - Enhanced error handling for role fetching
   - Added fallback logic for role detection

2. **User Types** (`src/types/user.ts`)
   - Added proper TypeScript interfaces for Role and User
   - Improved type safety for role objects

3. **API Functions** (`src/api/users.ts`)
   - Added `fetchUsersByRole` helper function
   - Improved role-based user filtering

## Test Credentials

All users are created with the password: `password123`

### Super Admin
- Email: superadmin@hairvana.com
- Password: password123

### Admin
- Email: admin@hairvana.com
- Password: password123

### Salon Owners
- Email: sarah@beautysalon.com
- Email: michael@stylehub.com
- Email: emma@glamourcuts.com
- Password: password123

### Customers
- Email: john.smith@email.com
- Email: lisa.davis@email.com
- Email: david.wilson@email.com
- Email: maria.garcia@email.com
- Email: robert.brown@email.com
- Password: password123

## Migration Notes

### Breaking Changes:
1. Role names now use spaces instead of underscores
2. Frontend code must be updated to use new role names
3. Any hardcoded role references need to be updated

### Backward Compatibility:
- The system maintains the same permission structure
- User functionality remains the same
- API endpoints continue to work as expected

## Benefits

1. **Clearer Role Names**: More descriptive and user-friendly
2. **Better Organization**: Logical grouping of permissions
3. **Improved Security**: Granular permission control
4. **Enhanced UX**: Clear role distinctions in the UI
5. **Scalable**: Easy to add new roles and permissions

## Future Enhancements

1. **Role-Based UI**: Different interfaces for different roles
2. **Permission Groups**: Group permissions for easier management
3. **Dynamic Permissions**: Runtime permission changes
4. **Audit Logging**: Track permission changes and usage 