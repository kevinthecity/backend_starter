/**
 * A way to log things and specify log severity. This isn't a super common
 * way to log in node development, however it was simple enough for my purposes.
 * There are popular js logging libs if you'd like to explore them!
 */
export const log = (type: LogType = LogType.DEBUG): ((message?: any) => void) => {
  return (message?: any): void => {
    if (process.env.NODE_ENV === "development" || true) {
      // tslint:disable-next-line: no-console
      console.log(`${type}: ${message}`);
    }
  };
};

/**
 * LogTypes, carried over from JAVA but just as relevant here.
 * https://stackoverflow.com/a/2031209
 *
 * Wanna know more about currying?
 * https://gist.github.com/donnut/fd56232da58d25ceecf1
 */
export enum LogType {
  /**
   * Trace - Only when I would be "tracing" the code and
   * trying to find one part of a function specifically.
   */
  TRACE,
  /**
   * Debug - Information that is diagnostically helpful to
   * people more than just developers (IT, sysadmins, etc.).
   */
  DEBUG,
  /**
   * Info - Generally useful information to log (service
   * start/stop, configuration assumptions, etc). Info I want
   * to always have available but usually don't care about
   * under normal circumstances. This is my out-of-the-box
   * config level.
   */
  INFO,
  /**
   * Warn - Anything that can potentially cause application
   * oddities, but for which I am automatically recovering.
   * (Such as switching from a primary to backup server,
   * retrying an operation, missing secondary data, etc.)
   */
  WARN,
  /**
   * Error - Any error which is fatal to the operation, but
   * not the service or application (can't open a required
   * file, missing data, etc.). These errors will force user
   * (administrator, or direct user) intervention. These are
   * usually reserved (in my apps) for incorrect connection
   * strings, missing services, etc.
   */
  ERROR,
  /**
   * Fatal - Any error that is forcing a shutdown of the
   * service or application to prevent data loss (or further
   * data loss). I reserve these only for the most heinous
   * errors and situations where there is guaranteed to
   * have been data corruption or loss.
   */
  FATAL,
}
