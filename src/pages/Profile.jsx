import { useState } from 'react'
import {
  UserRound,
  IdCard,
  Users,
  Wallet,
  CalendarDays,
  Trash2,
  Smartphone,
  WifiOff,
  Tags,
  Plus,
  Pencil,
  RefreshCw,
  DownloadCloud,
  Loader,
  CheckCircle2,
} from 'lucide-react'
import ConfirmModal from '../components/ConfirmModal'
import CategoryModal from '../components/CategoryModal'
import CategoryIcon from '../components/CategoryIcon'
import { useCategories } from '../context/CategoriesContext'
import { useUpdate } from '../context/UpdateContext'
import { formatRupiah } from '../utils/format'

export default function Profile({ stats, online = true, onReset, notify }) {
  const { addCategory, updateCategory, removeCategory, allFor } = useCategories()
  const {
    needRefresh,
    offlineReady,
    updateServiceWorker,
    checkForUpdate,
    isSupported,
  } = useUpdate()
  const [confirmReset, setConfirmReset] = useState(false)
  const [catEditor, setCatEditor] = useState(null)
  const [catToDelete, setCatToDelete] = useState(null)
  const [checkingUpdate, setCheckingUpdate] = useState(false)

  const handleUpdate = async () => {
    if (needRefresh) {
      const reg = await navigator.serviceWorker.getRegistration()
      if (reg?.waiting) {
        // Service worker baru menunggu → aktifkan lalu reload.
        updateServiceWorker(true)
      } else if (reg?.installing) {
        // Tunggu instalasi selesai, lalu aktifkan / reload.
        await new Promise((resolve) => {
          const worker = reg.installing
          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' || worker.state === 'redundant') resolve()
          })
        })
        if (reg.waiting) updateServiceWorker(true)
        else window.location.reload()
      } else {
        // Versi baru sudah aktif, cukup reload untuk memuat aset terbaru.
        window.location.reload()
      }
      return
    }
    setCheckingUpdate(true)
    const result = await checkForUpdate()
    setCheckingUpdate(false)
    if (!result.ok) {
      notify(
        result.reason === 'unsupported'
          ? 'Browser ini tidak mendukung pembaruan aplikasi.'
          : 'Gagal memeriksa pembaruan. Coba lagi saat online.',
      )
    } else {
      notify('Pemeriksaan selesai.')
    }
  }

  const handleReset = () => {
    onReset()
    setConfirmReset(false)
    notify('Semua data berhasil dihapus.')
  }

  const handleSubmitCategory = (data) => {
    if (catEditor?.initial) {
      updateCategory(catEditor.initial.id, data)
      notify('Kategori diperbarui.')
    } else {
      addCategory({ ...data, type: 'expense' })
      notify('Kategori ditambahkan.')
    }
    setCatEditor(null)
  }

  const handleDeleteCategory = () => {
    if (!catToDelete) return
    removeCategory(catToDelete.id)
    setCatToDelete(null)
    notify('Kategori dihapus.')
  }

  return (
    <div className="page">
      <section className="page-head">
        <div>
          <h1 className="page-title">Profil</h1>
          <p className="page-sub">Identitas pemilik & pengaturan aplikasi.</p>
          <span className={`conn-chip ${online ? 'is-online' : 'is-offline'}`}>
            <span className="conn-dot" />
            {online ? 'Terhubung ke Supabase' : 'Mode offline — data lokal'}
          </span>
        </div>
      </section>

      <section className="profile-hero">
        <div className="avatar">RR</div>
        <div className="profile-id">
          <h2>Rizkia Rahman</h2>
          <p className="profile-role">Mahasiswa · Praktikum Pemrograman Perangkat Bergerak</p>
          <div className="id-chips">
            <span className="id-chip">
              <IdCard size={14} /> NIM 21120124130086
            </span>
            <span className="id-chip">
              <Users size={14} /> Kelompok 21
            </span>
          </div>
        </div>
      </section>

      <section className="panel">
        <h2 className="panel-title">Identitas</h2>
        <ul className="info-list">
          <li>
            <span>
              <UserRound size={16} /> Nama
            </span>
            <strong>Rizkia Rahman</strong>
          </li>
          <li>
            <span>
              <IdCard size={16} /> NIM
            </span>
            <strong>21120124130086</strong>
          </li>
          <li>
            <span>
              <Users size={16} /> Kelompok
            </span>
            <strong>21</strong>
          </li>
        </ul>
      </section>

      <div className="cols">
        <section className="panel">
          <h2 className="panel-title">Ringkasan</h2>
          <ul className="info-list">
            <li>
              <span>
                <Wallet size={16} /> Total pengeluaran
              </span>
              <strong>{formatRupiah(stats.expense)}</strong>
            </li>
            <li>
              <span>
                <CalendarDays size={16} /> Bulan ini
              </span>
              <strong>{formatRupiah(stats.monthExpense)}</strong>
            </li>
          </ul>
        </section>

        <section className="panel">
          <h2 className="panel-title">Tentang aplikasi</h2>
          <p className="muted">
            <strong>Dompetin v1.0.0</strong> — PWA pencatatan pengeluaran yang bisa dipasang
            dan dipakai offline.
          </p>
          <ul className="tag-list">
            <li>React 19</li>
            <li>Vite</li>
            <li>vite-plugin-pwa</li>
            <li>Supabase</li>
            <li>localStorage cache</li>
          </ul>
        </section>
      </div>

      <section className="panel">
        <div className="panel-head">
          <h2 className="panel-title">
            <Tags size={16} /> Kategori pengeluaran
          </h2>
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={() => setCatEditor({ initial: null })}
          >
            <Plus size={14} /> Tambah
          </button>
        </div>
        <p className="muted" style={{ marginBottom: 12 }}>
          Kategori bawaan tidak bisa diubah. Kategori buatanmu bisa ditambah, diedit, dan
          dihapus.
        </p>
        <ul className="cat-list">
          {allFor('expense').map((c) => (
            <li key={c.id} className="cat-item">
              <span className="cat-ico" style={{ '--cat': c.color }}>
                <CategoryIcon name={c.icon} size={16} />
              </span>
              <span className="cat-label">{c.label}</span>
              {c.isCustom ? (
                <div className="cat-actions">
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => setCatEditor({ initial: c })}
                    aria-label={`Edit kategori ${c.label}`}
                    title="Edit kategori"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    className="icon-btn icon-btn--danger"
                    onClick={() => setCatToDelete(c)}
                    aria-label={`Hapus kategori ${c.label}`}
                    title="Hapus kategori"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <span className="cat-badge">bawaan</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h2 className="panel-title">
          <Smartphone size={16} /> Pasang ke perangkat
        </h2>
        <ol className="steps">
          <li>
            <strong>Android/desktop:</strong> buka di Chrome/Edge, lalu pilih{' '}
            <strong>Install</strong> / <strong>Pasang aplikasi</strong>.
          </li>
          <li>
            <strong>iPhone/iPad:</strong> buka di <strong>Safari</strong>, ketuk ikon{' '}
            <strong>Bagikan</strong> → <strong>Tambahkan ke Layar Utama</strong>.
          </li>
          <li>
            Setelah terpasang, Dompetin tampil seperti aplikasi biasa — bisa dibuka bahkan
            saat offline.
          </li>
        </ol>
        <p className="hint">
          <WifiOff size={14} /> Data disinkronkan ke Supabase, dengan salinan cache lokal
          sehingga aplikasi tetap bisa dibuka dan diubah meski tanpa internet.
        </p>
      </section>

      <section className="panel">
        <h2 className="panel-title">
          <RefreshCw size={16} /> Pembaruan aplikasi
        </h2>
        <p className="muted">
          {needRefresh
            ? 'Versi baru Dompetin tersedia. Perbarui langsung tanpa menghapus aplikasi.'
            : isSupported
              ? 'Cek pembaruan untuk memastikan kamu memakai versi terbaru.'
              : 'Browser ini tidak mendukung pembaruan aplikasi.'}
        </p>
        <div className="update-actions">
          <button
            type="button"
            className={`btn ${needRefresh ? 'btn--primary' : 'btn--outline'}`}
            onClick={handleUpdate}
            disabled={checkingUpdate || !isSupported}
          >
            {checkingUpdate ? (
              <>
                <Loader size={16} className="spin" /> Memeriksa…
              </>
            ) : needRefresh ? (
              <>
                <DownloadCloud size={16} /> Perbarui sekarang
              </>
            ) : (
              <>
                <RefreshCw size={16} /> Cek pembaruan
              </>
            )}
          </button>
          {offlineReady && (
            <span className="update-badge">
              <CheckCircle2 size={14} /> Siap offline
            </span>
          )}
        </div>
      </section>

      <section className="panel panel--danger">
        <h2 className="panel-title">
          <Trash2 size={16} /> Zona berbahaya
        </h2>
        <p className="muted">
          Menghapus seluruh transaksi dari perangkat ini. Tindakan ini tidak bisa dibatalkan.
        </p>
        <button type="button" className="btn btn--danger" onClick={() => setConfirmReset(true)}>
          <Trash2 size={16} /> Hapus semua data
        </button>
      </section>

      <ConfirmModal
        open={confirmReset}
        title="Hapus semua data?"
        message="Seluruh transaksi akan dihapus permanen dari perangkat ini."
        confirmLabel="Hapus semua"
        danger
        onConfirm={handleReset}
        onCancel={() => setConfirmReset(false)}
      />

      <CategoryModal
        open={Boolean(catEditor)}
        initial={catEditor?.initial || null}
        onClose={() => setCatEditor(null)}
        onSubmit={handleSubmitCategory}
      />

      <ConfirmModal
        open={Boolean(catToDelete)}
        title="Hapus kategori?"
        message={`Kategori "${catToDelete?.label}" akan dihapus. Transaksi lama yang memakainya akan tampil sebagai "Lainnya".`}
        confirmLabel="Hapus"
        danger
        onConfirm={handleDeleteCategory}
        onCancel={() => setCatToDelete(null)}
      />
    </div>
  )
}
