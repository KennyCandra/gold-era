import { prisma } from "../lib/prisma";
import { storage } from "../lib/storage";
import { extractContent } from "../lib/extract";
import FileRepository from "../reposatories/file";

/**
 * One-shot backfill for rows uploaded before extraction existed.
 * Re-runnable: only rows with content IS NULL are visited, and a file whose
 * type has no extractor simply stays null and is skipped again next time.
 */
const main = async () => {
  const files = await FileRepository.findMissingContent();

  console.log(`backfill: ${files.length} file(s) with no extracted content`);

  let updated = 0;
  let skipped = 0;
  let missing = 0;

  for (const file of files) {
    const buffer = await storage.read(file.key);

    if (!buffer) {
      missing += 1;
      console.log(`missing blob  ${file.id}  ${file.originalName}`);
      continue;
    }

    const content = await extractContent(buffer, file.mimeType);

    if (!content) {
      skipped += 1;
      console.log(`no content    ${file.id}  ${file.originalName} (${file.mimeType})`);
      continue;
    }

    await FileRepository.updateContent(file.id, content);
    updated += 1;
    console.log(`extracted     ${file.id}  ${file.originalName} (${content.length} chars)`);
  }

  console.log(
    `backfill done: ${updated} updated, ${skipped} no content, ${missing} missing blob`
  );
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
