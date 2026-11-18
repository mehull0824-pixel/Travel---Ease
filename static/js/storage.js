const KEY = 'travelease.trips.v1';

export function loadTrips() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function persistTrips(trips) {
  try {
    localStorage.setItem(KEY, JSON.stringify(trips));
  } catch {
    /* storage full or blocked: ignore */
  }
}
