#!/bin/bash

# Send SMS via Telnyx
# Usage: ./send-sms.sh +15551234567 "Your message here"

if [ $# -lt 2 ]; then
    echo "Usage: ./send-sms.sh <phone_number> <message>"
    echo "Example: ./send-sms.sh +15551234567 \"Hello! How can we help?\""
    exit 1
fi

PHONE=$1
MESSAGE=$2

# Check if telnyx-sms skill is available
TELNYX_DIR="$HOME/.openclaw/workspace/skills/telnyx-sms"

if [ ! -d "$TELNYX_DIR" ]; then
    echo "❌ Telnyx SMS skill not found."
    echo "   Run: /setup telnyx"
    exit 1
fi

# Try to use OpenClaw command if available
if command -v openclaw &> /dev/null; then
    # Use the telnyx-sms skill through OpenClaw
    echo "📱 Sending SMS to $PHONE..."
    
    # Create a temporary script to send via Node.js
    node -e "
const fs = require('fs');
const path = require('path');

const configPath = path.join(process.env.HOME, '.openclaw/workspace/skills/telnyx-sms/.telnyx_config');

if (!fs.existsSync(configPath)) {
    console.error('❌ Telnyx not configured. Run: /setup telnyx');
    process.exit(1);
}

const config = fs.readFileSync(configPath, 'utf8');
const apiKey = config.match(/TELNYX_API_KEY=(.+)/)?.[1];
const fromNumber = config.match(/PHONE_NUMBER=(.+)/)?.[1];

if (!apiKey || !fromNumber) {
    console.error('❌ Missing Telnyx configuration');
    process.exit(1);
}

console.log('✓ Configuration loaded');
console.log('From:', fromNumber);
console.log('To:', '$PHONE');
console.log('Message:', '$MESSAGE');
console.log('');
console.log('To actually send, use the OpenClaw SMS command:');
console.log('  /sms send $PHONE \"$MESSAGE\"');
"
else
    echo "❌ OpenClaw not found"
    exit 1
fi