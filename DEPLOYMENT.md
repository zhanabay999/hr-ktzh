# Deployment Instructions

## Vercel Deployment

### Prerequisites
1. A Vercel account (sign up at https://vercel.com)
2. A Neon PostgreSQL database (sign up at https://neon.tech)

### Environment Variables

Before deploying to Vercel, you need to configure the following environment variables:

#### Required Variables

1. **DATABASE_URL**
   - Get from Neon Console: https://console.neon.tech
   - Format: `postgresql://user:password@host/database?sslmode=require`
   - Example: `postgresql://neondb_owner:password@ep-xxx.aws.neon.tech/neondb?sslmode=require`

2. **NEXTAUTH_SECRET**
   - Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
   - Should be a long random string
   - Example: `hhP2V5D7EFJbhN8w2LeyBB0lm66EMv45y7mtWjFhHHA=`

3. **NEXTAUTH_URL** (Production only)
   - Your production URL
   - Example: `https://hr-ktzh.vercel.app`

### Steps to Deploy

#### 1. Configure Environment Variables in Vercel

1. Go to https://vercel.com/dashboard
2. Select your project (hr-ktzh)
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - Click "Add New"
   - Enter Name and Value
   - Select environments (Production, Preview, Development)
   - Click "Save"

#### 2. Database Setup

The database needs to be initialized before the first deployment:

**Option 1: Using the setup script (recommended)**
```bash
npm run db:setup
```

**Option 2: Manual SQL execution**
1. Go to Neon Console: https://console.neon.tech
2. Open SQL Editor
3. Run the SQL from `neon-setup.sql`
4. Run the SQL from `update-password.sql`

#### 3. Deploy

After setting environment variables and initializing the database:

1. **Automatic Deploy**: Push to GitHub main branch
   ```bash
   git push origin main
   ```
   Vercel will automatically detect the push and deploy

2. **Manual Deploy**:
   - Go to Vercel Dashboard → Deployments
   - Click "Redeploy"

### Initial Login Credentials

After deployment, you can login with:

**Super Admin:**
- Employee ID: `0000001`
- Password: `151192`

**HR Super Admins:**
- Employee IDs: `0000002` - `0000006`
- Password: `HRSuper123!`

### Troubleshooting

#### Build fails with "DATABASE_URL environment variable is not set"
- Make sure you added DATABASE_URL in Vercel Environment Variables
- Redeploy after adding the variable

#### Authentication fails
- Verify NEXTAUTH_SECRET is set in Vercel
- Verify NEXTAUTH_URL matches your production URL
- Check that the database was initialized with users

#### Database connection fails
- Verify DATABASE_URL is correct in Vercel settings
- Test the connection string locally first
- Make sure Neon database is running and accessible

### Local Development

1. Clone the repository
   ```bash
   git clone https://github.com/zhanabay999/hr-ktzh.git
   cd hr-ktzh
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env.local`
   ```bash
   cp .env.example .env.local
   ```

4. Update `.env.local` with your values

5. Initialize database
   ```bash
   npm run db:setup
   ```

6. Run development server
   ```bash
   npm run dev
   ```

7. Open http://localhost:3000

### Database Commands

```bash
# Setup database (create tables + seed users)
npm run db:setup

# Seed database only
npm run db:seed

# Push schema changes (Drizzle)
npm run db:push

# Generate migrations
npm run db:generate
```

### Production Build

Test production build locally:

```bash
npm run build
npm start
```

Access at http://localhost:3000
