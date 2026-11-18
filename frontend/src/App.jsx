

import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import StudentRegistration from "./pages/StudentRegistration";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import DailyAttendance from "./pages/DailyAttendance";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StudentRegistration />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
  path="/admin/dashboard"
  element={<AdminDashboard />}
/>
<Route path="/attendance" element={<DailyAttendance />} />

 <Route element={<ProtectedRoute />}>
          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
