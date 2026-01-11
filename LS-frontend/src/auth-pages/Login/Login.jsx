import React from 'react';
import './Login.css';
import { Link } from 'react-router-dom';
import logo from '../../assets/Logo/logo.png'; 
function Login() {
  return (
    <div className="form">
    <div className="form-card">
          <img src={logo} className="logo"/>
          <div className="page-name">LearnSphere</div>
      <div className="">
        <div className="form-welcome">Welcome Back
        <p className="">Login to continue learning</p>
        </div>
        
        <form className="">
          <div className="form-input-box">
            <input type="text" placeholder="Username" name="name" required />
          </div>
          <div className="form-input-box">
            <input type="password" placeholder="Password" name="password" required />
          </div>
          <div className="btn-forgot">
            <button type="submit" className="form-btn">Login</button>
            <Link to="/forgot-password" className="form-forgot">Forgot Password?</Link>
          </div>
        </form>

        <div className="form-register">
          Don't have an account? <Link to="/register"><span className="reg-text">Register here</span></Link>
        </div>
      </div>
    </div>
    </div>
  );
}

export default Login;