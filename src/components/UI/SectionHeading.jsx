export default function SectionHeading({
  label,
  title,
  description,
}) {
  return (
    <div className="lp-section-heading">
      <span className="lp-section-label">
        {label}
      </span>

      <h2>{title}</h2>

      {description && <p>{description}</p>}
    </div>
  );
}