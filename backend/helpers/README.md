# Backend Helpers

This directory contains helper functions for common backend operations.

## URL Helper (`urlHelper.js`)

The URL helper provides functions for building full URLs for images and assets using environment variables for the base URL.

### Environment Configuration

Add the following to your `.env` file:

```env
# Backend Base URL Configuration
BACKEND_BASE_URL=http://localhost:5000

# Alternative environment variable names for compatibility
VITE_BACKEND_URL=http://localhost:5000
```

### Usage Examples

```javascript
const { 
  buildUrl, 
  buildAvatarUrl, 
  buildSalonImageUrl, 
  buildImageUrls 
} = require('../helpers/urlHelper');

// Build avatar URL
const avatarUrl = buildAvatarUrl('user-avatar.jpg', options);
// Returns: http://localhost:5000/images/avatar/user-avatar.jpg

// Build salon image URL
const salonImageUrl = buildSalonImageUrl('salon-photo.jpg', options);
// Returns: http://localhost:5000/images/salon/salon-photo.jpg

// Build gallery images URLs
const galleryUrls = buildImageUrls(['img1.jpg', 'img2.jpg'], 'gallery', options);
// Returns: [
//   'http://localhost:5000/images/gallery/img1.jpg',
//   'http://localhost:5000/images/gallery/img2.jpg'
// ]

// Generic URL building
const customUrl = buildUrl('custom-image.jpg', 'custom', options);
// Returns: http://localhost:5000/images/custom-image.jpg
```

### Available Functions

- `buildUrl(path, type, options)` - Generic URL builder
- `buildAvatarUrl(path, options)` - Avatar-specific URL builder
- `buildSalonImageUrl(path, options)` - Salon image URL builder
- `buildStaffImageUrl(path, options)` - Staff image URL builder
- `buildGalleryImageUrl(path, options)` - Gallery image URL builder
- `buildImageUrls(images, type, options)` - Process array of images
- `getBaseUrl()` - Get base URL from environment

### Image Types

- `avatar` - `/images/avatar/`
- `salon` - `/images/salon/`
- `staff` - `/images/staff/`
- `service` - `/images/services/`
- `hairstyle` - `/images/hairstyles/`
- `gallery` - `/images/gallery/`

### Features

- **Environment-based configuration**: Uses `BACKEND_BASE_URL` or `VITE_BACKEND_URL` from environment
- **Fallback support**: Falls back to `http://localhost:5000` if no environment variable is set
- **Absolute URL detection**: Automatically detects and preserves absolute URLs
- **Path normalization**: Handles both relative and absolute paths correctly
- **Type-specific paths**: Different image types get appropriate subdirectories 