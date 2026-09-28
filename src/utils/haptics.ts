/**
 * TMD Dominicana - Mobile Tactile Haptic Feedback Engine (Sprint 3 - Task #3)
 * Provides calibrated micro-vibrations for field tablets & mobile phones
 * during PIN pad input, cart actions, checkout verification, and emergency dispatch.
 */

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

export const triggerHaptic = (type: HapticType = 'light'): void => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return;

  try {
    if (typeof navigator.vibrate !== 'function') return;

    switch (type) {
      case 'selection':
      case 'light':
        // Crisp 12ms click for keypad numbers and tabs
        navigator.vibrate(12);
        break;

      case 'medium':
        // 28ms firm tap for action buttons
        navigator.vibrate(28);
        break;

      case 'heavy':
        // 50ms solid pulse for critical operations
        navigator.vibrate(50);
        break;

      case 'success':
        // Double positive pulse
        navigator.vibrate([15, 35, 25]);
        break;

      case 'warning':
        // Double alert pulse
        navigator.vibrate([35, 40, 35]);
        break;

      case 'error':
        // Triple error rejection buzz
        navigator.vibrate([50, 35, 50, 35, 60]);
        break;
    }
  } catch {
    // Silent fallback if vibration permissions or hardware are not present
  }
};
