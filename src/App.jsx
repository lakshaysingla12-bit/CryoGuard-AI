import './App.css'
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

function App() {
  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Header />

        <h1>Dashboard</h1>
      </main>
    </div>
  );
}

export default App;