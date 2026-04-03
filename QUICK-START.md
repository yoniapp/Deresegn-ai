# 🚀 Quick Start - Get Your Telegram Bot Running in 5 Minutes

## Current Status
✅ Dependencies installed  
✅ Project structure ready  
❌ Need API keys configuration  

## What You Need to Do

### 1️⃣ Get Telegram Bot Token (2 minutes)
1. Open Telegram app
2. Search for `@BotFather`
3. Send: `/newbot`
4. Choose a name: e.g., "ScanLogic Assistant"
5. Choose a username: e.g., "scanlogic_bot"
6. Copy the token (looks like: `123456789:ABCdefGHI...`)

### 2️⃣ Get Google Gemini API Key (1 minute)
1. Visit: https://aistudio.google.com/app/apikey
2. Click "Get API Key" or "Create API Key"
3. Copy the key

### 3️⃣ Setup Supabase Database (2 minutes)
1. Visit: https://supabase.com
2. Sign up/Login
3. Click "New Project"
4. After creation, go to: Project Settings > API
5. Copy:
   - Project URL
   - anon/public key

6. Go to SQL Editor and run:
\`\`\`sql
CREATE TABLE receipts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id TEXT NOT NULL,
  message_id TEXT,
  merchant TEXT,
  total NUMERIC,
  currency TEXT,
  date DATE,
  category TEXT,
  items JSONB,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_receipts_telegram_id ON receipts(telegram_id);
\`\`\`

### 4️⃣ Update .env File
Open `Deresegn-ai/.env` and fill in your keys:

\`\`\`bash
GEMINI_API_KEY="paste-your-gemini-key-here"
VITE_SUPABASE_URL="https://xxxxx.supabase.co"
VITE_SUPABASE_ANON_KEY="paste-your-supabase-key-here"
TELEGRAM_BOT_TOKEN="paste-your-bot-token-here"
APP_URL="http://localhost:3000"
\`\`\`

### 5️⃣ Test Your Setup
\`\`\`bash
cd Deresegn-ai
node test-setup.js
\`\`\`

If all checks pass ✅, continue to step 6.

### 6️⃣ For Local Testing - Setup Ngrok
Since Telegram needs a public URL to send messages to your bot:

\`\`\`bash
# Install ngrok
brew install ngrok  # macOS
# or download from https://ngrok.com

# In a new terminal, run:
ngrok http 3000
\`\`\`

Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)

Update `.env`:
\`\`\`bash
APP_URL="https://abc123.ngrok-free.app"
\`\`\`

### 7️⃣ Start the Bot
\`\`\`bash
npm run dev
\`\`\`

You should see:
\`\`\`
Server running on http://localhost:3000
Telegram Webhook set to: https://abc123.ngrok-free.app/api/telegram-webhook
\`\`\`

### 8️⃣ Test in Telegram
1. Open Telegram
2. Search for your bot username (e.g., @scanlogic_bot)
3. Send: `/start`
4. You should get a welcome message! 🎉
5. Try sending a receipt photo

## Troubleshooting

### Bot doesn't respond?
\`\`\`bash
# Check webhook status
curl http://localhost:3000/api/webhook-status
\`\`\`

### Need to reset webhook?
\`\`\`bash
curl http://localhost:3000/api/set-webhook
\`\`\`

### Still having issues?
Check the terminal where `npm run dev` is running for error messages.

## What the Bot Can Do

📸 **Receipt Scanning**: Send a photo of any receipt  
💬 **Natural Language Queries**: "How much did I spend this week?"  
🔍 **Search Receipts**: "Show me receipts from Starbucks"  
📊 **Export Data**: Use `/export` command  
📄 **Fill PDF Forms**: Upload a PDF form (coming soon)

## Next Steps

- Deploy to production (Railway, Render, Google Cloud Run)
- Add more features from the roadmap
- Customize the bot messages in `server.ts`

Need help? Check `SETUP.md` for detailed documentation.
