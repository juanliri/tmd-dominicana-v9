import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  getStoredVaultState, 
  saveStoredVaultState, 
  registerPwaServiceWorker, 
  precacheAllTechnicalVault, 
  clearTechnicalVaultCache, 
  VaultState,
  CRITICAL_TECHNICAL_DATASHEETS,
  CRITICAL_PARTS_MANUALS
} from '../services/offlineVaultService';

interface OfflineSyncContextType {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  effectiveOnline: boolean;
  toggleSimulatedOffline: () => void;
  syncState: 'synced' | 'syncing' | 'offline_cached' | 'error';
  syncProgress: number;
  syncStatusLabel: string;
  vaultState: VaultState;
  isVaultModalOpen: boolean;
  openVaultModal: () => void;
  closeVaultModal: () => void;
  syncAllTechnicalVault: () => Promise<void>;
  clearVaultCache: () => Promise<void>;
  offlineQueueCount: number;
}

const OfflineSyncContext = createContext<OfflineSyncContextType | undefined>(undefined);

export const OfflineSyncProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [syncState, setSyncState] = useState<'synced' | 'syncing' | 'offline_cached' | 'error'>('synced');
  const [syncProgress, setSyncProgress] = useState<number>(100);
  const [syncStatusLabel, setSyncStatusLabel] = useState<string>('Bóveda 100% Sincronizada');
  const [vaultState, setVaultState] = useState<VaultState>(getStoredVaultState);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState<boolean>(false);
  const [offlineQueueCount, setOfflineQueueCount] = useState<number>(0);

  const effectiveOnline = isOnline && !isSimulatedOffline;

  // Register Service Worker on boot
  useEffect(() => {
    registerPwaServiceWorker();

    const handleOnline = () => {
      setIsOnline(true);
      if (!isSimulatedOffline) {
        setSyncState('synced');
        setSyncStatusLabel('Conexión Restaurada • Bóveda Sincronizada');
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncState('offline_cached');
      setSyncStatusLabel('Modo Mina Activo (Acceso Total a Bóveda Offline)');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial background precache verification
    const initialSync = async () => {
      const state = getStoredVaultState();
      if (!state.isFullyCached) {
        await precacheAllTechnicalVault();
        setVaultState(getStoredVaultState());
      }
    };
    initialSync();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isSimulatedOffline]);

  const toggleSimulatedOffline = () => {
    setIsSimulatedOffline((prev) => {
      const next = !prev;
      if (next) {
        setSyncState('offline_cached');
        setSyncStatusLabel('Modo Mina Simulado (Sin Señal Celular)');
      } else {
        setSyncState('synced');
        setSyncStatusLabel('Modo Online Restaurado');
      }
      return next;
    });
  };

  const syncAllTechnicalVault = async () => {
    setSyncState('syncing');
    setSyncProgress(0);
    setSyncStatusLabel('Iniciando precarga de fichas y manuales...');

    try {
      const newState = await precacheAllTechnicalVault((progress, label) => {
        setSyncProgress(progress);
        setSyncStatusLabel(`Precargando: ${label} (${progress}%)`);
      });

      setVaultState(newState);
      setSyncState(effectiveOnline ? 'synced' : 'offline_cached');
      setSyncProgress(100);
      setSyncStatusLabel('Bóveda Técnica 100% Precargada para Uso Offline');
    } catch (err) {
      console.error('Error syncing vault:', err);
      setSyncState('error');
      setSyncStatusLabel('Error al sincronizar bóveda');
    }
  };

  const clearVaultCache = async () => {
    await clearTechnicalVaultCache();
    setVaultState(getStoredVaultState());
    setSyncState('offline_cached');
    setSyncProgress(0);
    setSyncStatusLabel('Caché de bóveda técnica eliminada');
  };

  const openVaultModal = () => setIsVaultModalOpen(true);
  const closeVaultModal = () => setIsVaultModalOpen(false);

  return (
    <OfflineSyncContext.Provider
      value={{
        isOnline,
        isSimulatedOffline,
        effectiveOnline,
        toggleSimulatedOffline,
        syncState: effectiveOnline ? (syncState === 'offline_cached' ? 'synced' : syncState) : 'offline_cached',
        syncProgress,
        syncStatusLabel,
        vaultState,
        isVaultModalOpen,
        openVaultModal,
        closeVaultModal,
        syncAllTechnicalVault,
        clearVaultCache,
        offlineQueueCount
      }}
    >
      {children}
    </OfflineSyncContext.Provider>
  );
};

export const useOfflineSync = (): OfflineSyncContextType => {
  const context = useContext(OfflineSyncContext);
  if (!context) {
    throw new Error('useOfflineSync must be used within an OfflineSyncProvider');
  }
  return context;
};
