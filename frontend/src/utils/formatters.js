export function formatDate(value, language = 'es') {
  if (!value) return language === 'en' ? 'Date unavailable' : 'Fecha no disponible';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return language === 'en' ? 'Date unavailable' : 'Fecha no disponible';
  return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatNumber(value, language = 'es') {
  return new Intl.NumberFormat(language === 'en' ? 'en-US' : 'es-ES').format(value ?? 0);
}

export function severityLabel(severity, language = 'es') {
  const labels = language === 'en' ? {
    CRITICAL: 'Critical',
    HIGH: 'High',
    MEDIUM: 'Medium',
    LOW: 'Low',
    UNKNOWN: 'Unscored',
  } : {
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
