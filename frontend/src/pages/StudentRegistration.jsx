import { useEffect, useState } from "react";
import API from "../services/api";
import banner from "../assets/vprotech-seo-banner.png";
import "./StudentRegistration.css";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  collegeName: "",
  semester: "",
  batch: "",
  rollNumber: "",
  attendanceStatus: "Present",
  password: "",
  confirmPassword: ""
};

const StudentRegistration = () => {
  const [formData, setFormData] = useState(initialForm);
  const [toastMessage, setToastMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setToastMessage("");
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [toastMessage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextValue =
      name === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setToastMessage("");
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      setLoading(true);

      await API.post("/students/register", formData);

      setToastMessage("Your attendance has been successfully recorded.");
      setFormData(initialForm);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sr-page">
      <div className="sr-card">
        {/* Form panel */}
        <main className="sr-form-panel">
          <header className="sr-header">
            <div className="sr-header-text">
              <h1>Student Attendance Form</h1>
              <p>Register your details and submit today's attendance.</p>
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
            <section className="sr-section">
              <h3 className="sr-section-title">Personal details</h3>

              <div className="sr-grid">

              <div className="sr-field sr-span-2">
                <label htmlFor="name">Full name</label>
                <input
                  id="name"
                  name="name"
                  placeholder="e.g. Simran Kaur"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="sr-field">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="sr-field">
                <label htmlFor="phone">Phone number</label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  placeholder="10-digit mobile number"
                  inputMode="numeric"
                  maxLength={10}
                  pattern="[0-9]{10}"
                  title="Enter exactly 10 digits."
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                  required
                />
              </div>
            </div>
            </section>

            <section className="sr-section">
              <h3 className="sr-section-title">College details</h3>

              <div className="sr-grid">

              <div className="sr-field sr-span-2">
                <label htmlFor="collegeName">College name</label>
                <input
                  id="collegeName"
                  name="collegeName"
                  placeholder="Your college or university"
                  value={formData.collegeName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="sr-field">
                <label htmlFor="semester">Semester</label>
                <input
                  id="semester"
                  name="semester"
                  placeholder="e.g. 6th"
                  value={formData.semester}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="sr-field">
                <label htmlFor="batch">Batch</label>
                <input
                  id="batch"
                  name="batch"
                  placeholder="e.g. 2022-2026"
                  value={formData.batch}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="sr-field sr-span-2">
                <label htmlFor="rollNumber">Roll number</label>
                <input
                  id="rollNumber"
                  name="rollNumber"
                  placeholder="Your college roll number"
                  value={formData.rollNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            </section>

            {/* <section className="sr-section">
              <h3 className="sr-section-title">Today's attendance</h3>

              <div className="sr-grid">

             <p className="sr-span-2">Present</p>
            </div>
            </section> */}

            <section className="sr-section">
              <h3 className="sr-section-title">Account security</h3>

              <div className="sr-grid">

              <div className="sr-field">
                <label htmlFor="password">Create password</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="sr-field">
                <label htmlFor="confirmPassword">Confirm password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>
            </section>

            <button type="submit" className="sr-submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Attendance"}
            </button>
          </form>
        </main>
      </div>
      {toastMessage && (
        <div className="sr-toast" role="status">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default StudentRegistration;