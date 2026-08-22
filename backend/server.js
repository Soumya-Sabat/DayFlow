import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

// Import HRMS API Routes
import authRoutes from "./routes/authRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";

import { sql } from "./config/db.js";
import { aj } from "./lib/arcjet.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
// const __dirname = path.resolve();

app.use(express.json());
app.use(cors());
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
); // Security middleware
app.use(morgan("dev")); // Logging middleware

// Apply Arcjet rate-limiting / security to all routes
app.use(async (req, res, next) => {
  try {
    const decision = await aj.protect(req, {
      requested: 1, // Consumes 1 token per request
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        res.status(429).json({ error: "Too Many Requests" });
      } else if (decision.reason.isBot()) {
        res.status(403).json({ error: "Bot access denied" });
      } else {
        res.status(403).json({ error: "Forbidden" });
      }
      return;
    }

    // Check for spoofed bots
    if (decision.results.some((result) => result.reason.isBot() && result.reason.isSpoofed())) {
      res.status(403).json({ error: "Spoofed bot detected" });
      return;
    }

    next();
  } catch (error) {
    console.log("Arcjet error", error);
    next(error);
  }
});

// API Endpoints
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);

// Serve static assets in production
// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "/frontend/dist")));

//   app.get("*", (req, res) => {
//     res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
//   });
// }

// Initialize HRMS Database Tables
async function initDB() {
  try {
    // 1. Users / Employees Table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        employee_id VARCHAR(50) UNIQUE,              -- Auto-generated format: e.g., OIJODO20260001
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        password VARCHAR(255) NOT NULL,              -- System auto-generates or user-defined
        role VARCHAR(50) DEFAULT 'Employee',         -- 'Admin' or 'Employee'
        company_name VARCHAR(255),
        address TEXT,
        profile_picture VARCHAR(255),
        
        -- Salary & Wage Components (Admin/HR access only)
        wage_type VARCHAR(50) DEFAULT 'Fixed',       
        monthly_wage DECIMAL(10, 2) DEFAULT 0.00,    
        yearly_wage DECIMAL(10, 2) DEFAULT 0.00,     
        basic_pay DECIMAL(10, 2) DEFAULT 0.00,       
        hra DECIMAL(10, 2) DEFAULT 0.00,             
        standard_allowance DECIMAL(10, 2) DEFAULT 0.00, 
        performance_bonus DECIMAL(10, 2) DEFAULT 0.00,
        pf_deduction DECIMAL(10, 2) DEFAULT 0.00,    
        pt_deduction DECIMAL(10, 2) DEFAULT 0.00,    
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. Attendance Table
    await sql`
      CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        check_in TIMESTAMP,                          -- Logged upon Check In
        check_out TIMESTAMP,                         -- Logged upon Check Out
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        status VARCHAR(50) DEFAULT 'Present',        -- 'Present', 'Absent', 'Half-day', 'Leave'
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 3. Leave & Time-Off Requests Table
    await sql`
      CREATE TABLE IF NOT EXISTS leave_requests (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        leave_type VARCHAR(50) NOT NULL,            -- 'Paid', 'Sick', 'Unpaid'
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        remarks TEXT,
        status VARCHAR(50) DEFAULT 'Pending',        -- 'Pending', 'Approved', 'Rejected'
        admin_comments TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing DB:", error);
  }
}

// Start Server after Database Setup
initDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
  });
});