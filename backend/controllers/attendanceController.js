
import Student from "../models/Student.js";
import Attendance from "../models/Attendance.js";
import bcrypt from "bcryptjs";

export const submitAttendance = async (req, res) => {
  try {
    const { rollNumber, password, status } = req.body;

    // Validate required fields
    if (!rollNumber || !password || !status) {
      return res.status(400).json({
        success: false,
        message: "Roll number, password and status are required."
      });
    }

    // Validate attendance status
    if (!["Present", "Absent"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance status."
      });
    }

    // Find registered student
    const normalizedRollNumber = rollNumber.trim();

    const student = await Student.findOne({
      rollNumber: normalizedRollNumber
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found. Please register first."
      });
    }

    // Verify student password
    const isPasswordValid = await bcrypt.compare(
      password,
      student.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password."
      });
    }

    // Generate today's date using Indian Standard Time
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata"
    }).format(new Date());

    // Prevent duplicate attendance
    const existingAttendance = await Attendance.findOne({
      rollNumber: normalizedRollNumber,
      date: today
    });

    if (existingAttendance) {
      return res.status(409).json({
        success: false,
        message: "Attendance has already been submitted today."
      });
    }

    // Create attendance record
    await Attendance.create({
      student: student._id,
      rollNumber: normalizedRollNumber,
      date: today,
      status
    });

    return res.status(201).json({
      success: true,
      message: "Attendance submitted successfully!",
      studentName: student.name,
      rollNumber: normalizedRollNumber,
      date: today,
      status
    });

  } catch (error) {
    // Handles duplicate-key race conditions
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Attendance has already been submitted today."
      });
    }

    console.error("Attendance Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to submit attendance."
    });
  }
};
