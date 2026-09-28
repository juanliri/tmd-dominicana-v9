import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Machine } from '../types';
import { MACHINES_DATA } from '../data/catalog';

interface ComparisonContextType {
  selectedMachineIds: string[];
  selectedMachines: Machine[];
  addMachineToCompare: (machineId: string) => boolean;
  removeMachineFromCompare: (machineId: string) => void;
  toggleMachineCompare: (machineId: string) => void;
  clearComparison: () => void;
  isComparing: (machineId: string) => boolean;
  isComparisonOpen: boolean;
  setIsComparisonOpen: (open: boolean) => void;
  openComparison: () => void;
  maxMachines: number;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

const STORAGE_KEY = 'tmd-comparison-machines';
const MAX_MACHINES = 4;

export const ComparisonProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedMachineIds, setSelectedMachineIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            // Purge legacy hardcoded default pair so it does not annoy existing users
            const isOldDefault = parsed.length === 2 && parsed.includes('jcb-3cx-eco') && parsed.includes('liugong-922e');
            if (isOldDefault) {
              localStorage.removeItem(STORAGE_KEY);
              return [];
            }
            return parsed.slice(0, MAX_MACHINES);
          }
        }
      } catch (e) {
        console.error('Error reading comparison from localStorage', e);
      }
    }
    // Clean default: empty, comparison table/bar should NEVER open on reload or by default
    return [];
  });

  const [isComparisonOpen, setIsComparisonOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedMachineIds));
    } catch (e) {
      console.error('Error saving comparison to localStorage', e);
    }
  }, [selectedMachineIds]);

  const selectedMachines = selectedMachineIds
    .map((id) => MACHINES_DATA.find((m) => m.id === id))
    .filter((m): m is Machine => Boolean(m));

  const addMachineToCompare = (machineId: string): boolean => {
    if (selectedMachineIds.includes(machineId)) return false;
    if (selectedMachineIds.length >= MAX_MACHINES) return false;

    setSelectedMachineIds((prev) => [...prev, machineId]);
    return true;
  };

  const removeMachineFromCompare = (machineId: string) => {
    setSelectedMachineIds((prev) => prev.filter((id) => id !== machineId));
  };

  const toggleMachineCompare = (machineId: string) => {
    if (selectedMachineIds.includes(machineId)) {
      removeMachineFromCompare(machineId);
    } else {
      if (selectedMachineIds.length < MAX_MACHINES) {
        addMachineToCompare(machineId);
      } else {
        // Automatically open modal so user sees they hit maximum
        setIsComparisonOpen(true);
      }
    }
  };

  const clearComparison = () => {
    setSelectedMachineIds([]);
  };

  const isComparing = (machineId: string): boolean => {
    return selectedMachineIds.includes(machineId);
  };

  const openComparison = () => {
    setIsComparisonOpen(true);
  };

  return (
    <ComparisonContext.Provider
      value={{
        selectedMachineIds,
        selectedMachines,
        addMachineToCompare,
        removeMachineFromCompare,
        toggleMachineCompare,
        clearComparison,
        isComparing,
        isComparisonOpen,
        setIsComparisonOpen,
        openComparison,
        maxMachines: MAX_MACHINES
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = (): ComparisonContextType => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
};
