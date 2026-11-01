import { severityLabel } from '../../utils/formatters.js';
import './StatusPill.css';

export default function StatusPill({ severity, children, className = '' }) {
  const level = (severity || 'unknown').toLowerCase();
  return <span className={`status-pill status-${level} ${className}`}>{children ?? severityLabel(severity)}</span>;
}
