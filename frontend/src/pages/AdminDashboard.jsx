import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import banner from "../assets/vprotech-seo-banner.png";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Dashboard states
  const [summary, setSummary] = useState({
    totalRecords: 0,
    presentCount: 0,
    absentCount: 0
  });

  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);

  // Search and filters
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState("");

  // JWT token
  const token = localStorage.getItem("adminToken");

  // Fetch students and dashboard summary
  useEffect(() => {
    const fetchDashboard = async () => {
      if (!token) {
        navigate("/admin/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const authConfig = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        const [studentsResponse, attendanceResponse] = await Promise.all([
          API.get("/admin/students", authConfig),
          API.get("/admin/attendance-dashboard", authConfig)
        ]);

        setStudents(studentsResponse.data.students || []);

        setSummary(
          attendanceResponse.data.summary || {
            totalRecords: 0,
            presentCount: 0,
            absentCount: 0
          }
        );
      } catch (err) {
        if ([401, 403].includes(err.response?.status)) {
          localStorage.removeItem("adminToken");
          navigate("/admin/login");
          return;
        }

        setError(
          err.response?.data?.message || "Unable to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate, token]);

  // Fetch attendance records
  const fetchAttendance = useCallback((signal) => {
    if (!token) {
      navigate("/admin/login");
      return;
    }

    const params = {};

    if (dateFilter) {
      params.date = dateFilter;
    }

    if (statusFilter) {
      params.status = statusFilter;
    }

    const authConfig = {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params,
      signal
    };

    return Promise.resolve()
      .then(() => API.get("/admin/attendance-records", authConfig))
      .then((response) => {
        if (signal.aborted) {
          return;
        }

        setError("");
        setAttendance(response.data.records || []);
      })
      .catch((err) => {
        if (signal.aborted) {
          return;
        }

        if ([401, 403].includes(err.response?.status)) {
          localStorage.removeItem("adminToken");
          navigate("/admin/login");
          return;
        }

        setError(
          err.response?.data?.message ||
            "Unable to load attendance records."
        );
      })
      .finally(() => {
        if (!signal.aborted) {
          setAttendanceLoading(false);
        }
      });
  }, [dateFilter, statusFilter, navigate, token]);

  useEffect(() => {
    const controller = new AbortController();
    fetchAttendance(controller.signal);

    return () => controller.abort();
  }, [fetchAttendance]);

  // Search students
  const filteredStudents = students.filter((student) => {
    const searchText = search.toLowerCase().trim();

    return (
      student.name?.toLowerCase().includes(searchText) ||
      student.rollNumber?.toLowerCase().includes(searchText)
    );
  });

  // Clear attendance filters
  const clearFilters = () => {
    if (!dateFilter && !statusFilter) {
      return;
    }

    setAttendanceLoading(true);
    setError("");
    setDateFilter("");
    setStatusFilter("");
  };

  // Export CSV
  const handleExport = async () => {
    try {
      setExportLoading(true);
      setError("");

      const response = await API.get("/admin/export-attendance", {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: "blob"
      });

      const blob = new Blob([response.data], {
        type: "text/csv;charset=utf-8;"
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "attendance-records.csv";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch {
      setError("Unable to export attendance records.");
    } finally {
      setExportLoading(false);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="ad-page">
        <div className="dashboard-loading">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="ad-page">
      <div className="admin-dashboard">
        {/* Dashboard Header */}
        <header className="dashboard-header">
          <div className="dashboard-title">
            <img
              src={banner}
              alt="VProTech Digital"
              className="dashboard-logo"
            />
            <div>
              <h1>Admin Dashboard</h1>
              <p>Manage students and attendance records</p>
            </div>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </header>

        {/* Error Message */}
        {error && (
          <div className="dashboard-error" role="alert">
            {error}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h3>Total Students</h3>
            <h2>{students.length}</h2>
          </div>

          <div className="dashboard-card">
            <h3>Total Attendance Records</h3>
            <h2>{summary.totalRecords}</h2>
          </div>

          <div className="dashboard-card present-card">
            <h3>Present</h3>
            <h2>{summary.presentCount}</h2>
          </div>

          <div className="dashboard-card absent-card">
            <h3>Absent</h3>
            <h2>{summary.absentCount}</h2>
          </div>
        </div>

        {/* Registered Students */}
        <section className="students-section">
          <div className="section-header">
            <div>
              <h2>Registered Students</h2>
              <p>Total: {students.length} students</p>
            </div>
          </div>

          <input
            type="text"
            className="search-input"
            placeholder="Search by student name or roll number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Roll Number</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>College</th>
                  <th>Semester</th>
                  <th>Batch</th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr key={student._id}>
                      <td>{student.name}</td>
                      <td>{student.rollNumber}</td>
                      <td>{student.email}</td>
                      <td>{student.phone}</td>
                      <td>{student.collegeName}</td>
                      <td>{student.semester}</td>
                      <td>{student.batch}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="empty-message">
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Attendance Records */}
        <section className="attendance-section">
          <div className="section-header">
            <div>
              <h2>Attendance Records</h2>
              <p>Total: {attendance.length} records matching filters</p>
            </div>

            <button
              className="export-btn"
              onClick={handleExport}
              disabled={exportLoading}
            >
              {exportLoading ? "Exporting..." : "Export CSV"}
            </button>
          </div>

          {/* Attendance Filters */}
          <div className="attendance-filters">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setAttendanceLoading(true);
                setError("");
                setDateFilter(e.target.value);
              }}
            />

            <select
              value={statusFilter}
              onChange={(e) => {
                setAttendanceLoading(true);
                setError("");
                setStatusFilter(e.target.value);
              }}
            >
              <option value="">All Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>

            <button className="clear-btn" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>

          {/* Attendance Table */}
          {attendanceLoading ? (
            <p className="loading-text">Loading attendance records...</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Roll Number</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Submitted At</th>
                  </tr>
                </thead>

                <tbody>
                  {attendance.length > 0 ? (
                    attendance.map((record) => (
                      <tr key={record._id}>
                        <td>{record.student?.name || "N/A"}</td>

                        <td>{record.rollNumber}</td>

                        <td>{record.date}</td>

                        <td>
                          <span
                            className={
                              record.status === "Present"
                                ? "present-status"
                                : "absent-status"
                            }
                          >
                            {record.status}
                          </span>
                        </td>

                        <td>
                          {record.submittedAt
                            ? new Date(record.submittedAt).toLocaleString(
                                "en-IN",
                                { timeZone: "Asia/Kolkata" }
                              )
                            : "N/A"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="empty-message">
                        No attendance records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;