import React, { useState } from "react";
import "./Login.css";
import { Link,useNavigate } from "react-router-dom";
import Footer from "../../components/Footer/Footer";
import NavBar from "../../components/NavBar/NavBar";
import UserData from "../UsersData/UsersData"

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
      const user = UserData.find(
      u => u.email === email && u.password === password
    );
    if (!user) {
      alert("Invalid credentials");
      return;
    }
    localStorage.setItem("role", user.role);

    if (user.role === "learner") navigate("/learner-dashboard");
    if (user.role === "instructor") navigate("/instructor");
    if (user.role === "admin") navigate("/admin");
  };

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
              required onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="log-form-input-box">
            <input
              type="password"
              placeholder="Password"
              required onChange={e => setPassword(e.target.value)}
            />
          </div>

          <div className="log-btn-forgot">
            <button type="submit" className="log-form-btn" onClick={handleLogin}>
              Login
            </button>

            <Link to="/forgot-password" className="log-form-forgot">
              Forgot Password?
            </Link>
          </div>
        </form>

        <div className="log-form-register">
          Don't have an account?
          <Link to="/register" className="log-reg-text">
            Register
          </Link>
        </div>
      </div>
    </div>
    <Footer/>
    </>
  );
}

export default Login;
