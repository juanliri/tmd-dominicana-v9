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
  sendTestPushAlert: () => Promise<void>;
  checkMaintenanceReminders: (customFleet?: RegisteredEquipment[]) => Promise<AppNotification[]>;
  dismissToast: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Initial seed offers if database is clean
const INITIAL_DEMO_OFFERS: AppNotification[] = [
  {
    id: 'demo_offer_1',
    userId: 'all',
    title: '🚜 Tasa Especial de Leasing 7.9% con Banco Popular',
    body: 'Financia tu Retroexcavadora JCB 3CX o Excavadora LiuGong 922E con plazos hasta 60 meses y 90 días de gracia para el sector construcción en RD.',
    type: 'special_offer',
    offerCode: 'LEASING-POPULAR-2026',
    discountPercent: 12,
    validUntil: '31 de Marzo 2026',
    targetCategory: 'Maquinaria',
    actionUrl: '#/machinery',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'demo_offer_2',
    userId: 'all',
    title: '⚡ 15% OFF en Kit de Filtros Genuinos JCB & Donaldson',
    body: 'Aprovecha mantenimiento preventivo 500h con despacho inmediato a obras en Santo Domingo, Santiago y Punta Cana.',
    type: 'special_offer',
    offerCode: 'FILTROS-PRO-15',
    discountPercent: 15,
    validUntil: '15 de Abril 2026',
    targetCategory: 'Repuestos',
    actionUrl: '#/parts',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
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
      setNotifications(INITIAL_DEMO_OFFERS);
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
          // Filter: notifications for 'all' or specifically for current user
          if (data.userId === 'all' || (currentUser && data.userId === currentUser.uid)) {
            list.push({ ...data, id: docSnap.id });
          }
        });

        // Combine with fallback demo offers if collection is empty
        const finalNotifs = list.length > 0 ? list : INITIAL_DEMO_OFFERS;
        
        // Sort descending by date
        finalNotifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
        setNotifications(finalNotifs);
      },
      (error) => {
        // Fallback to local demo list on offline/perm restrictions
        setNotifications(INITIAL_DEMO_OFFERS);
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

  const markAsRead = useCallback(async (notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
    await serviceMarkAsRead(notificationId);
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    await serviceMarkAllRead(notifications);
  }, [notifications]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    await deleteNotificationRecord(notificationId);
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
