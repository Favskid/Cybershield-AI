import { Router, Request, Response } from "express";
import { db } from "@workspace/db";
import { progressTable, coursesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { logger } from "../lib/logger";

const router = Router();

// GET /progress — current user's progress
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
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
      .where(eq(progressTable.userId, req.user!.id));
    res.json(progress);
  } catch (err) {
    logger.error({ err }, "getMyProgress error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
