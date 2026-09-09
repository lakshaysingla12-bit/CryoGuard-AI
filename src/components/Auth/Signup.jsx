import { Link } from "react-router-dom";
import { Snowflake, ArrowRight } from "lucide-react";

export default function Signup() {
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
          <span className="auth-label">GET STARTED</span>

          <h1>Create your account</h1>

          <p>
            Join CryoGuard AI and start monitoring your cold-chain
            operations.
          </p>
        </div>

        {/* Signup Form */}
        <form className="auth-form">

          {/* Full Name */}
          <div className="auth-field">
            <label htmlFor="fullName">Full name</label>

            <input
              type="text"
              id="fullName"
              name="fullName"
              placeholder="Enter your full name"
            />
          </div>

          {/* Email */}
          <div className="auth-field">
            <label htmlFor="signupEmail">Email address</label>

            <input
              type="email"
              id="signupEmail"
              name="email"
              placeholder="Enter your email"
            />
          </div>

          {/* Role */}
          <div className="auth-field">
            <label htmlFor="role">Role</label>

            <select
              id="role"
              name="role"
              defaultValue=""
            >
              <option value="" disabled>
                Select your role
              </option>

              <option value="manager">Manager</option>
              <option value="auditor">Auditor</option>
              <option value="worker">Worker</option>
            </select>
          </div>

          {/* Password */}
          <div className="auth-field">
            <label htmlFor="signupPassword">Password</label>

            <input
              type="password"
              id="signupPassword"
              name="password"
              placeholder="Create a password"
            />
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
              placeholder="Confirm your password"
            />
          </div>

          {/* Submit */}
          <button type="submit" className="auth-submit">
            Create account
            <ArrowRight size={17} />
          </button>

        </form>

        {/* Login Link */}
        <div className="auth-switch">
          <span>Already have an account?</span>

          <Link to="/login">
            Login
          </Link>
        </div>

      </div>
    </div>
  );
}