const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/$/, '');

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error('No se pudo conectar con la API. Comprueba que el backend esté iniciado y vuelve a intentarlo.');
  }

  if (!response.ok) {
    let message = `La API respondió con un error (${response.status}).`;

    try {
      const body = await response.json();
      if (body.message) message = body.message;
    } catch {
      // The response can be empty, for example when a proxy returns an error page.
    }

    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const getDashboardSummary = () => request('/dashboard/summary');
export const getProjects = () => request('/projects');
export const getVulnerabilities = () => request('/vulnerabilities');
export const getAlerts = () => request('/alerts');
export const getAnalysisStatus = () => request('/analysis/status');
export const scanDependencies = () => request('/analysis/scan', { method: 'POST' });

export const createProject = (project) =>
  request('/projects', { method: 'POST', body: JSON.stringify(project) });

export const deleteProject = (projectId) =>
  request(`/projects/${projectId}`, { method: 'DELETE' });

export const addDependency = (projectId, dependency) =>
  request(`/projects/${projectId}/dependencies`, {
    method: 'POST',
    body: JSON.stringify(dependency),
  });

export const removeDependency = (projectId, dependencyId) =>
  request(`/projects/${projectId}/dependencies/${dependencyId}`, { method: 'DELETE' });

export async function loadWorkspace() {
  const [summary, projects, vulnerabilities, alerts, analysis] = await Promise.all([
    getDashboardSummary(),
    getProjects(),
    getVulnerabilities(),
    getAlerts(),
    getAnalysisStatus(),
  ]);

  return { summary, projects, vulnerabilities, alerts, analysis };
}
