import Icon from '../../components/Icon/Icon.jsx';
import StatCard from '../../components/StatCard/StatCard.jsx';
import StatusPill from '../../components/StatusPill/StatusPill.jsx';
import { useLanguage } from '../../i18n/LanguageContext.jsx';
import { ecosystemLabel, formatDate, formatNumber } from '../../utils/formatters.js';
import './Dashboard.css';

export default function Dashboard({ data, onNavigate }) {
  const { language, t } = useLanguage();
  const { summary, projects, vulnerabilities, alerts } = data;
  const criticalCount = vulnerabilities.filter((item) => item.severity === 'CRITICAL').length;
  const latestAlerts = [...alerts].slice(0, 4);
  const featuredProject = projects[0];

  return (
    <div className="dashboard-page page-enter">
      <section className="hero-panel">
        <div className="hero-copy">
          <div className="hero-kicker"><span className="hero-live-dot" /> {t('SEGURIDAD DE DEPENDENCIAS, SIN RUIDO')}</div>
          <h2>{t('El riesgo está')}<br />{language === 'en' ? 'in ' : 'en '}<span>{t('lo que instalas.')}</span></h2>
          <p>{t('Vigila tu stack. Encuentra las piezas vulnerables. Arregla lo importante antes de que se convierta en un incidente.')}</p>
          <button className="hero-link" type="button" onClick={() => onNavigate('projects')}>
            {t('Explorar mis proyectos')} <Icon name="arrowRight" size={16} />
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

      {!data.analysis.scanned ? (
        <div className="demo-notice" role="status">
          <span className="demo-notice-mark">i</span>
          <span><strong>{t('Aún no has analizado tus dependencias.')}</strong> {t('Usa «Analizar» para consultar los avisos reales de OSV.')}</span>
          <StatusPill severity="OSV">OSV</StatusPill>
        </div>
      ) : !data.analysis.upToDate ? (
        <div className="demo-notice" role="status">
          <span className="demo-notice-mark">!</span>
          <span><strong>{t('El inventario ha cambiado.')}</strong> {t('Vuelve a analizarlo para actualizar los resultados.')}</span>
        </div>
      ) : (
        <div className="analysis-freshness" role="status">
          <Icon name="check" size={14} />
          {t('Último análisis OSV: {date} · {count} dependencias', {
            date: formatDate(data.analysis.scannedAt, language),
            count: formatNumber(data.analysis.dependencyCount, language),
          })}
        </div>
      )}

      <section aria-label={t('Métricas de seguridad')} className="stats-grid">
        <StatCard label={t('Proyectos')} value={formatNumber(summary.projectCount, language)} note={t('repositorios vigilados')} icon="box" accent="01 / SCOPE" />
        <StatCard label={t('Dependencias')} value={formatNumber(summary.dependencyCount, language)} note={t('paquetes en seguimiento')} icon="layers" accent="02 / STACK" tone="blue" />
        <StatCard label={t('Vulnerabilidades')} value={formatNumber(summary.vulnerabilityCount, language)} note={t('en las dependencias analizadas')} icon="shield" accent="03 / INDEX" tone="amber" />
        <StatCard label={t('Alertas activas')} value={formatNumber(summary.activeAlertCount, language)} note={t('{count} críticas detectadas', { count: criticalCount })} icon="alert" accent="04 / PRIORITY" tone="coral" />
      </section>

      <div className="dashboard-columns">
        <section className="panel recent-panel">
          <div className="section-heading">
            <div>
              <span className="section-index">{t('01 — MATCH ENGINE')}</span>
              <h2>{t('Señales para actuar')}</h2>
            </div>
            <button className="text-link" type="button" onClick={() => onNavigate('alerts')}>
              {t('Ver todas')} <Icon name="arrowRight" size={15} />
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
              <div><strong>{t('Sin coincidencias.')}</strong><p>{t('No hay alertas para las dependencias registradas.')}</p></div>
            </div>
          )}
        </section>

        <section className="panel stack-panel">
          <div className="section-heading">
            <div>
              <span className="section-index">{t('02 — TU STACK')}</span>
              <h2>{t('En el radar')}</h2>
            </div>
            <button className="icon-button" type="button" onClick={() => onNavigate('projects')} aria-label={t('Ver todos los proyectos')}>
              <Icon name="arrow" size={17} />
            </button>
          </div>
          {featuredProject ? (
            <>
              <div className="stack-project">
                <span className="project-avatar">{featuredProject.name.slice(0, 2).toUpperCase()}</span>
                <div><strong>{featuredProject.name}</strong><span>{t('{count} dependencias', { count: featuredProject.dependencies.length })}</span></div>
                <span className="stack-status"><span /> {t('VIGILANDO')}</span>
              </div>
              <div className="stack-packages">
                {featuredProject.dependencies.slice(0, 4).map((dependency) => (
                  <div className="stack-package" key={dependency.id}>
                    <span>{ecosystemLabel(dependency.ecosystem)}</span>
                    <code>{dependency.packageName}</code>
                    <span className="package-version">{dependency.version}</span>
                  </div>
                ))}
                {featuredProject.dependencies.length === 0 && <p className="stack-empty">{t('Añade dependencias para empezar a vigilar.')}</p>}
              </div>
              {featuredProject.dependencies.length > 4 && (
                <p className="stack-more">{t('+{count} paquetes más', { count: featuredProject.dependencies.length - 4 })}</p>
              )}
            </>
          ) : (
            <div className="empty-stack">
              <Icon name="box" size={23} />
              <p>{t('Aún no hay proyectos conectados.')}</p>
              <button className="text-link" type="button" onClick={() => onNavigate('projects')}>{t('Añade el primero')} <Icon name="arrowRight" size={14} /></button>
            </div>
          )}
        </section>
      </div>

      <footer className="dashboard-footer">
        <span><Icon name="activity" size={14} /> {t('Protegiendo el código que mueve el mundo.')}</span>
        <span>FUENTE: OPEN SOURCE VULNERABILITIES (OSV)</span>
      </footer>
    </div>
  );
}
