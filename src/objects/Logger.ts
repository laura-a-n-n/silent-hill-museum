export type LogLevel = "debug" | "info" | "warn" | "error";
export type Pipe = {
  onMessage: (level: LogLevel, message: any, ...optionalParams: any[]) => void;
  clear?: () => void;
  allowedLevels?: LogLevel[];
  enabled: boolean;
};

class Logger {
  private isProduction: boolean;
  private isTest: boolean;
  private allowDebugLogInTest: boolean;
  private pipes: { [pipeId: string]: Pipe } = {
    __default: {
      enabled: true,
      onMessage: (level, message, ...optionalParams) =>
        console[level](message, ...optionalParams),
    },
  };
  private currentPipeId = 0;

  public constructor() {
    this.isProduction = import.meta.env.PROD;
    this.isTest = import.meta.env.MODE === "test";
    this.allowDebugLogInTest = !!import.meta.env.ALLOW_DEBUG_LOG;
  }

  private shouldLog(level: LogLevel, allowedLevels?: LogLevel[]) {
    if (allowedLevels) {
      return allowedLevels.indexOf(level) >= 0;
    }

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
    Object.values(this.pipes).forEach((pipe) => {
      if (!pipe.enabled) {
        return;
      }
      if (this.shouldLog(level, pipe.allowedLevels)) {
        pipe.onMessage(level, message, ...optionalParams);
      }
    });
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

  public addPipe(pipe: Pipe, key?: string) {
    const id = key ?? this.currentPipeId++;
    this.pipes[id] = pipe;
    return id;
  }

  public removePipe(pipeId: string): void;
  public removePipe(pipe: Pipe): void;
  public removePipe(pipeOrId: Pipe | string) {
    if (typeof pipeOrId === "number") {
      delete this.pipes[pipeOrId];
      return;
    }
    const pipeId = Object.keys(this.pipes).find(
      (key) => this.pipes[key] === pipeOrId
    );
    if (pipeId) {
      delete this.pipes[pipeId];
    }
  }

  public hasPipe(pipeId: string) {
    return pipeId in this.pipes;
  }

  public enablePipeIfExists(pipeId: string) {
    const pipe = this.pipes[pipeId];
    if (pipe) {
      pipe.clear?.();
      pipe.enabled = true;
    }
    this.debug("Enabled pipe", pipeId);
  }

  public disablePipeIfExists(pipeId: string) {
    const pipe = this.pipes[pipeId];
    this.debug("Disabling pipe", pipeId);
    if (pipe) {
      pipe.enabled = false;
    }
  }
}

const logger = new Logger();

export default logger;
