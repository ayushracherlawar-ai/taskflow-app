import express  from "express";
import bcrypt    from "bcrypt";
import jwt       from "jsonwebtoken";
import db        from "../db/database.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

const generateToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

// ── Register ────────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existing = db
      .prepare("SELECT * FROM users WHERE email = ? OR username = ?")
      .get(email, username);

    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const password_hash = await bcrypt.hash(password, 10);

    const result = db
      .prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)")
      .run(username, email, password_hash);

    const user  = { id: result.lastInsertRowid, username, email };
    const token = generateToken(user);

    res.status(201).json({ token, user });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// ── Login ───────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user);

    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// ── Change Password (protected) ─────────────────────────────────
router.put("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "Both current and new password are required" });

    if (newPassword.length < 6)
      return res.status(400).json({ message: "New password must be at least 6 characters" });

    // Fetch full user row to get password_hash
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch)
      return res.status(400).json({ message: "Current password is incorrect" });

    // Hash and save new password
    const newHash = await bcrypt.hash(newPassword, 10);
    db.prepare("UPDATE users SET password_hash = ? WHERE id = ?")
      .run(newHash, req.user.id);

    res.json({ message: "Password updated successfully" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;