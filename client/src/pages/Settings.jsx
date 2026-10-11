import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/PageHeader.jsx";

function Settings() {
  const { user } = useAuth();
  const [form, setForm] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const canEdit = user.role === "Manager";

  useEffect(() => {
    api("/settings").then(setForm);
  }, []);

  // one handler for every input, it uses the input's name
  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    setMessage({ type: "", text: "" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const saved = await api("/settings", { method: "PUT", body: form });
      setForm(saved);
      setMessage({ type: "success", text: "Settings saved" });
    } catch (err) {
      setMessage({ type: "danger", text: err.message });
    }
  }

  if (!form) return <p className="text-secondary">Loading settings...</p>;

  return (
    <>
      <PageHeader title="Settings" subtitle="Company details, alert rules and notifications" />

      <form onSubmit={handleSubmit}>
        <fieldset disabled={!canEdit}>
          <div className="row g-3">
            <div className="col-lg-6">
              <div className="card-box h-100">
                <h5 className="card-title-text">Company</h5>
                <label className="form-label">Company name (shown on PDF reports)</label>
                <input className="form-control" name="companyName" value={form.companyName} onChange={handleChange} />
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card-box h-100">
                <h5 className="card-title-text">Alert rules</h5>
                <div className="row">
                  <div className="col-6">
                    <label className="form-label">Warning margin (°C)</label>
                    <input type="number" step="0.5" className="form-control" name="warningMargin" value={form.warningMargin} onChange={handleChange} />
                  </div>
                  <div className="col-6">
                    <label className="form-label">AI look-ahead (min)</label>
                    <input type="number" step="10" className="form-control" name="aiHorizonMinutes" value={form.aiHorizonMinutes} onChange={handleChange} />
                  </div>
                </div>
                <small className="text-secondary d-block mt-2">
                  A vehicle turns "warning" when it is this close to its limit.
                </small>
              </div>
            </div>

            <div className="col-12">
              <div className="card-box">
                <h5 className="card-title-text">Fleet and notifications</h5>

                <div className="form-check form-switch mb-2">
                  <input className="form-check-input" type="checkbox" id="autoDispatch" name="autoDispatch" checked={form.autoDispatch} onChange={handleChange} />
                  <label className="form-check-label" htmlFor="autoDispatch">Send vehicles back automatically after a delivery</label>
                </div>
                <div className="form-check form-switch mb-2">
                  <input className="form-check-input" type="checkbox" id="emailAlerts" name="emailAlerts" checked={form.emailAlerts} onChange={handleChange} />
                  <label className="form-check-label" htmlFor="emailAlerts">Email critical alerts</label>
                </div>
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" id="smsAlerts" name="smsAlerts" checked={form.smsAlerts} onChange={handleChange} />
                  <label className="form-check-label" htmlFor="smsAlerts">SMS critical alerts</label>
                </div>
              </div>
            </div>
          </div>
        </fieldset>

        <div className="mt-3 d-flex align-items-center gap-3">
          {canEdit ? (
            <button type="submit" className="btn btn-info">Save changes</button>
          ) : (
            <span className="text-secondary">Only a Manager can change settings.</span>
          )}
          {message.text && <span className={"text-" + message.type}>{message.text}</span>}
        </div>
      </form>
    </>
  );
}

export default Settings;
