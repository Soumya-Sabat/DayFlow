import express from "express";
import { sql } from "../config/db.js";

const router = express.Router();

// POST /api/leaves - Apply for Leave
router.post("/", async (req, res) => {
  const { userId, leaveType, startDate, endDate, remarks } = req.body;

  try {
    const leaveRequest = await sql`
      INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, remarks, status)
      VALUES (${userId}, ${leaveType}, ${startDate}, ${endDate}, ${remarks}, 'Pending')
      RETURNING *;
    `;
    res.status(201).json({ message: "Leave applied successfully", leave: leaveRequest[0] });
  } catch (error) {
    res.status(500).json({ error: "Failed to submit leave request" });
  }
});

// GET /api/leaves/user/:userId - Employee views their own leave requests
router.get("/user/:userId", async (req, res) => {
  try {
    const leaves = await sql`
      SELECT * FROM leave_requests 
      WHERE user_id = ${req.params.userId}
      ORDER BY created_at DESC;
    `;
    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch leaves" });
  }
});

// GET /api/leaves - Admin/HR views all leave requests
router.get("/", async (req, res) => {
  try {
    const leaves = await sql`
      SELECT leave_requests.*, users.name, users.employee_id
      FROM leave_requests
      JOIN users ON leave_requests.user_id = users.id
      ORDER BY leave_requests.created_at DESC;
    `;
    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch leave requests" });
  }
});

// PUT /api/leaves/:id/status - Admin approves/rejects leave request
router.put("/:id/status", async (req, res) => {
  const { status, adminComments } = req.body; // status: Approved or Rejected

  try {
    const updatedLeave = await sql`
      UPDATE leave_requests
      SET status = ${status}, admin_comments = ${adminComments}
      WHERE id = ${req.params.id}
      RETURNING *;
    `;
    res.status(200).json({ message: `Leave ${status.toLowerCase()} successfully`, leave: updatedLeave[0] });
  } catch (error) {
    res.status(500).json({ error: "Failed to update leave status" });
  }
});

export default router;