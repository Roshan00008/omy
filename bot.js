import { bot } from './core.js';
import http from 'http';

// Create dummy HTTP server for Koyeb/Render port-binding checks
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is running!\n');
}).listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Start the bot using polling (ONLY for local dev or traditional servers)
// In Vercel, this file is not used; api/webhook.js handles updates via webhooks.
if (process.env.NODE_ENV !== 'production' || process.env.POLLING === 'true') {
  bot.launch()
    .then(() => {
      console.log('🤖 Telegram Scraper Bot is up and running in polling mode!');
    })
    .catch((err) => {
      console.error('Failed to launch Telegram Bot:', err);
    });
} else {
  console.log('🚀 Bot is in webhook mode. Polling disabled.');
}

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
