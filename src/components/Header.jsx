import { Wallet } from 'lucide-react'
import { NAV_ITEMS } from './navItems'

export default function Header({ tab, onNavigate }) {
  return (
    <header className="topbar">
      <div className="topbar-inner container">
        <button type="button" className="brand" onClick={() => onNavigate('home')} aria-label="Dompetin, ke beranda">
          <span className="brand-mark">
            <Wallet size={20} strokeWidth={2.2} />
          </span>
          <span className="brand-text">
            <strong>Dompetin</strong>
            <small>keuangan rapi</small>
          </span>
        </button>

        <nav className="nav nav--desktop" aria-label="Navigasi utama">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`nav-item${tab === id ? ' is-active' : ''}`}
              onClick={() => onNavigate(id)}
              aria-current={tab === id ? 'page' : undefined}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}
