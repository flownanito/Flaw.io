import { useEffect, useRef } from 'react';
import Icon from '../../components/Icon/Icon.jsx';
import StatusPill from '../../components/StatusPill/StatusPill.jsx';
import { useLanguage } from '../../i18n/LanguageContext.jsx';
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

function MissingAlertReport({ onBack }) {
  const { t } = useLanguage();
  return (
    <section className="alert-report page-enter" aria-labelledby="alert-report-missing-title">
      <button className="alert-report-back" type="button" onClick={onBack}>
        <Icon name="arrowRight" size={15} className="alert-report-back-icon" />
        {t('Volver a alertas')}
      </button>
      <div className="alert-report-missing">
        <span className="section-index">{t('INFORME NO DISPONIBLE')}</span>
        <h2 id="alert-report-missing-title">{t('Esta alerta ya no está en el análisis vigente.')}</h2>
        <p>{t('Vuelve a las alertas y ejecuta un análisis actualizado para consultar los resultados actuales.')}</p>
      </div>
    </section>
  );
}

function RemediationSection({ patchedVersion }) {
  const { t } = useLanguage();
  return (
    <section className="report-panel report-remediation-panel">
      <div className="report-section-heading">
        <span className={`report-section-icon ${patchedVersion ? 'is-fixed' : 'is-unconfirmed'}`}>
          <Icon name={patchedVersion ? 'shield' : 'alert'} size={17} />
        </span>
        <div>
          <span className="section-index">{t('ESTADO DE CORRECCIÓN')}</span>
          <h3>{t(patchedVersion ? 'OSV indica una versión corregida' : 'OSV no indica una versión corregida')}</h3>
        </div>
      </div>
      {patchedVersion ? (
        <>
          <p>{t('El aviso identifica esta versión como una corrección para el rango afectado. Verifica las notas del proveedor y la compatibilidad antes de actualizar.')}</p>
          <div className="report-fixed-version">
            <span>{t('VERSIÓN CORREGIDA INDICADA')}</span>
            <code>{patchedVersion}</code>
          </div>
        </>
      ) : (
        <p>{t('Los datos de OSV no especifican una versión corregida. Esto no confirma que no exista una solución: revisa el aviso original para comprobar mitigaciones, actualizaciones o recomendaciones del proveedor.')}</p>
      )}
    </section>
  );
}

function AlertReport({ alert, onBack }) {
  const { language, t } = useLanguage();
  const titleRef = useRef(null);
  const { vulnerability, projectName, dependency } = alert;
  const patchedVersion = vulnerability.patchedVersion?.trim();
  const advisoryUrl = getAdvisoryUrl(vulnerability);
  const cvssScore = vulnerability.cvssScore == null ? null : Number(vulnerability.cvssScore);
  const hasCvssScore = Number.isFinite(cvssScore) && cvssScore >= 0 && cvssScore <= 10;

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  return (
    <article className="alert-report page-enter">
      <button className="alert-report-back" type="button" onClick={onBack}>
        <Icon name="arrowRight" size={15} className="alert-report-back-icon" />
        {t('Volver a alertas')}
      </button>

      <header className="report-hero">
        <div className="report-hero-meta">
          <code>{vulnerability.cveId}</code>
          <StatusPill severity={vulnerability.severity} />
          {vulnerability.source === 'OSV' && <StatusPill severity="OSV">OSV</StatusPill>}
        </div>
        <h2 ref={titleRef} tabIndex="-1">{vulnerability.title}</h2>
        <p>{vulnerability.description || t('El aviso no incluye una descripción detallada. Consulta la referencia de seguridad para obtener información del proveedor.')}</p>
      </header>

      <section className={`report-facts${hasCvssScore ? '' : ' report-facts-without-score'}`} aria-label={t('Resumen del aviso')}>
        <div className="report-fact">
          <span>{t('SEVERIDAD')}</span>
          <strong className={`report-severity severity-${(vulnerability.severity || 'unknown').toLowerCase()}`}>
            {t(vulnerability.severity || 'Sin clasificar')}
          </strong>
        </div>
        {hasCvssScore && (
          <div className="report-fact">
            <span>{t('PUNTUACIÓN CVSS BASE')}</span>
            <strong>{cvssScore.toFixed(1)}<small> / 10</small></strong>
          </div>
        )}
        <div className="report-fact">
          <span>{t('PUBLICADA')}</span>
          <strong>{formatDate(vulnerability.publishedAt, language)}</strong>
        </div>
        <div className="report-fact">
          <span>{t('FUENTE')}</span>
          <strong>{vulnerability.source || 'OSV'}</strong>
        </div>
      </section>

      <div className="report-grid">
        <div className="report-main-column">
          <section className="report-panel">
            <div className="report-section-heading">
              <span className="report-section-icon"><Icon name="code" size={17} /></span>
              <div>
                <span className="section-index">{t('COMPONENTE AFECTADO')}</span>
                <h3>{t('Dependencia detectada')}</h3>
              </div>
            </div>
            <dl className="report-component-details">
              <div>
                <dt>{t('Proyecto')}</dt>
                <dd>{projectName}</dd>
              </div>
              <div>
                <dt>{t('Ecosistema')}</dt>
                <dd>{ecosystemLabel(dependency.ecosystem)}</dd>
              </div>
              <div className="report-detail-wide">
                <dt>{t('Paquete')}</dt>
                <dd><code>{dependency.packageName}</code></dd>
              </div>
              <div>
                <dt>{t('Versión registrada')}</dt>
                <dd><code>{dependency.version}</code></dd>
              </div>
              <div>
                <dt>{t('Rango afectado según OSV')}</dt>
                <dd><code>{vulnerability.vulnerableVersions || t('No especificado por OSV')}</code></dd>
              </div>
            </dl>
          </section>

          <section className="report-panel report-details-panel">
            <span className="section-index">{t('DETALLES DEL AVISO')}</span>
            <h3>{t('Descripción técnica publicada')}</h3>
            <p className="report-full-details">
              {alert.details || t('Este resultado guardado no contiene los detalles técnicos completos. Ejecuta «Analizar» para volver a consultar OSV y guardar la información disponible.')}
            </p>
          </section>

          <RemediationSection patchedVersion={patchedVersion} />
        </div>

        <aside className="report-side-column">
          <section className="report-panel report-advisory-panel">
            <span className="section-index">{t('REFERENCIA DEL AVISO')}</span>
            <h3>{t('Consulta la fuente de seguridad')}</h3>
            <p>{t('Abre el aviso asociado para revisar el análisis técnico y las recomendaciones publicadas.')}</p>
            <a
              className="report-advisory-link"
              href={advisoryUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('Abrir aviso de seguridad')}
              <Icon name="external" size={15} />
            </a>
            <span className="report-link-note">
              <Icon name="shield" size={13} />
              {t('Enlace del aviso OSV; puede dirigir a la publicación del proveedor.')}
            </span>
          </section>

          <section className="report-panel report-next-steps">
            <span className="section-index">{t('SIGUIENTES PASOS')}</span>
            <h3>{t('Antes de cerrar la alerta')}</h3>
            <ol>
              <li>{t('Revisa el aviso original y confirma que afecta al uso que hace el proyecto del paquete.')}</li>
              <li>{patchedVersion
                ? t('Evalúa actualizar a {version} y valida la compatibilidad.', { version: patchedVersion })
                : t('Consulta si el proveedor recomienda una mitigación o una versión alternativa.')}</li>
              <li>{t('Vuelve a ejecutar el análisis para comprobar el estado de la dependencia actualizada.')}</li>
            </ol>
          </section>
        </aside>
      </div>

      <p className="report-disclaimer">
        <Icon name="alert" size={14} />
        {t('Informe generado a partir de los datos publicados por OSV y de la dependencia registrada. Confirma la solución en la documentación del proveedor.')}
      </p>
    </article>
  );
}

export default function AlertDetail({ alert, onBack }) {
  if (!alert) return <MissingAlertReport onBack={onBack} />;
  return <AlertReport alert={alert} onBack={onBack} />;
}
