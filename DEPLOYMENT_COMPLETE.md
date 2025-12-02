# ✅ Cleanify Deployment - Complete Setup

## **🎯 Current Status**
✅ **Email system WORKING** - Verified with live feedback submissions
✅ **Frontend working** - All pages functional
✅ **Backend running** - API responsive
✅ **Database connected** - MongoDB local instance
✅ **Drinking Water button added** - Replaced "Rate Public Toilet"

---

## **📋 What You Need for FREE Deployment**

### 1. **Google Cloud Account** (FREE)
   - Visit: https://cloud.google.com/free
   - Sign up for free tier
   - No credit card needed for first $300 credit

### 2. **MongoDB Atlas Account** (FREE)
   - Visit: https://www.mongodb.com/cloud/atlas
   - Create free M0 cluster (512MB)
   - Copy connection string

### 3. **Google Cloud SDK** (FREE)
   - Download: https://cloud.google.com/sdk/docs/install
   - Install it
   - Run: `gcloud auth login`

---

## **🚀 DEPLOYMENT STEPS (In Order)**

### **STEP 1: Migrate to MongoDB Atlas**
1. Go to MongoDB Atlas
2. Create free cluster
3. Create database user
4. Get connection string (mongodb+srv://...)
5. Replace in backend `.env`:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/cleanify
   ```

### **STEP 2: Deploy Backend to Cloud Run**
```powershell
cd c:\Users\Vivek\cleanify-final\server

gcloud run deploy cleanify-backend `
  --source . `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated
```
✅ You'll get a URL like: `https://cleanify-backend-xxxxx.run.app`

### **STEP 3: Update Frontend Config**
In `.env`:
```
VITE_API_BASE=https://cleanify-backend-xxxxx.run.app
```

### **STEP 4: Build Frontend**
```powershell
cd c:\Users\Vivek\Cleanify-Frontend-Only
npm run build
```
(Creates `dist` folder with static files)

### **STEP 5: Deploy Frontend to Cloud Storage**
```powershell
# Create bucket
gsutil mb gs://cleanify-app-frontend

# Upload built files
gsutil -m cp -r dist/* gs://cleanify-app-frontend/

# Make public
gsutil -m acl ch -u AllUsers:R gs://cleanify-app-frontend/**

# Enable as static website
gsutil web set -m index.html gs://cleanify-app-frontend
```

---

## **🌐 Your Live URLs**
- **Frontend:** `https://storage.googleapis.com/cleanify-app-frontend/index.html`
- **Backend API:** `https://cleanify-backend-xxxxx.run.app`
- **Admin Panel:** `https://cleanify-backend-xxxxx.run.app/admin` (if enabled)

---

## **💰 Cost Breakdown (Monthly)**

| Service | Free Tier | Paid After |
|---------|-----------|------------|
| Cloud Run | 180,000 vCPU-sec (≈100k requests) | $0.00002/sec |
| Cloud Storage | 5GB | $0.020/GB |
| MongoDB Atlas | 512MB | $57/month for M10 |
| Bandwidth | 1GB/month CDN free | $0.12/GB |
| **TOTAL** | **$0** | **~$15-30/month** |

---

## **🔐 Security Notes**

✅ Already configured:
- Gmail SMTP authentication working
- Database connection secure
- CORS enabled
- Environment variables protected

⚠️ To-Do:
- [ ] Set up HTTPS only
- [ ] Enable Cloud SQL Auth (optional)
- [ ] Add rate limiting
- [ ] Monitor API usage

---

## **📱 Testing After Deployment**

1. Open frontend URL in browser
2. Create a complaint ✅
3. View reports ✅
4. Submit feedback (should receive emails) ✅
5. Use chat ✅
6. Locate toilets ✅

---

## **🆘 Common Issues & Fixes**

| Issue | Solution |
|-------|----------|
| 404 Frontend Error | Check `VITE_API_BASE` in `.env` |
| Backend API Error | Verify MongoDB connection string |
| Cold start slow | Normal for Cloud Run, 1st request takes 5-30s |
| Emails not sending | Check Gmail app password (spaces preserved) |
| Out of storage | Delete old reports/photos from database |

---

## **📞 Support**

Quick commands:
```powershell
# Check service status
gcloud run services list

# View logs
gcloud run services describe cleanify-backend --region us-central1

# Delete service
gcloud run services delete cleanify-backend --region us-central1
```

---

## **✨ You're Ready!**

You have a **completely functional Cleanify app** that:
- ✅ Posts complaints with photos
- ✅ Sends emails (working!)
- ✅ Locates nearby toilets
- ✅ Community chat
- ✅ User badges
- ✅ Admin dashboard
- ✅ Feedback system

**Next Step:** Follow the deployment steps above! 🚀
