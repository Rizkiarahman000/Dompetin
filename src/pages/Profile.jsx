import { useState } from 'react'
import {
  UserRound,
  IdCard,
  Users,
  Wallet,
  Database,
  Trash2,
  Smartphone,
  WifiOff,
} from 'lucide-react'
import ConfirmModal from '../components/ConfirmModal'
import { formatRupiah } from '../utils/format'

export default function Profile({ stats, onReset, notify }) {
  const [confirmReset, setConfirmReset] = useState(false)

  const handleReset = () => {
    onReset()
    setConfirmReset(false)
    notify('Semua data berhasil dihapus.')
  }

  return (
    <div className="page">
      <section className="page-head">
        <div>
          <h1 className="page-title">Profil</h1>
          <p className="page-sub">Identitas pemilik dompet & pengaturan aplikasi.</p>
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
                <Wallet size={16} /> Saldo
              </span>
              <strong>{formatRupiah(stats.balance)}</strong>
            </li>
            <li>
              <span>
                <Database size={16} /> Total transaksi
              </span>
              <strong>{stats.count}</strong>
            </li>
          </ul>
        </section>

        <section className="panel">
          <h2 className="panel-title">Tentang aplikasi</h2>
          <p className="muted">
            <strong>Dompetin v1.0.0</strong> — PWA pencatatan keuangan yang bisa dipasang dan
            dipakai offline.
          </p>
          <ul className="tag-list">
            <li>React 19</li>
            <li>Vite</li>
            <li>vite-plugin-pwa</li>
            <li>localStorage</li>
          </ul>
        </section>
      </div>

      <section className="panel">
        <h2 className="panel-title">
          <Smartphone size={16} /> Pasang ke perangkat
        </h2>
        <ol className="steps">
          <li>Buka aplikasi ini di browser (Chrome, Edge, atau Safari).</li>
          <li>
            Pilih menu <strong>Install</strong> / <strong>Tambahkan ke Layar Utama</strong>.
          </li>
          <li>
            Setelah terpasang, Dompetin tampil seperti aplikasi biasa — bisa dibuka bahkan
            saat offline.
          </li>
        </ol>
        <p className="hint">
          <WifiOff size={14} /> Semua catatan disimpan di perangkat ini, jadi tetap bisa
          dibuka tanpa internet.
        </p>
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
    </div>
  )
}
