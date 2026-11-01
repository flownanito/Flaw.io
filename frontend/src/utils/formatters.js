const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});
const numberFormatter = new Intl.NumberFormat('es-ES');

export function formatDate(value) {
  if (!value) return 'Fecha no disponible';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Fecha no disponible' : dateFormatter.format(date);
}

export function formatNumber(value) {
  return numberFormatter.format(value ?? 0);
}

export function severityLabel(severity) {
  const labels = {
    CRITICAL: 'Crítica',
    HIGH: 'Alta',
    MEDIUM: 'Media',
    LOW: 'Baja',
    UNKNOWN: 'Sin puntuación',
  };
  return labels[severity] ?? severity ?? 'Sin clasificar';
}

export function ecosystemLabel(ecosystem) {
  const labels = {
    NPM: 'npm',
    MAVEN: 'Maven',
    PYPI: 'PyPI',
    GO: 'Go',
    CARGO: 'Cargo',
  };
  return labels[ecosystem] ?? ecosystem ?? 'Otro';
}

export function initials(value) {
  const words = (value || 'FL').trim().split(/[\s/_-]+/).filter(Boolean);
  return words.slice(0, 2).map((word) => word[0].toUpperCase()).join('');
}
