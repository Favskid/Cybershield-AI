/**
 * Seed script — creates the first admin account.
 *
 * Usage:
 *   pnpm --filter @workspace/api-server seed:admin
 *
 * Required env vars (loaded from ../.env via --env-file):
 *   ADMIN_EMAIL     — email address for the admin account
 *   ADMIN_PASSWORD  — password (min 6 characters)
 *   DATABASE_URL    — postgres connection string
 */

import bcrypt from "bcryptjs";
import { db, pool, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.error("ERROR: ADMIN_EMAIL and ADMIN_PASSWORD must be set in your .env file.");
  process.exit(1);
}

if (password.length < 6) {
  console.error("ERROR: ADMIN_PASSWORD must be at least 6 characters.");
  process.exit(1);
}

async function run() {
  const existing = await db
    .select({ id: usersTable.id, role: usersTable.role })
    .from(usersTable)
    .where(eq(usersTable.email, email!))
    .limit(1);

  if (existing.length > 0) {
    const user = existing[0];
    if (user.role === "ADMIN") {
      console.log(`Admin already exists with email "${email}" (id=${user.id}). Nothing to do.`);
    } else {
      // Promote existing user to admin
      await db
        .update(usersTable)
        .set({ role: "ADMIN" })
        .where(eq(usersTable.id, user.id));
      console.log(`Promoted existing user "${email}" (id=${user.id}) to ADMIN.`);
    }
    return;
  }

  const hashed = await bcrypt.hash(password!, 10);
  const [admin] = await db
    .insert(usersTable)
    .values({
      fullName: "Administrator",
      email: email!,
      password: hashed,
      role: "ADMIN",
    })
    .returning({ id: usersTable.id, email: usersTable.email, role: usersTable.role });

  console.log(`Admin created successfully:`);
  console.log(`  ID:    ${admin.id}`);
  console.log(`  Email: ${admin.email}`);
  console.log(`  Role:  ${admin.role}`);
}

run()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => pool.end());
