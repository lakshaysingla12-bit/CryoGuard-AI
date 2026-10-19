// src/services/api.js
// The same JSON Server is used by manager, worker and auditor dashboards.
const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
      ...options,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    if (response.status === 204) return null;
    const result = await response.json();
    return result.data !== undefined ? result.data : result;
  } catch (error) {
    console.warn(`[CryoGuard API unavailable] ${endpoint}`);
    return null;
  }
}

export const api = {
  async getStats() {
    const [vehicles, shipments, alerts] = await Promise.all([
      request('/vehicles'), request('/shipments'), request('/alerts'),
    ]);
    if (!vehicles || !shipments || !alerts) return null;
    return {
      vehicles,
      shipments,
      openAlerts: alerts.filter((alert) => !alert.resolved),
    };
  },
  async getVehicles() { return (await request('/vehicles')) || []; },
  async getShipments() { return (await request('/shipments')) || []; },
  async getAssignments() { return (await request('/assignments')) || []; },
  async getAlerts() { return (await request('/alerts')) || []; },
  async getInventory() {
    const [items, units] = await Promise.all([request('/inventoryItems'), request('/storageUnits')]);
    return items && units ? { items, units } : { items: [], units: [] };
  },
  async getUsers() { return (await request('/users')) || []; },
  async getReports() { return (await request('/reports')) || []; },
  async getAiPrediction() { return []; },
  async getTemperatureTrend() { return (await request('/temperatureReadings')) || []; },
  async boostCooling(id) { return await request(`/vehicles/${id}/boost`, { method: 'POST' }); },
  async createShipment(data) { return await request('/shipments', { method: 'POST', body: JSON.stringify(data) }); },
  async acknowledgeAlert(id) { return await request(`/alerts/${id}`, { method: 'PATCH', body: JSON.stringify({ acknowledged: true, resolved: true, status: 'resolved' }) }); },
  async resolveAlert(id) { return await request(`/alerts/${id}`, { method: 'PATCH', body: JSON.stringify({ resolved: true, status: 'resolved' }) }); },
  async createInventoryBatch(data) { return await request('/inventoryItems', { method: 'POST', body: JSON.stringify(data) }); },
  async createUser(data) { return await request('/users', { method: 'POST', body: JSON.stringify(data) }); },
};

export default api;
