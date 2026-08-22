import express from "express";
import { sql } from "../config/db.js";

const router = express.Router();

// Helper function to calculate calendar days between two dates (inclusive)
function calculateDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

// 1. POST /api/leaves - Submit Time Off Request
router.post("/", async (req, res) => {
  const { userId, leaveType, startDate, endDate, attachment, remarks } = req.body;

  if (!userId || !leaveType || !startDate || !endDate) {
    return res.status(400).json({ error: "Missing required fields: userId, leaveType, startDate, endDate" });
  }

  const allocationDays = calculateDays(startDate, endDate);

  try {
    const leaveRequest = await sql`
      INSERT INTO leave_requests (
        user_id, 
        leave_type, 
        start_date, 
        end_date, 
        allocation_days, 
        attachment, 
        remarks, 
        status
      )
      VALUES (
        ${userId}, 
        ${leaveType}, 
        ${startDate}, 
        ${endDate}, 
        ${allocationDays}, 
        ${attachment || null}, 
        ${remarks || ""}, 
        'Pending'
      )
      RETURNING *;
    `;

    res.status(201).json({
      message: "Time Off request submitted successfully",
      leave: leaveRequest[0],
    });
  } catch (error) {
    console.error("Error creating leave request:", error);
    res.status(500).json({ error: error.message });
  }
});

// 2. GET /api/leaves/my-leaves/:userId - Employee View (Own records + Balances)
router.get("/my-leaves/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch user's leave requests
    const leaves = await sql`
      SELECT 
        id, 
        leave_type, 
        TO_CHAR(start_date, 'YYYY-MM-DD') AS start_date, 
        TO_CHAR(end_date, 'YYYY-MM-DD') AS end_date, 
        COALESCE(allocation_days, 1.0) AS allocation_days, 
        attachment, 
        remarks, 
        status, 
        created_at
      FROM leave_requests 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC;
    `;

    // Calculate sum of used leave days for approved requests
    const usedBalances = await sql`
      SELECT 
        leave_type, 
        SUM(COALESCE(allocation_days, 1.0)) AS total_used
      FROM leave_requests
      WHERE user_id = ${userId} AND status = 'Approved'
      GROUP BY leave_type;
    `;

    // Calculate remaining balances (Base allowances: 24 Paid, 7 Sick per year)
    let paidUsed = 0;
    let sickUsed = 0;

    usedBalances.forEach((row) => {
      if (row.leave_type === "Paid Time Off" || row.leave_type === "Paid") {
        paidUsed = parseFloat(row.total_used || 0);
      }
      if (row.leave_type === "Sick Leave" || row.leave_type === "Sick") {
        sickUsed = parseFloat(row.total_used || 0);
      }
    });

    const balances = {
      paidTimeOffAvailable: Math.max(0, 24 - paidUsed),
      sickTimeOffAvailable: Math.max(0, 7 - sickUsed),
    };

    res.status(200).json({
      balances,
      records: leaves,
    });
  } catch (error) {
    console.error("Error fetching my-leaves:", error);
    res.status(500).json({ error: error.message });
  }
});

// 3. GET /api/leaves/admin-view - Admin/HR View (All employee requests)
router.get("/admin-view", async (req, res) => {
  const requesterRole = req.headers["requester-role"] || req.headers.requesterrole;

  if (requesterRole !== "Admin" && requesterRole !== "HR") {
    return res.status(403).json({ error: "Access Denied: Admin or HR access required" });
  }

  try {
    const leaves = await sql`
      SELECT 
        l.id,
        u.name AS employee_name,
        u.employee_id,
        l.leave_type,
        TO_CHAR(l.start_date, 'DD/MM/YYYY') AS start_date,
        TO_CHAR(l.end_date, 'DD/MM/YYYY') AS end_date,
        COALESCE(l.allocation_days, 1.0) AS allocation_days,
        l.attachment,
        l.remarks,
        l.status
      FROM leave_requests l
      JOIN users u ON l.user_id = u.id
      ORDER BY l.created_at DESC;
    `;

    res.status(200).json(leaves);
  } catch (error) {
    console.error("Error fetching admin leave view:", error);
    res.status(500).json({ error: error.message });
  }
});

// 4. PUT /api/leaves/:id/action - Admin Inline Action (Approve / Reject)
router.put("/:id/action", async (req, res) => {
  const { action, adminComments } = req.body; // action: 'Approved' or 'Rejected'
  const requesterRole = req.headers["requester-role"] || req.headers.requesterrole || req.body.requesterRole;

  if (requesterRole !== "Admin" && requesterRole !== "HR") {
    return res.status(403).json({ error: "Unauthorized action: Admin or HR access required" });
  }

  if (action !== "Approved" && action !== "Rejected") {
    return res.status(400).json({ error: "Invalid action. Use 'Approved' or 'Rejected'" });
  }

  try {
    const updatedLeave = await sql`
      UPDATE leave_requests
      SET status = ${action}, admin_comments = ${adminComments || null}
      WHERE id = ${req.params.id}
      RETURNING *;
    `;

    if (updatedLeave.length === 0) {
      return res.status(404).json({ error: "Leave request not found" });
    }

    // Optional: If approved, sync status to attendance table for affected dates
    if (action === "Approved") {
      const leave = updatedLeave[0];
      await sql`
        INSERT INTO attendance (user_id, date, status)
        SELECT 
          ${leave.user_id}, 
          d.date::date, 
          'Leave'
        FROM generate_series(${leave.start_date}::date, ${leave.end_date}::date, '1 day'::interval) d(date)
        ON CONFLICT DO NOTHING;
      `;
    }

    res.status(200).json({
      message: `Leave request ${action.toLowerCase()} successfully`,
      leave: updatedLeave[0],
    });
  } catch (error) {
    console.error("Error updating leave status:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;