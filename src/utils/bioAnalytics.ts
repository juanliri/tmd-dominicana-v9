/**
 * TMD Dominicana - Bio Link Lightweight Performance & Engagement Tracker
 * Logs user interactions, platform clicks, and lead actions to localStorage and console
 * for privacy-preserving client-side analytics without third-party telemetry bloat.
 */

export interface BioLinkEvent {
  id: string;
  name: string;
  category: 
    | 'social_link' 
    | 'quick_action' 
    | 'lead_inquiry' 
    | 'catalog_view' 
    | 'emergency_hotline' 
    | 'navigation'
    | 'career_application'
    | 'campaign_banner'
    | 'work_tools'
    | 'work_tools_item'
    | 'work_tools_rfq'
    | 'video_showcase'
    | 'sticky_action';
  timestamp: number;
  count: number;
  metadata?: Record<string, unknown>;
}

const STORAGE_KEY = 'tmd_bio_link_engagement';

export function getBioEngagementMetrics(): Record<string, BioLinkEvent> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.warn('[BioAnalytics] Error reading localStorage:', err);
    return {};
  }
}

export function trackBioLinkClick(
  name: string,
  category: BioLinkEvent['category'] = 'social_link',
  metadata?: Record<string, unknown>
): number {
  if (typeof window === 'undefined') return 0;
  try {
    const metrics = getBioEngagementMetrics();
    const currentEvent = metrics[name] || {
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
      name,
      category,
      timestamp: Date.now(),
      count: 0,
      metadata: {},
    };

    currentEvent.count += 1;
    currentEvent.timestamp = Date.now();
    if (metadata) {
      currentEvent.metadata = { ...currentEvent.metadata, ...metadata };
    }

    metrics[name] = currentEvent;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(metrics));

    // Structured developer console log for real-time verification
    console.info(
      `%c[TMD BioAnalytics]%c Click: %c${name}%c | Total: %c${currentEvent.count}%c | Category: ${category}`,
      'background: #f59e0b; color: #000; font-weight: bold; padding: 2px 5px; border-radius: 3px;',
      'color: #94a3b8; font-weight: normal;',
      'color: #38bdf8; font-weight: bold;',
      'color: #94a3b8;',
      'color: #4ade80; font-weight: bold;',
      'color: #94a3b8;'
    );

    return currentEvent.count;
  } catch (err) {
    console.error('[BioAnalytics] Failed to log engagement event:', err);
    return 0;
  }
}
