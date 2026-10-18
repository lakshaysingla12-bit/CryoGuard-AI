import { useEffect, useState } from "react";
import {
  getMyProfile,
  updateMyProfile,
} from "../api/myProfileApi.js";

export default function MyProfile() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getMyProfile()
      .then((myProfile) => {
        if (!myProfile) {
          throw new Error("My Profile db.json mein nahi mili.");
        }

        setForm({
          ...myProfile,
          role: "Manager",
          team: "Manager",
        });
      })
      .catch((err) => {
        console.error("My Profile load error:", err);
        setError(err.message || "Profile load nahi ho payi.");
      })
      .finally(() => setLoading(false));
  }, []);

  function change(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setSaved(false);
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const updated = await updateMyProfile({
        ...form,
        role: "Manager",
        team: "Manager",
        avatar: form.name
          .trim()
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => part[0])
          .join("")
          .toUpperCase(),
      });

      setForm({
        ...updated,
        role: "Manager",
        team: "Manager",
      });

      window.dispatchEvent(
        new CustomEvent("cryoguard-demo-profile-updated", {
          detail: {
            ...updated,
            role: "Manager",
            team: "Manager",
          },
        })
      );

      setSaved(true);
    } catch (err) {
      console.error("My Profile save error:", err);
      setError(err.message || "Profile save nahi ho payi.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="profiles-page">
        <div className="card-box text-secondary">
          Loading your profile…
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="profiles-page">
        <h1 className="h3 mb-3">My Profile</h1>
        <div className="alert alert-danger">
          {error || "Profile load nahi ho payi."}
        </div>
      </div>
    );
  }

  const initials =
    form.avatar ||
    form.name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();

  return (
    <div className="profiles-page">
      <div className="mb-4">
        <h1 className="h3 mb-1">My Profile</h1>
        <p className="text-secondary mb-0">
          View and update your profile details
        </p>
      </div>

      <div className="card-box mb-3 d-flex align-items-center gap-3">
        <div
          className="avatar profile-avatar-large"
          style={{ background: form.color || "#24475b" }}
        >
          {initials || "VM"}
        </div>

        <div>
          <h2 className="h5 mb-1">{form.name}</h2>
          <div className="text-secondary">Manager</div>
        </div>
      </div>

      <form className="card-box" onSubmit={submit}>
        <h2 className="card-title-text">Profile details</h2>

        <div className="profile-form-grid">
          <label>
            Full name
            <input
              className="form-control"
              name="name"
              value={form.name || ""}
              onChange={change}
              required
            />
          </label>

          <label>
            Email address
            <input
              className="form-control"
              type="email"
              name="email"
              value={form.email || ""}
              onChange={change}
              required
            />
          </label>

          <label>
            Role
            <input
              className="form-control"
              name="role"
              value="Manager"
              readOnly
            />
          </label>

          <label>
            Team
            <input
              className="form-control"
              name="team"
              value="Manager"
              readOnly
            />
          </label>

          <label>
            Location
            <input
              className="form-control"
              name="location"
              value={form.location || ""}
              onChange={change}
            />
          </label>

          <label>
            Phone
            <input
              className="form-control"
              name="phone"
              value={form.phone || ""}
              onChange={change}
            />
          </label>
        </div>

        {error && (
          <div className="alert alert-danger py-2 mt-3 mb-0">
            {error}
          </div>
        )}

        <div className="d-flex align-items-center gap-3 mt-4">
          <button
            type="submit"
            className="btn btn-info"
            disabled={saving}
          >
            {saving ? "Saving…" : "Save profile"}
          </button>

          {saved && (
            <span className="text-success small">
              <i className="bi bi-check-circle me-1" />
              Profile saved
            </span>
          )}
        </div>
      </form>
    </div>
  );
}