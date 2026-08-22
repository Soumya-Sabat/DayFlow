import express from "express";
import { sql } from "../config/db.js";

const router = express.Router();

// Check-In Endpoint (Turns top bar status dot green)
router.post("/check-in", async (req, res) => {
  const { userId } = req.body;

  try {
    const record = await sql`
      INSERT INTO attendance (user_id, check_in, date, status)
      VALUES (${userId}, NOW(), CURRENT_DATE, 'Present')
      RETURNING *;
    `;
    res.status(201).json({ 
      message: "Checked in successfully", 
      statusDot: "GREEN", 
      record: record[0] 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check-Out Endpoint
router.post("/check-out", async (req, res) => {
  const { userId } = req.body;

  try {
    const record = await sql`
      UPDATE attendance
      SET check_out = NOW()
      WHERE user_id = ${userId} AND date = CURRENT_DATE
      RETURNING *;
    `;
    res.status(200).json({ message: "Checked out successfully", record: record[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET Status for Dashboard Cards (Returns status colors: Green/Yellow/Red)
router.get("/dashboard-status", async (req, res) => {
  try {
    const statusOverview = await sql`
      SELECT 
        u.id, 
        u.name, 
        u.employee_id, 
        u.profile_picture,
        COALESCE(a.status, 
          CASE 
            WHEN l.id IS NOT NULL THEN 'Leave'
            ELSE 'Absent'
          END
        ) AS current_status,
        CASE 
          WHEN a.status = 'Present' THEN 'GREEN'
          WHEN l.id IS NOT NULL THEN 'YELLOW'
          ELSE 'RED'
        END AS status_color
      FROM users u
      LEFT JOIN attendance a ON u.id = a.user_id AND a.date = CURRENT_DATE
      LEFT JOIN leave_requests l ON u.id = l.user_id 
        AND l.status = 'Approved' 
        AND CURRENT_DATE BETWEEN l.start_date AND l.end_date;
    `;

    res.status(200).json(statusOverview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;