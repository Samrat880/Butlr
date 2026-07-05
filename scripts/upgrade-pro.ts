import "dotenv/config";

import { upgradeUserToPersonal } from "../src/server/services/admin";

const email = process.argv[2] ?? "krsamrat1010@gmail.com";
const result = await upgradeUserToPersonal(email);
console.log(result);
