/**
 * Conversation Handler - Process incoming messages and generate responses
 * TeamAir AI Growth Engine
 */

const fs = require('fs').promises;
const path = require('path');
const leadManager = require('./lead-manager');

// Load configuration
let businessProfile = {};
let services = [];
let responses = {};

async function loadConfig() {
  try {
    const profileData = await fs.readFile(
      path.join(__dirname, '..', 'config', 'business-profile.json'),
      'utf8'
    );
    businessProfile = JSON.parse(profileData);
  } catch (err) {
    console.error('Failed to load business profile:', err.message);
  }
  
  try {
    const servicesData = await fs.readFile(
      path.join(__dirname, '..', 'config', 'services.json'),
      'utf8'
    );
    services = JSON.parse(servicesData).services || [];
  } catch (err) {
    console.error('Failed to load services:', err.message);
  }
  
  try {
    const responsesData = await fs.readFile(
      path.join(__dirname, '..', 'config', 'responses.json'),
      'utf8'
    );
    responses = JSON.parse(responsesData);
  } catch (err) {
    console.error('Failed to load responses:', err.message);
  }
}

/**
 * Check if currently within business hours
 */
function isBusinessHours() {
  const now = new Date();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const day = days[now.getDay()];
  const hours = businessProfile.hours?.[day];
  
  if (!hours || hours === 'closed') return false;
  
  const [open, close] = hours.split('-');
  const currentHour = now.getHours();
  const openHour = parseInt(open.split(':')[0]);
  const closeHour = parseInt(close.split(':')[0]);
  
  return currentHour >= openHour && currentHour < closeHour;
}

/**
 * Replace template variables in response
 */
function fillTemplate(template) {
  return template
    .replace(/\{\{business\.name\}\}/g, businessProfile.name || 'Our Business')
    .replace(/\{\{business\.phone\}\}/g, businessProfile.phone || '')
    .replace(/\{\{business\.email\}\}/g, businessProfile.email || '');
}

/**
 * Detect intent from message
 */
function detectIntent(message) {
  const lowerMsg = message.toLowerCase();
  
  // Appointment intent
  if (lowerMsg.match(/\b(book|schedule|appointment|slot|available|when|time)\b/)) {
    return 'appointment_request';
  }
  
  // Pricing intent
  if (lowerMsg.match(/\b(price|pricing|cost|how much|quote|estimate)\b/)) {
    return 'pricing_inquiry';
  }
  
  // Service inquiry
  if (lowerMsg.match(/\b(service|offer|do you|provide|help with)\b/)) {
    return 'service_inquiry';
  }
  
  // Greeting
  if (lowerMsg.match(/\b(hi|hello|hey|good morning|good afternoon)\b/)) {
    return 'greeting';
  }
  
  // Contact info
  if (lowerMsg.match(/\b(call|phone|email|reach|contact)\b/)) {
    return 'contact_request';
  }
  
  return 'general';
}

/**
 * Generate response based on intent
 */
async function generateResponse(phone, message, intent) {
  await loadConfig();
  
  const lead = await leadManager.getLead(phone);
  const isNewLead = !lead;
  const inBusinessHours = isBusinessHours();
  
  // Select response template
  let responseTemplate;
  
  if (!inBusinessHours && isNewLead) {
    responseTemplate = responses.after_hours || responses.greeting;
  } else if (intent === 'appointment_request') {
    responseTemplate = responses.appointment_request || responses.greeting;
  } else if (intent === 'pricing_inquiry') {
    responseTemplate = responses.pricing_inquiry || responses.greeting;
  } else if (intent === 'service_inquiry') {
    const serviceList = services.map(s => `• ${s.name}`).join('\n');
    responseTemplate = `We offer several services:\n${serviceList}\n\nWhich one are you interested in?`;
  } else if (intent === 'contact_request') {
    responseTemplate = `You can reach us at ${businessProfile.phone || 'our main line'} or email ${businessProfile.email || 'us'}. How else can I help?`;
  } else {
    responseTemplate = responses.greeting || "Hi! How can we help you today?";
  }
  
  return fillTemplate(responseTemplate);
}

/**
 * Process incoming message
 */
async function processIncomingMessage(phone, message, source = 'sms') {
  await loadConfig();
  
  // Get or create lead
  let lead = await leadManager.getLead(phone);
  
  if (!lead) {
    lead = await leadManager.upsertLead(phone, {
      source,
      status: 'new',
      createdAt: new Date().toISOString()
    });
    console.log(`New lead created: ${phone}`);
  }
  
  // Add conversation
  await leadManager.addConversation(phone, message, 'inbound');
  
  // Detect intent
  const intent = detectIntent(message);
  
  // Generate response
  const response = await generateResponse(phone, message, intent);
  
  // Store outbound message
  await leadManager.addConversation(phone, response, 'outbound');
  
  // Update lead status based on intent
  if (intent === 'appointment_request') {
    await leadManager.updateLeadStatus(phone, 'appointment_pending');
  } else {
    await leadManager.updateLeadStatus(phone, 'active');
  }
  
  return {
    lead,
    intent,
    response,
    shouldFollowUp: intent !== 'appointment_request'
  };
}

/**
 * Generate follow-up message
 */
async function generateFollowUp(phone) {
  await loadConfig();
  
  const lead = await leadManager.getLead(phone);
  if (!lead) return null;
  
  const template = responses.follow_up || "Just following up! Were you still interested?";
  const message = fillTemplate(template);
  
  await leadManager.addConversation(phone, message, 'outbound');
  
  return message;
}

module.exports = {
  processIncomingMessage,
  generateFollowUp,
  detectIntent,
  isBusinessHours
};