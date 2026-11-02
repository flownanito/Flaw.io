import Icon from '../../components/Icon/Icon.jsx';
import { useLanguage } from '../../i18n/LanguageContext.jsx';
import './Settings.css';

const languageOptions = [
  { value: 'es', label: 'Español', nativeName: 'Español', code: 'ES' },
  { value: 'en', label: 'English', nativeName: 'English', code: 'EN' },
];

export default function Settings() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="settings-page page-enter">
      <section className="settings-card" aria-labelledby="language-settings-title">
        <div className="settings-card-heading">
          <span className="settings-card-icon"><Icon name="globe" size={20} /></span>
          <div>
            <span className="section-index">{t('Preferencias de la aplicación')}</span>
            <h2 id="language-settings-title">{t('Idioma')}</h2>
            <p>{t('Elige el idioma de la interfaz. Tu selección se guardará en este dispositivo.')}</p>
          </div>
        </div>

        <fieldset className="language-options">
          <legend>{t('Idioma actual')}</legend>
          {languageOptions.map((option) => (
            <label
              className={`language-option${language === option.value ? ' is-selected' : ''}`}
              key={option.value}
            >
              <input
                type="radio"
                name="language"
                value={option.value}
                checked={language === option.value}
                onChange={() => setLanguage(option.value)}
              />
              <span className="language-option-code" aria-hidden="true">{option.code}</span>
              <span className="language-option-copy">
                <strong>{option.label}</strong>
                <small>{option.nativeName}</small>
              </span>
              <Icon name="check" size={17} className="language-option-check" />
            </label>
          ))}
        </fieldset>
        <p className="settings-translation-note">
          {t('Los títulos y descripciones públicas de OSV se envían a DeepL para traducirse. Configura DEEPL_AUTH_KEY en el backend; si no está disponible, se mostrarán los textos originales.')}
        </p>
      </section>
    </div>
  );
}
