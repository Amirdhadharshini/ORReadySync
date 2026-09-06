import type { TheatreSession, OperationalAlert, AuthUser } from '../types';
import { INITIAL_SESSIONS, INITIAL_ALERTS, DEMO_USERS } from '../data/mockData';

const SESSIONS_KEY = 'or_readysync_sessions_v1';
const ALERTS_KEY = 'or_readysync_alerts_v1';
const AUTH_KEY = 'or_readysync_auth_user_v1';

export function loadAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.email) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load auth user from localStorage', e);
  }
  // Default to pre-authenticated Chief OR Director if nothing stored
  return {
    email: DEMO_USERS[0].email,
    name: DEMO_USERS[0].name,
    role: DEMO_USERS[0].role,
    initials: DEMO_USERS[0].initials
  };
}

export function saveAuthUser(user: AuthUser | null): void {
  try {
    if (user) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  } catch (e) {
    console.error('Failed to save auth user to localStorage', e);
  }
}

export function loadSessions(): TheatreSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load sessions from localStorage', e);
  }
  return INITIAL_SESSIONS;
}

export function saveSessions(sessions: TheatreSession[]): void {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save sessions to localStorage', e);
  }
}

export function loadAlerts(): OperationalAlert[] {
  try {
    const raw = localStorage.getItem(ALERTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load alerts from localStorage', e);
  }
  return INITIAL_ALERTS;
}

export function saveAlerts(alerts: OperationalAlert[]): void {
  try {
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
  } catch (e) {
    console.error('Failed to save alerts to localStorage', e);
  }
}

export function resetDemoState(): { sessions: TheatreSession[]; alerts: OperationalAlert[] } {
  try {
    localStorage.removeItem(SESSIONS_KEY);
    localStorage.removeItem(ALERTS_KEY);
  } catch (e) {
    console.error('Failed to clear localStorage', e);
  }
  return {
    sessions: INITIAL_SESSIONS,
    alerts: INITIAL_ALERTS
  };
}
