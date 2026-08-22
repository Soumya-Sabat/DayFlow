import express from "express";
import { sql } from "../config/db.js";
import { ownsUserOrIsAdmin, requireAuth, requireRoles } from "../lib/auth.js";

const router = express.Router();
router.use(requireAuth);

router.get("/my-payslips/:userId", async (req, res, next) => {
  if (!ownsUserOrIsAdmin(req, req.params.userId)) return res.status(403).json({ error: "You can only view your own payslips." });
  try {
    const rows = await sql`SELECT id, month_year, basic_pay, hra, performance_bonus, (pf_deduction + pt_deduction) AS total_deductions, net_pay, status, TO_CHAR(payment_date, 'YYYY-MM-DD') AS payment_date FROM payslips WHERE user_id = ${req.params.userId} ORDER BY payment_date DESC;`;
    res.json(rows);
  } catch (error) { next(error); }
});

router.get("/my-payslips/:userId/:payslipId/download", async (req, res, next) => {
  if (!ownsUserOrIsAdmin(req, req.params.userId)) return res.status(403).json({ error: "You can only download your own payslips." });
  try {
    const rows = await sql`SELECT p.*, u.name, u.employee_id, u.email FROM payslips p JOIN users u ON u.id = p.user_id WHERE p.id = ${req.params.payslipId} AND p.user_id = ${req.params.userId};`;
    const payslip = rows[0];
    if (!payslip) return res.status(404).json({ error: "Payslip not found." });
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Payslip ${payslip.month_year}</title><style>body{font-family:Arial;max-width:720px;margin:40px auto;color:#172033}h1{color:#059669}table{border-collapse:collapse;width:100%;margin-top:24px}td{padding:12px;border-bottom:1px solid #ddd}td:last-child{text-align:right;font-weight:600}</style></head><body><h1>Dayflow Payslip</h1><p><b>${payslip.name}</b> · ${payslip.employee_id || payslip.email}</p><p>Period: ${payslip.month_year} · Paid: ${payslip.payment_date}</p><table><tr><td>Basic pay</td><td>₹${payslip.basic_pay}</td></tr><tr><td>HRA</td><td>₹${payslip.hra}</td></tr><tr><td>Performance bonus</td><td>₹${payslip.performance_bonus}</td></tr><tr><td>Deductions</td><td>₹${Number(payslip.pf_deduction) + Number(payslip.pt_deduction)}</td></tr><tr><td>Net pay</td><td>₹${payslip.net_pay}</td></tr></table></body></html>`;
    res.type("html").attachment(`payslip-${payslip.id}.html`).send(html);
  } catch (error) { next(error); }
});

router.get("/admin-overview", requireRoles("Admin", "HR"), async (_req, res, next) => {
  try {
    const rows = await sql`SELECT COUNT(*)::int AS total_employees, COALESCE(SUM(monthly_wage), 0) AS total_monthly_payroll, COALESCE(SUM(basic_pay), 0) AS total_basic_pay, COALESCE(SUM(hra), 0) AS total_hra, COALESCE(SUM(pf_deduction + pt_deduction), 0) AS total_deductions FROM users;`;
    res.json(rows[0]);
  } catch (error) { next(error); }
});

router.post("/update-salary/:userId", requireRoles("Admin", "HR"), async (req, res, next) => {
  const values = ["monthlyWage", "basicPay", "hra", "standardAllowance", "performanceBonus", "pfDeduction", "ptDeduction"];
  if (values.some((key) => req.body[key] !== undefined && (!Number.isFinite(Number(req.body[key])) || Number(req.body[key]) < 0))) return res.status(400).json({ error: "Salary values must be valid non-negative numbers." });
  const num = (key) => Number(req.body[key]) || 0;
  try {
    const rows = await sql`UPDATE users SET monthly_wage = ${num("monthlyWage")}, yearly_wage = ${num("monthlyWage") * 12}, basic_pay = ${num("basicPay")}, hra = ${num("hra")}, standard_allowance = ${num("standardAllowance")}, performance_bonus = ${num("performanceBonus")}, pf_deduction = ${num("pfDeduction")}, pt_deduction = ${num("ptDeduction")} WHERE id = ${req.params.userId} RETURNING id, name, monthly_wage;`;
    if (!rows[0]) return res.status(404).json({ error: "Employee not found." });
    res.json({ message: "Salary structure updated successfully", user: rows[0] });
  } catch (error) { next(error); }
});

export default router;
