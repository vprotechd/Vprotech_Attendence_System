
import express from "express";
import { submitAttendance } from "../controllers/attendanceController.js";

const router = express.Router();

router.post("/submit", submitAttendance);

export default router;
