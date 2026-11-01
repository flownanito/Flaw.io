import Icon from '../Icon/Icon.jsx';
import './StatCard.css';

export default function StatCard({ label, value, note, icon, tone = 'lime', accent }) {
  return (
    <article className={`stat-card stat-card-${tone}`}>
      <div className="stat-top">
        <span className="stat-icon"><Icon name={icon} size={17} /></span>
        <span className="stat-accent">{accent}</span>
      </div>
      <p className="stat-label">{label}</p>
      <div className="stat-value">{value}</div>
      <p className="stat-note">{note}</p>
    </article>
  );
}
