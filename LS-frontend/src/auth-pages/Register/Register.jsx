import React, { useState } from "react";
import "./Register.scss";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar/NavBar";
import Footer from "../../components/Footer/Footer";
import { normalizeApiError, registerUser } from "../../services/authApi";
import { getAdminSettings } from "../../services/adminApi";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [registrationEnabled, setRegistrationEnabled] = useState(true);

  React.useEffect(() => {
    let active = true;
    async function loadSettings() {
      try {
        const settings = await getAdminSettings();
        if (!active) return;
        setRegistrationEnabled(Boolean(settings?.userRegistration ?? true));
      } catch {
        if (!active) return;
        setRegistrationEnabled(true);
      }
    }
    loadSettings();
    return () => {
      active = false;
    };
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!registrationEnabled) {
      setError("User registration is currently disabled by admin.");
      return;
    }

    if (!form.username || !form.email || !form.password) {
      setError("Please fill all required fields");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await registerUser({
        name: form.username,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: "learner",
      });

      navigate("/login");
    } catch (apiError) {
      setError(normalizeApiError(apiError, "Registration failed"));
    }
  };

  return (
    <>
      <NavBar />
      <div className="reg-form">
        <div className="reg-form-card">
          <div className="reg-page-name">LearnSphere</div>
          <div className="reg-form-welcome">
            Create Account
            <p>Join LearnSphere today</p>
          </div>
          {error && <p className="error">{error}</p>}
          {!registrationEnabled && <p className="error">Registrations are temporarily disabled.</p>}
          <form onSubmit={handleRegister} autoComplete="off">
            <div className="reg-form-input">
              <input
                name="username"
                type="text"
                placeholder="Username"
                onChange={handleChange}
                required
                disabled={!registrationEnabled}
              />
            </div>
            <div className="reg-form-input">
              <input
                name="email"
                type="email"
                placeholder="Email"
                onChange={handleChange}
                required
                disabled={!registrationEnabled}
              />
            </div>
            <div className="reg-form-input">
              <input
                name="phone"
                type="text"
                placeholder="Phone Number"
                onChange={handleChange}
                disabled={!registrationEnabled}
              />
            </div>
            <div className="reg-form-input">
              <input
                name="password"
                type="password"
                placeholder="Password"
                onChange={handleChange}
                required
                disabled={!registrationEnabled}
              />
            </div>
            <div className="reg-form-input">
              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                onChange={handleChange}
                required
                disabled={!registrationEnabled}
              />
            </div>
            <button type="submit" className="reg-form-btn" disabled={!registrationEnabled}>
              Register
            </button>
          </form>
          <div className="reg-form-login">
            Already have an account?
            <Link to="/login" className="reg-text">
              Login
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Register;
