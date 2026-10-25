import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Snowflake,
  ArrowRight,
  X,
  Building2,
  Hospital,
  ShieldCheck,
  Truck,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { DEMO_CREDENTIALS } from "../../api/demoAuth";

export default function Signup({
  isOpen = true,
  onClose,
  initialMode = "signup",
  onAuthenticate,
}) {
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "manager", // default
    password: "",
    confirmPassword: "",
    // Manager specific
    companyName: "",
    sourceName: "",
    // Auditor specific
    facilityName: "",
    facilityType: "Hospital",
    licenseNo: "",
    // Common
    location: "Mumbai",
    phone: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");

  useEffect(() => {
    setIsLogin(initialMode === "login");
    setErrors({});
    setGeneralError("");
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setGeneralError("");
  };

  const handleQuickDemoSelect = (roleKey) => {
    const demo = DEMO_CREDENTIALS[roleKey];
    if (!demo) return;
    setFormData((prev) => ({
      ...prev,
      role: demo.role,
      email: demo.email,
      password: demo.password,
    }));
    setErrors({});
    setGeneralError("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.role) {
      newErrors.role = "Please select your role.";
    }

    if (isLogin) {
      if (!formData.email.trim()) {
        newErrors.email = "Account ID or email is required.";
      }
      if (!formData.password) {
        newErrors.password = "Password is required.";
      }
    } else {
      // Sign up validations
      if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
        newErrors.fullName = "Full name is required (min 2 characters).";
      }

      if (!formData.email.trim()) {
        newErrors.email = "Email address is required.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Please enter a valid email address.";
      }

      if (!formData.password) {
        newErrors.password = "Password is required.";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters.";
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Confirm password is required.";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match.";
      }

      // Role specific fields
      if (formData.role === "manager") {
        if (!formData.companyName.trim()) {
          newErrors.companyName = "Company name is required for Managers.";
        }
      } else if (formData.role === "auditor") {
        if (!formData.facilityName.trim()) {
          newErrors.facilityName = "Receiving facility or hospital name is required for Auditors.";
        }
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        if (onAuthenticate) {
          await onAuthenticate({
            role: formData.role,
            identifier: formData.email.trim(),
            password: formData.password,
            isSignup: false,
          });
        }
      } else {
        // Sign up
        if (onAuthenticate) {
          await onAuthenticate({
            ...formData,
            isSignup: true,
          });
        }
      }
      onClose?.();
    } catch (err) {
      setGeneralError(err.message || "Authentication failed. Please verify your details.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (loginState) => {
    setIsLogin(loginState);
    setErrors({});
    setGeneralError("");
    setFormData((prev) => ({
      ...prev,
      email: "",
      password: "",
      confirmPassword: "",
    }));
  };

  return createPortal(
    <div className="auth-overlay" onClick={onClose}>
      <div
        className={`auth-card ${!isLogin ? "auth-signup-card" : ""}`}
        style={{ maxWidth: isLogin ? "440px" : "560px", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        {onClose && (
          <button
            type="button"
            className="auth-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        )}

        <div className="auth-bg-glow auth-bg-glow-one"></div>
        <div className="auth-bg-glow auth-bg-glow-two"></div>
        <div className="auth-grid-background"></div>

        {/* Brand Header */}
        <div className="auth-logo">
          <span className="auth-logo-icon">
            <Snowflake size={20} />
          </span>
          <span>
            CryoGuard <b>AI</b>
          </span>
        </div>

        {/* Mode Switch Tabs */}
        <div className="auth-mode-tabs">
          <button
            type="button"
            className={`auth-mode-btn ${isLogin ? "active" : ""}`}
            onClick={() => switchMode(true)}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-mode-btn ${!isLogin ? "active" : ""}`}
            onClick={() => switchMode(false)}
          >
            Sign Up
          </button>
        </div>

        {/* Heading */}
        <div className="auth-heading">
          <span className="auth-label">
            {isLogin ? "UNBROKEN COLD CHAIN ACCESS" : "JOIN CRYOGUARD PLATFORM"}
          </span>
          <h1>{isLogin ? "Log In to Your Portal" : "Create Professional Account"}</h1>
          <p>
            {isLogin
              ? "Select your operational role and enter your authorized credentials."
              : "Register as a Cold-Chain Manager or Facility Auditor to manage and verify live shipments."}
          </p>
        </div>

        {generalError && (
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "8px",
              color: "#f87171",
              fontSize: "13px",
              marginBottom: "16px",
            }}
          >
            {generalError}
          </div>
        )}

        {/* Quick Demo Selector for Sign In */}
        {isLogin && (
          <div style={{ marginBottom: "18px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--cyan)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
              Quick Demo Logins (Click to autofill)
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              <button
                type="button"
                onClick={() => handleQuickDemoSelect("manager")}
                style={{
                  padding: "8px 6px",
                  background: formData.role === "manager" && formData.email === DEMO_CREDENTIALS.manager.email ? "rgba(56, 189, 248, 0.2)" : "rgba(15, 23, 42, 0.8)",
                  border: formData.role === "manager" && formData.email === DEMO_CREDENTIALS.manager.email ? "1px solid #38bdf8" : "1px solid #334155",
                  borderRadius: "6px",
                  color: "#e2e8f0",
                  cursor: "pointer",
                  fontSize: "11px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Building2 size={15} color="#38bdf8" />
                <span style={{ fontWeight: 600 }}>Manager</span>
                <span style={{ fontSize: "9px", color: "#94a3b8" }}>Arvind (MCPE)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoSelect("worker")}
                style={{
                  padding: "8px 6px",
                  background: formData.role === "worker" && formData.email === DEMO_CREDENTIALS.worker.email ? "rgba(34, 197, 94, 0.2)" : "rgba(15, 23, 42, 0.8)",
                  border: formData.role === "worker" && formData.email === DEMO_CREDENTIALS.worker.email ? "1px solid #22c55e" : "1px solid #334155",
                  borderRadius: "6px",
                  color: "#e2e8f0",
                  cursor: "pointer",
                  fontSize: "11px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Truck size={15} color="#22c55e" />
                <span style={{ fontWeight: 600 }}>Worker</span>
                <span style={{ fontSize: "9px", color: "#94a3b8" }}>Priya · {DEMO_CREDENTIALS.worker.id}</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoSelect("auditor")}
                style={{
                  padding: "8px 6px",
                  background: formData.role === "auditor" && formData.email === DEMO_CREDENTIALS.auditor.email ? "rgba(168, 85, 247, 0.2)" : "rgba(15, 23, 42, 0.8)",
                  border: formData.role === "auditor" && formData.email === DEMO_CREDENTIALS.auditor.email ? "1px solid #a855f7" : "1px solid #334155",
                  borderRadius: "6px",
                  color: "#e2e8f0",
                  cursor: "pointer",
                  fontSize: "11px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <ShieldCheck size={15} color="#a855f7" />
                <span style={{ fontWeight: 600 }}>Auditor</span>
                <span style={{ fontSize: "9px", color: "#94a3b8" }}>Kabir (Pune Hub)</span>
              </button>
            </div>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Role Selection */}
          <div className="auth-field">
            <label htmlFor="role">
              {isLogin ? "Operational Role" : "Register As"}
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={errors.role ? "auth-input-error" : ""}
            >
              <option value="manager">Company Manager (Fleet & Operations)</option>
              <option value="auditor">Hospital / Facility Auditor (Quality & Intake)</option>
              {isLogin && <option value="worker">Driver / Cold-Chain Worker</option>}
            </select>
            {errors.role && <span className="auth-error">{errors.role}</span>}
          </div>

          {/* SIGN UP ONLY: Full Name */}
          {!isLogin && (
            <div className="auth-field">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Dr. Rajesh Sharma"
                className={errors.fullName ? "auth-input-error" : ""}
              />
              {errors.fullName && <span className="auth-error">{errors.fullName}</span>}
            </div>
          )}

          {/* Email / Identifier */}
          <div className="auth-field">
            <label htmlFor="email">
              {isLogin ? "Account ID or Email" : "Professional Email Address"}
            </label>
            <input
              type={isLogin ? "text" : "email"}
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={isLogin
                ? formData.role === "worker"
                  ? `${DEMO_CREDENTIALS.worker.email} or ${DEMO_CREDENTIALS.worker.id}`
                  : formData.role === "auditor"
                    ? `${DEMO_CREDENTIALS.auditor.email} or ${DEMO_CREDENTIALS.auditor.id}`
                    : `${DEMO_CREDENTIALS.manager.email} or ${DEMO_CREDENTIALS.manager.id}`
                : "name@company.com"}
              className={errors.email ? "auth-input-error" : ""}
            />
            {errors.email && <span className="auth-error">{errors.email}</span>}
          </div>

          {/* SIGN UP ONLY: Role Specific Details */}
          {!isLogin && formData.role === "manager" && (
            <>
              <div className="auth-field">
                <label htmlFor="companyName">Company / Producer Name</label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="e.g. Mumbai Coastal Protein Exports"
                  className={errors.companyName ? "auth-input-error" : ""}
                />
                {errors.companyName && <span className="auth-error">{errors.companyName}</span>}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div className="auth-field">
                  <label htmlFor="location">Headquarters / City</label>
                  <select
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                  >
                    <option value="Mumbai">Mumbai</option>
                    <option value="Pune">Pune</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Chandigarh">Chandigarh</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Ahmedabad">Ahmedabad</option>
                    <option value="Jaipur">Jaipur</option>
                    <option value="Lucknow">Lucknow</option>
                    <option value="Indore">Indore</option>
                  </select>
                </div>

                <div className="auth-field">
                  <label htmlFor="phone">Contact Phone</label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 00000"
                  />
                </div>
              </div>
            </>
          )}

          {!isLogin && formData.role === "auditor" && (
            <>
              <div className="auth-field">
                <label htmlFor="facilityName">Destination Hospital / Receiving Facility</label>
                <input
                  type="text"
                  id="facilityName"
                  name="facilityName"
                  value={formData.facilityName}
                  onChange={handleChange}
                  placeholder="e.g. AIIMS Hospital or Pune Vaccine Distribution Hub"
                  className={errors.facilityName ? "auth-input-error" : ""}
                />
                {errors.facilityName && <span className="auth-error">{errors.facilityName}</span>}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div className="auth-field">
                  <label htmlFor="facilityType">Facility Type</label>
                  <select
                    id="facilityType"
                    name="facilityType"
                    value={formData.facilityType}
                    onChange={handleChange}
                  >
                    <option value="Hospital">Hospital / Clinical Center</option>
                    <option value="Warehouse">Cold-Chain Distribution Warehouse</option>
                    <option value="Cold Store">Depot / Cold Storage Facility</option>
                  </select>
                </div>

                <div className="auth-field">
                  <label htmlFor="location">Facility City</label>
                  <select
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                  >
                    <option value="Pune">Pune</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Chandigarh">Chandigarh</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Ahmedabad">Ahmedabad</option>
                    <option value="Nagpur">Nagpur</option>
                  </select>
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="licenseNo">Auditor License / Registration ID</label>
                <input
                  type="text"
                  id="licenseNo"
                  name="licenseNo"
                  value={formData.licenseNo}
                  onChange={handleChange}
                  placeholder="e.g. LIC-QA-8821 or Medical Council ID"
                />
              </div>
            </>
          )}

          {/* Password */}
          <div className="auth-field">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label htmlFor="password">Password</label>
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  fontSize: "11px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                <span>{showPassword ? "Hide" : "Show"}</span>
              </button>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={isLogin ? "Enter password (demo: password123)" : "Create a password (min 6 chars)"}
              className={errors.password ? "auth-input-error" : ""}
            />
            {errors.password && <span className="auth-error">{errors.password}</span>}
          </div>

          {/* Confirm Password (Sign up only) */}
          {!isLogin && (
            <div className="auth-field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                className={errors.confirmPassword ? "auth-input-error" : ""}
              />
              {errors.confirmPassword && (
                <span className="auth-error">{errors.confirmPassword}</span>
              )}
            </div>
          )}

          {/* Remember me for login */}
          {isLogin && (
            <div className="auth-options">
              <label className="auth-checkbox">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <span>Remember me</span>
              </label>
              <span className="auth-forgot" style={{ fontSize: "11px", color: "#94a3b8" }}>
                Default password: <b>password123</b>
              </span>
            </div>
          )}

          <button type="submit" className="auth-submit" disabled={loading}>
            <span>
              {loading
                ? "Connecting…"
                : isLogin
                ? `Enter ${formData.role === "manager" ? "Manager" : formData.role === "auditor" ? "Auditor" : "Worker"} Portal`
                : `Register as ${formData.role === "manager" ? "Manager" : "Auditor"}`}
            </span>
            <ArrowRight size={17} />
          </button>
        </form>

        <div className="auth-switch">
          <span>
            {isLogin ? "Need a new portal account?" : "Already registered?"}
          </span>
          <button
            type="button"
            className="auth-switch-btn"
            onClick={() => switchMode(!isLogin)}
          >
            {isLogin ? "Sign Up as Manager / Auditor" : "Sign In to Portal"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
