import { useState } from 'react';
import Icon from '../Icon/Icon.jsx';
import { ecosystemLabel } from '../../utils/formatters.js';
import './ProjectCard.css';

const ecosystems = ['NPM', 'MAVEN', 'PYPI', 'GO', 'CARGO'];

export default function ProjectCard({ project, onAddDependency, onRemoveDependency, onDeleteProject }) {
  const [showForm, setShowForm] = useState(false);
  const [ecosystem, setEcosystem] = useState('NPM');
  const [packageName, setPackageName] = useState('');
  const [version, setVersion] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const dependencies = project.dependencies ?? [];

  async function submitDependency(event) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      await onAddDependency(project.id, { ecosystem, packageName, version });
      setPackageName('');
      setVersion('');
      setShowForm(false);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function removeDependency(dependencyId) {
    setError('');
    try {
      await onRemoveDependency(project.id, dependencyId);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function removeProject() {
    if (!window.confirm(`¿Eliminar el proyecto "${project.name}" y sus dependencias?`)) return;
    setError('');
    try {
      await onDeleteProject(project.id);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <article className="project-card">
      <div className="project-card-head">
        <span className="project-avatar">{project.name.slice(0, 2).toUpperCase()}</span>
        <div className="project-title">
          <h3>{project.name}</h3>
          <p>{project.description || 'Sin descripción'}</p>
        </div>
        <button
          className="icon-button project-delete"
          type="button"
          onClick={removeProject}
          aria-label={`Eliminar ${project.name}`}
          title="Eliminar proyecto"
        >
          <Icon name="trash" size={16} />
        </button>
      </div>

      {project.repositoryUrl && (
        <a className="project-repository" href={project.repositoryUrl} target="_blank" rel="noreferrer">
          <Icon name="github" size={14} />
          <span>{project.repositoryUrl.replace(/^https?:\/\//, '')}</span>
          <Icon name="external" size={12} />
        </a>
      )}

      <div className="dependency-heading">
        <span>DEPENDENCIAS</span>
        <span className="dependency-count">{dependencies.length.toString().padStart(2, '0')}</span>
      </div>

      {dependencies.length > 0 ? (
        <ul className="dependency-list">
          {dependencies.map((dependency) => (
            <li className="dependency-item" key={dependency.id}>
              <span className="dependency-ecosystem">{ecosystemLabel(dependency.ecosystem)}</span>
              <code title={dependency.packageName}>{dependency.packageName}</code>
              <span className="dependency-version">v{dependency.version}</span>
              <button
                className="dependency-remove"
                type="button"
                onClick={() => removeDependency(dependency.id)}
                aria-label={`Dejar de vigilar ${dependency.packageName}`}
                title="Dejar de vigilar"
              >
                <Icon name="close" size={13} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="dependency-empty">Todavía no vigilas dependencias en este proyecto.</p>
      )}

      {error && <p className="form-error" role="alert">{error}</p>}

      {showForm ? (
        <form className="dependency-form" onSubmit={submitDependency}>
          <label>
            Ecosistema
            <select value={ecosystem} onChange={(event) => setEcosystem(event.target.value)}>
              {ecosystems.map((item) => <option key={item} value={item}>{ecosystemLabel(item)}</option>)}
            </select>
          </label>
          <label className="dependency-package-field">
            Paquete
            <input value={packageName} onChange={(event) => setPackageName(event.target.value)} required maxLength={255} placeholder="p. ej. express" />
          </label>
          <label className="dependency-version-field">
            Versión
            <input value={version} onChange={(event) => setVersion(event.target.value)} required maxLength={100} placeholder="4.18.2" />
          </label>
          <div className="dependency-form-actions">
            <button className="button button-quiet" type="button" onClick={() => { setShowForm(false); setError(''); }}>Cancelar</button>
            <button className="button button-primary" type="submit" disabled={saving}>
              {saving ? 'Guardando…' : 'Vigilar'}
            </button>
          </div>
        </form>
      ) : (
        <button className="add-dependency-button" type="button" onClick={() => setShowForm(true)}>
          <Icon name="plus" size={15} /> Añadir dependencia
        </button>
      )}
    </article>
  );
}
