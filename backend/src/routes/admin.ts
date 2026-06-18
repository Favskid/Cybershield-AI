import { Router, Request, Response } from "express";
import { db } from "@workspace/db";
import { usersTable, coursesTable, threatsTable, progressTable } from "@workspace/db";
import { eq, count, avg, desc } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import { logger } from "../lib/logger";

const router = Router();

// GET /admin/stats
router.get("/stats", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const [userCount] = await db.select({ count: count() }).from(usersTable);
    const [courseCount] = await db.select({ count: count() }).from(coursesTable);
    const [threatCount] = await db.select({ count: count() }).from(threatsTable);
    const [pendingCount] = await db.select({ count: count() }).from(threatsTable).where(eq(threatsTable.status, "PENDING"));
    const [resolvedCount] = await db.select({ count: count() }).from(threatsTable).where(eq(threatsTable.status, "RESOLVED"));
    const [avgScore] = await db.select({ avg: avg(progressTable.score) }).from(progressTable);
    const [completedCount] = await db.select({ count: count() }).from(progressTable).where(eq(progressTable.completed, true));

    res.json({
      totalUsers: Number(userCount?.count || 0),
      totalCourses: Number(courseCount?.count || 0),
      totalThreats: Number(threatCount?.count || 0),
      pendingThreats: Number(pendingCount?.count || 0),
      resolvedThreats: Number(resolvedCount?.count || 0),
      avgQuizScore: Number(avgScore?.avg || 0),
      completedCourses: Number(completedCount?.count || 0),
    });
  } catch (err) {
    logger.error({ err }, "getAdminStats error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /admin/threats — all threats with user info
router.get("/threats", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const threats = await db
      .select({
        id: threatsTable.id,
        userId: threatsTable.userId,
        title: threatsTable.title,
        description: threatsTable.description,
        link: threatsTable.link,
        imageUrl: threatsTable.imageUrl,
        aiAnalysis: threatsTable.aiAnalysis,
        riskLevel: threatsTable.riskLevel,
        status: threatsTable.status,
        createdAt: threatsTable.createdAt,
        user: {
          id: usersTable.id,
          fullName: usersTable.fullName,
          email: usersTable.email,
        },
      })
      .from(threatsTable)
      .leftJoin(usersTable, eq(threatsTable.userId, usersTable.id))
      .orderBy(desc(threatsTable.createdAt));
    res.json(threats);
  } catch (err) {
    logger.error({ err }, "listAdminThreats error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /admin/recent-activity
router.get("/recent-activity", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const recentThreats = await db
      .select({
        id: threatsTable.id,
        userId: threatsTable.userId,
        title: threatsTable.title,
        description: threatsTable.description,
        link: threatsTable.link,
        imageUrl: threatsTable.imageUrl,
        aiAnalysis: threatsTable.aiAnalysis,
        riskLevel: threatsTable.riskLevel,
        status: threatsTable.status,
        createdAt: threatsTable.createdAt,
        user: {
          id: usersTable.id,
          fullName: usersTable.fullName,
          email: usersTable.email,
        },
      })
      .from(threatsTable)
      .leftJoin(usersTable, eq(threatsTable.userId, usersTable.id))
      .orderBy(desc(threatsTable.createdAt))
      .limit(5);

    const recentUsers = await db
      .select({
        id: usersTable.id,
        fullName: usersTable.fullName,
        email: usersTable.email,
        role: usersTable.role,
        createdAt: usersTable.createdAt,
        updatedAt: usersTable.updatedAt,
      })
      .from(usersTable)
      .orderBy(desc(usersTable.createdAt))
      .limit(5);

    const recentProgress = await db
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
      .orderBy(desc(progressTable.createdAt))
      .limit(5);

    res.json({ recentThreats, recentUsers, recentProgress });
  } catch (err) {
    logger.error({ err }, "getRecentActivity error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
