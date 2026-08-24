import { Snowflake } from "lucide-react";
import "./Sidebar.css";

export default function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="sidebar-header">
        <span className="logo-icon">
          <Snowflake size={18} />
        </span>

        <span className="logo-text">
          CryoGuard <span>AI</span>
        </span>
      </div>

    </aside>
  );
}