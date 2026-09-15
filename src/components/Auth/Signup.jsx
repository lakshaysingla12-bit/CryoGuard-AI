import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Snowflake, ArrowRight, X } from "lucide-react";

export default function Signup({
  isOpen = true,
  onClose,
  initialMode = "signup",
}) {
  const [isLogin, setIsLogin] = useState(initialMode === "login");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    setIsLogin(initialMode === "login");
    setErrors({});
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    if (!isLogin) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = "Full name is required.";
      } else if (formData.fullName.trim().length < 3) {
        newErrors.fullName = "Name must be at least 3 characters.";
      }
      if (!formData.role) newErrors.role = "Please select your role.";
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password.";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match.";
      }
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(
      "Submit button clicked! Current Mode:",
      isLogin ? "LOGIN" : "SIGNUP",
    );
    console.log("Raw Form State:", formData);

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      console.warn(
        "❌ Form submission stopped due to validation errors:",
        validationErrors,
      );
      setErrors(validationErrors);
      return;
    }

    console.log(
      "✅ SUCCESS PAYLOAD:",
      isLogin ? "Logging in:" : "Signing up:",
      formData,
    );

    // Agar aapne alert lagaya hai:
    alert(
      isLogin
        ? `Logged in as ${formData.email}`
        : `Account created for ${formData.fullName}`,
    );

    if (onClose) onClose();
  };

  const switchMode = (loginState) => {
    setIsLogin(loginState);
    setErrors({});
    // Switch karte hi input fields reset ho jayengi:
    setFormData({
      fullName: "",
      email: "",
      role: "",
      password: "",
      confirmPassword: "",
      rememberMe: false,
    });
  };
  // createPortal ensures modal is attached to document.body, avoiding CSS transform traps
  return createPortal(
    <div className="auth-overlay" onClick={onClose}>
      <div
        className={`auth-card ${!isLogin ? "auth-signup-card" : ""}`}
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
            className={`auth-mode-btn ${!isLogin ? "active" : ""}`}
            onClick={() => switchMode(false)}
          >
            Sign Up
          </button>
          <button
            type="button"
            className={`auth-mode-btn ${isLogin ? "active" : ""}`}
            onClick={() => switchMode(true)}
          >
            Sign In
          </button>
        </div>

        {/* Heading */}
        <div className="auth-heading">
          <span className="auth-label">
            {isLogin ? "WELCOME BACK" : "GET STARTED"}
          </span>
          <h1>{isLogin ? "Log In to CryoGuard" : "Create Your Account"}</h1>
          <p>
            {isLogin
              ? "Access your telemetry logs and cold-chain portal."
              : "Join CryoGuard AI and start monitoring your cold-chain operations."}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {!isLogin && (
            <div className="auth-field">
              <label htmlFor="fullName">Full name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className={errors.fullName ? "auth-input-error" : ""}
              />
              {errors.fullName && (
                <span className="auth-error">{errors.fullName}</span>
              )}
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="email">Email address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={errors.email ? "auth-input-error" : ""}
            />
            {errors.email && <span className="auth-error">{errors.email}</span>}
          </div>

          {!isLogin && (
            <div className="auth-field">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={errors.role ? "auth-input-error" : ""}
              >
                <option value="" disabled>
                  Select your role
                </option>
                <option value="manager">Manager</option>
                <option value="auditor">Auditor</option>
                <option value="worker">Worker</option>
              </select>
              {errors.role && <span className="auth-error">{errors.role}</span>}
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={
                isLogin ? "Enter your password" : "Create a password"
              }
              className={errors.password ? "auth-input-error" : ""}
            />
            {errors.password && (
              <span className="auth-error">{errors.password}</span>
            )}
          </div>

          {!isLogin && (
            <div className="auth-field">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className={errors.confirmPassword ? "auth-input-error" : ""}
              />
              {errors.confirmPassword && (
                <span className="auth-error">{errors.confirmPassword}</span>
              )}
            </div>
          )}

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

              <a href="#forgot-password" className="auth-forgot">
                Forgot password?
              </a>
            </div>
          )}

          <button type="submit" className="auth-submit">
            {isLogin ? "Log In to CryoGuard" : "Create Account"}
            <ArrowRight size={17} />
          </button>
        </form>

        <div className="auth-switch">
          <span>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </span>
          <button
            type="button"
            className="auth-switch-btn"
            onClick={() => switchMode(!isLogin)}
          >
            {isLogin ? "Sign Up" : "Sign in"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
