/**
 * Conversation Handler - Process incoming messages and generate responses
 * Roofing Growth Engine
 */

const fs = require('fs').promises;
const path = require('path');
const leadManager = require('./lead-manager');
const { detectIntent, getUrgencyScore, shouldRequestPhotos } = require('./intents');

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
  
  if (!hours || hours === 'closed' || hours === 'Emergency only') return false;
  
  const [open, close] = hours.split('-');
  const currentHour = now.getHours();
  const openHour = parseInt(open.split(':')[0]);
  const closeHour = parseInt(close.split(':')[0]);
  
  return currentHour >= openHour && currentHour < closeHour;
}

/**
 * Replace template variables in response
 */
function fillTemplate(template, context = {}) {
  let filled = template
    .replace(/\{\{business\.name\}\}/g, businessProfile.name || 'Our Business')
    .replace(/\{\{business\.phone\}\}/g, businessProfile.phone || '')
    .replace(/\{\{business\.email\}\}/g, businessProfile.email || '');
    
  // Add appointment context if available
  if (context.appointment) {
    filled = filled
      .replace(/\{\{appointment\.date\}\}/g, context.appointment.date || '')
      .replace(/\{\{appointment\.time\}\}/g, context.appointment.time || '');
  }
  
  return filled;
}

/**
 * Generate response based on intent and urgency
 */
async function generateResponse(phone, message, intentData, urgencyScore) {
  await loadConfig();
  
  const lead = await leadManager.getLead(phone);
  const isNewLead = !lead;
  const inBusinessHours = isBusinessHours();
  const intent = intentData.response || 'unknown';
  
  // Emergency override - always respond immediately
  if (urgencyScore >= 10) {
    return fillTemplate(responses.emergency_repair || responses.greeting);
  }
  
  // Select response template based on intent
  let responseTemplate;
  
  if (!inBusinessHours && isNewLead) {
    responseTemplate = responses.after_hours || responses.greeting;
  } else {
    // Use roofing-specific responses
    switch (intent) {
      case 'storm_damage':
        responseTemplate = responses.storm_damage || responses.greeting;
        break;
      case 'hail_damage':
        responseTemplate = responses.hail_damage || responses.storm_damage || responses.greeting;
        break;
      case 'wind_damage':
        responseTemplate = responses.wind_damage || responses.storm_damage || responses.greeting;
        break;
      case 'emergency_repair':
        responseTemplate = responses.emergency_repair || responses.greeting;
        break;
      case 'leak_response':
        responseTemplate = responses.leak_response || responses.greeting;
        break;
      case 'insurance_question':
        responseTemplate = responses.insurance_question || responses.greeting;
        break;
      case 'appointment_request':
        responseTemplate = responses.appointment_request || responses.greeting;
        break;
      case 'pricing_inquiry':
        responseTemplate = responses.pricing_inquiry || responses.greeting;
        break;
      case 'service_inquiry':
        const serviceList = services.map(s => `• ${s.name}: ${s.description}`).join('\n');
        responseTemplate = `We offer several roofing services:\n${serviceList}\n\nWhich service do you need help with?`;
        break;
      case 'greeting':
        responseTemplate = responses.greeting;
        break;
      default:
        responseTemplate = responses.unknown || responses.greeting;
    }
  }
  
  let response = fillTemplate(responseTemplate);
  
  // Add photo request for damage-related intents
  if (shouldRequestPhotos(message) && intent.match(/storm|damage|leak|hail|wind/)) {
    response += '\n\n' + (responses.photo_request || 'To better assess your roof condition, could you send me a few photos of the damage? You can text them directly to this number.');
  }
  
  return response;
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
  
  // Detect intent using roofing-specific engine
  const intentData = detectIntent(message);
  const urgencyScore = getUrgencyScore(message);
  
  // Generate response
  const response = await generateResponse(phone, message, intentData, urgencyScore);
  
  // Store outbound message
  await leadManager.addConversation(phone, response, 'outbound');
  
  // Update lead status based on intent and urgency
  let newStatus = 'active';
  let leadType = 'general';
  
  if (urgencyScore >= 10) {
    newStatus = 'emergency';
    leadType = 'emergency_leak';
  } else if (intentData.name === 'STORM_DAMAGE' || intentData.name === 'HAIL' || intentData.name === 'WIND') {
    newStatus = 'storm_damage';
    leadType = 'storm_claim';
  } else if (intentData.name === 'INSURANCE') {
    newStatus = 'insurance_pending';
    leadType = 'insurance_claim';
  } else if (intentData.response === 'appointment_request') {
    newStatus = 'appointment_pending';
  }
  
  await leadManager.updateLeadStatus(phone, newStatus);
  await leadManager.updateLead(phone, { 
    leadType,
    urgencyScore,
    lastIntent: intentData.name
  });
  
  return {
    lead,
    intent: intentData,
    urgencyScore,
    response,
    shouldFollowUp: urgencyScore < 10 && intentData.response !== 'appointment_request'
  };
}

/**
 * Generate follow-up message
 */
async function generateFollowUp(phone) {
  await loadConfig();
  
  const lead = await leadManager.getLead(phone);
  if (!lead) return null;
  
  // Determine follow-up message based on lead type
  let template;
  const followUpCount = lead.followUpCount || 0;
  
  if (followUpCount === 0) {
    template = responses.follow_up || "Just following up on your roofing inquiry!";
  } else if (followUpCount === 1) {
    template = responses.follow_up || "Hi! Following up on your roof inspection request.";
  } else {
    template = responses.final_follow_up || "Hi! This is my final follow-up. If you're still interested, just reply anytime.";
  }
  
  const message = fillTemplate(template);
  
  await leadManager.addConversation(phone, message, 'outbound');
  await leadManager.updateLead(phone, { 
    followUpCount: followUpCount + 1,
    lastFollowUp: new Date().toISOString()
  });
  
  return message;
}

module.exports = {
  processIncomingMessage,
  generateFollowUp,
  loadConfig,
  isBusinessHours
};