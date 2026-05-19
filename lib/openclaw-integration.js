/**
 * OpenClaw Integration - Connect to OpenClaw's built-in channels
 * TeamAir AI Growth Engine
 */

const { processIncomingMessage } = require('./conversation-handler');
const { runFollowUpCheck } = require('./followup-engine');

/**
 * Handle incoming message from OpenClaw
 * This is called when a message comes in via SMS, Email, or other channels
 */
async function handleIncomingMessage({ message, from, channel, metadata = {} }) {
  console.log(`[TeamAir] Incoming ${channel} message from ${from}`);
  
  try {
    // Process through conversation handler
    const result = await processIncomingMessage(from, message, channel);
    
    // Return the response for OpenClaw to send
    return {
      success: true,
      response: result.response,
      lead: result.lead,
      intent: result.intent,
      shouldFollowUp: result.shouldFollowUp
    };
  } catch (err) {
    console.error('[TeamAir] Error handling message:', err);
    return {
      success: false,
      error: err.message,
      response: "Sorry, we're experiencing technical difficulties. Please try again later."
    };
  }
}

/**
 * Send message via OpenClaw's channels
 */
async function sendMessage({ to, message, channel = 'sms' }) {
  console.log(`[TeamAir] Sending ${channel} to ${to}: ${message.substring(0, 50)}...`);
  
  // This will be called by OpenClaw's channel router
  // The actual sending is handled by OpenClaw core
  return {
    success: true,
    to,
    channel,
    message
  };
}

/**
 * Run follow-up check and send messages
 */
async function processFollowUps() {
  console.log('[TeamAir] Running follow-up check...');
  
  const results = await runFollowUpCheck(async (phone, message) => {
    // This sends via OpenClaw's SMS channel
    await sendMessage({
      to: phone,
      message,
      channel: 'sms'
    });
  });
  
  return results;
}

/**
 * Get dashboard data
 */
async function getDashboard() {
  const leadManager = require('./lead-manager');
  
  const [stats, pendingFollowUps] = await Promise.all([
    leadManager.getDashboardStats(),
    leadManager.getLeadsNeedingFollowUp()
  ]);
  
  return {
    stats,
    pendingFollowUps: pendingFollowUps.slice(0, 10)
  };
}

/**
 * Command handlers for OpenClaw triggers
 */
const commands = {
  // /growth-engine or /engine
  async dashboard() {
    const data = await getDashboard();
    return formatDashboard(data);
  },
  
  // /engine stats
  async stats() {
    const leadManager = require('./lead-manager');
    const stats = await leadManager.getDashboardStats();
    return formatStats(stats);
  },
  
  // /engine leads
  async leads() {
    const leadManager = require('./lead-manager');
    const leads = await leadManager.getAllLeads();
    return formatLeads(leads.slice(0, 10));
  },
  
  // /engine followups
  async followups() {
    const leadManager = require('./lead-manager');
    const leads = await leadManager.getLeadsNeedingFollowUp();
    return formatFollowUps(leads);
  },
  
  // /engine send <phone> <message>
  async send(phone, ...messageParts) {
    const message = messageParts.join(' ');
    await sendMessage({ to: phone, message, channel: 'sms' });
    return `✅ Message queued for ${phone}`;
  },
  
  // /engine history <phone>
  async history(phone) {
    const leadManager = require('./lead-manager');
    const lead = await leadManager.getLead(phone);
    return formatLeadHistory(lead);
  },
  
  // /engine setup
  async setup() {
    return `🚀 TeamAir AI Growth Engine Setup

1. Copy .env.example to .env and fill in your API keys
2. Edit config/business-profile.json with your details
3. Edit config/services.json with your services
4. Run ./install.sh to complete setup

Need help? See references/beginner-mode.md`;
  }
};

/**
 * Main entry point for OpenClaw commands
 */
async function handleCommand(command, ...args) {
  const handler = commands[command];
  if (!handler) {
    return `Unknown command: ${command}

Available commands:
  dashboard  - View system dashboard
  stats      - View statistics
  leads      - List recent leads
  followups  - List leads needing follow-up
  send       - Send manual SMS
  history    - View lead conversation history
  setup      - Show setup instructions`;
  }
  
  return await handler(...args);
}

// Formatting helpers
function formatDashboard({ stats, pendingFollowUps }) {
  let output = `🚀 TeamAir AI Growth Engine - Dashboard

📊 TODAY'S STATS
----------------
New Leads Today: ${stats.todayLeads}
Total Leads: ${stats.totalLeads}
Active Conversations: ${stats.activeConversations}
Appointments Booked: ${stats.totalAppointments}
Converted: ${stats.convertedLeads}
Need Follow-up: ${stats.needsFollowUp}
`;

  if (pendingFollowUps.length > 0) {
    output += `
⚠️ LEADS NEEDING FOLLOW-UP
---------------------------
`;
    pendingFollowUps.forEach(lead => {
      const lastContact = new Date(lead.lastContact).toLocaleDateString();
      output += `  • ${lead.phone} (Last: ${lastContact})\n`;
    });
  }

  output += `
💡 QUICK ACTIONS
----------------
/engine send <phone> <message>  - Send manual SMS
/engine history <phone>         - View lead history
/engine stats                   - Detailed stats
`;

  return output;
}

function formatStats(stats) {
  return `📊 TeamAir Statistics

Total Leads: ${stats.totalLeads}
Today's Leads: ${stats.todayLeads}
Active Conversations: ${stats.activeConversations}
Total Appointments: ${stats.totalAppointments}
Converted Leads: ${stats.convertedLeads}
Needs Follow-up: ${stats.needsFollowUp}
`;
}

function formatLeads(leads) {
  if (leads.length === 0) return "No leads yet.";
  
  let output = `👤 RECENT LEADS\n---------------\n`;
  leads.forEach(lead => {
    const date = new Date(lead.createdAt).toLocaleDateString();
    output += `  • ${lead.phone} - ${lead.status} (${date})\n`;
  });
  return output;
}

function formatFollowUps(leads) {
  if (leads.length === 0) return "No leads need follow-up right now.";
  
  let output = `⚠️ LEADS NEEDING FOLLOW-UP\n---------------------------\n`;
  leads.forEach(lead => {
    const lastContact = new Date(lead.lastContact).toLocaleDateString();
    output += `  • ${lead.phone} - Last contact: ${lastContact}\n`;
  });
  return output;
}

function formatLeadHistory(lead) {
  if (!lead) return "Lead not found.";
  
  let output = `👤 LEAD: ${lead.phone}\n`;
  output += `Status: ${lead.status}\n`;
  output += `Source: ${lead.source}\n`;
  output += `Created: ${new Date(lead.createdAt).toLocaleString()}\n\n`;
  
  if (lead.conversations && lead.conversations.length > 0) {
    output += `💬 CONVERSATIONS\n----------------\n`;
    lead.conversations.forEach(conv => {
      const time = new Date(conv.timestamp).toLocaleString();
      const dir = conv.direction === 'inbound' ? '←' : '→';
      output += `[${time}] ${dir} ${conv.message}\n`;
    });
  }
  
  return output;
}

module.exports = {
  handleIncomingMessage,
  sendMessage,
  processFollowUps,
  getDashboard,
  handleCommand,
  commands
};