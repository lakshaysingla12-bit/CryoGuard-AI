import { Link } from "react-router-dom";
import { Snowflake, ArrowRight } from "lucide-react";

export default function Login() {
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

          <h1>Sign in to CryoGuard</h1>

          <p>
            Monitor your cold-chain operations and stay one step ahead.
          </p>
        </div>

        {/* Login Form */}
        <form className="auth-form">

          <div className="auth-field">
            <label htmlFor="email">Email address</label>

            <input
              type="email"
              id="email"
              placeholder="Enter your email"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>

            <input
              type="password"
              id="password"
              placeholder="Enter your password"
            />
          </div>

          <div className="auth-options">
            <label className="auth-checkbox">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>

            <a href="#forgot-password" className="auth-forgot">
              Forgot password?
            </a>
          </div>

          <button type="submit" className="auth-submit">
            Sign in
            <ArrowRight size={17} />
          </button>

        </form>

        {/* Signup Link */}
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