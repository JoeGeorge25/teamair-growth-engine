#!/bin/bash

# View lead conversation history
# Usage: ./lead-history.sh +15551234567

if [ $# -lt 1 ]; then
    echo "Usage: ./lead-history.sh <phone_number>"
    echo "Example: ./lead-history.sh +15551234567"
    exit 1
fi

PHONE=$1
SANITIZED=$(echo "$PHONE" | tr -cd '0-9')

node -e "
const leadManager = require('./lib/lead-manager');

async function showHistory() {
  const lead = await leadManager.getLead('$PHONE');
  
  if (!lead) {
    console.log('❌ Lead not found:', '$PHONE');
    return;
  }
  
  console.log('');
  console.log('👤 LEAD PROFILE');
  console.log('===============');
  console.log(\`Phone: \${lead.phone}\`);
  console.log(\`Name: \${lead.name || 'Unknown'}\`);
  console.log(\`Email: \${lead.email || 'Not provided'}\`);
  console.log(\`Status: \${lead.status}\`);
  console.log(\`Source: \${lead.source}\`);
  console.log(\`Created: \${new Date(lead.createdAt).toLocaleString()}\`);
  console.log(\`Last Contact: \${new Date(lead.lastContact).toLocaleString()}\`);
  console.log('');
  
  if (lead.conversations && lead.conversations.length > 0) {
    console.log('💬 CONVERSATION HISTORY');
    console.log('=======================');
    console.log('');
    
    lead.conversations.forEach(conv => {
      const time = new Date(conv.timestamp).toLocaleString();
      const direction = conv.direction === 'inbound' ? '📥 IN' : '📤 OUT';
      console.log(\`[\${time}] \${direction}:\`);
      console.log(\`  \${conv.message}\`);
      console.log('');
    });
  } else {
    console.log('No conversation history');
  }
  
  if (lead.appointments && lead.appointments.length > 0) {
    console.log('');
    console.log('📅 APPOINTMENTS');
    console.log('===============');
    lead.appointments.forEach(appt => {
      console.log(\`  • \${appt.date} at \${appt.time} - \${appt.status}\`);
    });
  }
}

showHistory().catch(console.error);
"