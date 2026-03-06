type LogLevel = 'info' | 'warn' | 'error';

type LogEntry = {
  level: LogLevel;
  msg: string;
  [key: string]: unknown;
};

function emit(entry: LogEntry) {
  const { level, ...rest } = entry;
  const out = { ts: new Date().toISOString(), level, ...rest };
  if (level === 'error') {
    console.error(JSON.stringify(out));
  } else if (level === 'warn') {
    console.warn(JSON.stringify(out));
  } else {
    console.log(JSON.stringify(out));
  }
}

export const log = {
  info(msg: string, data?: Record<string, unknown>) {
    emit({ level: 'info', msg, ...data });
  },
  warn(msg: string, data?: Record<string, unknown>) {
    emit({ level: 'warn', msg, ...data });
  },
  error(msg: string, err?: unknown, data?: Record<string, unknown>) {
    const errInfo = err instanceof Error
      ? { error: err.message, stack: err.stack }
      : { error: String(err) };
    emit({ level: 'error', msg, ...errInfo, ...data });
  },
};
