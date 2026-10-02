import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { AppNotification } from '../types';
import { 
  requestPushPermission, 
  registerDeviceToken, 
  showBrowserNotification, 
  playNotificationSound,
  markNotificationAsRead as serviceMarkAsRead,
  markAllNotificationsAsRead as serviceMarkAllRead,
  deleteNotificationRecord,
  broadcastSpecialOffer as serviceBroadcastOffer,
  checkAndTriggerFleetMaintenanceReminders
} from '../services/notificationService';
import { getLocalFleet } from '../services/serviceHistoryService';
import { RegisteredEquipment } from '../types';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  pushPermission: NotificationPermission;
  isNotificationPanelOpen: boolean;
  activeToast: AppNotification | null;
  activeToasts: AppNotification[];
  pushToast: (toast: Partial<AppNotification> & { title: string; body: string }) => void;
  dismissToastById: (id: string) => void;
  dismissAllToasts: () => void;
  requestPermission: () => Promise<NotificationPermission>;
  openNotificationPanel: () => void;
  closeNotificationPanel: () => void;
  toggleNotificationPanel: () => void;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  broadcastOffer: (params: {
    title: string;
    body: string;
    offerCode?: string;
    discountPercent?: number;
    validUntil?: string;
    targetCategory?: string;
    actionUrl?: string;
  }) => Promise<AppNotification>;
  addNotification: (params: {
    title: string;
    body: string;
    type?: import('../types').NotificationType;
    quoteId?: string;
    quoteNumber?: string;
    actionUrl?: string;
    userId?: string;
  }) => AppNotification;
  sendTestPushAlert: () => Promise<void>;
  checkMaintenanceReminders: (customFleet?: RegisteredEquipment[]) => Promise<AppNotification[]>;
  dismissToast: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Initial realistic seed notifications for active clients
const getInitialNotifications = (userId?: string): AppNotification[] => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('tmd_live_notifications');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
  }

  return [
    {
      id: 'notif_init_1',
      userId: userId || 'all',
      title: '🚜 Cotización QT-2026-8841 Lista para Despacho',
      body: 'Tu cotización para Retroexcavadora JCB 3CX Eco está confirmada. Puedes descargar la orden y coordinar retiro en Patio Km 22.',
      type: 'quote_status',
      quoteNumber: 'QT-2026-8841',
      actionUrl: '#/portal',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'notif_init_2',
      userId: userId || 'all',
      title: '🔧 Mantenimiento Preventivo Sugerido',
      body: 'La unidad JCB 3CX Eco se acerca a las 500 horas de operación. Puedes agendar revisión técnica en taller o servicio móvil en obra.',
      type: 'maintenance_due',
      actionUrl: '#/portal',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
    },
    {
      id: 'notif_init_3',
      userId: userId || 'all',
      title: '⭐ Puntos Club Pro Acreditados',
      body: 'Has acumulado +500 puntos TMD Pro. Tienes 1,850 puntos canjeables en filtros y repuestos genuinos.',
      type: 'special_offer',
      actionUrl: '#/portal',
      isRead: true,
      createdAt: new Date(Date.now() - 3600000 * 28).toISOString()
    }
  ];
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>(() => getInitialNotifications(currentUser?.uid));
  const [pushPermission, setPushPermission] = useState<NotificationPermission>(() => {
    return 'Notification' in window ? Notification.permission : 'denied';
  });
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [activeToasts, setActiveToasts] = useState<AppNotification[]>([]);
  const isFirstMount = useRef(true);

  // Derive activeToast for backwards compatibility
  const activeToast = activeToasts.length > 0 ? activeToasts[0] : null;

  // Sync Push Permission State
  useEffect(() => {
    if ('Notification' in window) {
      setPushPermission(Notification.permission);
    }
  }, []);

  // Register FCM device token when user logs in and permission is granted
  useEffect(() => {
    if (currentUser && pushPermission === 'granted') {
      registerDeviceToken(currentUser.uid);
    }
  }, [currentUser, pushPermission]);

  // Firestore Real-Time Listener (Only for authenticated users per security rules)
  useEffect(() => {
    if (!currentUser) {
      setNotifications(getInitialNotifications());
      return;
    }

    const notifsColRef = collection(db, 'notifications');
    const q = query(notifsColRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: AppNotification[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as AppNotification;
          if (data.userId === 'all' || (currentUser && data.userId === currentUser.uid)) {
            list.push({ ...data, id: docSnap.id });
          }
        });

        // Combine with stored local notifications
        const localList = getInitialNotifications(currentUser.uid);
        const combined = [...list];
        for (const loc of localList) {
          if (!combined.some(c => c.id === loc.id)) {
            combined.push(loc);
          }
        }

        // Sort descending by date
        combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // Check for newly added unread notifications to trigger push/toast/sound
        if (!isFirstMount.current && list.length > 0) {
          const latest = list[0];
          if (!latest.isRead) {
            playNotificationSound();
            showBrowserNotification(latest.title, latest.body, latest.actionUrl);
            setActiveToasts(prev => [latest, ...prev.filter(t => t.id !== latest.id)].slice(0, 4));
          }
        }

        isFirstMount.current = false;
        setNotifications(combined);
      },
      (error) => {
        // Fallback to local persistent list on offline/perm restrictions
        setNotifications(getInitialNotifications(currentUser.uid));
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const requestPermission = useCallback(async () => {
    const res = await requestPushPermission();
    setPushPermission(res);
    return res;
  }, []);

  const openNotificationPanel = useCallback(() => setIsNotificationPanelOpen(true), []);
  const closeNotificationPanel = useCallback(() => setIsNotificationPanelOpen(false), []);
  const toggleNotificationPanel = useCallback(() => setIsNotificationPanelOpen(prev => !prev), []);

  const addNotification = useCallback((params: {
    title: string;
    body: string;
    type?: import('../types').NotificationType;
    quoteId?: string;
    quoteNumber?: string;
    actionUrl?: string;
    userId?: string;
  }): AppNotification => {
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: params.userId || currentUser?.uid || 'all',
      title: params.title,
      body: params.body,
      type: params.type || 'quote_status',
      quoteId: params.quoteId,
      quoteNumber: params.quoteNumber,
      actionUrl: params.actionUrl || '#/portal',
      isRead: false,
      createdAt: new Date().toISOString()
    };

    setNotifications(prev => {
      const updated = [newNotif, ...prev.filter(n => n.id !== newNotif.id)];
      try {
        localStorage.setItem('tmd_live_notifications', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    setActiveToasts(prev => [newNotif, ...prev.slice(0, 3)]);
    playNotificationSound();
    showBrowserNotification(newNotif.title, newNotif.body, newNotif.actionUrl);

    return newNotif;
  }, [currentUser]);

  const markAsRead = useCallback(async (notificationId: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n);
      try {
        localStorage.setItem('tmd_live_notifications', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    try {
      await serviceMarkAsRead(notificationId);
    } catch {
      // non-blocking
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, isRead: true }));
      try {
        localStorage.setItem('tmd_live_notifications', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    try {
      await serviceMarkAllRead(notifications);
    } catch {
      // non-blocking
    }
  }, [notifications]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    setNotifications(prev => {
      const filtered = prev.filter(n => n.id !== notificationId);
      try {
        localStorage.setItem('tmd_live_notifications', JSON.stringify(filtered));
      } catch {
        // ignore
      }
      return filtered;
    });
    try {
      await deleteNotificationRecord(notificationId);
    } catch {
      // non-blocking
    }
  }, []);

  const broadcastOffer = useCallback(async (params: {
    title: string;
    body: string;
    offerCode?: string;
    discountPercent?: number;
    validUntil?: string;
    targetCategory?: string;
    actionUrl?: string;
  }) => {
    return await serviceBroadcastOffer(params);
  }, []);

  const checkMaintenanceReminders = useCallback(async (customFleet?: RegisteredEquipment[]): Promise<AppNotification[]> => {
    if (!currentUser) return [];
    try {
      const fleet = customFleet || getLocalFleet();
      if (fleet.length === 0) return [];
      const triggered = await checkAndTriggerFleetMaintenanceReminders(fleet, currentUser.uid);
      if (triggered.length > 0) {
        setActiveToasts(prev => [...triggered, ...prev].slice(0, 4));
      }
      return triggered;
    } catch (e) {
      console.warn('Error evaluating fleet maintenance reminders:', e);
      return [];
    }
  }, [currentUser]);

  // Automatically check maintenance intervals on user login
  useEffect(() => {
    if (currentUser) {
      const timer = setTimeout(() => {
        checkMaintenanceReminders();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentUser, checkMaintenanceReminders]);

  const pushToast = useCallback((toastData: Partial<AppNotification> & { title: string; body: string }) => {
    const newToast: AppNotification = {
      id: toastData.id || `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: toastData.userId || currentUser?.uid || 'all',
      title: toastData.title,
      body: toastData.body,
      type: toastData.type || 'system',
      offerCode: toastData.offerCode,
      discountPercent: toastData.discountPercent,
      validUntil: toastData.validUntil,
      targetCategory: toastData.targetCategory,
      actionUrl: toastData.actionUrl,
      isRead: false,
      createdAt: toastData.createdAt || new Date().toISOString()
    };
    playNotificationSound();
    setActiveToasts(prev => [newToast, ...prev.filter(t => t.id !== newToast.id)].slice(0, 4));
  }, [currentUser]);

  const dismissToastById = useCallback((id: string) => {
    setActiveToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const dismissAllToasts = useCallback(() => {
    setActiveToasts([]);
  }, []);

  const sendTestPushAlert = useCallback(async () => {
    const testNotif: AppNotification = {
      id: `test_${Date.now()}`,
      userId: currentUser?.uid || 'all',
      title: '🔔 Alerta Telemática J1939: TMD Dominicana',
      body: 'Sensor SPN 110: Monitoreo activo de temperatura y presión hidráulica en tiempo real.',
      type: 'system',
      isRead: false,
      createdAt: new Date().toISOString()
    };

    playNotificationSound();
    showBrowserNotification(testNotif.title, testNotif.body);
    setActiveToasts(prev => [testNotif, ...prev].slice(0, 4));
  }, [currentUser]);

  const dismissToast = useCallback(() => {
    setActiveToasts(prev => prev.slice(1));
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        pushPermission,
        isNotificationPanelOpen,
        activeToast,
        activeToasts,
        pushToast,
        dismissToastById,
        dismissAllToasts,
        requestPermission,
        openNotificationPanel,
        closeNotificationPanel,
        toggleNotificationPanel,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        broadcastOffer,
        sendTestPushAlert,
        checkMaintenanceReminders,
        dismissToast
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
