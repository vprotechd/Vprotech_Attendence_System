
import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function DailyAttendance() {
  const [formData, setFormData] = useState({
    rollNumber: "",
    password: "",
    status: "Present"
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await API.post(
        "/attendance/submit",
        formData
      );

      setMessage(response.data.message);

      setFormData({
        rollNumber: "",
        password: "",
        status: "Present"
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to submit attendance. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="attendance-container">
      <div className="attendance-card">
        <h1>Daily Attendance</h1>
        <p>Submit your attendance for today.</p>

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Roll Number</label>
            <input
              type="text"
              name="rollNumber"
              value={formData.rollNumber}
              onChange={handleChange}
              placeholder="Enter your roll number"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="form-group">
            <label>Attendance Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Attendance"}
          </button>
        </form>

        <p className="attendance-link">
          Not registered yet?{" "}
          <Link to="/">Register Here</Link>
        </p>
      </div>
    </div>
  );
}

export default DailyAttendance;
