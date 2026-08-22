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

// POST /api/employees - HR creates a new employee
router.post("/", async (req, res) => {
  const { firstName, lastName, email, phone, role, companyCode, salary } = req.body;
  const currentYear = new Date().getFullYear();

  try {
    const countResult = await sql`SELECT COUNT(*) FROM users WHERE EXTRACT(YEAR FROM created_at) = ${currentYear};`;
    const serialNum = parseInt(countResult[0].count, 10) + 1;

    const autoEmpId = generateEmployeeId(companyCode || "OI", firstName, lastName, currentYear, serialNum);
    const tempPassword = Math.random().toString(36).slice(-8);

    const newEmp = await sql`
      INSERT INTO users (employee_id, name, email, phone, password, role, monthly_wage)
      VALUES (${autoEmpId}, ${firstName + " " + lastName}, ${email}, ${phone}, ${tempPassword}, ${role || 'Employee'}, ${salary || 0.00})
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

// GET /api/employees - Fetch all employees
router.get("/", async (req, res) => {
  try {
    const employees = await sql`
      SELECT id, employee_id, name, email, phone, role, address, profile_picture 
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
      SELECT id, employee_id, name, email, phone, role, address, profile_picture 
      FROM users WHERE id = ${req.params.id};
    `;

    if (employee.length === 0) return res.status(404).json({ error: "Employee not found" });

    res.status(200).json(employee[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// GET /api/employees/:id/salary - (Admin/HR Only)
router.get("/:id/salary", async (req, res) => {
  const { requesterrole } = req.headers;

  if (requesterrole !== "Admin" && requesterrole !== "HR") {
    return res.status(403).json({ error: "Access Denied: Salary Info is only visible to Admin/HR" });
  }

  try {
    const userSalary = await sql`
      SELECT id, name, wage_type, monthly_wage, yearly_wage, basic_pay, hra, standard_allowance, performance_bonus, pf_deduction, pt_deduction
      FROM users WHERE id = ${req.params.id};
    `;

    if (userSalary.length === 0) return res.status(404).json({ error: "Employee not found" });

    res.status(200).json(userSalary[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;