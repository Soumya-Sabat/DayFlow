import express from "express";
import { sql } from "../config/db.js";
import { ownsUserOrIsAdmin, requireAuth, requireRoles } from "../lib/auth.js";

const router = express.Router();
router.use(requireAuth);

router.post("/check-in", async (req, res, next) => {
  const userId = req.user.id;
  try {
    const existing = await sql`SELECT id FROM attendance WHERE user_id = ${userId} AND date = CURRENT_DATE;`;
    if (existing[0]) return res.status(409).json({ error: "You have already checked in today." });
    const rows = await sql`INSERT INTO attendance (user_id, check_in, date, status) VALUES (${userId}, NOW(), CURRENT_DATE, 'Present') RETURNING *;`;
    res.status(201).json({ message: "Checked in successfully", record: rows[0] });
  } catch (error) { next(error); }
});

router.post("/check-out", async (req, res, next) => {
  try {
    const rows = await sql`UPDATE attendance SET check_out = NOW() WHERE user_id = ${req.user.id} AND date = CURRENT_DATE AND check_out IS NULL RETURNING *;`;
    if (!rows[0]) return res.status(409).json({ error: "No open check-in was found for today." });
    res.json({ message: "Checked out successfully", record: rows[0] });
  } catch (error) { next(error); }
});

router.get("/my-attendance/:userId", async (req, res, next) => {
  if (!ownsUserOrIsAdmin(req, req.params.userId)) return res.status(403).json({ error: "You can only view your own attendance." });
  const month = Number(req.query.month) || new Date().getMonth() + 1;
  const year = Number(req.query.year) || new Date().getFullYear();
  try {
    const logs = await sql`
      SELECT id, TO_CHAR(date, 'YYYY-MM-DD') AS date, TO_CHAR(check_in, 'HH24:MI') AS check_in, TO_CHAR(check_out, 'HH24:MI') AS check_out, status,
      CASE WHEN check_in IS NOT NULL AND check_out IS NOT NULL THEN TO_CHAR(check_out - check_in, 'HH24:MI') ELSE NULL END AS work_hours
      FROM attendance WHERE user_id = ${req.params.userId} AND EXTRACT(MONTH FROM date) = ${month} AND EXTRACT(YEAR FROM date) = ${year} ORDER BY date DESC;`;
    const summary = await sql`SELECT COUNT(*) FILTER (WHERE status = 'Present')::int AS count_days_present, COUNT(*) FILTER (WHERE status = 'Leave')::int AS leaves_count, COUNT(*)::int AS total_working_days FROM attendance WHERE user_id = ${req.params.userId} AND EXTRACT(MONTH FROM date) = ${month} AND EXTRACT(YEAR FROM date) = ${year};`;
    res.json({ summary: summary[0], logs });
  } catch (error) { next(error); }
});

router.get("/admin-view", requireRoles("Admin", "HR"), async (req, res, next) => {
  const date = String(req.query.date || new Date().toISOString().slice(0, 10));
  try {
    const records = await sql`
      SELECT a.id, u.name AS employee_name, u.employee_id, TO_CHAR(a.date, 'YYYY-MM-DD') AS date, TO_CHAR(a.check_in, 'HH24:MI') AS check_in, TO_CHAR(a.check_out, 'HH24:MI') AS check_out, COALESCE(a.status, 'Absent') AS status
      FROM users u LEFT JOIN attendance a ON u.id = a.user_id AND a.date = ${date}::date ORDER BY u.name;`;
    res.json({ date, records });
  } catch (error) { next(error); }
});

router.get("/payable-days/:userId", async (req, res, next) => {
  if (!ownsUserOrIsAdmin(req, req.params.userId)) return res.status(403).json({ error: "You can only view your own payable days." });
  try {
    const rows = await sql`SELECT COUNT(*) FILTER (WHERE status = 'Present')::int AS present_days, 0::int AS paid_leave_days, 0::int AS unpaid_deducted_days, COUNT(*) FILTER (WHERE status = 'Present')::int AS total_payable_days FROM attendance WHERE user_id = ${req.params.userId} AND date_trunc('month', date) = date_trunc('month', CURRENT_DATE);`;
    res.json(rows[0]);
  } catch (error) { next(error); }
});

export default router;
