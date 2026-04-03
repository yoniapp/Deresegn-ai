# ✅ Render Deployment Checklist

## Before Deploying

- [ ] All code is working locally (server running on localhost:3000)
- [ ] `.env` file has all required keys
- [ ] `.gitignore` includes `.env` (to keep secrets safe)
- [ ] `.env.example` is updated with placeholder values

## GitHub Setup

- [ ] Created/Updated GitHub repository
- [ ] Committed all changes
- [ ] Pushed to GitHub main branch

```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

## Render Setup

- [ ] Signed up at https://render.com
- [ ] Connected GitHub account
- [ ] Created new Web Service
- [ ] Selected the Deresegn-ai repository
- [ ] Verified build/start commands

## Environment Variables in Render

Add these in Render Dashboard → Environment:

- [ ] `GEMINI_API_KEY` = (your Gemini API key)
- [ ] `VITE_SUPABASE_URL` = (your Supabase URL)
- [ ] `VITE_SUPABASE_ANON_KEY` = (your Supabase anon key)
- [ ] `TELEGRAM_BOT_TOKEN` = (your Telegram bot token)
- [ ] `APP_URL` = (your Render URL, e.g., https://scanlogic-bot.onrender.com)

**Note**: You'll need to update `APP_URL` after first deploy with your actual Render URL!

## First Deploy

- [ ] Clicked "Create Web Service"
- [ ] Waited for build to complete (2-3 minutes)
- [ ] Checked logs for "Server running on..."
- [ ] Copied the Render URL from dashboard

## Update APP_URL

- [ ] Updated `APP_URL` environment variable with actual Render URL
- [ ] Saved changes (triggers automatic redeploy)
- [ ] Waited for redeploy to complete
- [ ] Checked logs for "Telegram Webhook set to..."

## Testing

- [ ] Opened Telegram
- [ ] Found your bot
- [ ] Sent `/start` command
- [ ] Received welcome message
- [ ] Sent test receipt photo
- [ ] Bot processed the receipt successfully

## Webhook Verification

Check webhook status:
```bash
curl https://your-app-name.onrender.com/api/webhook-status
```

Should show:
```json
{
  "ok": true,
  "result": {
    "url": "https://your-app-name.onrender.com/api/telegram-webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

## Optional: Keep Service Alive

Free tier spins down after 15 minutes of inactivity.

To keep it alive:
- [ ] Sign up at https://uptimerobot.com (free)
- [ ] Create new monitor
- [ ] Monitor type: HTTP(s)
- [ ] URL: `https://your-app-name.onrender.com/api/health`
- [ ] Interval: 10 minutes

## Troubleshooting

### Bot not responding?
1. Check Render logs for errors
2. Verify all environment variables are set
3. Check webhook status with curl command above
4. Manually set webhook: `curl https://your-app-name.onrender.com/api/set-webhook`

### Slow first response?
- Normal on free tier (cold start after 15 min inactivity)
- Consider UptimeRobot to keep service alive
- Or upgrade to paid plan ($7/month)

### Database errors?
- Verify Supabase credentials
- Check that `receipts` table exists
- Test Supabase connection from Render logs

## Production Ready

For production use:
- [ ] Upgrade to Render paid plan ($7/month) for no spin-down
- [ ] Set up proper error monitoring (Sentry, LogRocket)
- [ ] Add rate limiting for API endpoints
- [ ] Set up database backups
- [ ] Configure custom domain (optional)

## Success! 🎉

Your Telegram bot is now live and accessible 24/7!

Next steps:
- Share your bot with users
- Monitor usage in Render dashboard
- Check Supabase for stored receipts
- Add more features as needed
