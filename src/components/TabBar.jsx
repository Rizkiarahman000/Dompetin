import { NAV_ITEMS } from './navItems'

export default function TabBar({ tab, onNavigate }) {
  return (
    <nav className="tabbar" aria-label="Navigasi bawah">
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          className={`tabbar-item${tab === id ? ' is-active' : ''}`}
          onClick={() => onNavigate(id)}
          aria-current={tab === id ? 'page' : undefined}
        >
          <Icon size={21} strokeWidth={2} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
