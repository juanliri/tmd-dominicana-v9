import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { AppNotification, NotificationType, PortalQuote } from '../types';

// Play a subtle high-tech acoustic chime for incoming alerts
export function playNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // First tone (amber pleasant note)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
    gain1.gain.setValueAtTime(0.08, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.35);

    // Second harmonic tone
    setTimeout(() => {
      try {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(880, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.15); // D6
        gain2.gain.setValueAtTime(0.06, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.4);
      } catch {
        // Ignore audio playback error if interrupted
      }
    }, 120);

    setTimeout(() => {
      try {
        ctx.close().catch(() => {});
      } catch {
        // ignore
      }
    }, 600);
  } catch (e) {
    // Audio context might be restricted before user interaction
    console.debug('Notification audio chime deferred:', e);
  }
}

// Request Push Notification Permission
export async function requestPushPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('Este navegador no soporta notificaciones push.');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted' && auth.currentUser) {
      await registerDeviceToken(auth.currentUser.uid);
    }
    return permission;
  } catch (error) {
    console.error('Error al solicitar permisos de notificación:', error);
    return 'denied';
  }
}

// Register browser device token in Firestore
export async function registerDeviceToken(userId: string): Promise<string | null> {
  try {
    // Generate a unique device installation identifier
    const deviceId = localStorage.getItem('tmd_fcm_device_id') || `web_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
    localStorage.setItem('tmd_fcm_device_id', deviceId);

    const tokenDocRef = doc(db, 'fcm_tokens', `${userId}_${deviceId.replace(/[^a-zA-Z0-9_-]/g, '_')}`);
    await setDoc(tokenDocRef, {
      userId,
      token: `fcm_token_device_${deviceId}`,
      platform: navigator.userAgent.includes('Mobile') ? 'mobile_web' : 'desktop_web',
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return deviceId;
  } catch (error) {
    console.warn('No se pudo registrar el token FCM en Firestore:', error);
    return null;
  }
}

// Show native browser notification if granted
export function showBrowserNotification(title: string, body: string, actionUrl: string = '#/portal') {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'tmd_alert_' + Date.now(),
        badge: '/favicon.ico',
      });

      notification.onclick = () => {
        window.focus();
        if (actionUrl) {
          window.location.hash = actionUrl.replace('#', '');
        }
        notification.close();
      };
    } catch (e) {
      console.warn('Native notification spawn prevented:', e);
    }
  }
}

// Create quote status change notification
export async function sendQuoteStatusNotification(quote: PortalQuote, newStatus: PortalQuote['status']) {
  if (!quote.clientId) return;

  const statusLabels: Record<PortalQuote['status'], { title: string; body: string }> = {
    submitted: {
      title: `Presupuesto ${quote.quoteNumber} Recibido`,
      body: `Hemos recibido su solicitud de presupuesto por ${quote.itemsSummary || 'maquinaria/repuestos'}. Nuestro equipo técnico está analizándola.`
    },
    in_review: {
      title: `Presupuesto ${quote.quoteNumber} En Revisión Técnica`,
      body: `Un asesor especialista en repuestos y maquinaria está validando la disponibilidad de entrega inmediata.`
    },
    approved: {
      title: `¡Presupuesto ${quote.quoteNumber} Aprobado! 🎉`,
      body: `Su solicitud oficial ha sido validada con condiciones de entrega preferenciales. Ingrese a su Portal para ver detalles.`
    },
    rejected: {
      title: `Actualización de Presupuesto ${quote.quoteNumber}`,
      body: `Se ha emitido una actualización técnica sobre su cotización. Comuníquese con su asesor para alternativas.`
    },
    draft: {
      title: `Borrador de Presupuesto Guardado`,
      body: `Su proforma ${quote.quoteNumber} está lista para ser enviada.`
    }
  };

  const info = statusLabels[newStatus] || {
    title: `Estado Actualizado: ${quote.quoteNumber}`,
    body: `El estado de su presupuesto ha cambiado a ${newStatus}.`
  };

  try {
    const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const notifRef = doc(db, 'notifications', notifId);

    const payload: AppNotification = {
      id: notifId,
      userId: quote.clientId,
      title: info.title,
      body: info.body,
      type: 'quote_status',
      quoteId: quote.id,
      quoteNumber: quote.quoteNumber,
      actionUrl: '#/portal',
      isRead: false,
      createdAt: new Date().toISOString()
    };

    await setDoc(notifRef, payload);
    return payload;
  } catch (error) {
    console.error('Error al emitir notificación de presupuesto:', error);
  }
}

// Broadcast special offer to all users
export async function broadcastSpecialOffer(params: {
  title: string;
  body: string;
  offerCode?: string;
  discountPercent?: number;
  validUntil?: string;
  targetCategory?: string;
  actionUrl?: string;
}) {
  try {
    const notifId = `offer_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const notifRef = doc(db, 'notifications', notifId);

    const payload: AppNotification = {
      id: notifId,
      userId: 'all', // Broadcast to all registered contractors/clients
      title: params.title,
      body: params.body,
      type: 'special_offer',
      offerCode: params.offerCode || 'TMD-PROMO',
      discountPercent: params.discountPercent,
      validUntil: params.validUntil || 'Fin de Mes',
      targetCategory: params.targetCategory || 'Maquinaria y Repuestos',
      actionUrl: params.actionUrl || '#/machinery',
      isRead: false,
      createdAt: new Date().toISOString()
    };

    await setDoc(notifRef, payload);
    return payload;
  } catch (error) {
    console.error('Error al emitir oferta especial:', error);
    throw error;
  }
}

// Create maintenance due reminder notification (< 100 hours remaining)
export async function sendMaintenanceReminderNotification(
  equipment: {
    id: string;
    unitId: string;
    brand: string;
    model: string;
    serialNumber: string;
    currentHorometer: number;
    nextServiceHours: number;
  },
  userId: string,
  userProfile?: { displayName?: string; companyName?: string } | null
): Promise<AppNotification | null> {
  if (!userId) return null;

  const hoursRemaining = equipment.nextServiceHours - equipment.currentHorometer;
  const isOverdue = hoursRemaining <= 0;
  
  // Recommend service package based on next service hours
  let serviceTypeRecommended = 'Mantenimiento Preventivo 500h';
  if (equipment.nextServiceHours % 1000 === 0) {
    serviceTypeRecommended = 'Mantenimiento Mayor 1,000h (Filtros + Aceites Hidráulicos & Motor)';
  } else if (equipment.nextServiceHours % 500 === 0) {
    serviceTypeRecommended = 'Mantenimiento Preventivo 500h (Kits Filtros Genuinos + Diagnóstico)';
  } else if (equipment.nextServiceHours % 250 === 0) {
    serviceTypeRecommended = 'Inspección Rutinaria 250h (Engrase & Filtro Motor)';
  }

  const title = isOverdue
    ? `🚨 ¡Servicio Vencido!: ${equipment.unitId} (${equipment.model})`
    : `⚠️ Alerta de Mantenimiento (<100h): ${equipment.unitId} (${equipment.model})`;

  const body = isOverdue
    ? `Su equipo ${equipment.unitId} ha alcanzado ${equipment.currentHorometer.toLocaleString()} hrs (Vencido por ${Math.abs(hoursRemaining)} hrs). Agende Taller Móvil TMD de inmediato para mantener garantía oficial.`
    : `Faltan solo ${hoursRemaining} horas operativas para el próximo servicio programado a las ${equipment.nextServiceHours.toLocaleString()} hrs. Recomendado: ${serviceTypeRecommended}.`;

  try {
    // Unique deterministic or timestamped ID for this threshold to avoid duplicate spam
    const notifId = `maint_${userId}_${equipment.id}_${equipment.nextServiceHours}`;
    const notifRef = doc(db, 'notifications', notifId);

    const payload: AppNotification = {
      id: notifId,
      userId: userId,
      title,
      body,
      type: 'maintenance_due',
      equipmentId: equipment.id,
      equipmentUnitId: equipment.unitId,
      equipmentModel: equipment.model,
      currentHorometer: equipment.currentHorometer,
      nextServiceHours: equipment.nextServiceHours,
      hoursRemaining: hoursRemaining,
      serviceTypeRecommended,
      actionUrl: '#/portal',
      isRead: false,
      createdAt: new Date().toISOString()
    };

    await setDoc(notifRef, payload, { merge: true });

    // Also notify via browser and sound
    showBrowserNotification(title, body, '#/portal');
    playNotificationSound();

    return payload;
  } catch (error) {
    console.error('Error al emitir recordatorio de mantenimiento:', error);
    return null;
  }
}

// Bulk evaluate fleet and trigger reminders for machinery needing service in < 100 hours
export async function checkAndTriggerFleetMaintenanceReminders(
  fleet: Array<{
    id: string;
    unitId: string;
    brand: string;
    model: string;
    serialNumber: string;
    currentHorometer: number;
    nextServiceHours: number;
    reminderThresholdHours?: number;
    status?: string;
  }>,
  userId: string,
  userProfile?: { displayName?: string; companyName?: string; maintenanceAlertsEnabled?: boolean; maintenanceReminderThresholdHours?: number } | null
): Promise<AppNotification[]> {
  if (!userId || !fleet || fleet.length === 0) return [];
  if (userProfile?.maintenanceAlertsEnabled === false) return [];

  const threshold = userProfile?.maintenanceReminderThresholdHours || 100;
  const triggered: AppNotification[] = [];

  for (const machine of fleet) {
    if (machine.status === 'retired') continue;

    const remaining = machine.nextServiceHours - machine.currentHorometer;
    const machineThreshold = machine.reminderThresholdHours || threshold;

    if (remaining <= machineThreshold) {
      const notif = await sendMaintenanceReminderNotification(machine, userId, userProfile);
      if (notif) {
        triggered.push(notif);
      }
    }
  }

  return triggered;
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string) {
  try {
    const ref = doc(db, 'notifications', notificationId);
    await updateDoc(ref, { isRead: true });
  } catch (error) {
    console.warn('Error marking notification read in Firestore:', error);
  }
}

// Mark all as read for current user
export async function markAllNotificationsAsRead(notifications: AppNotification[]) {
  try {
    const unread = notifications.filter(n => !n.isRead);
    for (const notif of unread) {
      await markNotificationAsRead(notif.id);
    }
  } catch (error) {
    console.warn('Error marking all notifications read:', error);
  }
}

// Delete notification
export async function deleteNotificationRecord(notificationId: string) {
  try {
    const ref = doc(db, 'notifications', notificationId);
    await deleteDoc(ref);
  } catch (error) {
    console.warn('Error deleting notification:', error);
  }
}
