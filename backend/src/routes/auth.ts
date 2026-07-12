import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, generateToken } from "../middlewares/auth";
import { logger } from "../lib/logger";

const router = Router();

// POST /auth/register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      res.status(400).json({ error: "fullName, email, and password are required" });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters" });
      return;
    }
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }
    const hashed = await bcrypt.hash(password, 10);
    const [user] = await db.insert(usersTable).values({ fullName, email, password: hashed, role: "USER" }).returning();
    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    const { password: _pw, ...safeUser } = user;
    res.status(201).json({ token, user: safeUser });
  } catch (err) {
    logger.error({ err }, "register error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "email and password are required" });
      return;
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    const { password: _pw, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    logger.error({ err }, "login error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /auth/me
router.get("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id)).limit(1);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const { password: _pw, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    logger.error({ err }, "getMe error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /auth/profile
router.patch("/profile", requireAuth, async (req: Request, res: Response) => {
  try {
    const { fullName } = req.body;
    if (!fullName) {
      res.status(400).json({ error: "fullName is required" });
      return;
    }
    const [user] = await db.update(usersTable).set({ fullName }).where(eq(usersTable.id, req.user!.id)).returning();
    const { password: _pw, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    logger.error({ err }, "updateProfile error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /auth/change-password
router.post("/change-password", requireAuth, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: "currentPassword and newPassword are required" });
      return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ error: "New password must be at least 6 characters" });
      return;
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id)).limit(1);
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      res.status(400).json({ error: "Current password is incorrect" });
      return;
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.update(usersTable).set({ password: hashed }).where(eq(usersTable.id, req.user!.id));
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    logger.error({ err }, "changePassword error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
