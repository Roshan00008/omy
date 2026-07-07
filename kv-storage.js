/**
 * kv-storage.js
 * Unified storage interface - uses Vercel KV in production, local JSON file in development.
 * Fixes the Vercel ephemeral /tmp issue.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Detect environment
const IS_VERCEL = process.env.VERCEL === '1';
const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

// Local file fallback
const LOCAL_DATA_DIR = (() => {
  try {
    const testPath = path.join(__dirname, '.write_test');
    fs.writeFileSync(testPath, 'x');
    fs.unlinkSync(testPath);
    return __dirname;
  } catch (_) {
    return '/tmp';
  }
})();

const FAVORITES_FILE = path.join(LOCAL_DATA_DIR, 'favorites.json');
const SCHEDULED_USERS_FILE = path.join(LOCAL_DATA_DIR, 'scheduled_users.json');

async function kvRequest(endpoint, method = 'GET', body = null) {
  if (!KV_URL || !KV_TOKEN) return null;
  try {
    const res = await fetch(`${KV_URL}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${KV_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });
    if (!res.ok) return null;
    return res.json();
  } catch (_) {
    return null;
  }
}

// ─── Favorites ────────────────────────────────────────────────────────────────

export async function getFavorites(userId) {
  const key = `favorites:${userId}`;
  
  if (IS_VERCEL && KV_URL) {
    const data = await kvRequest(`/get/${encodeURIComponent(key)}`);
    return data?.result || [];
  }
  
  // Local file
  try {
    if (fs.existsSync(FAVORITES_FILE)) {
      const all = JSON.parse(fs.readFileSync(FAVORITES_FILE, 'utf8'));
      return all[String(userId)] || [];
    }
  } catch (_) {}
  return [];
}

export async function saveFavorite(userId, item) {
  const key = `favorites:${userId}`;
  const items = await getFavorites(userId);
  
  // Deduplicate by URL
  if (items.some(f => f.url === item.url)) return false;
  
  // Limit to 50
  if (items.length >= 50) items.shift();
  
  items.push({ ...item, savedAt: new Date().toISOString() });
  
  if (IS_VERCEL && KV_URL) {
    await kvRequest(`/set/${encodeURIComponent(key)}`, 'POST', items);
  } else {
    const all = {};
    try {
      if (fs.existsSync(FAVORITES_FILE)) {
        Object.assign(all, JSON.parse(fs.readFileSync(FAVORITES_FILE, 'utf8')));
      }
    } catch (_) {}
    all[String(userId)] = items;
    fs.writeFileSync(FAVORITES_FILE, JSON.stringify(all, null, 2));
  }
  return true;
}

export async function removeFavorite(userId, url) {
  const items = await getFavorites(userId);
  const before = items.length;
  const filtered = items.filter(f => f.url !== url);
  if (filtered.length === before) return false;
  
  const key = `favorites:${userId}`;
  if (IS_VERCEL && KV_URL) {
    await kvRequest(`/set/${encodeURIComponent(key)}`, 'POST', filtered);
  } else {
    const all = {};
    try {
      if (fs.existsSync(FAVORITES_FILE)) {
        Object.assign(all, JSON.parse(fs.readFileSync(FAVORITES_FILE, 'utf8')));
      }
    } catch (_) {}
    all[String(userId)] = filtered;
    fs.writeFileSync(FAVORITES_FILE, JSON.stringify(all, null, 2));
  }
  return true;
}

export async function clearFavorites(userId) {
  const key = `favorites:${userId}`;
  if (IS_VERCEL && KV_URL) {
    await kvRequest(`/delete/${encodeURIComponent(key)}`, 'DELETE');
  } else {
    const all = {};
    try {
      if (fs.existsSync(FAVORITES_FILE)) {
        Object.assign(all, JSON.parse(fs.readFileSync(FAVORITES_FILE, 'utf8')));
      }
    } catch (_) {}
    delete all[String(userId)];
    fs.writeFileSync(FAVORITES_FILE, JSON.stringify(all, null, 2));
  }
}

// ─── Scheduled Users (auto-send opt-in) ──────────────────────────────────────

export async function getScheduledUsers() {
  if (IS_VERCEL && KV_URL) {
    const data = await kvRequest('/get/scheduled_users');
    return data?.result || [];
  }
  try {
    if (fs.existsSync(SCHEDULED_USERS_FILE)) {
      return JSON.parse(fs.readFileSync(SCHEDULED_USERS_FILE, 'utf8'));
    }
  } catch (_) {}
  return [];
}

export async function addScheduledUser(userId, chatId, options = {}) {
  const users = await getScheduledUsers();
  const exists = users.find(u => u.userId === String(userId));
  if (exists) return false;
  
  users.push({
    userId: String(userId),
    chatId: String(chatId),
    time: options.time || '09:00', // IST
    timezone: options.timezone || 'Asia/Kolkata',
    enabled: true,
    addedAt: new Date().toISOString()
  });
  
  if (IS_VERCEL && KV_URL) {
    await kvRequest('/set/scheduled_users', 'POST', users);
  } else {
    fs.writeFileSync(SCHEDULED_USERS_FILE, JSON.stringify(users, null, 2));
  }
  return true;
}

export async function removeScheduledUser(userId) {
  let users = await getScheduledUsers();
  const before = users.length;
  users = users.filter(u => u.userId !== String(userId));
  if (users.length === before) return false;
  
  if (IS_VERCEL && KV_URL) {
    await kvRequest('/set/scheduled_users', 'POST', users);
  } else {
    fs.writeFileSync(SCHEDULED_USERS_FILE, JSON.stringify(users, null, 2));
  }
  return true;
}

export async function toggleScheduledUser(userId) {
  let users = await getScheduledUsers();
  const user = users.find(u => u.userId === String(userId));
  if (!user) return null;
  user.enabled = !user.enabled;
  
  if (IS_VERCEL && KV_URL) {
    await kvRequest('/set/scheduled_users', 'POST', users);
  } else {
    fs.writeFileSync(SCHEDULED_USERS_FILE, JSON.stringify(users, null, 2));
  }
  return user.enabled;
}

// ─── Generic KV helpers ──────────────────────────────────────────────────────

export async function kvGet(key) {
  if (IS_VERCEL && KV_URL) {
    const data = await kvRequest(`/get/${encodeURIComponent(key)}`);
    return data?.result;
  }
  return null;
}

export async function kvSet(key, value) {
  if (IS_VERCEL && KV_URL) {
    await kvRequest(`/set/${encodeURIComponent(key)}`, 'POST', value);
    return true;
  }
  return false;
}
