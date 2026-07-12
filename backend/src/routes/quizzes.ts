import { Router, Request, Response } from "express";
import { db } from "@workspace/db";
import { quizzesTable, progressTable, coursesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import { logger } from "../lib/logger";

const router = Router();

// GET /quizzes/submit/:courseId — must come before /:quizId to avoid conflict
router.post("/submit/:courseId", requireAuth, async (req: Request, res: Response) => {
  try {
    const courseId = parseInt(req.params.courseId);
    if (isNaN(courseId)) {
      res.status(400).json({ error: "Invalid courseId" });
      return;
    }
    const { answers } = req.body;
    if (!answers || !Array.isArray(answers)) {
      res.status(400).json({ error: "answers array is required" });
      return;
    }

    const questions = await db.select().from(quizzesTable).where(eq(quizzesTable.courseId, courseId));
    if (questions.length === 0) {
      res.status(404).json({ error: "No quiz questions found for this course" });
      return;
    }

    let correct = 0;
    for (const q of questions) {
      const userAnswer = answers.find((a: { quizId: number; answer: string }) => a.quizId === q.id);
      if (userAnswer && userAnswer.answer === q.correctAnswer) correct++;
    }

    const score = Math.round((correct / questions.length) * 100);
    const passThreshold = parseInt(process.env.QUIZ_PASS_THRESHOLD ?? "60", 10);
    const passed = score >= passThreshold;
    const now = new Date();

    const existing = await db.select().from(progressTable)
      .where(and(eq(progressTable.userId, req.user!.id), eq(progressTable.courseId, courseId)))
      .limit(1);

    let progress;
    if (existing.length > 0) {
      const [updated] = await db.update(progressTable)
        .set({ score, completed: passed, completedAt: passed ? now : null })
        .where(and(eq(progressTable.userId, req.user!.id), eq(progressTable.courseId, courseId)))
        .returning();
      progress = updated;
    } else {
      const [inserted] = await db.insert(progressTable)
        .values({ userId: req.user!.id, courseId, score, completed: passed, completedAt: passed ? now : null })
        .returning();
      progress = inserted;
    }

    const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, courseId)).limit(1);

    res.json({ score, total: questions.length, passed, progress: { ...progress, course } });
  } catch (err) {
    logger.error({ err }, "submitQuiz error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /quizzes/course/:courseId
router.get("/course/:courseId", requireAuth, async (req: Request, res: Response) => {
  try {
    const courseId = parseInt(req.params.courseId);
    if (isNaN(courseId)) {
      res.status(400).json({ error: "Invalid courseId" });
      return;
    }
    const quizzes = await db.select().from(quizzesTable).where(eq(quizzesTable.courseId, courseId));
    res.json(quizzes);
  } catch (err) {
    logger.error({ err }, "listQuizzesByCourse error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /quizzes — admin
router.post("/", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { courseId, question, optionA, optionB, optionC, optionD, correctAnswer } = req.body;
    if (!courseId || !question || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }
    const [quiz] = await db.insert(quizzesTable)
      .values({ courseId, question, optionA, optionB, optionC, optionD, correctAnswer })
      .returning();
    res.status(201).json(quiz);
  } catch (err) {
    logger.error({ err }, "createQuiz error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /quizzes/:quizId — admin
router.put("/:quizId", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const quizId = parseInt(req.params.quizId);
    if (isNaN(quizId)) {
      res.status(400).json({ error: "Invalid quizId" });
      return;
    }
    const { question, optionA, optionB, optionC, optionD, correctAnswer } = req.body;
    const updates: Record<string, unknown> = {};
    if (question !== undefined) updates.question = question;
    if (optionA !== undefined) updates.optionA = optionA;
    if (optionB !== undefined) updates.optionB = optionB;
    if (optionC !== undefined) updates.optionC = optionC;
    if (optionD !== undefined) updates.optionD = optionD;
    if (correctAnswer !== undefined) updates.correctAnswer = correctAnswer;
    const [quiz] = await db.update(quizzesTable).set(updates).where(eq(quizzesTable.id, quizId)).returning();
    if (!quiz) { res.status(404).json({ error: "Quiz not found" }); return; }
    res.json(quiz);
  } catch (err) {
    logger.error({ err }, "updateQuiz error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /quizzes/:quizId — admin
router.delete("/:quizId", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const quizId = parseInt(req.params.quizId);
    if (isNaN(quizId)) { res.status(400).json({ error: "Invalid quizId" }); return; }
    await db.delete(quizzesTable).where(eq(quizzesTable.id, quizId));
    res.json({ message: "Quiz deleted" });
  } catch (err) {
    logger.error({ err }, "deleteQuiz error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
