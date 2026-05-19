# TeamAir AI Growth Engine - Beginner's Guide

Welcome! This guide explains everything in plain English.

## What Is This?

The **TeamAir AI Growth Engine** is like having a 24/7 receptionist that:
- Answers text messages from potential customers
- Responds to emails automatically
- Books appointments on your calendar
- Follows up with people who don't respond

It works even when you're busy, asleep, or on vacation.

## Key Terms Explained

### Lead
A person who contacts your business. They "lead" to a potential sale.

### SMS
Text messages. The system can send and receive texts just like your phone.

### Webhook
A way for other services (like Telnyx) to send information to your system automatically.

### Follow-up
When someone doesn't respond, the system sends another message later to check in.

### Business Hours
The times you're open. The system knows when to say "we're closed" vs giving an immediate response.

## How It Works (Simple Version)

1. **Customer sends a text** to your business number
2. **System captures their info** (phone number, message, time)
3. **AI reads the message** and figures out what they want
4. **System sends a reply** based on what they asked
5. **If needed, books an appointment** or schedules a follow-up

## Setup Steps (In Plain English)

### Step 1: Install
Run the install script. This sets up all the files and folders the system needs.

### Step 2: Configure Your Business
Run the setup wizard. It asks questions like:
- What's your business name?
- What services do you offer?
- When are you open?

### Step 3: Connect Your Phone Number
You'll need a Telnyx account (like a phone company for apps). This gives you a phone number that can send/receive texts through the computer.

### Step 4: Test It
Send a text to your number. The AI should respond!

## Common Questions

**Q: Do I need to be technical?**
A: Basic computer skills are enough. The setup wizard guides you through everything.

**Q: What if the AI says something wrong?**
A: You can edit the response templates in `config/responses.json`. It's just text files.

**Q: Can I turn it off?**
A: Yes! Run `./scripts/pause.sh` to stop auto-responses. Run `./scripts/resume.sh` to turn it back on.

**Q: How do I see what happened?**
A: Run `./scripts/dashboard.sh` to see stats, or `./scripts/lead-history.sh` to see full conversations.

**Q: What about spam?**
A: The system tracks every conversation. You can block numbers if needed.

## Files You'll Edit

| File | What It Controls |
|------|------------------|
| `config/business-profile.json` | Your business name, hours, contact info |
| `config/services.json` | What services you offer and pricing |
| `config/responses.json` | What the AI says in different situations |
| `config/followup-sequences.json` | When and how often to follow up |

## Getting Help

- Check the dashboard: `./scripts/dashboard.sh`
- Check system status: `./scripts/status.sh`
- View a conversation: `./scripts/lead-history.sh +1234567890`

## Next Steps After Setup

1. **Test it yourself** - Send a text to your number
2. **Update your website** - Add "Text us at [number]" 
3. **Train your team** - Show them how to check the dashboard
4. **Monitor for a week** - Watch how it performs and adjust responses

---

*Still stuck? The advanced guide is in `advanced-mode.md`.*