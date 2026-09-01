import { Router } from "express";
import type { Request, Response } from "express";
import statsController from "../controllers/stats";
import { authMiddleware } from "@/middlewares/authMiddleware";

const router = Router();

router.get("/user", authMiddleware, async (request: Request, res: Response) => {
  const stats = await statsController.user(request.user!.id);

  return res.status(200).json(stats);
});

export default router;
