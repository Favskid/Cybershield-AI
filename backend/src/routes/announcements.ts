import { Router, Request, Response } from "express";
import { db } from "@workspace/db";
import { announcementsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import { logger } from "../lib/logger";

const router = Router();

// GET /announcements
router.get("/", requireAuth, async (_req: Request, res: Response) => {
  try {
    const announcements = await db.select().from(announcementsTable).orderBy(desc(announcementsTable.createdAt));
    res.json(announcements);
  } catch (err) {
    logger.error({ err }, "listAnnouncements error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /announcements — admin
router.post("/", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { title, message } = req.body;
    if (!title || !message) {
      res.status(400).json({ error: "title and message are required" });
      return;
    }
    const [announcement] = await db.insert(announcementsTable).values({ title, message }).returning();
    res.status(201).json(announcement);
  } catch (err) {
    logger.error({ err }, "createAnnouncement error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /announcements/:announcementId — admin
router.delete("/:announcementId", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const announcementId = parseInt(req.params.announcementId);
    if (isNaN(announcementId)) { res.status(400).json({ error: "Invalid announcementId" }); return; }
    await db.delete(announcementsTable).where(eq(announcementsTable.id, announcementId));
    res.json({ message: "Announcement deleted" });
  } catch (err) {
    logger.error({ err }, "deleteAnnouncement error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
