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

# Check if configs exist, create from templates if not
if [ ! -f "config/business-profile.json" ]; then
    echo "Creating default configuration files..."
    # Configs should already exist from git, but just in case
fi

# Business Profile
echo "📋 BUSINESS PROFILE"
echo "-------------------"
BUSINESS_NAME=$(ask "What's your business name?")
BUSINESS_PHONE=$(ask "What's your business phone number? (+1-XXX-XXX-XXXX)")
BUSINESS_EMAIL=$(ask "What's your business email?")
BUSINESS_WEBSITE=$(ask "What's your website URL? (or press Enter to skip)")

# Read existing config and update
node -e "
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'config', 'business-profile.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

config.name = '$BUSINESS_NAME' || config.name;
config.phone = '$BUSINESS_PHONE' || config.phone;
config.email = '$BUSINESS_EMAIL' || config.email;
config.website = '$BUSINESS_WEBSITE' || config.website;

fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log('✓ Business profile updated');
"

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

# Update services config
if [ ${#services[@]} -gt 0 ]; then
    node -e "
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'config', 'services.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

config.services = [$(printf "'%s'," "${services[@]}" | sed 's/,$//')].map(name => ({
    name,
    description: '',
    price: 'Contact for pricing',
    duration: '60 minutes'
}));

fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log('✓ Services updated');
"
fi

echo -e "${GREEN}✓ Services saved${NC}"
echo ""

# Environment Setup
echo "🔐 ENVIRONMENT SETUP"
echo "--------------------"
echo "Creating .env file from template..."

if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ .env file created${NC}"
        echo -e "${YELLOW}⚠️  IMPORTANT: Edit .env and add your API keys${NC}"
    else
        echo -e "${YELLOW}⚠️  .env.example not found${NC}"
    fi
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

echo ""

# API Keys reminder
echo "📱 API KEYS NEEDED"
echo "------------------"
echo "You'll need the following API keys:"
echo ""
echo "1. OpenAI API Key (for AI responses)"
echo "   Get it at: https://platform.openai.com/api-keys"
echo ""
echo "2. Telnyx API Key (for SMS)"
echo "   Get it at: https://portal.telnyx.com/#/app/api-keys"
echo "   Or run: /setup telnyx in OpenClaw"
echo ""
echo "3. AgentMail API Key (for Email)"
echo "   Get it at: https://agentmail.to"
echo ""
echo "Add these to your .env file:"
echo "  OPENAI_API_KEY=sk-xxx"
echo "  TELNYX_API_KEY=KEYxxx"
echo "  AGENTMAIL_API_KEY=am_xxx"
echo ""

# Create data directories
echo "📁 Creating data directories..."
mkdir -p data/leads data/conversations data/appointments logs
echo -e "${GREEN}✓ Directories created${NC}"

echo ""
echo "==========================================="
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Edit .env and add your API keys"
echo "  2. Review config/business-profile.json"
echo "  3. Review config/services.json"
echo "  4. Review config/responses.json"
echo "  5. Run ./scripts/status.sh to verify"
echo "  6. Run ./scripts/dashboard.sh to monitor"
echo "  7. In OpenClaw, type: /growth-engine"
echo ""
echo "Need help? See references/beginner-mode.md"