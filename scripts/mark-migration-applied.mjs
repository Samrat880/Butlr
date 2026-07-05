import postgres from "postgres";

const sql = postgres(
  process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@localhost:5433/demoproject",
);

const hash =
  "d0358d058aa441743f6542f8f373021a85a4cb8f82bbdd782409be5062902662";

const existing = await sql`
  SELECT id FROM drizzle.__drizzle_migrations WHERE hash = ${hash}
`;

if (existing.length === 0) {
  await sql`
    INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
    VALUES (${hash}, ${String(1781775582964)})
  `;
  console.log("Marked migration 0001_mushy_legion as applied.");
} else {
  console.log("Migration 0001 already recorded.");
}

await sql.end();
