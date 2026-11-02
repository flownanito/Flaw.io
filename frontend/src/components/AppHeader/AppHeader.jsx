import Icon from '../Icon/Icon.jsx';
import { useLanguage } from '../../i18n/LanguageContext.jsx';
import './AppHeader.css';

const pageTitles = {
  overview: { eyebrow: 'TU CENTRO DE OPERACIONES', title: 'El código, bajo control.' },
  projects: { eyebrow: 'TU INVENTARIO', title: 'Proyectos' },
  vulnerabilities: { eyebrow: 'EL PANORAMA GLOBAL', title: 'Vulnerabilidades' },
  alerts: { eyebrow: 'COINCIDENCIAS EN TU STACK', title: 'Alertas activas' },
  'alert-detail': { eyebrow: 'INFORME DE SEGURIDAD', title: 'Detalle de vulnerabilidad' },
  settings: { eyebrow: 'AJUSTES', title: 'Preferencias de la aplicación' },
};

export default function AppHeader({
  page,
  onRefresh,
  refreshing,
  onCreateProject,
  projectAction,
  onAnalyze,
  analyzing,
  canAnalyze,
  apiConnected,
  loading,
}) {
  const { t } = useLanguage();
  const heading = pageTitles[page] ?? pageTitles.overview;

  return (
    <header className="app-header">
      <div className="header-heading">
        <div className="eyebrow"><span className="eyebrow-mark" />{t(heading.eyebrow)}</div>
        <h1>{t(heading.title)}</h1>
      </div>
      <div className="header-actions">
        <div className="connection-indicator">
          <span className={`connection-dot ${apiConnected ? '' : loading ? 'is-connecting' : 'is-offline'}`} />
          <span>{loading ? t('Conectando API') : apiConnected ? t('API conectada') : t('API sin conexión')}</span>
        </div>
        <button
          className="button button-quiet header-refresh"
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          aria-label={t('Actualizar datos')}
          title={t('Actualizar datos')}
        >
          <Icon name="refresh" className={refreshing ? 'is-spinning' : ''} />
        </button>
        <button
          className="button button-primary header-analyze"
          type="button"
          onClick={onAnalyze}
          disabled={!canAnalyze || analyzing || loading}
          title={t(canAnalyze ? 'Consultar OSV para las dependencias registradas' : 'Añade dependencias para iniciar el análisis')}
        >
          <Icon name={analyzing ? 'refresh' : 'scan'} className={analyzing ? 'is-spinning' : ''} size={16} />
          <span>{analyzing ? t('Analizando…') : t('Analizar')}</span>
        </button>
        {projectAction && (
          <button className="button button-primary header-create" type="button" onClick={onCreateProject}>
            <Icon name="plus" size={16} />
            <span>{t('Nuevo proyecto')}</span>
          </button>
        )}
      </div>
    </header>
  );
}
