import Icon from '../../components/Icon/Icon.jsx';
import StatusPill from '../../components/StatusPill/StatusPill.jsx';
import { ecosystemLabel, formatDate } from '../../utils/formatters.js';
import './Alerts.css';

function getEmptyState(status) {
  if (!status.scanned) {
    return {
      eyebrow: 'ANÁLISIS PENDIENTE',
      title: 'Analiza tu stack.',
      description: 'Ejecuta un análisis para consultar OSV con las versiones exactas que has registrado.',
      showProjectAction: true,
    };
  }
  if (!status.upToDate) {
    return {
      eyebrow: 'ANÁLISIS DESACTUALIZADO',
      title: 'Vuelve a analizar.',
      description: 'Has modificado tus proyectos o dependencias desde el último análisis. Ejecuta uno nuevo para actualizar los resultados.',
      showProjectAction: true,
    };
  }
  return {
    eyebrow: 'SIN COINCIDENCIAS EN OSV',
    title: 'No se encontraron coincidencias.',
    description: `OSV no ha reportado vulnerabilidades conocidas para las ${status.dependencyCount} dependencias analizadas.`,
    showProjectAction: false,
  };
}

export default function Alerts({ alerts, onNavigate, analysisStatus }) {
  const criticalCount = alerts.filter((alert) => alert.vulnerability.severity === 'CRITICAL').length;
  const analysisNotReady = !analysisStatus.scanned || !analysisStatus.upToDate;
  const emptyState = getEmptyState(analysisStatus);

  return (
    <div className="alerts-page page-enter">
      <section className="alert-summary">
        <div className="alert-summary-icon"><Icon name={alerts.length > 0 ? 'alert' : 'shield'} size={22} /></div>
        <div className="alert-summary-copy">
          <span className="section-index">COINCIDENCIAS / FUENTE OSV</span>
          <p>{alerts.length > 0 ? <><strong>{alerts.length} {alerts.length === 1 ? 'coincidencia necesita' : 'coincidencias necesitan'}</strong> tu atención.</> : <><strong>{!analysisStatus.scanned ? 'Análisis pendiente.' : !analysisStatus.upToDate ? 'Análisis desactualizado.' : 'Sin coincidencias en OSV.'}</strong> {!analysisNotReady && 'No se han encontrado avisos para las versiones revisadas.'}</>}</p>
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
                  {alert.vulnerability.source === 'OSV' && <StatusPill severity="OSV">OSV</StatusPill>}
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
              <div className="alert-score"><strong>{alert.vulnerability.cvssScore == null ? 'N/D' : Number(alert.vulnerability.cvssScore).toFixed(1)}</strong><span>CVSS</span></div>
            </article>
          ))}
        </section>
      ) : (
        <section className="alerts-empty">
          <span className="alerts-empty-icon"><Icon name="check" size={25} /></span>
          <span className="section-index">{emptyState.eyebrow}</span>
          <h2>{emptyState.title}</h2>
          <p>{emptyState.description}</p>
          {emptyState.showProjectAction ? (
            <button className="text-link" type="button" onClick={() => onNavigate('projects')}>Revisar dependencias <Icon name="arrowRight" size={15} /></button>
          ) : (
            <span className="alerts-scan-date">Análisis: {formatDate(analysisStatus.scannedAt)}</span>
          )}
        </section>
      )}
      <p className="alerts-disclaimer"><Icon name="alert" size={14} /> Resultados de OSV para dependencias directas registradas. Verifica los avisos del proveedor antes de desplegar.</p>
    </div>
  );
}
