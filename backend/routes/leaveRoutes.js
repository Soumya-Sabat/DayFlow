import express from "express";
import { sql } from "../config/db.js";
import { ownsUserOrIsAdmin, requireAuth, requireRoles } from "../lib/auth.js";

const router = express.Router();
router.use(requireAuth);
const daysBetween = (start, end) => Math.floor((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86400000) + 1;

router.post("/", async (req, res, next) => {
  const { leaveType, startDate, endDate, attachment, remarks } = req.body;
  if (![leaveType, startDate, endDate].every((value) => typeof value === "string" && value.trim())) return res.status(400).json({ error: "Leave type, start date and end date are required." });
  const allocationDays = daysBetween(startDate, endDate);
  if (!Number.isInteger(allocationDays) || allocationDays < 1) return res.status(400).json({ error: "End date must be on or after the start date." });
  try {
    const rows = await sql`INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, allocation_days, attachment, remarks, status) VALUES (${req.user.id}, ${leaveType.trim()}, ${startDate}, ${endDate}, ${allocationDays}, ${attachment || null}, ${remarks?.trim() || null}, 'Pending') RETURNING *;`;
    res.status(201).json({ message: "Time off request submitted successfully", leave: rows[0] });
  } catch (error) { next(error); }
});

router.get("/my-leaves/:userId", async (req, res, next) => {
  if (!ownsUserOrIsAdmin(req, req.params.userId)) return res.status(403).json({ error: "You can only view your own leave requests." });
  try {
    const records = await sql`SELECT id, leave_type, TO_CHAR(start_date, 'YYYY-MM-DD') AS start_date, TO_CHAR(end_date, 'YYYY-MM-DD') AS end_date, allocation_days, attachment, remarks, status, created_at FROM leave_requests WHERE user_id = ${req.params.userId} ORDER BY created_at DESC;`;
    const balances = await sql`SELECT GREATEST(0, 24 - COALESCE(SUM(allocation_days) FILTER (WHERE leave_type = 'Paid Time Off' AND status IN ('Pending', 'Approved')), 0)) AS "paidTimeOffAvailable", GREATEST(0, 7 - COALESCE(SUM(allocation_days) FILTER (WHERE leave_type = 'Sick Leave' AND status IN ('Pending', 'Approved')), 0)) AS "sickTimeOffAvailable" FROM leave_requests WHERE user_id = ${req.params.userId};`;
    res.json({ balances: balances[0], records });
  } catch (error) { next(error); }
});

router.get("/admin-view", requireRoles("Admin", "HR"), async (_req, res, next) => {
  try { res.json(await sql`SELECT l.id, u.name AS employee_name, u.employee_id, l.leave_type, TO_CHAR(l.start_date, 'YYYY-MM-DD') AS start_date, TO_CHAR(l.end_date, 'YYYY-MM-DD') AS end_date, l.allocation_days, l.remarks, l.status FROM leave_requests l JOIN users u ON u.id = l.user_id ORDER BY l.created_at DESC;`); } catch (error) { next(error); }
});

router.put("/:id/action", requireRoles("Admin", "HR"), async (req, res, next) => {
  const { action, adminComments } = req.body;
  if (!["Approved", "Rejected"].includes(action)) return res.status(400).json({ error: "Action must be Approved or Rejected." });
  try {
    const rows = await sql`UPDATE leave_requests SET status = ${action}, admin_comments = ${adminComments?.trim() || null} WHERE id = ${req.params.id} AND status = 'Pending' RETURNING *;`;
    if (!rows[0]) return res.status(404).json({ error: "Pending leave request not found." });
    res.json({ message: `Leave request ${action.toLowerCase()} successfully`, leave: rows[0] });
  } catch (error) { next(error); }
});

export default router;
