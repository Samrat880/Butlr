import postgres from "postgres";

const sql = postgres(
  process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@localhost:5433/demoproject",
);

const tables = await sql`
  SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
`;
console.log("TABLES:", tables.map((t) => t.tablename).join(", "));

for (const table of [
  "user",
  "account",
  "session",
  "user_profile",
  "usage_record",
  "corsair_accounts",
]) {
  const cols = await sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = ${table}
    ORDER BY ordinal_position
  `;
  if (cols.length) {
    console.log(`\n${table}:`, cols);
    const pks = await sql`
      SELECT a.attname
      FROM pg_index i
      JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
      WHERE i.indrelid = ${table}::regclass AND i.indisprimary
    `;
    console.log(`  PK:`, pks.map((p) => p.attname).join(", "));
  }
}

await sql.end();
