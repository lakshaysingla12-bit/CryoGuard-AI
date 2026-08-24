import { useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar/Sidebar'

function App() {
  return (
    <div className="app-layout">
      <Sidebar />

      <main>
        <h1>Dashboard</h1>
      </main>
    </div>
  );
}

export default App
