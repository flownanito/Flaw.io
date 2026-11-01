import { useEffect, useState } from 'react';
import AppHeader from './components/AppHeader/AppHeader.jsx';
import CreateProjectDialog from './components/CreateProjectDialog/CreateProjectDialog.jsx';
import Icon from './components/Icon/Icon.jsx';
import Sidebar from './components/Sidebar/Sidebar.jsx';
import Alerts from './pages/Alerts/Alerts.jsx';
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import Projects from './pages/Projects/Projects.jsx';
import Vulnerabilities from './pages/Vulnerabilities/Vulnerabilities.jsx';
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
};

export default function App() {
  const [page, setPage] = useState('overview');
  const [data, setData] = useState(emptyData);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [toast, setToast] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  async function refreshWorkspace(showLoading = true) {
    if (showLoading) setRefreshing(true);

    try {
      const workspace = await loadWorkspace();
      setData(workspace);
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

    loadWorkspace()
      .then((workspace) => { if (active) setData(workspace); })
      .catch((error) => { if (active) setLoadError(error.message); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, []);

  async function runMutation(action, successMessage) {
    try {
      await action();
      await refreshWorkspace(false);
      setToast({ type: 'success', message: successMessage });
    } catch (error) {
      setToast({ type: 'error', message: error.message });
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
          ? `Análisis completado: ${result.dependencyCount} dependencias revisadas, sin coincidencias.`
          : `Análisis completado: ${result.findingCount} hallazgos en ${result.dependencyCount} dependencias.`,
      });
    } catch (error) {
      setToast({ type: 'error', message: error.message });
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
    onNavigate: setPage,
    onCreateProject: () => setCreateDialogOpen(true),
    onAddDependency: (projectId, dependency) =>
      runMutation(() => addDependency(projectId, dependency), 'Dependencia añadida a la vigilancia.'),
    onRemoveDependency: (projectId, dependencyId) =>
      runMutation(() => removeDependency(projectId, dependencyId), 'Dependencia eliminada de la vigilancia.'),
    onDeleteProject: (projectId) =>
      runMutation(() => deleteProject(projectId), 'Proyecto eliminado.'),
  };

  const Page = pageComponents[page] ?? Dashboard;

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Saltar al contenido</a>
      <Sidebar activePage={page} onNavigate={setPage} alertCount={data.summary.activeAlertCount} />
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
              <div><strong>No podemos leer los datos de Flaw.</strong><span>{loadError}</span></div>
              <button className="button button-quiet" type="button" onClick={() => refreshWorkspace().catch(() => {})} disabled={refreshing}>
                Reintentar
              </button>
            </div>
          )}

          {loading ? (
            <div className="loading-state" role="status" aria-live="polite">
              <span className="loading-mark"><Icon name="code" size={22} /></span>
              <span>Conectando con tu stack…</span>
            </div>
          ) : (
            <Page {...pageProps} />
          )}

          {toast && (
            <div className={`toast toast-${toast.type}`} role={toast.type === 'error' ? 'alert' : 'status'} aria-live="polite">
              <Icon name={toast.type === 'error' ? 'alert' : 'check'} size={16} />
              <span>{toast.message}</span>
              <button type="button" onClick={() => setToast(null)} aria-label="Cerrar notificación">
                <Icon name="close" size={15} />
              </button>
            </div>
          )}
        </div>
      </main>

      {createDialogOpen && (
        <CreateProjectDialog
          onClose={() => setCreateDialogOpen(false)}
          onCreate={(project) => runMutation(() => createProject(project), 'Proyecto creado. Ya puedes añadir dependencias.')}
        />
      )}
    </div>
  );
}
