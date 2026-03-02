// src/chalk/is-color-supported.ts
import * as tty from "tty";
var isColorSupported = () => {
  const env = process.env || {};
  const isForceDisabled = "NO_COLOR" in env;
  if (isForceDisabled) {
    return false;
  }
  const isForced = "FORCE_COLOR" in env;
  if (isForced) {
    return true;
  }
  const isWindows = process.platform === "win32";
  const isCompatibleTerminal = tty?.isatty?.(1) && env.TERM && env.TERM !== "dumb";
  const isCI = "CI" in env && (("GITHUB_ACTIONS" in env) || ("GITLAB_CI" in env) || ("CIRCLECI" in env));
  return isWindows || isCompatibleTerminal || isCI;
};

// src/chalk/index.ts
var chalk = (() => {
  const colors = {
    enabled: () => isColorSupported(),
    visible: true,
    styles: {},
    keys: {}
  };
  const ansi = (st) => {
    const open = `\x1B[${st.codes[0]}m`;
    const close = `\x1B[${st.codes[1]}m`;
    const regex = new RegExp(`\\u001b\\[${st.codes[1]}m`, "g");
    st.wrap = (input, newline) => {
      if (input.includes(close))
        input = input.replace(regex, close + open);
      const output = open + input + close;
      return newline ? output.replace(/\r*\n/g, `${close}$&${open}`) : output;
    };
    return st;
  };
  const wrap = (sty, input, newline) => {
    return sty.wrap?.(input, newline);
  };
  const style = (input, stack) => {
    if (input === "" || input === null || input === undefined)
      return "";
    if (colors.enabled() === false)
      return input;
    if (colors.visible === false)
      return "";
    let str = String(input);
    const nl = str.includes(`
`);
    let n = stack.length;
    while (n-- > 0)
      str = wrap(colors.styles[stack[n]], str, nl);
    return str;
  };
  const define = (name, codes, type) => {
    colors.styles[name] = ansi({ name, codes });
    const keys = colors.keys[type] || (colors.keys[type] = []);
    keys.push(name);
    Reflect.defineProperty(colors, name, {
      configurable: true,
      enumerable: true,
      set(value) {
        colors.alias?.(name, value);
      },
      get() {
        const color = (input) => style(input, color.stack);
        Reflect.setPrototypeOf(color, colors);
        color.stack = this.stack ? this.stack.concat(name) : [name];
        return color;
      }
    });
  };
  define("reset", [0, 0], "modifier");
  define("bold", [1, 22], "modifier");
  define("dim", [2, 22], "modifier");
  define("italic", [3, 23], "modifier");
  define("underline", [4, 24], "modifier");
  define("inverse", [7, 27], "modifier");
  define("hidden", [8, 28], "modifier");
  define("strikethrough", [9, 29], "modifier");
  define("black", [30, 39], "color");
  define("red", [31, 39], "color");
  define("green", [32, 39], "color");
  define("yellow", [33, 39], "color");
  define("blue", [34, 39], "color");
  define("magenta", [35, 39], "color");
  define("cyan", [36, 39], "color");
  define("white", [37, 39], "color");
  define("gray", [90, 39], "color");
  define("grey", [90, 39], "color");
  define("bgBlack", [40, 49], "bg");
  define("bgRed", [41, 49], "bg");
  define("bgGreen", [42, 49], "bg");
  define("bgYellow", [43, 49], "bg");
  define("bgBlue", [44, 49], "bg");
  define("bgMagenta", [45, 49], "bg");
  define("bgWhite", [47, 49], "bg");
  define("blackBright", [90, 39], "bright");
  define("redBright", [91, 39], "bright");
  define("greenBright", [92, 39], "bright");
  define("yellowBright", [93, 39], "bright");
  define("blueBright", [94, 39], "bright");
  define("magentaBright", [95, 39], "bright");
  define("whiteBright", [97, 39], "bright");
  define("bgBlackBright", [100, 49], "bgBright");
  define("bgRedBright", [101, 49], "bgBright");
  define("bgGreenBright", [102, 49], "bgBright");
  define("bgYellowBright", [103, 49], "bgBright");
  define("bgBlueBright", [104, 49], "bgBright");
  define("bgMagentaBright", [105, 49], "bgBright");
  define("bgWhiteBright", [107, 49], "bgBright");
  colors.alias = (name, color) => {
    const fn = colors[color];
    if (typeof fn !== "function") {
      throw new TypeError("Expected alias to be the name of an existing color (string) or a function");
    }
    if (!fn.stack) {
      Reflect.defineProperty(fn, "name", { value: name });
      colors.styles[name] = fn;
      fn.stack = [name];
    }
    Reflect.defineProperty(colors, name, {
      configurable: true,
      enumerable: true,
      set(value) {
        colors.alias?.(name, value);
      },
      get() {
        const col = (input) => style(input, col.stack);
        Reflect.setPrototypeOf(col, colors);
        col.stack = this.stack ? this.stack.concat(fn.stack) : fn.stack;
        return col;
      }
    });
  };
  return colors;
})();

// src/log-level.ts
var logLevels = ["trace", "verbose", "info", "warn", "error"];
var getNumberForLogLevel = (level) => {
  return logLevels.indexOf(level);
};
var isEqualOrBelowLogLevel = (currentLevel, level) => {
  return getNumberForLogLevel(currentLevel) <= getNumberForLogLevel(level);
};

// src/repro.ts
import { VERSION } from "remotion/version";
var reproWriteInstance = null;
var getReproWriter = () => {
  if (!reproWriteInstance) {
    throw new Error("reproWriteInstance is not initialized");
  }
  return reproWriteInstance;
};
var writeInRepro = (level, ...args) => {
  if (isReproEnabled()) {
    getReproWriter().writeLine(level, ...args);
  }
};
var shouldRepro = false;
var isReproEnabled = () => shouldRepro;

// src/truthy.ts
function truthy(value) {
  return Boolean(value);
}

// src/logger.ts
var INDENT_TOKEN = chalk.gray("│");
var verboseTag = (str) => {
  return isColorSupported() ? chalk.bgBlack(` ${str} `) : `[${str}]`;
};
var Log = {
  formatLogs: (logLevel, options, args) => {
    return [
      options.indent ? INDENT_TOKEN : null,
      options.tag ? verboseTag(options.tag) : null
    ].filter(truthy).concat(args.map((a) => {
      if (logLevel === "warn") {
        return chalk.yellow(a);
      }
      if (logLevel === "error") {
        return chalk.red(a);
      }
      if (logLevel === "verbose" || logLevel === "trace") {
        return chalk.gray(a);
      }
      return a;
    }));
  },
  trace: (options, ...args) => {
    writeInRepro("trace", ...args);
    if (isEqualOrBelowLogLevel(options.logLevel, "trace")) {
      if (args.length === 0) {
        return process.stdout.write(`
`);
      }
      return console.log(...Log.formatLogs("trace", options, args));
    }
  },
  verbose: (options, ...args) => {
    writeInRepro("verbose", ...args);
    if (isEqualOrBelowLogLevel(options.logLevel, "verbose")) {
      if (args.length === 0) {
        return process.stdout.write(`
`);
      }
      return console.log(...Log.formatLogs("verbose", options, args));
    }
  },
  info: (options, ...args) => {
    writeInRepro("info", ...args);
    if (isEqualOrBelowLogLevel(options.logLevel, "info")) {
      if (args.length === 0) {
        return process.stdout.write(`
`);
      }
      return console.log(...Log.formatLogs("info", options, args));
    }
  },
  warn: (options, ...args) => {
    writeInRepro("warn", ...args);
    if (isEqualOrBelowLogLevel(options.logLevel, "warn")) {
      if (args.length === 0) {
        return process.stdout.write(`
`);
      }
      return console.warn(...Log.formatLogs("warn", options, args));
    }
  },
  error: (options, ...args) => {
    writeInRepro("error", ...args);
    if (isEqualOrBelowLogLevel(options.logLevel, "error")) {
      if (args.length === 0) {
        return process.stdout.write(`
`);
      }
      return console.error(...Log.formatLogs("error", options, args));
    }
  }
};

// src/print-useful-error-message.ts
var alreadyPrintedCache = [];
var printUsefulErrorMessage = (err, logLevel, indent) => {
  const errorStack = err.stack;
  if (errorStack && alreadyPrintedCache.includes(errorStack)) {
    return;
  }
  if (errorStack) {
    alreadyPrintedCache.push(errorStack);
    alreadyPrintedCache = alreadyPrintedCache.slice(-10);
  }
  if (err.message.includes("Could not play video with")) {
    Log.info({ indent, logLevel });
    Log.info({ indent, logLevel }, "\uD83D\uDCA1 Get help for this issue at https://remotion.dev/docs/media-playback-error");
  }
  if (err.message.includes("A delayRender()") && err.message.includes("was called but not cleared after")) {
    Log.info({ indent, logLevel });
    if (err.message.includes("/proxy")) {
      Log.info({ indent, logLevel }, "\uD83D\uDCA1 Get help for this issue at https://remotion.dev/docs/troubleshooting/delay-render-proxy");
    }
    Log.info({ indent, logLevel }, "\uD83D\uDCA1 Get help for this issue at https://remotion.dev/docs/timeout");
  }
  if (err.message.includes("Target closed")) {
    Log.info({ indent, logLevel });
    Log.info({ indent, logLevel }, "\uD83D\uDCA1 Get help for this issue at https://remotion.dev/docs/target-closed");
  }
  if (err.message.includes("Timed out evaluating")) {
    Log.info({ indent, logLevel });
    Log.info({ indent, logLevel }, "\uD83D\uDCA1 Get help for this issue at https://remotion.dev/docs/troubleshooting/timed-out-page-function");
  }
  if (err.message.includes("ENAMETOOLONG")) {
    Log.info({ indent, logLevel });
    Log.info({ indent, logLevel }, "\uD83D\uDCA1 Get help for this issue at https://remotion.dev/docs/enametoolong");
  }
  if (err.message.includes("Member must have value less than or equal to 3008")) {
    Log.warn({ indent, logLevel });
    Log.warn({ indent, logLevel }, "\uD83D\uDCA1 This error indicates that you have a AWS account on the free or basic tier or have been limited by your organization.");
    Log.warn({ indent, logLevel }, "Often times this can be solved by adding a credit card, or if already done, by contacting AWS support.");
    Log.warn({
      indent,
      logLevel
    }, "Alternatively, you can decrease the memory size of your Lambda function to a value below 3008 MB. See: https://www.remotion.dev/docs/lambda/runtime#core-count--vcpus");
    Log.warn({ indent, logLevel }, "See also: https://repost.aws/questions/QUKruWYNDYTSmP17jCnIz6IQ/questions/QUKruWYNDYTSmP17jCnIz6IQ/unable-to-set-lambda-memory-over-3008mb");
  }
  if (err.stack?.includes("TooManyRequestsException: Rate Exceeded.") || err.message?.includes("ConcurrentInvocationLimitExceeded")) {
    Log.info({ indent, logLevel });
    Log.info({ indent, logLevel }, "\uD83D\uDCA1 This error indicates that your Lambda concurrency limit is too low. See: https://www.remotion.dev/docs/lambda/troubleshooting/rate-limit");
  }
  if (err.message.includes("Error creating WebGL context")) {
    Log.info({ indent, logLevel });
    Log.warn({
      indent,
      logLevel
    }, '\uD83D\uDCA1 You might need to set the OpenGL renderer to "angle". Learn why at https://www.remotion.dev/docs/three');
    Log.warn({
      indent,
      logLevel
    }, "\uD83D\uDCA1 Check how it's done at https://www.remotion.dev/docs/chromium-flags#--gl");
  }
  if (err.message.includes("The bucket does not allow ACLs")) {
    Log.info({ indent, logLevel });
    Log.info({ indent, logLevel }, "\uD83D\uDCA1 Fix for this issue: https://remotion.dev/docs/lambda/troubleshooting/bucket-disallows-acl");
  }
  if (err.message.includes("Minified React error #306")) {
    const componentName = err.message.match(/<\w+>/)?.[0];
    Log.info({ indent, logLevel }, [
      "\uD83D\uDCA1 This error indicates that the component",
      componentName ? `(${componentName})` : null,
      "you are trying to render is not imported correctly."
    ].filter(truthy).join(" "));
    Log.info({ indent, logLevel });
    Log.info({ indent, logLevel }, "   Check the root file and ensure that the component is not undefined.");
    Log.info({ indent, logLevel }, "   Oftentimes, this happens if the component is missing the `export` keyword");
    Log.info({ indent, logLevel }, "   or if the component was renamed and the import statement not properly adjusted.");
  }
  if (err.message.includes("GLIBC_")) {
    Log.info({ indent, logLevel }, "\uD83D\uDCA1 Remotion requires at least Libc 2.35.");
    Log.info({ indent, logLevel }, "\uD83D\uDCA1 Get help for this issue: https://github.com/remotion-dev/remotion/issues/2439");
  }
  if (err.message.includes("EBADF")) {
    Log.info({ indent, logLevel }, "\uD83D\uDCA1 This error might be fixed by changing your Node version:");
    Log.info({ indent, logLevel }, "   https://github.com/remotion-dev/remotion/issues/2452");
  }
  if (err.message.includes("routines::unsupported")) {
    Log.info({ indent, logLevel }, "\uD83D\uDCA1 This error might happen if using Cloud Run with credentials that have a newline at the end or are otherwise badly encoded.");
    Log.info({ indent, logLevel }, "   https://github.com/remotion-dev/remotion/issues/3864");
  }
  if (err.message.includes("Failed to fetch")) {
    Log.info({ indent, logLevel }, "\uD83D\uDCA1 On Lambda, one reason this could happen is that Chrome is rejecting an asset to be loaded when it is running low on disk space.");
    Log.info({ indent, logLevel }, "Try increasing the disk size of your Lambda function.");
  }
  if (err.message.includes("Invalid value specified for cpu")) {
    Log.info({ indent, logLevel });
    Log.info({ indent, logLevel }, "\uD83D\uDCA1 This error indicates that your GCP account does have a limit. Try setting `--maxInstances=5` / `maxInstances: 5` when deploying this service.");
    Log.info({
      indent,
      logLevel
    });
  }
};

// src/wrap-with-error-handling.ts
var wrapWithErrorHandling = (fn) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (err) {
      const { indent } = args[0];
      const { logLevel } = args[0];
      printUsefulErrorMessage(err, logLevel, indent);
      throw err;
    }
  };
};
export {
  wrapWithErrorHandling
};
