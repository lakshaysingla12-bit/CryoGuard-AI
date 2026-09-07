import { AlertTriangle, AlertOctagon, CheckCircle2 } from 'lucide-react'
import { recentAlerts } from '../data/mockdata'
const icons = {
  crit: AlertOctagon,
  warn: AlertTriangle,
  ok: CheckCircle2
}

export default function RecentAlerts() {
  return (
    <div className="panel alerts-panel">
      <div className="alerts-header">
        <h3>Recent Alerts</h3>
        <span className="view-all">View All</span>
      </div>

      <div className="alerts-list">
        {recentAlerts.map((alert) => {
          const Icon = icons[alert.tone]

          return (
            <div className="alert-item" key={alert.id}>
              <Icon className={`alert-icon ${alert.tone}`} size={18} />
              <div className="alert-info">
                <p className="alert-title">{alert.title}</p>
                <p className="alert-meta">
                  {alert.truck} · {alert.time}
                </p>
              </div>

              <span className={`alert-badge ${alert.tone}`}>
                {alert.tone === 'crit' && 'Critical'}
                {alert.tone === 'warn' && 'Warning'}
                {alert.tone === 'ok' && 'Success'}
              </span>

            </div>
          )
        })}
      </div>
    </div>
  )
}