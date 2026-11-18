import Student from "../models/Student.js";
import Attendance from "../models/Attendance.js";
import bcrypt from "bcryptjs";

export const registerStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      collegeName,
      semester,
      batch,
      rollNumber,
      attendanceStatus,
      password,
      confirmPassword
    } = req.body;

    if (
      !name ||
      !email ||
      !phone ||
      !collegeName ||
      !semester ||
      !batch ||
      !rollNumber ||
      !attendanceStatus ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        message: "Please fill all required fields"
      });
    }

    const normalizedPhone =
      typeof phone === "string" ? phone.trim() : "";

    if (!/^[0-9]{10}$/.test(normalizedPhone)) {
      return res.status(400).json({
        message: "Phone number must contain exactly 10 digits"
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match"
      });
    }

    if (!["Present", "Absent"].includes(attendanceStatus)) {
      return res.status(400).json({
        message: "Invalid attendance status"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedRoll = rollNumber.trim();

    const existingStudent = await Student.findOne({
      rollNumber: normalizedRoll
    });

    if (existingStudent) {
      return res.status(409).json({
        message: "Student already registered"
      });
    }

    const existingEmail = await Student.findOne({
      email: normalizedEmail
    });

    if (existingEmail) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const student = await Student.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      collegeName: collegeName.trim(),
      semester,
      batch: batch.trim(),
      rollNumber: normalizedRoll,
      password: hashedPassword
    });

    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata"
    }).format(new Date());

    await Attendance.create({
      student: student._id,
      rollNumber: normalizedRoll,
      date: today,
      status: attendanceStatus
    });

    return res.status(201).json({
      message: "You are successfully registered!",
      student: {
        id: student._id,
        name: student.name,
        rollNumber: student.rollNumber
      }
    });

  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      message: "Something went wrong during registration"
    });
  }
};