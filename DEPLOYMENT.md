# Dr. MobiCare Portal - Deployment Guide

## Overview
This application has a React frontend and Node.js/PostgreSQL backend. We'll deploy it to Railway (free tier).

## Prerequisites
- GitHub account (you already have: bstolz-test)
- Railway account (free, create at railway.app)
- PostgreSQL database (provided by Railway)

---

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `drmobicare-portal`
3. Description: `Dr. MobiCare Internal Portal`
4. Make it **Private** (important for security)
5. Click "Create repository"

---

## Step 2: Push Code to GitHub

In your terminal/command line, run:

```bash
cd /path/to/drmobicare-portal
git config user.email "your-email@example.com"
git config user.name "Your Name"
git add .
git commit -m "Initial commit: Full Dr. MobiCare Portal"
git branch -M main
git remote add origin https://github.com/bstolz-test/drmobicare-portal.git
git push -u origin main
```

---

## Step 3: Create Railway Account & Project

1. Go to https://railway.app
2. Sign up with GitHub (use your bstolz-test account)
3. Click "Create New Project"
4. Select "Provision PostgreSQL"
5. This creates your database automatically

---

## Step 4: Add Backend Service

1. In your Railway project, click "Add Service"
2. Select "GitHub Repo"
3. Select `drmobicare-portal` from your repos
4. Railway will detect it's a Node.js project
5. Click "Deploy"

---

## Step 5: Configure Backend Environment Variables

In Railway dashboard for your backend service:

1. Go to "Variables" tab
2. Add these variables:

```
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRE=7d
ENCRYPTION_KEY=your-encryption-key-min-32-characters-long
SHIPPO_API_KEY=your_shippo_key_here
DOCUSIGN_CLIENT_ID=your_docusign_id
DOCUSIGN_CLIENT_SECRET=your_docusign_secret
DOCUSIGN_API_ACCOUNT_ID=your_account_id
GOOGLE_MAPS_API_KEY=your_maps_key
FRONTEND_URL=https://your-railway-frontend-url.railway.app
```

**Important:** Railway automatically provides `DATABASE_URL` when you added PostgreSQL. Copy it and paste it in.

---

## Step 6: Add Frontend Service

1. Go back to project overview
2. Click "Add Service" again
3. Select "GitHub Repo"
4. Select `drmobicare-portal` again
5. In "Settings," set:
   - **Root Directory:** `frontend`
   - **Start Command:** `npm run build && npm install -g serve && serve -s build -l 5000`

---

## Step 7: Connect Frontend to Backend

In the frontend service "Variables" tab, add:

```
REACT_APP_API_URL=https://[your-backend-railway-url]/api
```

Get your backend URL from Railway dashboard (it's shown on the backend service card).

---

## Step 8: Initialize Database

Once backend is deployed:

1. Open Railway dashboard
2. Go to your backend service
3. Click "Deployments"
4. Find the running deployment
5. In the logs, you should see "Database connection successful"

If not, run the migration:
- Click "View Logs"
- If you see database errors, the schema might not have created
- You may need to manually run the migration (Railway team can help)

---

## Step 9: Test It!

Once both services are deployed:

1. Go to your Railway project
2. Click the frontend service card
3. Click the public URL (should be like `https://drmobicare-frontend.railway.app`)
4. You should see the login page

---

## Step 10: Create Your First Admin Account

Since you don't have users yet, you need to create one manually:

1. In Railway, go to your PostgreSQL service
2. Click "Connect"
3. Use the connection string to connect via a PostgreSQL client (pgAdmin, etc.)

Or, ask me to add a script that creates the first admin user for you.

---

## Common Issues & Fixes

### "Cannot connect to database"
- Check DATABASE_URL is correct
- Make sure it's `postgresql://` not `mysql://`
- Allow Railway to access the database (it's automatic)

### "Frontend can't reach backend"
- Check REACT_APP_API_URL matches your backend URL
- Make sure frontend has this in "Variables"

### "Build fails"
- Check logs in Railway dashboard
- Usually means npm install failed
- Try re-deploying

### "Database connection failed"
- Check DATABASE_URL variable
- Make sure PostgreSQL service is running (green checkmark in Railway)

---

## Accessing the Portal

Once deployed and running:

**Frontend URL:** https://your-frontend.railway.app
**Backend API:** https://your-backend.railway.app/api

---

## Next Steps: Create Admin User

I'll create a script to help you create your first admin account so you can log in.

Then you can start testing the system!

---

## Support

If you hit any issues:
1. Check Railway logs (click service → Deployments → View Logs)
2. Check browser console (F12 → Console tab)
3. Check backend logs for error messages

Let me know what errors you see and we'll fix them!
