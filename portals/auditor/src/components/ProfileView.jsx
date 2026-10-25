import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Save, Building2, ShieldCheck } from "lucide-react";
import { updateProfile } from "../store";

export default function ProfileView({ profile: propProfile, onUpdateProfile, onToast, onAddAuditLog }) {
  const dispatch = useDispatch();
  const reduxProfile = useSelector((state) => state.profile);
  const profile = propProfile || reduxProfile || {};

  const [firmName, setFirmName] = useState(profile.firmName || "Metro General Hospital");
  const [email, setEmail] = useState(profile.email || "");
  const [contactNo, setContactNo] = useState(profile.contactNo || "");

  useEffect(() => {
    if (profile.firmName) setFirmName(profile.firmName);
    if (profile.email) setEmail(profile.email);
    if (profile.contactNo) setContactNo(profile.contactNo);
  }, [profile.firmName, profile.email, profile.contactNo]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const updated = { ...profile, firmName, email, contactNo };
    dispatch(updateProfile(updated));
    if (onUpdateProfile) onUpdateProfile(updated);

    if (onAddAuditLog) {
      onAddAuditLog(
        "OFFICER_PROFILE_UPDATED",
        profile.userId,
        `Hospital & Officer profile updated for ${profile.name} (Hospital/Firm: ${firmName}, Phone: ${contactNo}, Email: ${email}).`
      );
    }
    if (onToast) {
      onToast({
        type: "success",
        title: "Profile updated",
        message: "Hospital and contact details have been successfully saved.",
      });
    }
  };

  return (
    <section className="account-page" aria-labelledby="profile-title">
      <header className="account-page__heading">
        <h1 id="profile-title">My Profile</h1>
        <p>View and manage officer credentials, hospital facility details, and contact information</p>
      </header>

      <div className="account-identity-card">
        <div className="account-avatar">ER</div>
        <div className="account-identity-info">
          <div className="account-identity-name-row">
            <h2>{profile.name}</h2>
            <span className="account-verified-tag">
              <ShieldCheck size={13} />
              GxP Authorized Officer
            </span>
          </div>
          <p className="account-role-text">{profile.designation}</p>
          <div className="account-hospital-badge">
            <Building2 size={16} className="text-cyan" />
            <div className="account-hospital-badge__text">
              <span className="account-hospital-badge__label">HOSPITAL / ORGANIZATION</span>
              <span className="account-hospital-badge__name">{firmName || profile.firmName || "Metro General Hospital"}</span>
            </div>
          </div>
        </div>
      </div>

      <form className="account-details-card" onSubmit={handleSubmit}>
        <h2>Profile details</h2>
        <div className="account-form-grid">
          <label>
            <span>Full name</span>
            <input value={profile.name || ""} readOnly />
          </label>
          <label className="form-field-hospital">
            <span className="field-label-with-icon">
              <Building2 size={14} className="text-cyan" />
              Hospital or firm name
            </span>
            <input
              type="text"
              value={firmName}
              onChange={(event) => setFirmName(event.target.value)}
              placeholder="e.g. Metro General Hospital"
              className="input-hospital-name"
            />
          </label>
          <label>
            <span>Role / Designation</span>
            <input value={profile.designation || ""} readOnly />
          </label>
          <label>
            <span>Department</span>
            <input value={profile.department || ""} readOnly />
          </label>
          <label className="account-form-grid__full">
            <span>Location / Physical address</span>
            <input value={profile.hospitalAddress || ""} readOnly />
          </label>
          <label>
            <span>Phone</span>
            <input
              type="tel"
              value={contactNo}
              onChange={(event) => setContactNo(event.target.value)}
              placeholder="+1 (212) 555-0194"
            />
          </label>
          <label>
            <span>Email address</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="e.rostova@metrogeneral.health"
            />
          </label>
        </div>
        <button type="submit" className="account-save-btn">
          <Save size={16} />
          Save profile
        </button>
      </form>
    </section>
  );
}
