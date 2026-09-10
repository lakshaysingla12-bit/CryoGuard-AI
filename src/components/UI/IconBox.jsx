export default function IconBox({
  icon: Icon,
  size = 20,
  className = "",
}) {
  return (
    <div className={`lp-icon-box ${className}`}>
      <Icon size={size} />
    </div>
  );
}