# 🚀 TeamAir AI Growth Engine

**AI-powered lead capture and follow-up system for local businesses.**

Turn missed calls and inquiries into booked appointments — automatically.

---

## What It Does

- 📱 **Captures leads** from SMS, Email, and web forms
- 🤖 **Responds instantly** with AI-powered conversations  
- 📅 **Books appointments** automatically via calendar integration
- 🔄 **Follows up** until the lead converts or opts out
- 💰 **Prevents missed revenue** from unanswered inquiries

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/JoeGeorge25/teamair-growth-engine.git
cd teamair-growth-engine
./install.sh

# 2. Configure your business
./setup.sh

# 3. View your dashboard
./scripts/dashboard.sh
```

## System Requirements

- OpenClaw installed and running
- Node.js 18+
- Redis (for conversation memory)
- Telnyx account (for SMS)
- OpenAI API key (for AI responses)

## Included Components

| Component | Purpose |
|-----------|---------|
| Conversation System | AI-powered SMS/Email responses |
| Lead Manager | Track and manage all leads |
| Follow-up Engine | Automated nurture sequences |
| Appointment Booking | Calendar integration |
| Dashboard | Real-time stats and monitoring |

## Directory Structure

```
teamair-growth-engine/
├── SKILL.md                    # Main documentation
├── install.sh                  # Installation script
├── setup.sh                    # Configuration wizard
├── package.json
├── config/
│   ├── business-profile.json   # Your business details
│   ├── services.json           # Services you offer
│   ├── responses.json          # AI response templates
│   ├── followup-sequences.json # Follow-up timing
│   └── calendar-rules.json     # Booking rules
├── lib/
│   ├── lead-manager.js         # Lead tracking
│   ├── conversation-handler.js # Message processing
│   └── followup-engine.js      # Automation
├── scripts/
│   ├── dashboard.sh            # View stats
│   ├── send-sms.sh             # Manual SMS
│   ├── lead-history.sh         # View conversations
│   └── status.sh               # System check
├── references/
│   ├── beginner-mode.md        # Plain English guide
│   ├── advanced-mode.md        # Power user guide
│   └── api-access-guides.md    # API setup steps
└── data/                       # Lead data (auto-created)
```

## Usage

### View Dashboard
```bash
./scripts/dashboard.sh
```

### Send Manual SMS
```bash
./scripts/send-sms.sh +15551234567 "Your message here"
```

### View Lead History
```bash
./scripts/lead-history.sh +15551234567
```

### Check System Status
```bash
./scripts/status.sh
```

## How It Works

```
Inbound Message (SMS/Email)
    ↓
Lead Capture → Create/Update Contact
    ↓
AI Response (Conversation System)
    ↓
Intent Detection (Qualify Lead)
    ↓
├─→ Book Appointment → Calendar Check → Confirmation
├─→ Answer Question → Knowledge Base → Response
└─→ General Inquiry → Follow-up Sequence
    ↓
Follow-up Sequence (if not converted)
```

## Configuration

### Business Profile
Edit `config/business-profile.json`:
```json
{
  "name": "Your Business Name",
  "phone": "+1-555-123-4567",
  "hours": {
    "monday": "9:00-17:00",
    "tuesday": "9:00-17:00"
  }
}
```

### Response Templates
Edit `config/responses.json`:
```json
{
  "greeting": "Hi! This is {{business.name}}. How can we help?",
  "after_hours": "We're closed but will respond tomorrow!"
}
```

### Follow-up Sequences
Edit `config/followup-sequences.json`:
```json
{
  "new_lead": [
    { "delay": "5 minutes", "message": "auto_greeting" },
    { "delay": "1 day", "message": "follow_up" },
    { "delay": "3 days", "message": "follow_up" }
  ]
}
```

## API Integration

### Webhook Endpoints

**SMS Webhook (Telnyx):**
```
POST /webhook/sms
Content-Type: application/json

{
  "from": "+15551234567",
  "to": "+18606199787",
  "message": "Hi, do you have availability?"
}
```

**Email Webhook (AgentMail):**
```
POST /webhook/email
Content-Type: application/json

{
  "from": "customer@example.com",
  "subject": "Question about services",
  "body": "Hi, I'd like to book an appointment..."
}
```

### Programmatic Usage

```javascript
const { processIncomingMessage } = require('./lib/conversation-handler');

const result = await processIncomingMessage(
  '+15551234567',
  'Do you have availability tomorrow?',
  'sms'
);

console.log(result.response); // AI-generated response
console.log(result.intent);   // Detected: appointment_request
```

## Documentation

- **Beginner's Guide:** `references/beginner-mode.md`
- **Advanced Guide:** `references/advanced-mode.md`
- **API Setup:** `references/api-access-guides.md`

## Pricing

| Component | Cost |
|-----------|------|
| TeamAir AI Growth Engine | $997 setup + $297/month |
| Telnyx SMS | ~$0.01 per message |
| OpenAI API | ~$0.002 per 1K tokens |
| Redis | Free (local) or $5+/month |

## Support

- 📧 Email: support@teamair.ai
- 📱 SMS: +1-860-619-9787
- 📖 Docs: See `references/` directory

## License

Commercial license included with purchase. Resale rights available for agency partners.

---

**Built with OpenClaw** 🤖