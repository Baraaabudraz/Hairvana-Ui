# Database Seeders

This directory contains database seeders for the Hairvana platform. Seeders are used to populate the database with initial data for development and testing purposes.

## Available Seeders

- **Users**: Creates admin users, salon owners, and regular customers
- **Salons**: Creates sample salons with different statuses and configurations
- **Subscription Plans**: Creates the three subscription tiers (Basic, Standard, Premium)
- **Subscriptions**: Creates active subscriptions for salons with billing history

## Running the Seeders

To run all seeders at once:

```bash
npm run seed
```

This will execute the `seed.js` file, which runs all seeders in the correct order.

## Important Notes

- Seeders check if data already exists before inserting to avoid duplicates
- Fixed UUIDs are used for consistent references between related entities
- The default password for all seeded users is `admin123`
- Seeders will update related records (e.g., salon owner stats when creating salons)

## Customizing Seeders

You can modify the seed data in the `index.js` file to add more entities or change the existing ones. Make sure to maintain the relationships between entities (e.g., owner_id in salons must match an existing user id).