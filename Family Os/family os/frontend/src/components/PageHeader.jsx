const PageHeader = ({ title, subtitle, action }) => {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="page-action">{action}</div>}
    </header>
  );
};

export default PageHeader;
