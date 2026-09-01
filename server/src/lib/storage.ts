import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { env } from "@/config";
import { AppError } from "./AppError";

export interface Storage {
  save(key: string, buffer: Buffer): Promise<void>;
  read(key: string): Promise<Buffer | null>;
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
    read: async (key) => {
      try {
        return await fs.promises.readFile(resolve(key));
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code === "ENOENT") {
          return null;
        }

        throw err;
      }
    },
    stream: (key) => fs.createReadStream(resolve(key)),
    delete: async (key) => {
      await fs.promises.rm(resolve(key), { force: true });
    },
  };
};

export const storage: Storage = diskStorage(env.uploadDir);
