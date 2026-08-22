import express from "express";
import { sql } from "../config/db.js";

const router = express.Router();

// Helper function to generate Employee ID
// Format: [Company Initials][First 2 letters of First & Last Name][Year][Serial No.]
function generateEmployeeId(companyCode, firstName, lastName, joinYear, serialNum) {
  const initialCode = (companyCode.slice(0, 2)).toUpperCase();
  const nameCode = (firstName.slice(0, 2) + lastName.slice(0, 2)).toUpperCase();
  const formattedSerial = String(serialNum).padStart(4, "0");
  return `${initialCode}${nameCode}${joinYear}${formattedSerial}`;
}

router.post("/", async (req, res) => {
  const { firstName, lastName, email, phone, role, companyCode, salary } = req.body;
  const currentYear = new Date().getFullYear();

  try {
    // Determine serial number for auto-generated ID
    const countResult = await sql`SELECT COUNT(*) FROM users WHERE EXTRACT(YEAR FROM created_at) = ${currentYear};`;
    const serialNum = parseInt(countResult[0].count, 10) + 1;

    const autoEmpId = generateEmployeeId(companyCode || "OI", firstName, lastName, currentYear, serialNum);
    const tempPassword = Math.random().toString(36).slice(-8); // Generate temp password

    const newEmp = await sql`
      INSERT INTO users (employee_id, name, email, phone, password, role, salary)
      VALUES (${autoEmpId}, ${firstName + " " + lastName}, ${email}, ${phone}, ${tempPassword}, ${role || 'Employee'}, ${salary})
      RETURNING id, employee_id, name, email, role;
    `;

    res.status(201).json({
      message: "Employee created successfully",
      employee: newEmp[0],
      tempPassword,
    });
  } catch (error) {
    console.error("Employee creation error:", error);
    res.status(500).json({ error: "Failed to create employee" });
  }
});

// GET /api/employees - Fetch all employees (Admin/HR View)
router.get("/", async (req, res) => {
  try {
    const employees = await sql`
      SELECT id, employee_id, name, email, phone, role, address, profile_picture, salary 
      FROM users;
    `;
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch employees" });
  }
});

// GET /api/employees/:id - Get employee profile details
router.get("/:id", async (req, res) => {
  try {
    const employee = await sql`
      SELECT id, employee_id, name, email, phone, role, address, profile_picture, salary 
      FROM users WHERE id = ${req.params.id};
    `;

    if (employee.length === 0) return res.status(404).json({ error: "Employee not found" });

    res.status(200).json(employee[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// PUT /api/employees/:id - Update employee profile
router.put("/:id", async (req, res) => {
  const { address, phone, profilePicture, salary, isHR } = req.body;

  try {
    // If regular user (non-HR), allow updating address, phone, and profile picture
    if (!isHR) {
      const updated = await sql`
        UPDATE users 
        SET address = COALESCE(${address}, address),
            phone = COALESCE(${phone}, phone),
            profile_picture = COALESCE(${profilePicture}, profile_picture)
        WHERE id = ${req.params.id}
        RETURNING id, name, address, phone, profile_picture;
      `;
      return res.status(200).json(updated[0]);
    }

    // HR can update all fields including salary
    const updated = await sql`
      UPDATE users 
      SET address = COALESCE(${address}, address),
          phone = COALESCE(${phone}, phone),
          profile_picture = COALESCE(${profilePicture}, profile_picture),
          salary = COALESCE(${salary}, salary)
      WHERE id = ${req.params.id}
      RETURNING id, name, address, phone, salary;
    `;
    res.status(200).json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;