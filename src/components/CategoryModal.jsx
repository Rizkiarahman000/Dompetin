import { useEffect, useState } from 'react'
import { X, Check } from 'lucide-react'
import CategoryIcon, { ICON_OPTIONS } from './CategoryIcon'

const PRESET_COLORS = [
  '#0b7a5b',
  '#1c7ed6',
  '#9c36b5',
  '#e8590c',
  '#f08c00',
  '#e03131',
  '#0ca678',
  '#7048e8',
  '#d6336c',
  '#495057',
]

export default function CategoryModal({ open, initial = null, onClose, onSubmit }) {
  const isEdit = Boolean(initial)
  const [form, setForm] = useState({ label: '', icon: 'Tag', color: '#0b7a5b' })
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    if (initial) {
      setForm({
        label: initial.label || '',
        icon: initial.icon || 'Tag',
        color: initial.color || '#0b7a5b',
      })
    } else {
      setForm({ label: '', icon: 'Tag', color: '#0b7a5b' })
    }
    setError('')
  }, [open, initial])

  if (!open) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.label.trim()) {
      setError('Nama kategori wajib diisi.')
      return
    }
    onSubmit({ ...form, label: form.label.trim() })
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? 'Edit kategori' : 'Tambah kategori'}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h3 className="modal-title">{isEdit ? 'Edit kategori' : 'Kategori baru'}</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Tutup">
            <X size={18} />
          </button>
        </div>

        <form className="tx-form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field-label">Nama kategori</span>
            <input
              type="text"
              maxLength={40}
              placeholder="mis. Kopi, Langganan, Transport"
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              autoFocus
            />
          </label>

          <div className="field">
            <span className="field-label">Ikon</span>
            <div className="icon-picker">
              {ICON_OPTIONS.map((name) => (
                <button
                  key={name}
                  type="button"
                  className={`icon-choice${form.icon === name ? ' is-active' : ''}`}
                  onClick={() => setForm((f) => ({ ...f, icon: name }))}
                  aria-label={name}
                  title={name}
                >
                  <CategoryIcon name={name} size={17} />
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <span className="field-label">Warna</span>
            <div className="color-picker">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`color-choice${form.color.toLowerCase() === c ? ' is-active' : ''}`}
                  style={{ background: c }}
                  onClick={() => setForm((f) => ({ ...f, color: c }))}
                  aria-label={`Warna ${c}`}
                />
              ))}
              <label className="color-custom" title="Warna lain">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                />
              </label>
            </div>
          </div>

          <div className="cat-preview">
            <span className="cat-ico" style={{ '--cat': form.color }}>
              <CategoryIcon name={form.icon} size={16} />
            </span>
            <span>{form.label.trim() || 'Pratinjau kategori'}</span>
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn btn--primary">
              <Check size={16} /> {isEdit ? 'Simpan perubahan' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
