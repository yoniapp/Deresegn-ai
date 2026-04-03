# ✅ ScanLogic Setup Checklist

## Prerequisites
- [ ] Node.js 20+ installed
- [ ] npm installed
- [ ] Telegram account

## API Keys & Services
- [ ] Created Telegram bot via @BotFather
- [ ] Got Telegram Bot Token
- [ ] Created Google Gemini API key
- [ ] Created Supabase project
- [ ] Got Supabase URL
- [ ] Got Supabase anon key
- [ ] Created `receipts` table in Supabase

## Configuration
- [ ] Filled in `.env` file with all keys
- [ ] Ran `npm install` (already done ✅)
- [ ] Ran `node test-setup.js` - all checks pass

## Local Development Setup
- [ ] Installed ngrok (for local testing)
- [ ] Started ngrok: `ngrok http 3000`
- [ ] Updated `APP_URL` in `.env` with ngrok URL
- [ ] Started server: `npm run dev`
- [ ] Webhook set successfully (check terminal output)

## Testing
- [ ] Opened bot in Telegram
- [ ] Sent `/start` command
- [ ] Received welcome message
- [ ] Sent test receipt photo
- [ ] Bot extracted data successfully

## Optional
- [ ] Customized bot messages in `server.ts`
- [ ] Added custom categories
- [ ] Tested export functionality
- [ ] Tested natural language queries

## Production (When Ready)
- [ ] Chose hosting platform (Railway/Render/Cloud Run)
- [ ] Set environment variables in production
- [ ] Updated `APP_URL` to production URL
- [ ] Deployed application
- [ ] Verified webhook in production
- [ ] Tested bot in production

---

## Quick Commands Reference

\`\`\`bash
# Test setup
npm run test-setup

# Start development server
npm run dev

# Check webhook status
npm run check-webhook

# Manually set webhook
npm run set-webhook

# Start ngrok (in separate terminal)
ngrok http 3000
\`\`\`

## Need Help?

1. Check `QUICK-START.md` for step-by-step guide
2. Check `SETUP.md` for detailed documentation
3. Check server logs for error messages
4. Verify all environment variables are set correctly
