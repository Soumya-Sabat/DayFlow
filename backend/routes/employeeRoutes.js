import express from "express";
import { sql } from "../config/db.js";
import { requireAuth, requireRoles, ownsUserOrIsAdmin } from "../lib/auth.js";
import { createTemporaryPassword, hashPassword } from "../lib/security.js";

const router = express.Router();
router.use(requireAuth);

const employeeId = (companyCode, firstName, lastName, year, serial) =>
  `${(companyCode || "DF").replace(/[^a-z]/gi, "").slice(0, 4).toUpperCase()}${(firstName || "E").slice(0, 2)}${(lastName || "U").slice(0, 2)}${year}${String(serial).padStart(4, "0")}`.toUpperCase();

router.post("/", requireRoles("Admin"), async (req, res, next) => {
  const { firstName, lastName, email, phone, companyCode, companyName, joiningDate, department, salary = 0 } = req.body;
  if (![firstName, email].every((value) => typeof value === "string" && value.trim())) return res.status(400).json({ error: "Employee name and email are required." });
  try {
    const count = await sql`SELECT COUNT(*)::int AS count FROM users;`;
    const id = employeeId(companyCode, firstName, lastName, new Date(joiningDate || Date.now()).getFullYear(), Number(count[0].count) + 1);
    const temporaryPassword = createTemporaryPassword();
    const employees = await sql`
      INSERT INTO users (employee_id, name, email, phone, password, role, company_name, department, monthly_wage, yearly_wage)
      VALUES (${id}, ${(String(firstName).trim() + " " + String(lastName || "").trim()).trim()}, ${email.trim().toLowerCase()}, ${phone?.trim() || null}, ${hashPassword(temporaryPassword)}, 'Employee', ${companyName?.trim() || req.user.company_name || null}, ${department?.trim() || null}, ${Number(salary) || 0}, ${(Number(salary) || 0) * 12})
      RETURNING id, employee_id, name, email, phone, role, company_name, department;
    `;
    res.status(201).json({ message: "Employee created successfully", employee: employees[0], tempPassword: temporaryPassword });
  } catch (error) {
    if (error.code === "23505") return res.status(409).json({ error: "An employee already exists with that email." });
    next(error);
  }
});

router.get("/", requireRoles("Admin", "HR"), async (_req, res, next) => {
  try { res.json(await sql`SELECT id, employee_id, name, email, phone, role, company_name, address, profile_picture, department FROM users ORDER BY name;`); } catch (error) { next(error); }
});

router.get("/:id", async (req, res, next) => {
  if (!ownsUserOrIsAdmin(req, req.params.id)) return res.status(403).json({ error: "You can only view your own profile." });
  try {
    const employees = await sql`SELECT id, employee_id, name, email, phone, role, company_name, address, profile_picture, department FROM users WHERE id = ${req.params.id};`;
    if (!employees[0]) return res.status(404).json({ error: "Employee not found." });
    res.json(employees[0]);
  } catch (error) { next(error); }
});

router.put("/:id", async (req, res, next) => {
  if (!ownsUserOrIsAdmin(req, req.params.id)) return res.status(403).json({ error: "You can only update your own profile." });
  const { name, email, phone, address, department } = req.body;
  if (!name || !email) return res.status(400).json({ error: "Name and email are required." });
  try {
    const employees = await sql`
      UPDATE users SET name = ${String(name).trim()}, email = ${String(email).trim().toLowerCase()}, phone = ${phone?.trim() || null}, address = ${address?.trim() || null}, department = ${department?.trim() || null}
      WHERE id = ${req.params.id}
      RETURNING id, employee_id, name, email, phone, role, company_name, address, profile_picture, department;
    `;
    if (!employees[0]) return res.status(404).json({ error: "Employee not found." });
    res.json({ message: "Profile updated successfully", employee: employees[0] });
  } catch (error) {
    if (error.code === "23505") return res.status(409).json({ error: "That email is already in use." });
    next(error);
  }
});

router.delete("/:id", requireRoles("Admin"), async (req, res, next) => {
  if (String(req.user.id) === String(req.params.id)) return res.status(400).json({ error: "You cannot delete your own administrator account." });
  try {
    const rows = await sql`DELETE FROM users WHERE id = ${req.params.id} RETURNING id, name;`;
    if (!rows[0]) return res.status(404).json({ error: "Employee not found." });
    res.json({ message: "Employee deleted successfully", employee: rows[0] });
  } catch (error) { next(error); }
});

router.get("/:id/salary", async (req, res, next) => {
  if (!ownsUserOrIsAdmin(req, req.params.id)) return res.status(403).json({ error: "You can only view your own salary information." });
  try {
    const users = await sql`SELECT id, name, wage_type, monthly_wage, yearly_wage, basic_pay, hra, standard_allowance, performance_bonus, pf_deduction, pt_deduction FROM users WHERE id = ${req.params.id};`;
    if (!users[0]) return res.status(404).json({ error: "Employee not found." });
    res.json(users[0]);
  } catch (error) { next(error); }
});

export default router;
