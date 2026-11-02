import { useEffect, useRef, useState } from 'react';
import Icon from '../Icon/Icon.jsx';
import { useLanguage } from '../../i18n/LanguageContext.jsx';
import './CreateProjectDialog.css';

export default function CreateProjectDialog({ onClose, onCreate }) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();

    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      await onCreate({ name, description, repositoryUrl });
      onClose();
    } catch (requestError) {
      setError(t(requestError.message));
    } finally {
      setSaving(false);
    }
  }

  return (
    <dialog
      className="dialog-backdrop"
      aria-labelledby="create-project-title"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      ref={dialogRef}
    >
      <section
        className="project-dialog"
      >
        <div className="dialog-heading">
          <div>
            <div className="eyebrow"><span className="eyebrow-mark" />{t('PRIMER PASO')}</div>
            <h2 id="create-project-title">{t('Añade un proyecto.')}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label={t('Cerrar diálogo')}>
            <Icon name="close" />
          </button>
        </div>
        <p className="dialog-intro">{t('Empieza por el repositorio. Después podrás añadir las dependencias que quieres vigilar.')}</p>
        <form onSubmit={submit}>
          <label htmlFor="project-name">{t('Nombre del proyecto')} <span>*</span></label>
          <input
            autoFocus
            id="project-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            maxLength={100}
            placeholder={t('p. ej. api-gateway')}
          />
          <label htmlFor="project-description">{t('Descripción')} <span className="optional-label">{t('OPCIONAL')}</span></label>
          <textarea
            id="project-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={500}
            rows={3}
            placeholder={t('¿Qué hace este proyecto?')}
          />
          <label htmlFor="project-repository">{t('URL del repositorio')} <span className="optional-label">{t('OPCIONAL')}</span></label>
          <input
            id="project-repository"
            type="url"
            value={repositoryUrl}
            onChange={(event) => setRepositoryUrl(event.target.value)}
            maxLength={500}
            placeholder="https://github.com/..."
          />
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="dialog-actions">
            <button className="button button-quiet" type="button" onClick={onClose}>{t('Cancelar')}</button>
            <button className="button button-primary" type="submit" disabled={saving}>
                {saving ? t('Creando…') : <><Icon name="plus" size={15} /> {t('Crear proyecto')}</>}
            </button>
          </div>
        </form>
      </section>
    </dialog>
  );
}
