# How to Find PostgreSQL Connection String in Azure Portal

## Step-by-Step

### Step 1: Navigate to Connection Strings

1. Go to your PostgreSQL server (`hadea-db`) in Azure Portal
2. In the left menu, look for **"Settings"** section
3. Click **"Connection strings"** (or "Connect" → "Connection strings")

### Step 2: Find PostgreSQL Connection String

You'll see multiple connection string formats:
- **JDBC** (Java) - NOT what you need
- **ADO.NET** (.NET) - NOT what you need
- **Node.js** - This is close, but may need adjustment
- **PHP** - NOT what you need
- **Python** - NOT what you need
- **PostgreSQL** - **THIS IS WHAT YOU NEED!**

### Step 3: Copy the PostgreSQL Connection String

1. Find the section labeled **"PostgreSQL"** or **"Connection string"**
2. You'll see something like:
   ```
   postgresql://postgresadmin@hadea-db.postgres.database.azure.com:5432/postgres?sslmode=require
   ```
3. **Copy this entire string**

### Step 4: Add Your Password

The connection string will have `@` but no password. You need to add it:

**Format:**
```
postgresql://USERNAME:PASSWORD@SERVER.postgres.database.azure.com:5432/DATABASE?sslmode=require
```

**Example:**
If your connection string is:
```
postgresql://postgresadmin@hadea-db.postgres.database.azure.com:5432/postgres?sslmode=require
```

And your password is `MyPassword123`, change it to:
```
postgresql://postgresadmin:MyPassword123@hadea-db.postgres.database.azure.com:5432/postgres?sslmode=require
```

**Important:** Insert the password right after the username, separated by a colon `:`

### Alternative: If You Only See JDBC

If you only see JDBC format, you can construct it manually:

**Format:**
```
postgresql://USERNAME:PASSWORD@SERVER.postgres.database.azure.com:5432/DATABASE?sslmode=require
```

**Example:**
```
postgresql://postgresadmin:YOUR_PASSWORD@hadea-db.postgres.database.azure.com:5432/postgres?sslmode=require
```

Replace:
- `postgresadmin` with your actual username
- `YOUR_PASSWORD` with your actual password
- `hadea-db` with your server name
- `postgres` is the default database (you can keep this)

### Step 5: Verify the Connection String

Your final connection string should:
- ✅ Start with `postgresql://`
- ✅ Include username and password (separated by `:`)
- ✅ Include server name (`.postgres.database.azure.com`)
- ✅ Include port (`:5432`)
- ✅ Include database name (`/postgres`)
- ✅ End with `?sslmode=require`

**Example of correct format:**
```
postgresql://postgresadmin:MySecurePass123@hadea-db.postgres.database.azure.com:5432/postgres?sslmode=require
```

## Visual Guide

```
Azure Portal
  └─ PostgreSQL Server (hadea-db)
     └─ Settings (left menu)
        └─ Connection strings
           └─ Look for "PostgreSQL" section
              └─ Copy the connection string
                 └─ Add password after username
                    Format: postgresql://USERNAME:PASSWORD@SERVER...
```

## What to Do With It

Once you have the complete connection string (with password):

1. Go to App Service → Configuration → Application settings
2. Add new setting: `DATABASE_URL`
3. Paste the connection string
4. Save and restart

## Troubleshooting

**Can't find "PostgreSQL" connection string?**
- Look for "Connection string" or "Connection parameters"
- You might see it under "Connect" → "Connection strings"
- If you only see JDBC, construct it manually using the format above

**Password has special characters?**
- Some characters need URL encoding:
  - `@` becomes `%40`
  - `#` becomes `%23`
  - `$` becomes `%24`
  - `%` becomes `%25`
  - `&` becomes `%26`
  - `+` becomes `%2B`
  - `=` becomes `%3D`
  - `?` becomes `%3F`

**Example with special characters:**
If password is `My@Pass#123`, it becomes `My%40Pass%23123`
