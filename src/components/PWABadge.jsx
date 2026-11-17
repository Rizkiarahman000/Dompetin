import { useState, useEffect } from 'react'
import { Download, WifiOff, X, Share2 } from 'lucide-react'
import { isIOS, isStandalone } from '../utils/platform'

/**
 * PWABadge — banner install PWA + indikator status offline.
 *
 * Android/desktop: memakai event beforeinstallprompt.
 * iOS: tidak ada beforeinstallprompt, jadi tampilkan petunjuk
 * "Bagikan → Tambahkan ke Layar Utama" (hanya di Safari, belum standalone).
 */
export default function PWABadge() {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [installed, setInstalled] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [ios] = useState(isIOS)
  const [standalone] = useState(isStandalone)

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
    }
    const handleAppInstalled = () => {
      setInstalled(true)
      setInstallPrompt(null)
    }
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setInstallPrompt(null)
  }

  if (dismissed) return null

  if (isOffline) {
    return (
      <aside className="pwa-badge pwa-badge--offline" role="status" aria-live="polite">
        <WifiOff size={16} />
        <span>Mode offline aktif — data lokal tetap bisa dibaca & diubah.</span>
      </aside>
    )
  }

  if (installPrompt && !installed) {
    return (
      <aside className="pwa-badge" role="region" aria-label="Pasang aplikasi">
        <div className="pwa-badge-content">
          <Download size={16} className="pwa-badge-icon" />
          <span>
            Pasang <strong>Dompetin</strong> untuk akses instan & offline.
          </span>
        </div>
        <div className="pwa-badge-actions">
          <button type="button" className="btn btn--primary btn--sm" onClick={handleInstallClick}>
            Pasang
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setDismissed(true)}
            aria-label="Tutup banner"
          >
            <X size={14} />
          </button>
        </div>
      </aside>
    )
  }

  // iOS: tidak ada prompt bawaan — beri petunjuk manual.
  if (ios && !standalone && !installed) {
    return (
      <aside className="pwa-badge" role="region" aria-label="Pasang aplikasi di iOS">
        <div className="pwa-badge-content">
          <Share2 size={16} className="pwa-badge-icon" />
          <span>
            Pasang di iPhone/iPad: ketuk <strong>Bagikan</strong> →{' '}
            <strong>Tambahkan ke Layar Utama</strong>.
          </span>
        </div>
        <div className="pwa-badge-actions">
          <button
            type="button"
            className="icon-btn"
            onClick={() => setDismissed(true)}
            aria-label="Tutup banner"
          >
            <X size={14} />
          </button>
        </div>
      </aside>
    )
  }

  return null
}
