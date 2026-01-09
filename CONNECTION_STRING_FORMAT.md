# Correct Connection String Format

## Azure Shows This Format (Query Parameters):
```
postgresql://hadea-db.postgres.database.azure.com:5432/postgres?user=Y2ZA@etbnl.eurofins.com&password=[password]&sslmode=require
```

## Prisma Needs This Format (Standard PostgreSQL):
```
postgresql://USERNAME:PASSWORD@SERVER:PORT/DATABASE?sslmode=require
```

## Conversion Steps

### Your Username: `Y2ZA@etbnl.eurofins.com`
**Important:** The `@` symbol in the username must be URL-encoded as `%40`

So `Y2ZA@etbnl.eurofins.com` becomes: `Y2ZA%40etbnl.eurofins.com`

### Your Password: Replace `[password]` with your actual password

If your password has special characters, they may also need URL encoding:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`
- `?` → `%3F`
- `!` → `%21`

## Correct Format for Your Case

```
postgresql://Y2ZA%40etbnl.eurofins.com:YOUR_ACTUAL_PASSWORD@hadea-db.postgres.database.azure.com:5432/postgres?sslmode=require
```

**Replace `YOUR_ACTUAL_PASSWORD` with your actual password.**

## Example

If your password is `MyPass123!`, the connection string would be:
```
postgresql://Y2ZA%40etbnl.eurofins.com:MyPass123%21@hadea-db.postgres.database.azure.com:5432/postgres?sslmode=require
```

(Note: `!` becomes `%21`)

## Quick Reference: URL Encoding

Common characters that need encoding:
- `@` = `%40`
- `!` = `%21`
- `#` = `%23`
- `$` = `%24`
- `%` = `%25`
- `&` = `%26`
- `+` = `%2B`
- `=` = `%3D`
- `?` = `%3F`
- `/` = `%2F`
- `:` = `%3A`

## Testing the Connection String

After creating the connection string, test it:
```bash
npx prisma db pull
```

If it works, you'll see the database schema. If it fails, check:
1. Username is URL-encoded correctly
2. Password is URL-encoded if it has special characters
3. Firewall rules allow your connection
