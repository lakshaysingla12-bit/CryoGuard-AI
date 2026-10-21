import { useEffect, useState } from "react";
import {
  getUsers,
  addUser,
  updateUser,
  deleteUser,
} from "../api/usersApi.js";
import { api } from "../api/client.js";
import useFetch from "../context/useFetch.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useLive } from "../context/LiveContext.jsx";

const emptyForm = {
  name: "",
  email: "",
  role: "Worker",
  team: "",
  status: "Active",
  location: "",
  phone: "",
  facilityId: "",
};

export default function Users() {
  const { user: currentUser } = useAuth();
  const { showToast } = useLive();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { data: facilities } = useFetch("/facilities");
  const { data: destinationAuditors } = useFetch("/destination-auditors");

  async function loadUsers() {
    try {
      setError("");
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message || "Users load nahi ho paaye.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function openAddForm() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setError("");
    setShowForm(true);
  }

  function startEdit(user) {
    setEditingId(user.id);
    setForm({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "Worker",
      team: user.team || "",
      status: user.status || "Active",
      location: user.location || "",
      phone: user.phone || "",
      facilityId: user.facilityId || user.hospitalId || "",
    });
    setError("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setError("");
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => {
      if (name === "name" && currentUser.companyId && current.role === "Worker" && !editingId) {
        const suffix = currentUser.companyId.toLowerCase();
        const localName = value.toLowerCase().trim().replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "");
        return { ...current, name: value, email: localName ? `${localName}.${suffix}@cryoguard.demo` : "" };
      }
      return { ...current, [name]: value };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const wasEditing = Boolean(editingId);
    const savedName = form.name;

    try {
      const facility = form.role === "Auditor"
        ? facilities?.find((entry) => entry.id === form.facilityId)
        : null;
      if (form.role === "Auditor" && !facility) {
        throw new Error("Select the facility this auditor is responsible for.");
      }
      const companySuffix = currentUser.companyId?.toLowerCase();
      const nextCompanyWorkerNumber = users.reduce((max, entry) => {
        const match = entry.id.match(/-(\d+)$/);
        return Math.max(max, Number(match?.[1] || 0));
      }, 0) + 1;
      const userId = form.role === "Auditor" ? facility.id : (editingId || (currentUser.companyId && form.role === "Worker"
        ? `wrk-${companySuffix}-${String(nextCompanyWorkerNumber).padStart(2, "0")}`
        : `usr-${Date.now()}`));
      const userPayload = form.role === "Auditor"
        ? {
            ...form,
            id: userId,
            facilityId: facility.id,
            facilityName: facility.name,
            facilityType: facility.facilityType || facility.type,
            hospitalId: facility.type === "Hospital" ? facility.id : "",
            hospitalName: facility.type === "Hospital" ? facility.name : "",
            location: facility.location,
            locationId: facility.locationId,
          }
        : { ...form, id: userId };

      if (editingId) {
        const previous = users.find((user) => user.id === editingId);
        const previousFacilityId = previous?.facilityId || previous?.hospitalId;
        if (previous?.role === "Auditor" && previousFacilityId && previousFacilityId !== userPayload.facilityId) {
          await api(`/facilities/${encodeURIComponent(previousFacilityId)}`, {
            method: "PATCH",
            body: { auditorId: "", auditorName: "" },
          });
          await deleteUser(editingId);
          await addUser(userPayload);
        } else {
          await updateUser(editingId, userPayload);
        }
      } else {
        await addUser(userPayload);
      }
      if (facility) {
        await api(`/facilities/${encodeURIComponent(facility.id)}`, {
          method: "PATCH",
          body: { auditorId: userId, auditorName: form.name },
        });
      }

      closeForm();
      await loadUsers();
      showToast({ title: wasEditing ? "Worker updated" : "Worker added", message: `${savedName} · ${userId}`, kind: "success" });
    } catch (err) {
      setError(err.message || "User save nahi ho paaya.");
      showToast({ title: "Could not save user", message: err.message, kind: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(user) {
    if (!window.confirm(`${user.name} ka profile delete karein?`)) return;

    try {
      setError("");
      const facilityId = user.role === "Auditor" ? (user.facilityId || user.hospitalId) : null;
      if (facilityId) {
        await api(`/facilities/${encodeURIComponent(facilityId)}`, {
          method: "PATCH",
          body: { auditorId: "", auditorName: "" },
        });
      }
      await deleteUser(user.id);
      await loadUsers();
      showToast({ title: user.role === "Auditor" ? "Auditor removed" : "Worker removed", message: `${user.name} was removed from the roster.`, kind: "success" });
    } catch (err) {
      setError(err.message || "User delete nahi ho paaya.");
      showToast({ title: "Could not remove worker", message: err.message, kind: "error" });
    }
  }

  return (
    <div className="profiles-page">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="h3 mb-1">Users</h1>
          <p className="text-secondary mb-0">
            {currentUser?.companyId ? `Your company workers and auditors at shipment destinations · ${currentUser.companyId}` : "Manage Worker, Manager and Auditor profiles"}
          </p>
        </div>

        <button
          type="button"
          className="btn btn-info"
          onClick={openAddForm}
        >
          <i className="bi bi-person-plus me-2" />
          {currentUser?.companyId ? "Add worker" : "Add user"}
        </button>
      </div>

      {showForm && (
        <form className="card-box mb-4" onSubmit={handleSubmit}>
          <h2 className="card-title-text">
            {editingId ? "Edit user" : "Add user"}
          </h2>

          <div className="profile-form-grid">
            <label>
              Full name
              <input
                className="form-control"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Email
              <input
                className="form-control"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                readOnly={Boolean(currentUser.companyId && !editingId)}
              />
              {currentUser.companyId && !editingId && <small className="text-secondary">Generated from the worker name and your company ID.</small>}
            </label>

            <label>
              Role
              <select
                className="form-select"
                name="role"
                value={form.role}
                onChange={handleChange}
                disabled={Boolean(currentUser.companyId)}
              >
                <option>Worker</option>
                {!currentUser.companyId && <><option>Manager</option><option>Auditor</option></>}
              </select>
            </label>

            <label>
              Team
              <input
                className="form-control"
                name="team"
                value={form.team}
                onChange={handleChange}
                placeholder="e.g. Logistics"
              />
            </label>

            {form.role === "Auditor" && (
              <label>
                Receiving facility
                <select
                  className="form-select"
                  name="facilityId"
                  value={form.facilityId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a facility</option>
                  {(facilities || []).filter((entry) => !entry.auditorId || entry.auditorId === editingId).map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.name} · {entry.id}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label>
              Location
              <input
                className="form-control"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="City, Country"
              />
            </label>

            <label>
              Phone
              <input
                className="form-control"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </label>

            <label>
              Status
              <select
                className="form-select"
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </label>
          </div>

          {error && (
            <div className="alert alert-danger py-2 mt-3 mb-0">
              {error}
            </div>
          )}

          <div className="d-flex gap-2 mt-4">
            <button
              className="btn btn-info"
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Saving…"
                : editingId
                  ? "Save changes"
                  : "Add user"}
            </button>

            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={closeForm}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {currentUser?.companyId && <section className="card-box mt-4 mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
          <div>
            <h2 className="card-title-text mb-1">Destination auditors</h2>
            <p className="text-secondary small mb-0">Auditors responsible for facilities receiving your company’s shipments.</p>
          </div>
          <span className="badge facility-count-badge">{destinationAuditors?.length || 0} facilities</span>
        </div>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead><tr><th>Auditor</th><th>Receiving destination</th><th>Facility / login ID</th></tr></thead>
            <tbody>
              {(destinationAuditors || []).map((auditor) => <tr key={auditor.facilityId}>
                <td><div className="fw-semibold">{auditor.name}</div><small className="text-secondary">{auditor.email || "Facility auditor"}</small></td>
                <td><div>{auditor.facilityName}</div><small className="text-secondary">{auditor.facilityType} · {auditor.location}</small></td>
                <td>{auditor.facilityId}</td>
              </tr>)}
            </tbody>
          </table>
          {destinationAuditors?.length === 0 && <p className="text-secondary text-center mt-3 mb-0">No destination auditors are linked to current shipments.</p>}
        </div>
      </section>}

      <section className="card-box">
        <h2 className="card-title-text">Team profiles</h2>

        {error && !showForm && (
          <div className="alert alert-danger">{error}</div>
        )}

        {loading ? (
          <p className="text-secondary mb-0">Loading users…</p>
        ) : users.length === 0 ? (
          <p className="text-secondary mb-0">No users added yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Team</th>
                  <th>Company / facility</th>
                  <th>Worker ID</th>
                  <th>Status</th>
                  <th className="users-actions-heading">Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.team || "—"}</td>
                    <td>
                      {user.role === "Worker" ? (user.companyName || user.team || "Company worker") :
                        user.role === "Auditor" ? (user.facilityName || user.hospitalName || "Facility") :
                        user.role === "Company Manager" ? (user.companyName || "—") : "—"}
                    </td>
                    <td>{user.role === "Worker" ? user.id : "—"}</td>
                    <td>{user.status || "Active"}</td>
                    <td className="users-actions-cell">
                      <div className="d-flex justify-content-center gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-info"
                          onClick={() => startEdit(user)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(user)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
