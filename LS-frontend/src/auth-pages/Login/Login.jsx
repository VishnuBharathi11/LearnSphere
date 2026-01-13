import React from "react";
import "./Login.css";
import { Link } from "react-router-dom";
import Footer from "../../components/Footer/Footer";
import NavBar from "../../components/NavBar/NavBar";

function Login() {
  return (
    <>
    <NavBar/>
    <div className="log-form">
      <div className="log-form-card">
        <div className="log-page-name">LearnSphere</div>

        <div className="log-form-welcome">
          Welcome Back
          <p>Login to continue learning</p>
        </div>

        <form>
          <div className="log-form-input-box">
            <input
              type="text"
              placeholder="Username"
              required
            />
          </div>

          <div className="log-form-input-box">
            <input
              type="password"
              placeholder="Password"
              required
            />
          </div>

          <div className="log-btn-forgot">
            <button type="submit" className="log-form-btn">
              Login
            </button>

            <Link to="/forgot-password" className="log-form-forgot">
              Forgot Password?
            </Link>
          </div>
        </form>

        <div className="log-form-register">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="log-reg-text">
            Register here
          </Link>
        </div>
      </div>
    </div>
    <Footer/>
    </>
  );
}

export default Login;
