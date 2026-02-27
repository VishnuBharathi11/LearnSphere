import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.scss";
import Footer from "../../components/Footer/Footer";
import NavBar from "../../components/NavBar/NavBar";
import { loginUser, normalizeApiError } from "../../services/authApi";
import { setCurrentUser, setAuthToken } from "../../services/userProfileStore";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await loginUser({ email, password });
      setAuthToken(data.token || "");
      const normalizedRole = (data.role || "").toLowerCase();
      const fallbackName = data.email?.split("@")[0] || "User";
      const resolvedName = data.name || fallbackName;

      setCurrentUser({
        id: data.userId,
        userId: data.userId,
        email: data.email,
        role: normalizedRole,
        name: resolvedName,
        username: resolvedName,
        phone: data.phone || "",
        image: data.profileImage || null,
      });

      navigate("/", { replace: true });
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
