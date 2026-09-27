import './SectionHeader.css';

/* Section title with optional supporting line and a trailing action.
   The title is a real heading; `level` keeps the document outline right. */

export default function SectionHeader({
  title,
  description,
  action,
  level = 2,
  id,
  className = '',
}) {
  const Heading = `h${level}`;

  return (
    <header className={`bw-section-header ${className}`}>
      <div className="bw-section-header__text">
        <Heading className="bw-section-header__title" id={id}>
          {title}
        </Heading>
        {description && <p className="bw-section-header__description">{description}</p>}
      </div>
      {action && <div className="bw-section-header__action">{action}</div>}
    </header>
  );
}
