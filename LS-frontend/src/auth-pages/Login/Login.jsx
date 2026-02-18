import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Login.scss";
import Footer from "../../components/Footer/Footer";
import NavBar from "../../components/NavBar/NavBar";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from;

  // ✅ Ensure admin ALWAYS exists correctly
  useEffect(() => {
    let users = [];

    try {
      const stored = localStorage.getItem("users");
      users = stored ? JSON.parse(stored) : [];

      if (!Array.isArray(users)) throw new Error();
    } catch {
      users = [];
    }

    const adminEmail = "admin@learnsphere.com";

    const adminExists = users.some(
      (u) => u.email?.toLowerCase() === adminEmail
    );

    if (!adminExists) {
      const adminUser = {
        id: Date.now(),
        name: "Admin",
        email: adminEmail,
        phone: "",
        password: "admin123",
        role: "admin",
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem("users", JSON.stringify([...users, adminUser]));
    }
  }, []);

  // ✅ Login handler
  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    let users = [];

    try {
      const stored = localStorage.getItem("users");
      users = stored ? JSON.parse(stored) : [];

      if (!Array.isArray(users)) throw new Error();
    } catch {
      setError("User database corrupted. Reset localStorage.");
      localStorage.removeItem("users");
      return;
    }

    const user = users.find(
      (u) =>
        u.email?.toLowerCase() === email.trim().toLowerCase() &&
        u.password === password.trim()
    );

    if (!user) {
      setError("Invalid email or password");
      return;
    }

    // ✅ Save session
    localStorage.setItem("currentUser", JSON.stringify(user));
    localStorage.setItem("isLoggedIn", "true");

    // ✅ Safe redirect logic
    if (redirectTo) {
      navigate(redirectTo, { replace: true });
      return;
    }

    switch (user.role) {
      case "learner":
        navigate("/student-layout", { replace: true });
        break;

      case "instructor":
        navigate("/instructor-layout", { replace: true });
        break;

      case "admin":
        navigate("/admin-layout", { replace: true });
        break;

      default:
        navigate("/", { replace: true });
    }
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

          <form onSubmit={handleLogin}>
            <div className="log-form-input-box">
              <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="log-form-input-box">
              <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
