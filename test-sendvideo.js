// test-sendvideo.js
// Tests the downloadVideo pipeline using a tiny known-good MP4, then sends it to your Telegram chat.
import { createReadStream, unlinkSync } from 'fs';
import { Telegraf } from 'telegraf';
import { ensureClearance, getRequestHeaders } from './scraper.js';
import axios from 'axios';
import os from 'os';
import path from 'path';

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = 5688847060;
// Small, reliable publicly-hosted MP4 (file.io redirect – ~1 MB Big Buck Bunny clip)
const TEST_VIDEO_URL = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
const TEST_BASE_URL  = 'https://commondatastorage.googleapis.com';
const MAX_BYTES = 45 * 1024 * 1024;

// ── inline downloadVideo so we don't need to export it from core.js ──────────
async function downloadVideo(videoUrl, siteBaseUrl) {
  const baseUrl = siteBaseUrl || new URL(videoUrl).origin;
  await ensureClearance(baseUrl);
  const headers = getRequestHeaders(baseUrl);

  const response = await axios({
    method: 'get',
    url: videoUrl,
    responseType: 'stream',
    headers,
    timeout: 60000,
    maxRedirects: 5,
    validateStatus: null,
  });

  if (response.status !== 200) {
    throw new Error(`Download failed – HTTP ${response.status}`);
  }

  const contentLength = Number(response.headers['content-length'] || 0);
  if (contentLength && contentLength > MAX_BYTES) {
    throw new Error(`Too large: ${(contentLength / (1024 * 1024)).toFixed(1)} MB`);
  }

  const tmpPath = path.join(os.tmpdir(), `tgvid_test_${Date.now()}.mp4`);
  const { createWriteStream } = await import('fs');
  const writer = createWriteStream(tmpPath);
  let downloaded = 0;

  await new Promise((resolve, reject) => {
    response.data.on('data', chunk => {
      downloaded += chunk.length;
      if (downloaded > MAX_BYTES) {
        writer.destroy();
        reject(new Error('Exceeded 45 MB during streaming'));
      }
    });
    response.data.pipe(writer);
    writer.on('finish', resolve);
    writer.on('error', reject);
  });

  return tmpPath;
}

// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  if (!BOT_TOKEN) {
    console.error('❌ BOT_TOKEN env var is not set. Run: BOT_TOKEN=<token> node test-sendvideo.js');
    process.exit(1);
  }

  const bot = new Telegraf(BOT_TOKEN);

  console.log(`⬇️  Downloading test video from:\n   ${TEST_VIDEO_URL}`);

  let tmpPath;
  try {
    tmpPath = await downloadVideo(TEST_VIDEO_URL, TEST_BASE_URL);
    console.log(`✅ Downloaded to: ${tmpPath}`);

    console.log(`📤 Sending to chat ${CHAT_ID}...`);
    await bot.telegram.sendVideo(
      CHAT_ID,
      { source: createReadStream(tmpPath) },
      { caption: '✅ Test video from downloadVideo() helper – working correctly!' }
    );
    console.log('✅ Video sent successfully!');
  } catch (err) {
    console.error('❌ Test failed:', err.message);
  } finally {
    if (tmpPath) {
      try { unlinkSync(tmpPath); console.log('🗑️  Temp file cleaned up.'); } catch (_) {}
    }
    bot.stop();
    process.exit(0);
  }
}

main();
