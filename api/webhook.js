import { bot } from '../core.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).send('Bot webhook is active! Send a POST request with a Telegram update.');
  }

  if (!req.body || !req.body.update_id) {
    return res.status(400).send('Invalid Telegram update');
  }

  try {
    console.log(`Received update ${req.body.update_id} from chat ${req.body.message?.chat?.id || 'unknown'}`);
    // Process the incoming update from Telegram
    await bot.handleUpdate(req.body, res);
    // Ensure we don't hang if handleUpdate doesn't finish res
    if (!res.writableEnded) {
      res.status(200).end();
    }
  } catch (err) {
    console.error('Error handling webhook update:', err);
    // We still return 200 to Telegram to avoid retries if the error is internal
    if (!res.writableEnded) {
      res.status(200).send(`Error: ${err.message}`);
    }
  }
}
