import { resolve } from "path";
import { config } from "dotenv";

/**
 * Load env variables
 *
 * Copied from here, thanks!
 * https://github.com/motdotla/dotenv/blob/master/examples/typescript/src/lib/env.ts
 */
config({ path: resolve(__dirname, "../../.env") });
