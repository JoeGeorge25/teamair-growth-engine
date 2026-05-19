---
name: teamair-growth-engine
description: "Complete AI lead capture and follow-up system for local businesses. Captures leads via SMS/Email, auto-responds, books appointments, and prevents missed revenue."
version: 1.0.0
metadata:
  openclaw:
    emoji: 🚀
    category: business
    pricing:
      setup: 997
      monthly: 297
    triggers:
      - /growth-engine
      - /engine
      - /leads
---

# TeamAir AI Growth Engine

A complete AI-powered lead capture and follow-up system for local businesses. Turns missed calls and inquiries into booked appointments — automatically.

## What It Does

- **Captures leads** from SMS, Email, and web forms
- **Responds instantly** with AI-powered conversations
- **Books appointments** automatically via calendar integration
- **Follows up** until the lead converts or opts out
- **Prevents missed revenue** from unanswered inquiries

## Included Components

| Component | Purpose |
|-----------|---------|
| Conversation System | AI-powered SMS/Email responses |
| Telnyx SMS | Two-way text messaging |
| Taskflow | Multi-step automation workflows |
| Lead Scoring | Qualify leads automatically |
| Appointment Booking | Calendar integration |
| Follow-up Sequences | Automated nurture campaigns |

## Quick Start

### Option 1: Use in OpenClaw (Easiest)

Simply type:
```
/growth-engine
```

Or:
```
/engine dashboard
```

### Option 2: Manual Install

```bash
cd ~/.openclaw/workspace/skills
git clone https://github.com/JoeGeorge25/teamair-growth-engine.git
cd teamair-growth-engine
./install.sh
```

### 2. Configure Your Business

```bash
./setup.sh
```

The wizard will guide you through:
- Business profile (name, services, hours)
- Phone number setup (Telnyx)
- Calendar integration
- Auto-response preferences
- Follow-up sequences

### 3. Go Live

Once configured, the system automatically:
- Answers incoming SMS messages
- Responds to emails
- Qualifies leads
- Books appointments
- Sends follow-ups

## System Requirements

- OpenClaw installed and running
- Telnyx account (for SMS)
- AgentMail account (for Email)
- Redis (for conversation memory)
- Calendar access (Google/Outlook)

## Configuration Files

| File | Purpose |
|------|---------|
| `config/business-profile.json` | Your business details |
| `config/services.json` | Services you offer |
| `config/responses.json` | AI response templates |
| `config/followup-sequences.json` | Follow-up timing & messages |
| `config/calendar-rules.json` | Booking rules & availability |

## Usage

### View Dashboard

```bash
./scripts/dashboard.sh
```

Shows:
- Leads captured today
- Appointments booked
- Conversations in progress
- Follow-up status

### Send Manual SMS

```bash
./scripts/send-sms.sh +15551234567 "Your custom message"
```

### View Lead History

```bash
./scripts/lead-history.sh +15551234567
```

### Pause/Resume Automation

```bash
./scripts/pause.sh     # Pause all auto-responses
./scripts/resume.sh    # Resume automation
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
Taskflow Automation
    ↓
Follow-up Sequence (if not converted)
```

## Customization

### Edit Response Templates

Modify `config/responses.json` to change how the AI responds:

```json
{
  "greeting": "Hi! This is {{business.name}}. How can we help you today?",
  "appointment_request": "I'd be happy to book that for you. What day works best?",
  "after_hours": "We received your message and will respond first thing tomorrow!"
}
```

### Adjust Follow-up Timing

Edit `config/followup-sequences.json`:

```json
{
  "new_lead": [
    { "delay": "5 minutes", "message": "Thanks for reaching out!" },
    { "delay": "1 day", "message": "Just following up..." },
    { "delay": "3 days", "message": "Still interested?" }
  ]
}
```

### Set Business Hours

Edit `config/business-profile.json`:

```json
{
  "hours": {
    "monday": "9:00-17:00",
    "tuesday": "9:00-17:00",
    "saturday": "10:00-14:00"
  }
}
```

## Troubleshooting

### Check System Status

```bash
./scripts/status.sh
```

### View Logs

```bash
./scripts/logs.sh
```

### Test SMS Connection

```bash
./scripts/test-sms.sh
```

### Reset Conversation

```bash
./scripts/reset-conversation.sh +15551234567
```

## Support

- Documentation: `references/`
- API Guides: `references/api-access-guides.md`
- Advanced Setup: `references/advanced-mode.md`

## License

Commercial license included with purchase. Resale rights available for agency partners.