import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { env } from "@/config";
import { AppError } from "./AppError";

export interface Storage {
  save(key: string, buffer: Buffer): Promise<void>;
  stream(key: string): NodeJS.ReadableStream;
  delete(key: string): Promise<void>;
}

export const buildKey = (originalName: string): string =>
  `${randomUUID()}${path.extname(originalName).toLowerCase()}`;

const diskStorage = (dir: string): Storage => {
  const root = path.resolve(dir);
  fs.mkdirSync(root, { recursive: true });

  const resolve = (key: string) => {
    const full = path.resolve(root, key);

    if (full !== path.join(root, path.basename(full))) {
      throw new AppError(400, "Invalid file key");
    }

    return full;
  };

  return {
    save: (key, buffer) => fs.promises.writeFile(resolve(key), buffer),
    stream: (key) => fs.createReadStream(resolve(key)),
    delete: async (key) => {
      await fs.promises.rm(resolve(key), { force: true });
    },
  };
};

export const storage: Storage = diskStorage(env.uploadDir);
