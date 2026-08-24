import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

function App() {
  return (
    <div className="app">
      <Sidebar/>

      <main className="main-content">
        <TopNavbar/>

        <div className="dashboard-content">
          <h1>Manager Dashboard</h1>
          <p>CryoGuard AI Fleet Management</p>
        </div>
      </main>
    </div>
  );
}

export default App
