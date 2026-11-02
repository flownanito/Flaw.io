const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/$/, '');
const translatedTextCache = new Map();
const translationTextEncoder = new TextEncoder();
const maxTranslationBatchBytes = 30_000;
const maxTranslationBatchSize = 50;

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
export const translateTexts = (texts, targetLanguage) =>
  request('/translation/translate', {
    method: 'POST',
    body: JSON.stringify({ texts, targetLanguage }),
  });

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

function addTranslationBatch(batches, texts, nextText, byteLength) {
  const nextBytes = translationTextEncoder.encode(nextText).length;
  if (texts.length && (texts.length >= maxTranslationBatchSize || byteLength + nextBytes > maxTranslationBatchBytes)) {
    batches.push(texts);
    texts = [];
    byteLength = 0;
  }
  texts.push(nextText);
  return { texts, byteLength: byteLength + nextBytes };
}

async function translateWorkspaceContent(workspace, language) {
  const targetLanguage = language === 'en' ? 'EN' : 'ES';
  const sourceTexts = new Set();
  for (const alert of workspace.alerts) {
    sourceTexts.add(alert.vulnerability.title);
    sourceTexts.add(alert.vulnerability.description);
    sourceTexts.add(alert.details);
  }
  for (const vulnerability of workspace.vulnerabilities) {
    sourceTexts.add(vulnerability.title);
    sourceTexts.add(vulnerability.description);
  }

  const texts = [...sourceTexts].filter((text) => typeof text === 'string' && text.trim());
  if (!texts.length) return { ...workspace, translationWarning: null };

  const missingTexts = texts.filter((text) => !translatedTextCache.has(`${targetLanguage}\u0000${text}`));
  const batches = [];
  let batch = [];
  let batchBytes = 0;
  for (const text of missingTexts) {
    ({ texts: batch, byteLength: batchBytes } = addTranslationBatch(batches, batch, text, batchBytes));
  }
  if (batch.length) batches.push(batch);

  try {
    const translatedBatches = await Promise.all(
      batches.map((textBatch) => translateTexts(textBatch, targetLanguage))
    );
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const sourceBatch = batches[batchIndex];
      const translatedBatch = translatedBatches[batchIndex].translations;
      if (!Array.isArray(translatedBatch) || translatedBatch.length !== sourceBatch.length) {
        throw new Error('DeepL devolvió una respuesta de traducción incompleta.');
      }
      sourceBatch.forEach((source, index) => {
        if (translatedTextCache.size >= 1000) {
          translatedTextCache.delete(translatedTextCache.keys().next().value);
        }
        translatedTextCache.set(`${targetLanguage}\u0000${source}`, translatedBatch[index]);
      });
    }

    const translatedValue = (value) => typeof value === 'string'
      ? translatedTextCache.get(`${targetLanguage}\u0000${value}`) ?? value
      : value;
    const translateVulnerability = (vulnerability) => ({
      ...vulnerability,
      title: translatedValue(vulnerability.title),
      description: translatedValue(vulnerability.description),
    });

    return {
      ...workspace,
      alerts: workspace.alerts.map((alert) => ({
        ...alert,
        vulnerability: translateVulnerability(alert.vulnerability),
        details: translatedValue(alert.details),
      })),
      vulnerabilities: workspace.vulnerabilities.map(translateVulnerability),
      translationWarning: null,
    };
  } catch (error) {
    return { ...workspace, translationWarning: error.message };
  }
}

export async function loadWorkspace(language = 'es') {
  const [summary, projects, vulnerabilities, alerts, analysis] = await Promise.all([
    getDashboardSummary(),
    getProjects(),
    getVulnerabilities(),
    getAlerts(),
    getAnalysisStatus(),
  ]);

  return translateWorkspaceContent({ summary, projects, vulnerabilities, alerts, analysis }, language);
}
