import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import banner from "../assets/vprotech-seo-banner.png";
import "./StudentRegistration.css"; // shared styles (sr-* classes)
import "./AdminLogin.css";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const response = await API.post("/admin/login", formData);

      const { token } = response.data;

      // Store token for this learning project
      localStorage.setItem("adminToken", token);

      navigate("/admin/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sr-page">
      <div className="sr-card sr-card--narrow">
        <main className="sr-form-panel">
          <header className="sr-header">
            <div className="sr-header-text">
              <h1>Login</h1>
              <p>Login to manage student attendance.</p>
            </div>
            <img
              src={banner}
              alt="VProTech Digital"
              className="sr-logo"
            />
          </header>

          <div aria-live="polite">
            {error && <p className="sr-alert sr-error">{error}</p>}
          </div>

          <form onSubmit={handleSubmit} className="sr-form">
            <div className="sr-grid al-single">
              <div className="sr-field">
                <label htmlFor="email">Admin email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="username"
                  required
                />
              </div>

              <div className="sr-field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <button type="submit" className="sr-submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
            <button
              type="button"
              className="al-back-btn"
              onClick={() => navigate("/")}
            >
              Back to student registration
            </button>
          </form>
        </main>
      </div>
    </div>
  );
};

export default AdminLogin;