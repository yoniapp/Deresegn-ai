# ScanLogic Setup Guide

## Quick Start - Get Telegram Bot Running

### Step 1: Get Your API Keys

#### 1.1 Telegram Bot Token
1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow the prompts to create your bot
4. Copy the token (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

#### 1.2 Google Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Get API Key"
3. Create a new API key
4. Copy the key

#### 1.3 Supabase Setup
1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Go to Project Settings > API
4. Copy:
   - Project URL (VITE_SUPABASE_URL)
   - Anon/Public key (VITE_SUPABASE_ANON_KEY)

### Step 2: Create Database Tables

Run this SQL in your Supabase SQL Editor:

```sql
-- Create receipts table
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

-- Create index for faster queries
CREATE INDEX idx_receipts_telegram_id ON receipts(telegram_id);
CREATE INDEX idx_receipts_merchant ON receipts(merchant);

-- Enable Row Level Security (optional for production)
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
```

### Step 3: Configure Environment Variables

Edit the `.env` file in the project root:

```bash
# Add your tokens here
GEMINI_API_KEY="your-gemini-api-key-here"
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"
APP_URL="http://localhost:3000"
```

### Step 4: Run the Bot

```bash
# Start the development server
npm run dev
```

The server will start on `http://localhost:3000`

### Step 5: Setup Telegram Webhook (For Local Testing)

For local development, you need to expose your localhost to the internet. Use ngrok:

```bash
# Install ngrok (if not installed)
brew install ngrok  # macOS
# or download from https://ngrok.com

# Start ngrok tunnel
ngrok http 3000
```

Copy the HTTPS URL from ngrok (e.g., `https://abc123.ngrok.io`)

Update your `.env`:
```bash
APP_URL="https://abc123.ngrok.io"
```

Restart the server:
```bash
npm run dev
```

The webhook will be automatically set when the server starts.

### Step 6: Test Your Bot

1. Open Telegram
2. Search for your bot by username
3. Send `/start` command
4. Try sending a receipt photo!

## Troubleshooting

### Bot not responding?

1. Check webhook status:
   ```bash
   curl http://localhost:3000/api/webhook-status
   ```

2. Manually set webhook:
   ```bash
   curl http://localhost:3000/api/set-webhook
   ```

3. Check server logs for errors

### Common Issues

- **"TELEGRAM_BOT_TOKEN is missing"**: Make sure `.env` file exists and has the token
- **Webhook fails**: Ensure APP_URL is publicly accessible (use ngrok for local dev)
- **Database errors**: Verify Supabase credentials and that the `receipts` table exists
- **AI not working**: Check GEMINI_API_KEY is valid

## Production Deployment

For production, deploy to a platform with a public URL:

- **Railway**: `railway up`
- **Render**: Connect GitHub repo
- **Google Cloud Run**: `gcloud run deploy`
- **Heroku**: `git push heroku main`

Update `APP_URL` in production environment variables to your deployed URL.
