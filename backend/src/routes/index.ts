import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import coursesRouter from "./courses";
import quizzesRouter from "./quizzes";
import progressRouter from "./progress";
import threatsRouter from "./threats";
import announcementsRouter from "./announcements";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/courses", coursesRouter);
router.use("/quizzes", quizzesRouter);
router.use("/progress", progressRouter);
router.use("/threats", threatsRouter);
router.use("/announcements", announcementsRouter);
router.use("/admin", adminRouter);

export default router;
