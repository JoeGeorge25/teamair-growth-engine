# API Access Guides

Step-by-step instructions for getting API keys.

## Telnyx (SMS)

### 1. Create Account
1. Go to https://telnyx.com
2. Click "Sign Up" and create an account
3. Verify your email

### 2. Add Funds
1. Go to "Billing" in the left sidebar
2. Click "Add Credit"
3. Add at least $10 to get started

### 3. Buy a Phone Number
1. Go to "Numbers" → "Search & Buy"
2. Choose your country (US)
3. Select a local number
4. Click "Buy" ($1/month per number)

### 4. Create Messaging Profile
1. Go to "Messaging" → "Messaging Profiles"
2. Click "Create New Profile"
3. Name it (e.g., "TeamAir AI")
4. Set "Webhook URL" (your server URL + `/webhook/sms`)
5. Save the Profile ID

### 5. Get API Key
1. Go to "Auth" → "API Keys"
2. Click "Create API Key"
3. Name it "TeamAir Production"
4. Copy the key (starts with `KEY...`)

### 6. Configure
Run in OpenClaw:
```
/setup telnyx
```

Or manually create `~/.openclaw/workspace/skills/telnyx-sms/.telnyx_config`:
```
TELNYX_API_KEY=KEYxxxxxxxxxxxxx
PHONE_NUMBER=+18606199787
MESSAGING_PROFILE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

---

## OpenAI (AI Responses)

### 1. Create Account
1. Go to https://platform.openai.com
2. Sign up with email or Google
3. Verify your phone number

### 2. Add Payment Method
1. Go to "Settings" → "Billing"
2. Click "Add payment method"
3. Add credit card
4. Set usage limits if desired

### 3. Create API Key
1. Go to "API Keys" → "Create new secret key"
2. Name it "TeamAir AI"
3. Copy the key (starts with `sk-`)
4. **Important:** Save it now - you can't see it again!

### 4. Configure
Add to your `.env` file:
```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
```

---

## AgentMail (Email)

### 1. Create Account
1. Go to https://agentmail.to
2. Sign up with your email
3. Verify your account

### 2. Create Agent Email
1. Go to "Create Agent"
2. Choose a name (e.g., "damon@agentmail.to")
3. Set webhook URL (your server URL + `/webhook/email`)

### 3. Get API Key
1. Go to "Settings" → "API Keys"
2. Generate new key
3. Copy the key

### 4. Configure
Add to your `.env` file:
```
AGENTMAIL_API_KEY=am_xxxxxxxxxx
```

---

## Redis (Data Storage)

### Option 1: Local Redis (Recommended for testing)

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install redis-server
sudo systemctl enable redis
sudo systemctl start redis
```

**macOS:**
```bash
brew install redis
brew services start redis
```

**Verify:**
```bash
redis-cli ping
# Should return: PONG
```

### Option 2: Redis Cloud (Production)

1. Go to https://redis.com/try-free/
2. Create free account
3. Create new subscription
4. Get connection string

Add to `.env`:
```
REDIS_URL=redis://username:password@host:port
```

---

## Google Calendar (Appointment Booking)

### 1. Create Google Cloud Project
1. Go to https://console.cloud.google.com
2. Click "Select a project" → "New Project"
3. Name it "TeamAir Calendar"
4. Click "Create"

### 2. Enable Calendar API
1. Go to "APIs & Services" → "Library"
2. Search "Google Calendar API"
3. Click "Enable"

### 3. Create Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Select "Desktop app"
4. Name it "TeamAir Desktop"
5. Download the JSON file

### 4. Configure
Add to `.env`:
```
GOOGLE_CLIENT_ID=xxxxxxxxxx
GOOGLE_CLIENT_SECRET=xxxxxxxxxx
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth/callback
```

---

## Vercel (Hosting)

### 1. Create Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Authorize Vercel

### 2. Install CLI
```bash
npm i -g vercel
```

### 3. Login
```bash
vercel login
```

### 4. Deploy
```bash
cd teamair-growth-engine
vercel
```

### 5. Environment Variables
1. Go to project dashboard
2. Click "Settings" → "Environment Variables"
3. Add all your API keys

---

## ngrok (Local Tunnel for Testing)

### 1. Install
```bash
# macOS
brew install ngrok

# Linux
snap install ngrok
```

### 2. Sign Up
1. Go to https://ngrok.com
2. Create free account
3. Copy your authtoken

### 3. Configure
```bash
ngrok config add-authtoken YOUR_TOKEN
```

### 4. Start Tunnel
```bash
ngrok http 3000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

Use this URL for webhooks:
- Telnyx: `https://abc123.ngrok.io/webhook/sms`
- AgentMail: `https://abc123.ngrok.io/webhook/email`

---

## Cost Summary

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Telnyx | $0 (pay per message) | ~$0.01/SMS |
| OpenAI | $5 credit | ~$0.002/1K tokens |
| AgentMail | Free tier available | Pro plans |
| Redis | Local free / Cloud 250MB | $5+/month |
| Vercel | Hobby tier free | Pro $20/month |
| ngrok | Free (1 tunnel) | Pro $8/month |

---

## Security Best Practices

1. **Never commit API keys to Git**
   - Use `.env` files
   - Add `.env` to `.gitignore`

2. **Rotate keys regularly**
   - Set calendar reminders
   - Update in all locations

3. **Use environment-specific keys**
   - Development keys
   - Production keys
   - Keep them separate

4. **Monitor usage**
   - Set up billing alerts
   - Check dashboards weekly

---

*Need help? Check the troubleshooting section in advanced-mode.md*