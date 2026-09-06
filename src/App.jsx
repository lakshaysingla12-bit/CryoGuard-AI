import { useState } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar/Sidebar";
import Worker from "./components/Worker/Worker";

function App() {
  const [activePage, setActivePage] = useState("dashboard");

  return (
    <div className="app-layout">

      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <main>
        <Worker activePage={activePage} />
      </main>

    </div>
  );
}

export default App;