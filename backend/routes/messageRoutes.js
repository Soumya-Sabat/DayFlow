import express from "express";
import { sql } from "../config/db.js";
import { requireAuth } from "../lib/auth.js";

const router = express.Router();
router.use(requireAuth);

router.get("/contacts", async (req, res, next) => {
  try {
    const contacts = await sql`
      SELECT u.id, u.name, u.email, u.role,
        COUNT(m.id) FILTER (WHERE m.recipient_id = ${req.user.id} AND m.sender_id = u.id AND m.read_at IS NULL)::int AS unread_count
      FROM users u
      LEFT JOIN messages m ON m.sender_id = u.id
      WHERE u.id <> ${req.user.id}
      GROUP BY u.id, u.name, u.email, u.role
      ORDER BY CASE WHEN u.role IN ('Admin', 'HR') THEN 0 ELSE 1 END, u.name;`;
    res.json(contacts);
  } catch (error) { next(error); }
});

router.get("/:peerId", async (req, res, next) => {
  try {
    const peer = await sql`SELECT id FROM users WHERE id = ${req.params.peerId};`;
    if (!peer[0]) return res.status(404).json({ error: "Contact not found." });
    const messages = await sql`
      SELECT id, sender_id, recipient_id, body, created_at, read_at
      FROM messages
      WHERE (sender_id = ${req.user.id} AND recipient_id = ${req.params.peerId}) OR (sender_id = ${req.params.peerId} AND recipient_id = ${req.user.id})
      ORDER BY created_at ASC;`;
    await sql`UPDATE messages SET read_at = NOW() WHERE sender_id = ${req.params.peerId} AND recipient_id = ${req.user.id} AND read_at IS NULL;`;
    res.json(messages);
  } catch (error) { next(error); }
});

router.post("/", async (req, res, next) => {
  const recipientId = Number(req.body.recipientId);
  const body = typeof req.body.body === "string" ? req.body.body.trim() : "";
  if (!Number.isInteger(recipientId) || !body) return res.status(400).json({ error: "Recipient and message text are required." });
  if (recipientId === Number(req.user.id)) return res.status(400).json({ error: "You cannot message yourself." });
  if (body.length > 2000) return res.status(400).json({ error: "Messages must be 2,000 characters or fewer." });
  try {
    const recipient = await sql`SELECT id FROM users WHERE id = ${recipientId};`;
    if (!recipient[0]) return res.status(404).json({ error: "Recipient not found." });
    const messages = await sql`INSERT INTO messages (sender_id, recipient_id, body) VALUES (${req.user.id}, ${recipientId}, ${body}) RETURNING id, sender_id, recipient_id, body, created_at, read_at;`;
    res.status(201).json(messages[0]);
  } catch (error) { next(error); }
});

export default router;
