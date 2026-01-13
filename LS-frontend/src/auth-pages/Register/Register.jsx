import React from "react";
import "./Register.css";
import { Link } from "react-router-dom";
import NavBar from "../../components/NavBar/NavBar";
import Footer from "../../components/Footer/Footer";

function Register() {
  return (
    <>
    <NavBar/>
    <div className="reg-form">
      <div className="reg-form-card">
        
        <div className="reg-page-name">LearnSphere</div>

        <div className="reg-form-welcome">
          Create Account
          <p>Join LearnSphere today</p>
        </div>

        <form>
          <div className="reg-form-input-box">
            <input type="text" placeholder="Username" required />
          </div>

          <div className="reg-form-input-box">
            <input type="email" placeholder="Email" required />
          </div>

          <div className="reg-form-input-box">
            <input type="text" placeholder="Phone Number" />
          </div>

          <div className="reg-form-input-box">
            <input type="password" placeholder="Password" required />
          </div>

          <div className="reg-form-input-box">
            <input type="password" placeholder="Confirm Password" required />
          </div>

          <button type="submit" className="reg-form-btn">
            Register
          </button>
        </form>

        <div className="reg-form-login">
          Already have an account?
          <Link to="/login" className="reg-text">
            Login here
          </Link>
        </div>
      </div>
    </div>
    <Footer/>
    </>
  );
}

export default Register;
