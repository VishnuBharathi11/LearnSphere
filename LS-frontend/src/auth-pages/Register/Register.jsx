import React from "react";
import "./Register.css";
import { Link } from "react-router-dom";
import logo from "../../assets/Logo/logo.png";

function Register() {
  return (
    <div className="form">
      <div className="form-card">
        <img src={logo} alt="LearnSphere Logo" className="logo" />
        <div className="page-name">LearnSphere</div>

        <div className="form-welcome">
          Create Account
          <p>Join LearnSphere today</p>
        </div>

        <form>
          <div className="form-input-box">
            <input type="text" placeholder="Username" required />
          </div>

          <div className="form-input-box">
            <input type="email" placeholder="Email" required />
          </div>

          <div className="form-input-box">
            <input type="text" placeholder="Phone Number" />
          </div>

          <div className="form-input-box">
            <input type="password" placeholder="Password" required />
          </div>

          <div className="form-input-box">
            <input type="password" placeholder="Confirm Password" required />
          </div>

          <button type="submit" className="form-btn">
            Register
          </button>
        </form>

        <div className="form-register">
          Already have an account?
          <Link to="/login" className="reg-text">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
