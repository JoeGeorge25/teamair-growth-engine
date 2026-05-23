# 🏠 Roofing Growth Engine

**AI-powered roofing inspection booking and storm damage response system.**

Recovers roofing jobs that normally go to voicemail — automatically.

---

## What It Does

- ⛈️ **Qualifies storm damage** instantly via AI conversation
- 📱 **Captures leads** from SMS, Email, and web forms 24/7
- 🤖 **Responds instantly** with roofing-trained AI
- 📅 **Books inspections** automatically on your calendar
- 🔄 **Follows up** until homeowners schedule
- 💰 **Prevents lost revenue** from missed storm damage calls

## Designed Specifically For

- ✅ Storm damage restoration companies
- ✅ Residential roofing contractors
- ✅ Insurance restoration specialists
- ✅ Emergency leak repair services
- ✅ Roof replacement companies

## Quick Start

### Option 1: OpenClaw Users (Easiest)
Simply type in your OpenClaw chat:
```
/growth-engine
```

### Option 2: Manual Install
```bash
# 1. Clone and install
git clone https://github.com/JoeGeorge25/roofing-growth-engine.git
cd roofing-growth-engine
./install.sh

# 2. Configure your roofing business
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
- Calendar integration (Google/Outlook)

## Included Components

| Component | Purpose |
|-----------|---------|
| Storm Damage Qualifier | AI detects hail, wind, and leak inquiries |
| Insurance Assistant | Handles claim questions and adjuster coordination |
| Emergency Response | Prioritizes active leak and water intrusion calls |
| Photo Collection | Requests damage photos via SMS automatically |
| Inspection Booking | Books directly to your calendar |
| Follow-up Sequences | Converts "maybe later" into booked inspections |
| Lead Dashboard | Track inspections, storm claims, emergency leaks |

## Directory Structure

```
roofing-growth-engine/
├── config/
│   ├── business-profile.json    # Your roofing company info
│   ├── services.json            # Roofing services offered
│   ├── responses.json           # AI response templates
│   ├── followup-sequences.json  # Follow-up timing & messages
│   └── calendar-rules.json      # Booking rules & availability
├── lib/
│   ├── conversation.js          # Core conversation handler
│   ├── intents.js               # Roofing intent detection
│   └── lead-scoring.js          # Lead qualification logic
├── scripts/
│   ├── dashboard.sh             # View lead dashboard
│   ├── send-sms.sh              # Send manual SMS
│   ├── lead-history.sh          # View lead conversations
│   ├── setup.sh                 # Initial configuration
│   └── status.sh                # Check system status
├── workflows/
│   ├── storm-damage-flow.json   # Storm damage qualification
│   ├── insurance-flow.json      # Insurance claim assistance
│   └── emergency-flow.json      # Emergency leak response
└── SKILL.md                     # Skill documentation
```

## Roofing-Specific Features

### Storm Damage Detection
Automatically identifies hail, wind, and storm-related inquiries:
- "Hail damage from last night's storm"
- "Wind blew off some shingles"
- "Roof leaking after the storm"

### Insurance Claim Support
Pre-trained responses for common insurance questions:
- "Do you work with insurance?"
- "Will my rates go up?"
- "What's my deductible?"
- "Can you meet my adjuster?"

### Emergency Prioritization
Detects urgent situations and escalates immediately:
- Active water intrusion
- Ceiling leaks
- Storm damage with exposed areas

### Photo Collection
AI automatically requests damage photos via SMS to help you assess before arriving.

## Pricing

| Package | Price | Includes |
|---------|-------|----------|
| **DIY Install** | Free | Complete system, self-setup |
| **Done-For-You Setup** | $997 | Full installation, customization, training |
| **Monthly Management** | $297/mo | Ongoing monitoring, optimization, support |

## Dashboard Metrics

Track what matters for roofing:
- 🏠 Inspections booked this week
- ⛈️ Storm damage leads captured
- 🚨 Emergency leak responses
- 📋 Insurance claims assisted
- 💰 Revenue recovered from voicemail

## Support

- 📧 Email: teamair@teamairai.com
- 💬 OpenClaw: Type `/growth-engine help`
- 📖 Documentation: See `SKILL.md`

## License

Commercial license included with purchase. Resale rights available for agency partners.

---

**Built with OpenClaw. Part of the TeamAir AI family.**

© 2026 TeamAir AI. All rights reserved.