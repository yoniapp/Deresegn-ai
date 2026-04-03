# 🚀 Render Deployment - Quick Reference

## 1. Push to GitHub
```bash
cd Deresegn-ai
git add .
git commit -m "Deploy to Render"
git push origin main
```

## 2. Create Service on Render
1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect GitHub → Select `Deresegn-ai` repo
4. Settings will auto-fill from `render.yaml`

## 3. Add Environment Variables
In Render dashboard, add:

```
GEMINI_API_KEY=AIzaSyCYPOCd9rY8TgHxlSPvU6AuW6y6ilKBWR0
VITE_SUPABASE_URL=https://cucxtbdfltmuieurjwnk.supabase.co
VITE_SUPABASE_ANON_KEY=(get the correct key from Supabase)
TELEGRAM_BOT_TOKEN=8688122430:AAFXAxGcV4u0zPidUOaGELuU0bzWkSOLCGQ
APP_URL=https://your-app-name.onrender.com
```

⚠️ **Important**: Replace `APP_URL` with your actual Render URL after first deploy!

## 4. Deploy
Click "Create Web Service" → Wait 2-3 minutes

## 5. Update APP_URL
1. Copy your Render URL (e.g., `https://scanlogic-bot-xyz.onrender.com`)
2. Update `APP_URL` in Environment Variables
3. Save (auto-redeploys)

## 6. Test
Open Telegram → Find your bot → Send `/start`

## Quick Commands

Check webhook:
```bash
curl https://your-app.onrender.com/api/webhook-status
```

Set webhook manually:
```bash
curl https://your-app.onrender.com/api/set-webhook
```

Health check:
```bash
curl https://your-app.onrender.com/api/health
```

## Common Issues

**Bot not responding?**
- Check Render logs
- Verify APP_URL is correct
- Run webhook status command

**Slow response?**
- Free tier spins down after 15 min
- Use UptimeRobot to keep alive
- Or upgrade to paid plan

**Need the correct Supabase anon key?**
1. Go to Supabase dashboard
2. Project Settings → API
3. Copy "anon" / "public" key (NOT the URL!)

## That's it! 🎉

Your bot should now be live at your Render URL.
