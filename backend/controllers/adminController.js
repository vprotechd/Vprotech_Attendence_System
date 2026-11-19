
import Admin from "../models/Admin.js";
import Student from "../models/Student.js";
import Attendance from "../models/Attendance.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Parser } from "json2csv";


// Admin Login
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    // Find admin
    const admin = await Admin.findOne({
      email: email.trim().toLowerCase()
    });

    if (!admin) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(
      password,
      admin.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: admin._id,
        role: "admin"
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d"
      }
    );

    return res.status(200).json({
      message: "Admin login successful",
      token,
      admin: {
        id: admin._id,
        email: admin.email
      }
    });

  } catch (error) {
    console.error("Admin login error:", error);

    return res.status(500).json({
      message: "Server error during login"
    });
  }
};




export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalStudents: students.length,
      students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch students",
      error: error.message
    });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID"
      });
    }

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    const attendanceFilter = {
      $or: [{ student: student._id }, { rollNumber: student.rollNumber }]
    };
    const attendanceRecords = await Attendance.find(attendanceFilter)
      .select("status")
      .lean();
    const deletedAttendance = attendanceRecords.reduce(
      (counts, record) => {
        counts.total += 1;
        if (record.status === "Present") {
          counts.present += 1;
        } else if (record.status === "Absent") {
          counts.absent += 1;
        }
        return counts;
      },
      { total: 0, present: 0, absent: 0 }
    );

    await Attendance.deleteMany(attendanceFilter);
    await Student.deleteOne({ _id: student._id });

    return res.status(200).json({
      success: true,
      message: "Student and attendance records deleted",
      deletedAttendance
    });
  } catch (error) {
    console.error("Delete student error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to delete student"
    });
  }
};



export const getAttendanceDashboard = async (req, res) => {
  try {
    const totalRecords = await Attendance.countDocuments();

    const presentCount = await Attendance.countDocuments({
      status: "Present"
    });

    const absentCount = await Attendance.countDocuments({
      status: "Absent"
    });

    const attendanceRecords = await Attendance.find()
      .populate("student", "name email rollNumber collegeName")
      .sort({ date: -1, submittedAt: -1 });

    res.status(200).json({
      success: true,
      summary: {
        totalRecords,
        presentCount,
        absentCount
      },
      attendanceRecords
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch attendance dashboard",
      error: error.message
    });
  }
};


export const getAttendanceRecords = async (req, res) => {
  try {
    const { date, status, rollNumber } = req.query;

    const filter = {};

    // Filter by date
    if (date) {
      filter.date = date;
    }

    // Filter by attendance status
    if (status) {
      if (!["Present", "Absent"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status must be Present or Absent"
        });
      }

      filter.status = status;
    }

    // Filter by student roll number
    if (rollNumber) {
      filter.rollNumber = rollNumber.trim();
    }

    const records = await Attendance.find(filter)
      .populate("student", "name email phone rollNumber collegeName")
      .sort({ date: -1, submittedAt: -1 });

    res.status(200).json({
      success: true,
      totalRecords: records.length,
      records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch attendance records",
      error: error.message
    });
  }
};




export const exportAttendance = async (req, res) => {
  try {
    const { date } = req.query;

    if (
      date &&
      (typeof date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        Number.isNaN(new Date(`${date}T00:00:00.000Z`).getTime()) ||
        new Date(`${date}T00:00:00.000Z`).toISOString().slice(0, 10) !== date)
    ) {
      return res.status(400).json({
        success: false,
        message: "Date must be a valid date in YYYY-MM-DD format"
      });
    }

    const filter = date ? { date } : {};
    const records = await Attendance.find(filter)
      .populate("student", "name email phone collegeName semester batch")
      .sort({ date: -1, submittedAt: -1 });

    const formattedRecords = records.map((record) => ({
      StudentName: record.student?.name || "N/A",
      Email: record.student?.email || "N/A",
      Phone: record.student?.phone || "N/A",
      College: record.student?.collegeName || "N/A",
      Semester: record.student?.semester || "N/A",
      Batch: record.student?.batch || "N/A",
      RollNumber: record.rollNumber,
      Date: new Date(`${record.date}T00:00:00Z`).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
        timeZone: "UTC"
      }),
      AttendanceStatus: record.status,
      SubmittedAt: record.submittedAt
        ? record.submittedAt.toISOString()
        : ""
    }));

    const parser = new Parser();
    const csv = parser.parse(formattedRecords);
    const filename = date
      ? `attendance-records-${date}.csv`
      : "attendance-records.csv";

    res.header("Content-Type", "text/csv");
    res.attachment(filename);

    return res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to export attendance records",
      error: error.message
    });
  }
};
