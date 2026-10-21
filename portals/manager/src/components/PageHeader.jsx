// Title and subtitle at the top of a page. Children (buttons) go on the right.
function PageHeader({ title, subtitle, children }) {
  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
      <div>
        <h2 className="page-title mb-1">{title}</h2>
        <p className="text-secondary mb-0">{subtitle}</p>
      </div>
      <div className="d-flex gap-2">{children}</div>
    </div>
  );
}

export default PageHeader;
