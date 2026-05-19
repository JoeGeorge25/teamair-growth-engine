#!/bin/bash
set -e

echo "🚀 TeamAir AI Growth Engine - Installation"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check OpenClaw
if ! command -v openclaw &> /dev/null; then
    echo -e "${RED}❌ OpenClaw not found. Please install OpenClaw first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ OpenClaw detected${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Installing...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

echo -e "${GREEN}✓ Node.js $(node --version)${NC}"

# Check Redis
if ! command -v redis-cli &> /dev/null; then
    echo -e "${YELLOW}⚠️  Redis not found. Please install Redis:${NC}"
    echo "   sudo apt-get install redis-server"
    echo "   sudo systemctl enable redis"
    echo "   sudo systemctl start redis"
    exit 1
fi

echo -e "${GREEN}✓ Redis detected${NC}"

# Create directories
echo ""
echo "Creating directories..."
mkdir -p logs
mkdir -p data/leads
mkdir -p data/conversations
mkdir -p data/appointments

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install

# Check for required skills
echo ""
echo "Checking required skills..."

SKILLS_DIR="$HOME/.openclaw/workspace/skills"
REQUIRED_SKILLS=("conversation-system" "telnyx-sms")

for skill in "${REQUIRED_SKILLS[@]}"; do
    if [ -d "$SKILLS_DIR/$skill" ]; then
        echo -e "${GREEN}✓ $skill found${NC}"
    else
        echo -e "${YELLOW}⚠️  $skill not found. Will be installed during setup.${NC}"
    fi
done

# Make scripts executable
echo ""
echo "Setting up scripts..."
chmod +x scripts/*.sh

# Create default configs if they don't exist
echo ""
echo "Creating default configuration..."

if [ ! -f "config/business-profile.json" ]; then
cat > config/business-profile.json << 'EOF'
{
  "name": "Your Business Name",
  "tagline": "Your tagline here",
  "phone": "+1-000-000-0000",
  "email": "hello@yourbusiness.com",
  "website": "https://yourbusiness.com",
  "hours": {
    "monday": "9:00-17:00",
    "tuesday": "9:00-17:00",
    "wednesday": "9:00-17:00",
    "thursday": "9:00-17:00",
    "friday": "9:00-17:00",
    "saturday": "10:00-14:00",
    "sunday": "closed"
  },
  "timezone": "America/New_York"
}
EOF
fi

if [ ! -f "config/services.json" ]; then
cat > config/services.json << 'EOF'
{
  "services": [
    {
      "name": "Service Name",
      "description": "Brief description",
      "price": "Starting at $X",
      "duration": "60 minutes"
    }
  ]
}
EOF
fi

if [ ! -f "config/responses.json" ]; then
cat > config/responses.json << 'EOF'
{
  "greeting": "Hi! Thanks for contacting {{business.name}}. I'm the AI assistant. How can we help you today?",
  "after_hours": "Hi! You've reached {{business.name}}. We're currently closed but will respond first thing during business hours. How can we help?",
  "appointment_request": "I'd be happy to help you book an appointment! What service are you looking for and what day works best?",
  "pricing_inquiry": "I'd be happy to discuss pricing with you. What service are you interested in?",
  "unknown": "Thanks for your message! Let me make sure I understand correctly. Could you tell me more about what you need?",
  "follow_up": "Just following up! Were you still interested in booking with {{business.name}}?",
  "booking_confirmed": "Great! You're all set for {{appointment.date}} at {{appointment.time}}. We'll see you then!"
}
EOF
fi

if [ ! -f "config/followup-sequences.json" ]; then
cat > config/followup-sequences.json << 'EOF'
{
  "new_lead": [
    { "delay": "5 minutes", "message": "auto_greeting" },
    { "delay": "1 day", "message": "follow_up" },
    { "delay": "3 days", "message": "follow_up" },
    { "delay": "7 days", "message": "final_follow_up" }
  ],
  "appointment_booked": [
    { "delay": "immediate", "message": "booking_confirmed" },
    { "delay": "1 day before", "message": "appointment_reminder" }
  ],
  "no_response": [
    { "delay": "2 hours", "message": "follow_up" },
    { "delay": "1 day", "message": "follow_up" }
  ]
}
EOF
fi

if [ ! -f "config/calendar-rules.json" ]; then
cat > config/calendar-rules.json << 'EOF'
{
  "booking": {
    "advance_notice": "2 hours",
    "max_advance": "30 days",
    "slot_duration": "60 minutes",
    "buffer_between": "15 minutes",
    "max_per_day": 8
  },
  "availability": {
    "monday": ["9:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"],
    "tuesday": ["9:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"],
    "wednesday": ["9:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"],
    "thursday": ["9:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"],
    "friday": ["9:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"],
    "saturday": ["10:00", "11:00", "12:00", "13:00"],
    "sunday": []
  }
}
EOF
fi

echo -e "${GREEN}✓ Default configs created${NC}"

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Installation Complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Run ./setup.sh to configure your business"
echo "  2. Edit config/business-profile.json with your details"
echo "  3. Run ./scripts/dashboard.sh to view your system"
echo ""
echo "Need help? Check references/beginner-mode.md"