import "dotenv/config";

const main = async () => {
  try {
    const { corsair } = await import("./corsair.js");
    const res = await corsair.withTenant("dev").gmail.db.threads.search({
      data: {
        snippet: {
          contains: "naukri",
        },
      },
    });
    console.log(res);
  } catch (error) {
    throw error;
  }
};

void main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
