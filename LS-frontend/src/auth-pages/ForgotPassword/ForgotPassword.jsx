import React from "react";
import "./ForgotPassword.css";
import { Link } from "react-router-dom";
import NavBar from "../../components/NavBar/NavBar";
import Footer from "../../components/Footer/Footer";

function ForgotPassword() {
  return (
    <>
    <NavBar/>
    <div className="forgot-form">
      <div className="forgot-form-card">
        <div className="forgot-form-welcome">
          Reset Password
          <p>Enter your email to receive reset instructions</p>
        </div>

        <form>
          <div className="forgot-form-input-box">
            <input
              type="email"
              placeholder="Enter your email"
              required
            />
          </div>

          <button type="submit" className="forgot-form-btn">
            Send Reset Link
          </button>
        </form>

        <div className="forgot-form-login">
          Remember your password?{" "}
          <Link to="/login" className="forgot-reg-text">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
    <Footer/>
    </>
  );
}

export default ForgotPassword;
