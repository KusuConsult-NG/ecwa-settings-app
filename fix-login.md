# Login Fix Instructions

## The Problem
The login is failing because `admin@example.com` doesn't exist in the user database.

## Working Credentials
Use any of these existing accounts:

1. **Email:** `persistent@example.com`  
   **Password:** `admin123`

2. **Email:** `me@and.com`  
   **Password:** `admin123`

3. **Email:** `debug@test.com`  
   **Password:** `admin123`

## Quick Fix Options

### Option 1: Use Existing Account
Just use one of the working credentials above.

### Option 2: Create New Account
1. Go to `/signup`
2. Create account with your email
3. Login with new credentials

### Option 3: Add Admin User (Local Development)
Run this in your terminal:

```bash
# Start the server
npm run dev

# In another terminal, create admin user
curl -X GET http://localhost:3000/api/test-auth

# Then login with:
# Email: admin@example.com
# Password: admin123
```

## For Production (Vercel)
The test endpoint will create the admin user automatically when you visit:
`https://your-app.vercel.app/api/test-auth`

Then login with:
- Email: `admin@example.com`
- Password: `admin123`
