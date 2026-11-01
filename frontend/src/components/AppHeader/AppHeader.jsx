import Icon from '../Icon/Icon.jsx';
import './AppHeader.css';

const pageTitles = {
  overview: { eyebrow: 'TU CENTRO DE OPERACIONES', title: 'El código, bajo control.' },
  projects: { eyebrow: 'TU INVENTARIO', title: 'Proyectos' },
  vulnerabilities: { eyebrow: 'EL PANORAMA GLOBAL', title: 'Vulnerabilidades' },
  alerts: { eyebrow: 'COINCIDENCIAS EN TU STACK', title: 'Alertas activas' },
};

export default function AppHeader({ page, onRefresh, refreshing, onCreateProject, projectAction, apiConnected, loading }) {
  const heading = pageTitles[page] ?? pageTitles.overview;

  return (
    <header className="app-header">
      <div className="header-heading">
        <div className="eyebrow"><span className="eyebrow-mark" />{heading.eyebrow}</div>
        <h1>{heading.title}</h1>
      </div>
      <div className="header-actions">
        <div className="connection-indicator">
          <span className={`connection-dot ${apiConnected ? '' : loading ? 'is-connecting' : 'is-offline'}`} />
          <span>{loading ? 'Conectando API' : apiConnected ? 'API conectada' : 'API sin conexión'}</span>
        </div>
        <button
          className="button button-quiet header-refresh"
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          aria-label="Actualizar datos"
          title="Actualizar datos"
        >
          <Icon name="refresh" className={refreshing ? 'is-spinning' : ''} />
        </button>
        {projectAction && (
          <button className="button button-primary header-create" type="button" onClick={onCreateProject}>
            <Icon name="plus" size={16} />
            <span>Nuevo proyecto</span>
          </button>
        )}
      </div>
    </header>
  );
}
