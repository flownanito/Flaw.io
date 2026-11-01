export function getAlertKey(alert) {
  return JSON.stringify([
    String(alert.projectId),
    String(alert.dependency.id),
    alert.vulnerability.cveId,
  ]);
}

export function getAlertHref(alert) {
  const { projectId, dependency } = alert;
  const { cveId } = alert.vulnerability;
  return `#alert/${projectId}/${dependency.id}/${encodeURIComponent(cveId)}`;
}

export function parseAppRoute(hash) {
  const segments = hash.replace(/^#/, '').split('/');

  if (segments[0] === 'alert' && segments.length === 4) {
    try {
      return {
        page: 'alert-detail',
        alertKey: JSON.stringify([
          segments[1],
          segments[2],
          decodeURIComponent(segments[3]),
        ]),
      };
    } catch {
      return { page: 'overview', alertKey: null };
    }
  }

  const page = ['overview', 'projects', 'vulnerabilities', 'alerts'].includes(segments[0])
    ? segments[0]
    : 'overview';
  return { page, alertKey: null };
}
