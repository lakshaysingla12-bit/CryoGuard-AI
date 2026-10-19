import { useEffect, useState } from "react";
import {
  getUsers,
  addUser,
  updateUser,
  deleteUser,
} from "../api/usersApi.js";

const emptyForm = {
  name: "",
  email: "",
  role: "Worker",
  team: "",
  status: "Active",
  location: "",
  phone: "",
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (editingId) {
        await updateUser(editingId, form);
      } else {
        await addUser({
          ...form,
          id: `usr-${Date.now()}`,
        });
      }

      closeForm();
      await loadUsers();
    } catch (err) {
      setError(err.message || "User save nahi ho paaya.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(user) {
    if (!window.confirm(`${user.name} ka profile delete karein?`)) return;

    try {
      setError("");
      await deleteUser(user.id);
      await loadUsers();
    } catch (err) {
      setError(err.message || "User delete nahi ho paaya.");
    }
  }

  return (
    <div className="profiles-page">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="h3 mb-1">Users</h1>
          <p className="text-secondary mb-0">
            Manage Worker, Manager and Auditor profiles
          </p>
        </div>

        <button
          type="button"
          className="btn btn-info"
          onClick={openAddForm}
        >
          <i className="bi bi-person-plus me-2" />
          Add user
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
              />
            </label>

            <label>
              Role
              <select
                className="form-select"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option>Worker</option>
                <option>Manager</option>
                <option>Auditor</option>
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
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.team || "—"}</td>
                    <td>{user.status || "Active"}</td>
                    <td>
                      <div className="d-flex gap-2">
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