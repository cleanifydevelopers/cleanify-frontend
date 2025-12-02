# 🚀 Cleanify - Google Cloud Deployment Guide (FREE TIER)

## **Step-by-Step Deployment Instructions**

### **Prerequisites:**
- Google Account (free)
- Git installed
- Backend already running locally

---

## **PART 1: Set Up MongoDB Atlas (Database) - FREE**

### 1. Go to MongoDB Atlas
- Visit: https://www.mongodb.com/cloud/atlas
- Sign up for FREE account
- Create a free cluster (M0 - 512MB storage)

### 2. Get Connection String
- Copy your MongoDB connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/dbname`)
- Save this safely

---

## **PART 2: Deploy Backend to Google Cloud Run - FREE**

### 1. Set up Google Cloud Project
```powershell
# Login to Google Cloud
gcloud auth login

# Create a new project (or use existing)
gcloud config set project YOUR_PROJECT_NAME
```

### 2. Prepare Backend for Deployment
Go to your backend folder:
```powershell
cd c:\Users\Vivek\cleanify-final\server
```

### 3. Update `.env` for Production
```powershell
$content = @'
PORT=8080
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.mongodb.net/cleanify
HOST_URL=https://YOUR_PROJECT-backend.run.app
GMAIL_USER=cleanifydevelopers@gmail.com
GMAIL_PASS=vtiw clah bcet gidf
ADMIN_EMAIL=cleanifydevelopers@gmail.com
'@
Set-Content -Path .env -Value $content
```

### 4. Create Dockerfile for Backend
Create file: `c:\Users\Vivek\cleanify-final\server\Dockerfile`

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

ENV PORT=8080
EXPOSE 8080

CMD ["npm", "start"]
```

### 5. Deploy Backend
```powershell
cd c:\Users\Vivek\cleanify-final\server

# Deploy to Cloud Run
gcloud run deploy cleanify-backend `
  --source . `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated

# Note the URL that appears (e.g., https://cleanify-backend-xxxxx.run.app)
# Save this for frontend configuration
```

---

## **PART 3: Deploy Frontend to Google Cloud Storage + CDN - FREE**

### 1. Build Frontend for Production
```powershell
cd c:\Users\Vivek\Cleanify-Frontend-Only

# Update .env for production
$content = @'
VITE_API_BASE=https://cleanify-backend-xxxxx.run.app
'@
Set-Content -Path .env -Value $content

# Build the app
npm run build
```

### 2. Create Cloud Storage Bucket
```powershell
# Create bucket (must be unique name)
gsutil mb gs://cleanify-frontend-bucket

# Enable public access
gsutil iam ch serviceAccount:YOUR_SERVICE_ACCOUNT@appspot.gserviceaccount.com:objectViewer gs://cleanify-frontend-bucket
```

### 3. Upload Built Frontend
```powershell
# Deploy built files to bucket
gsutil -m cp -r dist/* gs://cleanify-frontend-bucket/

# Make files public
gsutil -m acl ch -u AllUsers:R gs://cleanify-frontend-bucket/**
```

### 4. Set Bucket as Website
```powershell
# Configure as static website
gsutil web set -m index.html gs://cleanify-frontend-bucket
```

### 5. Enable Cloud CDN (Optional for faster access)
```powershell
# Create load balancer with CDN in Google Cloud Console
# (or use gsutil to set cache headers)
gsutil -m setmeta -h "Cache-Control:public, max-age=3600" gs://cleanify-frontend-bucket/**
```

---

## **PART 4: Connect Everything**

### 1. Update Frontend API Base URL
In `c:\Users\Vivek\Cleanify-Frontend-Only\.env`:
```
VITE_API_BASE=https://YOUR_BACKEND_URL.run.app
```

### 2. Rebuild and Redeploy Frontend
```powershell
cd c:\Users\Vivek\Cleanify-Frontend-Only
npm run build
gsutil -m cp -r dist/* gs://cleanify-frontend-bucket/
```

### 3. Access Your App
Frontend: `https://storage.googleapis.com/cleanify-frontend-bucket/index.html`

---

## **FREE TIER LIMITS:**

✅ **Google Cloud Run:** 180,000 vCPU-seconds/month (enough for ~100k requests)
✅ **Cloud Storage:** 5GB free
✅ **CDN:** First 1GB/month free
✅ **MongoDB Atlas:** 512MB storage, 3 nodes

---

## **Cost Estimate (Monthly):**
- Backend + Frontend + Database: **$0 (free tier)**
- Once you exceed: ~$15-30/month

---

## **Troubleshooting:**

### Issue: "Cloud Run service not found"
- Make sure gcloud is logged in: `gcloud auth login`
- Check project: `gcloud config list`

### Issue: "Frontend can't reach backend API"
- Verify backend URL in `.env` matches Cloud Run URL
- Check CORS is enabled in backend

### Issue: "MongoDB connection failed"
- Verify connection string is correct
- Add your IP to MongoDB Atlas whitelist (or allow all)

---

## **Quick Commands Reference:**

```powershell
# View Cloud Run services
gcloud run services list

# View logs
gcloud run services describe cleanify-backend --region us-central1

# Delete service if needed
gcloud run services delete cleanify-backend --region us-central1

# List storage buckets
gsutil ls

# View bucket contents
gsutil ls gs://cleanify-frontend-bucket/
```

---

**Your Cleanify app is now live on Google Cloud! 🎉**
