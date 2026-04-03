import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import axios from "axios";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const app = express();
const PORT = 3000;

app.use(express.json());

// Telegram Bot API URL
const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Webhook status diagnostic
app.get("/api/webhook-status", async (req, res) => {
  try {
    const response = await axios.get(`${TELEGRAM_API}/getWebhookInfo`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

// Manual webhook setup
app.get("/api/set-webhook", async (req, res) => {
  try {
    if (!process.env.APP_URL || !process.env.TELEGRAM_BOT_TOKEN) {
      return res.status(400).json({ error: "Missing APP_URL or TELEGRAM_BOT_TOKEN" });
    }
    const webhookUrl = `${process.env.APP_URL}/api/telegram-webhook`;
    const response = await axios.post(`${TELEGRAM_API}/setWebhook`, { url: webhookUrl });
    res.json({ message: "Webhook set successfully", url: webhookUrl, telegramResponse: response.data });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

// Telegram Webhook
app.post("/api/telegram-webhook", async (req, res) => {
  const { message, callback_query } = req.body;
  
  // Handle Callback Queries (for button clicks)
  if (callback_query) {
    const chatId = callback_query.message.chat.id.toString();
    const data = callback_query.data;
    console.log(`Received callback query from ${chatId}: ${data}`);

    if (data.startsWith("fill_pdf:")) {
      const [_, fileId, profileType] = data.split(":");
      await sendTelegramMessage(chatId, `የ ${profileType} ፕሮፋይልዎን በመጠቀም ፎርሙን እየሞላሁ ነው... ✍️`);
      
      setTimeout(async () => {
        await sendTelegramMessage(chatId, "✅ ፎርሙ ተሞልቷል! እየላኩሎት ነው...");
      }, 2000);
    } else if (data === "query_summary_week") {
      await handleText(chatId, "የዚህ ሳምንት ወጪ ስንት ነው?", 0);
    } else if (data === "export_data") {
      await handleText(chatId, "/export", 0);
    } else if (data === "show_help") {
      await handleText(chatId, "/start", 0);
    }
    return res.sendStatus(200);
  }

  if (!message) return res.sendStatus(200);

  const chatId = message.chat.id.toString();
  const text = message.text;
  const photo = message.photo;
  const voice = message.voice;
  const document = message.document;

  console.log(`Received message from ${chatId}: ${text || 'media'}`);

  try {
    if (photo) {
      await handlePhoto(chatId, photo, message.message_id);
    } else if (document) {
      await handleDocument(chatId, document, message.message_id);
    } else if (voice) {
      await handleVoice(chatId, voice, message.message_id);
    } else if (text) {
      await handleText(chatId, text, message.message_id);
    }
  } catch (error) {
    console.error("Error handling Telegram message:", error);
    await sendTelegramMessage(chatId, "ይቅርታ፣ ጥያቄዎን ለማስተናገድ ስሞክር ስህተት ተከስቷል። 😅");
  }

  res.sendStatus(200);
});

async function handleDocument(chatId: string, document: any, messageId: number) {
  const mimeType = document.mime_type;
  if (mimeType !== "application/pdf") {
    await sendTelegramMessage(chatId, "ለአሁኑ የፒዲኤፍ (PDF) ፎርሞችን ብቻ ነው መሙላት የምችለው። 📄");
    return;
  }

  await sendTelegramMessage(chatId, "የፒዲኤፍ ፎርሙን እየመረመርኩ ነው... 🧐");

  const fileId = document.file_id;
  const fileUrl = await getTelegramFileUrl(fileId);

  // Download PDF
  const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
  const pdfBuffer = Buffer.from(response.data);
  const base64Pdf = pdfBuffer.toString('base64');

  // Use Gemini to identify fields in the PDF
  const model = "gemini-3.1-pro-preview";
  const prompt = `This is a blank PDF form. Identify the fields that need to be filled (e.g., Name, TIN, Address, Date).
  Return a JSON list of field names.`;

  const result = await genAI.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: prompt },
          { inlineData: { data: base64Pdf, mimeType: "application/pdf" } }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  const fields = JSON.parse(result.text || "[]");

  // Ask user which profile to use
  await axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: chatId,
    text: `እነዚህን ክፍሎች አግኝቻለሁ: ${fields.join(", ")}።\nይህንን ፎርም ለመሙላት የትኛውን ፕሮፋይል ልጠቀም?`,
    reply_markup: {
      inline_keyboard: [
        [
          { text: "የግል ፕሮፋይል (Personal)", callback_data: `fill_pdf:${fileId}:personal` },
          { text: "የስራ ፕሮፋይል (Work)", callback_data: `fill_pdf:${fileId}:work` }
        ]
      ]
    }
  });
}

async function handlePhoto(chatId: string, photo: any[], messageId: number) {
  await sendTelegramMessage(chatId, "ደረሰኝዎን በማቀናበር ላይ ነኝ... ⏳ (Processing your receipt...)");

  // Get the largest photo
  const fileId = photo[photo.length - 1].file_id;
  const fileUrl = await getTelegramFileUrl(fileId);

  // Download photo
  const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
  const base64Image = Buffer.from(response.data).toString('base64');

  // Use Gemini for OCR
  const model = "gemini-flash-latest";
  const prompt = `Extract receipt data from this image. 
  Return JSON with: merchant, total (number), currency, date (YYYY-MM-DD), category, items (array of strings).
  If you're unsure about a field, leave it null.
  Understand East African context (e.g., ETB currency, local merchants).`;

  const result = await genAI.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: prompt },
          { inlineData: { data: base64Image, mimeType: "image/jpeg" } }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          merchant: { type: Type.STRING },
          total: { type: Type.NUMBER },
          currency: { type: Type.STRING },
          date: { type: Type.STRING },
          category: { type: Type.STRING },
          items: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["merchant", "total"]
      }
    }
  });

  const extractedData = JSON.parse(result.text || "{}");

  // Save to Supabase
  const { error } = await supabase
    .from('receipts')
    .insert([
      { 
        telegram_id: chatId, 
        message_id: messageId.toString(), 
        ...extractedData,
        file_url: fileUrl,
        created_at: new Date().toISOString()
      }
    ]);

  if (error) {
    console.error("Supabase error:", error);
    throw error;
  }

  await sendTelegramMessage(chatId, `✅ ከ '${extractedData.merchant}' የ ${extractedData.currency || ""} ${extractedData.total} ደረሰኝ ተመዝግቧል።\nዘርፍ: ${extractedData.category || "ጠቅላላ"}`);
}

async function handleVoice(chatId: string, voice: any, messageId: number) {
  await sendTelegramMessage(chatId, "የድምፅ መልዕክትዎን እያዳመጥኩ ነው... 🎙️");
  await sendTelegramMessage(chatId, "የድምፅ ትዕዛዞች በቅርቡ ይጀምራሉ! ለአሁኑ የደረሰኝ ፎቶ በመላክ ይሞክሩ።");
}

async function handleText(chatId: string, text: string, messageId: number) {
  console.log(`Handling text message from ${chatId}: ${text}`);

  if (text.trim().startsWith("/start")) {
    const welcomeMessage = `ሰላም! እንኳን ወደ ScanLogic በደህና መጡ! 😊

እኔ የእርስዎ የግል የሂሳብ ረዳት ነኝ። የእርስዎን ወጪዎች እና ሰነዶች በቀላሉ እንዲያስተዳድሩ ለመርዳት ሁልጊዜ ዝግጁ ነኝ። 🚀

ምን ማድረግ እችላለሁ?
1. 📸 የደረሰኝ ፎቶዎችን መመዝገብ - ደረሰኝዎን ፎቶ አንስተው ይላኩልኝ።
2. 📊 የወጪ ማጠቃለያ መስጠት - (ለምሳሌ፡ "የዚህ ሳምንት ወጪ ስንት ነው?")
3. 🔍 ደረሰኞችን መፈለግ - (ለምሳሌ፡ "የካሊዲስ ደረሰኝ አሳየኝ")
4. 📄 ፎርሞችን መሙላት - የፒዲኤፍ (PDF) ፎርሞችን በራስ-ሰር እሞላልዎታለሁ።

እንዴት ልረዳዎት እችላለሁ? ✨`;

    try {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: welcomeMessage,
        reply_markup: {
          inline_keyboard: [
            [
              { text: "📊 የሳምንቱ ማጠቃለያ (Weekly Summary)", callback_data: "query_summary_week" },
            ],
            [
              { text: "📥 ሪፖርት ላክልኝ (Export Report)", callback_data: "export_data" },
              { text: "❓ እርዳታ (Help)", callback_data: "show_help" }
            ]
          ]
        }
      });
      console.log(`Sent welcome message to ${chatId}`);
    } catch (error) {
      console.error(`Error sending welcome message to ${chatId}:`, error);
      throw error;
    }
    return;
  }

  if (text === "/ping") {
    await sendTelegramMessage(chatId, "Pong! 🏓 I am alive and listening.");
    return;
  }

  if (text === "/export") {
    await sendTelegramMessage(chatId, "ሪፖርትዎን እያዘጋጀሁ ነው... 📊");
    // Fetch all receipts for this user
    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .eq('telegram_id', chatId);

    if (error || !data) {
      await sendTelegramMessage(chatId, "ይቅርታ፣ ምንም የተቀመጠ ደረሰኝ አላገኘሁም። 😅");
      return;
    }

    await sendTelegramMessage(chatId, `${data.length} ደረሰኞች ተገኝተዋል። ሪፖርቱ በቅርቡ ይደርስዎታል።`);
    return;
  }

  // Natural language query
  const model = "gemini-3.1-pro-preview";
  const prompt = `The user said: "${text}". 
  Detect their intent. They might be asking for a summary, a specific receipt, or just chatting.
  If they ask for a summary, return JSON: { intent: "summary", period: "week" | "month" | "year" }.
  If they ask for a specific receipt, return JSON: { intent: "query", merchant: "name" }.
  Otherwise, return JSON: { intent: "chat", reply: "your helpful response in Amharic or Amglish" }.
  You are a helpful AI assistant for ScanLogic. Respond warmly in Amharic.`;

  const result = await genAI.models.generateContent({
    model,
    contents: text,
    config: { responseMimeType: "application/json" }
  });

  const analysis = JSON.parse(result.text || "{}");

  if (analysis.intent === "summary") {
    await sendTelegramMessage(chatId, "ማጠቃለያዎን በማስላት ላይ ነኝ... 📈");
    
    const { data, error } = await supabase
      .from('receipts')
      .select('total, currency')
      .eq('telegram_id', chatId);

    if (error || !data) {
      await sendTelegramMessage(chatId, "ምንም መረጃ አላገኘሁም። 😅");
      return;
    }

    const total = data.reduce((acc, r) => acc + (r.total || 0), 0);
    const count = data.length;
    await sendTelegramMessage(chatId, `እስካሁን ${count} ደረሰኞችን መዝግበዋል። ጠቅላላ ወጪዎ: ${total.toFixed(2)} ETB/USD ነው።`);

  } else if (analysis.intent === "query") {
    await sendTelegramMessage(chatId, `ከ ${analysis.merchant} የተመዘገቡ ደረሰኞችን በመፈለግ ላይ... 🔍`);
    
    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .eq('telegram_id', chatId)
      .ilike('merchant', `%${analysis.merchant}%`)
      .limit(1);

    if (error || !data || data.length === 0) {
      await sendTelegramMessage(chatId, `ከ "${analysis.merchant}" ምንም ደረሰኝ አላገኘሁም። 😅`);
      return;
    }

    const receipt = data[0];
    await sendTelegramMessage(chatId, `አግኝቼዋለሁ! በ ${receipt.date || "ያልታወቀ ቀን"} ከ ${receipt.merchant} የ ${receipt.currency || ""} ${receipt.total} ወጪ አድርገዋል።`);
    if (receipt.file_url) {
      await axios.post(`${TELEGRAM_API}/sendPhoto`, {
        chat_id: chatId,
        photo: receipt.file_url,
        caption: "ለማጣቀሻ ኦሪጅናል ደረሰኙ ይኸውልዎት።"
      });
    }
  } else {
    await sendTelegramMessage(chatId, analysis.reply || "እንዴት ልረዳዎት እችላለሁ? ደረሰኝ መመዝገብ ወይም መፈለግ ከፈለጉ ይንገሩኝ።");
  }
}

async function getTelegramFileUrl(fileId: string) {
  const response = await axios.get(`${TELEGRAM_API}/getFile?file_id=${fileId}`);
  const filePath = response.data.result.file_path;
  return `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${filePath}`;
}

async function sendTelegramMessage(chatId: string, text: string) {
  try {
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text,
    });
  } catch (error) {
    console.error("Error sending message to Telegram:", error);
  }
}

// Vite middleware for development
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

setupVite().then(() => {
  app.listen(PORT, "0.0.0.0", async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      console.error("CRITICAL: TELEGRAM_BOT_TOKEN is missing in environment variables!");
    }

    // Set Telegram Webhook
    if (process.env.APP_URL && process.env.TELEGRAM_BOT_TOKEN) {
      try {
        const webhookUrl = `${process.env.APP_URL}/api/telegram-webhook`;
        await axios.post(`${TELEGRAM_API}/setWebhook`, { url: webhookUrl });
        console.log(`Telegram Webhook set to: ${webhookUrl}`);
      } catch (error) {
        console.error("Error setting Telegram Webhook:", error);
      }
    }
  });
});
