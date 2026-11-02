import { useEffect, useState } from 'react';
import AppHeader from './components/AppHeader/AppHeader.jsx';
import CreateProjectDialog from './components/CreateProjectDialog/CreateProjectDialog.jsx';
import Icon from './components/Icon/Icon.jsx';
import Sidebar from './components/Sidebar/Sidebar.jsx';
import AlertDetail from './pages/AlertDetail/AlertDetail.jsx';
import Alerts from './pages/Alerts/Alerts.jsx';
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import Projects from './pages/Projects/Projects.jsx';
import Vulnerabilities from './pages/Vulnerabilities/Vulnerabilities.jsx';
import Settings from './pages/Settings/Settings.jsx';
import { useLanguage } from './i18n/LanguageContext.jsx';
import { getAlertKey, getAlertHref, parseAppRoute } from './utils/alertRoutes.js';
import {
  addDependency,
  createProject,
  deleteProject,
  loadWorkspace,
  removeDependency,
  scanDependencies,
} from './utils/api.js';
import './styles/app.css';

const emptyData = {
  summary: { projectCount: 0, dependencyCount: 0, vulnerabilityCount: 0, activeAlertCount: 0 },
  projects: [],
  vulnerabilities: [],
  alerts: [],
  analysis: { scanned: false, upToDate: false, scannedAt: null, dependencyCount: 0, findingCount: 0 },
};

const pageComponents = {
  overview: Dashboard,
  projects: Projects,
  vulnerabilities: Vulnerabilities,
  alerts: Alerts,
  settings: Settings,
};

export default function App() {
  const { language, t } = useLanguage();
  const [route, setRoute] = useState(() => parseAppRoute(window.location.hash));
  const [data, setData] = useState(emptyData);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [translationWarning, setTranslationWarning] = useState(null);
  const [toast, setToast] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { page, alertKey } = route;

  function navigateToPage(nextPage) {
    window.history.pushState({ flawApp: true }, '', `#${nextPage}`);
    setRoute({ page: nextPage, alertKey: null });
  }

  function openAlert(alert) {
    window.history.pushState({ flawApp: true }, '', getAlertHref(alert));
    setRoute({ page: 'alert-detail', alertKey: getAlertKey(alert) });
  }

  function backToAlerts() {
    if (window.history.state?.flawApp) {
      window.history.back();
      return;
    }
    navigateToPage('alerts');
  }

  async function refreshWorkspace(showLoading = true) {
    if (showLoading) setRefreshing(true);

    try {
      const { translationWarning: workspaceTranslationWarning, ...workspace } = await loadWorkspace(language);
      setData(workspace);
      setTranslationWarning(workspaceTranslationWarning);
      setLoadError('');
      return workspace;
    } catch (error) {
      setLoadError(error.message);
      throw error;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    let active = true;

    setLoading(true);
    loadWorkspace(language)
      .then(({ translationWarning: workspaceTranslationWarning, ...workspace }) => {
        if (active) {
          setData(workspace);
          setTranslationWarning(workspaceTranslationWarning);
          setLoadError('');
        }
      })
      .catch((error) => { if (active) setLoadError(error.message); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [language]);

  useEffect(() => {
    function handlePopState() {
      setRoute(parseAppRoute(window.location.hash));
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  async function runMutation(action, successMessage) {
    try {
      await action();
      await refreshWorkspace(false);
      setToast({ type: 'success', message: successMessage });
    } catch (error) {
      setToast({ type: 'error', message: t(error.message) });
      throw error;
    }
  }

  async function runAnalysis() {
    setAnalyzing(true);
    try {
      const result = await scanDependencies();
      await refreshWorkspace(false);
      setToast({
        type: 'success',
        message: result.findingCount === 0
          ? t('Análisis completado: {dependencyCount} dependencias revisadas, sin coincidencias.', {
            dependencyCount: result.dependencyCount,
          })
          : t('Análisis completado: {findingCount} hallazgos en {dependencyCount} dependencias.', {
            findingCount: result.findingCount,
            dependencyCount: result.dependencyCount,
          }),
      });
    } catch (error) {
      setToast({ type: 'error', message: t(error.message) });
    } finally {
      setAnalyzing(false);
    }
  }

  const pageProps = {
    data,
    projects: data.projects,
    vulnerabilities: data.vulnerabilities,
    alerts: data.alerts,
    analysisStatus: data.analysis,
    onNavigate: navigateToPage,
    onSelectAlert: openAlert,
    onCreateProject: () => setCreateDialogOpen(true),
    onAddDependency: (projectId, dependency) =>
      runMutation(() => addDependency(projectId, dependency), t('Dependencia añadida a la vigilancia.')),
    onRemoveDependency: (projectId, dependencyId) =>
      runMutation(() => removeDependency(projectId, dependencyId), t('Dependencia eliminada de la vigilancia.')),
    onDeleteProject: (projectId) =>
      runMutation(() => deleteProject(projectId), t('Proyecto eliminado.')),
  };

  const Page = pageComponents[page] ?? Dashboard;
  const selectedAlert = alertKey
    ? data.alerts.find((alert) => getAlertKey(alert) === alertKey)
    : null;

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">{t('Saltar al contenido')}</a>
      <Sidebar
        activePage={page === 'alert-detail' ? 'alerts' : page}
        onNavigate={navigateToPage}
        alertCount={data.summary.activeAlertCount}
      />
      <main className="main-area" id="main-content">
        <div className="main-content">
          <AppHeader
            page={page}
            onRefresh={() => refreshWorkspace().catch(() => {})}
            refreshing={refreshing}
            onCreateProject={() => setCreateDialogOpen(true)}
            projectAction={page === 'projects'}
            onAnalyze={runAnalysis}
            analyzing={analyzing}
            canAnalyze={data.summary.dependencyCount > 0}
            apiConnected={!loadError}
            loading={loading}
          />

          {loadError && (
            <div className="connection-error" role="alert">
              <Icon name="alert" size={18} />
              <div><strong>{t('No podemos leer los datos de Flaw.')}</strong><span>{t(loadError)}</span></div>
              <button className="button button-quiet" type="button" onClick={() => refreshWorkspace().catch(() => {})} disabled={refreshing}>
                Reintentar
              </button>
            </div>
          )}

          {translationWarning && !loading && (
            <div className="translation-warning" role="status">
              <Icon name="alert" size={17} />
              <span>{t(translationWarning)}</span>
            </div>
          )}

          {loading ? (
            <div className="loading-state" role="status" aria-live="polite">
              <span className="loading-mark"><Icon name="code" size={22} /></span>
              <span>{t('Cargando y traduciendo los avisos de seguridad…')}</span>
            </div>
          ) : page === 'alert-detail' ? (
            <AlertDetail alert={selectedAlert} onBack={backToAlerts} />
          ) : (
            <Page {...pageProps} />
          )}

          {toast && (
            <div className={`toast toast-${toast.type}`} role={toast.type === 'error' ? 'alert' : 'status'} aria-live="polite">
              <Icon name={toast.type === 'error' ? 'alert' : 'check'} size={16} />
              <span>{toast.message}</span>
              <button type="button" onClick={() => setToast(null)} aria-label={t('Cerrar notificación')}>
                <Icon name="close" size={15} />
              </button>
            </div>
          )}
        </div>
      </main>

      {createDialogOpen && (
        <CreateProjectDialog
          onClose={() => setCreateDialogOpen(false)}
          onCreate={(project) => runMutation(() => createProject(project), t('Proyecto creado. Ya puedes añadir dependencias.'))}
        />
      )}
    </div>
  );
}
