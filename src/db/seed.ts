import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users } from "./schema";
import * as dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

dotenv.config({ path: "./.env" });

async function main() {
  try {
    const client = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const db = drizzle(client);

    console.info("seeding started ...");

    await db.delete(users);

    await db.insert(users).values([
      {
        id: uuidv4(),
        fullName: "Md. Jahid Hasan Shuvo",
        email: "jahid.shuvo@monstar-lab.com",
      },
      {
        id: uuidv4(),
        fullName: "Arun Kundu",
        email: "arun.kundu@monstar-lab.com",
      },
      {
        id: uuidv4(),
        fullName: "Rifat Alam",
        email: "rifat.alam@monstar-lab.com",
      },
    ]);

    console.info("seeding finished");
  } catch (e) {
    console.info("seeding failed ...", e);
  }
  process.exit(0);
}
main();
