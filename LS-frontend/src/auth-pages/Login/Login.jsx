import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Login.scss";
import Footer from "../../components/Footer/Footer";
import NavBar from "../../components/NavBar/NavBar";
import UserData from "../../data/UsersData";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from;

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const adminExists = users.some((u) => u.role === "admin");
    if (!adminExists) {
      const adminUser = {
        id: 1,
        username: "Admin",
        email: "admin@learnsphere.com",
        phone: "",
        password: "admin123",
        role: "admin",
      };
      localStorage.setItem("users", JSON.stringify([...users, adminUser]));
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    let users = [];
    try {
      const stored = localStorage.getItem("users");
      users = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Invalid users data in localStorage. Resetting...",error);
      localStorage.removeItem("users");
      users = [];
    }
    const user = users.find(
      (u) => u.email === email && u.password === password,
    );
    if (!user) {
      setError("Invalid email or password");
      return;
    }
    localStorage.setItem("currentUser", JSON.stringify(user));
    localStorage.setItem("isLoggedIn", "true");

    if (redirectTo) {
      navigate(redirectTo, { replace: true });
      return;
    }

    if (user.role === "learner") navigate("/student-layout",{replace:true});
    if (user.role === "instructor") navigate("/instructor-layout",{replace:true});
    if (user.role === "admin") navigate("/admin-layout",{replace:true});
  };

  return (
    <>
      <NavBar />
      <div className="log-form">
        <div className="log-form-card">
          <div className="log-page-name">LearnSphere</div>

          <div className="log-form-welcome">
            Welcome Back
            <p>Login to continue learning</p>
          </div>
          {error && <p className="error">{error}</p>}
          <form>
            <div className="log-form-input-box">
              <input
                type="email"
                placeholder="Email"
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="log-form-input-box">
              <input
                type="password"
                placeholder="Password"
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="log-btn-forgot">
              <button
                type="button"
                className="log-form-btn"
                onClick={handleLogin}
              >
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
      <Footer />
    </>
  );
}

export default Login;
