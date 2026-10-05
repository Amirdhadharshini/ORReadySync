import { describe, it, expect, beforeEach } from 'vitest';
import { loadAuthUser, saveAuthUser, loadSessions, saveSessions, loadAlerts, saveAlerts, resetDemoState } from '../services/storageService';
import { INITIAL_SESSIONS, INITIAL_ALERTS } from '../data/mockData';

// Polyfill mock localStorage for node testing environment
const createMockLocalStorage = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
};

if (typeof globalThis.localStorage === 'undefined' || !globalThis.localStorage.clear) {
  // @ts-expect-error polyfilling localStorage
  globalThis.localStorage = createMockLocalStorage();
}

describe('storageService — Browser LocalStorage State Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads fallback pre-authenticated user when localStorage is empty', () => {
    const user = loadAuthUser();
    expect(user).not.toBeNull();
    expect(user?.email).toBe('director@orreadysync.demo');
  });

  it('saves and reloads custom AuthUser from localStorage', () => {
    const customUser = {
      email: 'test@orreadysync.demo',
      name: 'Test Coordinator',
      role: 'OR Coordinator',
      initials: 'TC'
    };
    saveAuthUser(customUser);
    const loaded = loadAuthUser();
    expect(loaded).toEqual(customUser);
  });

  it('loads INITIAL_SESSIONS fallback when no custom sessions stored', () => {
    const sessions = loadSessions();
    expect(sessions.length).toBe(INITIAL_SESSIONS.length);
    expect(sessions[0].id).toBe('SES-101');
  });

  it('saves and reloads modified sessions', () => {
    const modified = [...INITIAL_SESSIONS];
    modified[0] = { ...modified[0], readinessScore: 99 };
    saveSessions(modified);

    const reloaded = loadSessions();
    expect(reloaded[0].readinessScore).toBe(99);
  });

  it('saves and reloads modified alerts', () => {
    const modifiedAlerts = [...INITIAL_ALERTS];
    modifiedAlerts[0] = { ...modifiedAlerts[0], owner: 'Custom Biomedical Lead' };
    saveAlerts(modifiedAlerts);

    const reloaded = loadAlerts();
    expect(reloaded[0].owner).toBe('Custom Biomedical Lead');
  });

  it('resets demo state to initial defaults', () => {
    localStorage.setItem('or_readysync_sessions_v1', '[]');
    const reset = resetDemoState();
    expect(reset.sessions.length).toBe(INITIAL_SESSIONS.length);
    expect(reset.alerts.length).toBe(INITIAL_ALERTS.length);
  });
});
