import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";
import Toasts from "./Toasts.jsx";

function Layout() {
  return (
    <div className="app-shell">
      <Sidebar />

      <div className="main-area">
        <Topbar />
        <main className="page-content">
          <Outlet />
        </main>
      </div>

      <Toasts />
    </div>
  );
}

export default Layout;
