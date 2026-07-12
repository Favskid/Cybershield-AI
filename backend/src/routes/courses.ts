import { Router, Request, Response } from "express";
import { db } from "@workspace/db";
import { coursesTable, quizzesTable, progressTable } from "@workspace/db";
import { eq, count, and } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import { logger } from "../lib/logger";

const router = Router();

// GET /courses
router.get("/", requireAuth, async (_req: Request, res: Response) => {
  try {
    const courses = await db.select().from(coursesTable).orderBy(coursesTable.createdAt);
    res.json(courses);
  } catch (err) {
    logger.error({ err }, "listCourses error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /courses — admin
router.post("/", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { title, description, content, videoUrl } = req.body;
    if (!title || !description || !content) {
      res.status(400).json({ error: "title, description, and content are required" });
      return;
    }
    const [course] = await db.insert(coursesTable).values({ title, description, content, videoUrl: videoUrl || null }).returning();
    res.status(201).json(course);
  } catch (err) {
    logger.error({ err }, "createCourse error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /courses/:courseId
router.get("/:courseId", requireAuth, async (req: Request, res: Response) => {
  try {
    const courseId = parseInt(req.params.courseId);
    if (isNaN(courseId)) {
      res.status(400).json({ error: "Invalid courseId" });
      return;
    }
    const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, courseId)).limit(1);
    if (!course) {
      res.status(404).json({ error: "Course not found" });
      return;
    }
    const [quizCountResult] = await db.select({ count: count() }).from(quizzesTable).where(eq(quizzesTable.courseId, courseId));
    const [userProgress] = await db.select().from(progressTable)
      .where(and(eq(progressTable.userId, req.user!.id), eq(progressTable.courseId, courseId)))
      .limit(1);
    const progressForCourse = userProgress ?? null;
    res.json({
      ...course,
      quizCount: Number(quizCountResult?.count || 0),
      userProgress: progressForCourse ? {
        score: progressForCourse.score,
        completed: progressForCourse.completed,
        completedAt: progressForCourse.completedAt,
      } : null,
    });
  } catch (err) {
    logger.error({ err }, "getCourse error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /courses/:courseId — admin
router.put("/:courseId", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const courseId = parseInt(req.params.courseId);
    if (isNaN(courseId)) {
      res.status(400).json({ error: "Invalid courseId" });
      return;
    }
    const { title, description, content, videoUrl } = req.body;
    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (content !== undefined) updates.content = content;
    if (videoUrl !== undefined) updates.videoUrl = videoUrl || null;
    const [course] = await db.update(coursesTable).set(updates).where(eq(coursesTable.id, courseId)).returning();
    if (!course) {
      res.status(404).json({ error: "Course not found" });
      return;
    }
    res.json(course);
  } catch (err) {
    logger.error({ err }, "updateCourse error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /courses/:courseId — admin
router.delete("/:courseId", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const courseId = parseInt(req.params.courseId);
    if (isNaN(courseId)) {
      res.status(400).json({ error: "Invalid courseId" });
      return;
    }
    await db.delete(coursesTable).where(eq(coursesTable.id, courseId));
    res.json({ message: "Course deleted" });
  } catch (err) {
    logger.error({ err }, "deleteCourse error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
