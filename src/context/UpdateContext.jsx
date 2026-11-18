import { createContext, useCallback, useContext } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

// ---------------------------------------------------------------------------
// UpdateContext — mengelola pembaruan service worker (PWA).
//
// Dengan registerType: 'prompt', service worker versi baru akan "menunggu".
// Halaman Profil menampilkan tombol:
//   - "Cek pembaruan"     → memanggil registration.update()
//   - "Perbarui sekarang" → updateServiceWorker(true), aktifkan SW baru + reload
// Jadi update bisa dipasang tanpa menghapus/meng-install ulang aplikasi.
// ---------------------------------------------------------------------------

const UpdateCtx = createContext(null)

export function UpdateProvider({ children }) {
  const {
    offlineReady: [offlineReady],
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      // Cek pembaruan berkala (tiap 30 menit) selama aplikasi terbuka.
      if (registration) {
        setInterval(() => {
          registration.update().catch(() => {})
        }, 30 * 60 * 1000)
      }
    },
    onRegisterError(error) {
      console.error('Gagal mendaftarkan service worker:', error)
    },
  })

  const checkForUpdate = useCallback(async () => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return { ok: false, reason: 'unsupported' }
    }
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (!registration) return { ok: false, reason: 'unregistered' }
      await registration.update()
      return { ok: true }
    } catch {
      return { ok: false, reason: 'error' }
    }
  }, [])

  const value = {
    offlineReady,
    needRefresh,
    updateServiceWorker,
    checkForUpdate,
    isSupported: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
  }

  return <UpdateCtx.Provider value={value}>{children}</UpdateCtx.Provider>
}

export function useUpdate() {
  const ctx = useContext(UpdateCtx)
  if (!ctx) throw new Error('useUpdate harus dipakai di dalam UpdateProvider')
  return ctx
}

export default UpdateCtx
