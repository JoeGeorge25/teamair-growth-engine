# TeamAir AI Growth Engine - Advanced Guide

For power users and agency deployments.

## Architecture

```
Inbound Webhook (Telnyx/AgentMail)
    ↓
Middleware Server (routes to skill)
    ↓
Lead Manager (creates/updates lead record)
    ↓
Conversation Handler (detects intent, generates response)
    ↓
Response sent via Telnyx/AgentMail
    ↓
Follow-up Engine (schedules next touch)
```

## Custom Integration

### Webhook Endpoint

The system expects webhooks at:
```
POST /webhook/sms     (Telnyx SMS)
POST /webhook/email   (AgentMail)
```

Payload format:
```json
{
  "from": "+15551234567",
  "to": "+18606199787",
  "message": "Hi, do you have availability tomorrow?",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Programmatic Usage

```javascript
const { processIncomingMessage } = require('./lib/conversation-handler');
const { runFollowUpCheck } = require('./lib/followup-engine');
const leadManager = require('./lib/lead-manager');

// Process incoming message
const result = await processIncomingMessage(
  '+15551234567',
  'Do you have availability tomorrow?',
  'sms'
);

console.log(result.response); // AI-generated response
console.log(result.intent);   // Detected intent

// Run follow-up check (call this on a schedule)
const followUps = await runFollowUpCheck(async (phone, message) => {
  // Your send function here
  await sendSMS(phone, message);
});
```

### Custom Intent Detection

Edit `lib/conversation-handler.js` to add custom intents:

```javascript
function detectIntent(message) {
  const lowerMsg = message.toLowerCase();
  
  // Your custom intent
  if (lowerMsg.match(/\b(your keyword|pattern)\b/)) {
    return 'custom_intent';
  }
  
  // ... existing intents
}
```

### Custom Response Logic

```javascript
async function generateResponse(phone, message, intent) {
  // Custom logic for specific intents
  if (intent === 'custom_intent') {
    return 'Your custom response here';
  }
  
  // ... default logic
}
```

## Automation Scheduling

### Cron Setup for Follow-ups

Add to crontab:
```bash
# Run follow-up check every 15 minutes
*/15 * * * * cd /path/to/teamair-growth-engine && node scripts/run-followups.js
```

### Systemd Service

Create `/etc/systemd/system/teamair-engine.service`:
```ini
[Unit]
Description=TeamAir AI Growth Engine
After=network.target

[Service]
Type=simple
User=openclaw
WorkingDirectory=/home/openclaw/.openclaw/workspace/skills/teamair-growth-engine
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable:
```bash
sudo systemctl enable teamair-engine
sudo systemctl start teamair-engine
```

## Multi-Client Deployment

### Directory Structure

```
skills/
  teamair-growth-engine/
    clients/
      client-a/
        config/
        data/
      client-b/
        config/
        data/
```

### Environment-Based Config

```javascript
const CLIENT = process.env.TEAMAIR_CLIENT || 'default';
const CONFIG_DIR = path.join(__dirname, 'clients', CLIENT, 'config');
```

## API Integration

### Adding Calendar Integration

```javascript
// lib/calendar-integration.js
const { google } = require('googleapis');

async function bookAppointment(lead, date, time) {
  // Google Calendar API integration
  const calendar = google.calendar({ version: 'v3', auth });
  
  const event = {
    summary: `Appointment with ${lead.name || lead.phone}`,
    start: { dateTime: `${date}T${time}:00` },
    end: { dateTime: `${date}T${time}:00` },
  };
  
  return await calendar.events.insert({
    calendarId: 'primary',
    resource: event,
  });
}
```

### Adding CRM Integration

```javascript
// lib/crm-integration.js
async function syncToCRM(lead) {
  // HubSpot, Salesforce, etc.
  await hubspot.contacts.create({
    properties: {
      phone: lead.phone,
      email: lead.email,
      source: 'TeamAir AI'
    }
  });
}
```

## Monitoring & Alerts

### Health Check Endpoint

```javascript
// server.js
app.get('/health', async (req, res) => {
  const stats = await leadManager.getDashboardStats();
  res.json({
    status: 'ok',
    leads: stats.totalLeads,
    uptime: process.uptime()
  });
});
```

### Slack Notifications

```javascript
async function notifySlack(message) {
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: message })
  });
}

// Use in lead capture
await notifySlack(`🎯 New lead: ${lead.phone}`);
```

## Performance Optimization

### Redis for Conversation Memory

```javascript
const redis = require('redis');
const client = redis.createClient();

async function getConversation(phone) {
  const data = await client.get(`conv:${phone}`);
  return data ? JSON.parse(data) : null;
}

async function saveConversation(phone, conversation) {
  await client.setEx(`conv:${phone}`, 86400, JSON.stringify(conversation));
}
```

### Batch Follow-ups

```javascript
// Process follow-ups in batches
const BATCH_SIZE = 10;

async function processBatch(leads) {
  const batches = chunk(leads, BATCH_SIZE);
  
  for (const batch of batches) {
    await Promise.all(batch.map(lead => processFollowUp(lead)));
    await sleep(1000); // Rate limiting
  }
}
```

## Security Considerations

### Webhook Verification

```javascript
// Verify Telnyx signatures
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}
```

### Rate Limiting

```javascript
const rateLimit = new Map();

function checkRateLimit(phone) {
  const now = Date.now();
  const window = 60 * 1000; // 1 minute
  const maxRequests = 10;
  
  const requests = rateLimit.get(phone) || [];
  const recent = requests.filter(t => now - t < window);
  
  if (recent.length >= maxRequests) {
    throw new Error('Rate limit exceeded');
  }
  
  recent.push(now);
  rateLimit.set(phone, recent);
}
```

## Troubleshooting

### Debug Mode

```bash
DEBUG=teamair:* npm start
```

### Common Issues

**Webhooks not receiving:**
- Check firewall rules
- Verify webhook URL is publicly accessible
- Check Telnyx messaging profile settings

**AI not responding:**
- Verify OpenAI API key
- Check response template syntax
- Review conversation-handler logs

**Follow-ups not sending:**
- Check cron job is running
- Verify Redis is accessible
- Review followup-engine logs

---

*For API setup guides, see `api-access-guides.md`*