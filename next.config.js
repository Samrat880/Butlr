/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

const ngrokOrigin = process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://")
  ? new URL(process.env.NEXT_PUBLIC_APP_URL).host
  : undefined;

/** @type {import("next").NextConfig} */
const config = {
  allowedDevOrigins: ngrokOrigin ? [ngrokOrigin] : [],
};

export default config;
