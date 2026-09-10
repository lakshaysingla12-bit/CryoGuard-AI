import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function Button({
  children,
  to,
  variant = "primary",
  showIcon = true,
  className = "",
  onClick,
}) {
  const buttonContent = (
    <>
      <span>{children}</span>
      {showIcon && <ArrowRight size={17} />}
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        className={`lp-btn lp-btn-${variant} ${className}`}
        onClick={onClick}
      >
        {buttonContent}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`lp-btn lp-btn-${variant} ${className}`}
    >
      {buttonContent}
    </button>
  );
}
