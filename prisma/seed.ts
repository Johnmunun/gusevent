import { PrismaClient, AdminRole } from "@prisma/client";
import { defaultLandingCms } from "../src/lib/cms/defaults";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@gusevent.com").toLowerCase().trim();
  const name = process.env.SEED_ADMIN_NAME ?? "Administrateur";

  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name,
      role: AdminRole.SUPER_ADMIN,
      permissions: [],
      active: true,
    },
    update: {
      name,
      role: AdminRole.SUPER_ADMIN,
      active: true,
    },
  });

  const slugs = Object.keys(defaultLandingCms) as (keyof typeof defaultLandingCms)[];
  for (const slug of slugs) {
    await prisma.cmsSection.upsert({
      where: { slug },
      create: {
        slug,
        content: defaultLandingCms[slug] as object,
      },
      update: {},
    });
  }

  console.log("Seed OK");
  console.log(`  Profil admin (Prisma): ${email}`);
  console.log(
    "  Créez le même compte dans Neon Auth (Console → Auth → Users, ou inscription sur /admin/login)."
  );
  if (process.env.SEED_ADMIN_PASSWORD) {
    console.log(
      "  Mot de passe suggéré (à définir dans Neon Auth):",
      process.env.SEED_ADMIN_PASSWORD
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
