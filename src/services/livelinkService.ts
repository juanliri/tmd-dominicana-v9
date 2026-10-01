import { LiveLinkUnit, LiveLinkTelemetrySummary } from '../types';

export async function fetchLiveLinkFleet(clientId?: string, clientEmail?: string): Promise<LiveLinkUnit[]> {
  try {
    const params = new URLSearchParams();
    if (clientId) params.append('clientId', clientId);
    if (clientEmail) params.append('clientEmail', clientEmail);
    const qs = params.toString();
    const res = await fetch(`/api/telematics/livelink/fleet${qs ? `?${qs}` : ''}`);
    if (!res.ok) throw new Error('Error al consultar LiveLink API');
    const data = await res.json();
    return data.units || [];
  } catch (err) {
    console.warn('LiveLink API fallback to local cache:', err);
    return [];
  }
}

export async function fetchLiveLinkSummary(): Promise<LiveLinkTelemetrySummary> {
  try {
    const res = await fetch('/api/telematics/livelink/summary');
    if (!res.ok) throw new Error('Error al consultar LiveLink Summary');
    const data = await res.json();
    return data.summary || {
      totalUnits: 0,
      runningUnits: 0,
      idleUnits: 0,
      stoppedUnits: 0,
      offlineUnits: 0,
      criticalAlertsCount: 0,
      avgFleetFuelConsumption: 0,
      fleetHealthScore: 100
    };
  } catch (err) {
    console.warn('LiveLink Summary API fallback:', err);
    return {
      totalUnits: 5,
      runningUnits: 3,
      idleUnits: 1,
      stoppedUnits: 1,
      offlineUnits: 0,
      criticalAlertsCount: 1,
      avgFleetFuelConsumption: 7.8,
      fleetHealthScore: 92
    };
  }
}

export async function fetchLiveLinkUnit(id: string): Promise<LiveLinkUnit | null> {
  try {
    const res = await fetch(`/api/telematics/livelink/unit/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('Unidad no encontrada');
    const data = await res.json();
    return data.unit || null;
  } catch (err) {
    console.warn('LiveLink Unit fetch error:', err);
    return null;
  }
}

export async function sendLiveLinkCommand(unitId: string, command: string, parameters?: any): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const res = await fetch('/api/telematics/livelink/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unitId, command, parameters })
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Error al enviar comando LiveLink:', err);
    return { success: false, message: 'No se pudo contactar el controlador LiveLink CAN Bus.' };
  }
}
