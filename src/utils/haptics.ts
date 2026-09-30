/**
 * Haptic Feedback and Micro-Interaction Utility (Task #3)
 * Provides physical haptic vibration feedback for mobile and supported touch devices
 * during PIN inputs, quote confirmations, telematics switches, and action buttons.
 */

export type HapticFeedbackType = 
  | 'light' 
  | 'medium' 
  | 'heavy' 
  | 'selection' 
  | 'success' 
  | 'warning' 
  | 'error'
  | 'mechanicalClick'
  | 'successThump'
  | 'heavyShud';

export const triggerHaptic = (type: HapticFeedbackType = 'light'): void => {
  if (typeof window === 'undefined' || !('navigator' in window)) return;

  try {
    if ('vibrate' in navigator) {
      switch (type) {
        case 'mechanicalClick':
        case 'selection':
        case 'light':
          navigator.vibrate(12);
          break;
        case 'medium':
          navigator.vibrate(28);
          break;
        case 'heavyShud':
        case 'heavy':
          navigator.vibrate(50);
          break;
        case 'successThump':
        case 'success':
          navigator.vibrate([15, 60, 25]);
          break;
        case 'warning':
          navigator.vibrate([30, 80, 30]);
          break;
        case 'error':
          navigator.vibrate([50, 50, 50, 50, 70]);
          break;
        default:
          navigator.vibrate(15);
      }
    }
  } catch (err) {
    // Ignore unsupported browser / platform permissions silently
  }
};
