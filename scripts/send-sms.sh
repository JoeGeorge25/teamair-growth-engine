#!/bin/bash

# Send SMS via OpenClaw's Telnyx integration
# Usage: ./send-sms.sh <phone_number> <message>

if [ $# -lt 2 ]; then
    echo "Usage: ./send-sms.sh <phone_number> <message>"
    echo "Example: ./send-sms.sh +15551234567 \"Hello! How can we help?\""
    exit 1
fi

PHONE=$1
shift
MESSAGE="$@"

echo "📱 Sending SMS to $PHONE..."
echo "Message: $MESSAGE"
echo ""

# Check if running inside OpenClaw
if command -v openclaw &> /dev/null; then
    # Use OpenClaw's built-in SMS command
    echo "Using OpenClaw SMS..."
    echo "Run this command in OpenClaw:"
    echo "  /sms send $PHONE \"$MESSAGE\""
    echo ""
    
    # Try to send via Node.js if we have the skill
    node -e "
const path = require('path');
const fs = require('fs');

// Try to find telnyx-sms skill
const possiblePaths = [
    path.join(process.env.HOME || '/root', '.openclaw/workspace/skills/telnyx-sms'),
    path.join('/root/.openclaw/workspace/skills/telnyx-sms'),
    path.join(__dirname, '../..', 'telnyx-sms')
];

let telnyxPath = null;
for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
        telnyxPath = p;
        break;
    }
}

if (!telnyxPath) {
    console.log('❌ Telnyx SMS skill not found.');
    console.log('   Install it: /setup telnyx');
    process.exit(1);
}

console.log('✓ Found Telnyx skill at:', telnyxPath);

// Check config
const configPath = path.join(telnyxPath, '.telnyx_config');
if (!fs.existsSync(configPath)) {
    console.log('❌ Telnyx not configured.');
    console.log('   Run: /setup telnyx');
    process.exit(1);
}

console.log('✓ Telnyx is configured');
console.log('');
console.log('To send this message:');
console.log('  1. Use OpenClaw command: /sms send $PHONE \"$MESSAGE\"');
console.log('  2. Or use Telnyx API directly with your API key');
"
else
    echo "⚠️  OpenClaw not detected."
    echo ""
    echo "To send SMS, you need:"
    echo "  1. OpenClaw installed with Telnyx SMS skill"
    echo "  2. Or use Telnyx API directly:"
    echo ""
    echo "  curl -X POST https://api.telnyx.com/v2/messages \\"
    echo "    -H 'Authorization: Bearer YOUR_API_KEY' \\"
    echo "    -H 'Content-Type: application/json' \\"
    echo "    -d '{\"from\":\"YOUR_NUMBER\",\"to\":\"$PHONE\",\"text\":\"$MESSAGE\"}'"
fi