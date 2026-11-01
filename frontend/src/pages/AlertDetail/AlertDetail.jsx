import { useEffect, useRef } from 'react';
import Icon from '../../components/Icon/Icon.jsx';
import StatusPill from '../../components/StatusPill/StatusPill.jsx';
import { ecosystemLabel, formatDate } from '../../utils/formatters.js';
import './AlertDetail.css';

function getAdvisoryUrl(vulnerability) {
  const fallback = `https://osv.dev/vulnerability/${encodeURIComponent(vulnerability.cveId)}`;
  if (!vulnerability.referenceUrl) return fallback;

  try {
    const url = new URL(vulnerability.referenceUrl);
    return url.protocol === 'https:' ? url.href : fallback;
  } catch {
    return fallback;
  }
}

export default function AlertDetail({ alert, onBack }) {
  const titleRef = useRef(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  if (!alert) {
    return (
      <section className="alert-report page-enter" aria-labelledby="alert-report-missing-title">
        <button className="alert-report-back" type="button" onClick={onBack}>
          <Icon name="arrowRight" size={15} className="alert-report-back-icon" />
          Volver a alertas
        </button>
        <div className="alert-report-missing">
          <span className="section-index">INFORME NO DISPONIBLE</span>
          <h2 id="alert-report-missing-title">Esta alerta ya no está en el análisis vigente.</h2>
          <p>Vuelve a las alertas y ejecuta un análisis actualizado para consultar los resultados actuales.</p>
        </div>
      </section>
    );
  }

  const { vulnerability, projectName, dependency } = alert;
  const patchedVersion = vulnerability.patchedVersion?.trim();
  const advisoryUrl = getAdvisoryUrl(vulnerability);
  const cvssScore = vulnerability.cvssScore == null ? null : Number(vulnerability.cvssScore);
  const hasCvssScore = Number.isFinite(cvssScore) && cvssScore >= 0 && cvssScore <= 10;

  return (
    <article className="alert-report page-enter">
      <button className="alert-report-back" type="button" onClick={onBack}>
        <Icon name="arrowRight" size={15} className="alert-report-back-icon" />
        Volver a alertas
      </button>

      <header className="report-hero">
        <div className="report-hero-meta">
          <code>{vulnerability.cveId}</code>
          <StatusPill severity={vulnerability.severity} />
          {vulnerability.source === 'OSV' && <StatusPill severity="OSV">OSV</StatusPill>}
        </div>
        <h2 ref={titleRef} tabIndex="-1">{vulnerability.title}</h2>
        <p>{vulnerability.description || 'El aviso no incluye una descripción detallada. Consulta la referencia de seguridad para obtener información del proveedor.'}</p>
      </header>

      <section className={`report-facts${hasCvssScore ? '' : ' report-facts-without-score'}`} aria-label="Resumen del aviso">
        <div className="report-fact">
          <span>SEVERIDAD</span>
          <strong className={`report-severity severity-${(vulnerability.severity || 'unknown').toLowerCase()}`}>
            {vulnerability.severity || 'Sin clasificar'}
          </strong>
        </div>
        {hasCvssScore && (
          <div className="report-fact">
            <span>PUNTUACIÓN CVSS BASE</span>
            <strong>{cvssScore.toFixed(1)}<small> / 10</small></strong>
          </div>
        )}
        <div className="report-fact">
          <span>PUBLICADA</span>
          <strong>{formatDate(vulnerability.publishedAt)}</strong>
        </div>
        <div className="report-fact">
          <span>FUENTE</span>
          <strong>{vulnerability.source || 'OSV'}</strong>
        </div>
      </section>

      <div className="report-grid">
        <div className="report-main-column">
          <section className="report-panel">
            <div className="report-section-heading">
              <span className="report-section-icon"><Icon name="code" size={17} /></span>
              <div>
                <span className="section-index">COMPONENTE AFECTADO</span>
                <h3>Dependencia detectada</h3>
              </div>
            </div>
            <dl className="report-component-details">
              <div>
                <dt>Proyecto</dt>
                <dd>{projectName}</dd>
              </div>
              <div>
                <dt>Ecosistema</dt>
                <dd>{ecosystemLabel(dependency.ecosystem)}</dd>
              </div>
              <div className="report-detail-wide">
                <dt>Paquete</dt>
                <dd><code>{dependency.packageName}</code></dd>
              </div>
              <div>
                <dt>Versión registrada</dt>
                <dd><code>{dependency.version}</code></dd>
              </div>
              <div>
                <dt>Rango afectado según OSV</dt>
                <dd><code>{vulnerability.vulnerableVersions || 'No especificado por OSV'}</code></dd>
              </div>
            </dl>
          </section>

          <section className="report-panel report-details-panel">
            <span className="section-index">DETALLES DEL AVISO</span>
            <h3>Descripción técnica publicada</h3>
            <p className="report-full-details">
              {alert.details || 'Este resultado guardado no contiene los detalles técnicos completos. Ejecuta «Analizar» para volver a consultar OSV y guardar la información disponible.'}
            </p>
          </section>

          <section className="report-panel report-remediation-panel">
            <div className="report-section-heading">
              <span className={`report-section-icon ${patchedVersion ? 'is-fixed' : 'is-unconfirmed'}`}>
                <Icon name={patchedVersion ? 'shield' : 'alert'} size={17} />
              </span>
              <div>
                <span className="section-index">ESTADO DE CORRECCIÓN</span>
                <h3>{patchedVersion ? 'OSV indica una versión corregida' : 'OSV no indica una versión corregida'}</h3>
              </div>
            </div>
            {patchedVersion ? (
              <>
                <p>El aviso identifica esta versión como una corrección para el rango afectado. Verifica las notas del proveedor y la compatibilidad antes de actualizar.</p>
                <div className="report-fixed-version">
                  <span>VERSIÓN CORREGIDA INDICADA</span>
                  <code>{patchedVersion}</code>
                </div>
              </>
            ) : (
              <p>Los datos de OSV no especifican una versión corregida. Esto no confirma que no exista una solución: revisa el aviso original para comprobar mitigaciones, actualizaciones o recomendaciones del proveedor.</p>
            )}
          </section>
        </div>

        <aside className="report-side-column">
          <section className="report-panel report-advisory-panel">
            <span className="section-index">REFERENCIA DEL AVISO</span>
            <h3>Consulta la fuente de seguridad</h3>
            <p>Abre el aviso asociado para revisar el análisis técnico y las recomendaciones publicadas.</p>
            <a
              className="report-advisory-link"
              href={advisoryUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir aviso de seguridad
              <Icon name="external" size={15} />
            </a>
            <span className="report-link-note">
              <Icon name="shield" size={13} />
              Enlace del aviso OSV; puede dirigir a la publicación del proveedor.
            </span>
          </section>

          <section className="report-panel report-next-steps">
            <span className="section-index">SIGUIENTES PASOS</span>
            <h3>Antes de cerrar la alerta</h3>
            <ol>
              <li>Revisa el aviso original y confirma que afecta al uso que hace el proyecto del paquete.</li>
              <li>{patchedVersion ? `Evalúa actualizar a ${patchedVersion} y valida la compatibilidad.` : 'Consulta si el proveedor recomienda una mitigación o una versión alternativa.'}</li>
              <li>Vuelve a ejecutar el análisis para comprobar el estado de la dependencia actualizada.</li>
            </ol>
          </section>
        </aside>
      </div>

      <p className="report-disclaimer">
        <Icon name="alert" size={14} />
        Informe generado a partir de los datos publicados por OSV y de la dependencia registrada. Confirma la solución en la documentación del proveedor.
      </p>
    </article>
  );
}
