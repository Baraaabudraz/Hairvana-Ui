# Avatar Handling Improvements

## Overview

The customer profile avatar handling has been improved to use UUID filenames and proper URL generation using the urlHelper. This provides better security, consistency, and maintainability.

## Key Changes

### 1. **UUID Filename Generation**
- Avatar files now use UUID-based filenames instead of timestamp-based names
- Format: `{uuid}.{extension}` (e.g., `550e8400-e29b-41d4-a716-446655440000.jpg`)
- Provides better security and prevents filename collisions

### 2. **Database Storage**
- **Before**: Stored full path `/uploads/avatars/1754567737656-641456399.jpg`
- **After**: Store only filename `550e8400-e29b-41d4-a716-446655440000.jpg`

### 3. **URL Generation**
- Uses `urlHelper.buildAvatarUrl()` to generate full URLs
- Consistent URL structure across the application
- Environment-based base URL configuration

## Implementation Details

### File Upload Configuration

**Location**: `backend/routes/Api/v0/customer/user.js`

```javascript
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uuid = uuidv4();
    const filename = `${uuid}${ext}`;
    cb(null, filename);
  }
});
```

### Controller Update

**Location**: `backend/controllers/Api/customer/mobileUserController.js`

```javascript
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, preferences } = req.body;
    let avatar = req.body.avatar;
    
    // If a new file was uploaded, store only the filename (UUID)
    if (req.file) {
      avatar = req.file.filename; // Store only the UUID filename
    }
    
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;
    if (preferences) user.preferences = preferences;
    
    await user.save();
    
    return res.json({ success: true, user: serializeUser(user, req) });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update profile' });
  }
};
```

### URL Helper Configuration

**Location**: `backend/helpers/urlHelper.js`

```javascript
const buildUrl = (path, type = 'avatar', options = {}) => {
  if (!path) return null;
  
  // If already absolute URL, return as is
  if (path.startsWith('http')) return path;
  
  // Get base URL from environment or fallback
  const baseUrl = process.env.BACKEND_BASE_URL || 
                  'http://localhost:5000';
  
  // Remove trailing slash from base URL if present
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  
  // Determine the correct path based on type
  let imagePath;
  switch (type) {
    case 'avatar':
      imagePath = '/backend/uploads/avatars';
      break;
    // ... other cases
  }
  
  // If path already starts with /, use it directly
  if (path.startsWith('/')) {
    return `${cleanBaseUrl}${path}`;
  }
  
  // Otherwise, construct the full path
  return `${cleanBaseUrl}${imagePath}/${path}`;
};
```

### Serializer Integration

**Location**: `backend/serializers/userSerializer.js`

```javascript
const { buildAvatarUrl } = require('../helpers/urlHelper');

function serializeUser(user, options = {}) {
  // ... other code ...
  
  const baseData = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    avatar: avatarFilenameOnly ? user.avatar : buildAvatarUrl(user.avatar, options),
    // ... other fields
  };
  
  // ... rest of the function
}
```

## API Response Examples

### Before (Old Implementation)
```json
{
  "success": true,
  "user": {
    "id": "179a2c8d-501e-4275-bf8a-2b87cf49fffa",
    "name": "test user",
    "email": "test@gmail.com",
    "phone": "0597644664",
    "avatar": "http://localhost:5000/backend/uploads/avatars/1754567737656-641456399.jpg",
    "join_date": "2025-07-29T09:48:06.086Z",
    "createdAt": "2025-07-29T09:48:06.086Z",
    "updatedAt": "2025-08-07T11:55:37.689Z",
    "role_id": "c62057f5-bd6e-4f89-9d63-37b301f990e8",
    "status": "active",
    "preferences": null
  }
}
```

### After (New Implementation)
```json
{
  "success": true,
  "user": {
    "id": "179a2c8d-501e-4275-bf8a-2b87cf49fffa",
    "name": "test user",
    "email": "test@gmail.com",
    "phone": "0597644664",
    "avatar": "http://localhost:5000/backend/uploads/avatars/550e8400-e29b-41d4-a716-446655440000.jpg",
    "join_date": "2025-07-29T09:48:06.086Z",
    "createdAt": "2025-07-29T09:48:06.086Z",
    "updatedAt": "2025-08-07T11:55:37.689Z",
    "role_id": "c62057f5-bd6e-4f89-9d63-37b301f990e8",
    "status": "active",
    "preferences": null
  }
}
```

## Database Storage

### Before
```sql
-- Database stored full path
UPDATE users SET avatar = '/uploads/avatars/1754567737656-641456399.jpg' WHERE id = 'user-id';
```

### After
```sql
-- Database stores only filename
UPDATE users SET avatar = '550e8400-e29b-41d4-a716-446655440000.jpg' WHERE id = 'user-id';
```

## Benefits

### 1. **Security**
- UUID filenames prevent predictable file access
- No timestamp information exposed in filenames
- Reduces risk of enumeration attacks

### 2. **Consistency**
- All avatar URLs generated through urlHelper
- Consistent base URL handling
- Environment-based configuration

### 3. **Maintainability**
- Centralized URL generation logic
- Easy to change base URLs or paths
- Consistent across all user contexts

### 4. **Performance**
- UUID generation is faster than timestamp + random
- No collision risk
- Better file system performance

### 5. **Flexibility**
- Easy to change storage location
- Environment-specific URL generation
- Support for different contexts (public, private, etc.)

## Environment Configuration

### Development
```env
BACKEND_BASE_URL=http://localhost:5000
```

### Production
```env
BACKEND_BASE_URL=https://api.hairvana.com
```

## File Structure

```
backend/
├── public/
│   └── uploads/
│       └── avatars/
│           ├── 550e8400-e29b-41d4-a716-446655440000.jpg
│           ├── 6ba7b810-9dad-11d1-80b4-00c04fd430c8.png
│           └── ...
├── helpers/
│   └── urlHelper.js
├── serializers/
│   └── userSerializer.js
└── routes/
    └── Api/
        └── v0/
            └── customer/
                └── user.js
```

## Testing

### Test Avatar Upload
```bash
curl -X PUT "http://localhost:5000/backend/api/v0/customer/user/profile" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "avatar=@/path/to/avatar.jpg" \
  -F "name=Updated Name" \
  -F "phone=1234567890"
```

### Expected Response
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "name": "Updated Name",
    "email": "user@example.com",
    "phone": "1234567890",
    "avatar": "http://localhost:5000/backend/uploads/avatars/550e8400-e29b-41d4-a716-446655440000.jpg",
    "preferences": null,
    "createdAt": "2025-07-29T09:48:06.086Z",
    "updatedAt": "2025-08-07T11:55:37.689Z"
  }
}
```

## Migration Notes

### For Existing Data
If you have existing users with old avatar paths, you may need to migrate them:

```sql
-- Example migration script
UPDATE users 
SET avatar = SUBSTRING_INDEX(avatar, '/', -1) 
WHERE avatar LIKE '/uploads/avatars/%';
```

### For New Uploads
- All new avatar uploads will automatically use UUID filenames
- Old avatar files can remain in the filesystem
- URL generation will work for both old and new formats

## Error Handling

The implementation includes proper error handling:

- **File type validation**: Only allows jpeg, jpg, png, gif
- **File size limits**: 5MB maximum
- **Upload directory creation**: Automatically creates upload directory if it doesn't exist
- **Database transaction safety**: Proper error handling in controller

This improved avatar handling system provides better security, consistency, and maintainability while ensuring backward compatibility with existing data. 