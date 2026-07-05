import postgres from "postgres";

const sql = postgres(
  process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@localhost:5433/demoproject",
);

const migrations = await sql`
  SELECT * FROM drizzle.__drizzle_migrations ORDER BY created_at
`;
console.log("Applied migrations:", migrations);

await sql.end();
