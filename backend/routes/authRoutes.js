import express from "express";
import { sql } from "../config/db.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { companyName, name, email, phone, password } = req.body;

  try {
    const newUser = await sql`
      INSERT INTO users (name, email, phone, password, role, company_name)
      VALUES (${name}, ${email}, ${phone}, ${password}, 'Admin', ${companyName})
      RETURNING id, name, email, role;
    `;

    res.status(201).json({ message: "Admin registered successfully", user: newUser[0] });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Failed to sign up user" });
  }
});

router.post("/signin", async (req, res) => {
  const { loginId, password } = req.body;

  try {
    const user = await sql`
      SELECT * FROM users 
      WHERE email = ${loginId} OR employee_id = ${loginId};
    `;

    if (user.length === 0 || user[0].password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Return user details (In production, attach JWT token here)
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user[0].id,
        employee_id: user[0].employee_id,
        name: user[0].name,
        email: user[0].email,
        role: user[0].role,
      },
    });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({ error: "Failed to sign in" });
  }
});

// PUT /api/auth/change-password
router.put("/change-password", async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;

  try {
    const updated = await sql`
      UPDATE users 
      SET password = ${newPassword}
      WHERE id = ${userId} AND password = ${oldPassword}
      RETURNING id;
    `;

    if (updated.length === 0) {
      return res.status(400).json({ error: "Invalid user or current password" });
    }

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update password" });
  }
});

export default router;