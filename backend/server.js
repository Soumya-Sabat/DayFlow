import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";

// Import HRMS API Routes
import authRoutes from "./routes/authRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import payrollRoutes from "./routes/payrollRoutes.js";

import { sql } from "./config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set("trust proxy", true);
app.use(express.json());
app.use(cors());
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(morgan("dev"));
app.get("/api/health", async (_req, res, next) => {
  try {
    await sql`SELECT 1`;
    res.json({ status: "ok" });
  } catch (error) {
    next(error);
  }
});

// Arcjet disabled for development
// import { aj } from "./lib/arcjet.js";
// app.use(async (req, res, next) => {
//   if (!process.env.ARCJET_KEY) {
//     return next();
//   }
//   try {
//     const decision = await aj.protect(req, { requested: 1 });
//
//     if (decision.isDenied()) {
//       if (decision.reason.isRateLimit()) {
//         res.status(429).json({ error: "Too Many Requests" });
//       } else if (decision.reason.isBot()) {
//         res.status(403).json({ error: "Bot access denied" });
//       } else {
//         res.status(403).json({ error: "Forbidden" });
//       }
//       return;
//     }
//
//     if (decision.results.some((result) => result.reason.isBot() && result.reason.isSpoofed())) {
//       res.status(403).json({ error: "Spoofed bot detected" });
//       return;
//     }
//
//     next();
//   } catch (error) {
//     console.log("Arcjet error", error);
//     next(error);
//   }
// });

// API Endpoints
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/payroll", payrollRoutes);

// Initialize HRMS Database Tables & Seed Sample Data
async function initDB() {
  try {
    // 1. Users / Employees Table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        employee_id VARCHAR(50) UNIQUE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'Employee',
        company_name VARCHAR(255),
        address TEXT,
        profile_picture VARCHAR(255),
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
    // Upgrade databases created by earlier versions. CREATE TABLE IF NOT EXISTS does
    // not add fields to an existing table, so every runtime field is migrated here.
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_id VARCHAR(50) UNIQUE;`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'Employee';`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(255);`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS wage_type VARCHAR(50) DEFAULT 'Fixed';`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS monthly_wage DECIMAL(10, 2) DEFAULT 0.00;`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS yearly_wage DECIMAL(10, 2) DEFAULT 0.00;`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS basic_pay DECIMAL(10, 2) DEFAULT 0.00;`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS hra DECIMAL(10, 2) DEFAULT 0.00;`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS standard_allowance DECIMAL(10, 2) DEFAULT 0.00;`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS performance_bonus DECIMAL(10, 2) DEFAULT 0.00;`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS pf_deduction DECIMAL(10, 2) DEFAULT 0.00;`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS pt_deduction DECIMAL(10, 2) DEFAULT 0.00;`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`;

    // 2. Attendance Table
    await sql`
      CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        check_in TIMESTAMP,
        check_out TIMESTAMP,
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        status VARCHAR(50) DEFAULT 'Present',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 3. Leave & Time-Off Requests Table
    await sql`
      CREATE TABLE IF NOT EXISTS leave_requests (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        leave_type VARCHAR(50) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        allocation_days DECIMAL(5, 2) NOT NULL,
        attachment VARCHAR(255),
        remarks TEXT,
        status VARCHAR(50) DEFAULT 'Pending',
        admin_comments TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    // Upgrade legacy leave tables created before all request metadata existed.
    await sql`ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS allocation_days DECIMAL(5, 2) NOT NULL DEFAULT 1.0;`;
    await sql`ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS attachment VARCHAR(255);`;
    await sql`ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS remarks TEXT;`;
    await sql`ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Pending';`;
    await sql`ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS admin_comments TEXT;`;
    await sql`ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100);`;

    // 4. Payslips Table
    await sql`
      CREATE TABLE IF NOT EXISTS payslips (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        month_year VARCHAR(50) NOT NULL,
        basic_pay DECIMAL(10, 2) DEFAULT 0.00,
        hra DECIMAL(10, 2) DEFAULT 0.00,
        performance_bonus DECIMAL(10, 2) DEFAULT 0.00,
        pf_deduction DECIMAL(10, 2) DEFAULT 0.00,
        pt_deduction DECIMAL(10, 2) DEFAULT 0.00,
        net_pay DECIMAL(10, 2) DEFAULT 0.00,
        status VARCHAR(50) DEFAULT 'Paid',
        payment_date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(128) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    console.log("Database tables initialized successfully");
  } catch (error) {
    console.warn("DB initialization notice:", error.message);
  }
}

// Start Server after Database Setup
initDB().then(() => {
  app.listen(PORT, () => {
    console.log("Dayflow HRMS Server is running on port " + PORT);
  });
});

app.use((error, _req, res, next) => {
  void next;
  console.error("Unhandled API error:", error);
  res.status(500).json({ error: "The server could not complete this request." });
});
