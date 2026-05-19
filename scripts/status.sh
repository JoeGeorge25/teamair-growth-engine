#!/bin/bash

echo ""
echo "🔍 System Status Check"
echo "====================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_service() {
    if command -v "$1" &> /dev/null; then
        echo -e "${GREEN}✓${NC} $2"
        return 0
    else
        echo -e "${RED}✗${NC} $2 (not found)"
        return 1
    fi
}

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        return 0
    else
        echo -e "${RED}✗${NC} $2 (missing)"
        return 1
    fi
}

echo "Core Dependencies:"
check_service "openclaw" "OpenClaw"
check_service "node" "Node.js"
check_service "redis-cli" "Redis"

echo ""
echo "Configuration Files:"
check_file "config/business-profile.json" "Business Profile"
check_file "config/services.json" "Services Config"
check_file "config/responses.json" "Response Templates"
check_file "config/followup-sequences.json" "Follow-up Sequences"

echo ""
echo "Telnyx SMS:"
if [ -f "$HOME/.openclaw/workspace/skills/telnyx-sms/.telnyx_config" ]; then
    echo -e "${GREEN}✓${NC} Telnyx configured"
else
    echo -e "${YELLOW}⚠${NC} Telnyx not configured (run /setup telnyx)"
fi

echo ""
echo "Data Directories:"
for dir in data/leads data/conversations data/appointments logs; do
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} $dir/"
    else
        echo -e "${RED}✗${NC} $dir/ (missing)"
    fi
done

echo ""
echo "====================="
echo "Status check complete"
