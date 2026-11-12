// ---------------------------------------------------------------------------
// storage.js — wrapper aman untuk localStorage.
// Semua data Dompetin disimpan lokal di perangkat, jadi aplikasi tetap
// berfungsi penuh saat offline (tidak butuh server).
// ---------------------------------------------------------------------------

const PREFIX = 'dompetin.'

export function readStore(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw == null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeStore(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeStore(key) {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    /* ignore */
  }
}

export default { readStore, writeStore, removeStore }
