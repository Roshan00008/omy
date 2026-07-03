# Desi Video Scraper Bot

A Telegram bot that scrapes multiple video sources and provides direct streaming links. Optimized for performance and resilience.

## Features

- **Multiple Sources**: Scrapes KamaClips, ViralMMS, DesiSexVdo, DesiBabe, DesiHub, DesiBF, DesiLeak49, and MastiRaja.
- **Combined Search**: Consolidated Trending/Popular feeds and unified search across multiple sites.
- **Auto-Delete**: Optional 15 or 30-minute auto-deletion of media to keep chats clean.
- **Resilient**: Implements retries and timeouts to handle slow or unstable sources.
- **Vercel Ready**: Deploy as a serverless function with webhook support.

## Environment Variables

- `BOT_TOKEN`: Your Telegram Bot Token from [@BotFather](https://t.me/BotFather).

## Deployment on Vercel

1. Fork this repository.
2. Connect your fork to Vercel.
3. Add the `BOT_TOKEN` environment variable in Vercel project settings.
4. Deploy the project.

## Webhook Setup

Once deployed, you need to tell Telegram where to send updates. Replace `<YOUR_BOT_TOKEN>` and `<YOUR_VERCEL_DOMAIN>` in the following URL and open it in your browser:

```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://<YOUR_VERCEL_DOMAIN>/api/webhook
```

**Example:**
If your token is `123:abc` and your Vercel domain is `omy-seven.vercel.app`, the URL would be:
`https://api.telegram.org/bot123:abc/setWebhook?url=https://omy-seven.vercel.app/api/webhook`

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file and add your `BOT_TOKEN`.
3. Start the bot in polling mode:
   ```bash
   npm start
   ```

## Testing

Run the scraper tests to verify site connectivity:
```bash
npm test
```

## Troubleshooting

- **Bot Not Responding**:
  - Ensure `BOT_TOKEN` is correctly set in Vercel environment variables.
  - Check if the webhook is set correctly (see [Webhook Setup](#webhook-setup)).
  - View Vercel runtime logs to see if updates are being received at `/api/webhook`.
- **No Results**: Check the scraper tests. Sites might have changed their layout.
- **Timeout Errors**: Some sites are slow. The bot has a 15s timeout with retries.
