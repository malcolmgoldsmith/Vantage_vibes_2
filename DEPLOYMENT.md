# Vercel Deployment Guide for Vantage Vibes

This guide explains how to deploy your Vantage Vibes app generator to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **API Keys**:
   - **Gemini API Key**: Get from [Google AI Studio](https://aistudio.google.com/apikey)
   - **Anthropic API Key**: Get from [Anthropic Console](https://console.anthropic.com/)

## Phase 1: Security Setup ✅ COMPLETED

- [x] Created `.gitignore` with `.env` entry
- [x] Created `.env.example` with placeholder values
- [x] Updated PORT configuration to use environment variables
- [x] Configured CORS for production domains
- [x] Installed Anthropic SDK for Claude API
- [x] Replaced Claude CLI with Anthropic API (with CLI fallback)
- [x] Created `vercel.json` configuration

## Phase 2: Database Migration (REQUIRED BEFORE DEPLOYMENT)

### Current Issue
Your app currently stores generated apps and metadata in the local filesystem:
- Generated apps: `src/generated-apps/*.tsx`
- Metadata: `src/generated-apps/apps.json`
- Images: `public/generated-images/`

**Vercel's serverless functions have ephemeral storage** - all files are lost between requests!

### Recommended Solution: MongoDB Atlas + Vercel Blob

#### Option 1: MongoDB Atlas (FREE TIER)

1. **Create MongoDB Atlas Account**
   - Visit [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free M0 cluster (512MB storage)
   - Create a database user with password
   - Whitelist all IP addresses (0.0.0.0/0) for Vercel

2. **Get Connection String**
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/vantagevibes?retryWrites=true&w=majority
   ```

3. **Install Mongoose**
   ```bash
   npm install mongoose
   ```

4. **Create Database Schema**
   Create `lib/db.js`:
   ```javascript
   import mongoose from 'mongoose';

   const AppSchema = new mongoose.Schema({
     id: String,
     name: String,
     componentName: String,
     code: String, // Store TSX code as text
     createdAt: Date,
     description: String,
     aiProvider: String
   });

   export const App = mongoose.model('App', AppSchema);

   export async function connectDB() {
     if (mongoose.connection.readyState === 1) return;
     await mongoose.connect(process.env.DATABASE_URL);
   }
   ```

5. **Update server.js**
   - Replace `fs.readFileSync` / `fs.writeFileSync` with database queries
   - Example:
     ```javascript
     // Before
     fs.writeFileSync(filePath, componentCode);

     // After
     await connectDB();
     await App.create({
       id: Date.now().toString(),
       name: appName,
       componentName,
       code: componentCode,
       // ...
     });
     ```

#### Option 2: Vercel Blob Storage (for images)

1. **Enable Vercel Blob**
   ```bash
   npm install @vercel/blob
   ```

2. **Update Image Endpoints**
   ```javascript
   import { put } from '@vercel/blob';

   // Replace file system writes
   const blob = await put('generated-images/image.png', imageBuffer, {
     access: 'public',
   });

   return blob.url; // Return CDN URL
   ```

## Phase 3: Environment Variables Setup

### Local Development (.env)

```env
# AI Provider Keys
GEMINI_API_KEY=your_actual_gemini_key
ANTHROPIC_API_KEY=your_actual_anthropic_key

# Application
NODE_ENV=development
PORT=3001
ALLOWED_ORIGINS=http://localhost:5174

# Database (add after MongoDB setup)
DATABASE_URL=mongodb+srv://...

# Vercel Blob (add if using)
BLOB_READ_WRITE_TOKEN=vercel_blob_...
```

### Vercel Dashboard Configuration

1. Go to your Vercel project → Settings → Environment Variables
2. Add the following for **Production**, **Preview**, and **Development**:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `GEMINI_API_KEY` | Your Gemini API key | All |
| `ANTHROPIC_API_KEY` | Your Anthropic API key | All |
| `ALLOWED_ORIGINS` | `https://yourapp.vercel.app` | Production |
| `DATABASE_URL` | Your MongoDB connection string | All |
| `NODE_ENV` | `production` | Production |

## Phase 4: Deploy to Vercel

### Option A: GitHub Integration (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Configure:
     - Framework Preset: Vite
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`

3. **Deploy**
   - Vercel will automatically deploy
   - Every push to `main` triggers a new deployment
   - Pull requests get preview deployments

### Option B: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   # First time deployment
   vercel

   # Follow prompts to configure
   # Choose "Yes" to modify settings

   # Deploy to production
   vercel --prod
   ```

## Phase 5: Post-Deployment Testing

### Test Checklist

1. **Frontend Loads**
   - Visit `https://yourapp.vercel.app`
   - Check that UI renders correctly
   - Verify Tailwind styles are applied

2. **API Endpoints Work**
   - Test app creation with Claude
   - Test app creation with Gemini
   - Test image generation
   - Test app editing

3. **Database Persistence**
   - Create an app
   - Refresh the page
   - Verify the app still appears in the grid

4. **CORS Configuration**
   - Ensure no CORS errors in browser console
   - Verify API calls succeed from your domain

## Current Limitations (Before Database Migration)

⚠️ **CRITICAL**: The current codebase will NOT work properly on Vercel without database migration because:

1. Generated apps (`.tsx` files) won't persist between requests
2. `apps.json` metadata will be lost
3. Generated images in `public/generated-images/` will disappear

## Architecture Overview

```
Vercel Deployment
├── Frontend (Static Site)
│   ├── Built with Vite
│   ├── Served from /dist
│   └── React + TypeScript + Tailwind
│
├── Backend (Serverless Function)
│   ├── server.js runs as serverless function
│   ├── Routes: /api/*
│   ├── AI Providers:
│   │   ├── Claude (Anthropic API)
│   │   └── Gemini (Google API)
│   └── Features:
│       ├── App generation
│       ├── Image generation
│       └── Prompt enhancement
│
└── Database (MongoDB Atlas)
    ├── Apps collection
    ├── Metadata storage
    └── Code storage
```

## Cost Estimation

### Free Tier (Hobby Plan)
- **Vercel**:
  - 100 GB bandwidth/month
  - 6,000 build minutes/month
  - Unlimited serverless function executions

- **MongoDB Atlas**:
  - 512MB storage
  - Shared CPU
  - Unlimited connections

- **Anthropic API**:
  - Pay-as-you-go: ~$3 per million input tokens
  - ~$15 per million output tokens
  - Est. $0.01-0.05 per app generation

- **Google Gemini**:
  - Free tier: 15 requests/minute
  - Paid: Variable pricing

**Estimated Monthly Cost**: $0-10 for hobby use, $20-50 for moderate traffic

### Pro Plan ($20/month)
- Removes commercial limits
- 1TB bandwidth
- Faster builds
- Team collaboration features

## Troubleshooting

### Issue: "ANTHROPIC_API_KEY not configured"
**Solution**: Add the API key to Vercel environment variables

### Issue: "Generated apps disappear after refresh"
**Solution**: You need to implement database storage (Phase 2)

### Issue: "CORS error when calling API"
**Solution**:
1. Check `ALLOWED_ORIGINS` environment variable includes your Vercel domain
2. Verify the domain format: `https://yourapp.vercel.app` (no trailing slash)

### Issue: "Build fails on Vercel"
**Solutions**:
- Check build logs in Vercel dashboard
- Ensure `package.json` has correct build script
- Verify all dependencies are in `package.json` (not just devDependencies)

### Issue: "TypeScript validation fails"
**Solution**: `tsc` validation requires TypeScript installed - ensure it's in `dependencies`, not just `devDependencies`

## Next Steps

1. **Implement Database Migration** (see Phase 2)
2. **Set up Vercel Blob Storage** for images
3. **Test locally with `vercel dev`**
4. **Deploy to Vercel**
5. **Monitor logs and errors**
6. **Set up custom domain** (optional)

## Security Reminders

- ✅ Never commit `.env` file
- ✅ Rotate API keys if exposed
- ✅ Use Vercel's environment variables for secrets
- ✅ Enable CORS only for your domains
- ✅ Monitor API usage to avoid unexpected costs

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Google Gemini API Documentation](https://ai.google.dev/gemini-api/docs)

---

**Status**: ⚠️ Ready for deployment after database migration (Phase 2)

**Last Updated**: 2025-11-18
