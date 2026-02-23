import React, { useState } from "react";
import "./ForgotPassword.scss";
import { Link } from "react-router-dom";
import NavBar from "../../components/NavBar/NavBar";
import Footer from "../../components/Footer/Footer";
import {
  normalizeApiError,
  resetPassword,
  sendForgotPasswordOtp,
} from "../../services/authApi";

function ForgotPassword() {
  const [step, setStep] = useState("send-otp");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const message = await sendForgotPasswordOtp(email);
      setSuccess(message || "OTP sent successfully");
      setStep("reset-password");
    } catch (apiError) {
      setError(normalizeApiError(apiError, "Failed to send OTP"));
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const message = await resetPassword({ email, otp, newPassword });
      setSuccess(message || "Password reset successful");
      setStep("done");
    } catch (apiError) {
      setError(normalizeApiError(apiError, "Failed to reset password"));
    }
  };

  return (
    <>
      <NavBar />
      <div className="forgot-form">
        <div className="forgot-form-card">
          <div className="forgot-form-welcome">
            Reset Password
            <p>
              {step === "send-otp"
                ? "Enter your email to receive OTP"
                : "Enter OTP and set a new password"}
            </p>
          </div>

          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}

          {step === "send-otp" && (
            <form onSubmit={handleSendOtp}>
              <div className="forgot-form-input-box">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="forgot-form-btn">
                Send OTP
              </button>
            </form>
          )}

          {step === "reset-password" && (
            <form onSubmit={handleResetPassword}>
              <div className="forgot-form-input-box">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="forgot-form-input-box">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>

              <div className="forgot-form-input-box">
                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="forgot-form-input-box">
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="forgot-form-btn">
                Reset Password
              </button>
            </form>
          )}

          {step === "done" && (
            <div className="forgot-form-login">
              Password updated. Please login with your new password.
            </div>
          )}

          <div className="forgot-form-login">
            Remember your password?{" "}
            <Link to="/login" className="forgot-reg-text">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ForgotPassword;
