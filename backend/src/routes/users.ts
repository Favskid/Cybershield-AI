import { Router, Request, Response } from "express";
import { db } from "@workspace/db";
import { usersTable, progressTable, coursesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import { logger } from "../lib/logger";

const router = Router();

// GET /users — admin only
router.get("/", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const users = await db.select({
      id: usersTable.id,
      fullName: usersTable.fullName,
      email: usersTable.email,
      role: usersTable.role,
      createdAt: usersTable.createdAt,
      updatedAt: usersTable.updatedAt,
    }).from(usersTable).orderBy(usersTable.createdAt);
    res.json(users);
  } catch (err) {
    logger.error({ err }, "listUsers error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /users/:userId — admin only
router.delete("/:userId", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      res.status(400).json({ error: "Invalid userId" });
      return;
    }
    await db.delete(usersTable).where(eq(usersTable.id, userId));
    res.json({ message: "User deleted" });
  } catch (err) {
    logger.error({ err }, "deleteUser error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /users/:userId/progress — admin only
router.get("/:userId/progress", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      res.status(400).json({ error: "Invalid userId" });
      return;
    }
    const progress = await db
      .select({
        id: progressTable.id,
        userId: progressTable.userId,
        courseId: progressTable.courseId,
        score: progressTable.score,
        completed: progressTable.completed,
        completedAt: progressTable.completedAt,
        createdAt: progressTable.createdAt,
        course: {
          id: coursesTable.id,
          title: coursesTable.title,
          description: coursesTable.description,
          content: coursesTable.content,
          videoUrl: coursesTable.videoUrl,
          createdAt: coursesTable.createdAt,
        },
      })
      .from(progressTable)
      .leftJoin(coursesTable, eq(progressTable.courseId, coursesTable.id))
      .where(eq(progressTable.userId, userId));
    res.json(progress);
  } catch (err) {
    logger.error({ err }, "getUserProgress error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
