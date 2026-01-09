import React from "react";
import "./ForgotPassword.css";
import { Link } from "react-router-dom";

function ForgotPassword() {
  return (
    <div className="form">
      <div className="form-card">
        <div className="form-welcome">
          Reset Password
          <p>Enter your email to receive reset instructions</p>
        </div>

        <form>
          <div className="form-input-box">
            <input
              type="email"
              placeholder="Enter your email"
              required
            />
          </div>

          <button type="submit" className="form-btn">
            Send Reset Link
          </button>
        </form>

        <div className="form-register">
          Remember your password?
          <Link to="/login" className="reg-text">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
