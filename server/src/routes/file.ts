import { Router } from "express";
import type { Request, Response } from "express";
import * as z from "zod";
import fileController from "../controllers/file";
import { validate } from "@/middlewares/validate";
import { authMiddleware, requireVerified, requireAdmin } from "@/middlewares/authMiddleware";
import { Role } from "@/generated/prisma/enums";
import { listFilesSchema, fileIdSchema } from "@/schema/file";
import { upload } from "@/config/multer";
import { storage } from "@/lib/storage";

const router = Router();

const scopeFor = (user: Express.Request["user"]) =>
  user!.role === Role.ADMIN ? undefined : user!.id;

router.post("/upload", authMiddleware, requireVerified, upload.array("files"),
  async (request: Request, res: Response) => {
    const files = (request.files ?? []) as Express.Multer.File[];
    const created = await fileController.upload(request.user!.id, files);

    return res.status(201).json({ files: created });
  });


router.get("/", authMiddleware, validate(listFilesSchema),
  async (request: Request, res: Response) => {
    const { query } = res.locals.validated as z.infer<typeof listFilesSchema>;

    const result = await fileController.list({ ...query, userId: request.user!.id });

    return res.status(200).json(result);
  });


// Must precede "/:id" - Express matches in order, and "all" would otherwise be
// read as an id and rejected by the uuid check.
router.get("/all", authMiddleware, requireAdmin, validate(listFilesSchema),
  async (_request: Request, res: Response) => {
    const { query } = res.locals.validated as z.infer<typeof listFilesSchema>;

    const result = await fileController.list({ ...query, withOwner: true });

    return res.status(200).json(result);
  });


router.get("/:id", authMiddleware, validate(fileIdSchema),
  async (request: Request, res: Response) => {
    const file = await fileController.detail(request.params.id!, request.user!.id);

    return res.status(200).json({ file });
  });


router.get("/:id/download", authMiddleware, validate(fileIdSchema),
  async (request: Request, res: Response) => {
    const file = await fileController.locate(request.params.id!, request.user!.id);

    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("Content-Length", file.size);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(file.originalName)}"`
    );

    const stream = storage.stream(file.key);

    stream.on("error", () => {
      if (!res.headersSent) {
        res.status(404).json({ success: false, message: "File not found" });
        return;
      }
      res.end();
    });

    stream.pipe(res);
  });


router.delete("/:id", authMiddleware, validate(fileIdSchema),
  async (request: Request, res: Response) => {
    const result = await fileController.softDelete(request.params.id!, scopeFor(request.user));

    return res.status(200).json(result);
  });


export default router;
