/**
 * Follow-up Engine - Automated follow-up sequences
 * TeamAir AI Growth Engine
 */

const fs = require('fs').promises;
const path = require('path');
const leadManager = require('./lead-manager');

let sequences = {};

async function loadSequences() {
  try {
    const data = await fs.readFile(
      path.join(__dirname, '..', 'config', 'followup-sequences.json'),
      'utf8'
    );
    sequences = JSON.parse(data);
  } catch (err) {
    console.error('Failed to load follow-up sequences:', err.message);
    sequences = {
      new_lead: [
        { delay: '5 minutes', message: 'auto_greeting' },
        { delay: '1 day', message: 'follow_up' }
      ]
    };
  }
}

/**
 * Parse delay string to milliseconds
 */
function parseDelay(delay) {
  if (delay === 'immediate') return 0;
  
  const match = delay.match(/(\d+)\s*(minute|hour|day|week)s?/);
  if (!match) return 0;
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  const multipliers = {
    minute: 60 * 1000,
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000
  };
  
  return value * (multipliers[unit] || 0);
}

/**
 * Get next follow-up for a lead
 */
async function getNextFollowUp(phone) {
  await loadSequences();
  
  const lead = await leadManager.getLead(phone);
  if (!lead) return null;
  
  // Determine sequence type
  let sequenceType = 'new_lead';
  if (lead.status === 'appointment_booked') {
    sequenceType = 'appointment_booked';
  } else if (lead.status === 'no_response') {
    sequenceType = 'no_response';
  }
  
  const sequence = sequences[sequenceType];
  if (!sequence) return null;
  
  // Count how many follow-ups have been sent
  const followUpsSent = lead.conversations?.filter(
    c => c.direction === 'outbound' && c.isFollowUp
  ).length || 0;
  
  // Get next follow-up in sequence
  const nextStep = sequence[followUpsSent];
  if (!nextStep) return null; // Sequence complete
  
  // Check if it's time
  const lastContact = new Date(lead.lastContact);
  const delayMs = parseDelay(nextStep.delay);
  const nextFollowUpTime = new Date(lastContact.getTime() + delayMs);
  
  if (new Date() >= nextFollowUpTime) {
    return {
      phone,
      messageKey: nextStep.message,
      delay: nextStep.delay,
      sequenceType
    };
  }
  
  return null;
}

/**
 * Get all leads needing follow-up
 */
async function getPendingFollowUps() {
  const leads = await leadManager.getAllLeads();
  const pending = [];
  
  for (const lead of leads) {
    const next = await getNextFollowUp(lead.phone);
    if (next) {
      pending.push(next);
    }
  }
  
  return pending;
}

/**
 * Mark conversation as follow-up
 */
async function markAsFollowUp(phone, messageId) {
  const lead = await leadManager.getLead(phone);
  if (!lead) return;
  
  const conversation = lead.conversations?.find(c => c.id === messageId);
  if (conversation) {
    conversation.isFollowUp = true;
    
    const filePath = path.join(
      __dirname, '..', 'data', 'leads',
      `${phone.replace(/[^0-9]/g, '')}.json`
    );
    await fs.writeFile(filePath, JSON.stringify(lead, null, 2));
  }
}

/**
 * Run follow-up check (call this periodically)
 */
async function runFollowUpCheck(sendMessageFn) {
  await loadSequences();
  
  const pending = await getPendingFollowUps();
  const results = [];
  
  for (const followUp of pending) {
    try {
      // Get message content
      let message;
      if (followUp.messageKey === 'auto_greeting') {
        const responses = JSON.parse(await fs.readFile(
          path.join(__dirname, '..', 'config', 'responses.json'),
          'utf8'
        ));
        message = responses.greeting;
      } else if (followUp.messageKey === 'follow_up') {
        const responses = JSON.parse(await fs.readFile(
          path.join(__dirname, '..', 'config', 'responses.json'),
          'utf8'
        ));
        message = responses.follow_up;
      } else {
        message = followUp.messageKey;
      }
      
      // Send message
      if (sendMessageFn) {
        await sendMessageFn(followUp.phone, message);
      }
      
      results.push({
        phone: followUp.phone,
        status: 'sent',
        message: followUp.messageKey
      });
      
      console.log(`Follow-up sent to ${followUp.phone}: ${followUp.messageKey}`);
    } catch (err) {
      results.push({
        phone: followUp.phone,
        status: 'failed',
        error: err.message
      });
    }
  }
  
  return results;
}

module.exports = {
  getNextFollowUp,
  getPendingFollowUps,
  markAsFollowUp,
  runFollowUpCheck,
  parseDelay
};