# 🚀 Deploy to Render - Step by Step

## Prerequisites
- GitHub account
- Render account (sign up at https://render.com)
- Your API keys ready

## Step 1: Push to GitHub

```bash
cd Deresegn-ai

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - ScanLogic Telegram Bot"

# Create a new repo on GitHub, then:
git remote add origin git@github.com:yoniapp/Deresegn-ai.git
git branch -M main
git push -u origin main
```

## Step 2: Connect to Render

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub account
4. Select the `Deresegn-ai` repository

## Step 3: Configure the Service

Render will auto-detect the `render.yaml` file. Verify these settings:

- **Name**: `scanlogic-bot` (or your choice)
- **Region**: Oregon (or closest to you)
- **Branch**: `main`
- **Build Command**: `npm install`
- **Start Command**: `npm run dev`
- **Plan**: Free

## Step 4: Add Environment Variables

In the Render dashboard, add these environment variables:

```
GEMINI_API_KEY=your-gemini-api-key-here
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
APP_URL=https://your-app-name.onrender.com
```

**Important**: For `APP_URL`, use the URL that Render gives you. It will look like:
`https://scanlogic-bot.onrender.com`

You can find this URL in the Render dashboard after creating the service.

## Step 5: Deploy

1. Click "Create Web Service"
2. Render will start building and deploying
3. Wait 2-3 minutes for the first deploy
4. Check the logs for "Server running on..." and "Telegram Webhook set to..."

## Step 6: Update APP_URL (Important!)

After the first deploy:

1. Copy your Render URL (e.g., `https://scanlogic-bot.onrender.com`)
2. Go to Environment Variables in Render dashboard
3. Update `APP_URL` to your actual Render URL
4. Click "Save Changes"
5. Render will automatically redeploy

## Step 7: Test Your Bot

1. Open Telegram
2. Search for your bot
3. Send `/start`
4. You should get a welcome message! 🎉

## Troubleshooting

### Bot not responding?

Check the logs in Render dashboard:
- Look for "Telegram Webhook set to..." message
- Check for any errors

### Webhook errors?

Manually set the webhook:
```bash
curl https://your-app-name.onrender.com/api/set-webhook
```

### Check webhook status:
```bash
curl https://your-app-name.onrender.com/api/webhook-status
```

## Important Notes

### Free Tier Limitations
- Service spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- 750 hours/month free

### Keep Service Alive (Optional)
Use a service like UptimeRobot to ping your service every 10 minutes:
- URL to ping: `https://your-app-name.onrender.com/api/health`
- Interval: 10 minutes

### Upgrade to Paid Plan
For production use, consider upgrading to a paid plan ($7/month) for:
- No spin-down
- Faster response times
- Better reliability

## Next Steps

Once deployed:
- Test all bot features
- Send receipt photos
- Try natural language queries
- Test the export function

## Need Help?

Check Render logs for errors:
1. Go to Render dashboard
2. Click on your service
3. Click "Logs" tab
4. Look for error messages
