import express from "express";
import { sql } from "../config/db.js";
import { createToken, hashPassword, verifyPassword } from "../lib/security.js";
import { requireAuth } from "../lib/auth.js";

const router = express.Router();
const publicUser = (user) => ({
  id: user.id,
  employee_id: user.employee_id,
  name: user.name,
  email: user.email,
  role: user.role,
  company_name: user.company_name,
});

router.post("/signup", async (req, res, next) => {
  const { companyName, name, email, phone, password } = req.body;
  if (![companyName, name, email, password].every((value) => typeof value === "string" && value.trim())) {
    return res.status(400).json({ error: "Company name, name, email and password are required." });
  }
  if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters." });
  try {
    const existingAdmins = await sql`SELECT id FROM users WHERE role = 'Admin' LIMIT 1;`;
    if (existingAdmins[0]) return res.status(403).json({ error: "An administrator already exists. Ask an administrator to create your account." });
    const users = await sql`
      INSERT INTO users (name, email, phone, password, role, company_name)
      VALUES (${name.trim()}, ${email.trim().toLowerCase()}, ${phone?.trim() || null}, ${hashPassword(password)}, 'Admin', ${companyName.trim()})
      RETURNING id, employee_id, name, email, role, company_name;
    `;
    res.status(201).json({ message: "Administrator registered successfully", user: publicUser(users[0]) });
  } catch (error) {
    if (error.code === "23505") return res.status(409).json({ error: "An account already exists with that email." });
    next(error);
  }
});

router.post("/signin", async (req, res, next) => {
  const loginId = String(req.body.loginId || "").trim();
  const password = String(req.body.password || "");
  if (!loginId || !password) return res.status(400).json({ error: "Login ID/email and password are required." });
  try {
    const users = await sql`SELECT * FROM users WHERE lower(email) = lower(${loginId}) OR employee_id = ${loginId} LIMIT 1;`;
    const user = users[0];
    if (!user || !verifyPassword(password, user.password)) return res.status(401).json({ error: "Invalid login ID/email or password." });
    const accessToken = createToken();
    await sql`INSERT INTO sessions (user_id, token, expires_at) VALUES (${user.id}, ${accessToken}, NOW() + INTERVAL '7 days');`;
    res.json({ message: "Login successful", user: publicUser(user), accessToken, expiresIn: 604800 });
  } catch (error) { next(error); }
});

router.post("/logout", requireAuth, async (req, res, next) => {
  try {
    const token = req.headers.authorization.slice(7);
    await sql`DELETE FROM sessions WHERE token = ${token};`;
    res.status(204).end();
  } catch (error) { next(error); }
});

router.put("/change-password", requireAuth, async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  if (typeof oldPassword !== "string" || typeof newPassword !== "string" || newPassword.length < 8) {
    return res.status(400).json({ error: "A current password and a new password of at least 8 characters are required." });
  }
  try {
    const users = await sql`SELECT password FROM users WHERE id = ${req.user.id};`;
    if (!users[0] || !verifyPassword(oldPassword, users[0].password)) return res.status(400).json({ error: "Current password is incorrect." });
    await sql`UPDATE users SET password = ${hashPassword(newPassword)} WHERE id = ${req.user.id};`;
    res.json({ message: "Password updated successfully" });
  } catch (error) { next(error); }
});

export default router;
