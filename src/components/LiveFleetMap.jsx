import { Plus, Minus } from 'lucide-react'
import { fleetMarkers } from '../data/mockdata'

export default function LiveFleetMap() {
  return (
    <div className="panel map-panel">

      <div className="map-header">
        <div>
          <h3 className="map-title">Live Fleet Tracking</h3>

          <div className="map-legend">
            <span><span className="legend-dot normal"></span> Normal</span>
            <span><span className="legend-dot warning"></span> Warning</span>
            <span><span className="legend-dot critical"></span> Critical</span>
          </div>
        </div>

        <div className="map-controls">
          <button>Traffic</button>
          <button className="active">Temperature</button>
        </div>
      </div>

      <div className="map-canvas">

        <div className="map-grid"></div>

        <span className="map-city">Chandigarh</span>

        {fleetMarkers.map((truck) => (
          <div
            key={truck.id}
            className={`map-marker ${truck.status}`}
            style={{
              left: truck.x,
              top: truck.y
            }}
          >
            <span></span>
            <div className="marker-label">
              {truck.id}
            </div>
          </div>
        ))}

        <div className="zoom-controls">
          <button>
            <Plus size={14} />
          </button>

          <button>
            <Minus size={14} />
          </button>
        </div>

        <div className="temperature-legend">
          <p>Temperature (°C)</p>
          <div className="temperature-bar"></div>

          <div className="temperature-scale">
            <span>-30</span>
            <span>-10</span>
            <span>0</span>
            <span>15</span>
            <span>25</span>
          </div>
        </div>

      </div>
    </div>
  )
}