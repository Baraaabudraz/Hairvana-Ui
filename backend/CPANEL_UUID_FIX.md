# 🔧 cPanel UUID Generation Fix Guide

## Problem
When running `npx sequelize-cli db:migrate` on cPanel, you get:
```
ERROR: function gen_random_uuid() does not exist
```

## Root Cause
- cPanel/Shared hosting environments often don't allow PostgreSQL extensions
- The `gen_random_uuid()` function requires the `pgcrypto` extension
- Many hosting providers restrict extension installation

## Solution Options

### Option 1: Use uuid-ossp Extension (Recommended)
If your hosting provider allows extensions:

1. **Run the extension migration first:**
   ```bash
   npx sequelize-cli db:migrate --to 20250630083200-enable-uuid-extension.js
   ```

2. **Update all migrations to use `uuid_generate_v4()`:**
   - Replace `gen_random_uuid()` with `uuid_generate_v4()` in all migrations
   - The script `fix-uuid-migrations.js` will do this automatically

3. **Run migrations:**
   ```bash
   npx sequelize-cli db:migrate
   ```

### Option 2: Let Sequelize Handle UUID Generation (Fallback)
If you cannot enable any extensions:

1. **Run the cPanel fix migration:**
   ```bash
   npx sequelize-cli db:migrate --to 20250630082900-cpanel-uuid-fix.js
   ```

2. **Update your models to generate UUIDs:**
   ```javascript
   // In your models, ensure UUID fields have:
   id: {
     type: DataTypes.UUID,
     defaultValue: DataTypes.UUIDV4,  // This generates UUID in Node.js
     primaryKey: true
   }
   ```

3. **Run remaining migrations:**
   ```bash
   npx sequelize-cli db:migrate
   ```

## Step-by-Step Instructions

### Step 1: Check Your Hosting Environment
```bash
# Try to enable uuid-ossp extension
npx sequelize-cli db:migrate --to 20250630083200-enable-uuid-extension.js
```

### Step 2A: If Extension Works
```bash
# Fix all migrations
node fix-uuid-migrations.js

# Run all migrations
npx sequelize-cli db:migrate

# Seed the database
npm run seed
```

### Step 2B: If Extension Fails
```bash
# Apply cPanel fix
npx sequelize-cli db:migrate --to 20250630082900-cpanel-uuid-fix.js

# Run remaining migrations
npx sequelize-cli db:migrate

# Seed the database
npm run seed
```

## Migration Files Created

1. **`20250630083200-enable-uuid-extension.js`** - Enables uuid-ossp extension
2. **`20250630082900-cpanel-uuid-fix.js`** - Removes problematic UUID defaults
3. **`fix-uuid-migrations.js`** - Script to update all migrations

## Verification

After running migrations, verify everything works:

```bash
# Test database connection
node -e "const { sequelize } = require('./lib/supabase'); sequelize.authenticate().then(() => console.log('✅ Database connected')).catch(console.error)"

# Test server startup
npm start
```

## Troubleshooting

### If you still get UUID errors:
1. **Check if tables exist:**
   ```sql
   \dt
   ```

2. **Check if extension is enabled:**
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'uuid-ossp';
   ```

3. **Manual fix - Update specific migration:**
   ```javascript
   // Replace in migration files:
   defaultValue: Sequelize.literal('gen_random_uuid()')
   // With:
   defaultValue: Sequelize.literal('uuid_generate_v4()')
   // Or remove defaultValue entirely
   ```

### If you get permission errors:
- Contact your hosting provider
- Ask them to enable PostgreSQL extensions
- Or use Option 2 (Sequelize UUID generation)

## Final Notes

- **Option 1** is preferred as it's more efficient (database generates UUIDs)
- **Option 2** works on any hosting but is slightly less efficient
- Both options will resolve the deployment issue
- Your application will work the same way regardless of which option you choose

## Success Indicators

✅ No UUID generation errors during migration  
✅ All tables created successfully  
✅ Seeder runs without errors  
✅ Server starts and connects to database  
✅ API endpoints respond correctly 