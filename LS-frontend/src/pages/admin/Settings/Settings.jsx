import { useEffect, useState } from "react";
import { getAdminSettings, saveAdminSettings } from "../../../services/adminApi";
import { getFriendlyErrorMessage } from "../../../services/apiError";
import "./Settings.scss";

function Settings() {
  const [settings, setSettings] = useState({
    siteName: "LearnSphere",
    siteEmail: "admin@learnsphere.com",
    supportEmail: "support@learnsphere.com",
    platformFeePercent: 15,
    minCoursePrice: 299,
    maxCoursePrice: 9999,
    userRegistration: true,
    emailVerification: true,
    discussions: true,
    autoApproveInstructors: false,
    autoApproveCourses: false,
    guestBrowsing: true,
    maintenanceMode: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getAdminSettings();
        setSettings((prev) => ({ ...prev, ...(data || {}) }));
      } catch (apiError) {
        setError(getFriendlyErrorMessage(apiError, "Failed to load admin settings"));
      }
    }
    load();
  }, []);

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    try {
      const minPrice = Number(settings.minCoursePrice || 0);
      const maxPrice = Number(settings.maxCoursePrice || 0);
      if (minPrice < 0 || maxPrice < 0) {
        setError("Min and max course price must be non-negative.");
        setSuccess("");
        return;
      }
      if (minPrice > maxPrice) {
        setError("Minimum course price cannot be greater than maximum course price.");
        setSuccess("");
        return;
      }

      const payload = {
        ...settings,
        platformFeePercent: Number(settings.platformFeePercent || 0),
        minCoursePrice: minPrice,
        maxCoursePrice: maxPrice,
      };
      const saved = await saveAdminSettings(payload);
      setSettings((prev) => ({ ...prev, ...(saved || {}) }));
      setSuccess("Settings saved successfully");
      setError("");
    } catch (apiError) {
      setError(getFriendlyErrorMessage(apiError, "Failed to save admin settings"));
      setSuccess("");
    }
  };

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="settings-layout">
      <div className="settings-wrapper">
        {error && <p className="admin-error">{error}</p>}
        {success && <p className="admin-success">{success}</p>}

        <div className="settings-card">
          <h3 className="card-title">General Settings</h3>

          <div className="form-grid">
            <div className="form-group">
              <label>Site Name</label>
              <input value={settings.siteName} onChange={(e) => handleChange("siteName", e.target.value)} />
            </div>

            <div className="form-group">
              <label>Site Email</label>
              <input value={settings.siteEmail} onChange={(e) => handleChange("siteEmail", e.target.value)} />
            </div>

            <div className="form-group full">
              <label>Support Email</label>
              <input value={settings.supportEmail} onChange={(e) => handleChange("supportEmail", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="settings-card">
          <h3 className="card-title">Payment Settings</h3>

          <div className="form-grid">
            <div className="form-group">
              <label>Platform Fee (%)</label>
              <input
                type="number"
                value={settings.platformFeePercent}
                onChange={(e) => handleChange("platformFeePercent", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Min Course Price (INR)</label>
              <input
                type="number"
                value={settings.minCoursePrice}
                onChange={(e) => handleChange("minCoursePrice", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Max Course Price (INR)</label>
              <input
                type="number"
                value={settings.maxCoursePrice}
                onChange={(e) => handleChange("maxCoursePrice", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="settings-card">
          <h3 className="card-title">Feature Toggles</h3>

          {[
            ["Enable User Registration", "userRegistration"],
            ["Require Email Verification", "emailVerification"],
            ["Enable Discussions", "discussions"],
            ["Auto-Approve Instructors", "autoApproveInstructors"],
            ["Auto-Approve Courses", "autoApproveCourses"],
            ["Allow Guest Browsing", "guestBrowsing"],
            ["Maintenance Mode", "maintenanceMode"],
          ].map(([label, key]) => (
            <div className="toggle-row" key={key}>
              <span>{label}</span>
              <div className={`toggle ${settings[key] ? "on" : ""}`} onClick={() => handleToggle(key)}>
                <div className="toggle-thumb" />
              </div>
            </div>
          ))}
        </div>

        <button className="save-btn" onClick={handleSave}>
          Save Settings
        </button>
      </div>
    </div>
  );
}

export default Settings;
