import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const { seed } = await import("../src/lib/seed");
  const r = await seed();
  console.log(`Seed complete. Inserted ${r.items} items (0 means the database already had content).`);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
