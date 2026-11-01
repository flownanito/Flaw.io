import Icon from '../../components/Icon/Icon.jsx';
import StatCard from '../../components/StatCard/StatCard.jsx';
import StatusPill from '../../components/StatusPill/StatusPill.jsx';
import { ecosystemLabel, formatDate, formatNumber } from '../../utils/formatters.js';
import './Dashboard.css';

export default function Dashboard({ data, onNavigate }) {
  const { summary, projects, vulnerabilities, alerts } = data;
  const criticalCount = vulnerabilities.filter((item) => item.severity === 'CRITICAL').length;
  const latestAlerts = [...alerts].slice(0, 4);
  const featuredProject = projects[0];
  const hasDemoData = vulnerabilities.some((item) => item.source === 'DEMO');

  return (
    <div className="dashboard-page page-enter">
      <section className="hero-panel">
        <div className="hero-copy">
          <div className="hero-kicker"><span className="hero-live-dot" /> SEGURIDAD DE DEPENDENCIAS, SIN RUIDO</div>
          <h2>El riesgo está<br />en <span>lo que instalas.</span></h2>
          <p>Vigila tu stack. Encuentra las piezas vulnerables. Arregla lo importante antes de que se convierta en un incidente.</p>
          <button className="hero-link" type="button" onClick={() => onNavigate('projects')}>
            Explorar mis proyectos <Icon name="arrowRight" size={16} />
          </button>
        </div>
        <div className="hero-graphic" aria-hidden="true">
          <div className="graphic-orbit orbit-outer" />
          <div className="graphic-orbit orbit-inner" />
          <div className="graphic-core"><Icon name="shield" size={44} /></div>
          <span className="graphic-tag tag-top">DEPENDENCY / SCAN</span>
          <span className="graphic-tag tag-side">CVE INDEXED</span>
          <span className="graphic-tag tag-bottom">01 — 04</span>
          <span className="graphic-cross cross-one">+</span>
          <span className="graphic-cross cross-two">+</span>
        </div>
        <div className="hero-index">FLAW / SEC<br /><span>EST. FOR BUILDERS</span></div>
      </section>

      {hasDemoData && (
        <div className="demo-notice" role="status">
          <span className="demo-notice-mark">i</span>
          <span><strong>Datos de demostración.</strong> Las vulnerabilidades de este espacio no proceden de un feed en tiempo real.</span>
          <StatusPill severity="DEMO">DEMO</StatusPill>
        </div>
      )}

      <section aria-label="Métricas de seguridad" className="stats-grid">
        <StatCard label="Proyectos" value={formatNumber(summary.projectCount)} note="repositorios vigilados" icon="box" accent="01 / SCOPE" />
        <StatCard label="Dependencias" value={formatNumber(summary.dependencyCount)} note="paquetes en seguimiento" icon="layers" accent="02 / STACK" tone="blue" />
        <StatCard label="Vulnerabilidades" value={formatNumber(summary.vulnerabilityCount)} note="en la base de datos" icon="shield" accent="03 / INDEX" tone="amber" />
        <StatCard label="Alertas activas" value={formatNumber(summary.activeAlertCount)} note={`${criticalCount} críticas en el catálogo`} icon="alert" accent="04 / PRIORITY" tone="coral" />
      </section>

      <div className="dashboard-columns">
        <section className="panel recent-panel">
          <div className="section-heading">
            <div>
              <span className="section-index">01 — MATCH ENGINE</span>
              <h2>Señales para actuar</h2>
            </div>
            <button className="text-link" type="button" onClick={() => onNavigate('alerts')}>
              Ver todas <Icon name="arrowRight" size={15} />
            </button>
          </div>
          {latestAlerts.length > 0 ? (
            <div className="signal-list">
              {latestAlerts.map((alert) => (
                <article className="signal-item" key={`${alert.projectId}-${alert.vulnerability.cveId}-${alert.dependency.id}`}>
                  <span className="signal-symbol"><Icon name="alert" size={16} /></span>
                  <div className="signal-content">
                    <div className="signal-title-row">
                      <strong>{alert.vulnerability.cveId}</strong>
                      <StatusPill severity={alert.vulnerability.severity} />
                    </div>
                    <p>{alert.vulnerability.title}</p>
                    <div className="signal-meta">
                      <span>{alert.projectName}</span>
                      <span className="meta-divider">/</span>
                      <code>{alert.dependency.packageName}</code>
                    </div>
                  </div>
                  <Icon name="chevron" size={16} className="signal-chevron" />
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-inline">
              <span className="empty-mark"><Icon name="check" size={17} /></span>
              <div><strong>Sin coincidencias.</strong><p>No hay alertas para las dependencias registradas.</p></div>
            </div>
          )}
        </section>

        <section className="panel stack-panel">
          <div className="section-heading">
            <div>
              <span className="section-index">02 — TU STACK</span>
              <h2>En el radar</h2>
            </div>
            <button className="icon-button" type="button" onClick={() => onNavigate('projects')} aria-label="Ver todos los proyectos">
              <Icon name="arrow" size={17} />
            </button>
          </div>
          {featuredProject ? (
            <>
              <div className="stack-project">
                <span className="project-avatar">{featuredProject.name.slice(0, 2).toUpperCase()}</span>
                <div><strong>{featuredProject.name}</strong><span>{featuredProject.dependencies.length} dependencias</span></div>
                <span className="stack-status"><span /> VIGILANDO</span>
              </div>
              <div className="stack-packages">
                {featuredProject.dependencies.slice(0, 4).map((dependency) => (
                  <div className="stack-package" key={dependency.id}>
                    <span>{ecosystemLabel(dependency.ecosystem)}</span>
                    <code>{dependency.packageName}</code>
                    <span className="package-version">{dependency.version}</span>
                  </div>
                ))}
                {featuredProject.dependencies.length === 0 && <p className="stack-empty">Añade dependencias para empezar a vigilar.</p>}
              </div>
              {featuredProject.dependencies.length > 4 && (
                <p className="stack-more">+{featuredProject.dependencies.length - 4} paquetes más</p>
              )}
            </>
          ) : (
            <div className="empty-stack">
              <Icon name="box" size={23} />
              <p>Aún no hay proyectos conectados.</p>
              <button className="text-link" type="button" onClick={() => onNavigate('projects')}>Añade el primero <Icon name="arrowRight" size={14} /></button>
            </div>
          )}
        </section>
      </div>

      <footer className="dashboard-footer">
        <span><Icon name="activity" size={14} /> Protegiendo el código que mueve el mundo.</span>
        <span>ÚLTIMA PUBLICACIÓN EN EL CATÁLOGO: {formatDate(vulnerabilities[0]?.publishedAt)}</span>
      </footer>
    </div>
  );
}
