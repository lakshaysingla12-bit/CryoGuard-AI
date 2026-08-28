import './App.css'
import Sidebar from './components/Sidebar/Sidebar'
import Worker from './components/Worker/Worker'

function App() {
  return (
    <div className="app-layout">
      <Sidebar />

      <main>
        <Worker />
      </main>
    </div>
  )
}

export default App