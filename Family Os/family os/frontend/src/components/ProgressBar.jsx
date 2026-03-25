const ProgressBar = ({ value = 0, max = 100 }) => {
  const percent = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="progress">
      <div className="progress-fill" style={{ width: `${percent}%` }} />
      <span className="progress-label">{percent}%</span>
    </div>
  );
};

export default ProgressBar;
