import React, { useState } from "react";
import {
  X,
  User,
  Building2,
  MapPin,
  Phone,
  Mail,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Copy,
  Check,
  BadgeCheck,
  Save,
  AlertCircle
} from "lucide-react";
import { sound } from "../utils/soundFx";

export default function UserProfileModal({
  profile,
  onUpdateProfile,
  onClose,
  onToast,
  onAddAuditLog
}) {
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "security"
  const [copiedField, setCopiedField] = useState(null);

  // Editable Contact State
  const [contactNo, setContactNo] = useState(profile.contactNo || "+1 (212) 555-0194");
  const [email, setEmail] = useState(profile.email || "e.rostova@metrogeneral.health");
  const [extension, setExtension] = useState(profile.extension || "Ext. 4421");

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    sound.click();
    setTimeout(() => setCopiedField(null), 2000);
    if (onToast) {
      onToast({
        type: "info",
        title: "Copied to Clipboard",
        message: `${fieldName} copied successfully.`,
      });
    }
  };

  const handleSaveContactInfo = (e) => {
    e.preventDefault();
    sound.success();
    const updated = {
      ...profile,
      contactNo,
      email,
      extension,
    };
    if (onUpdateProfile) {
      onUpdateProfile(updated);
    }
    if (onAddAuditLog) {
      onAddAuditLog(
        "OFFICER_PROFILE_UPDATED",
        profile.userId,
        `Contact information updated for ${profile.name} (Phone: ${contactNo}, Email: ${email}).`
      );
    }
    if (onToast) {
      onToast({
        type: "success",
        title: "Profile Contact Updated",
        message: "Officer contact credentials successfully saved to system registry.",
      });
    }
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPassError("");
    setPassSuccess("");

    if (!currentPassword) {
      setPassError("Please enter your current officer password.");
      sound.alert();
      return;
    }
    if (newPassword.length < 8) {
      setPassError("New password must be at least 8 characters long.");
      sound.alert();
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError("New password and confirm password do not match.");
      sound.alert();
      return;
    }
    if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setPassError("Password must include at least one uppercase letter and one number.");
      sound.alert();
      return;
    }

    // Success
    sound.success();
    setPassSuccess("Password updated and verified under hospital security protocols.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    if (onAddAuditLog) {
      onAddAuditLog(
        "SECURITY_CREDENTIALS_CHANGED",
        profile.userId,
        `Authentication password rotated for User ${profile.username} (${profile.name}).`
      );
    }

    if (onToast) {
      onToast({
        type: "success",
        title: "Password Changed",
        message: "Your new password is now active for all system verifications.",
      });
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-dialog user-profile-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "660px" }}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-header__title-group">
            <User className="modal-header__icon text-cyan" size={24} />
            <div>
              <h3>Officer Credentials &amp; Facility Profile</h3>
              <p>Official Hospital Quality Intake Operator Identity</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: "20px 24px" }}>
          {/* Hero Officer Header Card */}
          <div className="profile-hero-card">
            <div className="profile-hero-avatar">
              <span className="avatar-text">ER</span>
              <span className="online-pip" />
            </div>
            <div className="profile-hero-details">
              <div className="profile-hero-name-row">
                <h4>{profile.name}</h4>
                <span className="badge badge--admitted">
                  <BadgeCheck size={13} style={{ marginRight: 3 }} />
                  Verified Quality Officer
                </span>
              </div>
              <div className="profile-hero-role">{profile.designation}</div>
              <div className="profile-hero-meta-row">
                <span className="meta-item mono">
                  <strong>User ID:</strong> {profile.userId}
                  <button
                    className="btn-copy-tiny"
                    onClick={() => handleCopy(profile.userId, "User ID")}
                    title="Copy User ID"
                  >
                    {copiedField === "User ID" ? <Check size={12} className="text-emerald" /> : <Copy size={12} />}
                  </button>
                </span>
                <span className="meta-sep">·</span>
                <span className="meta-item mono">
                  <strong>Username:</strong> @{profile.username}
                </span>
                <span className="meta-sep">·</span>
                <span className="meta-item text-cyan">
                  {profile.department}
                </span>
              </div>
            </div>
          </div>

          {/* Tab Navigation (2 Tabs: Facility/Officer Info & Change Password) */}
          <div className="profile-tabs-bar">
            <button
              className={`profile-tab-btn ${activeTab === "overview" ? "profile-tab-btn--active" : ""}`}
              onClick={() => {
                sound.click();
                setActiveTab("overview");
              }}
            >
              <Building2 size={15} />
              <span>Facility &amp; Officer Info</span>
            </button>
            <button
              className={`profile-tab-btn ${activeTab === "security" ? "profile-tab-btn--active" : ""}`}
              onClick={() => {
                sound.click();
                setActiveTab("security");
              }}
            >
              <KeyRound size={15} />
              <span>Change Password</span>
            </button>
          </div>

          {/* ───────────────────────────────────────────────────────────
              TAB 1: FACILITY & OFFICER INFO
             ─────────────────────────────────────────────────────────── */}
          {activeTab === "overview" && (
            <div className="profile-tab-content">
              {/* Facility Details Box */}
              <div className="profile-section-card">
                <div className="section-card-title">
                  <Building2 size={15} className="text-cyan" />
                  <span>Medical Center &amp; Firm Identity</span>
                </div>
                <div className="profile-grid-2col">
                  <div className="info-item">
                    <span className="info-label">Firm / Hospital Name</span>
                    <span className="info-val font-bold text-cyan">{profile.firmName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Operational Department</span>
                    <span className="info-val text-primary font-medium">{profile.department}</span>
                  </div>
                  <div className="info-item full-width">
                    <span className="info-label">
                      <MapPin size={12} style={{ marginRight: 4, display: "inline" }} />
                      Hospital Physical Address
                    </span>
                    <span className="info-val">{profile.hospitalAddress}</span>
                  </div>
                  <div className="info-item full-width">
                    <span className="info-label">Receiving Terminal Bay</span>
                    <span className="info-val mono">{profile.terminalId} · Receiving Bay 03</span>
                  </div>
                </div>
              </div>

              {/* Officer Contact & Credentials Box */}
              <div className="profile-section-card" style={{ marginTop: "14px" }}>
                <div className="section-card-title">
                  <User size={15} className="text-cyan" />
                  <span>Officer Contact &amp; Professional Credentials</span>
                </div>

                <form onSubmit={handleSaveContactInfo}>
                  <div className="profile-grid-2col">
                    <div className="info-item">
                      <span className="info-label">Officer Full Name</span>
                      <span className="info-val font-bold">{profile.name}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Official Designation</span>
                      <span className="info-val">{profile.designation}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Username (System Login)</span>
                      <span className="info-val mono text-cyan">@{profile.username}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">State Pharmacy License</span>
                      <span className="info-val mono">{profile.licenseNo}</span>
                    </div>

                    {/* Editable Contact Fields */}
                    <div className="info-item">
                      <label className="info-label">
                        <Phone size={11} style={{ marginRight: 4, display: "inline" }} />
                        Officer Contact Number
                      </label>
                      <input
                        type="text"
                        className="profile-input"
                        value={contactNo}
                        onChange={(e) => setContactNo(e.target.value)}
                        placeholder="+1 (212) 555-0194"
                      />
                    </div>
                    <div className="info-item">
                      <label className="info-label">
                        <Mail size={11} style={{ marginRight: 4, display: "inline" }} />
                        Official Hospital Email
                      </label>
                      <input
                        type="email"
                        className="profile-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.rostova@metrogeneral.health"
                      />
                    </div>
                  </div>

                  <div className="profile-card-footer-action">
                    <button type="submit" className="btn-primary btn-sm btn-primary--cyan font-bold">
                      <Save size={14} />
                      <span>Save Contact Updates</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────
              TAB 2: CHANGE PASSWORD
             ─────────────────────────────────────────────────────────── */}
          {activeTab === "security" && (
            <div className="profile-tab-content">
              <div className="profile-section-card">
                <div className="section-card-title">
                  <KeyRound size={15} className="text-cyan" />
                  <span>Update Authentication Password</span>
                </div>
                <p className="section-card-desc">
                  Maintain unique, confidential credentials for secure digital receiving records and hospital intake sign-offs.
                </p>

                {passError && (
                  <div className="profile-alert profile-alert--error">
                    <AlertCircle size={15} />
                    <span>{passError}</span>
                  </div>
                )}
                {passSuccess && (
                  <div className="profile-alert profile-alert--success">
                    <CheckCircle2 size={15} />
                    <span>{passSuccess}</span>
                  </div>
                )}

                <form onSubmit={handlePasswordChange} className="password-form">
                  <div className="form-group-field">
                    <label>Current Officer Password</label>
                    <div className="pass-input-wrapper">
                      <input
                        type={showCurrentPass ? "text" : "password"}
                        className="profile-input"
                        placeholder="Enter current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="pass-toggle-btn"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                      >
                        {showCurrentPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group-field">
                    <label>New Secure Password</label>
                    <div className="pass-input-wrapper">
                      <input
                        type={showNewPass ? "text" : "password"}
                        className="profile-input"
                        placeholder="Min 8 chars, 1 uppercase, 1 number"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="pass-toggle-btn"
                        onClick={() => setShowNewPass(!showNewPass)}
                      >
                        {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group-field">
                    <label>Confirm New Password</label>
                    <div className="pass-input-wrapper">
                      <input
                        type={showConfirmPass ? "text" : "password"}
                        className="profile-input"
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="pass-toggle-btn"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                      >
                        {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div className="password-rules-box">
                    <span className="rules-title">Password Security Criteria:</span>
                    <ul>
                      <li className={newPassword.length >= 8 ? "rule-pass" : ""}>
                        {newPassword.length >= 8 ? "✓" : "○"} At least 8 characters long
                      </li>
                      <li className={/[A-Z]/.test(newPassword) ? "rule-pass" : ""}>
                        {/[A-Z]/.test(newPassword) ? "✓" : "○"} At least one uppercase letter (A-Z)
                      </li>
                      <li className={/[0-9]/.test(newPassword) ? "rule-pass" : ""}>
                        {/[0-9]/.test(newPassword) ? "✓" : "○"} At least one numerical digit (0-9)
                      </li>
                    </ul>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary btn-primary--cyan font-bold"
                    style={{ marginTop: "12px", width: "100%", justifyContent: "center" }}
                  >
                    <Lock size={15} />
                    <span>Update Officer Password</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-actions" style={{ padding: "14px 24px", justifyContent: "flex-end" }}>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
