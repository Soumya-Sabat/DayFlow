import { sql } from "../config/db.js";

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Authentication is required." });

  try {
    const sessions = await sql`
      SELECT u.id, u.employee_id, u.name, u.email, u.role, u.company_name
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.token = ${token} AND s.expires_at > NOW();
    `;
    if (!sessions[0]) return res.status(401).json({ error: "Your session has expired. Please sign in again." });
    req.user = sessions[0];
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "You do not have permission to perform this action." });
    }
    next();
  };
}

export function ownsUserOrIsAdmin(req, userId) {
  return String(req.user?.id) === String(userId) || ["Admin", "HR"].includes(req.user?.role);
}
