// test-sendvideo.js
// Tests the Telegram sendVideo pipeline by creating a tiny local MP4 and sending it directly.
// This bypasses any remote download issues (CDN 403s) and purely validates the bot send logic.
import { createWriteStream, createReadStream, unlinkSync, writeFileSync } from 'fs';
import { Telegraf } from 'telegraf';
import os from 'os';
import path from 'path';

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = 5688847060;

// Minimal valid MP4 bytes (32-byte ftyp atom – tiny but valid container header)
// This is enough to test the upload pipeline without needing a real video file.
const FTYP_MP4 = Buffer.from([
  0x00, 0x00, 0x00, 0x20, // box size = 32
  0x66, 0x74, 0x79, 0x70, // 'ftyp'
  0x69, 0x73, 0x6F, 0x6D, // major_brand = 'isom'
  0x00, 0x00, 0x02, 0x00, // minor_version
  0x69, 0x73, 0x6F, 0x6D, // compatible_brands[0] = 'isom'
  0x69, 0x73, 0x6F, 0x32, // compatible_brands[1] = 'iso2'
  0x61, 0x76, 0x63, 0x31, // compatible_brands[2] = 'avc1'
  0x6D, 0x70, 0x34, 0x31  // compatible_brands[3] = 'mp41'
]);

async function main() {
  if (!BOT_TOKEN) {
    console.error('❌ BOT_TOKEN env var is not set.');
    process.exit(1);
  }

  const bot = new Telegraf(BOT_TOKEN);
  const tmpPath = path.join(os.tmpdir(), `tgvid_test_${Date.now()}.mp4`);

  try {
    // Write the tiny MP4 stub locally
    writeFileSync(tmpPath, FTYP_MP4);
    console.log(`✅ Created test MP4 stub at: ${tmpPath} (${FTYP_MP4.length} bytes)`);

    console.log(`📤 Sending to chat ${CHAT_ID}...`);
    await bot.telegram.sendVideo(
      CHAT_ID,
      { source: createReadStream(tmpPath) },
      { caption: '✅ sendVideo pipeline test – local file upload working!' }
    );
    console.log('✅ Video sent successfully! Check your Telegram chat.');
  } catch (err) {
    console.error('❌ Test failed:', err.message);
  } finally {
    try { unlinkSync(tmpPath); console.log('🗑️  Temp file cleaned up.'); } catch (_) {}
    // Don't call bot.stop() since we never launched polling
    process.exit(0);
  }
}

main();
