// src/services/api.js
import {
  INITIAL_STATS,
  VEHICLES,
  RECENT_ALERTS,
  AI_PREDICTIONS,
  TEMPERATURE_TREND_DATA,
  INVENTORY_ITEMS,
  COMPLIANCE_REPORTS,
  SYSTEM_USERS,
} from '../data/mockdata.js';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    return result.data !== undefined ? result.data : result;
  } catch (error) {
    console.warn(`[CryoGuard API Offline] fallback for ${endpoint}`);
    return null;
  }
}

export const api = {
  async getStats() { return (await request('/stats')) || INITIAL_STATS; },
  async getVehicles() { return (await request('/vehicles')) || VEHICLES; },
  async getAlerts() { return (await request('/alerts')) || RECENT_ALERTS; },
  async getInventory() { return (await request('/inventory')) || INVENTORY_ITEMS; },
  async getUsers() { return (await request('/users')) || SYSTEM_USERS; },
  async getReports() { return (await request('/reports')) || COMPLIANCE_REPORTS; },
  async getAiPrediction() { return (await request('/ai-prediction')) || AI_PREDICTIONS; },
  async getTemperatureTrend() { return (await request('/temperature-trend')) || TEMPERATURE_TREND_DATA; },
  async boostCooling(id) { return await request(`/vehicles/${id}/boost`, { method: 'POST' }); },
  async createShipment(data) { return await request('/shipments', { method: 'POST', body: JSON.stringify(data) }); },
  async acknowledgeAlert(id) { return await request(`/alerts/${id}/acknowledge`, { method: 'POST' }); },
  async resolveAlert(id) { return await request(`/alerts/${id}/resolve`, { method: 'POST' }); },
  async createInventoryBatch(data) { return await request('/inventory', { method: 'POST', body: JSON.stringify(data) }); },
  async createUser(data) { return await request('/users', { method: 'POST', body: JSON.stringify(data) }); },
};

export default api;