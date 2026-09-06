import { User } from "lucide-react";

function Messages() {
  return (
    <section className="dashboard-card messages-card">

      <div className="section-header">
        <h2>Messages</h2>
        <button>View all</button>
      </div>

      <div className="message-item">

        <div className="message-icon">
          <User size={18} />
        </div>

        <div className="message-content">
          <h3>Supervisor</h3>
          <p>
            Please ensure all checks are completed before shift ends.
          </p>
        </div>

        <span className="message-time">10:30 AM</span>

      </div>

    </section>
  );
}

export default Messages;