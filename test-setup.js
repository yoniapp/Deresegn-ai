import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

console.log('🔍 Checking ScanLogic Setup...\n');

// Check environment variables
const checks = {
  'Telegram Bot Token': process.env.TELEGRAM_BOT_TOKEN,
  'Gemini API Key': process.env.GEMINI_API_KEY,
  'Supabase URL': process.env.VITE_SUPABASE_URL,
  'Supabase Key': process.env.VITE_SUPABASE_ANON_KEY,
  'App URL': process.env.APP_URL
};

let allGood = true;

for (const [name, value] of Object.entries(checks)) {
  if (!value || value === '') {
    console.log(`❌ ${name}: Missing`);
    allGood = false;
  } else {
    const masked = value.substring(0, 10) + '...';
    console.log(`✅ ${name}: ${masked}`);
  }
}

console.log('\n');

// Test Supabase connection
if (checks['Supabase URL'] && checks['Supabase Key']) {
  console.log('🔗 Testing Supabase connection...');
  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );
    
    const { data, error } = await supabase
      .from('receipts')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log(`❌ Supabase Error: ${error.message}`);
      console.log('   Make sure you created the receipts table (see SETUP.md)');
      allGood = false;
    } else {
      console.log('✅ Supabase connection successful!');
    }
  } catch (err) {
    console.log(`❌ Supabase connection failed: ${err.message}`);
    allGood = false;
  }
}

console.log('\n');

if (allGood) {
  console.log('🎉 All checks passed! You can now run: npm run dev');
} else {
  console.log('⚠️  Please fix the issues above before running the bot.');
  console.log('📖 See SETUP.md for detailed instructions.');
}
