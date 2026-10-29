import type { SavedTrip } from '../types';

const KEY = 'travelease.trips.v1';

export function loadTrips(): SavedTrip[] {
  try {
    const raw = localStorage.getItem(KEY);
    const v = raw ? JSON.parse(raw) : [];
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function persistTrips(trips: SavedTrip[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(trips));
  } catch {
    /* storage full or blocked: ignore */
  }
}
