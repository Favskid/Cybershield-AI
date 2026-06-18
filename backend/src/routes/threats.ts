import { Router, Request, Response } from "express";
import { db } from "@workspace/db";
import { threatsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import { logger } from "../lib/logger";
import OpenAI from "openai";

const router = Router();

function getOpenAIClient(): OpenAI | null {
  if (!process.env.GROQ_API_KEY) return null;
  return new OpenAI({ 
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });
}

async function analyzeWithAI(title: string, description: string, link?: string): Promise<{ analysis: string; riskLevel: "LOW" | "MEDIUM" | "HIGH" }> {
  const client = getOpenAIClient();
  if (!client) {
    return {
      analysis: "AI analysis unavailable — no Groq API key configured. Please add your GROQ_API_KEY to enable threat analysis.",
      riskLevel: "MEDIUM",
    };
  }

  const prompt = `You are a cybersecurity expert analyzing a user-submitted threat report. Analyze the following threat and provide:
1. A brief threat category classification
2. Risk level assessment (LOW, MEDIUM, or HIGH)
3. Security recommendations

Threat Title: ${title}
Description: ${description}
${link ? `Suspicious Link: ${link}` : ""}

Respond in this exact JSON format:
{
  "category": "string",
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "summary": "brief summary of the threat",
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}`;

  try {
    const response = await client.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);

    const analysisText = `Category: ${parsed.category || "Unknown"}\n\nSummary: ${parsed.summary || "No summary available."}\n\nRecommendations:\n${(parsed.recommendations || []).map((r: string, i: number) => `${i + 1}. ${r}`).join("\n")}`;

    return {
      analysis: analysisText,
      riskLevel: (["LOW", "MEDIUM", "HIGH"].includes(parsed.riskLevel) ? parsed.riskLevel : "MEDIUM") as "LOW" | "MEDIUM" | "HIGH",
    };
  } catch (err) {
    logger.error({ err }, "Groq analysis failed");
    return {
      analysis: "AI analysis could not be completed. Please review the threat report manually.",
      riskLevel: "MEDIUM",
    };
  }
}

// GET /threats — own for users, all for admin
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    if (req.user!.role === "ADMIN") {
      const threats = await db.select().from(threatsTable).orderBy(threatsTable.createdAt);
      res.json(threats);
    } else {
      const threats = await db.select().from(threatsTable).where(eq(threatsTable.userId, req.user!.id));
      res.json(threats);
    }
  } catch (err) {
    logger.error({ err }, "listThreats error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /threats
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const { title, description, link, imageUrl } = req.body;
    if (!title || !description) {
      res.status(400).json({ error: "title and description are required" });
      return;
    }
    const { analysis, riskLevel } = await analyzeWithAI(title, description, link);
    const [threat] = await db.insert(threatsTable).values({
      userId: req.user!.id,
      title,
      description,
      link: link || null,
      imageUrl: imageUrl || null,
      aiAnalysis: analysis,
      riskLevel,
      status: "PENDING",
    }).returning();
    res.status(201).json(threat);
  } catch (err) {
    logger.error({ err }, "createThreat error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /threats/:threatId
router.get("/:threatId", requireAuth, async (req: Request, res: Response) => {
  try {
    const threatId = parseInt(req.params.threatId);
    if (isNaN(threatId)) { res.status(400).json({ error: "Invalid threatId" }); return; }
    const [threat] = await db.select().from(threatsTable).where(eq(threatsTable.id, threatId)).limit(1);
    if (!threat) { res.status(404).json({ error: "Threat not found" }); return; }
    if (req.user!.role !== "ADMIN" && threat.userId !== req.user!.id) {
      res.status(403).json({ error: "Forbidden" }); return;
    }
    res.json(threat);
  } catch (err) {
    logger.error({ err }, "getThreat error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /threats/:threatId/status — admin
router.patch("/:threatId/status", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const threatId = parseInt(req.params.threatId);
    if (isNaN(threatId)) { res.status(400).json({ error: "Invalid threatId" }); return; }
    const { status } = req.body;
    if (!["PENDING", "REVIEWED", "RESOLVED"].includes(status)) {
      res.status(400).json({ error: "status must be PENDING, REVIEWED, or RESOLVED" }); return;
    }
    const [threat] = await db.update(threatsTable).set({ status }).where(eq(threatsTable.id, threatId)).returning();
    if (!threat) { res.status(404).json({ error: "Threat not found" }); return; }
    res.json(threat);
  } catch (err) {
    logger.error({ err }, "updateThreatStatus error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
