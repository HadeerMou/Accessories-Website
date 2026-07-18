import { UserRole } from "../generated/prisma/enums.js";
import { prisma } from "../lib/prisma.js";
import { hashPassword } from "../modules/users/users.service.js";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const fullName = process.env.ADMIN_NAME?.trim() || "Aura Administrator";

if (!email || !password || password.length < 8) {
  throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 8 characters) in backend/.env");
}

await prisma.user.upsert({
  where: { email },
  update: {
    fullName,
    password: await hashPassword(password),
    role: UserRole.ADMIN,
    isVerified: true,
    deletedAt: null,
    updatedAt: new Date(),
  },
  create: {
    email,
    fullName,
    password: await hashPassword(password),
    role: UserRole.ADMIN,
    isVerified: true,
  },
});

console.log(`Admin account ready: ${email}`);
await prisma.$disconnect();
