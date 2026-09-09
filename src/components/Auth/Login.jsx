import { useState } from "react";
import { Link } from "react-router-dom";
import { Snowflake, ArrowRight } from "lucide-react";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Remove error while user corrects the field
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
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

    // Frontend validation successful.
    console.log("Login form is valid:", formData);
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-glow auth-bg-glow-one"></div>
      <div className="auth-bg-glow auth-bg-glow-two"></div>
      <div className="auth-grid-background"></div>

      <div className="auth-card">

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
          <span className="auth-label">WELCOME BACK</span>

          <h1>Login to CryoGuard</h1>

          <p>
            Monitor your cold-chain operations and stay one step ahead.
          </p>
        </div>

        {/* Login Form */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>

          {/* Email */}
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

            {errors.email && (
              <span className="auth-error">
                {errors.email}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="auth-field">
            <label htmlFor="password">Password</label>

            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={errors.password ? "auth-input-error" : ""}
            />

            {errors.password && (
              <span className="auth-error">
                {errors.password}
              </span>
            )}
          </div>

          {/* Options */}
          <div className="auth-options">
            <label className="auth-checkbox">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>

            <a href="#forgot-password" className="auth-forgot">
              Forgot password?
            </a>
          </div>

          {/* Submit */}
          <button type="submit" className="auth-submit">
            Login
            <ArrowRight size={17} />
          </button>

        </form>

        {/* Signup */}
        <div className="auth-switch">
          <span>Don't have an account?</span>

          <Link to="/signup">
            Create an account
          </Link>
        </div>

      </div>
    </div>
  );
}