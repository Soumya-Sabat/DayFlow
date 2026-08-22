import express from "express";
import { sql } from "../config/db.js";

const router = express.Router();

// 1. Employee Check-In
router.post("/check-in", async (req, res) => {
  const { userId } = req.body;

  try {
    const existing = await sql`
      SELECT id FROM attendance WHERE user_id = ${userId} AND date = CURRENT_DATE;
    `;

    if (existing.length > 0) {
      return res.status(400).json({ error: "Already checked in today" });
    }

    const record = await sql`
      INSERT INTO attendance (user_id, check_in, date, status)
      VALUES (${userId}, NOW(), CURRENT_DATE, 'Present')
      RETURNING *;
    `;
    res.status(201).json({ message: "Checked in successfully", statusDot: "GREEN", record: record[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Employee Check-Out (Calculates Work Hours & Extra Hours)
router.post("/check-out", async (req, res) => {
  const { userId } = req.body;

  try {
    const record = await sql`
      UPDATE attendance
      SET check_out = NOW()
      WHERE user_id = ${userId} AND date = CURRENT_DATE
      RETURNING *;
    `;

    if (record.length === 0) {
      return res.status(404).json({ error: "No active check-in record found for today" });
    }

    res.status(200).json({ message: "Checked out successfully", record: record[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Employee Attendance View (Monthly view with stats: Days Present, Leaves, Total Working Days)
router.get("/my-attendance/:userId", async (req, res) => {
  const { userId } = req.params;
  const { month, year } = req.query; // e.g., ?month=10&year=2026

  const targetMonth = month || new Date().getMonth() + 1;
  const targetYear = year || new Date().getFullYear();

  try {
    // Detailed daily attendance with calculated work_hours and extra_hours
    const logs = await sql`
      SELECT 
        id,
        date,
        TO_CHAR(check_in, 'HH24:MI') AS check_in,
        TO_CHAR(check_out, 'HH24:MI') AS check_out,
        status,
        CASE 
          WHEN check_in IS NOT NULL AND check_out IS NOT NULL THEN
            TO_CHAR(check_out - check_in, 'HH24:MI')
          ELSE '00:00'
        END AS work_hours,
        CASE 
          WHEN check_in IS NOT NULL AND check_out IS NOT NULL AND (check_out - check_in) > INTERVAL '8 hours' THEN
            TO_CHAR((check_out - check_in) - INTERVAL '8 hours', 'HH24:MI')
          ELSE '00:00'
        END AS extra_hours
      FROM attendance
      WHERE user_id = ${userId} 
        AND EXTRACT(MONTH FROM date) = ${targetMonth}
        AND EXTRACT(YEAR FROM date) = ${targetYear}
      ORDER BY date DESC;
    `;

    // Summary Statistics for Employee Dashboard
    const stats = await sql`
      SELECT 
        COUNT(CASE WHEN status = 'Present' THEN 1 END) AS count_days_present,
        COUNT(CASE WHEN status = 'Leave' THEN 1 END) AS leaves_count,
        COUNT(*) AS total_working_days
      FROM attendance
      WHERE user_id = ${userId}
        AND EXTRACT(MONTH FROM date) = ${targetMonth}
        AND EXTRACT(YEAR FROM date) = ${targetYear};
    `;

    res.status(200).json({
      summary: stats[0],
      logs
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Admin / HR Attendance List View (Filterable by Date)
router.get("/admin-view", async (req, res) => {
  const { requesterrole } = req.headers;
  const { date } = req.query; // e.g., ?date=2026-10-22

  if (requesterrole !== "Admin" && requesterrole !== "HR") {
    return res.status(403).json({ error: "Access Denied: Admin or HR access required" });
  }

  const targetDate = date || new Date().toISOString().split('T')[0];

  try {
    const logs = await sql`
      SELECT 
        a.id,
        u.name AS employee_name,
        u.employee_id,
        a.date,
        TO_CHAR(a.check_in, 'HH24:MI') AS check_in,
        TO_CHAR(a.check_out, 'HH24:MI') AS check_out,
        a.status,
        CASE 
          WHEN a.check_in IS NOT NULL AND a.check_out IS NOT NULL THEN
            TO_CHAR(a.check_out - a.check_in, 'HH24:MI')
          ELSE '00:00'
        END AS work_hours,
        CASE 
          WHEN a.check_in IS NOT NULL AND a.check_out IS NOT NULL AND (a.check_out - a.check_in) > INTERVAL '8 hours' THEN
            TO_CHAR((a.check_out - a.check_in) - INTERVAL '8 hours', 'HH24:MI')
          ELSE '00:00'
        END AS extra_hours
      FROM users u
      LEFT JOIN attendance a ON u.id = a.user_id AND a.date = ${targetDate}
      ORDER BY u.name ASC;
    `;

    res.status(200).json({ date: targetDate, records: logs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Payable Days Computation (For Payslip Generation)
router.get("/payable-days/:userId", async (req, res) => {
  const { userId } = req.params;
  const { month, year } = req.query;

  const targetMonth = month || new Date().getMonth() + 1;
  const targetYear = year || new Date().getFullYear();

  try {
    const result = await sql`
      SELECT 
        COUNT(CASE WHEN status = 'Present' THEN 1 END) AS present_days,
        COUNT(CASE WHEN status = 'Paid_Leave' THEN 1 END) AS paid_leave_days,
        COUNT(CASE WHEN status = 'Unpaid_Leave' OR status = 'Absent' THEN 1 END) AS unpaid_deducted_days,
        (COUNT(CASE WHEN status = 'Present' THEN 1 END) + COUNT(CASE WHEN status = 'Paid_Leave' THEN 1 END)) AS total_payable_days
      FROM attendance
      WHERE user_id = ${userId}
        AND EXTRACT(MONTH FROM date) = ${targetMonth}
        AND EXTRACT(YEAR FROM date) = ${targetYear};
    `;

    res.status(200).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;