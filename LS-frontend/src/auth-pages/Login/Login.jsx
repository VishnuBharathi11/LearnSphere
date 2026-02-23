import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Login.scss";
import Footer from "../../components/Footer/Footer";
import NavBar from "../../components/NavBar/NavBar";
import { loginUser, normalizeApiError } from "../../services/authApi";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await loginUser({ email, password });
      const fallbackName = data.email?.split("@")[0] || "User";
      const currentUser = {
        id: data.userId,
        userId: data.userId,
        email: data.email,
        role: data.role,
        name: fallbackName,
        username: fallbackName,
      };

      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("authToken", data.token || "");

      if (redirectTo) {
        navigate(redirectTo, { replace: true });
        return;
      }

      switch (data.role) {
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
    } catch (apiError) {
      setError(normalizeApiError(apiError, "Invalid email or password"));
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
