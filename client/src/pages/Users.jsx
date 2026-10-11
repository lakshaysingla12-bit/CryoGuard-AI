import { useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import useFetch from "../context/useFetch";
import PageHeader from "../components/PageHeader.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import Modal from "../components/Modal.jsx";

const roles = ["Manager", "Dispatcher", "Auditor"];

function Users() {
  const { user: me } = useAuth();
  const { data, reload } = useFetch("/users");
  const [showForm, setShowForm] = useState(false);

  async function remove(id) {
    if (!window.confirm("Remove this user?")) return;
    try {
      await api("/users/" + id, { method: "DELETE" });
      reload();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <>
      <PageHeader title="Users" subtitle="Who can log in to CryoGuard AI">
        <button className="btn btn-info btn-sm" onClick={() => setShowForm(true)}>
          <i className="bi bi-person-plus me-1"></i>Add User
        </button>
      </PageHeader>

      <div className="card-box">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data?.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="avatar avatar-sm">{u.name.charAt(0)}</div>
                      {u.name}
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td><StatusBadge status={u.status} /></td>
                  <td className="text-end">
                    {u.id !== me.id && (
                      <button className="btn btn-outline-danger btn-sm" onClick={() => remove(u.id)}>
                        <i className="bi bi-trash"></i>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <AddUserForm
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            reload();
          }}
        />
      )}
    </>
  );
}

function AddUserForm({ onClose, onSaved }) {
  const [form, setForm] = useState({ name: "", email: "", role: "Dispatcher", password: "" });
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await api("/users", { method: "POST", body: form });
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Modal title="Add User" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <label className="form-label">Full name</label>
        <input className="form-control mb-3" name="name" value={form.name} onChange={handleChange} required />

        <label className="form-label">Email</label>
        <input type="email" className="form-control mb-3" name="email" value={form.email} onChange={handleChange} required />

        <div className="row mb-3">
          <div className="col">
            <label className="form-label">Role</label>
            <select className="form-select" name="role" value={form.role} onChange={handleChange}>
              {roles.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="col">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" name="password" value={form.password} onChange={handleChange} required />
          </div>
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-info">Save user</button>
        </div>
      </form>
    </Modal>
  );
}

export default Users;
