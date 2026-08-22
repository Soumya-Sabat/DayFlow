import express from "express";
import { sql } from "../config/db.js";

const router = express.Router();

// POST /api/attendance/check-in - Employee Check-in
router.post("/check-in", async (req, res) => {
  const { userId, status } = req.body; // status: Present, Half-day, etc.

  try {
    const record = await sql`
      INSERT INTO attendance (user_id, check_in, date, status)
      VALUES (${userId}, NOW(), CURRENT_DATE, ${status || 'Present'})
      RETURNING *;
    `;
    res.status(201).json({ message: "Checked in successfully", record: record[0] });
  } catch (error) {
    res.status(500).json({ error: "Failed to check in" });
  }
});

// POST /api/attendance/check-out - Employee Check-out
router.post("/check-out", async (req, res) => {
  const { attendanceId } = req.body;

  try {
    const record = await sql`
      UPDATE attendance
      SET check_out = NOW()
      WHERE id = ${attendanceId}
      RETURNING *;
    `;
    res.status(200).json({ message: "Checked out successfully", record: record[0] });
  } catch (error) {
    res.status(500).json({ error: "Failed to check out" });
  }
});

// GET /api/attendance/user/:userId - View attendance for specific employee
router.get("/user/:userId", async (req, res) => {
  try {
    const logs = await sql`
      SELECT * FROM attendance 
      WHERE user_id = ${req.params.userId}
      ORDER BY date DESC;
    `;
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch attendance" });
  }
});

// GET /api/attendance - Admin view all employee attendance
router.get("/", async (req, res) => {
  try {
    const logs = await sql`
      SELECT attendance.*, users.name, users.employee_id
      FROM attendance
      JOIN users ON attendance.user_id = users.id
      ORDER BY attendance.date DESC;
    `;
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch all attendance" });
  }
});

export default router;