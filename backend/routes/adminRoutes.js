
import express from "express";

import {
  loginAdmin,
  getAllStudents,
  getAttendanceDashboard,
  getAttendanceRecords,
  exportAttendance
} from "../controllers/adminController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin login
router.post("/login", loginAdmin);

// Protected dashboard test route
router.get("/dashboard", authMiddleware, (req, res) => {
  res.status(200).json({
    message: "Welcome to Admin Dashboard!",
    admin: req.admin
  });
});

// Get all registered students
router.get("/students", authMiddleware, getAllStudents);

// Get attendance dashboard summary
router.get(
  "/attendance-dashboard",
  authMiddleware,
  getAttendanceDashboard
);

router.get(
  "/attendance-records",
  authMiddleware,
  getAttendanceRecords
);


router.get(
  "/export-attendance",
  authMiddleware,
  exportAttendance
);


export default router;
