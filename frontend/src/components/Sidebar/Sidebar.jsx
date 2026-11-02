import Icon from '../Icon/Icon.jsx';
import { useLanguage } from '../../i18n/LanguageContext.jsx';
import './Sidebar.css';

const navigation = [
  { id: 'overview', label: 'Resumen', icon: 'activity' },
  { id: 'projects', label: 'Proyectos', icon: 'box' },
  { id: 'vulnerabilities', label: 'Vulnerabilidades', icon: 'shield' },
  { id: 'alerts', label: 'Alertas', icon: 'alert' },
  { id: 'settings', label: 'Configuración', icon: 'settings' },
];

export default function Sidebar({ activePage, onNavigate, alertCount }) {
  const { t } = useLanguage();

  return (
    <aside className="sidebar">
      <a className="brand" href="#main-content" onClick={(event) => {
        event.preventDefault();
        onNavigate('overview');
      }} aria-label={t('Flaw, ir al resumen')}>
        <span className="brand-mark"><Icon name="code" size={21} /></span>
        <span className="brand-name">flaw<span>.</span></span>
        <span className="brand-edition">DEV / 01</span>
      </a>

      <div className="workspace-label">{t('TU ESPACIO')}</div>
      <nav className="side-nav" aria-label={t('Navegación principal')}>
        {navigation.map((item) => (
          <button
            className={`nav-item ${activePage === item.id ? 'is-active' : ''}`}
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            aria-current={activePage === item.id ? 'page' : undefined}
          >
            <Icon name={item.icon} size={18} />
            <span>{t(item.label)}</span>
            {item.id === 'alerts' && alertCount > 0 && (
              <span className="nav-count">{alertCount}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-terminal">
          <div className="terminal-topline">
            <span className="terminal-dot" />
            <span>flaw CLI</span>
            <span className="terminal-version">v0.1</span>
          </div>
          <p>{t('Tu código cambia.')}<br />{t('Tu seguridad también.')}</p>
          <div className="terminal-command"><span>$</span> flaw watch</div>
        </div>
        <div className="profile-chip">
          <span className="profile-avatar">N</span>
          <span><strong>Developer</strong><small>{t('Workspace personal')}</small></span>
          <span className="profile-dot" aria-label={t('Sesión activa')} />
        </div>
      </div>
    </aside>
  );
}
