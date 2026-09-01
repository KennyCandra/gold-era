import { prisma } from "@/lib/prisma";
import FileRepository, { FileListParams } from "@/reposatories/file";
import { AppError } from "@/lib/AppError";
import { storage, buildKey } from "@/lib/storage";

class fileController {
  static async upload(userId: string, files: Express.Multer.File[]) {
    if (!files?.length) {
      throw new AppError(400, "No files uploaded");
    }

    const prepared = files.map((file) => ({
      file,
      key: buildKey(file.originalname),
    }));

    await prisma.$transaction(async (tx) => {
      await FileRepository.createMany(
        prepared.map(({ file, key }) => ({
          userId,
          key,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
        })),
        tx
      );
    });

    const keys = prepared.map(({ key }) => key);

    try {
      await Promise.all(
        prepared.map(({ file, key }) => storage.save(key, file.buffer))
      );
    } catch {
      await FileRepository.deleteByKeys(keys);
      throw new AppError(500, "Failed to store uploaded files");
    }

    const created = await FileRepository.findByKeys(keys);

    return created.map(({ key, content, deletedAt, ...rest }) => rest);
  }

  static async list(params: FileListParams) {
    const [data, total] = await FileRepository.findAll(params);

    return {
      data,
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.ceil(total / params.limit) || 1,
    };
  }

  static async detail(id: string, userId?: string) {
    const file = await FileRepository.findById(id, userId);

    if (!file) {
      throw new AppError(404, "File not found");
    }

    const { key, ...rest } = file;
    return rest;
  }

  static async locate(id: string, userId?: string) {
    const file = await FileRepository.findById(id, userId);

    if (!file) {
      throw new AppError(404, "File not found");
    }

    return file;
  }

  static async softDelete(id: string, userId?: string) {
    const { count } = await FileRepository.softDelete(id, userId);

    if (!count) {
      throw new AppError(404, "File not found");
    }

    return { message: "File deleted" };
  }
}

export default fileController;
