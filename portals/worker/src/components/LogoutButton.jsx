import { LogOut } from "lucide-react";
import { clearDemoSession } from "../../../../src/api/demoAuth.js";

export default function LogoutButton() {
  const handleLogout = () => {
    clearDemoSession();
    window.location.assign("/");
  };

  return (
    <button
      type="button"
      className="portal-logout-btn"
      onClick={handleLogout}
      title="Log out"
      aria-label="Log out"
    >
      <LogOut size={18} aria-hidden="true" />
    </button>
  );
}
