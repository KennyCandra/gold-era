import { env } from "./config";
import bcrypt from "bcryptjs";
import { prisma } from "./lib/prisma";
import { Role } from "./generated/prisma/enums";

const main = async () => {
  const { adminEmail, adminName, adminPassword } = env;

  if (!adminEmail || !adminName || !adminPassword) {
    throw new Error(
      "Seeding requires ADMIN_EMAIL, ADMIN_NAME and ADMIN_PASSWORD"
    );
  }

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: adminName,
      email: adminEmail,
      password: await bcrypt.hash(adminPassword, 12),
      role: Role.ADMIN,
      verified: true,
    },
  });

  console.log(`admin ready: ${admin.email} (${admin.role})`);
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
