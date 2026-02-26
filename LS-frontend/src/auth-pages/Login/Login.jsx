import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Login.scss";
import Footer from "../../components/Footer/Footer";
import NavBar from "../../components/NavBar/NavBar";
import { loginUser, normalizeApiError } from "../../services/authApi";
import {
  getLearnerProfile,
  getRegistrationSeedByEmail,
  getInstructorProfile,
  setCurrentUser,
  setAuthToken,
} from "../../services/userProfileStore";

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
      const normalizedRole = (data.role || "").toLowerCase();
      const registrationSeed = getRegistrationSeedByEmail(data.email);
      const fallbackName = data.email?.split("@")[0] || "User";
      const resolvedName = data.name || registrationSeed?.name || fallbackName;
      const profile =
        data.userId && normalizedRole === "instructor"
          ? getInstructorProfile(data.userId)
          : data.userId
            ? getLearnerProfile(data.userId)
            : null;

      const currentUser = {
        id: data.userId,
        userId: data.userId,
        email: data.email,
        role: normalizedRole,
        name: profile?.fullName || resolvedName,
        username: profile?.fullName || resolvedName,
        phone: registrationSeed?.phone || "",
        image: profile?.image || null,
      };

      setCurrentUser(currentUser);
      setAuthToken(data.token || "");

      if (redirectTo) {
        navigate(redirectTo, { replace: true });
        return;
      }

      switch (normalizedRole) {
        case "learner":
          navigate("/student-layout/dashboard", { replace: true });
          break;
        case "instructor":
          navigate("/instructor-layout/dashboard", { replace: true });
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
