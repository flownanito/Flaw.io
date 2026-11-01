import { useState } from 'react';
import Icon from '../../components/Icon/Icon.jsx';
import StatusPill from '../../components/StatusPill/StatusPill.jsx';
import { ecosystemLabel, formatDate } from '../../utils/formatters.js';
import './Vulnerabilities.css';

const filters = ['TODAS', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export default function Vulnerabilities({ vulnerabilities }) {
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
        <p>El catálogo que usa Flaw para cruzar avisos con las dependencias de tus proyectos.</p>
        <div className="catalog-counter"><strong>{filtered.length.toString().padStart(2, '0')}</strong><span>RESULTADOS / {vulnerabilities.length.toString().padStart(2, '0')}</span></div>
      </div>

      <section className="catalog-panel">
        <div className="catalog-toolbar">
          <div className="filter-tabs" aria-label="Filtrar por severidad">
            {filters.map((item) => (
              <button
                key={item}
                className={filter === item ? 'filter-tab is-selected' : 'filter-tab'}
                type="button"
                onClick={() => setFilter(item)}
                aria-pressed={filter === item}
              >
                {item === 'TODAS' ? 'Todas' : item}
              </button>
            ))}
          </div>
          <label className="catalog-search">
            <Icon name="search" size={16} />
            <span className="sr-only">Buscar vulnerabilidades</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar CVE, paquete…" />
            <kbd>/</kbd>
          </label>
        </div>

        {filtered.length > 0 ? (
          <div className="vulnerability-list">
            {filtered.map((item) => (
              <article className="vulnerability-card" key={item.cveId}>
                <div className="vulnerability-score">
                  <span className={`score-ring score-${item.severity?.toLowerCase()}`}>{Number(item.cvssScore).toFixed(1)}</span>
                  <span>CVSS</span>
                </div>
                <div className="vulnerability-details">
                  <div className="vulnerability-title-line">
                    <code className="vulnerability-cve">{item.cveId}</code>
                    <StatusPill severity={item.severity} />
                    {item.source === 'DEMO' && <StatusPill severity="DEMO">DEMO</StatusPill>}
                  </div>
                  <h2>{item.title}</h2>
                  <p>{item.description}</p>
                  <div className="vulnerability-meta">
                    <span className="package-tag"><Icon name="box" size={13} />{ecosystemLabel(item.ecosystem)}</span>
                    <code>{item.packageName}</code>
                    <span className="vulnerability-date">Publicada {formatDate(item.publishedAt)}</span>
                  </div>
                  <div className="fix-row">
                    <span>Afecta a <code>{item.vulnerableVersions}</code></span>
                    <span>Corregida en <code>{item.patchedVersion || 'Sin parche indicado'}</code></span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="catalog-empty">
            <Icon name="search" size={23} />
            <strong>No encontramos resultados.</strong>
            <span>Prueba otra búsqueda o cambia el filtro de severidad.</span>
            {(query || filter !== 'TODAS') && (
              <button className="text-link" type="button" onClick={() => { setQuery(''); setFilter('TODAS'); }}>Limpiar filtros</button>
            )}
          </div>
        )}
      </section>
      <p className="catalog-disclaimer"><Icon name="alert" size={14} /> Verifica siempre la recomendación de parche con el aviso del proveedor antes de aplicarla.</p>
    </div>
  );
}
