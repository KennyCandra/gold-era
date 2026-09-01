import { Router } from "express";
import type { Request, Response } from "express";
import * as z from "zod";
import userController from "../controllers/user";
import { validate } from "@/middlewares/validate";
import { authMiddleware, requireAdmin } from "@/middlewares/authMiddleware";
import { listUsersSchema, userIdSchema, updateUserSchema } from "@/schema/user";

const router = Router();

router.use(authMiddleware, requireAdmin);

router.get("/", validate(listUsersSchema),
  async (_request: Request, res: Response) => {
    const { query } = res.locals.validated as z.infer<typeof listUsersSchema>;

    const result = await userController.list(query);

    return res.status(200).json(result);
  });


router.patch("/:id", validate(updateUserSchema),
  async (_request: Request, res: Response) => {
    const { params, body } = res.locals.validated as z.infer<typeof updateUserSchema>;

    const result = await userController.updateRole(params.id, body.role);

    return res.status(200).json(result);
  });


router.delete("/:id", validate(userIdSchema),
  async (request: Request, res: Response) => {
    const { params } = res.locals.validated as z.infer<typeof userIdSchema>;

    const result = await userController.remove(request.user!.id, params.id);

    return res.status(200).json(result);
  });


export default router;
