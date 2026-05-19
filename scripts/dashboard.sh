#!/bin/bash

# TeamAir AI Growth Engine - Dashboard
# Shows real-time stats and lead information

echo ""
echo "🚀 TeamAir AI Growth Engine - Dashboard"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get stats from Node.js script
node -e "
const leadManager = require('./lib/lead-manager');

async function showDashboard() {
  try {
    const stats = await leadManager.getDashboardStats();
    const leadsNeedingFollowUp = await leadManager.getLeadsNeedingFollowUp();
    
    console.log('📊 TODAY\'S STATS');
    console.log('----------------');
    console.log(\`New Leads Today: \${stats.todayLeads}\`);
    console.log(\`Total Leads: \${stats.totalLeads}\`);
    console.log(\`Active Conversations: \${stats.activeConversations}\`);
    console.log(\`Appointments Booked: \${stats.totalAppointments}\`);
    console.log(\`Converted: \${stats.convertedLeads}\`);
    console.log(\`Need Follow-up: \${stats.needsFollowUp}\`);
    console.log('');
    
    if (leadsNeedingFollowUp.length > 0) {
      console.log('⚠️  LEADS NEEDING FOLLOW-UP');
      console.log('---------------------------');
      leadsNeedingFollowUp.slice(0, 5).forEach(lead => {
        console.log(\`  • \${lead.phone} (Last: \${new Date(lead.lastContact).toLocaleDateString()})\`);
      });
      if (leadsNeedingFollowUp.length > 5) {
        console.log(\`  ... and \${leadsNeedingFollowUp.length - 5} more\`);
      }
      console.log('');
    }
    
    console.log('💡 QUICK ACTIONS');
    console.log('----------------');
    console.log('  ./scripts/send-sms.sh <phone> <message>  - Send manual SMS');
    console.log('  ./scripts/lead-history.sh <phone>        - View lead history');
    console.log('  ./scripts/status.sh                      - Check system status');
    console.log('');
    
  } catch (err) {
    console.error('Error loading dashboard:', err.message);
  }
}

showDashboard();
"