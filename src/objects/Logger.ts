export type LogLevel = "debug" | "info" | "warn" | "error";

class Logger {
  private isProduction: boolean;
  private isTest: boolean;
  private allowDebugLogInTest: boolean;

  public constructor() {
    this.isProduction = import.meta.env.PROD;
    this.isTest = import.meta.env.MODE === "test";
    this.allowDebugLogInTest = !!import.meta.env.ALLOW_DEBUG_LOG;
  }

  private shouldLog(level: LogLevel) {
    if (this.isProduction) {
      // In production, only log errors by default
      return level === "error";
    }

    if (this.isTest) {
      // we don't allow error logging in tests. if something shows up in
      // stderr, it might be annotated with @ts-expect-error, for example
      return level === "debug" && this.allowDebugLogInTest;
    }
    return true;
  }

  private log(level: LogLevel, message: any, ...optionalParams: any[]) {
    if (this.shouldLog(level)) {
      console[level](message, ...optionalParams);
    }
  }

  public debug(message: any, ...optionalParams: any[]) {
    this.log("debug", message, ...optionalParams);
  }

  public info(message: any, ...optionalParams: any[]) {
    this.log("info", message, ...optionalParams);
  }

  public warn(message: any, ...optionalParams: any[]) {
    this.log("warn", message, ...optionalParams);
  }

  public error(message: any, ...optionalParams: any[]) {
    this.log("error", message, ...optionalParams);
  }
}

const logger = new Logger();

export default logger;
