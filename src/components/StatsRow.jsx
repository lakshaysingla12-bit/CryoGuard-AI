import {
  Package,
  Truck,
  Thermometer,
  BrainCircuit,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'

import { statCards } from '../data/mockdata'

const icons = {
  Package,
  Truck,
  Thermometer,
  BrainCircuit,
  Clock
}

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus
}

export default function StatsRow() {
  return (
    <div className="stats-grid">
      {statCards.map((card) => {
        const Icon = icons[card.icon]
        const TrendIcon = trendIcons[card.trendDirection]

        return (
          <div key={card.id} className="panel stat-card">

            <div className="stat-card-header">
              <span className={`stat-icon tone-${card.tone}`}>
                <Icon size={18} />
              </span>

              <span className={`stat-trend tone-text-${card.tone}`}>
                <TrendIcon size={13} />
                {card.trend}
              </span>
            </div>

            <div>
              <p className="stat-value">{card.value}</p>
              <p className="stat-label">{card.label}</p>
            </div>

            <p className="stat-sub">{card.sub}</p>

          </div>
        )
      })}
    </div>
  )
}