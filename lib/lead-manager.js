/**
 * Lead Manager - Core lead tracking and management
 * TeamAir AI Growth Engine
 */

const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'leads');

// Ensure data directory exists
async function ensureDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    // Directory already exists
  }
}

/**
 * Get lead file path
 */
function getLeadPath(phone) {
  const sanitized = phone.replace(/[^0-9]/g, '');
  return path.join(DATA_DIR, `${sanitized}.json`);
}

/**
 * Create or update a lead
 */
async function upsertLead(phone, data) {
  await ensureDir();
  const filePath = getLeadPath(phone);
  
  let lead = {
    phone,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'new',
    source: data.source || 'unknown',
    name: data.name || null,
    email: data.email || null,
    conversations: [],
    appointments: [],
    tags: [],
    notes: '',
    lastContact: new Date().toISOString(),
    ...data
  };
  
  // Try to load existing lead
  try {
    const existing = await fs.readFile(filePath, 'utf8');
    const existingLead = JSON.parse(existing);
    lead = {
      ...existingLead,
      ...lead,
      createdAt: existingLead.createdAt,
      conversations: [...(existingLead.conversations || []), ...(data.conversations || [])],
      appointments: [...(existingLead.appointments || []), ...(data.appointments || [])],
      updatedAt: new Date().toISOString()
    };
  } catch (err) {
    // New lead
  }
  
  await fs.writeFile(filePath, JSON.stringify(lead, null, 2));
  return lead;
}

/**
 * Get lead by phone
 */
async function getLead(phone) {
  const filePath = getLeadPath(phone);
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return null;
  }
}

/**
 * Get all leads
 */
async function getAllLeads() {
  await ensureDir();
  const files = await fs.readdir(DATA_DIR);
  const leads = [];
  
  for (const file of files) {
    if (file.endsWith('.json')) {
      try {
        const data = await fs.readFile(path.join(DATA_DIR, file), 'utf8');
        leads.push(JSON.parse(data));
      } catch (err) {
        // Skip invalid files
      }
    }
  }
  
  return leads;
}

/**
 * Update lead status
 */
async function updateLeadStatus(phone, status) {
  const lead = await getLead(phone);
  if (!lead) return null;
  
  lead.status = status;
  lead.updatedAt = new Date().toISOString();
  
  const filePath = getLeadPath(phone);
  await fs.writeFile(filePath, JSON.stringify(lead, null, 2));
  return lead;
}

/**
 * Add conversation to lead
 */
async function addConversation(phone, message, direction = 'inbound') {
  const lead = await getLead(phone) || { phone };
  
  if (!lead.conversations) lead.conversations = [];
  
  lead.conversations.push({
    timestamp: new Date().toISOString(),
    message,
    direction,
    id: Date.now().toString()
  });
  
  lead.lastContact = new Date().toISOString();
  
  return await upsertLead(phone, lead);
}

/**
 * Get leads by status
 */
async function getLeadsByStatus(status) {
  const leads = await getAllLeads();
  return leads.filter(l => l.status === status);
}

/**
 * Get leads needing follow-up
 */
async function getLeadsNeedingFollowUp() {
  const leads = await getAllLeads();
  const now = new Date();
  
  return leads.filter(lead => {
    if (lead.status === 'converted' || lead.status === 'lost') return false;
    
    const lastContact = new Date(lead.lastContact);
    const hoursSinceContact = (now - lastContact) / (1000 * 60 * 60);
    
    // Follow up if no contact in 24 hours and status is new
    return hoursSinceContact > 24 && lead.status === 'new';
  });
}

/**
 * Get dashboard stats
 */
async function getDashboardStats() {
  const leads = await getAllLeads();
  const today = new Date().toDateString();
  
  const todayLeads = leads.filter(l => 
    new Date(l.createdAt).toDateString() === today
  );
  
  const appointments = leads.reduce((acc, l) => 
    acc + (l.appointments?.length || 0), 0
  );
  
  const converted = leads.filter(l => l.status === 'converted').length;
  
  return {
    totalLeads: leads.length,
    todayLeads: todayLeads.length,
    totalAppointments: appointments,
    convertedLeads: converted,
    activeConversations: leads.filter(l => l.status === 'active').length,
    needsFollowUp: (await getLeadsNeedingFollowUp()).length
  };
}

module.exports = {
  upsertLead,
  getLead,
  getAllLeads,
  updateLeadStatus,
  addConversation,
  getLeadsByStatus,
  getLeadsNeedingFollowUp,
  getDashboardStats
};