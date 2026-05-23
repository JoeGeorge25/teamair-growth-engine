// Roofing-specific intent detection

const ROOFING_INTENTS = {
  // Storm damage patterns
  STORM_DAMAGE: {
    patterns: [/\b(hail|storm|wind damage|wind|tornado|hurricane)\b/i],
    priority: 10,
    response: 'storm_damage'
  },
  
  // Insurance patterns
  INSURANCE: {
    patterns: [/\b(insurance|claim|deductible|adjuster|policy|coverage|file a claim)\b/i],
    priority: 9,
    response: 'insurance_question'
  },
  
  // Emergency patterns
  EMERGENCY: {
    patterns: [/\b(emergency|urgent|water coming in|ceiling leak|active leak|water damage|flooding|dripping)\b/i],
    priority: 10,
    response: 'emergency_repair'
  },
  
  // Leak patterns
  LEAK: {
    patterns: [/\b(leak|leaking|water stain|wet ceiling|drip)\b/i],
    priority: 8,
    response: 'leak_response'
  },
  
  // Hail damage
  HAIL: {
    patterns: [/\b(hail|hail damage|hailstorm|dented|dents)\b/i],
    priority: 9,
    response: 'hail_damage'
  },
  
  // Wind damage
  WIND: {
    patterns: [/\b(wind|shingles blown off|missing shingles|lifted shingles)\b/i],
    priority: 8,
    response: 'wind_damage'
  },
  
  // Pricing/Quote
  PRICING: {
    patterns: [/\b(price|pricing|cost|quote|estimate|how much|expensive|cheap|afford)\b/i],
    priority: 7,
    response: 'pricing_inquiry'
  },
  
  // Appointment/Inspection
  APPOINTMENT: {
    patterns: [/\b(appointment|schedule|book|inspection|come out|look at|check|assess|when can you|available)\b/i],
    priority: 7,
    response: 'appointment_request'
  },
  
  // Greeting
  GREETING: {
    patterns: [/\b(hello|hi|hey|good morning|good afternoon|good evening)\b/i],
    priority: 1,
    response: 'greeting'
  }
};

function detectIntent(message) {
  const lowerMsg = message.toLowerCase();
  let detectedIntent = null;
  let highestPriority = 0;
  
  for (const [intentName, intentData] of Object.entries(ROOFING_INTENTS)) {
    for (const pattern of intentData.patterns) {
      if (pattern.test(lowerMsg)) {
        if (intentData.priority > highestPriority) {
          highestPriority = intentData.priority;
          detectedIntent = {
            name: intentName,
            response: intentData.response
          };
        }
        break;
      }
    }
  }
  
  return detectedIntent || { name: 'UNKNOWN', response: 'unknown' };
}

function getUrgencyScore(message) {
  const lowerMsg = message.toLowerCase();
  let score = 0;
  
  // Emergency keywords (highest urgency)
  if (/\b(emergency|water coming in|active leak|flooding|ceiling collapse)\b/i.test(lowerMsg)) {
    score += 10;
  }
  
  // Storm damage (high urgency)
  if (/\b(hail|storm|wind damage|tornado)\b/i.test(lowerMsg)) {
    score += 7;
  }
  
  // Recent storm mention
  if (/\b(last night|yesterday|this morning|just happened)\b/i.test(lowerMsg)) {
    score += 5;
  }
  
  // Insurance claim (medium urgency)
  if (/\b(insurance|claim|adjuster)\b/i.test(lowerMsg)) {
    score += 4;
  }
  
  // Leak mention
  if (/\b(leak|leaking|water stain)\b/i.test(lowerMsg)) {
    score += 6;
  }
  
  return score;
}

function shouldRequestPhotos(message) {
  const lowerMsg = message.toLowerCase();
  
  // Request photos for damage assessments
  return /\b(damage|leak|storm|hail|wind|problem|issue)\b/i.test(lowerMsg) &&
         !/\b(already sent|photo|picture|image)\b/i.test(lowerMsg);
}

module.exports = {
  ROOFING_INTENTS,
  detectIntent,
  getUrgencyScore,
  shouldRequestPhotos
};