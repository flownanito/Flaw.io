import { severityLabel } from '../../utils/formatters.js';
import { useLanguage } from '../../i18n/LanguageContext.jsx';
import './StatusPill.css';

export default function StatusPill({ severity, children, className = '' }) {
  const { language } = useLanguage();
  const level = (severity || 'unknown').toLowerCase();
  return <span className={`status-pill status-${level} ${className}`}>{children ?? severityLabel(severity, language)}</span>;
}
