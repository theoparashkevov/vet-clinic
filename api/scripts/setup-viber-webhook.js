#!/usr/bin/env node
const https = require('https');

const AUTH_TOKEN = process.env.VIBER_AUTH_TOKEN || '';
const WEBHOOK_URL = process.env.VIBER_WEBHOOK_URL || '';

if (!AUTH_TOKEN) {
  console.error('Error: VIBER_AUTH_TOKEN environment variable is required');
  process.exit(1);
}

if (!WEBHOOK_URL) {
  console.error('Error: VIBER_WEBHOOK_URL environment variable is required');
  process.exit(1);
}

const payload = JSON.stringify({
  url: WEBHOOK_URL,
  event_types: ['delivered', 'seen', 'failed', 'subscribed', 'unsubscribed', 'conversation_started'],
  send_name: true,
  send_photo: true,
});

const options = {
  hostname: 'chatapi.viber.com',
  port: 443,
  path: '/pa/set_webhook',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
    'X-Viber-Auth-Token': AUTH_TOKEN,
  },
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      if (response.status === 0) {
        console.log('✅ Viber webhook set successfully');
        console.log('URL:', WEBHOOK_URL);
        console.log('Event types:', response.event_types?.join(', '));
      } else {
        console.error('❌ Failed to set Viber webhook:', response.status_message);
        process.exit(1);
      }
    } catch (err) {
      console.error('❌ Failed to parse Viber response:', err.message);
      process.exit(1);
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Request failed:', err.message);
  process.exit(1);
});

req.write(payload);
req.end();
