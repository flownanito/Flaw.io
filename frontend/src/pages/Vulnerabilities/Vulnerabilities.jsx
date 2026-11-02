import { useState } from 'react';
import Icon from '../../components/Icon/Icon.jsx';
import StatusPill from '../../components/StatusPill/StatusPill.jsx';
import { useLanguage } from '../../i18n/LanguageContext.jsx';
import { ecosystemLabel, formatDate } from '../../utils/formatters.js';
import './Vulnerabilities.css';

const filters = ['TODAS', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'UNKNOWN'];

export default function Vulnerabilities({ vulnerabilities, analysisStatus }) {
  const { language, t } = useLanguage();
  const [filter, setFilter] = useState('TODAS');
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = vulnerabilities.filter((item) => {
    const matchesSeverity = filter === 'TODAS' || item.severity === filter;
    const matchesQuery = !normalizedQuery || [
      item.cveId,
      item.title,
      item.packageName,
      item.ecosystem,
    ].some((value) => value?.toLowerCase().includes(normalizedQuery));
    return matchesSeverity && matchesQuery;
  });

  return (
    <div className="vulnerabilities-page page-enter">
      <div className="vulnerabilities-intro">
        <p>{t('Avisos de OSV que coinciden con las versiones registradas en tus proyectos.')}</p>
        <div className="catalog-counter"><strong>{filtered.length.toString().padStart(2, '0')}</strong><span>{t('RESULTADOS / {count}', { count: vulnerabilities.length.toString().padStart(2, '0') })}</span></div>
      </div>

      <section className="catalog-panel">
        <div className="catalog-toolbar">
          <div className="filter-tabs" aria-label={t('Filtrar por severidad')}>
            {filters.map((item) => (
              <button
                key={item}
                className={filter === item ? 'filter-tab is-selected' : 'filter-tab'}
                type="button"
                onClick={() => setFilter(item)}
                aria-pressed={filter === item}
              >
                {t(item === 'TODAS' ? 'Todas' : item)}
              </button>
            ))}
          </div>
          <label className="catalog-search">
            <Icon name="search" size={16} />
            <span className="sr-only">{t('Buscar vulnerabilidades')}</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('Buscar CVE, paquete…')} />
            <kbd>/</kbd>
          </label>
        </div>

        {filtered.length > 0 ? (
          <div className="vulnerability-list">
            {filtered.map((item) => (
              <article className="vulnerability-card" key={item.cveId}>
                <div className="vulnerability-score">
                  <span className={`score-ring score-${item.severity?.toLowerCase()}`}>{item.cvssScore == null ? 'N/D' : Number(item.cvssScore).toFixed(1)}</span>
                  <span>CVSS</span>
                </div>
                <div className="vulnerability-details">
                  <div className="vulnerability-title-line">
                    <code className="vulnerability-cve">{item.cveId}</code>
                    <StatusPill severity={item.severity} />
                    {item.source === 'OSV' && <StatusPill severity="OSV">OSV</StatusPill>}
                  </div>
                  <h2>{item.title}</h2>
                  <p>{item.description}</p>
                  <div className="vulnerability-meta">
                    <span className="package-tag"><Icon name="box" size={13} />{ecosystemLabel(item.ecosystem)}</span>
                    <code>{item.packageName}</code>
                    <span className="vulnerability-date">{t('Publicada {date}', { date: formatDate(item.publishedAt, language) })}</span>
                  </div>
                  <div className="fix-row">
                      <span>{t('Afecta a')} <code>{item.vulnerableVersions}</code></span>
                      <span>{t('Corregida en')} <code>{item.patchedVersion || t('Sin parche indicado')}</code></span>
                  </div>
                  {item.referenceUrl && (
                    <a className="advisory-link" href={item.referenceUrl} target="_blank" rel="noreferrer">
                      {t('Abrir aviso original')} <Icon name="external" size={13} />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="catalog-empty">
            <Icon name="search" size={23} />
            <strong>{t(!analysisStatus.scanned ? 'Todavía no hay resultados de análisis.' : !analysisStatus.upToDate ? 'El análisis necesita actualizarse.' : 'No encontramos resultados.')}</strong>
            <span>{t(!analysisStatus.scanned
              ? 'Pulsa «Analizar» para consultar las versiones registradas en OSV.'
              : !analysisStatus.upToDate
                ? 'Vuelve a analizar las dependencias para obtener resultados actualizados.'
                : 'Prueba otra búsqueda o cambia el filtro de severidad.')}</span>
            {(query || filter !== 'TODAS') && (
              <button className="text-link" type="button" onClick={() => { setQuery(''); setFilter('TODAS'); }}>{t('Limpiar filtros')}</button>
            )}
          </div>
        )}
      </section>
      <p className="catalog-disclaimer"><Icon name="alert" size={14} /> {t('Verifica siempre la recomendación de parche con el aviso del proveedor antes de aplicarla.')}</p>
    </div>
  );
}
