# Deploying Healthware to Vercel

This guide will help you deploy your healthcare management application to Vercel with both frontend and backend working together.

## Prerequisites

1. **MongoDB Atlas Account**: Your app uses MongoDB, so you'll need a MongoDB Atlas cluster
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **GitHub Repository**: Push your code to GitHub

## Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free cluster
3. Create a database user with read/write permissions
4. Get your connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/database`)
5. Whitelist all IP addresses (0.0.0.0/0) for Vercel deployment

## Step 2: Prepare Environment Variables

You'll need these environment variables for Vercel:

### Backend Environment Variables:
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: A secure random string for JWT token signing
- `NODE_ENV`: Set to "production"

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel CLI (Recommended)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. From your project root directory, run:
   ```bash
   vercel
   ```

4. Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? Choose your account
   - Link to existing project? **No**
   - What's your project's name? **healthware** (or your preferred name)
   - In which directory is your code located? **.**

5. Set up environment variables:
   ```bash
   vercel env add MONGODB_URI
   vercel env add JWT_SECRET
   vercel env add NODE_ENV
   ```

6. Deploy:
   ```bash
   vercel --prod
   ```

### Option B: Deploy via Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: Leave empty (uses root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `frontend/dist`

5. Add Environment Variables in the Vercel dashboard:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string (generate one at [jwt.io](https://jwt.io))
   - `NODE_ENV`: `production`

6. Deploy the project

## Step 4: Verify Deployment

1. Visit your deployed app URL
2. Check that the frontend loads correctly
3. Test the API endpoints by trying to register/login
4. Monitor the Vercel Function logs for any backend errors

## Project Structure

```
/
├── vercel.json                 # Vercel configuration
├── package.json               # Root package.json with build scripts
├── frontend/
│   ├── .env.production       # Frontend production environment
│   ├── .env.local           # Frontend local development environment  
│   ├── package.json         # Frontend dependencies
│   └── dist/               # Built frontend (created by npm run build)
└── backend/
    ├── .env.example        # Backend environment template
    ├── package.json        # Backend dependencies
    └── server.js          # Backend entry point
```

## API Routes

All API routes are available at `/api/*`:
- Frontend: `https://your-app.vercel.app`
- Backend API: `https://your-app.vercel.app/api/*`

## Troubleshooting

### Common Issues:

1. **MongoDB Connection Errors**:
   - Verify your MONGODB_URI is correct
   - Ensure your MongoDB Atlas cluster allows connections from all IPs (0.0.0.0/0)
   - Check that your database user has proper permissions

2. **JWT Errors**:
   - Make sure JWT_SECRET environment variable is set
   - Ensure the JWT_SECRET is the same across all deployments

3. **Build Errors**:
   - Check that all dependencies are listed in package.json files
   - Verify the build script works locally: `npm run build`

4. **Function Timeout**:
   - Vercel functions have a 30-second timeout limit
   - Optimize database queries and API responses

### Checking Logs:

1. In Vercel dashboard, go to your project
2. Click on "Functions" tab
3. View logs for each API call to debug issues

## Local Development

To run the app locally:

1. Install dependencies:
   ```bash
   npm run install:all
   ```

2. Set up backend environment:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. Run backend:
   ```bash
   npm run dev:backend
   ```

4. Run frontend (in a new terminal):
   ```bash
   npm run dev:frontend
   ```

The frontend will be available at `http://localhost:5173` and will proxy API requests to the backend at `http://localhost:5001`.

## Support

If you encounter issues:
1. Check Vercel function logs
2. Verify all environment variables are set
3. Test your MongoDB connection string
4. Ensure your code works locally first
