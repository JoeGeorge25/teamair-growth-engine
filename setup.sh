#!/bin/bash
set -e

echo "🚀 TeamAir AI Growth Engine - Setup Wizard"
echo "==========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Helper function
ask() {
    echo -e "${BLUE}$1${NC}"
    read -r response
    echo "$response"
}

echo "Let's configure your AI Growth Engine."
echo ""

# Business Profile
echo "📋 BUSINESS PROFILE"
echo "-------------------"
BUSINESS_NAME=$(ask "What's your business name?")
BUSINESS_PHONE=$(ask "What's your business phone number? (+1-XXX-XXX-XXXX)")
BUSINESS_EMAIL=$(ask "What's your business email?")
BUSINESS_WEBSITE=$(ask "What's your website URL? (or press Enter to skip)")

cat > config/business-profile.json << EOF
{
  "name": "$BUSINESS_NAME",
  "tagline": "AI-powered customer engagement",
  "phone": "$BUSINESS_PHONE",
  "email": "$BUSINESS_EMAIL",
  "website": "$BUSINESS_WEBSITE",
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

echo -e "${GREEN}✓ Business profile saved${NC}"
echo ""

# Services
echo "📋 SERVICES"
echo "-----------"
echo "What services do you offer? (Enter one per line, blank line when done)"
echo ""

services=()
while true; do
    service=$(ask "Service name (or press Enter to finish):")
    if [ -z "$service" ]; then
        break
    fi
    services+=("$service")
done

# Build services JSON
services_json="["
for i in "${!services[@]}"; do
    if [ $i -gt 0 ]; then
        services_json+=","
    fi
    services_json+="{\"name\":\"${services[$i]}\",\"description\":\"\",\"price\":\"Contact for pricing\",\"duration\":\"60 minutes\"}"
done
services_json+="]"

cat > config/services.json << EOF
{
  "services": $services_json
}
EOF

echo -e "${GREEN}✓ Services saved${NC}"
echo ""

# Telnyx Setup
echo "📱 SMS SETUP (Telnyx)"
echo "--------------------"
echo "To send/receive SMS, you need a Telnyx account."
echo "Don't have one? Get started at https://telnyx.com"
echo ""

TELNYX_API_KEY=$(ask "Enter your Telnyx API Key (or press Enter to skip):")

if [ -n "$TELNYX_API_KEY" ]; then
    TELNYX_PHONE=$(ask "Enter your Telnyx phone number (+1-XXX-XXX-XXXX):")
    
    mkdir -p ~/.openclaw/workspace/skills/telnyx-sms
    cat > ~/.openclaw/workspace/skills/telnyx-sms/.telnyx_config << EOF
TELNYX_API_KEY=$TELNYX_API_KEY
PHONE_NUMBER=$TELNYX_PHONE
MESSAGING_PROFILE_ID=default
EOF
    
    echo -e "${GREEN}✓ Telnyx configured${NC}"
else
    echo -e "${YELLOW}⚠️  Skipping Telnyx setup. You can configure later with /setup telnyx${NC}"
fi

echo ""

# AI Model Setup
echo "🤖 AI MODEL SETUP"
echo "-----------------"
echo "The system needs an AI model for responses."
echo ""

OPENAI_KEY=$(ask "Enter your OpenAI API Key (or press Enter to skip):")

if [ -n "$OPENAI_KEY" ]; then
    # Add to .env if it exists
    if [ -f "../.env" ]; then
        echo "OPENAI_API_KEY=$OPENAI_KEY" >> ../.env
    fi
    echo -e "${GREEN}✓ OpenAI configured${NC}"
else
    echo -e "${YELLOW}⚠️  Skipping AI setup. You can configure later.${NC}"
fi

echo ""

# Webhook Setup
echo "🔗 WEBHOOK SETUP"
echo "----------------"
echo "To receive incoming messages, you need a public URL."
echo "Options:"
echo "  1. Use a tunnel service (ngrok, localtunnel)"
echo "  2. Deploy to a server with a public IP"
echo "  3. Use OpenClaw Cloud (if available)"
echo ""

WEBHOOK_URL=$(ask "Enter your webhook URL (or press Enter to skip):")

if [ -n "$WEBHOOK_URL" ]; then
    cat > config/webhook.json << EOF
{
  "url": "$WEBHOOK_URL",
  "enabled": true
}
EOF
    echo -e "${GREEN}✓ Webhook configured${NC}"
else
    echo -e "${YELLOW}⚠️  Skipping webhook setup. You can configure later.${NC}"
fi

echo ""
echo "==========================================="
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "Your AI Growth Engine is configured."
echo ""
echo "Next steps:"
echo "  1. Review config/business-profile.json"
echo "  2. Review config/services.json"
echo "  3. Run ./scripts/test-sms.sh to test"
echo "  4. Run ./scripts/dashboard.sh to monitor"
echo ""
echo "Need help? See references/beginner-mode.md"