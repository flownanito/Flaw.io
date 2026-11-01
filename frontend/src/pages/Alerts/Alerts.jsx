import Icon from '../../components/Icon/Icon.jsx';
import StatusPill from '../../components/StatusPill/StatusPill.jsx';
import { ecosystemLabel, formatDate } from '../../utils/formatters.js';
import './Alerts.css';

export default function Alerts({ alerts, onNavigate }) {
  const criticalCount = alerts.filter((alert) => alert.vulnerability.severity === 'CRITICAL').length;

  return (
    <div className="alerts-page page-enter">
      <section className="alert-summary">
        <div className="alert-summary-icon"><Icon name={alerts.length > 0 ? 'alert' : 'shield'} size={22} /></div>
        <div className="alert-summary-copy">
          <span className="section-index">COINCIDENCIAS / PRIORIDAD CVSS ≥ 7.0</span>
          <p>{alerts.length > 0 ? <><strong>{alerts.length} {alerts.length === 1 ? 'dependencia necesita' : 'dependencias necesitan'}</strong> tu atención.</> : <><strong>Todo despejado.</strong> No hay coincidencias con tus proyectos.</>}</p>
        </div>
        {alerts.length > 0 && <div className="critical-counter"><strong>{criticalCount.toString().padStart(2, '0')}</strong><span>CRÍTICAS</span></div>}
      </section>

      {alerts.length > 0 ? (
        <section className="alerts-list" aria-label="Alertas coincidentes">
          {alerts.map((alert, index) => (
            <article className="alert-card" key={`${alert.projectId}-${alert.vulnerability.cveId}-${alert.dependency.id}`}>
              <div className="alert-card-index">{(index + 1).toString().padStart(2, '0')}</div>
              <div className="alert-card-body">
                <div className="alert-card-title">
                  <code>{alert.vulnerability.cveId}</code>
                  <StatusPill severity={alert.vulnerability.severity} />
                  {alert.vulnerability.source === 'DEMO' && <StatusPill severity="DEMO">DEMO</StatusPill>}
                </div>
                <h2>{alert.vulnerability.title}</h2>
                <p>{alert.vulnerability.description}</p>
                <div className="alert-target">
                  <span className="target-project"><Icon name="box" size={14} />{alert.projectName}</span>
                  <Icon name="arrowRight" size={14} className="target-arrow" />
                  <span className="target-dependency"><span>{ecosystemLabel(alert.dependency.ecosystem)}</span><code>{alert.dependency.packageName}</code><span>v{alert.dependency.version}</span></span>
                </div>
                <div className="alert-remediation">
                  <span>RANGO AFECTADO <code>{alert.vulnerability.vulnerableVersions}</code></span>
                  <span>ACTUALIZA A <code>{alert.vulnerability.patchedVersion || 'Ver aviso oficial'}</code></span>
                  <span>PUBLICADA <code>{formatDate(alert.vulnerability.publishedAt)}</code></span>
                </div>
              </div>
              <div className="alert-score"><strong>{Number(alert.vulnerability.cvssScore).toFixed(1)}</strong><span>CVSS</span></div>
            </article>
          ))}
        </section>
      ) : (
        <section className="alerts-empty">
          <span className="alerts-empty-icon"><Icon name="check" size={25} /></span>
          <span className="section-index">SIN COINCIDENCIAS ACTIVAS</span>
          <h2>Tu stack está tranquilo.</h2>
          <p>Cuando una dependencia de tus proyectos coincida con una vulnerabilidad de alta severidad, aparecerá aquí.</p>
          <button className="text-link" type="button" onClick={() => onNavigate('projects')}>Revisar dependencias <Icon name="arrowRight" size={15} /></button>
        </section>
      )}
      <p className="alerts-disclaimer"><Icon name="alert" size={14} /> Confirma siempre la versión corregida en el aviso original del proveedor antes de desplegar.</p>
    </div>
  );
}
