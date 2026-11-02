import ProjectCard from '../../components/ProjectCard/ProjectCard.jsx';
import Icon from '../../components/Icon/Icon.jsx';
import { useLanguage } from '../../i18n/LanguageContext.jsx';
import './Projects.css';

export default function Projects({ projects, onAddDependency, onRemoveDependency, onDeleteProject, onCreateProject }) {
  const { t } = useLanguage();
  const dependencyCount = projects.reduce((total, project) => total + project.dependencies.length, 0);

  return (
    <div className="projects-page page-enter">
      <div className="page-intro-row">
        <p className="page-intro">{t('Cada repositorio es una superficie de ataque. Añade proyectos y dependencias para ver dónde importa cada alerta.')}</p>
        <div className="project-counts">
          <span><strong>{projects.length.toString().padStart(2, '0')}</strong> {t('PROYECTOS')}</span>
          <span><strong>{dependencyCount.toString().padStart(2, '0')}</strong> {t('PAQUETES')}</span>
        </div>
      </div>

      {projects.length > 0 ? (
        <div className="projects-grid">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onAddDependency={onAddDependency}
              onRemoveDependency={onRemoveDependency}
              onDeleteProject={onDeleteProject}
            />
          ))}
          <button className="project-add-card" type="button" onClick={onCreateProject}>
            <span className="add-card-icon"><Icon name="plus" size={19} /></span>
            <strong>{t('Vigila otro proyecto')}</strong>
            <span>{t('Conecta un repositorio a tu radar.')}</span>
          </button>
        </div>
      ) : (
        <section className="projects-empty">
          <span className="projects-empty-mark"><Icon name="box" size={25} /></span>
          <span className="section-index">{t('REPOSITORIOS / 00')}</span>
          <h2>{t('Empieza por tu código.')}</h2>
          <p>{t('Crea un proyecto y añade sus dependencias. Flaw encontrará las vulnerabilidades que coincidan con tu stack.')}</p>
          <button className="button button-primary" type="button" onClick={onCreateProject}>
            <Icon name="plus" size={16} /> {t('Crear primer proyecto')}
          </button>
        </section>
      )}
    </div>
  );
}
