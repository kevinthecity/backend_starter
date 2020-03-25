import { createLogger, transports } from "winston";

/**
 * https://github.com/winstonjs/winston
 *
 * This is an acutal logging implementation that the Apollo Server uses.
 * I didn't enjoy using it for general development (which is why there 
 * is a separate log.ts file), but thats just a personal preference.
 *
 */
export const logger = createLogger({
  transports: [new transports.Console()]
});
