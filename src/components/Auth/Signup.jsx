import { useState } from "react";
import { Link } from "react-router-dom";
import { Snowflake, ArrowRight } from "lucide-react";

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear the error when the user starts correcting the field
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = "Name must be at least 3 characters.";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = "Please enter a valid email address.";
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = "Please select your role.";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      newErrors.password =
        "Password must be at least 8 characters.";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword =
        "Please confirm your password.";
    } else if (
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword =
        "Passwords do not match.";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    console.log("Signup form is valid:", formData);
  };

  return (
    <div className="auth-page">

      <div className="auth-bg-glow auth-bg-glow-one"></div>
      <div className="auth-bg-glow auth-bg-glow-two"></div>
      <div className="auth-grid-background"></div>

      <div className="auth-card auth-signup-card">

        {/* Logo */}
        <Link to="/" className="auth-logo">
          <span className="auth-logo-icon">
            <Snowflake size={20} />
          </span>

          <span>
            CryoGuard <b>AI</b>
          </span>
        </Link>

        {/* Heading */}
        <div className="auth-heading">
          <span className="auth-label">
            GET STARTED
          </span>

          <h1>Create your account</h1>

          <p>
            Join CryoGuard AI and start monitoring your
            cold-chain operations.
          </p>
        </div>

        {/* Signup Form */}
        <form
          className="auth-form"
          onSubmit={handleSubmit}
          noValidate
        >

          {/* Full Name */}
          <div className="auth-field">
            <label htmlFor="fullName">
              Full name
            </label>

            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={
                errors.fullName ? "auth-input-error" : ""
              }
            />

            {errors.fullName && (
              <span className="auth-error">
                {errors.fullName}
              </span>
            )}
          </div>

          {/* Email */}
          <div className="auth-field">
            <label htmlFor="signupEmail">
              Email address
            </label>

            <input
              type="email"
              id="signupEmail"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={
                errors.email ? "auth-input-error" : ""
              }
            />

            {errors.email && (
              <span className="auth-error">
                {errors.email}
              </span>
            )}
          </div>

          {/* Role */}
          <div className="auth-field">
            <label htmlFor="role">
              Role
            </label>

            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={
                errors.role ? "auth-input-error" : ""
              }
            >
              <option value="" disabled>
                Select your role
              </option>

              <option value="manager">
                Manager
              </option>

              <option value="auditor">
                Auditor
              </option>

              <option value="worker">
                Worker
              </option>
            </select>

            {errors.role && (
              <span className="auth-error">
                {errors.role}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="auth-field">
            <label htmlFor="signupPassword">
              Password
            </label>

            <input
              type="password"
              id="signupPassword"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              className={
                errors.password ? "auth-input-error" : ""
              }
            />

            {errors.password && (
              <span className="auth-error">
                {errors.password}
              </span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="auth-field">
            <label htmlFor="confirmPassword">
              Confirm password
            </label>

            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className={
                errors.confirmPassword
                  ? "auth-input-error"
                  : ""
              }
            />

            {errors.confirmPassword && (
              <span className="auth-error">
                {errors.confirmPassword}
              </span>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="auth-submit"
          >
            Create account
            <ArrowRight size={17} />
          </button>

        </form>

        {/* Login Link */}
        <div className="auth-switch">
          <span>
            Already have an account?
          </span>

          <Link to="/login">
            Login
          </Link>
        </div>

      </div>
    </div>
  );
}