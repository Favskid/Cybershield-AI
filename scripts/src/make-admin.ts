import { db, usersTable, pool } from "@workspace/db";
import { eq } from "drizzle-orm";

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("Usage: pnpm --filter scripts run make-admin <email>");
    process.exit(1);
  }

  console.log(`Looking up user with email: ${email}...`);

  try {
    const existingUsers = await db.select().from(usersTable).where(eq(usersTable.email, email));

    if (existingUsers.length === 0) {
      console.error(`Error: User with email ${email} not found.`);
      process.exit(1);
    }

    const user = existingUsers[0];

    if (user.role === "ADMIN") {
      console.log(`User ${email} is already an ADMIN.`);
      process.exit(0);
    }

    await db.update(usersTable).set({ role: "ADMIN" }).where(eq(usersTable.id, user.id));
    console.log(`Success! User ${email} has been promoted to ADMIN.`);

  } catch (error) {
    console.error("An error occurred:", error);
    process.exit(1);
  } finally {
    // Close the database pool so the script can exit cleanly
    await pool.end();
  }
}

main();
