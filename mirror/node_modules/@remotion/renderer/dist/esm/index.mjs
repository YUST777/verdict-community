import { createRequire } from "node:module";
var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => all[name] = () => newValue
    });
};
var __require = /* @__PURE__ */ createRequire(import.meta.url);

// src/index.ts
import execa2 from "execa";

// src/assets/download-file.ts
import { createWriteStream } from "node:fs";

// src/ensure-output-directory.ts
import fs from "node:fs";
import path from "node:path";
var ensureOutputDirectory = (outputLocation) => {
  const dirName = path.dirname(outputLocation);
  if (!fs.existsSync(dirName)) {
    fs.mkdirSync(dirName, {
      recursive: true
    });
  }
};

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
var isValidLogLevel = (level) => {
  return getNumberForLogLevel(level) > -1;
};
var isEqualOrBelowLogLevel = (currentLevel, level) => {
  return getNumberForLogLevel(currentLevel) <= getNumberForLogLevel(level);
};

// src/repro.ts
import { execSync } from "node:child_process";
import fs3, { rmSync } from "node:fs";
import os from "node:os";
import path3 from "node:path";
import { VERSION } from "remotion/version";

// src/find-closest-package-json.ts
import fs2 from "node:fs";
import path2 from "node:path";
var recursionLimit = 5;
var findClosestPackageJson = () => {
  let currentDir = process.cwd();
  let possiblePackageJson = "";
  for (let i = 0;i < recursionLimit; i++) {
    possiblePackageJson = path2.join(currentDir, "package.json");
    const exists = fs2.existsSync(possiblePackageJson);
    if (exists) {
      return possiblePackageJson;
    }
    currentDir = path2.dirname(currentDir);
  }
  return null;
};
var findRemotionRoot = () => {
  const closestPackageJson = findClosestPackageJson();
  if (closestPackageJson === null) {
    return process.cwd();
  }
  return path2.dirname(closestPackageJson);
};

// src/is-serve-url.ts
var isServeUrl = (potentialUrl) => {
  if (typeof potentialUrl === "undefined") {
    throw new Error("serveUrl is undefined");
  }
  if (potentialUrl.startsWith("www.") || potentialUrl.includes("amazonaws.com")) {
    return true;
  }
  return potentialUrl.startsWith("https://") || potentialUrl.startsWith("http://");
};

// src/repro.ts
var REPRO_DIR = ".remotionrepro";
var LOG_FILE_NAME = "logs.txt";
var INPUT_DIR = "bundle";
var OUTPUT_DIR = "output";
var LINE_SPLIT = `
`;
var getZipFileName = (name) => `remotion-repro-${name}-${Date.now()}.zip`;
var readyDirSync = (dir) => {
  let items;
  try {
    items = fs3.readdirSync(dir);
  } catch {
    return fs3.mkdirSync(dir, { recursive: true });
  }
  items.forEach((item) => {
    item = path3.join(dir, item);
    fs3.rmSync(item, { recursive: true, force: true });
  });
};
var zipFolder = ({
  sourceFolder,
  targetZip,
  indent,
  logLevel
}) => {
  const platform = os.platform();
  try {
    Log.info({ indent, logLevel }, "+ Creating reproduction ZIP");
    if (platform === "win32") {
      execSync(`powershell.exe Compress-Archive -Path "${sourceFolder}" -DestinationPath "${targetZip}"`);
    } else {
      execSync(`zip -r "${targetZip}" "${sourceFolder}"`);
    }
    rmSync(sourceFolder, { recursive: true });
    Log.info({ indent, logLevel }, `${chalk.blue(`+ Repro: ${targetZip}`)}`);
  } catch (error) {
    Log.error({ indent, logLevel }, `Failed to zip repro folder, The repro folder is ${sourceFolder}. You can try manually zip it.`);
    Log.error({ indent, logLevel }, error);
  }
};
var reproWriter = (name) => {
  const root = findRemotionRoot();
  const reproFolder = path3.join(root, REPRO_DIR);
  const logPath = path3.join(reproFolder, LOG_FILE_NAME);
  const zipFile = path3.join(root, getZipFileName(name));
  readyDirSync(reproFolder);
  const reproLogWriteStream = fs3.createWriteStream(logPath, { flags: "a" });
  const serializeArgs = (args) => JSON.stringify(args);
  const writeLine = (level, ...args) => {
    if (!args.length)
      return;
    const startTime = new Date().toISOString();
    const line = `[${startTime}] ${level} ${serializeArgs(args)}`;
    reproLogWriteStream.write(line + LINE_SPLIT);
  };
  const start = ({
    serveUrl,
    serializedInputPropsWithCustomSchema,
    serializedResolvedPropsWithCustomSchema
  }) => {
    const isServe = isServeUrl(serveUrl);
    if (!isServe) {
      const inputDir = path3.resolve(reproFolder, INPUT_DIR);
      readyDirSync(inputDir);
      fs3.cpSync(serveUrl, inputDir, { recursive: true });
    }
    const serializedProps = path3.resolve(reproFolder, "input-props.json");
    fs3.writeFileSync(serializedProps, serializedInputPropsWithCustomSchema);
    const serializedResolvedProps = path3.resolve(reproFolder, "resolved-props.json");
    fs3.writeFileSync(serializedResolvedProps, serializedResolvedPropsWithCustomSchema);
    writeLine("info", [`Args: ${JSON.stringify(process.argv)}`]);
    writeLine("info", [`Node/Bun version: ${process.version}`]);
    writeLine("info", [`OS: ${process.platform}-${process.arch}`]);
    writeLine("info", [`Serve URL: ${serveUrl}`]);
    writeLine("info", [`Remotion version: ${VERSION}`]);
  };
  const onRenderSucceed = ({
    indent,
    logLevel,
    output
  }) => {
    return new Promise((resolve, reject) => {
      try {
        if (output) {
          const outputDir = path3.resolve(reproFolder, OUTPUT_DIR);
          readyDirSync(outputDir);
          const fileName = path3.basename(output);
          const targetPath = path3.join(outputDir, fileName);
          fs3.copyFileSync(output, targetPath);
        }
        disableRepro();
        reproLogWriteStream.end(() => {
          reproLogWriteStream.close(() => {
            zipFolder({
              sourceFolder: reproFolder,
              targetZip: zipFile,
              indent,
              logLevel
            });
            resolve();
          });
        });
      } catch (error) {
        Log.error({ indent: false, logLevel }, `repro render success error:`);
        Log.error({ indent: false, logLevel }, error);
        reject(error);
      }
    });
  };
  return {
    start,
    writeLine,
    onRenderSucceed
  };
};
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
var enableRepro = ({
  serveUrl,
  compositionName,
  serializedInputPropsWithCustomSchema,
  serializedResolvedPropsWithCustomSchema
}) => {
  shouldRepro = true;
  reproWriteInstance = reproWriter(compositionName);
  getReproWriter().start({
    serveUrl,
    serializedInputPropsWithCustomSchema,
    serializedResolvedPropsWithCustomSchema
  });
};
var disableRepro = () => {
  shouldRepro = false;
};
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

// src/assets/read-file.ts
import https from "https";
import http from "node:http";

// src/redirect-status-codes.ts
var redirectStatusCodes = [301, 302, 303, 307, 308];

// src/assets/read-file.ts
var getClient = (url) => {
  if (url.startsWith("https://")) {
    return https.get;
  }
  if (url.startsWith("http://")) {
    return http.get;
  }
  throw new Error(`Can only download URLs starting with http:// or https://, got "${url}"`);
};
var readFileWithoutRedirect = (url) => {
  return new Promise((resolve, reject) => {
    const client = getClient(url);
    const req = client(url, typeof Bun === "undefined" ? {
      headers: {
        "user-agent": "Mozilla/5.0 (@remotion/renderer - https://remotion.dev)"
      }
    } : {}, (res) => {
      resolve({ request: req, response: res });
    });
    req.on("error", (err) => {
      req.destroy();
      return reject(err);
    });
  });
};
var readFile = async (url, redirectsSoFar = 0) => {
  if (redirectsSoFar > 10) {
    throw new Error(`Too many redirects while downloading ${url}`);
  }
  const { request, response } = await readFileWithoutRedirect(url);
  if (redirectStatusCodes.includes(response.statusCode)) {
    if (!response.headers.location) {
      throw new Error(`Received a status code ${response.statusCode} but no "Location" header while calling ${response.headers.location}`);
    }
    const { origin } = new URL(url);
    const redirectUrl = new URL(response.headers.location, origin).toString();
    request.destroy();
    response.destroy();
    return readFile(redirectUrl, redirectsSoFar + 1);
  }
  if (response.statusCode >= 400) {
    const body = await tryToObtainBody(response);
    request.destroy();
    response.destroy();
    throw new Error([
      `Received a status code of ${response.statusCode} while downloading file ${url}.`,
      body ? `The response body was:` : null,
      body ? `---` : null,
      body ? body : null,
      body ? `---` : null
    ].filter(truthy).join(`
`));
  }
  return { request, response };
};
var tryToObtainBody = async (file) => {
  const success = new Promise((resolve) => {
    let data = "";
    file.on("data", (chunk) => {
      data += chunk;
    });
    file.on("end", () => {
      resolve(data);
    });
    file.on("error", () => resolve(data));
  });
  let timeout = null;
  const body = await Promise.race([
    success,
    new Promise((resolve) => {
      timeout = setTimeout(() => {
        resolve(null);
      }, 5000);
    })
  ]);
  if (timeout) {
    clearTimeout(timeout);
  }
  return body;
};

// src/assets/download-file.ts
var CANCELLED_ERROR = "cancelled";
var incorrectContentLengthToken = "Download finished with";
var noDataSentToken = "but the server sent no data for";
var downloadFileWithoutRetries = ({
  onProgress,
  url,
  to: toFn,
  abortSignal
}) => {
  return new Promise((resolve, reject) => {
    let rejected = false;
    let resolved = false;
    let timeout;
    const resolveAndFlag = (val) => {
      abortSignal.removeEventListener("abort", onAbort);
      resolved = true;
      resolve(val);
      if (timeout) {
        clearTimeout(timeout);
      }
    };
    const rejectAndFlag = (err) => {
      abortSignal.removeEventListener("abort", onAbort);
      if (timeout) {
        clearTimeout(timeout);
      }
      reject(err);
      rejected = true;
    };
    const refreshTimeout = () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => {
        if (resolved) {
          return;
        }
        rejectAndFlag(new Error(`Tried to download file ${url}, ${noDataSentToken} 20 seconds`));
      }, 20000);
    };
    refreshTimeout();
    let finishEventSent = false;
    let closeConnection = () => {
      return;
    };
    const onAbort = () => {
      rejectAndFlag(new Error(CANCELLED_ERROR));
      closeConnection();
    };
    abortSignal.addEventListener("abort", onAbort);
    readFile(url).then(({ response, request }) => {
      closeConnection = () => {
        request.destroy();
        response.destroy();
      };
      if (abortSignal.aborted) {
        onAbort();
        return;
      }
      const contentDisposition = response.headers["content-disposition"] ?? null;
      const contentType = response.headers["content-type"] ?? null;
      const to = toFn(contentDisposition, contentType);
      ensureOutputDirectory(to);
      const sizeHeader = response.headers["content-length"];
      const totalSize = typeof sizeHeader === "undefined" ? null : Number(sizeHeader);
      const writeStream = createWriteStream(to);
      let downloaded = 0;
      writeStream.on("close", () => {
        if (rejected) {
          return;
        }
        if (!finishEventSent) {
          onProgress?.({
            downloaded,
            percent: 1,
            totalSize: downloaded
          });
        }
        refreshTimeout();
        return resolveAndFlag({ sizeInBytes: downloaded, to });
      });
      writeStream.on("error", (err) => rejectAndFlag(err));
      response.on("error", (err) => {
        closeConnection();
        rejectAndFlag(err);
      });
      response.pipe(writeStream).on("error", (err) => rejectAndFlag(err));
      response.on("data", (d) => {
        refreshTimeout();
        downloaded += d.length;
        refreshTimeout();
        const percent = totalSize === null ? null : downloaded / totalSize;
        onProgress?.({
          downloaded,
          percent,
          totalSize
        });
        if (percent === 1) {
          finishEventSent = true;
        }
      });
      response.on("close", () => {
        if (totalSize !== null && downloaded !== totalSize) {
          rejectAndFlag(new Error(`${incorrectContentLengthToken} ${downloaded} bytes, but expected ${totalSize} bytes from 'Content-Length'.`));
        }
        writeStream.close();
        closeConnection();
      });
    }).catch((err) => {
      rejectAndFlag(err);
    });
  });
};
var downloadFile = async (options, retries = 2, attempt = 1) => {
  try {
    const res = await downloadFileWithoutRetries(options);
    return res;
  } catch (err) {
    const { message } = err;
    if (message === CANCELLED_ERROR) {
      throw err;
    }
    if (message === "aborted" || message.includes("ECONNRESET") || message.includes(incorrectContentLengthToken) || message.includes(noDataSentToken) || message.includes("503") || message.includes("502") || message.includes("504") || message.includes("500")) {
      if (retries === 0) {
        throw err;
      }
      Log.warn({ indent: options.indent, logLevel: options.logLevel }, `Downloading ${options.url} failed (will retry): ${message}`);
      const backoffInSeconds = (attempt + 1) ** 2;
      await new Promise((resolve) => {
        setTimeout(() => resolve(), backoffInSeconds * 1000);
      });
      return downloadFile(options, retries - 1, attempt + 1);
    }
    throw err;
  }
};

// src/browser.ts
var DEFAULT_BROWSER = "chrome";

// src/browser/assert.ts
var assert = (value, message) => {
  if (!value) {
    throw new Error(message);
  }
};

// src/browser/BrowserPage.ts
import { NoReactInternals as NoReactInternals2 } from "remotion/no-react";

// src/format-logs.ts
import { NoReactInternals } from "remotion/no-react";
var formatRemoteObject = (remoteObject) => {
  if (remoteObject.preview) {
    return formatObjectPreview(remoteObject.preview);
  }
  if (remoteObject.type === "string") {
    const isDelayRenderClear = remoteObject.value.includes(NoReactInternals.DELAY_RENDER_CLEAR_TOKEN);
    if (isDelayRenderClear) {
      return chalk.gray(`${remoteObject.value}`);
    }
    return `${remoteObject.value}`;
  }
  if (remoteObject.type === "number") {
    return chalk.yellow(`${remoteObject.value}`);
  }
  if (remoteObject.type === "bigint") {
    return chalk.yellow(`${remoteObject.description}`);
  }
  if (remoteObject.type === "boolean") {
    return chalk.yellow(`${remoteObject.value}`);
  }
  if (remoteObject.type === "function") {
    return chalk.cyan(String(remoteObject.description));
  }
  if (remoteObject.type === "object") {
    if (remoteObject.subtype === "null") {
      return `null`;
    }
    return chalk.reset(`Object`);
  }
  if (remoteObject.type === "symbol") {
    return chalk.green(`${remoteObject.description}`);
  }
  if (remoteObject.type === "undefined") {
    return chalk.gray(`undefined`);
  }
  throw new Error("unhandled remote object");
};
var formatObjectPreview = (preview) => {
  if (typeof preview === "undefined") {
    return "";
  }
  if (preview.type === "object") {
    if (preview.subtype === "date") {
      return chalk.reset(`Date { ${chalk.magenta(String(preview.description))} }`);
    }
    const properties = preview.properties.map((property) => {
      return chalk.reset(`${property.name}: ${formatProperty(property)}`);
    });
    if (preview.subtype === "array") {
      if (preview.overflow) {
        return chalk.reset(`[ ${preview.properties.map((p) => formatProperty(p)).join(", ")}, …]`);
      }
      return chalk.reset(`[ ${preview.properties.map((p) => formatProperty(p)).join(", ")} ]`);
    }
    if (preview.subtype === "arraybuffer") {
      return chalk.reset(String(preview.description));
    }
    if (preview.subtype === "dataview") {
      return chalk.reset(String(preview.description));
    }
    if (preview.subtype === "generator") {
      return chalk.reset(String(preview.description));
    }
    if (preview.subtype === "iterator") {
      return chalk.reset(String(preview.description));
    }
    if (preview.subtype === "map") {
      return chalk.reset(String(preview.description));
    }
    if (preview.subtype === "node") {
      return chalk.magenta(`<${preview.description}>`);
    }
    if (preview.subtype === "null") {
      return chalk.white(String(preview.description));
    }
    if (preview.subtype === "promise") {
      return chalk.reset(String(preview.description));
    }
    if (preview.subtype === "proxy") {
      return chalk.reset(String(preview.description));
    }
    if (preview.subtype === "regexp") {
      return chalk.red(String(preview.description));
    }
    if (preview.subtype === "set") {
      return chalk.reset(String(preview.description));
    }
    if (preview.subtype === "typedarray") {
      return chalk.reset(String(preview.description));
    }
    if (preview.subtype === "error") {
      return chalk.reset(String(preview.description));
    }
    if (preview.subtype === "wasmvalue") {
      return chalk.reset(String(preview.description));
    }
    if (preview.subtype === "weakmap") {
      return chalk.reset(String(preview.description));
    }
    if (preview.subtype === "weakset") {
      return chalk.reset(String(preview.description));
    }
    if (preview.subtype === "webassemblymemory") {
      return chalk.reset(String(preview.description));
    }
    if (properties.length === 0) {
      return chalk.reset("{}");
    }
    if (preview.overflow) {
      return chalk.reset(`{ ${properties.join(", ")}, …}`);
    }
    return chalk.reset(`{ ${properties.join(", ")} }`);
  }
  return "";
};
var formatProperty = (property) => {
  if (property.type === "string") {
    return chalk.green(`"${property.value}"`);
  }
  if (property.type === "object") {
    if (!property.subtype && property.value === "Object") {
      return chalk.reset(`{…}`);
    }
    if (property.subtype === "date") {
      return chalk.reset(`Date { ${chalk.magenta(String(property.value))} }`);
    }
    if (property.subtype === "arraybuffer") {
      return chalk.reset(`${property.value}`);
    }
    if (property.subtype === "array") {
      return chalk.reset(`${property.value}`);
    }
    if (property.subtype === "dataview") {
      return chalk.reset(`${property.value}`);
    }
    if (property.subtype === "error") {
      return chalk.reset(`${property.value}`);
    }
    if (property.subtype === "generator") {
      return chalk.reset(`[generator ${property.value}]`);
    }
    if (property.subtype === "iterator") {
      return chalk.reset(`${property.value}`);
    }
    if (property.subtype === "map") {
      return chalk.reset(`${property.value}`);
    }
    if (property.subtype === "node") {
      return chalk.reset(`${property.value}`);
    }
    if (property.subtype === "null") {
      return chalk.white(`${property.value}`);
    }
    if (property.subtype === "promise") {
      return chalk.reset(`${property.value}`);
    }
    if (property.subtype === "proxy") {
      return chalk.reset(`${property.value}`);
    }
    if (property.subtype === "regexp") {
      return chalk.reset(`${property.value}`);
    }
    if (property.subtype === "set") {
      return chalk.reset(`${property.value}`);
    }
    if (property.subtype === "typedarray") {
      return chalk.reset(`${property.value}`);
    }
    if (property.subtype === "wasmvalue") {
      return chalk.reset(`${property.value}`);
    }
    if (property.subtype === "webassemblymemory") {
      return chalk.reset(`${property.value}`);
    }
    if (property.subtype === "weakmap") {
      return chalk.reset(`${property.value}`);
    }
    if (property.subtype === "weakset") {
      return chalk.reset(`${property.value}`);
    }
    return chalk.reset(`${property.value}`);
  }
  if (property.type === "accessor") {
    return chalk.gray(`get()`);
  }
  if (property.type === "bigint") {
    return chalk.yellow(`${property.value}`);
  }
  if (property.type === "boolean") {
    return chalk.yellow(`${property.value}`);
  }
  if (property.type === "function") {
    return chalk.cyan(`Function`);
  }
  if (property.type === "number") {
    return chalk.yellow(`${property.value}`);
  }
  if (property.type === "symbol") {
    return chalk.green(`${property.value}`);
  }
  if (property.type === "undefined") {
    return chalk.gray(`undefined`);
  }
  throw new Error("unexpected property type " + JSON.stringify(property));
};

// src/browser/ConsoleMessage.ts
class ConsoleMessage {
  type;
  text;
  args;
  previewString;
  #stackTraceLocations;
  logLevel;
  tag;
  constructor({
    type,
    text,
    args,
    stackTraceLocations,
    previewString,
    logLevel,
    tag
  }) {
    this.type = type;
    this.text = text;
    this.args = args;
    this.previewString = previewString;
    this.#stackTraceLocations = stackTraceLocations;
    this.logLevel = logLevel;
    this.tag = tag;
  }
  stackTrace() {
    return this.#stackTraceLocations;
  }
}

// src/browser/mitt/index.ts
function mitt(all) {
  all = all || new Map;
  return {
    all,
    on: (type, handler) => {
      const handlers = all?.get(type);
      const added = handlers?.push(handler);
      if (!added) {
        all?.set(type, [handler]);
      }
    },
    off: (type, handler) => {
      const handlers = all?.get(type);
      if (handlers) {
        handlers.splice(handlers.indexOf(handler) >>> 0, 1);
      }
    },
    emit: (type, evt) => {
      (all?.get(type) || []).slice().forEach((handler) => {
        handler(evt);
      });
      (all?.get("*") || []).slice().forEach((handler) => {
        handler(type, evt);
      });
    }
  };
}

// src/browser/EventEmitter.ts
class EventEmitter {
  emitter;
  eventsMap = new Map;
  constructor() {
    this.emitter = mitt(this.eventsMap);
  }
  on(event, handler) {
    this.emitter.on(event, handler);
    return this;
  }
  off(event, handler) {
    this.emitter.off(event, handler);
    return this;
  }
  addListener(event, handler) {
    this.on(event, handler);
    return this;
  }
  emit(event, eventData) {
    this.emitter.emit(event, eventData);
    return this.eventListenersCount(event) > 0;
  }
  once(event, handler) {
    const onceHandler = (eventData) => {
      handler(eventData);
      this.off(event, onceHandler);
    };
    return this.on(event, onceHandler);
  }
  listenerCount(event) {
    return this.eventListenersCount(event);
  }
  removeAllListeners(event) {
    if (event) {
      this.eventsMap.delete(event);
    } else {
      this.eventsMap.clear();
    }
    return this;
  }
  eventListenersCount(event) {
    return this.eventsMap.get(event)?.length || 0;
  }
}

// src/browser/Errors.ts
class CustomError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class TimeoutError extends CustomError {
}

class ProtocolError extends CustomError {
  code;
  originalMessage = "";
}

// src/browser/Connection.ts
var ConnectionEmittedEvents = {
  Disconnected: Symbol("Connection.Disconnected")
};

class Connection extends EventEmitter {
  transport;
  #lastId = 0;
  #sessions = new Map;
  #closed = false;
  #callbacks = new Map;
  constructor(transport) {
    super();
    this.transport = transport;
    this.transport.onmessage = this.#onMessage.bind(this);
    this.transport.onclose = this.#onClose.bind(this);
  }
  static fromSession(session) {
    return session.connection();
  }
  session(sessionId) {
    return this.#sessions.get(sessionId) || null;
  }
  send(method, ...paramArgs) {
    const params = paramArgs.length ? paramArgs[0] : undefined;
    const id = this._rawSend({ method, params });
    return new Promise((resolve, reject) => {
      this.#callbacks.set(id, {
        resolve,
        reject,
        method,
        returnSize: true,
        stack: new Error().stack ?? "",
        fn: method + JSON.stringify(params)
      });
    });
  }
  _rawSend(message) {
    const id = ++this.#lastId;
    const stringifiedMessage = JSON.stringify({ ...message, id });
    this.transport.send(stringifiedMessage);
    return id;
  }
  #onMessage(message) {
    const object = JSON.parse(message);
    if (object.method === "Target.attachedToTarget") {
      const { sessionId } = object.params;
      const session = new CDPSession(this, object.params.targetInfo.type, sessionId);
      this.#sessions.set(sessionId, session);
      this.emit("sessionattached", session);
      const parentSession = this.#sessions.get(object.sessionId);
      if (parentSession) {
        parentSession.emit("sessionattached", session);
      }
    } else if (object.method === "Target.detachedFromTarget") {
      const session = this.#sessions.get(object.params.sessionId);
      if (session) {
        session._onClosed();
        this.#sessions.delete(object.params.sessionId);
        this.emit("sessiondetached", session);
        const parentSession = this.#sessions.get(object.sessionId);
        if (parentSession) {
          parentSession.emit("sessiondetached", session);
        }
      }
    }
    if (object.sessionId) {
      const session = this.#sessions.get(object.sessionId);
      if (session) {
        session._onMessage(object, message.length);
      }
    } else if (object.id) {
      const callback = this.#callbacks.get(object.id);
      if (callback) {
        this.#callbacks.delete(object.id);
        if (object.error) {
          callback.reject(createProtocolError(callback.method, object));
        } else if (callback.returnSize) {
          callback.resolve({ value: object.result, size: message.length });
        } else {
          callback.resolve(object.result);
        }
      }
    } else {
      this.emit(object.method, object.params);
    }
  }
  #onClose() {
    if (this.#closed) {
      return;
    }
    this.transport.onmessage = undefined;
    this.transport.onclose = undefined;
    for (const callback of this.#callbacks.values()) {
      callback.reject(rewriteError(new ProtocolError, `Protocol error (${callback.method}): Target closed. https://www.remotion.dev/docs/target-closed`));
    }
    this.#callbacks.clear();
    for (const session of this.#sessions.values()) {
      session._onClosed();
    }
    this.#sessions.clear();
    this.emit(ConnectionEmittedEvents.Disconnected);
  }
  dispose() {
    this.#onClose();
    this.transport.close();
  }
  async createSession(targetInfo) {
    const {
      value: { sessionId }
    } = await this.send("Target.attachToTarget", {
      targetId: targetInfo.targetId,
      flatten: true
    });
    const session = this.#sessions.get(sessionId);
    if (!session) {
      throw new Error("CDPSession creation failed.");
    }
    return session;
  }
}
var CDPSessionEmittedEvents = {
  Disconnected: Symbol("CDPSession.Disconnected")
};

class CDPSession extends EventEmitter {
  #sessionId;
  #targetType;
  #callbacks = new Map;
  #connection;
  constructor(connection, targetType, sessionId) {
    super();
    this.#connection = connection;
    this.#targetType = targetType;
    this.#sessionId = sessionId;
  }
  connection() {
    return this.#connection;
  }
  send(method, ...paramArgs) {
    if (!this.#connection) {
      return Promise.reject(new Error(`Protocol error (${method}): Session closed. Most likely the ${this.#targetType} has been closed.`));
    }
    const params = paramArgs.length ? paramArgs[0] : undefined;
    const id = this.#connection._rawSend({
      sessionId: this.#sessionId,
      method,
      params
    });
    return new Promise((resolve, reject) => {
      if (this.#callbacks.size > 100) {
        for (const callback of this.#callbacks.values()) {
          Log.info({ indent: false, logLevel: "info" }, callback.fn);
        }
        throw new Error("Leak detected: Too many callbacks");
      }
      this.#callbacks.set(id, {
        resolve,
        reject,
        method,
        returnSize: true,
        stack: new Error().stack ?? "",
        fn: method + JSON.stringify(params)
      });
    });
  }
  _onMessage(object, size) {
    const callback = object.id ? this.#callbacks.get(object.id) : undefined;
    if (object.id && callback) {
      this.#callbacks.delete(object.id);
      if (object.error) {
        callback.reject(createProtocolError(callback.method, object));
      } else if (callback.returnSize) {
        callback.resolve({ value: object.result, size });
      } else {
        callback.resolve(object.result);
      }
    } else {
      this.emit(object.method, object.params);
    }
  }
  _onClosed() {
    this.#connection = undefined;
    for (const callback of this.#callbacks.values()) {
      callback.reject(rewriteError(new ProtocolError, `Protocol error (${callback.method}): Target closed. https://www.remotion.dev/docs/target-closed`));
    }
    this.#callbacks.clear();
    this.emit(CDPSessionEmittedEvents.Disconnected);
  }
  id() {
    return this.#sessionId;
  }
}
function createProtocolError(method, object) {
  let message = `Protocol error (${method}): ${object.error.message}`;
  if ("data" in object.error) {
    message += ` ${object.error.data}`;
  }
  return rewriteError(new ProtocolError, message, object.error.message);
}
function rewriteError(error, message, originalMessage) {
  error.message = message;
  error.originalMessage = originalMessage ?? error.originalMessage;
  return error;
}

// src/browser/util.ts
function getExceptionMessage(exceptionDetails) {
  if (exceptionDetails.exception) {
    return exceptionDetails.exception.description || exceptionDetails.exception.value;
  }
  let message = exceptionDetails.text;
  if (exceptionDetails.stackTrace) {
    for (const callframe of exceptionDetails.stackTrace.callFrames) {
      const location = callframe.url + ":" + callframe.lineNumber + ":" + callframe.columnNumber;
      const functionName = callframe.functionName || "<anonymous>";
      message += `
    at ${functionName} (${location})`;
    }
  }
  return message;
}
function valueFromRemoteObject(remoteObject) {
  assert(!remoteObject.objectId, "Cannot extract value when objectId is given");
  if (remoteObject.unserializableValue) {
    if (remoteObject.type === "bigint" && typeof BigInt !== "undefined") {
      return BigInt(remoteObject.unserializableValue.replace("n", ""));
    }
    switch (remoteObject.unserializableValue) {
      case "-0":
        return -0;
      case "NaN":
        return NaN;
      case "Infinity":
        return Infinity;
      case "-Infinity":
        return -Infinity;
      default:
        throw new Error("Unsupported unserializable value: " + remoteObject.unserializableValue);
    }
  }
  return remoteObject.value;
}
async function releaseObject(client, remoteObject) {
  if (!remoteObject.objectId) {
    return;
  }
  await client.send("Runtime.releaseObject", { objectId: remoteObject.objectId }).catch(() => {});
}
function addEventListener(emitter, eventName, handler) {
  emitter.on(eventName, handler);
  return () => emitter.off(eventName, handler);
}
function removeEventListeners(listeners) {
  for (const listener of listeners) {
    listener();
  }
  listeners.length = 0;
}
var isString = (obj) => {
  return typeof obj === "string" || obj instanceof String;
};
function evaluationString(fun, ...args) {
  if (isString(fun)) {
    assert(args.length === 0, "Cannot evaluate a string with arguments");
    return fun;
  }
  function serializeArgument(arg) {
    if (Object.is(arg, undefined)) {
      return "undefined";
    }
    return JSON.stringify(arg);
  }
  return `(${fun})(${args.map(serializeArgument).join(",")})`;
}
function pageBindingDeliverResultString(name, seq, result) {
  function deliverResult(_name, _seq, _result) {
    window[_name].callbacks.get(_seq).resolve(_result);
    window[_name].callbacks.delete(_seq);
  }
  return evaluationString(deliverResult, name, seq, result);
}
function pageBindingDeliverErrorString(name, seq, message, stack) {
  function deliverError(_name, _seq, _message, _stack) {
    const error = new Error(_message);
    error.stack = _stack;
    window[_name].callbacks.get(_seq).reject(error);
    window[_name].callbacks.delete(_seq);
  }
  return evaluationString(deliverError, name, seq, message, stack);
}
function pageBindingDeliverErrorValueString(name, seq, value) {
  function deliverErrorValue(_name, _seq, _value) {
    window[_name].callbacks.get(_seq).reject(_value);
    window[_name].callbacks.delete(_seq);
  }
  return evaluationString(deliverErrorValue, name, seq, value);
}
async function waitWithTimeout(promise, taskName, timeout, browser) {
  let reject;
  const timeoutError = new TimeoutError(`waiting for ${taskName} failed: timeout ${timeout}ms exceeded`);
  const timeoutPromise = new Promise((_res, rej) => {
    reject = rej;
  });
  let timeoutTimer = null;
  if (timeout) {
    timeoutTimer = setTimeout(() => {
      return reject(timeoutError);
    }, timeout);
  }
  try {
    return await Promise.race([
      new Promise((_, rej) => {
        browser.once("closed" /* Closed */, () => {
          return rej();
        });
      }),
      promise,
      timeoutPromise
    ]);
  } finally {
    if (timeoutTimer) {
      clearTimeout(timeoutTimer);
    }
  }
}
function isErrorLike(obj) {
  return typeof obj === "object" && obj !== null && "name" in obj && "message" in obj;
}
function isErrnoException(obj) {
  return isErrorLike(obj) && (("errno" in obj) || ("code" in obj) || ("path" in obj) || ("syscall" in obj));
}

// src/browser/DOMWorld.ts
class DOMWorld {
  #frame;
  #contextPromise = null;
  #contextResolveCallback = null;
  #detached = false;
  #waitTasks = new Set;
  get _waitTasks() {
    return this.#waitTasks;
  }
  constructor(frame) {
    this.#frame = frame;
    this._setContext(null);
  }
  frame() {
    return this.#frame;
  }
  _setContext(context) {
    if (context) {
      assert(this.#contextResolveCallback, "Execution Context has already been set.");
      this.#contextResolveCallback?.call(null, context);
      this.#contextResolveCallback = null;
      for (const waitTask of this._waitTasks) {
        waitTask.rerun();
      }
    } else {
      this.#contextPromise = new Promise((fulfill) => {
        this.#contextResolveCallback = fulfill;
      });
    }
  }
  _hasContext() {
    return !this.#contextResolveCallback;
  }
  _detach() {
    this.#detached = true;
    for (const waitTask of this._waitTasks) {
      waitTask.terminate(new Error("waitForFunction failed: frame got detached."));
    }
  }
  executionContext() {
    if (this.#detached) {
      throw new Error(`Execution context is not available in detached frame "${this.#frame.url()}" (are you trying to evaluate?)`);
    }
    if (this.#contextPromise === null) {
      throw new Error(`Execution content promise is missing`);
    }
    return this.#contextPromise;
  }
  async evaluateHandle(pageFunction, ...args) {
    const context = await this.executionContext();
    return context.evaluateHandle(pageFunction, ...args);
  }
  async evaluate(pageFunction, ...args) {
    const context = await this.executionContext();
    return context.evaluate(pageFunction, ...args);
  }
  waitForFunction({
    browser,
    timeout,
    pageFunction,
    title
  }) {
    return new WaitTask({
      domWorld: this,
      predicateBody: pageFunction,
      title,
      timeout,
      args: [],
      browser
    });
  }
}
var noop = () => {
  return;
};

class WaitTask {
  #domWorld;
  #timeout;
  #predicateBody;
  #args;
  #runCount = 0;
  #resolve = noop;
  #reject = noop;
  #timeoutTimer;
  #terminated = false;
  #browser;
  promise;
  constructor(options) {
    function getPredicateBody(predicateBody) {
      if (isString(predicateBody)) {
        return `return (${predicateBody});`;
      }
      return `return (${predicateBody})(...args);`;
    }
    this.#domWorld = options.domWorld;
    this.#timeout = options.timeout;
    this.#predicateBody = getPredicateBody(options.predicateBody);
    this.#args = options.args;
    this.#runCount = 0;
    this.#domWorld._waitTasks.add(this);
    this.promise = new Promise((resolve, reject) => {
      this.#resolve = resolve;
      this.#reject = reject;
    });
    if (options.timeout) {
      const timeoutError = new TimeoutError(`waiting for ${options.title} failed: timeout ${options.timeout}ms exceeded`);
      this.#timeoutTimer = setTimeout(() => {
        return this.#reject(timeoutError);
      }, options.timeout);
    }
    this.#browser = options.browser;
    this.#browser.on("closed" /* Closed */, this.onBrowserClose);
    this.#browser.on("closed-silent" /* ClosedSilent */, this.onBrowserCloseSilent);
    this.rerun();
  }
  onBrowserClose = () => {
    return this.terminate(new Error("Browser was closed"));
  };
  onBrowserCloseSilent = () => {
    return this.terminate(null);
  };
  terminate(error) {
    this.#terminated = true;
    if (error) {
      this.#reject(error);
    }
    this.#cleanup();
  }
  async rerun() {
    const runCount = ++this.#runCount;
    let success = null;
    let error = null;
    const context = await this.#domWorld.executionContext();
    if (this.#terminated || runCount !== this.#runCount) {
      return;
    }
    if (this.#terminated || runCount !== this.#runCount) {
      return;
    }
    try {
      success = await context.evaluateHandle(waitForPredicatePageFunction, this.#predicateBody, this.#timeout, ...this.#args);
    } catch (error_) {
      error = error_;
    }
    if (this.#terminated || runCount !== this.#runCount) {
      if (success) {
        await success.dispose();
      }
      return;
    }
    if (!error && await this.#domWorld.evaluate((s) => {
      return !s;
    }, success).catch(() => {
      return true;
    })) {
      if (!success) {
        throw new Error("Assertion: result handle is not available");
      }
      await success.dispose();
      return;
    }
    if (error) {
      if (error.message.includes("TypeError: binding is not a function")) {
        return this.rerun();
      }
      if (error.message.includes("Execution context is not available in detached frame")) {
        this.terminate(new Error("waitForFunction failed: frame got detached."));
        return;
      }
      if (error.message.includes("Execution context was destroyed")) {
        return;
      }
      if (error.message.includes("Cannot find context with specified id")) {
        return;
      }
      this.#reject(error);
    } else {
      if (!success) {
        throw new Error("Assertion: result handle is not available");
      }
      this.#resolve(success);
    }
    this.#cleanup();
  }
  #cleanup() {
    if (this.#timeoutTimer !== undefined) {
      clearTimeout(this.#timeoutTimer);
    }
    this.#browser.off("closed" /* Closed */, this.onBrowserClose);
    this.#browser.off("closed-silent" /* ClosedSilent */, this.onBrowserCloseSilent);
    if (this.#domWorld._waitTasks.size > 100) {
      throw new Error("Leak detected: Too many WaitTasks");
    }
    this.#domWorld._waitTasks.delete(this);
  }
}
function waitForPredicatePageFunction(predicateBody, timeout, ...args) {
  const predicate = new Function("...args", predicateBody);
  let timedOut = false;
  if (timeout) {
    setTimeout(() => {
      timedOut = true;
    }, timeout);
  }
  return new Promise((resolve) => {
    async function onRaf() {
      if (timedOut) {
        resolve(undefined);
        return;
      }
      const success = await predicate(...args);
      if (success) {
        resolve(success);
      } else {
        requestAnimationFrame(onRaf);
      }
    }
    onRaf();
  });
}

// src/browser/JSHandle.ts
function _createJSHandle(context, remoteObject) {
  const frame = context.frame();
  if (remoteObject.subtype === "node" && frame) {
    return new ElementHandle(context, context._client, remoteObject);
  }
  return new JSHandle(context, context._client, remoteObject);
}

class JSHandle {
  #client;
  #disposed = false;
  #context;
  #remoteObject;
  get _disposed() {
    return this.#disposed;
  }
  get _remoteObject() {
    return this.#remoteObject;
  }
  get _context() {
    return this.#context;
  }
  constructor(context, client, remoteObject) {
    this.#context = context;
    this.#client = client;
    this.#remoteObject = remoteObject;
  }
  executionContext() {
    return this.#context;
  }
  evaluateHandle(pageFunction, ...args) {
    return this.executionContext().evaluateHandle(pageFunction, this, ...args);
  }
  asElement() {
    return null;
  }
  async dispose() {
    if (this.#disposed) {
      return;
    }
    this.#disposed = true;
    await releaseObject(this.#client, this.#remoteObject);
  }
  toString() {
    if (this.#remoteObject.objectId) {
      const type = this.#remoteObject.subtype || this.#remoteObject.type;
      return "JSHandle@" + type;
    }
    return valueFromRemoteObject(this.#remoteObject);
  }
}

class ElementHandle extends JSHandle {
  asElement() {
    return this;
  }
}

// src/browser/ExecutionContext.ts
var EVALUATION_SCRIPT_URL = "pptr://__puppeteer_evaluation_script__";
var SOURCE_URL_REGEX = /^[\x20\t]*\/\/[@#] sourceURL=\s*(\S*?)\s*$/m;

class ExecutionContext {
  _client;
  _world;
  _contextId;
  _contextName;
  constructor(client, contextPayload, world) {
    this._client = client;
    this._world = world;
    this._contextId = contextPayload.id;
    this._contextName = contextPayload.name;
  }
  frame() {
    return this._world ? this._world.frame() : null;
  }
  evaluate(pageFunction, ...args) {
    return this.#evaluate(true, pageFunction, ...args);
  }
  evaluateHandle(pageFunction, ...args) {
    return this.#evaluate(false, pageFunction, ...args);
  }
  async#evaluate(returnByValue, pageFunction, ...args) {
    const suffix = `//# sourceURL=${EVALUATION_SCRIPT_URL}`;
    if (isString(pageFunction)) {
      const contextId = this._contextId;
      const expression = pageFunction;
      const expressionWithSourceUrl = SOURCE_URL_REGEX.test(expression) ? expression : expression + `
` + suffix;
      const {
        value: { exceptionDetails: _details, result: _remoteObject }
      } = await this._client.send("Runtime.evaluate", {
        expression: expressionWithSourceUrl,
        contextId,
        returnByValue,
        awaitPromise: true,
        userGesture: true
      }).catch(rewriteError2);
      if (_details) {
        throw new Error("Evaluation failed: " + getExceptionMessage(_details));
      }
      return returnByValue ? valueFromRemoteObject(_remoteObject) : _createJSHandle(this, _remoteObject);
    }
    if (typeof pageFunction !== "function") {
      throw new Error(`Expected to get |string| or |function| as the first argument, but got "${pageFunction}" instead.`);
    }
    let functionText = pageFunction.toString();
    try {
      new Function("(" + functionText + ")");
    } catch (error) {
      if (functionText.startsWith("async ")) {
        functionText = "async function " + functionText.substring("async ".length);
      } else {
        functionText = "function " + functionText;
      }
      try {
        new Function("(" + functionText + ")");
      } catch (_error) {
        throw new Error("Passed function is not well-serializable!");
      }
    }
    let callFunctionOnPromise;
    try {
      callFunctionOnPromise = this._client.send("Runtime.callFunctionOn", {
        functionDeclaration: functionText + `
` + suffix + `
`,
        executionContextId: this._contextId,
        arguments: args.map(convertArgument.bind(this)),
        returnByValue,
        awaitPromise: true,
        userGesture: true
      });
    } catch (error) {
      if (error instanceof TypeError && error.message.startsWith("Converting circular structure to JSON")) {
        error.message += " Recursive objects are not allowed.";
      }
      throw error;
    }
    const {
      value: { exceptionDetails, result: remoteObject }
    } = await callFunctionOnPromise.catch(rewriteError2);
    if (exceptionDetails) {
      throw new Error("Evaluation failed: " + getExceptionMessage(exceptionDetails));
    }
    return returnByValue ? valueFromRemoteObject(remoteObject) : _createJSHandle(this, remoteObject);
    function convertArgument(arg) {
      if (typeof arg === "bigint") {
        return { unserializableValue: `${arg.toString()}n` };
      }
      if (Object.is(arg, -0)) {
        return { unserializableValue: "-0" };
      }
      if (Object.is(arg, Infinity)) {
        return { unserializableValue: "Infinity" };
      }
      if (Object.is(arg, -Infinity)) {
        return { unserializableValue: "-Infinity" };
      }
      if (Object.is(arg, NaN)) {
        return { unserializableValue: "NaN" };
      }
      const objectHandle = arg && arg instanceof JSHandle ? arg : null;
      if (objectHandle) {
        if (objectHandle._context !== this) {
          throw new Error("JSHandles can be evaluated only in the context they were created!");
        }
        if (objectHandle._disposed) {
          throw new Error("JSHandle is disposed!");
        }
        if (objectHandle._remoteObject.unserializableValue) {
          return {
            unserializableValue: objectHandle._remoteObject.unserializableValue
          };
        }
        if (!objectHandle._remoteObject.objectId) {
          return { value: objectHandle._remoteObject.value };
        }
        return { objectId: objectHandle._remoteObject.objectId };
      }
      return { value: arg };
    }
    function rewriteError2(error) {
      if (error.message.includes("Object reference chain is too long")) {
        return { value: { result: { type: "undefined" } }, size: 1 };
      }
      if (error.message.includes("Object couldn't be returned by value")) {
        return { value: { result: { type: "undefined" } }, size: 1 };
      }
      if (error.message.endsWith("Cannot find context with specified id") || error.message.endsWith("Inspected target navigated or closed")) {
        throw new Error("Execution context was destroyed, most likely because of a navigation.");
      }
      throw error;
    }
  }
}

// src/browser/flaky-errors.ts
var isTargetClosedErr = (error) => {
  return error?.message?.includes("Target closed") || error?.message?.includes("Session closed");
};
var isFlakyNetworkError = (error) => {
  return error?.message?.includes("ERR_CONNECTION_REFUSED") || error?.message?.includes("ERR_CONNECTION_RESET") || error?.message?.includes("ERR_CONNECTION_TIMED_OUT") || error?.message?.includes("ERR_INTERNET_DISCONNECTED") || error?.message?.includes("ERR_NAME_RESOLUTION_FAILED") || error?.message?.includes("ERR_ADDRESS_UNREACHABLE") || error?.message?.includes("ERR_NETWORK_CHANGED");
};

// src/browser/handle-failed-resource.ts
var handleFailedResource = ({
  extraInfo,
  logLevel,
  indent,
  request,
  event
}) => {
  const firstExtraInfo = extraInfo[0] ?? null;
  Log.warn({ indent, logLevel }, `Browser failed to load ${request._url} (${event.type}): ${event.errorText}`);
  if (firstExtraInfo) {
    Log.warn({ indent, logLevel }, `HTTP status code: ${firstExtraInfo.statusCode}, headers:`);
    Log.warn({ indent, logLevel }, JSON.stringify(firstExtraInfo.headers, null, 2));
  }
  if (event.errorText === "net::ERR_FAILED" && event.type === "Fetch" && request._url?.includes("/proxy")) {
    Log.warn({ indent, logLevel }, "This could be caused by Chrome rejecting the request because the disk space is low.");
    Log.warn({ indent, logLevel }, "This could be caused by Chrome rejecting the request because the disk space is low.");
    Log.warn({ indent, logLevel }, "Consider increasing the disk size of your Lambda function.");
  }
};

// src/browser/HTTPRequest.ts
class HTTPRequest {
  _requestId;
  _response = null;
  _url = null;
  _fromMemoryCache = false;
  #isNavigationRequest;
  #frame;
  constructor(frame, event) {
    this._requestId = event.requestId;
    this.#isNavigationRequest = event.requestId === event.loaderId && event.type === "Document";
    this.#frame = frame;
    this._url = event.request.url;
  }
  response() {
    return this._response;
  }
  frame() {
    return this.#frame;
  }
  isNavigationRequest() {
    return this.#isNavigationRequest;
  }
}

// src/browser/HTTPResponse.ts
class HTTPResponse {
  #status;
  constructor(responsePayload, extraInfo) {
    this.#status = extraInfo ? extraInfo.statusCode : responsePayload.status;
  }
  status() {
    return this.#status;
  }
}

// src/browser/NetworkEventManager.ts
class NetworkEventManager {
  #requestWillBeSentMap = new Map;
  #requestPausedMap = new Map;
  #httpRequestsMap = new Map;
  #responseReceivedExtraInfoMap = new Map;
  #queuedRedirectInfoMap = new Map;
  #queuedEventGroupMap = new Map;
  #failedLoadInfoMap = new Map;
  forget(networkRequestId) {
    this.#requestWillBeSentMap.delete(networkRequestId);
    this.#requestPausedMap.delete(networkRequestId);
    this.#queuedEventGroupMap.delete(networkRequestId);
    this.#queuedRedirectInfoMap.delete(networkRequestId);
    this.#responseReceivedExtraInfoMap.delete(networkRequestId);
    this.#failedLoadInfoMap.delete(networkRequestId);
  }
  queueFailedLoadInfo(networkRequestId, event) {
    this.#failedLoadInfoMap.set(networkRequestId, { event });
  }
  getFailedLoadInfo(networkRequestId) {
    return this.#failedLoadInfoMap.get(networkRequestId)?.event;
  }
  getResponseExtraInfo(networkRequestId) {
    if (!this.#responseReceivedExtraInfoMap.has(networkRequestId)) {
      this.#responseReceivedExtraInfoMap.set(networkRequestId, []);
    }
    return this.#responseReceivedExtraInfoMap.get(networkRequestId);
  }
  queuedRedirectInfo(fetchRequestId) {
    if (!this.#queuedRedirectInfoMap.has(fetchRequestId)) {
      this.#queuedRedirectInfoMap.set(fetchRequestId, []);
    }
    return this.#queuedRedirectInfoMap.get(fetchRequestId);
  }
  queueRedirectInfo(fetchRequestId, redirectInfo) {
    this.queuedRedirectInfo(fetchRequestId).push(redirectInfo);
  }
  takeQueuedRedirectInfo(fetchRequestId) {
    return this.queuedRedirectInfo(fetchRequestId).shift();
  }
  storeRequestWillBeSent(networkRequestId, event) {
    this.#requestWillBeSentMap.set(networkRequestId, event);
  }
  getRequestWillBeSent(networkRequestId) {
    return this.#requestWillBeSentMap.get(networkRequestId);
  }
  forgetRequestWillBeSent(networkRequestId) {
    this.#requestWillBeSentMap.delete(networkRequestId);
  }
  storeRequestPaused(networkRequestId, event) {
    this.#requestPausedMap.set(networkRequestId, event);
  }
  getRequest(networkRequestId) {
    return this.#httpRequestsMap.get(networkRequestId);
  }
  storeRequest(networkRequestId, request) {
    this.#httpRequestsMap.set(networkRequestId, request);
  }
  forgetRequest(networkRequestId) {
    this.#httpRequestsMap.delete(networkRequestId);
  }
  getQueuedEventGroup(networkRequestId) {
    return this.#queuedEventGroupMap.get(networkRequestId);
  }
  queueEventGroup(networkRequestId, event) {
    this.#queuedEventGroupMap.set(networkRequestId, event);
  }
  forgetQueuedEventGroup(networkRequestId) {
    this.#queuedEventGroupMap.delete(networkRequestId);
  }
}

// src/browser/NetworkManager.ts
var NetworkManagerEmittedEvents = {
  Request: Symbol("NetworkManager.Request")
};

class NetworkManager extends EventEmitter {
  #client;
  #frameManager;
  #networkEventManager = new NetworkEventManager;
  #indent;
  #logLevel;
  constructor(client, frameManager, indent, logLevel) {
    super();
    this.#client = client;
    this.#frameManager = frameManager;
    this.#indent = indent;
    this.#logLevel = logLevel;
    this.#client.on("Fetch.requestPaused", this.#onRequestPaused.bind(this));
    this.#client.on("Network.requestWillBeSent", this.#onRequestWillBeSent.bind(this));
    this.#client.on("Network.requestServedFromCache", this.#onRequestServedFromCache.bind(this));
    this.#client.on("Network.responseReceived", this.#onResponseReceived.bind(this));
    this.#client.on("Network.loadingFinished", this.#onLoadingFinished.bind(this));
    this.#client.on("Network.loadingFailed", this.#onLoadingFailed.bind(this));
    this.#client.on("Network.responseReceivedExtraInfo", this.#onResponseReceivedExtraInfo.bind(this));
  }
  async initialize() {
    await this.#client.send("Network.enable");
  }
  #onRequestWillBeSent(event) {
    this.#onRequest(event, undefined);
  }
  #onRequestPaused(event) {
    const { networkId: networkRequestId, requestId: fetchRequestId } = event;
    if (!networkRequestId) {
      return;
    }
    const requestWillBeSentEvent = (() => {
      const _requestWillBeSentEvent = this.#networkEventManager.getRequestWillBeSent(networkRequestId);
      if (_requestWillBeSentEvent && (_requestWillBeSentEvent.request.url !== event.request.url || _requestWillBeSentEvent.request.method !== event.request.method)) {
        this.#networkEventManager.forgetRequestWillBeSent(networkRequestId);
        return;
      }
      return _requestWillBeSentEvent;
    })();
    if (requestWillBeSentEvent) {
      this.#patchRequestEventHeaders(requestWillBeSentEvent, event);
      this.#onRequest(requestWillBeSentEvent, fetchRequestId);
    } else {
      this.#networkEventManager.storeRequestPaused(networkRequestId, event);
    }
  }
  #patchRequestEventHeaders(requestWillBeSentEvent, requestPausedEvent) {
    requestWillBeSentEvent.request.headers = {
      ...requestWillBeSentEvent.request.headers,
      ...requestPausedEvent.request.headers
    };
  }
  #onRequest(event, fetchRequestId) {
    if (event.redirectResponse) {
      let redirectResponseExtraInfo = null;
      if (event.redirectHasExtraInfo) {
        redirectResponseExtraInfo = this.#networkEventManager.getResponseExtraInfo(event.requestId).shift();
        if (!redirectResponseExtraInfo) {
          this.#networkEventManager.queueRedirectInfo(event.requestId, {
            event,
            fetchRequestId
          });
          return;
        }
      }
      const _request = this.#networkEventManager.getRequest(event.requestId);
      if (_request) {
        this.#handleRequestRedirect(_request, event.redirectResponse, redirectResponseExtraInfo);
      }
    }
    const frame = event.frameId ? this.#frameManager.frame(event.frameId) : null;
    const request = new HTTPRequest(frame, event);
    this.#networkEventManager.storeRequest(event.requestId, request);
    this.emit(NetworkManagerEmittedEvents.Request, request);
  }
  #onRequestServedFromCache(event) {
    const request = this.#networkEventManager.getRequest(event.requestId);
    if (request) {
      request._fromMemoryCache = true;
    }
  }
  #handleRequestRedirect(request, responsePayload, extraInfo) {
    const response = new HTTPResponse(responsePayload, extraInfo);
    request._response = response;
    this.#forgetRequest(request, false);
  }
  #emitResponseEvent(responseReceived, extraInfo) {
    const request = this.#networkEventManager.getRequest(responseReceived.requestId);
    if (!request) {
      return;
    }
    const response = new HTTPResponse(responseReceived.response, extraInfo);
    request._response = response;
  }
  #onResponseReceived(event) {
    const request = this.#networkEventManager.getRequest(event.requestId);
    let extraInfo = null;
    if (request && !request._fromMemoryCache && event.hasExtraInfo) {
      extraInfo = this.#networkEventManager.getResponseExtraInfo(event.requestId).shift();
      if (!extraInfo) {
        this.#networkEventManager.queueEventGroup(event.requestId, {
          responseReceivedEvent: event
        });
        return;
      }
    }
    this.#emitResponseEvent(event, extraInfo);
  }
  #onResponseReceivedExtraInfo(event) {
    const redirectInfo = this.#networkEventManager.takeQueuedRedirectInfo(event.requestId);
    if (redirectInfo) {
      this.#networkEventManager.getResponseExtraInfo(event.requestId).push(event);
      this.#onRequest(redirectInfo.event, redirectInfo.fetchRequestId);
      return;
    }
    const queuedEvents = this.#networkEventManager.getQueuedEventGroup(event.requestId);
    if (queuedEvents) {
      this.#networkEventManager.forgetQueuedEventGroup(event.requestId);
      this.#emitResponseEvent(queuedEvents.responseReceivedEvent, event);
      if (queuedEvents.loadingFinishedEvent) {
        this.#emitLoadingFinished(queuedEvents.loadingFinishedEvent);
      }
      if (queuedEvents.loadingFailedEvent) {
        this.#emitLoadingFailed(queuedEvents.loadingFailedEvent);
      }
      return;
    }
    this.#networkEventManager.getResponseExtraInfo(event.requestId).push(event);
  }
  #forgetRequest(request, events) {
    const requestId = request._requestId;
    this.#networkEventManager.forgetRequest(requestId);
    if (events) {
      this.#networkEventManager.forget(requestId);
    }
  }
  #onLoadingFinished(event) {
    const queuedEvents = this.#networkEventManager.getQueuedEventGroup(event.requestId);
    if (queuedEvents) {
      queuedEvents.loadingFinishedEvent = event;
    } else {
      this.#emitLoadingFinished(event);
    }
  }
  #emitLoadingFinished(event) {
    const request = this.#networkEventManager.getRequest(event.requestId);
    if (!request) {
      return;
    }
    this.#forgetRequest(request, true);
  }
  #onLoadingFailed(event) {
    const queuedEvents = this.#networkEventManager.getQueuedEventGroup(event.requestId);
    if (queuedEvents) {
      queuedEvents.loadingFailedEvent = event;
    } else {
      this.#emitLoadingFailed(event);
    }
  }
  #emitLoadingFailed(event) {
    const request = this.#networkEventManager.getRequest(event.requestId);
    if (!request) {
      return;
    }
    if (event.canceled) {
      this.#forgetRequest(request, true);
      return;
    }
    const extraInfo = this.#networkEventManager.getResponseExtraInfo(event.requestId);
    handleFailedResource({
      extraInfo,
      event,
      indent: this.#indent,
      logLevel: this.#logLevel,
      request
    });
    this.#forgetRequest(request, true);
  }
}

// src/browser/LifecycleWatcher.ts
var puppeteerToProtocolLifecycle = new Map([["load", "load"]]);
var noop2 = () => {
  return;
};

class LifecycleWatcher {
  #expectedLifecycle;
  #frameManager;
  #frame;
  #timeout;
  #navigationRequest = null;
  #eventListeners;
  #sameDocumentNavigationCompleteCallback = noop2;
  #sameDocumentNavigationPromise = new Promise((fulfill) => {
    this.#sameDocumentNavigationCompleteCallback = fulfill;
  });
  #lifecycleCallback = noop2;
  #lifecyclePromise = new Promise((fulfill) => {
    this.#lifecycleCallback = fulfill;
  });
  #newDocumentNavigationCompleteCallback = noop2;
  #newDocumentNavigationPromise = new Promise((fulfill) => {
    this.#newDocumentNavigationCompleteCallback = fulfill;
  });
  #terminationCallback = noop2;
  #terminationPromise = new Promise((fulfill) => {
    this.#terminationCallback = fulfill;
  });
  #timeoutPromise;
  #maximumTimer;
  #hasSameDocumentNavigation;
  #newDocumentNavigation;
  #swapped;
  constructor(frameManager, frame, waitUntil, timeout) {
    const protocolEvent = puppeteerToProtocolLifecycle.get(waitUntil);
    assert(protocolEvent, "Unknown value for options.waitUntil: " + waitUntil);
    this.#expectedLifecycle = [waitUntil];
    this.#frameManager = frameManager;
    this.#frame = frame;
    this.#timeout = timeout;
    this.#eventListeners = [
      addEventListener(frameManager._client, CDPSessionEmittedEvents.Disconnected, this.#terminate.bind(this, new Error("Navigation failed because browser has disconnected!"))),
      addEventListener(this.#frameManager, FrameManagerEmittedEvents.LifecycleEvent, this.#checkLifecycleComplete.bind(this)),
      addEventListener(this.#frameManager, FrameManagerEmittedEvents.FrameNavigatedWithinDocument, this.#navigatedWithinDocument.bind(this)),
      addEventListener(this.#frameManager, FrameManagerEmittedEvents.FrameNavigated, this.#navigated.bind(this)),
      addEventListener(this.#frameManager, FrameManagerEmittedEvents.FrameSwapped, this.#frameSwapped.bind(this)),
      addEventListener(this.#frameManager, FrameManagerEmittedEvents.FrameDetached, this.#onFrameDetached.bind(this)),
      addEventListener(this.#frameManager.networkManager(), NetworkManagerEmittedEvents.Request, this.#onRequest.bind(this))
    ];
    this.#timeoutPromise = this.#createTimeoutPromise();
    this.#checkLifecycleComplete();
  }
  #onRequest(request) {
    if (request.frame() !== this.#frame || !request.isNavigationRequest()) {
      return;
    }
    this.#navigationRequest = request;
  }
  #onFrameDetached(frame) {
    if (this.#frame === frame) {
      this.#terminationCallback.call(null, new Error("Navigating frame was detached"));
      return;
    }
    this.#checkLifecycleComplete();
  }
  navigationResponse() {
    if (!this.#navigationRequest) {
      return null;
    }
    const res = this.#navigationRequest.response();
    return res;
  }
  #terminate(error) {
    this.#terminationCallback.call(null, error);
  }
  sameDocumentNavigationPromise() {
    return this.#sameDocumentNavigationPromise;
  }
  newDocumentNavigationPromise() {
    return this.#newDocumentNavigationPromise;
  }
  lifecyclePromise() {
    return this.#lifecyclePromise;
  }
  timeoutOrTerminationPromise() {
    return Promise.race([this.#timeoutPromise, this.#terminationPromise]);
  }
  async#createTimeoutPromise() {
    if (!this.#timeout) {
      return new Promise(noop2);
    }
    const errorMessage = "Navigation timeout of " + this.#timeout + " ms exceeded";
    await new Promise((fulfill) => {
      this.#maximumTimer = setTimeout(fulfill, this.#timeout);
    });
    return new TimeoutError(errorMessage);
  }
  #navigatedWithinDocument(frame) {
    if (frame !== this.#frame) {
      return;
    }
    this.#hasSameDocumentNavigation = true;
    this.#checkLifecycleComplete();
  }
  #navigated(frame) {
    if (frame !== this.#frame) {
      return;
    }
    this.#newDocumentNavigation = true;
    this.#checkLifecycleComplete();
  }
  #frameSwapped(frame) {
    if (frame !== this.#frame) {
      return;
    }
    this.#swapped = true;
    this.#checkLifecycleComplete();
  }
  #checkLifecycleComplete() {
    if (!checkLifecycle(this.#frame, this.#expectedLifecycle)) {
      return;
    }
    this.#lifecycleCallback();
    if (this.#hasSameDocumentNavigation) {
      this.#sameDocumentNavigationCompleteCallback();
    }
    if (this.#swapped || this.#newDocumentNavigation) {
      this.#newDocumentNavigationCompleteCallback();
    }
    function checkLifecycle(frame, expectedLifecycle) {
      for (const event of expectedLifecycle) {
        if (!frame._lifecycleEvents.has(event)) {
          return false;
        }
      }
      for (const child of frame.childFrames()) {
        if (child._hasStartedLoading && !checkLifecycle(child, expectedLifecycle)) {
          return false;
        }
      }
      return true;
    }
  }
  dispose() {
    removeEventListeners(this.#eventListeners);
    if (this.#maximumTimer !== undefined) {
      clearTimeout(this.#maximumTimer);
    }
  }
}

// src/browser/FrameManager.ts
var UTILITY_WORLD_NAME = "__puppeteer_utility_world__";
var FrameManagerEmittedEvents = {
  FrameNavigated: Symbol("FrameManager.FrameNavigated"),
  FrameDetached: Symbol("FrameManager.FrameDetached"),
  FrameSwapped: Symbol("FrameManager.FrameSwapped"),
  LifecycleEvent: Symbol("FrameManager.LifecycleEvent"),
  FrameNavigatedWithinDocument: Symbol("FrameManager.FrameNavigatedWithinDocument"),
  ExecutionContextCreated: Symbol("FrameManager.ExecutionContextCreated"),
  ExecutionContextDestroyed: Symbol("FrameManager.ExecutionContextDestroyed")
};

class FrameManager extends EventEmitter {
  #page;
  #networkManager;
  #frames = new Map;
  #contextIdToContext = new Map;
  #isolatedWorlds = new Set;
  #mainFrame;
  #client;
  get _client() {
    return this.#client;
  }
  constructor(client, page, indent, logLevel) {
    super();
    this.#client = client;
    this.#page = page;
    this.#networkManager = new NetworkManager(client, this, indent, logLevel);
    this.setupEventListeners(this.#client);
  }
  setupEventListeners(session) {
    session.on("Page.frameAttached", (event) => {
      this.#onFrameAttached(session, event.frameId, event.parentFrameId);
    });
    session.on("Page.frameNavigated", (event) => {
      this.#onFrameNavigated(event.frame);
    });
    session.on("Page.navigatedWithinDocument", (event) => {
      this.#onFrameNavigatedWithinDocument(event.frameId, event.url);
    });
    session.on("Page.frameDetached", (event) => {
      this.#onFrameDetached(event.frameId, event.reason);
    });
    session.on("Page.frameStartedLoading", (event) => {
      this.#onFrameStartedLoading(event.frameId);
    });
    session.on("Page.frameStoppedLoading", (event) => {
      this.#onFrameStoppedLoading(event.frameId);
    });
    session.on("Runtime.executionContextCreated", (event) => {
      this.#onExecutionContextCreated(event.context, session);
    });
    session.on("Runtime.executionContextDestroyed", (event) => {
      this.#onExecutionContextDestroyed(event.executionContextId, session);
    });
    session.on("Runtime.executionContextsCleared", () => {
      this.#onExecutionContextsCleared(session);
    });
    session.on("Page.lifecycleEvent", (event) => {
      this.#onLifecycleEvent(event);
    });
    session.on("Target.attachedToTarget", (event) => {
      this.#onAttachedToTarget(event);
    });
    session.on("Target.detachedFromTarget", (event) => {
      this.#onDetachedFromTarget(event);
    });
  }
  async initialize(client = this.#client) {
    try {
      const result = await Promise.all([
        client.send("Page.enable"),
        client.send("Page.getFrameTree"),
        client === this.#client ? Promise.resolve() : client.send("Target.setAutoAttach", {
          autoAttach: true,
          waitForDebuggerOnStart: false,
          flatten: true
        })
      ]);
      const {
        value: { frameTree }
      } = result[1];
      this.#handleFrameTree(client, frameTree);
      await Promise.all([
        client.send("Page.setLifecycleEventsEnabled", { enabled: true }),
        client.send("Runtime.enable").then(() => {
          return this._ensureIsolatedWorld(client, UTILITY_WORLD_NAME);
        }),
        client === this.#client ? this.#networkManager.initialize() : Promise.resolve()
      ]);
    } catch (error) {
      if (isErrorLike(error) && isTargetClosedErr(error)) {
        return;
      }
      throw error;
    }
  }
  networkManager() {
    return this.#networkManager;
  }
  async navigateFrame(frame, url, timeout, options = {}) {
    const { referer = undefined, waitUntil = "load" } = options;
    const watcher = new LifecycleWatcher(this, frame, waitUntil, timeout);
    let error = await Promise.race([
      navigate(this.#client, url, referer, frame._id),
      watcher.timeoutOrTerminationPromise()
    ]);
    if (!error) {
      error = await Promise.race([
        watcher.timeoutOrTerminationPromise(),
        watcher.newDocumentNavigationPromise(),
        watcher.sameDocumentNavigationPromise()
      ]);
    }
    watcher.dispose();
    if (error) {
      throw error;
    }
    return watcher.navigationResponse();
    async function navigate(client, _url, referrer, frameId) {
      try {
        const { value: response } = await client.send("Page.navigate", {
          url: _url,
          referrer,
          frameId
        });
        return response.errorText ? new Error(`${response.errorText} at ${_url}`) : null;
      } catch (_error) {
        if (isErrorLike(_error)) {
          return _error;
        }
        throw _error;
      }
    }
  }
  async#onAttachedToTarget(event) {
    if (event.targetInfo.type !== "iframe") {
      return;
    }
    const frame = this.#frames.get(event.targetInfo.targetId);
    const connection = Connection.fromSession(this.#client);
    assert(connection);
    const session = connection.session(event.sessionId);
    assert(session);
    if (frame) {
      frame._updateClient(session);
    }
    this.setupEventListeners(session);
    await this.initialize(session);
  }
  #onDetachedFromTarget(event) {
    if (!event.targetId) {
      return;
    }
    const frame = this.#frames.get(event.targetId);
    if (frame?.isOOPFrame()) {
      this.#removeFramesRecursively(frame);
    }
  }
  #onLifecycleEvent(event) {
    const frame = this.#frames.get(event.frameId);
    if (!frame) {
      return;
    }
    frame._onLifecycleEvent(event.loaderId, event.name);
    this.emit(FrameManagerEmittedEvents.LifecycleEvent, frame);
  }
  #onFrameStartedLoading(frameId) {
    const frame = this.#frames.get(frameId);
    if (!frame) {
      return;
    }
    frame._onLoadingStarted();
  }
  #onFrameStoppedLoading(frameId) {
    const frame = this.#frames.get(frameId);
    if (!frame) {
      return;
    }
    frame._onLoadingStopped();
    this.emit(FrameManagerEmittedEvents.LifecycleEvent, frame);
  }
  #handleFrameTree(session, frameTree) {
    if (frameTree.frame.parentId) {
      this.#onFrameAttached(session, frameTree.frame.id, frameTree.frame.parentId);
    }
    this.#onFrameNavigated(frameTree.frame);
    if (!frameTree.childFrames) {
      return;
    }
    for (const child of frameTree.childFrames) {
      this.#handleFrameTree(session, child);
    }
  }
  page() {
    return this.#page;
  }
  mainFrame() {
    assert(this.#mainFrame, "Requesting main frame too early!");
    return this.#mainFrame;
  }
  frames() {
    return Array.from(this.#frames.values());
  }
  frame(frameId) {
    return this.#frames.get(frameId) || null;
  }
  #onFrameAttached(session, frameId, parentFrameId) {
    if (this.#frames.has(frameId)) {
      const _frame = this.#frames.get(frameId);
      if (session && _frame.isOOPFrame()) {
        _frame._updateClient(session);
      }
      return;
    }
    assert(parentFrameId);
    const parentFrame = this.#frames.get(parentFrameId);
    assert(parentFrame);
    const frame = new Frame(this, parentFrame, frameId, session);
    this.#frames.set(frame._id, frame);
  }
  #onFrameNavigated(framePayload) {
    const isMainFrame = !framePayload.parentId;
    let frame = isMainFrame ? this.#mainFrame : this.#frames.get(framePayload.id);
    assert(isMainFrame || frame, "We either navigate top level or have old version of the navigated frame");
    if (frame) {
      for (const child of frame.childFrames()) {
        this.#removeFramesRecursively(child);
      }
    }
    if (isMainFrame) {
      if (frame) {
        this.#frames.delete(frame._id);
        frame._id = framePayload.id;
      } else {
        frame = new Frame(this, null, framePayload.id, this.#client);
      }
      this.#frames.set(framePayload.id, frame);
      this.#mainFrame = frame;
    }
    assert(frame);
    frame._navigated(framePayload);
    this.emit(FrameManagerEmittedEvents.FrameNavigated, frame);
  }
  async _ensureIsolatedWorld(session, name) {
    const key = `${session.id()}:${name}`;
    if (this.#isolatedWorlds.has(key)) {
      return;
    }
    this.#isolatedWorlds.add(key);
    await session.send("Page.addScriptToEvaluateOnNewDocument", {
      source: `//# sourceURL=${EVALUATION_SCRIPT_URL}`,
      worldName: name
    });
    await Promise.all(this.frames().filter((frame) => {
      return frame._client() === session;
    }).map((frame) => {
      return session.send("Page.createIsolatedWorld", {
        frameId: frame._id,
        worldName: name,
        grantUniveralAccess: true
      }).catch(() => {
        return;
      });
    }));
  }
  #onFrameNavigatedWithinDocument(frameId, url) {
    const frame = this.#frames.get(frameId);
    if (!frame) {
      return;
    }
    frame._navigatedWithinDocument(url);
    this.emit(FrameManagerEmittedEvents.FrameNavigatedWithinDocument, frame);
    this.emit(FrameManagerEmittedEvents.FrameNavigated, frame);
  }
  #onFrameDetached(frameId, reason) {
    const frame = this.#frames.get(frameId);
    if (reason === "remove") {
      if (frame) {
        this.#removeFramesRecursively(frame);
      }
    } else if (reason === "swap") {
      this.emit(FrameManagerEmittedEvents.FrameSwapped, frame);
    }
  }
  #onExecutionContextCreated(contextPayload, session) {
    const auxData = contextPayload.auxData;
    const frameId = auxData?.frameId;
    const frame = typeof frameId === "string" ? this.#frames.get(frameId) : undefined;
    let world;
    if (frame) {
      if (frame._client() !== session) {
        return;
      }
      if (contextPayload.auxData && Boolean(contextPayload.auxData.isDefault)) {
        world = frame._mainWorld;
      } else if (contextPayload.name === UTILITY_WORLD_NAME && !frame._secondaryWorld._hasContext()) {
        world = frame._secondaryWorld;
      }
    }
    const context = new ExecutionContext(frame?._client() || this.#client, contextPayload, world);
    if (world) {
      world._setContext(context);
    }
    const key = `${session.id()}:${contextPayload.id}`;
    this.#contextIdToContext.set(key, context);
  }
  #onExecutionContextDestroyed(executionContextId, session) {
    const key = `${session.id()}:${executionContextId}`;
    const context = this.#contextIdToContext.get(key);
    if (!context) {
      return;
    }
    this.#contextIdToContext.delete(key);
    if (context._world) {
      context._world._setContext(null);
    }
  }
  #onExecutionContextsCleared(session) {
    for (const [key, context] of this.#contextIdToContext.entries()) {
      if (context._client !== session) {
        continue;
      }
      if (context._world) {
        context._world._setContext(null);
      }
      this.#contextIdToContext.delete(key);
    }
  }
  executionContextById(contextId, session = this.#client) {
    const key = `${session.id()}:${contextId}`;
    const context = this.#contextIdToContext.get(key);
    assert(context, "INTERNAL ERROR: missing context with id = " + contextId);
    return context;
  }
  #removeFramesRecursively(frame) {
    for (const child of frame.childFrames()) {
      this.#removeFramesRecursively(child);
    }
    frame._detach();
    this.#frames.delete(frame._id);
    this.emit(FrameManagerEmittedEvents.FrameDetached, frame);
  }
}

class Frame {
  #parentFrame;
  #url = "";
  #client;
  _frameManager;
  _id;
  _loaderId = "";
  _name;
  _hasStartedLoading = false;
  _lifecycleEvents = new Set;
  _mainWorld;
  _secondaryWorld;
  _childFrames;
  constructor(frameManager, parentFrame, frameId, client) {
    this._frameManager = frameManager;
    this.#parentFrame = parentFrame ?? null;
    this.#url = "";
    this._id = frameId;
    this._loaderId = "";
    this._childFrames = new Set;
    if (this.#parentFrame) {
      this.#parentFrame._childFrames.add(this);
    }
    this._updateClient(client);
  }
  _updateClient(client) {
    this.#client = client;
    this._mainWorld = new DOMWorld(this);
    this._secondaryWorld = new DOMWorld(this);
  }
  isOOPFrame() {
    return this.#client !== this._frameManager._client;
  }
  goto(url, timeout, options = {}) {
    return this._frameManager.navigateFrame(this, url, timeout, options);
  }
  _client() {
    return this.#client;
  }
  executionContext() {
    return this._mainWorld.executionContext();
  }
  evaluateHandle(pageFunction, ...args) {
    return this._mainWorld.evaluateHandle(pageFunction, ...args);
  }
  evaluate(pageFunction, ...args) {
    return this._mainWorld.evaluate(pageFunction, ...args);
  }
  url() {
    return this.#url;
  }
  childFrames() {
    return Array.from(this._childFrames);
  }
  _navigated(framePayload) {
    this._name = framePayload.name;
    this.#url = `${framePayload.url}${framePayload.urlFragment || ""}`;
  }
  _navigatedWithinDocument(url) {
    this.#url = url;
  }
  _onLifecycleEvent(loaderId, name) {
    if (name === "init") {
      this._loaderId = loaderId;
      this._lifecycleEvents.clear();
    }
    this._lifecycleEvents.add(name);
  }
  _onLoadingStopped() {
    this._lifecycleEvents.add("load");
  }
  _onLoadingStarted() {
    this._hasStartedLoading = true;
  }
  _detach() {
    this._mainWorld._detach();
    this._secondaryWorld._detach();
    if (this.#parentFrame) {
      this.#parentFrame._childFrames.delete(this);
    }
    this.#parentFrame = null;
  }
}

// src/browser/TaskQueue.ts
class TaskQueue {
  #chain;
  constructor() {
    this.#chain = Promise.resolve();
  }
  postTask(task) {
    const result = this.#chain.then(task);
    this.#chain = result.then(() => {
      return;
    }, () => {
      return;
    });
    return result;
  }
}

// src/browser/TimeoutSettings.ts
var DEFAULT_TIMEOUT = 30000;

class TimeoutSettings {
  #defaultTimeout;
  #defaultNavigationTimeout;
  constructor() {
    this.#defaultTimeout = null;
    this.#defaultNavigationTimeout = null;
  }
  setDefaultTimeout(timeout) {
    this.#defaultTimeout = timeout;
  }
  setDefaultNavigationTimeout(timeout) {
    this.#defaultNavigationTimeout = timeout;
  }
  navigationTimeout() {
    if (this.#defaultNavigationTimeout !== null) {
      return this.#defaultNavigationTimeout;
    }
    if (this.#defaultTimeout !== null) {
      return this.#defaultTimeout;
    }
    return DEFAULT_TIMEOUT;
  }
  timeout() {
    if (this.#defaultTimeout !== null) {
      return this.#defaultTimeout;
    }
    return DEFAULT_TIMEOUT;
  }
}

// src/browser/BrowserPage.ts
var shouldHideWarning = (log) => {
  if (log.text.includes("Mixed Content:") && log.text.includes("http://localhost:")) {
    return true;
  }
  return false;
};
var format = (eventType, args) => {
  const previewString = args.filter((a) => !(a.type === "symbol" && a.description?.includes(`__remotion_`))).map((a) => formatRemoteObject(a)).filter(Boolean).join(" ");
  let logLevelFromRemotionLog = null;
  let tag = null;
  for (const a of args) {
    if (a.type === "symbol" && a.description?.includes(`__remotion_level_`)) {
      logLevelFromRemotionLog = a.description?.split("__remotion_level_")?.[1]?.replace(")", "");
    }
    if (a.type === "symbol" && a.description?.includes(`__remotion_tag_`)) {
      tag = a.description?.split("__remotion_tag_")?.[1]?.replace(")", "");
    }
  }
  const logLevelFromEvent = eventType === "debug" ? "verbose" : eventType === "error" ? "error" : eventType === "warning" ? "warn" : "verbose";
  return { previewString, logLevelFromRemotionLog, logLevelFromEvent, tag };
};

class Page extends EventEmitter {
  id;
  static async _create({
    client,
    target,
    defaultViewport,
    browser,
    sourceMapGetter,
    logLevel,
    indent,
    pageIndex,
    onBrowserLog,
    onLog
  }) {
    const page = new Page({
      client,
      target,
      browser,
      sourceMapGetter,
      logLevel,
      indent,
      pageIndex,
      onBrowserLog,
      onLog
    });
    await page.#initialize();
    await page.setViewport(defaultViewport);
    return page;
  }
  closed = false;
  #client;
  #target;
  #timeoutSettings = new TimeoutSettings;
  #frameManager;
  #pageBindings = new Map;
  browser;
  screenshotTaskQueue;
  sourceMapGetter;
  logLevel;
  indent;
  pageIndex;
  onBrowserLog;
  onLog;
  constructor({
    client,
    target,
    browser,
    sourceMapGetter,
    logLevel,
    indent,
    pageIndex,
    onBrowserLog,
    onLog
  }) {
    super();
    this.#client = client;
    this.#target = target;
    this.#frameManager = new FrameManager(client, this, indent, logLevel);
    this.screenshotTaskQueue = new TaskQueue;
    this.browser = browser;
    this.id = String(Math.random());
    this.sourceMapGetter = sourceMapGetter;
    this.logLevel = logLevel;
    this.indent = indent;
    this.pageIndex = pageIndex;
    this.onBrowserLog = onBrowserLog;
    this.onLog = onLog;
    client.on("Target.attachedToTarget", (event) => {
      switch (event.targetInfo.type) {
        case "iframe":
          break;
        case "worker":
          break;
        default:
          client.send("Target.detachFromTarget", {
            sessionId: event.sessionId
          }).catch((err) => Log.error({ indent, logLevel }, err));
      }
    });
    client.on("Runtime.consoleAPICalled", (event) => {
      return this.#onConsoleAPI(event);
    });
    client.on("Runtime.bindingCalled", (event) => {
      return this.#onBindingCalled(event);
    });
    client.on("Inspector.targetCrashed", () => {
      return this.#onTargetCrashed();
    });
    client.on("Log.entryAdded", (event) => {
      return this.#onLogEntryAdded(event);
    });
  }
  #onConsole = (log) => {
    const stackTrace = log.stackTrace();
    const { url, columnNumber, lineNumber } = stackTrace[0] ?? {};
    const logLevel = this.logLevel;
    const indent = this.indent;
    if (shouldHideWarning(log)) {
      return;
    }
    this.onBrowserLog?.({
      stackTrace,
      text: log.text,
      type: log.type
    });
    if (url?.endsWith(NoReactInternals2.bundleName) && lineNumber && this.sourceMapGetter()) {
      const origPosition = this.sourceMapGetter()?.originalPositionFor({
        column: columnNumber ?? 0,
        line: lineNumber
      });
      const file = [
        origPosition?.source,
        origPosition?.line,
        origPosition?.column
      ].filter(truthy).join(":");
      const isDelayRenderClear = log.previewString.includes(NoReactInternals2.DELAY_RENDER_CLEAR_TOKEN);
      const tabInfo = `Tab ${this.pageIndex}`;
      const tagInfo = [origPosition?.name, isDelayRenderClear ? null : file].filter(truthy).join("@");
      const tag = [tabInfo, log.tag, log.tag ? null : tagInfo].filter(truthy).join(", ");
      this.onLog({
        logLevel: log.logLevel,
        tag,
        previewString: log.previewString
      });
    } else if (log.type === "error") {
      if (log.text.includes("Failed to load resource:")) {
        Log.error({ logLevel, tag: url, indent }, log.text.replace(/\(\)$/, ""));
      } else {
        Log.error({ logLevel, tag: `console.${log.type}`, indent }, log.text);
      }
    } else {
      Log.verbose({ logLevel, tag: `console.${log.type}`, indent }, log.text);
    }
  };
  async#initialize() {
    await Promise.all([
      this.#frameManager.initialize(),
      this.#client.send("Target.setAutoAttach", {
        autoAttach: true,
        waitForDebuggerOnStart: false,
        flatten: true
      }),
      this.#client.send("Performance.enable"),
      this.#client.send("Log.enable")
    ]);
  }
  on(eventName, handler) {
    return super.on(eventName, handler);
  }
  once(eventName, handler) {
    return super.once(eventName, handler);
  }
  off(eventName, handler) {
    return super.off(eventName, handler);
  }
  target() {
    return this.#target;
  }
  _client() {
    return this.#client;
  }
  #onTargetCrashed() {
    this.emit("error", new Error("Page crashed!"));
  }
  #onLogEntryAdded(event) {
    const { level, text, args, source, url, lineNumber } = event.entry;
    if (args) {
      args.map((arg) => {
        return releaseObject(this.#client, arg);
      });
    }
    const { previewString, logLevelFromRemotionLog, logLevelFromEvent, tag } = format(level, args ?? []);
    if (source !== "worker") {
      const message = new ConsoleMessage({
        type: level,
        text,
        args: [],
        stackTraceLocations: [{ url, lineNumber }],
        previewString,
        logLevel: logLevelFromRemotionLog ?? logLevelFromEvent,
        tag
      });
      this.onBrowserLog?.({
        stackTrace: message.stackTrace(),
        text: message.text,
        type: message.type
      });
      this.#onConsole(message);
    }
  }
  mainFrame() {
    return this.#frameManager.mainFrame();
  }
  async setViewport(viewport) {
    const fromSurface = !process.env.DISABLE_FROM_SURFACE;
    const request = fromSurface ? {
      mobile: false,
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: viewport.deviceScaleFactor,
      screenOrientation: {
        angle: 0,
        type: "portraitPrimary"
      }
    } : {
      mobile: false,
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: 1,
      screenHeight: viewport.height,
      screenWidth: viewport.width,
      scale: viewport.deviceScaleFactor,
      viewport: {
        height: viewport.height * viewport.deviceScaleFactor,
        width: viewport.width * viewport.deviceScaleFactor,
        scale: 1,
        x: 0,
        y: 0
      }
    };
    const { value } = await this.#client.send("Emulation.setDeviceMetricsOverride", request);
    return value;
  }
  setDefaultNavigationTimeout(timeout) {
    this.#timeoutSettings.setDefaultNavigationTimeout(timeout);
  }
  setDefaultTimeout(timeout) {
    this.#timeoutSettings.setDefaultTimeout(timeout);
  }
  async evaluateHandle(pageFunction, ...args) {
    const context = await this.mainFrame().executionContext();
    return context.evaluateHandle(pageFunction, ...args);
  }
  #onConsoleAPI(event) {
    if (event.executionContextId === 0) {
      return;
    }
    const context = this.#frameManager.executionContextById(event.executionContextId, this.#client);
    const values = event.args.map((arg) => {
      return _createJSHandle(context, arg);
    });
    this.#addConsoleMessage(event.type, values, event.stackTrace);
  }
  async#onBindingCalled(event) {
    let payload;
    try {
      payload = JSON.parse(event.payload);
    } catch {
      return;
    }
    const { type, name, seq, args } = payload;
    if (type !== "exposedFun" || !this.#pageBindings.has(name)) {
      return;
    }
    let expression = null;
    try {
      const pageBinding = this.#pageBindings.get(name);
      assert(pageBinding);
      const result = await pageBinding(...args);
      expression = pageBindingDeliverResultString(name, seq, result);
    } catch (_error) {
      if (isErrorLike(_error)) {
        expression = pageBindingDeliverErrorString(name, seq, _error.message, _error.stack);
      } else {
        expression = pageBindingDeliverErrorValueString(name, seq, _error);
      }
    }
    await this.#client.send("Runtime.evaluate", {
      expression,
      contextId: event.executionContextId
    });
  }
  #addConsoleMessage(eventType, args, stackTrace) {
    const textTokens = [];
    for (const arg of args) {
      const remoteObject = arg._remoteObject;
      if (remoteObject.objectId) {
        textTokens.push(arg.toString());
      } else {
        textTokens.push(valueFromRemoteObject(remoteObject));
      }
    }
    const stackTraceLocations = [];
    if (stackTrace) {
      for (const callFrame of stackTrace.callFrames) {
        stackTraceLocations.push({
          url: callFrame.url,
          lineNumber: callFrame.lineNumber,
          columnNumber: callFrame.columnNumber
        });
      }
    }
    const { previewString, logLevelFromRemotionLog, logLevelFromEvent, tag } = format(eventType, args.map((a) => a._remoteObject) ?? []);
    const logLevel = logLevelFromRemotionLog ?? logLevelFromEvent;
    const message = new ConsoleMessage({
      type: eventType,
      text: textTokens.join(" "),
      args,
      stackTraceLocations,
      previewString,
      logLevel,
      tag
    });
    this.#onConsole(message);
  }
  url() {
    return this.mainFrame().url();
  }
  goto({
    url,
    timeout,
    options = {}
  }) {
    return this.#frameManager.mainFrame().goto(url, timeout, options);
  }
  async bringToFront() {
    await this.#client.send("Page.bringToFront");
  }
  async setAutoDarkModeOverride() {
    const result = await this.#client.send("Emulation.setEmulatedMedia", {
      media: "screen",
      features: [
        {
          name: "prefers-color-scheme",
          value: "dark"
        }
      ]
    });
    console.log(result);
  }
  evaluate(pageFunction, ...args) {
    return this.#frameManager.mainFrame().evaluate(pageFunction, ...args);
  }
  async evaluateOnNewDocument(pageFunction, ...args) {
    const source = evaluationString(pageFunction, ...args);
    await this.#client.send("Page.addScriptToEvaluateOnNewDocument", {
      source
    });
  }
  async close(options = { runBeforeUnload: undefined }) {
    const connection = this.#client.connection();
    if (!connection) {
      return;
    }
    const runBeforeUnload = Boolean(options.runBeforeUnload);
    if (runBeforeUnload) {
      await this.#client.send("Page.close");
    } else {
      await connection.send("Target.closeTarget", {
        targetId: this.#target._targetId
      });
      await this.#target._isClosedPromise;
    }
  }
  setBrowserSourceMapGetter(context) {
    this.sourceMapGetter = context;
  }
}

// src/browser/BrowserRunner.ts
import * as childProcess from "node:child_process";
import { join } from "node:path";

// src/delete-directory.ts
import fs4, { existsSync } from "node:fs";
var deleteDirectory = (directory) => {
  if (isServeUrl(directory)) {
    return;
  }
  if (!existsSync(directory)) {
    return;
  }
  let retries = 2;
  while (retries >= 0) {
    try {
      fs4.rmSync(directory, {
        maxRetries: 2,
        recursive: true,
        force: true,
        retryDelay: 100
      });
    } catch {
      retries--;
      continue;
    }
    break;
  }
};

// src/browser/NodeWebSocketTransport.ts
import { promises as dns } from "node:dns";
import { URL as URL2 } from "node:url";

// src/ws/ws-types.ts
import NodeWebSocket from "ws";
var ws = NodeWebSocket;

// src/browser/NodeWebSocketTransport.ts
class NodeWebSocketTransport {
  static async create(urlString) {
    const url = new URL2(urlString);
    if (url.hostname === "localhost") {
      const { address } = await dns.lookup(url.hostname, { verbatim: false });
      url.hostname = address;
    }
    return new Promise((resolve, reject) => {
      const ws2 = new ws(url, [], {
        followRedirects: true,
        perMessageDeflate: false,
        maxPayload: 1024 * 1024 * 1024,
        headers: {
          "User-Agent": `Remotion CLI`
        }
      });
      ws2.addEventListener("open", () => {
        return resolve(new NodeWebSocketTransport(ws2));
      });
      ws2.addEventListener("error", reject);
    });
  }
  websocket;
  onmessage;
  onclose;
  constructor(ws2) {
    this.websocket = ws2;
    this.websocket.addEventListener("message", (event) => {
      if (this.onmessage) {
        this.onmessage.call(null, event.data);
      }
    });
    this.websocket.addEventListener("close", () => {
      if (this.onclose) {
        this.onclose.call(null);
      }
    });
    this.websocket.addEventListener("error", () => {
      return;
    });
  }
  send(message) {
    this.websocket.send(message);
  }
  close() {
    this.websocket.close();
  }
  forgetEventLoop() {
    this.websocket._socket.unref();
  }
  rememberEventLoop() {
    this.websocket._socket.ref();
  }
}

// src/browser/parse-browser-log-message.ts
var parseBrowserLogMessage = (input) => {
  const format2 = /^\[([0-9]{4})\/([0-9]{6})\.([0-9]{6}):([A-Z]+):(.*?)(?:\(([0-9]+)\)|:([0-9]+))\](.*)/;
  const match = input.match(format2);
  if (!match) {
    return null;
  }
  const date = match[1];
  const day = parseInt(date.slice(0, 2), 10);
  const month = parseInt(date.slice(2, 4), 10);
  const time = match[2];
  const hour = parseInt(time.slice(0, 2), 10);
  const minute = parseInt(time.slice(2, 4), 10);
  const seconds = parseInt(time.slice(4, 6), 10);
  const microseconds = parseInt(match[3], 10);
  const level = match[4];
  const location = match[5];
  const lineNumber = parseInt(match[6] ?? match[7], 10);
  const message = match[8].trim();
  return {
    day,
    month,
    hour,
    minute,
    seconds,
    microseconds,
    level,
    location,
    lineNumber,
    message
  };
};

// src/browser/should-log-message.ts
var shouldLogBrowserMessage = (message) => {
  if (message.startsWith("DevTools listening on")) {
    return false;
  }
  if (message.includes("Falling back to ALSA for audio output")) {
    return false;
  }
  if (message.includes("Floss manager not present, cannot set Floss enable/disable")) {
    return false;
  }
  if (message.includes("Failed to send GpuControl.CreateCommandBuffer")) {
    return false;
  }
  if (message.includes("CreatePlatformSocket() failed: Address family not supported by protocol")) {
    return false;
  }
  if (message.includes("Fontconfig error: No writable cache directories")) {
    return false;
  }
  if (message.includes("AttributionReportingCrossAppWeb cannot be enabled in this configuration")) {
    return false;
  }
  if (message.includes("Trying to Produce a Memory representation from a non-existent mailbox.")) {
    return false;
  }
  if (message.includes("Received HEADERS for invalid stream")) {
    return false;
  }
  if (message.includes("CVDisplayLinkCreateWithCGDisplay failed")) {
    return false;
  }
  if (message.includes("Falling back to ALSA for audio output")) {
    return false;
  }
  if (message.includes("VizNullHypothesis is disabled")) {
    return false;
  }
  return true;
};
var formatChromeMessage = (input) => {
  const parsed = parseBrowserLogMessage(input);
  if (!parsed) {
    return { output: input, tag: "chrome" };
  }
  const { location, lineNumber, message } = parsed;
  if (location === "CONSOLE") {
    return null;
  }
  return { output: `${location}:${lineNumber}: ${message}`, tag: "chrome" };
};

// src/browser/BrowserRunner.ts
var PROCESS_ERROR_EXPLANATION = `Puppeteer was unable to kill the process which ran the browser binary.
 This means that, on future Puppeteer launches, Puppeteer might not be able to launch the browser.
 Please check your open processes and ensure that the browser processes that Puppeteer launched have been killed.
 If you think this is a bug, please report it on the Puppeteer issue tracker.`;
var makeBrowserRunner = async ({
  executablePath,
  processArguments,
  userDataDir,
  logLevel,
  indent,
  timeout
}) => {
  const dumpio = isEqualOrBelowLogLevel(logLevel, "verbose");
  const stdio = dumpio ? ["ignore", "pipe", "pipe"] : ["pipe", "pipe", "pipe"];
  const proc = childProcess.spawn(executablePath, processArguments, {
    detached: process.platform !== "win32",
    env: process.env,
    stdio
  });
  const browserWSEndpoint = await waitForWSEndpoint({
    browserProcess: proc,
    timeout,
    indent,
    logLevel
  });
  const transport = await NodeWebSocketTransport.create(browserWSEndpoint);
  const connection = new Connection(transport);
  const killProcess = () => {
    if (proc.pid && pidExists(proc.pid)) {
      try {
        if (process.platform === "win32") {
          childProcess.exec(`taskkill /pid ${proc.pid} /T /F`, (error) => {
            if (error) {
              proc.kill();
            }
          });
        } else {
          const processGroupId = -proc.pid;
          Log.verbose({ indent, logLevel }, `Trying to kill browser process group ${processGroupId}`);
          try {
            process.kill(processGroupId, "SIGKILL");
          } catch (error) {
            Log.verbose({ indent, logLevel }, `Could not kill browser process group ${processGroupId}. Killing process via Node.js API`);
            proc.kill("SIGKILL");
          }
        }
      } catch (error) {
        throw new Error(`${PROCESS_ERROR_EXPLANATION}
Error cause: ${isErrorLike(error) ? error.stack : error}`);
      }
    }
    deleteDirectory(userDataDir);
    removeEventListeners(listeners);
  };
  const closeProcess = () => {
    if (closed) {
      return Promise.resolve();
    }
    Log.verbose({ indent, logLevel }, "Received SIGTERM signal. Killing browser process");
    killProcess();
    deleteDirectory(userDataDir);
    removeEventListeners(listeners);
    return processClosing;
  };
  if (dumpio) {
    proc.stdout?.on("data", (d) => {
      const message = d.toString("utf8").trim();
      if (shouldLogBrowserMessage(message)) {
        const formatted = formatChromeMessage(message);
        if (!formatted) {
          return;
        }
        const { output, tag } = formatted;
        Log.verbose({ indent, logLevel, tag }, output);
      }
    });
    proc.stderr?.on("data", (d) => {
      const message = d.toString("utf8").trim();
      if (shouldLogBrowserMessage(message)) {
        const formatted = formatChromeMessage(message);
        if (!formatted) {
          return;
        }
        const { output, tag } = formatted;
        Log.error({ indent, logLevel, tag }, output);
      }
    });
  }
  let closed = false;
  const processClosing = new Promise((fulfill, reject) => {
    proc.once("exit", () => {
      closed = true;
      try {
        fulfill();
      } catch (error) {
        reject(error);
      }
    });
  });
  const listeners = [addEventListener(process, "exit", killProcess)];
  listeners.push(addEventListener(process, "SIGINT", () => {
    killProcess();
    process.exit(130);
  }));
  listeners.push(addEventListener(process, "SIGTERM", closeProcess));
  listeners.push(addEventListener(process, "SIGHUP", closeProcess));
  const deleteBrowserCaches = () => {
    const cachePaths = [
      join(userDataDir, "Default", "Cache", "Cache_Data"),
      join(userDataDir, "Default", "Code Cache"),
      join(userDataDir, "Default", "DawnCache"),
      join(userDataDir, "Default", "GPUCache")
    ];
    for (const p of cachePaths) {
      deleteDirectory(p);
    }
  };
  const rememberEventLoop = () => {
    proc.ref();
    proc.stdout?.ref();
    proc.stderr?.ref();
    assert(connection, "BrowserRunner not connected.");
    connection.transport.rememberEventLoop();
  };
  const forgetEventLoop = () => {
    proc.unref();
    proc.stdout?.unref();
    proc.stderr?.unref();
    assert(connection, "BrowserRunner not connected.");
    connection.transport.forgetEventLoop();
  };
  return {
    listeners,
    deleteBrowserCaches,
    forgetEventLoop,
    rememberEventLoop,
    connection,
    closeProcess
  };
};
function waitForWSEndpoint({
  browserProcess,
  timeout,
  logLevel,
  indent
}) {
  const browserStderr = browserProcess.stderr;
  const browserStdout = browserProcess.stdout;
  assert(browserStderr, "`browserProcess` does not have stderr.");
  assert(browserStdout, "`browserProcess` does not have stdout.");
  let stdioString = "";
  return new Promise((resolve, reject) => {
    browserStderr.addListener("data", onStdIoData);
    browserStdout.addListener("data", onStdIoData);
    browserStderr.addListener("close", onClose);
    const listeners = [
      () => browserStderr.removeListener("data", onStdIoData),
      () => browserStdout.removeListener("data", onStdIoData),
      () => browserStderr.removeListener("close", onClose),
      addEventListener(browserProcess, "exit", (code, signal) => {
        Log.verbose({ indent, logLevel }, "Browser process exited with code", code, "signal", signal);
        return onClose(new Error(`Closed with ${code} signal: ${signal}`));
      }),
      addEventListener(browserProcess, "error", (error) => {
        return onClose(error);
      })
    ];
    const timeoutId = timeout ? setTimeout(onTimeout, timeout) : 0;
    function onClose(error) {
      cleanup();
      reject(new Error([
        "Failed to launch the browser process!",
        error ? error.stack : null,
        stdioString,
        "Troubleshooting: https://remotion.dev/docs/troubleshooting/browser-launch"
      ].filter(truthy).join(`
`)));
    }
    function onTimeout() {
      cleanup();
      reject(new TimeoutError(`Timed out after ${timeout} ms while trying to connect to the browser! Chrome logged the following: ${stdioString}`));
    }
    function onStdIoData(data) {
      stdioString += data.toString("utf8");
      const match = stdioString.match(/DevTools listening on (ws:\/\/.*)/);
      if (!match) {
        return;
      }
      cleanup();
      resolve(match[1]);
    }
    function cleanup() {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      removeEventListeners(listeners);
    }
  });
}
function pidExists(pid) {
  try {
    return process.kill(pid, 0);
  } catch (error) {
    if (isErrnoException(error)) {
      if (error.code && error.code === "ESRCH") {
        return false;
      }
    }
    throw error;
  }
}

// src/browser/Target.ts
var isPagetTarget = (target) => {
  return target.type === "page" || target.type === "background_page" || target.type === "webview";
};

class Target {
  #browserContext;
  #targetInfo;
  #sessionFactory;
  #defaultViewport;
  #pagePromise;
  _initializedPromise;
  _initializedCallback;
  _isClosedPromise;
  _closedCallback;
  _isInitialized;
  _targetId;
  constructor(targetInfo, browserContext, sessionFactory, defaultViewport) {
    this.#targetInfo = targetInfo;
    this.#browserContext = browserContext;
    this._targetId = targetInfo.targetId;
    this.#sessionFactory = sessionFactory;
    this.#defaultViewport = defaultViewport;
    this._initializedPromise = new Promise((fulfill) => {
      this._initializedCallback = fulfill;
    }).then((success) => {
      if (!success) {
        return false;
      }
      const opener = this.opener();
      if (!opener || !opener.#pagePromise || this.type() !== "page") {
        return true;
      }
      return true;
    });
    this._isClosedPromise = new Promise((fulfill) => {
      this._closedCallback = fulfill;
    });
    this._isInitialized = !isPagetTarget(this.#targetInfo) || this.#targetInfo.url !== "";
    if (this._isInitialized) {
      this._initializedCallback(true);
    }
  }
  createCDPSession() {
    return this.#sessionFactory();
  }
  _getTargetInfo() {
    return this.#targetInfo;
  }
  async page({
    sourceMapGetter,
    logLevel,
    indent,
    pageIndex,
    onBrowserLog,
    onLog
  }) {
    if (isPagetTarget(this.#targetInfo) && !this.#pagePromise) {
      this.#pagePromise = this.#sessionFactory().then((client) => {
        return Page._create({
          client,
          target: this,
          defaultViewport: this.#defaultViewport ?? null,
          browser: this.browser(),
          sourceMapGetter,
          logLevel,
          indent,
          pageIndex,
          onBrowserLog,
          onLog
        });
      });
    }
    return await this.#pagePromise ?? null;
  }
  async expectPage() {
    return await this.#pagePromise ?? null;
  }
  url() {
    return this.#targetInfo.url;
  }
  type() {
    const { type } = this.#targetInfo;
    if (type === "page" || type === "background_page" || type === "service_worker" || type === "shared_worker" || type === "browser" || type === "webview") {
      return type;
    }
    return "other";
  }
  browser() {
    return this.#browserContext.browser();
  }
  browserContext() {
    return this.#browserContext;
  }
  opener() {
    const { openerId } = this.#targetInfo;
    if (!openerId) {
      return;
    }
    return this.browser()._targets.get(openerId);
  }
  _targetInfoChanged(targetInfo) {
    this.#targetInfo = targetInfo;
    if (!this._isInitialized && (!isPagetTarget(this.#targetInfo) || this.#targetInfo.url !== "")) {
      this._isInitialized = true;
      this._initializedCallback(true);
    }
  }
}

// src/browser/Browser.ts
class HeadlessBrowser extends EventEmitter {
  static async create({
    defaultViewport,
    timeout,
    userDataDir,
    args,
    executablePath,
    logLevel,
    indent
  }) {
    const runner = await makeBrowserRunner({
      executablePath,
      processArguments: args,
      userDataDir,
      indent,
      logLevel,
      timeout
    });
    const browser = new HeadlessBrowser({
      connection: runner.connection,
      defaultViewport,
      runner
    });
    await runner.connection.send("Target.setDiscoverTargets", { discover: true });
    return browser;
  }
  #defaultViewport;
  connection;
  #defaultContext;
  #contexts;
  #targets;
  id;
  runner;
  get _targets() {
    return this.#targets;
  }
  constructor({
    connection,
    defaultViewport,
    runner
  }) {
    super();
    this.#defaultViewport = defaultViewport;
    this.connection = connection;
    this.id = Math.random().toString(36).substring(2, 15);
    this.#defaultContext = new BrowserContext(this);
    this.#contexts = new Map;
    this.#targets = new Map;
    this.connection.on("Target.targetCreated", this.#targetCreated.bind(this));
    this.connection.on("Target.targetDestroyed", this.#targetDestroyed.bind(this));
    this.connection.on("Target.targetInfoChanged", this.#targetInfoChanged.bind(this));
    this.runner = runner;
  }
  browserContexts() {
    return [this.#defaultContext, ...Array.from(this.#contexts.values())];
  }
  async#targetCreated(event) {
    const { targetInfo } = event;
    const { browserContextId } = targetInfo;
    const context = browserContextId && this.#contexts.has(browserContextId) ? this.#contexts.get(browserContextId) : this.#defaultContext;
    if (!context) {
      throw new Error("Missing browser context");
    }
    const target = new Target(targetInfo, context, () => {
      return this.connection.createSession(targetInfo);
    }, this.#defaultViewport ?? null);
    assert(!this.#targets.has(event.targetInfo.targetId), "Target should not exist before targetCreated");
    this.#targets.set(event.targetInfo.targetId, target);
    if (await target._initializedPromise) {
      this.emit("targetcreated" /* TargetCreated */, target);
    }
  }
  #targetDestroyed(event) {
    const target = this.#targets.get(event.targetId);
    if (!target) {
      throw new Error(`Missing target in _targetDestroyed (id = ${event.targetId})`);
    }
    target._initializedCallback(false);
    this.#targets.delete(event.targetId);
    target._closedCallback();
  }
  #targetInfoChanged(event) {
    const target = this.#targets.get(event.targetInfo.targetId);
    if (!target) {
      throw new Error(`Missing target in targetInfoChanged (id = ${event.targetInfo.targetId})`);
    }
    const previousURL = target.url();
    const wasInitialized = target._isInitialized;
    target._targetInfoChanged(event.targetInfo);
    if (wasInitialized && previousURL !== target.url()) {
      this.emit("targetchanged" /* TargetChanged */, target);
    }
  }
  newPage({
    context,
    logLevel,
    indent,
    pageIndex,
    onBrowserLog,
    onLog
  }) {
    return this.#defaultContext.newPage({
      context,
      logLevel,
      indent,
      pageIndex,
      onBrowserLog,
      onLog
    });
  }
  async _createPageInContext({
    context,
    logLevel,
    indent,
    pageIndex,
    onBrowserLog,
    onLog
  }) {
    const {
      value: { targetId }
    } = await this.connection.send("Target.createTarget", {
      url: "about:blank",
      browserContextId: undefined
    });
    const target = this.#targets.get(targetId);
    if (!target) {
      throw new Error(`Missing target for page (id = ${targetId})`);
    }
    const initialized = await target._initializedPromise;
    if (!initialized) {
      throw new Error(`Failed to create target for page (id = ${targetId})`);
    }
    const page = await target.page({
      sourceMapGetter: context,
      logLevel,
      indent,
      pageIndex,
      onBrowserLog,
      onLog
    });
    if (!page) {
      throw new Error(`Failed to create a page for context`);
    }
    return page;
  }
  targets() {
    return Array.from(this.#targets.values()).filter((target) => {
      return target._isInitialized;
    });
  }
  async waitForTarget(predicate, options = {}) {
    const { timeout = 30000 } = options;
    let resolve;
    let isResolved = false;
    const targetPromise = new Promise((x) => {
      resolve = x;
    });
    this.on("targetcreated" /* TargetCreated */, check);
    this.on("targetchanged" /* TargetChanged */, check);
    try {
      if (!timeout) {
        return await targetPromise;
      }
      this.targets().forEach(check);
      return await waitWithTimeout(targetPromise, "target", timeout, this);
    } finally {
      this.off("targetcreated" /* TargetCreated */, check);
      this.off("targetchanged" /* TargetChanged */, check);
    }
    async function check(target) {
      if (await predicate(target) && !isResolved) {
        isResolved = true;
        resolve(target);
      }
    }
  }
  async pages() {
    const contextPages = await Promise.all(this.browserContexts().map((context) => {
      return context.pages();
    }));
    return contextPages.reduce((acc, x) => {
      return acc.concat(x);
    }, []);
  }
  async close({ silent }) {
    await this.runner.closeProcess();
    (await this.pages()).forEach((page) => {
      page.emit("disposed" /* Disposed */);
      page.closed = true;
    });
    this.disconnect();
    this.emit(silent ? "closed-silent" /* ClosedSilent */ : "closed" /* Closed */);
  }
  disconnect() {
    this.connection.dispose();
  }
}

class BrowserContext extends EventEmitter {
  #browser;
  constructor(browser) {
    super();
    this.#browser = browser;
  }
  targets() {
    return this.#browser.targets().filter((target) => {
      return target.browserContext() === this;
    });
  }
  waitForTarget(predicate, options = {}) {
    return this.#browser.waitForTarget((target) => {
      return target.browserContext() === this && predicate(target);
    }, options);
  }
  async pages() {
    const pages = await Promise.all(this.targets().filter((target) => target.type() === "page").map((target) => target.expectPage()));
    return pages.filter((page) => {
      return Boolean(page);
    });
  }
  newPage({
    context,
    logLevel,
    indent,
    pageIndex,
    onBrowserLog,
    onLog
  }) {
    return this.#browser._createPageInContext({
      context,
      logLevel,
      indent,
      pageIndex,
      onBrowserLog,
      onLog
    });
  }
  browser() {
    return this.#browser;
  }
}

// src/call-ffmpeg.ts
import { spawn as spawn2 } from "node:child_process";
import path5 from "path";
import execa from "execa";

// src/compositor/get-executable-path.ts
import path4 from "path";
var warned = false;
function isMusl({
  indent,
  logLevel
}) {
  if (!process.report && typeof Bun !== "undefined") {
    if (!warned) {
      Log.warn({ indent, logLevel }, "Bun limitation: Could not determine if your Linux is using musl or glibc. Assuming glibc.");
    }
    warned = true;
    return false;
  }
  const report = process.report?.getReport();
  if (report && typeof report === "string") {
    if (!warned) {
      Log.warn({ indent, logLevel }, "Bun limitation: Could not determine if your Windows is using musl or glibc. Assuming glibc.");
    }
    warned = true;
    return false;
  }
  const { glibcVersionRuntime } = report.header;
  return !glibcVersionRuntime;
}
var getExecutablePath = ({
  indent,
  logLevel,
  type,
  binariesDirectory
}) => {
  const base = binariesDirectory ?? getExecutableDir(indent, logLevel);
  switch (type) {
    case "compositor":
      if (process.platform === "win32") {
        return path4.resolve(base, "remotion.exe");
      }
      return path4.resolve(base, "remotion");
    case "ffmpeg":
      if (process.platform === "win32") {
        return path4.join(base, "ffmpeg.exe");
      }
      return path4.join(base, "ffmpeg");
    case "ffprobe":
      if (process.platform === "win32") {
        return path4.join(base, "ffprobe.exe");
      }
      return path4.join(base, "ffprobe");
    default:
      throw new Error(`Unknown executable type: ${type}`);
  }
};
var getExecutableDir = (indent, logLevel) => {
  switch (process.platform) {
    case "win32":
      switch (process.arch) {
        case "x64":
          return __require("@remotion/compositor-win32-x64-msvc").dir;
        default:
          throw new Error(`Unsupported architecture on Windows: ${process.arch}`);
      }
    case "darwin":
      switch (process.arch) {
        case "x64":
          return __require("@remotion/compositor-darwin-x64").dir;
        case "arm64":
          return __require("@remotion/compositor-darwin-arm64").dir;
        default:
          throw new Error(`Unsupported architecture on macOS: ${process.arch}`);
      }
    case "linux": {
      const musl = isMusl({ indent, logLevel });
      switch (process.arch) {
        case "x64":
          if (musl) {
            return __require("@remotion/compositor-linux-x64-musl").dir;
          }
          return __require("@remotion/compositor-linux-x64-gnu").dir;
        case "arm64":
          if (musl) {
            return __require("@remotion/compositor-linux-arm64-musl").dir;
          }
          return __require("@remotion/compositor-linux-arm64-gnu").dir;
        default:
          throw new Error(`Unsupported architecture on Linux: ${process.arch}`);
      }
    }
    default:
      throw new Error(`Unsupported OS: ${process.platform}, architecture: ${process.arch}`);
  }
};

// src/compositor/get-explicit-env.ts
var getExplicitEnv = (cwd) => {
  return process.platform === "darwin" ? {
    DYLD_LIBRARY_PATH: cwd
  } : undefined;
};

// src/compositor/make-file-executable.ts
import { accessSync, chmodSync, constants, statSync } from "node:fs";
var hasPermissions = (p) => {
  if (process.platform !== "linux" && process.platform !== "darwin") {
    try {
      accessSync(p, constants.X_OK);
      return true;
    } catch {
      return false;
    }
  }
  const stats = statSync(p);
  const { mode } = stats;
  const othersHaveExecutePermission = Boolean(mode & 1);
  if (othersHaveExecutePermission) {
    return true;
  }
  if (!process.getuid || !process.getgid) {
    throw new Error("Cannot check permissions on Linux without process.getuid and process.getgid");
  }
  const uid = process.getuid();
  const gid = process.getgid();
  const isOwner = uid === stats.uid;
  const isGroup = gid === stats.gid;
  const ownerHasExecutePermission = Boolean(mode & 64);
  const groupHasExecutePermission = Boolean(mode & 8);
  const canExecute = isOwner && ownerHasExecutePermission || isGroup && groupHasExecutePermission;
  return canExecute;
};
var makeFileExecutableIfItIsNot = (path5) => {
  const hasPermissionsResult = hasPermissions(path5);
  if (!hasPermissionsResult) {
    chmodSync(path5, 493);
  }
};

// src/call-ffmpeg.ts
var callFf = ({
  args,
  bin,
  indent,
  logLevel,
  options,
  binariesDirectory,
  cancelSignal
}) => {
  const executablePath = getExecutablePath({
    type: bin,
    indent,
    logLevel,
    binariesDirectory
  });
  makeFileExecutableIfItIsNot(executablePath);
  const cwd = path5.dirname(executablePath);
  const task = execa(executablePath, args.filter(truthy), {
    cwd,
    env: getExplicitEnv(cwd),
    ...options
  });
  cancelSignal?.(() => {
    task.kill();
  });
  return task;
};
var callFfNative = ({
  args,
  bin,
  indent,
  logLevel,
  options,
  binariesDirectory,
  cancelSignal
}) => {
  const executablePath = getExecutablePath({
    type: bin,
    indent,
    logLevel,
    binariesDirectory
  });
  makeFileExecutableIfItIsNot(executablePath);
  const cwd = path5.dirname(executablePath);
  const task = spawn2(executablePath, args.filter(truthy), {
    cwd,
    env: getExplicitEnv(cwd),
    ...options
  });
  cancelSignal?.(() => {
    task.kill();
  });
  return task;
};

// src/is-audio-codec.ts
var isAudioCodec = (codec) => {
  return codec === "mp3" || codec === "aac" || codec === "wav";
};

// src/can-use-parallel-encoding.ts
var canUseParallelEncoding = (codec) => {
  if (getShouldUsePartitionedRendering()) {
    return false;
  }
  if (isAudioCodec(codec)) {
    return false;
  }
  return codec === "h264" || codec === "h264-mkv" || codec === "h265";
};
var getShouldUsePartitionedRendering = () => {
  const shouldUsePartitionedRendering = process.env.REMOTION_PARTITIONED_RENDERING === "true";
  return shouldUsePartitionedRendering;
};

// src/check-version-requirements.ts
import { NoReactInternals as NoReactInternals3 } from "remotion/no-react";
var getRequiredLibCVersion = () => {
  if (process.platform !== "linux") {
    return null;
  }
  if (isMusl({ indent: false, logLevel: "warn" })) {
    return null;
  }
  if (process.arch === "arm64") {
    return [2, 26];
  }
  return [2, 31];
};
var required = getRequiredLibCVersion();
var gLibCErrorMessage = (libCString) => {
  if (required === null) {
    return null;
  }
  const split = libCString.split(".");
  if (split.length !== 2) {
    return null;
  }
  if (split[0] === String(required[0]) && Number(split[1]) >= required[1]) {
    return null;
  }
  if (Number(split[0]) > required[0]) {
    return null;
  }
  return `Rendering videos requires glibc ${required.join(".")} on your or higher on your OS. Your system has glibc ${libCString}.`;
};
var checkLibCRequirement = (logLevel, indent) => {
  if (process.platform === "win32" || process.platform === "darwin") {
    return;
  }
  const { report } = process;
  if (report) {
    const rep = report.getReport();
    if (typeof rep === "string") {
      Log.warn({ logLevel, indent }, "Bun limitation: process.report.getReport() " + rep);
      return;
    }
    const { glibcVersionRuntime } = rep.header;
    if (!glibcVersionRuntime) {
      return;
    }
    const error = gLibCErrorMessage(glibcVersionRuntime);
    if (error) {
      Log.warn({ logLevel, indent }, error);
    }
  }
};
var checkNodeVersion = () => {
  const version = process.version.replace("v", "").split(".");
  const majorVersion = Number(version[0]);
  if (majorVersion < NoReactInternals3.MIN_NODE_VERSION) {
    throw new Error(`Remotion requires at least Node ${NoReactInternals3.MIN_NODE_VERSION}. You currently have ${process.version}. Update your node version to ${NoReactInternals3.MIN_NODE_VERSION} to use Remotion.`);
  }
};
var checkBunVersion = () => {
  if (!Bun.semver.satisfies(Bun.version, `>=${NoReactInternals3.MIN_BUN_VERSION}`)) {
    throw new Error(`Remotion requires at least Bun ${NoReactInternals3.MIN_BUN_VERSION}. You currently have ${Bun.version}. Update your Bun version to ${NoReactInternals3.MIN_BUN_VERSION} to use Remotion.`);
  }
};
var checkRuntimeVersion = (logLevel, indent) => {
  if (typeof Bun === "undefined") {
    checkNodeVersion();
  } else {
    checkBunVersion();
  }
  checkLibCRequirement(logLevel, indent);
};

// src/codec.ts
var validCodecs = [
  "h264",
  "h265",
  "vp8",
  "vp9",
  "mp3",
  "aac",
  "wav",
  "prores",
  "h264-mkv",
  "h264-ts",
  "gif"
];
var DEFAULT_CODEC = "h264";

// src/convert-to-positive-frame-index.ts
var convertToPositiveFrameIndex = ({
  frame,
  durationInFrames
}) => {
  return frame < 0 ? durationInFrames + frame : frame;
};

// src/symbolicate-stacktrace.ts
import { readFileSync } from "fs";
import path6 from "path";
import { SourceMapConsumer } from "source-map";
function extractSourceMapUrl(fileContents) {
  const regex = /\/\/[#@] ?sourceMappingURL=([^\s'"]+)\s*$/gm;
  let match = null;
  for (;; ) {
    const next = regex.exec(fileContents);
    if (next === null || next === undefined) {
      break;
    }
    match = next;
  }
  if (!match?.[1]) {
    return null;
  }
  return match[1].toString();
}
var getSourceMapFromRemoteUrl = async (url) => {
  if (!url.endsWith(".js.map")) {
    return Promise.reject(new Error(`The URL ${url} does not seem to be a valid source map URL.`));
  }
  const obj = await fetchUrl(url);
  return new SourceMapConsumer(obj);
};
var getSourceMap = (filePath, fileContents, type) => {
  const sm = extractSourceMapUrl(fileContents);
  if (sm === null) {
    return Promise.resolve(null);
  }
  if (sm.indexOf("data:") === 0) {
    const base64 = /^data:application\/json;([\w=:"-]+;)*base64,/;
    const match2 = sm.match(base64);
    if (!match2) {
      throw new Error("Sorry, non-base64 inline source-map encoding is not supported.");
    }
    const converted = window.atob(sm.substring(match2[0].length));
    try {
      const sourceMapConsumer = new SourceMapConsumer(JSON.parse(converted));
      return Promise.resolve(sourceMapConsumer);
    } catch {
      return Promise.resolve(null);
    }
  }
  if (type === "local") {
    const newFilePath = path6.join(path6.dirname(filePath), sm);
    return Promise.resolve(new SourceMapConsumer(readFileSync(newFilePath, "utf8")));
  }
  const index = filePath.lastIndexOf("/");
  const url = filePath.substring(0, index + 1) + sm;
  return getSourceMapFromRemoteUrl(url);
};
var fetchUrl = async (url) => {
  const { request, response } = await readFile(url);
  return new Promise((resolve, reject) => {
    let downloaded = "";
    response.on("data", (d) => {
      downloaded += d;
    });
    response.on("end", () => {
      request.destroy();
      response.destroy();
      resolve(downloaded);
    });
    response.on("error", (err) => {
      request.destroy();
      response.destroy();
      return reject(err);
    });
  });
};
function getLinesAround(line, count, lines) {
  const result = [];
  for (let index = Math.max(0, line - 1 - count) + 1;index <= Math.min(lines.length - 1, line - 1 + count); ++index) {
    result.push({
      lineNumber: index + 1,
      content: lines[index],
      highlight: index + 1 === line
    });
  }
  return result;
}
var getOriginalPosition = (source_map, line, column) => {
  const result = source_map.originalPositionFor({
    line,
    column
  });
  return { line: result.line, column: result.column, source: result.source };
};
var symbolicateStackTraceFromRemoteFrames = async (frames) => {
  const uniqueFileNames = [
    ...new Set(frames.map((f) => f.fileName).filter((f) => f.startsWith("http://") || f.startsWith("https://")).filter(truthy))
  ];
  const maps = await Promise.all(uniqueFileNames.map((fileName) => {
    return getSourceMapFromRemoteFile(fileName);
  }));
  const mapValues = {};
  for (let i = 0;i < uniqueFileNames.length; i++) {
    mapValues[uniqueFileNames[i]] = maps[i];
  }
  return symbolicateFromSources(frames, mapValues);
};
var symbolicateFromSources = (frames, mapValues) => {
  return frames.map((frame) => {
    const map = mapValues[frame.fileName];
    if (!map) {
      return null;
    }
    return symbolicateStackFrame(frame, map);
  }).filter(truthy).filter((f) => f.originalScriptCode !== null);
};
var symbolicateStackFrame = (frame, map) => {
  const pos = getOriginalPosition(map, frame.lineNumber, frame.columnNumber);
  const hasSource = pos.source ? map.sourceContentFor(pos.source, false) : null;
  const scriptCode = hasSource && pos.line ? getLinesAround(pos.line, 3, hasSource.split(`
`)) : null;
  return {
    originalColumnNumber: pos.column,
    originalFileName: pos.source,
    originalFunctionName: frame.functionName,
    originalLineNumber: pos.line,
    originalScriptCode: scriptCode
  };
};
var getSourceMapFromRemoteFile = async (fileName) => {
  const fileContents = await fetchUrl(fileName);
  return getSourceMap(fileName, fileContents, "remote");
};
var getSourceMapFromLocalFile = (fileName) => {
  const fileContents = readFileSync(fileName, "utf8");
  return getSourceMap(fileName, fileContents, "local");
};

// src/error-handling/handle-javascript-exception.ts
import { NoReactInternals as NoReactInternals5 } from "remotion/no-react";

// src/delay-render-embedded-stack.ts
import { NoReactInternals as NoReactInternals4 } from "remotion/no-react";

// src/parse-browser-error-stack.ts
var regexValidFrame_Chrome = /^\s*(at|in)\s.+(:\d+)/;
var regexValidFrame_FireFox = /(^|@)\S+:\d+|.+line\s+\d+\s+>\s+(eval|Function).+/;
var regexExtractLocation = /\(?(.+?)(?::(\d+))?(?::(\d+))?\)?$/;
function extractLocation(token) {
  const execed = regexExtractLocation.exec(token);
  if (!execed) {
    throw new Error("Could not match in extractLocation");
  }
  return execed.slice(1).map((v) => {
    const p = Number(v);
    if (!isNaN(p)) {
      return p;
    }
    return v;
  });
}
var makeStackFrame = ({
  functionName,
  fileName,
  lineNumber,
  columnNumber
}) => {
  if (functionName && functionName.indexOf("Object.") === 0) {
    functionName = functionName.slice("Object.".length);
  }
  if (functionName === "friendlySyntaxErrorLabel" || functionName === "exports.__esModule" || functionName === "<anonymous>" || !functionName) {
    functionName = null;
  }
  return {
    columnNumber,
    fileName,
    functionName,
    lineNumber
  };
};
var parseStack = (stack) => {
  const frames = stack.filter((e) => regexValidFrame_Chrome.test(e) || regexValidFrame_FireFox.test(e)).map((e) => {
    if (regexValidFrame_FireFox.test(e)) {
      let isEval = false;
      if (/ > (eval|Function)/.test(e)) {
        e = e.replace(/ line (\d+)(?: > eval line \d+)* > (eval|Function):\d+:\d+/g, ":$1");
        isEval = true;
      }
      const _data = e.split(/[@]/g);
      const _last = _data.pop();
      if (!_last) {
        throw new Error("could not get last");
      }
      const [_fileName, _lineNumber, _columnNumber] = extractLocation(_last);
      return makeStackFrame({
        functionName: _data.join("@") || (isEval ? "eval" : null),
        fileName: _fileName,
        lineNumber: _lineNumber,
        columnNumber: _columnNumber
      });
    }
    if (e.indexOf("(eval ") !== -1) {
      e = e.replace(/(\(eval at [^()]*)|(\),.*$)/g, "");
    }
    if (e.indexOf("(at ") !== -1) {
      e = e.replace(/\(at /, "(");
    }
    const data = e.trim().split(/\s+/g).slice(1);
    const last = data.pop();
    if (!last) {
      throw new Error("could not get last");
    }
    const [fileName, lineNumber, columnNumber] = extractLocation(last);
    return makeStackFrame({
      functionName: data.join(" ") || null,
      fileName,
      lineNumber,
      columnNumber
    });
  });
  return frames;
};

// src/delay-render-embedded-stack.ts
var parseDelayRenderEmbeddedStack = (message) => {
  const index = message.indexOf(NoReactInternals4.DELAY_RENDER_CALLSTACK_TOKEN);
  if (index === -1) {
    return null;
  }
  const msg = message.substring(index + NoReactInternals4.DELAY_RENDER_CALLSTACK_TOKEN.length).trim();
  const parsed = parseStack(msg.split(`
`));
  return parsed;
};

// src/error-handling/symbolicateable-error.ts
class SymbolicateableError extends Error {
  stackFrame;
  delayRenderCall;
  frame;
  chunk;
  constructor({
    message,
    stack,
    stackFrame,
    frame,
    name,
    chunk
  }) {
    super(message);
    this.stack = stack;
    this.stackFrame = stackFrame;
    this.frame = frame;
    this.chunk = chunk;
    this.name = name;
    this.delayRenderCall = stack ? parseDelayRenderEmbeddedStack(stack) : null;
  }
}

// src/error-handling/handle-javascript-exception.ts
class ErrorWithStackFrame extends Error {
  symbolicatedStackFrames;
  frame;
  chunk;
  name;
  delayRenderCall;
  constructor({
    message,
    symbolicatedStackFrames,
    frame,
    name,
    delayRenderCall,
    stack,
    chunk
  }) {
    super(message);
    this.symbolicatedStackFrames = symbolicatedStackFrames;
    this.frame = frame;
    this.chunk = chunk;
    this.name = name;
    this.delayRenderCall = delayRenderCall;
    this.stack = stack;
  }
}
var cleanUpErrorMessage = (exception) => {
  let errorMessage = exception.exceptionDetails.exception?.description;
  if (!errorMessage) {
    return null;
  }
  const errorType = exception.exceptionDetails.exception?.className;
  const prefix = `${errorType}: `;
  if (errorMessage.startsWith(prefix)) {
    errorMessage = errorMessage.substring(prefix.length);
  }
  const frames = exception.exceptionDetails.stackTrace?.callFrames.length ?? 0;
  const split = errorMessage.split(`
`);
  return split.slice(0, Math.max(1, split.length - frames)).join(`
`);
};
var removeDelayRenderStack = (message) => {
  const index = message.indexOf(NoReactInternals5.DELAY_RENDER_CALLSTACK_TOKEN);
  if (index === -1) {
    return message;
  }
  return message.substring(0, index);
};
var callFrameToStackFrame = (callFrame) => {
  return {
    columnNumber: callFrame.columnNumber,
    fileName: callFrame.url,
    functionName: callFrame.functionName,
    lineNumber: callFrame.lineNumber
  };
};
var handleJavascriptException = ({
  page,
  onError,
  frame
}) => {
  const client = page._client();
  const handler = (exception) => {
    const rawErrorMessage = exception.exceptionDetails.exception?.description;
    const cleanErrorMessage = cleanUpErrorMessage(exception);
    if (!cleanErrorMessage) {
      console.error(exception);
      const err = new Error(rawErrorMessage);
      err.stack = rawErrorMessage;
      onError(err);
      return;
    }
    if (!exception.exceptionDetails.stackTrace) {
      const err = new Error(removeDelayRenderStack(cleanErrorMessage));
      err.stack = rawErrorMessage;
      onError(err);
      return;
    }
    const errorType = exception.exceptionDetails.exception?.className;
    const symbolicatedErr = new SymbolicateableError({
      message: removeDelayRenderStack(cleanErrorMessage),
      stackFrame: exception.exceptionDetails.stackTrace.callFrames.map((f) => callFrameToStackFrame(f)),
      frame,
      name: errorType,
      stack: exception.exceptionDetails.exception?.description,
      chunk: null
    });
    onError(symbolicatedErr);
  };
  client.on("Runtime.exceptionThrown", handler);
  return () => {
    client.off("Runtime.exceptionThrown", handler);
    return Promise.resolve();
  };
};

// src/error-handling/symbolicate-error.ts
var symbolicateError = async (symbolicateableError) => {
  const { delayRenderCall, stackFrame } = symbolicateableError;
  const [mainErrorFrames, delayRenderFrames] = await Promise.all([
    stackFrame ? symbolicateStackTraceFromRemoteFrames(stackFrame) : null,
    delayRenderCall ? symbolicateStackTraceFromRemoteFrames(delayRenderCall) : null
  ].filter(truthy));
  const symbolicatedErr = new ErrorWithStackFrame({
    message: symbolicateableError.message,
    symbolicatedStackFrames: mainErrorFrames,
    frame: symbolicateableError.frame,
    name: symbolicateableError.name,
    delayRenderCall: delayRenderFrames,
    stack: symbolicateableError.stack,
    chunk: symbolicateableError.chunk
  });
  return symbolicatedErr;
};

// src/file-extensions.ts
var defaultFileExtensionMap = {
  "h264-mkv": {
    default: "mkv",
    forAudioCodec: {
      "pcm-16": { possible: ["mkv"], default: "mkv" },
      mp3: { possible: ["mkv"], default: "mkv" }
    }
  },
  "h264-ts": {
    default: "ts",
    forAudioCodec: {
      "pcm-16": { possible: ["ts"], default: "ts" },
      aac: { possible: ["ts"], default: "ts" }
    }
  },
  aac: {
    default: "aac",
    forAudioCodec: {
      aac: {
        possible: ["aac", "3gp", "m4a", "m4b", "mpg", "mpeg"],
        default: "aac"
      },
      "pcm-16": {
        possible: ["wav"],
        default: "wav"
      }
    }
  },
  gif: {
    default: "gif",
    forAudioCodec: {}
  },
  h264: {
    default: "mp4",
    forAudioCodec: {
      "pcm-16": { possible: ["mkv", "mov"], default: "mkv" },
      aac: { possible: ["mp4", "mkv", "mov"], default: "mp4" },
      mp3: { possible: ["mp4", "mkv", "mov"], default: "mp4" }
    }
  },
  h265: {
    default: "mp4",
    forAudioCodec: {
      aac: { possible: ["mp4", "mkv", "hevc"], default: "mp4" },
      "pcm-16": { possible: ["mkv"], default: "mkv" }
    }
  },
  mp3: {
    default: "mp3",
    forAudioCodec: {
      mp3: { possible: ["mp3"], default: "mp3" },
      "pcm-16": { possible: ["wav"], default: "wav" }
    }
  },
  prores: {
    default: "mov",
    forAudioCodec: {
      aac: { possible: ["mov", "mkv", "mxf"], default: "mov" },
      "pcm-16": { possible: ["mov", "mkv", "mxf"], default: "mov" }
    }
  },
  vp8: {
    default: "webm",
    forAudioCodec: {
      "pcm-16": { possible: ["mkv"], default: "mkv" },
      opus: { possible: ["webm"], default: "webm" }
    }
  },
  vp9: {
    default: "webm",
    forAudioCodec: {
      "pcm-16": { possible: ["mkv"], default: "mkv" },
      opus: { possible: ["webm"], default: "webm" }
    }
  },
  wav: {
    default: "wav",
    forAudioCodec: {
      "pcm-16": { possible: ["wav"], default: "wav" }
    }
  }
};

// src/frame-range.ts
var validateFrameRange = (frameRange) => {
  if (frameRange === null) {
    return;
  }
  if (typeof frameRange === "number") {
    if (frameRange < 0) {
      throw new TypeError("Frame must be a non-negative number, got " + frameRange);
    }
    if (!Number.isFinite(frameRange)) {
      throw new TypeError("Frame must be a finite number, got " + frameRange);
    }
    if (!Number.isInteger(frameRange)) {
      throw new Error(`Frame must be an integer, but got a float (${frameRange})`);
    }
    return;
  }
  if (Array.isArray(frameRange)) {
    if (frameRange.length !== 2) {
      throw new TypeError("Frame range must be a tuple, got an array with length " + frameRange.length);
    }
    const [first, second] = frameRange;
    if (typeof first !== "number") {
      throw new Error(`The first value of frame range must be a number, but got ${typeof first} (${JSON.stringify(first)})`);
    }
    if (!Number.isFinite(first)) {
      throw new TypeError("The first value of frame range must be finite, but got " + first);
    }
    if (!Number.isInteger(first)) {
      throw new Error(`The first value of frame range must be an integer, but got a float (${first})`);
    }
    if (first < 0) {
      throw new Error(`The first value of frame range must be non-negative, but got ${first}`);
    }
    if (second === null) {
      return;
    }
    if (typeof second !== "number") {
      throw new Error(`The second value of frame range must be a number or null, but got ${typeof second} (${JSON.stringify(second)})`);
    }
    if (!Number.isFinite(second)) {
      throw new TypeError("The second value of frame range must be finite, but got " + second);
    }
    if (!Number.isInteger(second)) {
      throw new Error(`The second value of frame range must be an integer, but got a float (${second})`);
    }
    if (second < 0) {
      throw new Error(`The second value of frame range must be non-negative, but got ${second}`);
    }
    if (second < first) {
      throw new Error("The second value of frame range must be not smaller than the first one, but got " + frameRange.join("-"));
    }
    return;
  }
  throw new TypeError("Frame range must be a number or a tuple of numbers, but got object of type " + typeof frameRange);
};

// src/get-compositions.ts
import { NoReactInternals as NoReactInternals8 } from "remotion/no-react";

// src/to-megabytes.ts
function toMegabytes(bytes) {
  const mb = bytes / 1024 / 1024;
  return `${Math.round(mb * 10) / 10} Mb`;
}

// src/browser/browser-download-progress-bar.ts
var defaultBrowserDownloadProgress = ({
  indent,
  logLevel,
  api
}) => ({ chromeMode }) => {
  if (chromeMode === "chrome-for-testing") {
    Log.info({ indent, logLevel }, "Downloading Chrome for Testing https://www.remotion.dev/chrome-for-testing");
  } else {
    Log.info({ indent, logLevel }, "Downloading Chrome Headless Shell https://www.remotion.dev/chrome-headless-shell");
  }
  Log.info({ indent, logLevel }, `Customize this behavior by adding a onBrowserDownload function to ${api}.`);
  let lastProgress = 0;
  return {
    onProgress: (progress) => {
      if (progress.downloadedBytes > lastProgress + 1e7 || progress.percent === 1) {
        lastProgress = progress.downloadedBytes;
        if (chromeMode === "chrome-for-testing") {
          Log.info({ indent, logLevel }, `Downloading Chrome for Testing - ${toMegabytes(progress.downloadedBytes)}/${toMegabytes(progress.totalSizeInBytes)}`);
        } else {
          Log.info({ indent, logLevel }, `Downloading Chrome Headless Shell - ${toMegabytes(progress.downloadedBytes)}/${toMegabytes(progress.totalSizeInBytes)}`);
        }
      }
    },
    version: null
  };
};

// src/default-on-log.ts
var defaultOnLog = ({ logLevel, tag, previewString }) => {
  Log[logLevel]({ logLevel, tag, indent: false }, previewString);
};

// src/open-browser.ts
import fs10 from "node:fs";
import os5 from "node:os";
import path9 from "node:path";

// src/browser/Launcher.ts
var launchChrome = async ({
  args,
  executablePath,
  defaultViewport,
  indent,
  logLevel,
  userDataDir,
  timeout
}) => {
  const browser = await HeadlessBrowser.create({
    defaultViewport,
    args,
    executablePath,
    timeout,
    userDataDir,
    logLevel,
    indent
  });
  try {
    await browser.waitForTarget((t) => {
      return t.type() === "page";
    }, { timeout });
  } catch (error) {
    await browser.close({ silent: false });
    throw error;
  }
  return browser;
};

// src/ensure-browser.ts
import fs8 from "fs";

// src/browser/BrowserFetcher.ts
import * as fs7 from "node:fs";
import * as os3 from "node:os";
import * as path8 from "node:path";
import { promisify } from "node:util";
import extractZip from "extract-zip";

// src/browser/get-chrome-download-url.ts
import * as fs5 from "node:fs";
import * as os2 from "node:os";
var TESTED_VERSION = "144.0.7559.20";
var PLAYWRIGHT_VERSION = "1207";
var isAmazonLinux2023 = () => {
  if (os2.platform() !== "linux") {
    return false;
  }
  try {
    const osRelease = fs5.readFileSync("/etc/os-release", "utf-8");
    return osRelease.includes("Amazon Linux") && osRelease.includes('VERSION="2023"');
  } catch {
    return false;
  }
};
var MINIMUM_GLIBC_FOR_REMOTION_MEDIA = [2, 35];
var getGlibcVersion = () => {
  if (process.platform !== "linux") {
    return null;
  }
  const { report } = process;
  if (!report) {
    return null;
  }
  const rep = report.getReport();
  if (typeof rep === "string") {
    return null;
  }
  const { glibcVersionRuntime } = rep.header;
  if (!glibcVersionRuntime) {
    return null;
  }
  const split = glibcVersionRuntime.split(".");
  if (split.length !== 2) {
    return null;
  }
  return [Number(split[0]), Number(split[1])];
};
var isGlibcVersionAtLeast = (required2) => {
  const version = getGlibcVersion();
  if (version === null) {
    return false;
  }
  const [major, minor] = version;
  const [reqMajor, reqMinor] = required2;
  if (major > reqMajor) {
    return true;
  }
  if (major === reqMajor && minor >= reqMinor) {
    return true;
  }
  return false;
};
var canUseRemotionMediaBinaries = () => {
  if (process.platform !== "linux") {
    return false;
  }
  return isGlibcVersionAtLeast(MINIMUM_GLIBC_FOR_REMOTION_MEDIA);
};
function getChromeDownloadUrl({
  platform: platform2,
  version,
  chromeMode
}) {
  if (platform2 === "linux-arm64") {
    if (isAmazonLinux2023() && chromeMode === "headless-shell" && !version) {
      return "https://remotion.media/chromium-headless-shell-amazon-linux-arm64-144.0.7559.20.zip";
    }
    if (chromeMode === "chrome-for-testing") {
      return `https://playwright.azureedge.net/builds/chromium/${version ?? PLAYWRIGHT_VERSION}/chromium-linux-arm64.zip`;
    }
    if (version) {
      return `https://playwright.azureedge.net/builds/chromium/${version}/chromium-headless-shell-linux-arm64.zip`;
    }
    if (canUseRemotionMediaBinaries()) {
      return `https://remotion.media/chromium-headless-shell-linux-arm64-${TESTED_VERSION}.zip?clearcache`;
    }
    return `https://playwright.azureedge.net/builds/chromium/${PLAYWRIGHT_VERSION}/chromium-headless-shell-linux-arm64.zip`;
  }
  if (chromeMode === "headless-shell") {
    if (isAmazonLinux2023() && platform2 === "linux64" && !version) {
      return `https://remotion.media/chromium-headless-shell-amazon-linux-x64-144.0.7559.20.zip`;
    }
    if (platform2 === "linux64" && version === null) {
      if (canUseRemotionMediaBinaries()) {
        return `https://remotion.media/chromium-headless-shell-linux-x64-${TESTED_VERSION}.zip?clearcache`;
      }
      return `https://storage.googleapis.com/chrome-for-testing-public/${TESTED_VERSION}/${platform2}/chrome-headless-shell-${platform2}.zip`;
    }
    return `https://storage.googleapis.com/chrome-for-testing-public/${version ?? TESTED_VERSION}/${platform2}/chrome-headless-shell-${platform2}.zip`;
  }
  return `https://storage.googleapis.com/chrome-for-testing-public/${version ?? TESTED_VERSION}/${platform2}/chrome-${platform2}.zip`;
}
var logDownloadUrl = ({
  url,
  logLevel,
  indent
}) => {
  Log.info({ indent, logLevel }, `Downloading from: ${url}`);
};

// src/browser/get-download-destination.ts
import fs6 from "node:fs";
import path7 from "node:path";
var getDownloadsCacheDir = () => {
  const cwd = process.cwd();
  let dir = cwd;
  for (;; ) {
    try {
      if (fs6.statSync(path7.join(dir, "package.json")).isFile()) {
        break;
      }
    } catch (e) {}
    const parent = path7.dirname(dir);
    if (dir === parent) {
      dir = undefined;
      break;
    }
    dir = parent;
  }
  if (!dir) {
    return path7.resolve(cwd, ".remotion");
  }
  if (process.versions.pnp === "1") {
    return path7.resolve(dir, ".pnp/.remotion");
  }
  if (process.versions.pnp === "3") {
    return path7.resolve(dir, ".yarn/.remotion");
  }
  return path7.resolve(dir, "node_modules/.remotion");
};

// src/browser/BrowserFetcher.ts
var mkdirAsync = fs7.promises.mkdir;
var unlinkAsync = promisify(fs7.unlink.bind(fs7));
function existsAsync(filePath) {
  return new Promise((resolve2) => {
    fs7.access(filePath, (err) => {
      return resolve2(!err);
    });
  });
}
var getPlatform = () => {
  const platform3 = os3.platform();
  switch (platform3) {
    case "darwin":
      return os3.arch() === "arm64" ? "mac-arm64" : "mac-x64";
    case "linux":
      return os3.arch() === "arm64" ? "linux-arm64" : "linux64";
    case "win32":
      return "win64";
    default:
      throw new Error("Unsupported platform: " + platform3);
  }
};
var getDownloadsFolder = (chromeMode) => {
  const destination = chromeMode === "headless-shell" ? "chrome-headless-shell" : "chrome-for-testing";
  return path8.join(getDownloadsCacheDir(), destination);
};
var getVersionFilePath = (chromeMode) => {
  const downloadsFolder = getDownloadsFolder(chromeMode);
  return path8.join(downloadsFolder, "VERSION");
};
var getExpectedVersion = (version, _chromeMode) => {
  if (version) {
    return version;
  }
  return TESTED_VERSION;
};
var readVersionFile = (chromeMode) => {
  const versionFilePath = getVersionFilePath(chromeMode);
  try {
    return fs7.readFileSync(versionFilePath, "utf-8").trim();
  } catch {
    return null;
  }
};
var writeVersionFile = (chromeMode, version) => {
  const versionFilePath = getVersionFilePath(chromeMode);
  fs7.writeFileSync(versionFilePath, version);
};
var downloadBrowser = async ({
  logLevel,
  indent,
  onProgress,
  version,
  chromeMode
}) => {
  const platform3 = getPlatform();
  const downloadURL = getChromeDownloadUrl({ platform: platform3, version, chromeMode });
  const fileName = downloadURL.split("/").pop();
  if (!fileName) {
    throw new Error(`A malformed download URL was found: ${downloadURL}.`);
  }
  const downloadsFolder = getDownloadsFolder(chromeMode);
  const archivePath = path8.join(downloadsFolder, fileName);
  const outputPath = getFolderPath(downloadsFolder, platform3);
  const expectedVersion = getExpectedVersion(version, chromeMode);
  if (await existsAsync(outputPath)) {
    const installedVersion = readVersionFile(chromeMode);
    if (installedVersion === expectedVersion) {
      return getRevisionInfo(chromeMode);
    }
    fs7.rmSync(outputPath, { recursive: true, force: true });
  }
  if (!await existsAsync(downloadsFolder)) {
    await mkdirAsync(downloadsFolder, {
      recursive: true
    });
  }
  if (os3.platform() !== "darwin" && os3.platform() !== "linux" && os3.arch() === "arm64") {
    throw new Error([
      "Chrome Headless Shell is not available for Windows for arm64 architecture."
    ].join(`
`));
  }
  logDownloadUrl({ url: downloadURL, logLevel, indent });
  try {
    await downloadFile({
      url: downloadURL,
      to: () => archivePath,
      onProgress: (progress) => {
        if (progress.totalSize === null || progress.percent === null) {
          throw new Error("Expected totalSize and percent to be defined");
        }
        onProgress({
          downloadedBytes: progress.downloaded,
          totalSizeInBytes: progress.totalSize,
          percent: progress.percent,
          alreadyAvailable: false
        });
      },
      indent,
      logLevel,
      abortSignal: new AbortController().signal
    });
    await extractZip(archivePath, { dir: outputPath });
    const possibleSubdirs = [
      "chrome-linux",
      "chrome-headless-shell-linux64",
      "chromium-headless-shell-amazon-linux2023-arm64",
      "chromium-headless-shell-amazon-linux2023-x64"
    ];
    for (const subdir of possibleSubdirs) {
      const chromeLinuxFolder = path8.join(outputPath, subdir);
      const chromePath = path8.join(chromeLinuxFolder, "chrome");
      if (fs7.existsSync(chromePath)) {
        const chromeHeadlessShellPath = path8.join(chromeLinuxFolder, "chrome-headless-shell");
        fs7.renameSync(chromePath, chromeHeadlessShellPath);
      }
      if (fs7.existsSync(chromeLinuxFolder)) {
        const targetFolder = path8.join(outputPath, "chrome-headless-shell-" + platform3);
        if (chromeLinuxFolder !== targetFolder) {
          fs7.renameSync(chromeLinuxFolder, targetFolder);
        }
      }
    }
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (await existsAsync(archivePath)) {
      await unlinkAsync(archivePath);
    }
  }
  writeVersionFile(chromeMode, expectedVersion);
  const revisionInfo = getRevisionInfo(chromeMode);
  makeFileExecutableIfItIsNot(revisionInfo.executablePath);
  return revisionInfo;
};
var getFolderPath = (downloadsFolder, platform3) => {
  return path8.resolve(downloadsFolder, platform3);
};
var getExecutablePath2 = (chromeMode) => {
  const downloadsFolder = getDownloadsFolder(chromeMode);
  const platform3 = getPlatform();
  const folderPath = getFolderPath(downloadsFolder, platform3);
  if (chromeMode === "chrome-for-testing") {
    if (platform3 === "mac-arm64" || platform3 === "mac-x64") {
      return path8.join(folderPath, `chrome-${platform3}`, "Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing");
    }
    if (platform3 === "win64") {
      return path8.join(folderPath, "chrome-win64", "chrome.exe");
    }
    if (platform3 === "linux64" || platform3 === "linux-arm64") {
      return path8.join(folderPath, "chrome-linux64", "chrome");
    }
    throw new Error("unsupported platform" + platform3);
  }
  if (chromeMode === "headless-shell") {
    return path8.join(folderPath, `chrome-headless-shell-${platform3}`, platform3 === "win64" ? "chrome-headless-shell.exe" : platform3 === "linux-arm64" || isAmazonLinux2023() ? "headless_shell" : "chrome-headless-shell");
  }
  throw new Error("unsupported chrome mode" + chromeMode);
};
var getRevisionInfo = (chromeMode) => {
  const executablePath = getExecutablePath2(chromeMode);
  const downloadsFolder = getDownloadsFolder(chromeMode);
  const platform3 = getPlatform();
  const folderPath = getFolderPath(downloadsFolder, platform3);
  const url = getChromeDownloadUrl({ platform: platform3, version: null, chromeMode });
  const local = fs7.existsSync(folderPath);
  return {
    executablePath,
    folderPath,
    local,
    url
  };
};

// src/ensure-browser.ts
var currentEnsureBrowserOperation = Promise.resolve();
var internalEnsureBrowserUncapped = async ({
  indent,
  logLevel,
  browserExecutable,
  onBrowserDownload,
  chromeMode
}) => {
  const status = getBrowserStatus({ browserExecutable, chromeMode });
  if (status.type === "version-mismatch") {
    const versionInfo = status.actualVersion ? ` (installed: ${status.actualVersion})` : "";
    Log.info({ indent, logLevel }, `This version of Remotion uses Chrome version ${TESTED_VERSION}, but the installed one differs${versionInfo}. Re-downloading.`);
  }
  if (status.type === "no-browser" || status.type === "version-mismatch") {
    const { onProgress, version } = onBrowserDownload({ chromeMode });
    await downloadBrowser({ indent, logLevel, onProgress, version, chromeMode });
  }
  const newStatus = getBrowserStatus({ browserExecutable, chromeMode });
  return newStatus;
};
var internalEnsureBrowser = (options) => {
  currentEnsureBrowserOperation = currentEnsureBrowserOperation.then(() => internalEnsureBrowserUncapped(options));
  return currentEnsureBrowserOperation;
};
var getBrowserStatus = ({
  browserExecutable,
  chromeMode
}) => {
  if (browserExecutable) {
    if (!fs8.existsSync(browserExecutable)) {
      throw new Error(`"browserExecutable" was specified as '${browserExecutable}' but the path doesn't exist. Pass "null" for "browserExecutable" to download a browser automatically.`);
    }
    return { path: browserExecutable, type: "user-defined-path" };
  }
  const revision = getRevisionInfo(chromeMode);
  if (revision.local && fs8.existsSync(revision.executablePath)) {
    const actualVersion = readVersionFile(chromeMode);
    if (actualVersion === TESTED_VERSION) {
      return { path: revision.executablePath, type: "local-puppeteer-browser" };
    }
    return { type: "version-mismatch", actualVersion };
  }
  return { type: "no-browser" };
};
var ensureBrowser = (options) => {
  const indent = false;
  const logLevel = options?.logLevel ?? "info";
  return internalEnsureBrowser({
    browserExecutable: options?.browserExecutable ?? null,
    indent,
    logLevel: options?.logLevel ?? "info",
    onBrowserDownload: options?.onBrowserDownload ?? defaultBrowserDownloadProgress({
      api: "ensureBrowser()",
      indent: false,
      logLevel
    }),
    chromeMode: options?.chromeMode ?? "headless-shell"
  });
};

// src/get-local-browser-executable.ts
import fs9 from "node:fs";
var getBrowserStatus2 = ({
  browserExecutablePath,
  indent,
  logLevel,
  chromeMode
}) => {
  if (browserExecutablePath) {
    if (!fs9.existsSync(browserExecutablePath)) {
      Log.warn({ indent, logLevel }, `Browser executable was specified as '${browserExecutablePath}' but the path doesn't exist.`);
    }
    return { path: browserExecutablePath, type: "user-defined-path" };
  }
  const revision = getRevisionInfo(chromeMode);
  if (revision.local && fs9.existsSync(revision.executablePath)) {
    return { path: revision.executablePath, type: "local-puppeteer-browser" };
  }
  return { type: "no-browser" };
};
var getLocalBrowserExecutable = ({
  preferredBrowserExecutable,
  logLevel,
  indent,
  chromeMode
}) => {
  const status = getBrowserStatus2({
    browserExecutablePath: preferredBrowserExecutable,
    indent,
    logLevel,
    chromeMode
  });
  if (status.type === "no-browser" || status.type === "version-mismatch") {
    throw new TypeError("No browser found for rendering frames! Please open a GitHub issue and describe " + "how you reached this error: https://remotion.dev/issue");
  }
  return status.path;
};

// src/get-cpu-count.ts
import { execSync as execSync2 } from "node:child_process";
import os4 from "node:os";
var nprocCount;
var getConcurrencyFromNProc = () => {
  if (nprocCount !== undefined) {
    return nprocCount;
  }
  try {
    const count = parseInt(execSync2("nproc", { stdio: "pipe" }).toString().trim(), 10);
    nprocCount = count;
    return count;
  } catch {
    return null;
  }
};
var getNodeCpuCount = () => {
  if (typeof os4.availableParallelism === "function") {
    return os4.availableParallelism();
  }
  return os4.cpus().length;
};
var getCpuCount = () => {
  const node = getNodeCpuCount();
  const nproc = getConcurrencyFromNProc();
  if (nproc === null) {
    return node;
  }
  return Math.min(nproc, node);
};

// src/memory/get-available-memory.ts
import { freemem } from "node:os";

// src/memory/from-docker-cgroup.ts
import { readFileSync as readFileSync4 } from "node:fs";
var getMaxMemoryFromCgroupV2 = () => {
  try {
    const data = readFileSync4("/sys/fs/cgroup/memory.max", "utf-8");
    if (data.trim() === "max") {
      return Infinity;
    }
    return parseInt(data, 10);
  } catch {
    return null;
  }
};
var getAvailableMemoryFromCgroupV2 = () => {
  try {
    const data = readFileSync4("/sys/fs/cgroup/memory.current", "utf-8");
    return parseInt(data, 10);
  } catch {
    return null;
  }
};
var getMaxMemoryFromCgroupV1 = () => {
  try {
    const data = readFileSync4("/sys/fs/cgroup/memory/memory.limit_in_bytes", "utf-8");
    if (data.trim() === "max") {
      return Infinity;
    }
    return parseInt(data, 10);
  } catch {
    return null;
  }
};
var getAvailableMemoryFromCgroupV1 = () => {
  try {
    const data = readFileSync4("/sys/fs/cgroup/memory/memory.usage_in_bytes", "utf-8");
    return parseInt(data, 10);
  } catch {
    return null;
  }
};
var getAvailableMemoryFromCgroup = () => {
  const maxMemoryV2 = getMaxMemoryFromCgroupV2();
  if (maxMemoryV2 !== null) {
    const availableMemoryV2 = getAvailableMemoryFromCgroupV2();
    if (availableMemoryV2 !== null) {
      return maxMemoryV2 - availableMemoryV2;
    }
  }
  const maxMemoryV1 = getMaxMemoryFromCgroupV1();
  if (maxMemoryV1 !== null) {
    const availableMemoryV1 = getAvailableMemoryFromCgroupV1();
    if (availableMemoryV1 !== null) {
      return maxMemoryV1 - availableMemoryV1;
    }
  }
  return null;
};

// src/memory/from-lambda-env.ts
var getMaxLambdaMemory = () => {
  if (process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE) {
    return parseInt(process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE, 10) * 1024 * 1024;
  }
  return null;
};

// src/memory/from-proc-meminfo.ts
import { existsSync as existsSync3, readFileSync as readFileSync5 } from "node:fs";
var getFreeMemoryFromProcMeminfo = (logLevel) => {
  if (!existsSync3("/proc/meminfo")) {
    return null;
  }
  try {
    const data = readFileSync5("/proc/meminfo", "utf-8");
    const lines = data.split(`
`);
    const memAvailableLine = lines.find((line) => line.startsWith("MemAvailable"));
    if (!memAvailableLine) {
      throw new Error("MemAvailable not found in /proc/meminfo");
    }
    const matches = memAvailableLine.match(/(\d+)\s+(\w+)/);
    if (!matches || matches.length !== 3) {
      throw new Error("Failed to parse MemAvailable value");
    }
    const value = parseInt(matches[1], 10);
    const unit = matches[2].toLowerCase();
    switch (unit) {
      case "kb":
        return value * 1024;
      case "mb":
        return value * 1024 * 1024;
      case "gb":
        return value * 1024 * 1024 * 1024;
      default:
        throw new Error(`Unknown unit: ${unit}`);
    }
  } catch (err) {
    Log.warn({ indent: false, logLevel }, "/proc/meminfo exists but failed to get memory info. Error:");
    Log.warn({ indent: false, logLevel }, err);
    return null;
  }
};

// src/memory/get-available-memory.ts
var getAvailableMemory = (logLevel) => {
  const maxMemory = getMaxLambdaMemory();
  if (maxMemory !== null) {
    const nodeMemory = freemem();
    return Math.min(nodeMemory, maxMemory);
  }
  const cgroupMemory = getAvailableMemoryFromCgroup();
  if (cgroupMemory !== null) {
    const nodeMemory = freemem();
    const _procInfo = getFreeMemoryFromProcMeminfo(logLevel);
    if (cgroupMemory > nodeMemory * 1.25 && Number.isFinite(cgroupMemory)) {
      Log.warn({ indent: false, logLevel }, "Detected differing memory amounts:");
      Log.warn({ indent: false, logLevel }, `Memory reported by CGroup: ${(cgroupMemory / 1024 / 1024).toFixed(2)} MB`);
      if (_procInfo !== null) {
        Log.warn({ indent: false, logLevel }, `Memory reported by /proc/meminfo: ${(_procInfo / 1024 / 1024).toFixed(2)} MB`);
      }
      Log.warn({ indent: false, logLevel }, `Memory reported by Node: ${(nodeMemory / 1024 / 1024).toFixed(2)} MB`);
      Log.warn({ indent: false, logLevel }, "You might have inadvertenly set the --memory flag of `docker run` to a value that is higher than the global Docker memory limit.");
      Log.warn({ indent: false, logLevel }, "Using the lower amount of memory for calculation.");
    }
    return Math.min(nodeMemory, cgroupMemory);
  }
  const procInfo = getFreeMemoryFromProcMeminfo(logLevel);
  if (procInfo !== null) {
    return Math.min(freemem(), procInfo);
  }
  return freemem();
};

// src/get-video-threads-flag.ts
var MEMORY_USAGE_PER_THREAD = 400000000;
var RESERVED_MEMORY = 2000000000;
var getIdealVideoThreadsFlag = (logLevel) => {
  const freeMemory = getAvailableMemory(logLevel);
  const cpus = getCpuCount();
  const maxRecommendedBasedOnCpus = cpus * 2 / 3;
  const maxRecommendedBasedOnMemory = (freeMemory - RESERVED_MEMORY) / MEMORY_USAGE_PER_THREAD;
  const maxRecommended = Math.min(maxRecommendedBasedOnCpus, maxRecommendedBasedOnMemory);
  return Math.max(1, Math.round(maxRecommended));
};

// src/options/gl.tsx
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
var validOpenGlRenderers = [
  "swangle",
  "angle",
  "egl",
  "swiftshader",
  "vulkan",
  "angle-egl"
];
var DEFAULT_OPENGL_RENDERER = null;
var validateOpenGlRenderer = (option) => {
  if (option === null) {
    return null;
  }
  if (!validOpenGlRenderers.includes(option)) {
    throw new TypeError(`${option} is not a valid GL backend. Accepted values: ${validOpenGlRenderers.join(", ")}`);
  }
  return option;
};

// src/open-browser.ts
var featuresToEnable = (option) => {
  const renderer = option ?? DEFAULT_OPENGL_RENDERER;
  const enableAlways = ["NetworkService", "NetworkServiceInProcess"];
  if (renderer === "vulkan") {
    return [...enableAlways, "Vulkan", "UseSkiaRenderer"];
  }
  if (renderer === "angle-egl") {
    return [...enableAlways, "VaapiVideoDecoder"];
  }
  return enableAlways;
};
var getOpenGlRenderer = (option) => {
  const renderer = option ?? DEFAULT_OPENGL_RENDERER;
  validateOpenGlRenderer(renderer);
  if (renderer === "swangle") {
    return ["--use-gl=angle", "--use-angle=swiftshader"];
  }
  if (renderer === "angle-egl") {
    return ["--use-gl=angle", "--use-angle=gl-egl"];
  }
  if (renderer === "vulkan") {
    return [
      "--use-angle=vulkan",
      "--use-vulkan=native",
      "--disable-vulkan-fallback-to-gl-for-testing",
      "--disable-vulkan-surface",
      "--ignore-gpu-blocklist",
      "--enable-gpu"
    ];
  }
  if (renderer === null) {
    return [];
  }
  return [`--use-gl=${renderer}`];
};
var internalOpenBrowser = async ({
  browser,
  browserExecutable,
  chromiumOptions,
  forceDeviceScaleFactor,
  indent,
  viewport,
  logLevel,
  onBrowserDownload,
  chromeMode
}) => {
  if (browser === "firefox") {
    throw new TypeError("Firefox supported is not yet turned on. Stay tuned for the future.");
  }
  Log.verbose({ indent, logLevel }, "Ensuring browser executable");
  await internalEnsureBrowser({
    browserExecutable,
    logLevel,
    indent,
    onBrowserDownload,
    chromeMode
  });
  Log.verbose({ indent, logLevel }, "Ensured browser is available.");
  const executablePath = getLocalBrowserExecutable({
    preferredBrowserExecutable: browserExecutable,
    logLevel,
    indent,
    chromeMode
  });
  const customGlRenderer = getOpenGlRenderer(chromiumOptions.gl ?? null);
  const enableMultiProcessOnLinux = chromiumOptions.enableMultiProcessOnLinux ?? true;
  Log.verbose({ indent, logLevel, tag: "openBrowser()" }, `Opening browser: gl = ${chromiumOptions.gl}, executable = ${executablePath}, enableMultiProcessOnLinux = ${enableMultiProcessOnLinux}`);
  if (chromiumOptions.userAgent) {
    Log.verbose({ indent, logLevel, tag: "openBrowser()" }, `Using custom user agent: ${chromiumOptions.userAgent}`);
  }
  const userDataDir = await fs10.promises.mkdtemp(path9.join(os5.tmpdir(), "puppeteer_dev_chrome_profile-"));
  const browserInstance = await launchChrome({
    executablePath,
    logLevel,
    indent,
    userDataDir,
    timeout: 25000,
    args: [
      "about:blank",
      "--allow-pre-commit-input",
      "--disable-background-networking",
      `--enable-features=${featuresToEnable(chromiumOptions.gl).join(",")}`,
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-breakpad",
      "--disable-client-side-phishing-detection",
      "--disable-component-extensions-with-background-pages",
      "--disable-default-apps",
      "--disable-dev-shm-usage",
      "--no-proxy-server",
      "--proxy-server='direct://'",
      "--proxy-bypass-list=*",
      "--force-gpu-mem-available-mb=4096",
      "--disable-hang-monitor",
      "--disable-extensions",
      "--allow-chrome-scheme-url",
      "--disable-ipc-flooding-protection",
      "--disable-popup-blocking",
      "--disable-prompt-on-repost",
      "--disable-renderer-backgrounding",
      "--disable-sync",
      "--force-color-profile=srgb",
      "--metrics-recording-only",
      "--mute-audio",
      "--no-first-run",
      `--video-threads=${getIdealVideoThreadsFlag(logLevel)}`,
      "--enable-automation",
      "--password-store=basic",
      "--use-mock-keychain",
      "--enable-blink-features=IdleDetection",
      "--export-tagged-pdf",
      "--intensive-wake-up-throttling-policy=0",
      chromiumOptions.headless ?? true ? chromeMode === "chrome-for-testing" ? "--headless=new" : "--headless=old" : null,
      "--no-sandbox",
      "--disable-setuid-sandbox",
      ...customGlRenderer,
      "--disable-background-media-suspend",
      process.platform === "linux" && chromiumOptions.gl !== "vulkan" && !enableMultiProcessOnLinux ? "--single-process" : null,
      "--allow-running-insecure-content",
      "--disable-component-update",
      "--disable-domain-reliability",
      "--disable-features=AudioServiceOutOfProcess,IsolateOrigins,site-per-process,Translate,BackForwardCache,AvoidUnnecessaryBeforeUnloadCheckSync,IntensiveWakeUpThrottling,LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights,PrivateNetworkAccessRespectPreflightResults",
      "--disable-print-preview",
      "--disable-site-isolation-trials",
      "--disk-cache-size=268435456",
      "--hide-scrollbars",
      "--no-default-browser-check",
      "--no-pings",
      "--font-render-hinting=none",
      "--no-zygote",
      "--ignore-gpu-blocklist",
      "--enable-unsafe-webgpu",
      typeof forceDeviceScaleFactor === "undefined" ? null : `--force-device-scale-factor=${forceDeviceScaleFactor}`,
      chromiumOptions.ignoreCertificateErrors ? "--ignore-certificate-errors" : null,
      ...chromiumOptions?.disableWebSecurity ? ["--disable-web-security"] : [],
      chromiumOptions?.userAgent ? `--user-agent="${chromiumOptions.userAgent}"` : null,
      "--remote-debugging-port=0",
      `--user-data-dir=${userDataDir}`
    ].filter(Boolean),
    defaultViewport: viewport ?? {
      height: 720,
      width: 1280,
      deviceScaleFactor: 1
    }
  });
  const pages = await browserInstance.pages();
  await pages[0]?.close();
  return browserInstance;
};
var openBrowser = (browser, options) => {
  const { browserExecutable, chromiumOptions, forceDeviceScaleFactor } = options ?? {};
  const indent = false;
  const logLevel = options?.logLevel ?? (options?.shouldDumpIo ? "verbose" : "info");
  return internalOpenBrowser({
    browser,
    browserExecutable: browserExecutable ?? null,
    chromiumOptions: chromiumOptions ?? {},
    forceDeviceScaleFactor,
    indent,
    viewport: null,
    logLevel,
    onBrowserDownload: defaultBrowserDownloadProgress({
      indent,
      logLevel,
      api: "openBrowser()"
    }),
    chromeMode: options?.chromeMode ?? "headless-shell"
  });
};

// src/get-browser-instance.ts
var getPageAndCleanupFn = async ({
  passedInInstance,
  browserExecutable,
  chromiumOptions,
  forceDeviceScaleFactor,
  indent,
  logLevel,
  onBrowserDownload,
  chromeMode,
  pageIndex,
  onBrowserLog,
  onLog
}) => {
  if (passedInInstance) {
    const page = await passedInInstance.newPage({
      context: () => null,
      logLevel,
      indent,
      pageIndex,
      onBrowserLog,
      onLog
    });
    return {
      page,
      cleanupPage: () => {
        page.close().catch((err) => {
          if (!err.message.includes("Target closed")) {
            Log.error({ indent, logLevel }, "Was not able to close puppeteer page", err);
          }
        });
        return Promise.resolve();
      }
    };
  }
  const browserInstance = await internalOpenBrowser({
    browser: DEFAULT_BROWSER,
    browserExecutable,
    chromiumOptions,
    forceDeviceScaleFactor,
    indent,
    viewport: null,
    logLevel,
    onBrowserDownload,
    chromeMode
  });
  const browserPage = await browserInstance.newPage({
    context: () => null,
    logLevel,
    indent,
    pageIndex,
    onBrowserLog,
    onLog
  });
  return {
    page: browserPage,
    cleanupPage: () => {
      browserInstance.close({ silent: true }).catch((err) => {
        if (!err.message.includes("Target closed")) {
          Log.error({ indent, logLevel }, "Was not able to close puppeteer page", err);
        }
      });
      return Promise.resolve();
    }
  };
};

// src/options/offthreadvideo-threads.tsx
import { jsx as jsx2, jsxs as jsxs2, Fragment as Fragment2 } from "react/jsx-runtime";
var DEFAULT_RENDER_FRAMES_OFFTHREAD_VIDEO_THREADS = 2;

// src/prepare-server.ts
import { existsSync as existsSync4 } from "node:fs";
import path19 from "node:path";
import { NoReactInternals as NoReactInternals7 } from "remotion/no-react";

// src/assets/download-and-map-assets-to-file.ts
import fs11 from "node:fs";
import path11, { extname as extname2 } from "node:path";
import { random } from "remotion/no-react";

// src/compress-assets.ts
var compressAsset = (previousRenderAssets, newRenderAsset) => {
  if (newRenderAsset.src.length < 400) {
    return newRenderAsset;
  }
  const assetWithSameSrc = previousRenderAssets.find((a) => a.src === newRenderAsset.src);
  if (!assetWithSameSrc) {
    return newRenderAsset;
  }
  return {
    ...newRenderAsset,
    src: `same-as-${assetWithSameSrc.id}-${assetWithSameSrc.frame}`
  };
};
var isAssetCompressed = (src) => {
  return src.startsWith("same-as");
};

// src/mime-types.ts
import { extname } from "node:path";

// src/mime-db.ts
var mimeDb = {
  "application/1d-interleaved-parityfec": {
    source: "iana"
  },
  "application/3gpdash-qoe-report+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/3gpp-ims+xml": {
    source: "iana",
    compressible: true
  },
  "application/3gpphal+json": {
    source: "iana",
    compressible: true
  },
  "application/3gpphalforms+json": {
    source: "iana",
    compressible: true
  },
  "application/a2l": {
    source: "iana"
  },
  "application/ace+cbor": {
    source: "iana"
  },
  "application/ace+json": {
    source: "iana",
    compressible: true
  },
  "application/activemessage": {
    source: "iana"
  },
  "application/activity+json": {
    source: "iana",
    compressible: true
  },
  "application/aif+cbor": {
    source: "iana"
  },
  "application/aif+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-cdni+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-cdnifilter+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-costmap+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-costmapfilter+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-directory+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-endpointcost+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-endpointcostparams+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-endpointprop+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-endpointpropparams+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-error+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-networkmap+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-networkmapfilter+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-propmap+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-propmapparams+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-updatestreamcontrol+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-updatestreamparams+json": {
    source: "iana",
    compressible: true
  },
  "application/aml": {
    source: "iana"
  },
  "application/andrew-inset": {
    source: "iana",
    extensions: ["ez"]
  },
  "application/applefile": {
    source: "iana"
  },
  "application/applixware": {
    source: "apache",
    extensions: ["aw"]
  },
  "application/at+jwt": {
    source: "iana"
  },
  "application/atf": {
    source: "iana"
  },
  "application/atfx": {
    source: "iana"
  },
  "application/atom+xml": {
    source: "iana",
    compressible: true,
    extensions: ["atom"]
  },
  "application/atomcat+xml": {
    source: "iana",
    compressible: true,
    extensions: ["atomcat"]
  },
  "application/atomdeleted+xml": {
    source: "iana",
    compressible: true,
    extensions: ["atomdeleted"]
  },
  "application/atomicmail": {
    source: "iana"
  },
  "application/atomsvc+xml": {
    source: "iana",
    compressible: true,
    extensions: ["atomsvc"]
  },
  "application/atsc-dwd+xml": {
    source: "iana",
    compressible: true,
    extensions: ["dwd"]
  },
  "application/atsc-dynamic-event-message": {
    source: "iana"
  },
  "application/atsc-held+xml": {
    source: "iana",
    compressible: true,
    extensions: ["held"]
  },
  "application/atsc-rdt+json": {
    source: "iana",
    compressible: true
  },
  "application/atsc-rsat+xml": {
    source: "iana",
    compressible: true,
    extensions: ["rsat"]
  },
  "application/atxml": {
    source: "iana"
  },
  "application/auth-policy+xml": {
    source: "iana",
    compressible: true
  },
  "application/bacnet-xdd+zip": {
    source: "iana",
    compressible: false
  },
  "application/batch-smtp": {
    source: "iana"
  },
  "application/bdoc": {
    compressible: false,
    extensions: ["bdoc"]
  },
  "application/beep+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/calendar+json": {
    source: "iana",
    compressible: true
  },
  "application/calendar+xml": {
    source: "iana",
    compressible: true,
    extensions: ["xcs"]
  },
  "application/call-completion": {
    source: "iana"
  },
  "application/cals-1840": {
    source: "iana"
  },
  "application/captive+json": {
    source: "iana",
    compressible: true
  },
  "application/cbor": {
    source: "iana"
  },
  "application/cbor-seq": {
    source: "iana"
  },
  "application/cccex": {
    source: "iana"
  },
  "application/ccmp+xml": {
    source: "iana",
    compressible: true
  },
  "application/ccxml+xml": {
    source: "iana",
    compressible: true,
    extensions: ["ccxml"]
  },
  "application/cda+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/cdfx+xml": {
    source: "iana",
    compressible: true,
    extensions: ["cdfx"]
  },
  "application/cdmi-capability": {
    source: "iana",
    extensions: ["cdmia"]
  },
  "application/cdmi-container": {
    source: "iana",
    extensions: ["cdmic"]
  },
  "application/cdmi-domain": {
    source: "iana",
    extensions: ["cdmid"]
  },
  "application/cdmi-object": {
    source: "iana",
    extensions: ["cdmio"]
  },
  "application/cdmi-queue": {
    source: "iana",
    extensions: ["cdmiq"]
  },
  "application/cdni": {
    source: "iana"
  },
  "application/cea": {
    source: "iana"
  },
  "application/cea-2018+xml": {
    source: "iana",
    compressible: true
  },
  "application/cellml+xml": {
    source: "iana",
    compressible: true
  },
  "application/cfw": {
    source: "iana"
  },
  "application/city+json": {
    source: "iana",
    compressible: true
  },
  "application/clr": {
    source: "iana"
  },
  "application/clue+xml": {
    source: "iana",
    compressible: true
  },
  "application/clue_info+xml": {
    source: "iana",
    compressible: true
  },
  "application/cms": {
    source: "iana"
  },
  "application/cnrp+xml": {
    source: "iana",
    compressible: true
  },
  "application/coap-group+json": {
    source: "iana",
    compressible: true
  },
  "application/coap-payload": {
    source: "iana"
  },
  "application/commonground": {
    source: "iana"
  },
  "application/conference-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/cose": {
    source: "iana"
  },
  "application/cose-key": {
    source: "iana"
  },
  "application/cose-key-set": {
    source: "iana"
  },
  "application/cpl+xml": {
    source: "iana",
    compressible: true,
    extensions: ["cpl"]
  },
  "application/csrattrs": {
    source: "iana"
  },
  "application/csta+xml": {
    source: "iana",
    compressible: true
  },
  "application/cstadata+xml": {
    source: "iana",
    compressible: true
  },
  "application/csvm+json": {
    source: "iana",
    compressible: true
  },
  "application/cu-seeme": {
    source: "apache",
    extensions: ["cu"]
  },
  "application/cwl": {
    source: "iana",
    extensions: ["cwl"]
  },
  "application/cwl+json": {
    source: "iana",
    compressible: true
  },
  "application/cwt": {
    source: "iana"
  },
  "application/cybercash": {
    source: "iana"
  },
  "application/dart": {
    compressible: true
  },
  "application/dash+xml": {
    source: "iana",
    compressible: true,
    extensions: ["mpd"]
  },
  "application/dash-patch+xml": {
    source: "iana",
    compressible: true,
    extensions: ["mpp"]
  },
  "application/dashdelta": {
    source: "iana"
  },
  "application/davmount+xml": {
    source: "iana",
    compressible: true,
    extensions: ["davmount"]
  },
  "application/dca-rft": {
    source: "iana"
  },
  "application/dcd": {
    source: "iana"
  },
  "application/dec-dx": {
    source: "iana"
  },
  "application/dialog-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/dicom": {
    source: "iana"
  },
  "application/dicom+json": {
    source: "iana",
    compressible: true
  },
  "application/dicom+xml": {
    source: "iana",
    compressible: true
  },
  "application/dii": {
    source: "iana"
  },
  "application/dit": {
    source: "iana"
  },
  "application/dns": {
    source: "iana"
  },
  "application/dns+json": {
    source: "iana",
    compressible: true
  },
  "application/dns-message": {
    source: "iana"
  },
  "application/docbook+xml": {
    source: "apache",
    compressible: true,
    extensions: ["dbk"]
  },
  "application/dots+cbor": {
    source: "iana"
  },
  "application/dskpp+xml": {
    source: "iana",
    compressible: true
  },
  "application/dssc+der": {
    source: "iana",
    extensions: ["dssc"]
  },
  "application/dssc+xml": {
    source: "iana",
    compressible: true,
    extensions: ["xdssc"]
  },
  "application/dvcs": {
    source: "iana"
  },
  "application/ecmascript": {
    source: "apache",
    compressible: true,
    extensions: ["ecma"]
  },
  "application/edi-consent": {
    source: "iana"
  },
  "application/edi-x12": {
    source: "iana",
    compressible: false
  },
  "application/edifact": {
    source: "iana",
    compressible: false
  },
  "application/efi": {
    source: "iana"
  },
  "application/elm+json": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/elm+xml": {
    source: "iana",
    compressible: true
  },
  "application/emergencycalldata.cap+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/emergencycalldata.comment+xml": {
    source: "iana",
    compressible: true
  },
  "application/emergencycalldata.control+xml": {
    source: "iana",
    compressible: true
  },
  "application/emergencycalldata.deviceinfo+xml": {
    source: "iana",
    compressible: true
  },
  "application/emergencycalldata.ecall.msd": {
    source: "iana"
  },
  "application/emergencycalldata.providerinfo+xml": {
    source: "iana",
    compressible: true
  },
  "application/emergencycalldata.serviceinfo+xml": {
    source: "iana",
    compressible: true
  },
  "application/emergencycalldata.subscriberinfo+xml": {
    source: "iana",
    compressible: true
  },
  "application/emergencycalldata.veds+xml": {
    source: "iana",
    compressible: true
  },
  "application/emma+xml": {
    source: "iana",
    compressible: true,
    extensions: ["emma"]
  },
  "application/emotionml+xml": {
    source: "iana",
    compressible: true,
    extensions: ["emotionml"]
  },
  "application/encaprtp": {
    source: "iana"
  },
  "application/epp+xml": {
    source: "iana",
    compressible: true
  },
  "application/epub+zip": {
    source: "iana",
    compressible: false,
    extensions: ["epub"]
  },
  "application/eshop": {
    source: "iana"
  },
  "application/exi": {
    source: "iana",
    extensions: ["exi"]
  },
  "application/expect-ct-report+json": {
    source: "iana",
    compressible: true
  },
  "application/express": {
    source: "iana",
    extensions: ["exp"]
  },
  "application/fastinfoset": {
    source: "iana"
  },
  "application/fastsoap": {
    source: "iana"
  },
  "application/fdf": {
    source: "iana",
    extensions: ["fdf"]
  },
  "application/fdt+xml": {
    source: "iana",
    compressible: true,
    extensions: ["fdt"]
  },
  "application/fhir+json": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/fhir+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/fido.trusted-apps+json": {
    compressible: true
  },
  "application/fits": {
    source: "iana"
  },
  "application/flexfec": {
    source: "iana"
  },
  "application/font-sfnt": {
    source: "iana"
  },
  "application/font-tdpfr": {
    source: "iana",
    extensions: ["pfr"]
  },
  "application/font-woff": {
    source: "iana",
    compressible: false
  },
  "application/framework-attributes+xml": {
    source: "iana",
    compressible: true
  },
  "application/geo+json": {
    source: "iana",
    compressible: true,
    extensions: ["geojson"]
  },
  "application/geo+json-seq": {
    source: "iana"
  },
  "application/geopackage+sqlite3": {
    source: "iana"
  },
  "application/geoxacml+xml": {
    source: "iana",
    compressible: true
  },
  "application/gltf-buffer": {
    source: "iana"
  },
  "application/gml+xml": {
    source: "iana",
    compressible: true,
    extensions: ["gml"]
  },
  "application/gpx+xml": {
    source: "apache",
    compressible: true,
    extensions: ["gpx"]
  },
  "application/gxf": {
    source: "apache",
    extensions: ["gxf"]
  },
  "application/gzip": {
    source: "iana",
    compressible: false,
    extensions: ["gz"]
  },
  "application/h224": {
    source: "iana"
  },
  "application/held+xml": {
    source: "iana",
    compressible: true
  },
  "application/hjson": {
    extensions: ["hjson"]
  },
  "application/hl7v2+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/http": {
    source: "iana"
  },
  "application/hyperstudio": {
    source: "iana",
    extensions: ["stk"]
  },
  "application/ibe-key-request+xml": {
    source: "iana",
    compressible: true
  },
  "application/ibe-pkg-reply+xml": {
    source: "iana",
    compressible: true
  },
  "application/ibe-pp-data": {
    source: "iana"
  },
  "application/iges": {
    source: "iana"
  },
  "application/im-iscomposing+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/index": {
    source: "iana"
  },
  "application/index.cmd": {
    source: "iana"
  },
  "application/index.obj": {
    source: "iana"
  },
  "application/index.response": {
    source: "iana"
  },
  "application/index.vnd": {
    source: "iana"
  },
  "application/inkml+xml": {
    source: "iana",
    compressible: true,
    extensions: ["ink", "inkml"]
  },
  "application/iotp": {
    source: "iana"
  },
  "application/ipfix": {
    source: "iana",
    extensions: ["ipfix"]
  },
  "application/ipp": {
    source: "iana"
  },
  "application/isup": {
    source: "iana"
  },
  "application/its+xml": {
    source: "iana",
    compressible: true,
    extensions: ["its"]
  },
  "application/java-archive": {
    source: "apache",
    compressible: false,
    extensions: ["jar", "war", "ear"]
  },
  "application/java-serialized-object": {
    source: "apache",
    compressible: false,
    extensions: ["ser"]
  },
  "application/java-vm": {
    source: "apache",
    compressible: false,
    extensions: ["class"]
  },
  "application/javascript": {
    source: "apache",
    charset: "UTF-8",
    compressible: true,
    extensions: ["js"]
  },
  "application/jf2feed+json": {
    source: "iana",
    compressible: true
  },
  "application/jose": {
    source: "iana"
  },
  "application/jose+json": {
    source: "iana",
    compressible: true
  },
  "application/jrd+json": {
    source: "iana",
    compressible: true
  },
  "application/jscalendar+json": {
    source: "iana",
    compressible: true
  },
  "application/json": {
    source: "iana",
    charset: "UTF-8",
    compressible: true,
    extensions: ["json", "map"]
  },
  "application/json-patch+json": {
    source: "iana",
    compressible: true
  },
  "application/json-seq": {
    source: "iana"
  },
  "application/json5": {
    extensions: ["json5"]
  },
  "application/jsonml+json": {
    source: "apache",
    compressible: true,
    extensions: ["jsonml"]
  },
  "application/jwk+json": {
    source: "iana",
    compressible: true
  },
  "application/jwk-set+json": {
    source: "iana",
    compressible: true
  },
  "application/jwt": {
    source: "iana"
  },
  "application/kpml-request+xml": {
    source: "iana",
    compressible: true
  },
  "application/kpml-response+xml": {
    source: "iana",
    compressible: true
  },
  "application/ld+json": {
    source: "iana",
    compressible: true,
    extensions: ["jsonld"]
  },
  "application/lgr+xml": {
    source: "iana",
    compressible: true,
    extensions: ["lgr"]
  },
  "application/link-format": {
    source: "iana"
  },
  "application/linkset": {
    source: "iana"
  },
  "application/linkset+json": {
    source: "iana",
    compressible: true
  },
  "application/load-control+xml": {
    source: "iana",
    compressible: true
  },
  "application/lost+xml": {
    source: "iana",
    compressible: true,
    extensions: ["lostxml"]
  },
  "application/lostsync+xml": {
    source: "iana",
    compressible: true
  },
  "application/lpf+zip": {
    source: "iana",
    compressible: false
  },
  "application/lxf": {
    source: "iana"
  },
  "application/mac-binhex40": {
    source: "iana",
    extensions: ["hqx"]
  },
  "application/mac-compactpro": {
    source: "apache",
    extensions: ["cpt"]
  },
  "application/macwriteii": {
    source: "iana"
  },
  "application/mads+xml": {
    source: "iana",
    compressible: true,
    extensions: ["mads"]
  },
  "application/manifest+json": {
    source: "iana",
    charset: "UTF-8",
    compressible: true,
    extensions: ["webmanifest"]
  },
  "application/marc": {
    source: "iana",
    extensions: ["mrc"]
  },
  "application/marcxml+xml": {
    source: "iana",
    compressible: true,
    extensions: ["mrcx"]
  },
  "application/mathematica": {
    source: "iana",
    extensions: ["ma", "nb", "mb"]
  },
  "application/mathml+xml": {
    source: "iana",
    compressible: true,
    extensions: ["mathml"]
  },
  "application/mathml-content+xml": {
    source: "iana",
    compressible: true
  },
  "application/mathml-presentation+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbms-associated-procedure-description+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbms-deregister+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbms-envelope+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbms-msk+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbms-msk-response+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbms-protection-description+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbms-reception-report+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbms-register+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbms-register-response+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbms-schedule+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbms-user-service-description+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbox": {
    source: "iana",
    extensions: ["mbox"]
  },
  "application/media-policy-dataset+xml": {
    source: "iana",
    compressible: true,
    extensions: ["mpf"]
  },
  "application/media_control+xml": {
    source: "iana",
    compressible: true
  },
  "application/mediaservercontrol+xml": {
    source: "iana",
    compressible: true,
    extensions: ["mscml"]
  },
  "application/merge-patch+json": {
    source: "iana",
    compressible: true
  },
  "application/metalink+xml": {
    source: "apache",
    compressible: true,
    extensions: ["metalink"]
  },
  "application/metalink4+xml": {
    source: "iana",
    compressible: true,
    extensions: ["meta4"]
  },
  "application/mets+xml": {
    source: "iana",
    compressible: true,
    extensions: ["mets"]
  },
  "application/mf4": {
    source: "iana"
  },
  "application/mikey": {
    source: "iana"
  },
  "application/mipc": {
    source: "iana"
  },
  "application/missing-blocks+cbor-seq": {
    source: "iana"
  },
  "application/mmt-aei+xml": {
    source: "iana",
    compressible: true,
    extensions: ["maei"]
  },
  "application/mmt-usd+xml": {
    source: "iana",
    compressible: true,
    extensions: ["musd"]
  },
  "application/mods+xml": {
    source: "iana",
    compressible: true,
    extensions: ["mods"]
  },
  "application/moss-keys": {
    source: "iana"
  },
  "application/moss-signature": {
    source: "iana"
  },
  "application/mosskey-data": {
    source: "iana"
  },
  "application/mosskey-request": {
    source: "iana"
  },
  "application/mp21": {
    source: "iana",
    extensions: ["m21", "mp21"]
  },
  "application/mp4": {
    source: "iana",
    extensions: ["mp4s", "m4p"]
  },
  "application/mpeg4-generic": {
    source: "iana"
  },
  "application/mpeg4-iod": {
    source: "iana"
  },
  "application/mpeg4-iod-xmt": {
    source: "iana"
  },
  "application/mrb-consumer+xml": {
    source: "iana",
    compressible: true
  },
  "application/mrb-publish+xml": {
    source: "iana",
    compressible: true
  },
  "application/msc-ivr+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/msc-mixer+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/msword": {
    source: "iana",
    compressible: false,
    extensions: ["doc", "dot"]
  },
  "application/mud+json": {
    source: "iana",
    compressible: true
  },
  "application/multipart-core": {
    source: "iana"
  },
  "application/mxf": {
    source: "iana",
    extensions: ["mxf"]
  },
  "application/n-quads": {
    source: "iana",
    extensions: ["nq"]
  },
  "application/n-triples": {
    source: "iana",
    extensions: ["nt"]
  },
  "application/nasdata": {
    source: "iana"
  },
  "application/news-checkgroups": {
    source: "iana",
    charset: "US-ASCII"
  },
  "application/news-groupinfo": {
    source: "iana",
    charset: "US-ASCII"
  },
  "application/news-transmission": {
    source: "iana"
  },
  "application/nlsml+xml": {
    source: "iana",
    compressible: true
  },
  "application/node": {
    source: "iana",
    extensions: ["cjs"]
  },
  "application/nss": {
    source: "iana"
  },
  "application/oauth-authz-req+jwt": {
    source: "iana"
  },
  "application/oblivious-dns-message": {
    source: "iana"
  },
  "application/ocsp-request": {
    source: "iana"
  },
  "application/ocsp-response": {
    source: "iana"
  },
  "application/octet-stream": {
    source: "iana",
    compressible: false,
    extensions: [
      "bin",
      "dms",
      "lrf",
      "mar",
      "so",
      "dist",
      "distz",
      "pkg",
      "bpk",
      "dump",
      "elc",
      "deploy",
      "exe",
      "dll",
      "deb",
      "dmg",
      "iso",
      "img",
      "msi",
      "msp",
      "msm",
      "buffer"
    ]
  },
  "application/oda": {
    source: "iana",
    extensions: ["oda"]
  },
  "application/odm+xml": {
    source: "iana",
    compressible: true
  },
  "application/odx": {
    source: "iana"
  },
  "application/oebps-package+xml": {
    source: "iana",
    compressible: true,
    extensions: ["opf"]
  },
  "application/ogg": {
    source: "iana",
    compressible: false,
    extensions: ["ogx"]
  },
  "application/omdoc+xml": {
    source: "apache",
    compressible: true,
    extensions: ["omdoc"]
  },
  "application/onenote": {
    source: "apache",
    extensions: ["onetoc", "onetoc2", "onetmp", "onepkg"]
  },
  "application/opc-nodeset+xml": {
    source: "iana",
    compressible: true
  },
  "application/oscore": {
    source: "iana"
  },
  "application/oxps": {
    source: "iana",
    extensions: ["oxps"]
  },
  "application/p21": {
    source: "iana"
  },
  "application/p21+zip": {
    source: "iana",
    compressible: false
  },
  "application/p2p-overlay+xml": {
    source: "iana",
    compressible: true,
    extensions: ["relo"]
  },
  "application/parityfec": {
    source: "iana"
  },
  "application/passport": {
    source: "iana"
  },
  "application/patch-ops-error+xml": {
    source: "iana",
    compressible: true,
    extensions: ["xer"]
  },
  "application/pdf": {
    source: "iana",
    compressible: false,
    extensions: ["pdf"]
  },
  "application/pdx": {
    source: "iana"
  },
  "application/pem-certificate-chain": {
    source: "iana"
  },
  "application/pgp-encrypted": {
    source: "iana",
    compressible: false,
    extensions: ["pgp"]
  },
  "application/pgp-keys": {
    source: "iana",
    extensions: ["asc"]
  },
  "application/pgp-signature": {
    source: "iana",
    extensions: ["sig", "asc"]
  },
  "application/pics-rules": {
    source: "apache",
    extensions: ["prf"]
  },
  "application/pidf+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/pidf-diff+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/pkcs10": {
    source: "iana",
    extensions: ["p10"]
  },
  "application/pkcs12": {
    source: "iana"
  },
  "application/pkcs7-mime": {
    source: "iana",
    extensions: ["p7m", "p7c"]
  },
  "application/pkcs7-signature": {
    source: "iana",
    extensions: ["p7s"]
  },
  "application/pkcs8": {
    source: "iana",
    extensions: ["p8"]
  },
  "application/pkcs8-encrypted": {
    source: "iana"
  },
  "application/pkix-attr-cert": {
    source: "iana",
    extensions: ["ac"]
  },
  "application/pkix-cert": {
    source: "iana",
    extensions: ["cer"]
  },
  "application/pkix-crl": {
    source: "iana",
    extensions: ["crl"]
  },
  "application/pkix-pkipath": {
    source: "iana",
    extensions: ["pkipath"]
  },
  "application/pkixcmp": {
    source: "iana",
    extensions: ["pki"]
  },
  "application/pls+xml": {
    source: "iana",
    compressible: true,
    extensions: ["pls"]
  },
  "application/poc-settings+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/postscript": {
    source: "iana",
    compressible: true,
    extensions: ["ai", "eps", "ps"]
  },
  "application/ppsp-tracker+json": {
    source: "iana",
    compressible: true
  },
  "application/problem+json": {
    source: "iana",
    compressible: true
  },
  "application/problem+xml": {
    source: "iana",
    compressible: true
  },
  "application/provenance+xml": {
    source: "iana",
    compressible: true,
    extensions: ["provx"]
  },
  "application/prs.alvestrand.titrax-sheet": {
    source: "iana"
  },
  "application/prs.cww": {
    source: "iana",
    extensions: ["cww"]
  },
  "application/prs.cyn": {
    source: "iana",
    charset: "7-BIT"
  },
  "application/prs.hpub+zip": {
    source: "iana",
    compressible: false
  },
  "application/prs.nprend": {
    source: "iana"
  },
  "application/prs.plucker": {
    source: "iana"
  },
  "application/prs.rdf-xml-crypt": {
    source: "iana"
  },
  "application/prs.xsf+xml": {
    source: "iana",
    compressible: true,
    extensions: ["xsf"]
  },
  "application/pskc+xml": {
    source: "iana",
    compressible: true,
    extensions: ["pskcxml"]
  },
  "application/pvd+json": {
    source: "iana",
    compressible: true
  },
  "application/qsig": {
    source: "iana"
  },
  "application/raml+yaml": {
    compressible: true,
    extensions: ["raml"]
  },
  "application/raptorfec": {
    source: "iana"
  },
  "application/rdap+json": {
    source: "iana",
    compressible: true
  },
  "application/rdf+xml": {
    source: "iana",
    compressible: true,
    extensions: ["rdf", "owl"]
  },
  "application/reginfo+xml": {
    source: "iana",
    compressible: true,
    extensions: ["rif"]
  },
  "application/relax-ng-compact-syntax": {
    source: "iana",
    extensions: ["rnc"]
  },
  "application/remote-printing": {
    source: "iana"
  },
  "application/reputon+json": {
    source: "iana",
    compressible: true
  },
  "application/resource-lists+xml": {
    source: "iana",
    compressible: true,
    extensions: ["rl"]
  },
  "application/resource-lists-diff+xml": {
    source: "iana",
    compressible: true,
    extensions: ["rld"]
  },
  "application/rfc+xml": {
    source: "iana",
    compressible: true
  },
  "application/riscos": {
    source: "iana"
  },
  "application/rlmi+xml": {
    source: "iana",
    compressible: true
  },
  "application/rls-services+xml": {
    source: "iana",
    compressible: true,
    extensions: ["rs"]
  },
  "application/route-apd+xml": {
    source: "iana",
    compressible: true,
    extensions: ["rapd"]
  },
  "application/route-s-tsid+xml": {
    source: "iana",
    compressible: true,
    extensions: ["sls"]
  },
  "application/route-usd+xml": {
    source: "iana",
    compressible: true,
    extensions: ["rusd"]
  },
  "application/rpki-ghostbusters": {
    source: "iana",
    extensions: ["gbr"]
  },
  "application/rpki-manifest": {
    source: "iana",
    extensions: ["mft"]
  },
  "application/rpki-publication": {
    source: "iana"
  },
  "application/rpki-roa": {
    source: "iana",
    extensions: ["roa"]
  },
  "application/rpki-updown": {
    source: "iana"
  },
  "application/rsd+xml": {
    source: "apache",
    compressible: true,
    extensions: ["rsd"]
  },
  "application/rss+xml": {
    source: "apache",
    compressible: true,
    extensions: ["rss"]
  },
  "application/rtf": {
    source: "iana",
    compressible: true,
    extensions: ["rtf"]
  },
  "application/rtploopback": {
    source: "iana"
  },
  "application/rtx": {
    source: "iana"
  },
  "application/samlassertion+xml": {
    source: "iana",
    compressible: true
  },
  "application/samlmetadata+xml": {
    source: "iana",
    compressible: true
  },
  "application/sarif+json": {
    source: "iana",
    compressible: true
  },
  "application/sarif-external-properties+json": {
    source: "iana",
    compressible: true
  },
  "application/sbe": {
    source: "iana"
  },
  "application/sbml+xml": {
    source: "iana",
    compressible: true,
    extensions: ["sbml"]
  },
  "application/scaip+xml": {
    source: "iana",
    compressible: true
  },
  "application/scim+json": {
    source: "iana",
    compressible: true
  },
  "application/scvp-cv-request": {
    source: "iana",
    extensions: ["scq"]
  },
  "application/scvp-cv-response": {
    source: "iana",
    extensions: ["scs"]
  },
  "application/scvp-vp-request": {
    source: "iana",
    extensions: ["spq"]
  },
  "application/scvp-vp-response": {
    source: "iana",
    extensions: ["spp"]
  },
  "application/sdp": {
    source: "iana",
    extensions: ["sdp"]
  },
  "application/secevent+jwt": {
    source: "iana"
  },
  "application/senml+cbor": {
    source: "iana"
  },
  "application/senml+json": {
    source: "iana",
    compressible: true
  },
  "application/senml+xml": {
    source: "iana",
    compressible: true,
    extensions: ["senmlx"]
  },
  "application/senml-etch+cbor": {
    source: "iana"
  },
  "application/senml-etch+json": {
    source: "iana",
    compressible: true
  },
  "application/senml-exi": {
    source: "iana"
  },
  "application/sensml+cbor": {
    source: "iana"
  },
  "application/sensml+json": {
    source: "iana",
    compressible: true
  },
  "application/sensml+xml": {
    source: "iana",
    compressible: true,
    extensions: ["sensmlx"]
  },
  "application/sensml-exi": {
    source: "iana"
  },
  "application/sep+xml": {
    source: "iana",
    compressible: true
  },
  "application/sep-exi": {
    source: "iana"
  },
  "application/session-info": {
    source: "iana"
  },
  "application/set-payment": {
    source: "iana"
  },
  "application/set-payment-initiation": {
    source: "iana",
    extensions: ["setpay"]
  },
  "application/set-registration": {
    source: "iana"
  },
  "application/set-registration-initiation": {
    source: "iana",
    extensions: ["setreg"]
  },
  "application/sgml": {
    source: "iana"
  },
  "application/sgml-open-catalog": {
    source: "iana"
  },
  "application/shf+xml": {
    source: "iana",
    compressible: true,
    extensions: ["shf"]
  },
  "application/sieve": {
    source: "iana",
    extensions: ["siv", "sieve"]
  },
  "application/simple-filter+xml": {
    source: "iana",
    compressible: true
  },
  "application/simple-message-summary": {
    source: "iana"
  },
  "application/simplesymbolcontainer": {
    source: "iana"
  },
  "application/sipc": {
    source: "iana"
  },
  "application/slate": {
    source: "iana"
  },
  "application/smil": {
    source: "apache"
  },
  "application/smil+xml": {
    source: "iana",
    compressible: true,
    extensions: ["smi", "smil"]
  },
  "application/smpte336m": {
    source: "iana"
  },
  "application/soap+fastinfoset": {
    source: "iana"
  },
  "application/soap+xml": {
    source: "iana",
    compressible: true
  },
  "application/sparql-query": {
    source: "iana",
    extensions: ["rq"]
  },
  "application/sparql-results+xml": {
    source: "iana",
    compressible: true,
    extensions: ["srx"]
  },
  "application/spdx+json": {
    source: "iana",
    compressible: true
  },
  "application/spirits-event+xml": {
    source: "iana",
    compressible: true
  },
  "application/sql": {
    source: "iana"
  },
  "application/srgs": {
    source: "iana",
    extensions: ["gram"]
  },
  "application/srgs+xml": {
    source: "iana",
    compressible: true,
    extensions: ["grxml"]
  },
  "application/sru+xml": {
    source: "iana",
    compressible: true,
    extensions: ["sru"]
  },
  "application/ssdl+xml": {
    source: "apache",
    compressible: true,
    extensions: ["ssdl"]
  },
  "application/ssml+xml": {
    source: "iana",
    compressible: true,
    extensions: ["ssml"]
  },
  "application/stix+json": {
    source: "iana",
    compressible: true
  },
  "application/swid+xml": {
    source: "iana",
    compressible: true,
    extensions: ["swidtag"]
  },
  "application/tamp-apex-update": {
    source: "iana"
  },
  "application/tamp-apex-update-confirm": {
    source: "iana"
  },
  "application/tamp-community-update": {
    source: "iana"
  },
  "application/tamp-community-update-confirm": {
    source: "iana"
  },
  "application/tamp-error": {
    source: "iana"
  },
  "application/tamp-sequence-adjust": {
    source: "iana"
  },
  "application/tamp-sequence-adjust-confirm": {
    source: "iana"
  },
  "application/tamp-status-query": {
    source: "iana"
  },
  "application/tamp-status-response": {
    source: "iana"
  },
  "application/tamp-update": {
    source: "iana"
  },
  "application/tamp-update-confirm": {
    source: "iana"
  },
  "application/tar": {
    compressible: true
  },
  "application/taxii+json": {
    source: "iana",
    compressible: true
  },
  "application/td+json": {
    source: "iana",
    compressible: true
  },
  "application/tei+xml": {
    source: "iana",
    compressible: true,
    extensions: ["tei", "teicorpus"]
  },
  "application/tetra_isi": {
    source: "iana"
  },
  "application/thraud+xml": {
    source: "iana",
    compressible: true,
    extensions: ["tfi"]
  },
  "application/timestamp-query": {
    source: "iana"
  },
  "application/timestamp-reply": {
    source: "iana"
  },
  "application/timestamped-data": {
    source: "iana",
    extensions: ["tsd"]
  },
  "application/tlsrpt+gzip": {
    source: "iana"
  },
  "application/tlsrpt+json": {
    source: "iana",
    compressible: true
  },
  "application/tnauthlist": {
    source: "iana"
  },
  "application/token-introspection+jwt": {
    source: "iana"
  },
  "application/toml": {
    compressible: true,
    extensions: ["toml"]
  },
  "application/trickle-ice-sdpfrag": {
    source: "iana"
  },
  "application/trig": {
    source: "iana",
    extensions: ["trig"]
  },
  "application/ttml+xml": {
    source: "iana",
    compressible: true,
    extensions: ["ttml"]
  },
  "application/tve-trigger": {
    source: "iana"
  },
  "application/tzif": {
    source: "iana"
  },
  "application/tzif-leap": {
    source: "iana"
  },
  "application/ubjson": {
    compressible: false,
    extensions: ["ubj"]
  },
  "application/ulpfec": {
    source: "iana"
  },
  "application/urc-grpsheet+xml": {
    source: "iana",
    compressible: true
  },
  "application/urc-ressheet+xml": {
    source: "iana",
    compressible: true,
    extensions: ["rsheet"]
  },
  "application/urc-targetdesc+xml": {
    source: "iana",
    compressible: true,
    extensions: ["td"]
  },
  "application/urc-uisocketdesc+xml": {
    source: "iana",
    compressible: true
  },
  "application/vcard+json": {
    source: "iana",
    compressible: true
  },
  "application/vcard+xml": {
    source: "iana",
    compressible: true
  },
  "application/vemmi": {
    source: "iana"
  },
  "application/vividence.scriptfile": {
    source: "apache"
  },
  "application/vnd.1000minds.decision-model+xml": {
    source: "iana",
    compressible: true,
    extensions: ["1km"]
  },
  "application/vnd.3gpp-prose+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp-prose-pc3ch+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp-v2x-local-service-information": {
    source: "iana"
  },
  "application/vnd.3gpp.5gnas": {
    source: "iana"
  },
  "application/vnd.3gpp.access-transfer-events+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.bsf+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.gmop+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.gtpc": {
    source: "iana"
  },
  "application/vnd.3gpp.interworking-data": {
    source: "iana"
  },
  "application/vnd.3gpp.lpp": {
    source: "iana"
  },
  "application/vnd.3gpp.mc-signalling-ear": {
    source: "iana"
  },
  "application/vnd.3gpp.mcdata-affiliation-command+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcdata-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcdata-msgstore-ctrl-request+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcdata-payload": {
    source: "iana"
  },
  "application/vnd.3gpp.mcdata-regroup+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcdata-service-config+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcdata-signalling": {
    source: "iana"
  },
  "application/vnd.3gpp.mcdata-ue-config+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcdata-user-profile+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcptt-affiliation-command+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcptt-floor-request+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcptt-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcptt-location-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcptt-mbms-usage-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcptt-service-config+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcptt-signed+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcptt-ue-config+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcptt-ue-init-config+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcptt-user-profile+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcvideo-affiliation-command+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcvideo-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcvideo-location-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcvideo-mbms-usage-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcvideo-service-config+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcvideo-transmission-request+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcvideo-ue-config+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcvideo-user-profile+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mid-call+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.ngap": {
    source: "iana"
  },
  "application/vnd.3gpp.pfcp": {
    source: "iana"
  },
  "application/vnd.3gpp.pic-bw-large": {
    source: "iana",
    extensions: ["plb"]
  },
  "application/vnd.3gpp.pic-bw-small": {
    source: "iana",
    extensions: ["psb"]
  },
  "application/vnd.3gpp.pic-bw-var": {
    source: "iana",
    extensions: ["pvb"]
  },
  "application/vnd.3gpp.s1ap": {
    source: "iana"
  },
  "application/vnd.3gpp.sms": {
    source: "iana"
  },
  "application/vnd.3gpp.sms+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.srvcc-ext+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.srvcc-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.state-and-event-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.ussd+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp2.bcmcsinfo+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp2.sms": {
    source: "iana"
  },
  "application/vnd.3gpp2.tcap": {
    source: "iana",
    extensions: ["tcap"]
  },
  "application/vnd.3lightssoftware.imagescal": {
    source: "iana"
  },
  "application/vnd.3m.post-it-notes": {
    source: "iana",
    extensions: ["pwn"]
  },
  "application/vnd.accpac.simply.aso": {
    source: "iana",
    extensions: ["aso"]
  },
  "application/vnd.accpac.simply.imp": {
    source: "iana",
    extensions: ["imp"]
  },
  "application/vnd.acucobol": {
    source: "iana",
    extensions: ["acu"]
  },
  "application/vnd.acucorp": {
    source: "iana",
    extensions: ["atc", "acutc"]
  },
  "application/vnd.adobe.air-application-installer-package+zip": {
    source: "apache",
    compressible: false,
    extensions: ["air"]
  },
  "application/vnd.adobe.flash.movie": {
    source: "iana"
  },
  "application/vnd.adobe.formscentral.fcdt": {
    source: "iana",
    extensions: ["fcdt"]
  },
  "application/vnd.adobe.fxp": {
    source: "iana",
    extensions: ["fxp", "fxpl"]
  },
  "application/vnd.adobe.partial-upload": {
    source: "iana"
  },
  "application/vnd.adobe.xdp+xml": {
    source: "iana",
    compressible: true,
    extensions: ["xdp"]
  },
  "application/vnd.adobe.xfdf": {
    source: "apache",
    extensions: ["xfdf"]
  },
  "application/vnd.aether.imp": {
    source: "iana"
  },
  "application/vnd.afpc.afplinedata": {
    source: "iana"
  },
  "application/vnd.afpc.afplinedata-pagedef": {
    source: "iana"
  },
  "application/vnd.afpc.cmoca-cmresource": {
    source: "iana"
  },
  "application/vnd.afpc.foca-charset": {
    source: "iana"
  },
  "application/vnd.afpc.foca-codedfont": {
    source: "iana"
  },
  "application/vnd.afpc.foca-codepage": {
    source: "iana"
  },
  "application/vnd.afpc.modca": {
    source: "iana"
  },
  "application/vnd.afpc.modca-cmtable": {
    source: "iana"
  },
  "application/vnd.afpc.modca-formdef": {
    source: "iana"
  },
  "application/vnd.afpc.modca-mediummap": {
    source: "iana"
  },
  "application/vnd.afpc.modca-objectcontainer": {
    source: "iana"
  },
  "application/vnd.afpc.modca-overlay": {
    source: "iana"
  },
  "application/vnd.afpc.modca-pagesegment": {
    source: "iana"
  },
  "application/vnd.age": {
    source: "iana",
    extensions: ["age"]
  },
  "application/vnd.ah-barcode": {
    source: "apache"
  },
  "application/vnd.ahead.space": {
    source: "iana",
    extensions: ["ahead"]
  },
  "application/vnd.airzip.filesecure.azf": {
    source: "iana",
    extensions: ["azf"]
  },
  "application/vnd.airzip.filesecure.azs": {
    source: "iana",
    extensions: ["azs"]
  },
  "application/vnd.amadeus+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.amazon.ebook": {
    source: "apache",
    extensions: ["azw"]
  },
  "application/vnd.amazon.mobi8-ebook": {
    source: "iana"
  },
  "application/vnd.americandynamics.acc": {
    source: "iana",
    extensions: ["acc"]
  },
  "application/vnd.amiga.ami": {
    source: "iana",
    extensions: ["ami"]
  },
  "application/vnd.amundsen.maze+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.android.ota": {
    source: "iana"
  },
  "application/vnd.android.package-archive": {
    source: "apache",
    compressible: false,
    extensions: ["apk"]
  },
  "application/vnd.anki": {
    source: "iana"
  },
  "application/vnd.anser-web-certificate-issue-initiation": {
    source: "iana",
    extensions: ["cii"]
  },
  "application/vnd.anser-web-funds-transfer-initiation": {
    source: "apache",
    extensions: ["fti"]
  },
  "application/vnd.antix.game-component": {
    source: "iana",
    extensions: ["atx"]
  },
  "application/vnd.apache.arrow.file": {
    source: "iana"
  },
  "application/vnd.apache.arrow.stream": {
    source: "iana"
  },
  "application/vnd.apache.thrift.binary": {
    source: "iana"
  },
  "application/vnd.apache.thrift.compact": {
    source: "iana"
  },
  "application/vnd.apache.thrift.json": {
    source: "iana"
  },
  "application/vnd.api+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.aplextor.warrp+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.apothekende.reservation+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.apple.installer+xml": {
    source: "iana",
    compressible: true,
    extensions: ["mpkg"]
  },
  "application/vnd.apple.keynote": {
    source: "iana",
    extensions: ["key"]
  },
  "application/vnd.apple.mpegurl": {
    source: "iana",
    extensions: ["m3u8"]
  },
  "application/vnd.apple.numbers": {
    source: "iana",
    extensions: ["numbers"]
  },
  "application/vnd.apple.pages": {
    source: "iana",
    extensions: ["pages"]
  },
  "application/vnd.apple.pkpass": {
    compressible: false,
    extensions: ["pkpass"]
  },
  "application/vnd.arastra.swi": {
    source: "apache"
  },
  "application/vnd.aristanetworks.swi": {
    source: "iana",
    extensions: ["swi"]
  },
  "application/vnd.artisan+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.artsquare": {
    source: "iana"
  },
  "application/vnd.astraea-software.iota": {
    source: "iana",
    extensions: ["iota"]
  },
  "application/vnd.audiograph": {
    source: "iana",
    extensions: ["aep"]
  },
  "application/vnd.autopackage": {
    source: "iana"
  },
  "application/vnd.avalon+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.avistar+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.balsamiq.bmml+xml": {
    source: "iana",
    compressible: true,
    extensions: ["bmml"]
  },
  "application/vnd.balsamiq.bmpr": {
    source: "iana"
  },
  "application/vnd.banana-accounting": {
    source: "iana"
  },
  "application/vnd.bbf.usp.error": {
    source: "iana"
  },
  "application/vnd.bbf.usp.msg": {
    source: "iana"
  },
  "application/vnd.bbf.usp.msg+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.bekitzur-stech+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.belightsoft.lhzd+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.bint.med-content": {
    source: "iana"
  },
  "application/vnd.biopax.rdf+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.blink-idb-value-wrapper": {
    source: "iana"
  },
  "application/vnd.blueice.multipass": {
    source: "iana",
    extensions: ["mpm"]
  },
  "application/vnd.bluetooth.ep.oob": {
    source: "iana"
  },
  "application/vnd.bluetooth.le.oob": {
    source: "iana"
  },
  "application/vnd.bmi": {
    source: "iana",
    extensions: ["bmi"]
  },
  "application/vnd.bpf": {
    source: "iana"
  },
  "application/vnd.bpf3": {
    source: "iana"
  },
  "application/vnd.businessobjects": {
    source: "iana",
    extensions: ["rep"]
  },
  "application/vnd.byu.uapi+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.cab-jscript": {
    source: "iana"
  },
  "application/vnd.canon-cpdl": {
    source: "iana"
  },
  "application/vnd.canon-lips": {
    source: "iana"
  },
  "application/vnd.capasystems-pg+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.cendio.thinlinc.clientconf": {
    source: "iana"
  },
  "application/vnd.century-systems.tcp_stream": {
    source: "iana"
  },
  "application/vnd.chemdraw+xml": {
    source: "iana",
    compressible: true,
    extensions: ["cdxml"]
  },
  "application/vnd.chess-pgn": {
    source: "iana"
  },
  "application/vnd.chipnuts.karaoke-mmd": {
    source: "iana",
    extensions: ["mmd"]
  },
  "application/vnd.ciedi": {
    source: "iana"
  },
  "application/vnd.cinderella": {
    source: "iana",
    extensions: ["cdy"]
  },
  "application/vnd.cirpack.isdn-ext": {
    source: "iana"
  },
  "application/vnd.citationstyles.style+xml": {
    source: "iana",
    compressible: true,
    extensions: ["csl"]
  },
  "application/vnd.claymore": {
    source: "iana",
    extensions: ["cla"]
  },
  "application/vnd.cloanto.rp9": {
    source: "iana",
    extensions: ["rp9"]
  },
  "application/vnd.clonk.c4group": {
    source: "iana",
    extensions: ["c4g", "c4d", "c4f", "c4p", "c4u"]
  },
  "application/vnd.cluetrust.cartomobile-config": {
    source: "iana",
    extensions: ["c11amc"]
  },
  "application/vnd.cluetrust.cartomobile-config-pkg": {
    source: "iana",
    extensions: ["c11amz"]
  },
  "application/vnd.coffeescript": {
    source: "iana"
  },
  "application/vnd.collabio.xodocuments.document": {
    source: "iana"
  },
  "application/vnd.collabio.xodocuments.document-template": {
    source: "iana"
  },
  "application/vnd.collabio.xodocuments.presentation": {
    source: "iana"
  },
  "application/vnd.collabio.xodocuments.presentation-template": {
    source: "iana"
  },
  "application/vnd.collabio.xodocuments.spreadsheet": {
    source: "iana"
  },
  "application/vnd.collabio.xodocuments.spreadsheet-template": {
    source: "iana"
  },
  "application/vnd.collection+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.collection.doc+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.collection.next+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.comicbook+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.comicbook-rar": {
    source: "iana"
  },
  "application/vnd.commerce-battelle": {
    source: "iana"
  },
  "application/vnd.commonspace": {
    source: "iana",
    extensions: ["csp"]
  },
  "application/vnd.contact.cmsg": {
    source: "iana",
    extensions: ["cdbcmsg"]
  },
  "application/vnd.coreos.ignition+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.cosmocaller": {
    source: "iana",
    extensions: ["cmc"]
  },
  "application/vnd.crick.clicker": {
    source: "iana",
    extensions: ["clkx"]
  },
  "application/vnd.crick.clicker.keyboard": {
    source: "iana",
    extensions: ["clkk"]
  },
  "application/vnd.crick.clicker.palette": {
    source: "iana",
    extensions: ["clkp"]
  },
  "application/vnd.crick.clicker.template": {
    source: "iana",
    extensions: ["clkt"]
  },
  "application/vnd.crick.clicker.wordbank": {
    source: "iana",
    extensions: ["clkw"]
  },
  "application/vnd.criticaltools.wbs+xml": {
    source: "iana",
    compressible: true,
    extensions: ["wbs"]
  },
  "application/vnd.cryptii.pipe+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.crypto-shade-file": {
    source: "iana"
  },
  "application/vnd.cryptomator.encrypted": {
    source: "iana"
  },
  "application/vnd.cryptomator.vault": {
    source: "iana"
  },
  "application/vnd.ctc-posml": {
    source: "iana",
    extensions: ["pml"]
  },
  "application/vnd.ctct.ws+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.cups-pdf": {
    source: "iana"
  },
  "application/vnd.cups-postscript": {
    source: "iana"
  },
  "application/vnd.cups-ppd": {
    source: "iana",
    extensions: ["ppd"]
  },
  "application/vnd.cups-raster": {
    source: "iana"
  },
  "application/vnd.cups-raw": {
    source: "iana"
  },
  "application/vnd.curl": {
    source: "iana"
  },
  "application/vnd.curl.car": {
    source: "apache",
    extensions: ["car"]
  },
  "application/vnd.curl.pcurl": {
    source: "apache",
    extensions: ["pcurl"]
  },
  "application/vnd.cyan.dean.root+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.cybank": {
    source: "iana"
  },
  "application/vnd.cyclonedx+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.cyclonedx+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.d2l.coursepackage1p0+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.d3m-dataset": {
    source: "iana"
  },
  "application/vnd.d3m-problem": {
    source: "iana"
  },
  "application/vnd.dart": {
    source: "iana",
    compressible: true,
    extensions: ["dart"]
  },
  "application/vnd.data-vision.rdz": {
    source: "iana",
    extensions: ["rdz"]
  },
  "application/vnd.datapackage+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dataresource+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dbf": {
    source: "iana",
    extensions: ["dbf"]
  },
  "application/vnd.debian.binary-package": {
    source: "iana"
  },
  "application/vnd.dece.data": {
    source: "iana",
    extensions: ["uvf", "uvvf", "uvd", "uvvd"]
  },
  "application/vnd.dece.ttml+xml": {
    source: "iana",
    compressible: true,
    extensions: ["uvt", "uvvt"]
  },
  "application/vnd.dece.unspecified": {
    source: "iana",
    extensions: ["uvx", "uvvx"]
  },
  "application/vnd.dece.zip": {
    source: "iana",
    extensions: ["uvz", "uvvz"]
  },
  "application/vnd.denovo.fcselayout-link": {
    source: "iana",
    extensions: ["fe_launch"]
  },
  "application/vnd.desmume.movie": {
    source: "iana"
  },
  "application/vnd.dir-bi.plate-dl-nosuffix": {
    source: "iana"
  },
  "application/vnd.dm.delegation+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dna": {
    source: "iana",
    extensions: ["dna"]
  },
  "application/vnd.document+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dolby.mlp": {
    source: "apache",
    extensions: ["mlp"]
  },
  "application/vnd.dolby.mobile.1": {
    source: "iana"
  },
  "application/vnd.dolby.mobile.2": {
    source: "iana"
  },
  "application/vnd.doremir.scorecloud-binary-document": {
    source: "iana"
  },
  "application/vnd.dpgraph": {
    source: "iana",
    extensions: ["dpg"]
  },
  "application/vnd.dreamfactory": {
    source: "iana",
    extensions: ["dfac"]
  },
  "application/vnd.drive+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ds-keypoint": {
    source: "apache",
    extensions: ["kpxx"]
  },
  "application/vnd.dtg.local": {
    source: "iana"
  },
  "application/vnd.dtg.local.flash": {
    source: "iana"
  },
  "application/vnd.dtg.local.html": {
    source: "iana"
  },
  "application/vnd.dvb.ait": {
    source: "iana",
    extensions: ["ait"]
  },
  "application/vnd.dvb.dvbisl+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dvb.dvbj": {
    source: "iana"
  },
  "application/vnd.dvb.esgcontainer": {
    source: "iana"
  },
  "application/vnd.dvb.ipdcdftnotifaccess": {
    source: "iana"
  },
  "application/vnd.dvb.ipdcesgaccess": {
    source: "iana"
  },
  "application/vnd.dvb.ipdcesgaccess2": {
    source: "iana"
  },
  "application/vnd.dvb.ipdcesgpdd": {
    source: "iana"
  },
  "application/vnd.dvb.ipdcroaming": {
    source: "iana"
  },
  "application/vnd.dvb.iptv.alfec-base": {
    source: "iana"
  },
  "application/vnd.dvb.iptv.alfec-enhancement": {
    source: "iana"
  },
  "application/vnd.dvb.notif-aggregate-root+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dvb.notif-container+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dvb.notif-generic+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dvb.notif-ia-msglist+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dvb.notif-ia-registration-request+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dvb.notif-ia-registration-response+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dvb.notif-init+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dvb.pfr": {
    source: "iana"
  },
  "application/vnd.dvb.service": {
    source: "iana",
    extensions: ["svc"]
  },
  "application/vnd.dxr": {
    source: "iana"
  },
  "application/vnd.dynageo": {
    source: "iana",
    extensions: ["geo"]
  },
  "application/vnd.dzr": {
    source: "iana"
  },
  "application/vnd.easykaraoke.cdgdownload": {
    source: "iana"
  },
  "application/vnd.ecdis-update": {
    source: "iana"
  },
  "application/vnd.ecip.rlp": {
    source: "iana"
  },
  "application/vnd.eclipse.ditto+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ecowin.chart": {
    source: "iana",
    extensions: ["mag"]
  },
  "application/vnd.ecowin.filerequest": {
    source: "iana"
  },
  "application/vnd.ecowin.fileupdate": {
    source: "iana"
  },
  "application/vnd.ecowin.series": {
    source: "iana"
  },
  "application/vnd.ecowin.seriesrequest": {
    source: "iana"
  },
  "application/vnd.ecowin.seriesupdate": {
    source: "iana"
  },
  "application/vnd.efi.img": {
    source: "iana"
  },
  "application/vnd.efi.iso": {
    source: "iana"
  },
  "application/vnd.emclient.accessrequest+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.enliven": {
    source: "iana",
    extensions: ["nml"]
  },
  "application/vnd.enphase.envoy": {
    source: "iana"
  },
  "application/vnd.eprints.data+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.epson.esf": {
    source: "iana",
    extensions: ["esf"]
  },
  "application/vnd.epson.msf": {
    source: "iana",
    extensions: ["msf"]
  },
  "application/vnd.epson.quickanime": {
    source: "iana",
    extensions: ["qam"]
  },
  "application/vnd.epson.salt": {
    source: "iana",
    extensions: ["slt"]
  },
  "application/vnd.epson.ssf": {
    source: "iana",
    extensions: ["ssf"]
  },
  "application/vnd.ericsson.quickcall": {
    source: "iana"
  },
  "application/vnd.espass-espass+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.eszigno3+xml": {
    source: "iana",
    compressible: true,
    extensions: ["es3", "et3"]
  },
  "application/vnd.etsi.aoc+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.asic-e+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.etsi.asic-s+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.etsi.cug+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.iptvcommand+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.iptvdiscovery+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.iptvprofile+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.iptvsad-bc+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.iptvsad-cod+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.iptvsad-npvr+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.iptvservice+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.iptvsync+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.iptvueprofile+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.mcid+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.mheg5": {
    source: "iana"
  },
  "application/vnd.etsi.overload-control-policy-dataset+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.pstn+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.sci+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.simservs+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.timestamp-token": {
    source: "iana"
  },
  "application/vnd.etsi.tsl+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.tsl.der": {
    source: "iana"
  },
  "application/vnd.eu.kasparian.car+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.eudora.data": {
    source: "iana"
  },
  "application/vnd.evolv.ecig.profile": {
    source: "iana"
  },
  "application/vnd.evolv.ecig.settings": {
    source: "iana"
  },
  "application/vnd.evolv.ecig.theme": {
    source: "iana"
  },
  "application/vnd.exstream-empower+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.exstream-package": {
    source: "iana"
  },
  "application/vnd.ezpix-album": {
    source: "iana",
    extensions: ["ez2"]
  },
  "application/vnd.ezpix-package": {
    source: "iana",
    extensions: ["ez3"]
  },
  "application/vnd.f-secure.mobile": {
    source: "iana"
  },
  "application/vnd.familysearch.gedcom+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.fastcopy-disk-image": {
    source: "iana"
  },
  "application/vnd.fdf": {
    source: "apache",
    extensions: ["fdf"]
  },
  "application/vnd.fdsn.mseed": {
    source: "iana",
    extensions: ["mseed"]
  },
  "application/vnd.fdsn.seed": {
    source: "iana",
    extensions: ["seed", "dataless"]
  },
  "application/vnd.ffsns": {
    source: "iana"
  },
  "application/vnd.ficlab.flb+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.filmit.zfc": {
    source: "iana"
  },
  "application/vnd.fints": {
    source: "iana"
  },
  "application/vnd.firemonkeys.cloudcell": {
    source: "iana"
  },
  "application/vnd.flographit": {
    source: "iana",
    extensions: ["gph"]
  },
  "application/vnd.fluxtime.clip": {
    source: "iana",
    extensions: ["ftc"]
  },
  "application/vnd.font-fontforge-sfd": {
    source: "iana"
  },
  "application/vnd.framemaker": {
    source: "iana",
    extensions: ["fm", "frame", "maker", "book"]
  },
  "application/vnd.frogans.fnc": {
    source: "apache",
    extensions: ["fnc"]
  },
  "application/vnd.frogans.ltf": {
    source: "apache",
    extensions: ["ltf"]
  },
  "application/vnd.fsc.weblaunch": {
    source: "iana",
    extensions: ["fsc"]
  },
  "application/vnd.fujifilm.fb.docuworks": {
    source: "iana"
  },
  "application/vnd.fujifilm.fb.docuworks.binder": {
    source: "iana"
  },
  "application/vnd.fujifilm.fb.docuworks.container": {
    source: "iana"
  },
  "application/vnd.fujifilm.fb.jfi+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.fujitsu.oasys": {
    source: "iana",
    extensions: ["oas"]
  },
  "application/vnd.fujitsu.oasys2": {
    source: "iana",
    extensions: ["oa2"]
  },
  "application/vnd.fujitsu.oasys3": {
    source: "iana",
    extensions: ["oa3"]
  },
  "application/vnd.fujitsu.oasysgp": {
    source: "iana",
    extensions: ["fg5"]
  },
  "application/vnd.fujitsu.oasysprs": {
    source: "iana",
    extensions: ["bh2"]
  },
  "application/vnd.fujixerox.art-ex": {
    source: "iana"
  },
  "application/vnd.fujixerox.art4": {
    source: "iana"
  },
  "application/vnd.fujixerox.ddd": {
    source: "iana",
    extensions: ["ddd"]
  },
  "application/vnd.fujixerox.docuworks": {
    source: "iana",
    extensions: ["xdw"]
  },
  "application/vnd.fujixerox.docuworks.binder": {
    source: "iana",
    extensions: ["xbd"]
  },
  "application/vnd.fujixerox.docuworks.container": {
    source: "iana"
  },
  "application/vnd.fujixerox.hbpl": {
    source: "iana"
  },
  "application/vnd.fut-misnet": {
    source: "iana"
  },
  "application/vnd.futoin+cbor": {
    source: "iana"
  },
  "application/vnd.futoin+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.fuzzysheet": {
    source: "iana",
    extensions: ["fzs"]
  },
  "application/vnd.genomatix.tuxedo": {
    source: "iana",
    extensions: ["txd"]
  },
  "application/vnd.genozip": {
    source: "iana"
  },
  "application/vnd.gentics.grd+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.geo+json": {
    source: "apache",
    compressible: true
  },
  "application/vnd.geocube+xml": {
    source: "apache",
    compressible: true
  },
  "application/vnd.geogebra.file": {
    source: "iana",
    extensions: ["ggb"]
  },
  "application/vnd.geogebra.slides": {
    source: "iana"
  },
  "application/vnd.geogebra.tool": {
    source: "iana",
    extensions: ["ggt"]
  },
  "application/vnd.geometry-explorer": {
    source: "iana",
    extensions: ["gex", "gre"]
  },
  "application/vnd.geonext": {
    source: "iana",
    extensions: ["gxt"]
  },
  "application/vnd.geoplan": {
    source: "iana",
    extensions: ["g2w"]
  },
  "application/vnd.geospace": {
    source: "iana",
    extensions: ["g3w"]
  },
  "application/vnd.gerber": {
    source: "iana"
  },
  "application/vnd.globalplatform.card-content-mgt": {
    source: "iana"
  },
  "application/vnd.globalplatform.card-content-mgt-response": {
    source: "iana"
  },
  "application/vnd.gmx": {
    source: "iana",
    extensions: ["gmx"]
  },
  "application/vnd.gnu.taler.exchange+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.gnu.taler.merchant+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.google-apps.document": {
    compressible: false,
    extensions: ["gdoc"]
  },
  "application/vnd.google-apps.presentation": {
    compressible: false,
    extensions: ["gslides"]
  },
  "application/vnd.google-apps.spreadsheet": {
    compressible: false,
    extensions: ["gsheet"]
  },
  "application/vnd.google-earth.kml+xml": {
    source: "iana",
    compressible: true,
    extensions: ["kml"]
  },
  "application/vnd.google-earth.kmz": {
    source: "iana",
    compressible: false,
    extensions: ["kmz"]
  },
  "application/vnd.gov.sk.e-form+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.gov.sk.e-form+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.gov.sk.xmldatacontainer+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.grafeq": {
    source: "iana",
    extensions: ["gqf", "gqs"]
  },
  "application/vnd.gridmp": {
    source: "iana"
  },
  "application/vnd.groove-account": {
    source: "iana",
    extensions: ["gac"]
  },
  "application/vnd.groove-help": {
    source: "iana",
    extensions: ["ghf"]
  },
  "application/vnd.groove-identity-message": {
    source: "iana",
    extensions: ["gim"]
  },
  "application/vnd.groove-injector": {
    source: "iana",
    extensions: ["grv"]
  },
  "application/vnd.groove-tool-message": {
    source: "iana",
    extensions: ["gtm"]
  },
  "application/vnd.groove-tool-template": {
    source: "iana",
    extensions: ["tpl"]
  },
  "application/vnd.groove-vcard": {
    source: "iana",
    extensions: ["vcg"]
  },
  "application/vnd.hal+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.hal+xml": {
    source: "iana",
    compressible: true,
    extensions: ["hal"]
  },
  "application/vnd.handheld-entertainment+xml": {
    source: "iana",
    compressible: true,
    extensions: ["zmm"]
  },
  "application/vnd.hbci": {
    source: "iana",
    extensions: ["hbci"]
  },
  "application/vnd.hc+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.hcl-bireports": {
    source: "iana"
  },
  "application/vnd.hdt": {
    source: "iana"
  },
  "application/vnd.heroku+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.hhe.lesson-player": {
    source: "iana",
    extensions: ["les"]
  },
  "application/vnd.hp-hpgl": {
    source: "iana",
    extensions: ["hpgl"]
  },
  "application/vnd.hp-hpid": {
    source: "iana",
    extensions: ["hpid"]
  },
  "application/vnd.hp-hps": {
    source: "iana",
    extensions: ["hps"]
  },
  "application/vnd.hp-jlyt": {
    source: "iana",
    extensions: ["jlt"]
  },
  "application/vnd.hp-pcl": {
    source: "iana",
    extensions: ["pcl"]
  },
  "application/vnd.hp-pclxl": {
    source: "iana",
    extensions: ["pclxl"]
  },
  "application/vnd.httphone": {
    source: "iana"
  },
  "application/vnd.hydrostatix.sof-data": {
    source: "iana",
    extensions: ["sfd-hdstx"]
  },
  "application/vnd.hyper+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.hyper-item+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.hyperdrive+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.hzn-3d-crossword": {
    source: "iana"
  },
  "application/vnd.ibm.afplinedata": {
    source: "apache"
  },
  "application/vnd.ibm.electronic-media": {
    source: "iana"
  },
  "application/vnd.ibm.minipay": {
    source: "iana",
    extensions: ["mpy"]
  },
  "application/vnd.ibm.modcap": {
    source: "apache",
    extensions: ["afp", "listafp", "list3820"]
  },
  "application/vnd.ibm.rights-management": {
    source: "iana",
    extensions: ["irm"]
  },
  "application/vnd.ibm.secure-container": {
    source: "iana",
    extensions: ["sc"]
  },
  "application/vnd.iccprofile": {
    source: "iana",
    extensions: ["icc", "icm"]
  },
  "application/vnd.ieee.1905": {
    source: "iana"
  },
  "application/vnd.igloader": {
    source: "iana",
    extensions: ["igl"]
  },
  "application/vnd.imagemeter.folder+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.imagemeter.image+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.immervision-ivp": {
    source: "iana",
    extensions: ["ivp"]
  },
  "application/vnd.immervision-ivu": {
    source: "iana",
    extensions: ["ivu"]
  },
  "application/vnd.ims.imsccv1p1": {
    source: "iana"
  },
  "application/vnd.ims.imsccv1p2": {
    source: "iana"
  },
  "application/vnd.ims.imsccv1p3": {
    source: "iana"
  },
  "application/vnd.ims.lis.v2.result+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ims.lti.v2.toolconsumerprofile+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ims.lti.v2.toolproxy+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ims.lti.v2.toolproxy.id+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ims.lti.v2.toolsettings+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ims.lti.v2.toolsettings.simple+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.informedcontrol.rms+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.informix-visionary": {
    source: "apache"
  },
  "application/vnd.infotech.project": {
    source: "iana"
  },
  "application/vnd.infotech.project+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.innopath.wamp.notification": {
    source: "iana"
  },
  "application/vnd.insors.igm": {
    source: "iana",
    extensions: ["igm"]
  },
  "application/vnd.intercon.formnet": {
    source: "iana",
    extensions: ["xpw", "xpx"]
  },
  "application/vnd.intergeo": {
    source: "iana",
    extensions: ["i2g"]
  },
  "application/vnd.intertrust.digibox": {
    source: "iana"
  },
  "application/vnd.intertrust.nncp": {
    source: "iana"
  },
  "application/vnd.intu.qbo": {
    source: "iana",
    extensions: ["qbo"]
  },
  "application/vnd.intu.qfx": {
    source: "iana",
    extensions: ["qfx"]
  },
  "application/vnd.ipld.car": {
    source: "iana"
  },
  "application/vnd.ipld.raw": {
    source: "iana"
  },
  "application/vnd.iptc.g2.catalogitem+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.iptc.g2.conceptitem+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.iptc.g2.knowledgeitem+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.iptc.g2.newsitem+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.iptc.g2.newsmessage+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.iptc.g2.packageitem+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.iptc.g2.planningitem+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ipunplugged.rcprofile": {
    source: "iana",
    extensions: ["rcprofile"]
  },
  "application/vnd.irepository.package+xml": {
    source: "iana",
    compressible: true,
    extensions: ["irp"]
  },
  "application/vnd.is-xpr": {
    source: "iana",
    extensions: ["xpr"]
  },
  "application/vnd.isac.fcs": {
    source: "iana",
    extensions: ["fcs"]
  },
  "application/vnd.iso11783-10+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.jam": {
    source: "iana",
    extensions: ["jam"]
  },
  "application/vnd.japannet-directory-service": {
    source: "iana"
  },
  "application/vnd.japannet-jpnstore-wakeup": {
    source: "iana"
  },
  "application/vnd.japannet-payment-wakeup": {
    source: "iana"
  },
  "application/vnd.japannet-registration": {
    source: "iana"
  },
  "application/vnd.japannet-registration-wakeup": {
    source: "iana"
  },
  "application/vnd.japannet-setstore-wakeup": {
    source: "iana"
  },
  "application/vnd.japannet-verification": {
    source: "iana"
  },
  "application/vnd.japannet-verification-wakeup": {
    source: "iana"
  },
  "application/vnd.jcp.javame.midlet-rms": {
    source: "iana",
    extensions: ["rms"]
  },
  "application/vnd.jisp": {
    source: "iana",
    extensions: ["jisp"]
  },
  "application/vnd.joost.joda-archive": {
    source: "iana",
    extensions: ["joda"]
  },
  "application/vnd.jsk.isdn-ngn": {
    source: "iana"
  },
  "application/vnd.kahootz": {
    source: "iana",
    extensions: ["ktz", "ktr"]
  },
  "application/vnd.kde.karbon": {
    source: "iana",
    extensions: ["karbon"]
  },
  "application/vnd.kde.kchart": {
    source: "iana",
    extensions: ["chrt"]
  },
  "application/vnd.kde.kformula": {
    source: "iana",
    extensions: ["kfo"]
  },
  "application/vnd.kde.kivio": {
    source: "iana",
    extensions: ["flw"]
  },
  "application/vnd.kde.kontour": {
    source: "iana",
    extensions: ["kon"]
  },
  "application/vnd.kde.kpresenter": {
    source: "iana",
    extensions: ["kpr", "kpt"]
  },
  "application/vnd.kde.kspread": {
    source: "iana",
    extensions: ["ksp"]
  },
  "application/vnd.kde.kword": {
    source: "iana",
    extensions: ["kwd", "kwt"]
  },
  "application/vnd.kenameaapp": {
    source: "iana",
    extensions: ["htke"]
  },
  "application/vnd.kidspiration": {
    source: "iana",
    extensions: ["kia"]
  },
  "application/vnd.kinar": {
    source: "iana",
    extensions: ["kne", "knp"]
  },
  "application/vnd.koan": {
    source: "iana",
    extensions: ["skp", "skd", "skt", "skm"]
  },
  "application/vnd.kodak-descriptor": {
    source: "iana",
    extensions: ["sse"]
  },
  "application/vnd.las": {
    source: "iana"
  },
  "application/vnd.las.las+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.las.las+xml": {
    source: "iana",
    compressible: true,
    extensions: ["lasxml"]
  },
  "application/vnd.laszip": {
    source: "iana"
  },
  "application/vnd.leap+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.liberty-request+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.llamagraphics.life-balance.desktop": {
    source: "iana",
    extensions: ["lbd"]
  },
  "application/vnd.llamagraphics.life-balance.exchange+xml": {
    source: "iana",
    compressible: true,
    extensions: ["lbe"]
  },
  "application/vnd.logipipe.circuit+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.loom": {
    source: "iana"
  },
  "application/vnd.lotus-1-2-3": {
    source: "iana",
    extensions: ["123"]
  },
  "application/vnd.lotus-approach": {
    source: "iana",
    extensions: ["apr"]
  },
  "application/vnd.lotus-freelance": {
    source: "iana",
    extensions: ["pre"]
  },
  "application/vnd.lotus-notes": {
    source: "iana",
    extensions: ["nsf"]
  },
  "application/vnd.lotus-organizer": {
    source: "iana",
    extensions: ["org"]
  },
  "application/vnd.lotus-screencam": {
    source: "iana",
    extensions: ["scm"]
  },
  "application/vnd.lotus-wordpro": {
    source: "iana",
    extensions: ["lwp"]
  },
  "application/vnd.macports.portpkg": {
    source: "iana",
    extensions: ["portpkg"]
  },
  "application/vnd.mapbox-vector-tile": {
    source: "iana",
    extensions: ["mvt"]
  },
  "application/vnd.marlin.drm.actiontoken+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.marlin.drm.conftoken+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.marlin.drm.license+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.marlin.drm.mdcf": {
    source: "iana"
  },
  "application/vnd.mason+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.maxar.archive.3tz+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.maxmind.maxmind-db": {
    source: "iana"
  },
  "application/vnd.mcd": {
    source: "iana",
    extensions: ["mcd"]
  },
  "application/vnd.medcalcdata": {
    source: "iana",
    extensions: ["mc1"]
  },
  "application/vnd.mediastation.cdkey": {
    source: "iana",
    extensions: ["cdkey"]
  },
  "application/vnd.meridian-slingshot": {
    source: "iana"
  },
  "application/vnd.mfer": {
    source: "iana",
    extensions: ["mwf"]
  },
  "application/vnd.mfmp": {
    source: "iana",
    extensions: ["mfm"]
  },
  "application/vnd.micro+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.micrografx.flo": {
    source: "iana",
    extensions: ["flo"]
  },
  "application/vnd.micrografx.igx": {
    source: "iana",
    extensions: ["igx"]
  },
  "application/vnd.microsoft.portable-executable": {
    source: "iana"
  },
  "application/vnd.microsoft.windows.thumbnail-cache": {
    source: "iana"
  },
  "application/vnd.miele+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.mif": {
    source: "iana",
    extensions: ["mif"]
  },
  "application/vnd.minisoft-hp3000-save": {
    source: "iana"
  },
  "application/vnd.mitsubishi.misty-guard.trustweb": {
    source: "iana"
  },
  "application/vnd.mobius.daf": {
    source: "iana",
    extensions: ["daf"]
  },
  "application/vnd.mobius.dis": {
    source: "iana",
    extensions: ["dis"]
  },
  "application/vnd.mobius.mbk": {
    source: "iana",
    extensions: ["mbk"]
  },
  "application/vnd.mobius.mqy": {
    source: "iana",
    extensions: ["mqy"]
  },
  "application/vnd.mobius.msl": {
    source: "iana",
    extensions: ["msl"]
  },
  "application/vnd.mobius.plc": {
    source: "iana",
    extensions: ["plc"]
  },
  "application/vnd.mobius.txf": {
    source: "iana",
    extensions: ["txf"]
  },
  "application/vnd.mophun.application": {
    source: "iana",
    extensions: ["mpn"]
  },
  "application/vnd.mophun.certificate": {
    source: "iana",
    extensions: ["mpc"]
  },
  "application/vnd.motorola.flexsuite": {
    source: "iana"
  },
  "application/vnd.motorola.flexsuite.adsi": {
    source: "iana"
  },
  "application/vnd.motorola.flexsuite.fis": {
    source: "iana"
  },
  "application/vnd.motorola.flexsuite.gotap": {
    source: "iana"
  },
  "application/vnd.motorola.flexsuite.kmr": {
    source: "iana"
  },
  "application/vnd.motorola.flexsuite.ttc": {
    source: "iana"
  },
  "application/vnd.motorola.flexsuite.wem": {
    source: "iana"
  },
  "application/vnd.motorola.iprm": {
    source: "iana"
  },
  "application/vnd.mozilla.xul+xml": {
    source: "iana",
    compressible: true,
    extensions: ["xul"]
  },
  "application/vnd.ms-3mfdocument": {
    source: "iana"
  },
  "application/vnd.ms-artgalry": {
    source: "iana",
    extensions: ["cil"]
  },
  "application/vnd.ms-asf": {
    source: "iana"
  },
  "application/vnd.ms-cab-compressed": {
    source: "iana",
    extensions: ["cab"]
  },
  "application/vnd.ms-color.iccprofile": {
    source: "apache"
  },
  "application/vnd.ms-excel": {
    source: "iana",
    compressible: false,
    extensions: ["xls", "xlm", "xla", "xlc", "xlt", "xlw"]
  },
  "application/vnd.ms-excel.addin.macroenabled.12": {
    source: "iana",
    extensions: ["xlam"]
  },
  "application/vnd.ms-excel.sheet.binary.macroenabled.12": {
    source: "iana",
    extensions: ["xlsb"]
  },
  "application/vnd.ms-excel.sheet.macroenabled.12": {
    source: "iana",
    extensions: ["xlsm"]
  },
  "application/vnd.ms-excel.template.macroenabled.12": {
    source: "iana",
    extensions: ["xltm"]
  },
  "application/vnd.ms-fontobject": {
    source: "iana",
    compressible: true,
    extensions: ["eot"]
  },
  "application/vnd.ms-htmlhelp": {
    source: "iana",
    extensions: ["chm"]
  },
  "application/vnd.ms-ims": {
    source: "iana",
    extensions: ["ims"]
  },
  "application/vnd.ms-lrm": {
    source: "iana",
    extensions: ["lrm"]
  },
  "application/vnd.ms-office.activex+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ms-officetheme": {
    source: "iana",
    extensions: ["thmx"]
  },
  "application/vnd.ms-opentype": {
    source: "apache",
    compressible: true
  },
  "application/vnd.ms-outlook": {
    compressible: false,
    extensions: ["msg"]
  },
  "application/vnd.ms-package.obfuscated-opentype": {
    source: "apache"
  },
  "application/vnd.ms-pki.seccat": {
    source: "apache",
    extensions: ["cat"]
  },
  "application/vnd.ms-pki.stl": {
    source: "apache",
    extensions: ["stl"]
  },
  "application/vnd.ms-playready.initiator+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ms-powerpoint": {
    source: "iana",
    compressible: false,
    extensions: ["ppt", "pps", "pot"]
  },
  "application/vnd.ms-powerpoint.addin.macroenabled.12": {
    source: "iana",
    extensions: ["ppam"]
  },
  "application/vnd.ms-powerpoint.presentation.macroenabled.12": {
    source: "iana",
    extensions: ["pptm"]
  },
  "application/vnd.ms-powerpoint.slide.macroenabled.12": {
    source: "iana",
    extensions: ["sldm"]
  },
  "application/vnd.ms-powerpoint.slideshow.macroenabled.12": {
    source: "iana",
    extensions: ["ppsm"]
  },
  "application/vnd.ms-powerpoint.template.macroenabled.12": {
    source: "iana",
    extensions: ["potm"]
  },
  "application/vnd.ms-printdevicecapabilities+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ms-printing.printticket+xml": {
    source: "apache",
    compressible: true
  },
  "application/vnd.ms-printschematicket+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ms-project": {
    source: "iana",
    extensions: ["mpp", "mpt"]
  },
  "application/vnd.ms-tnef": {
    source: "iana"
  },
  "application/vnd.ms-windows.devicepairing": {
    source: "iana"
  },
  "application/vnd.ms-windows.nwprinting.oob": {
    source: "iana"
  },
  "application/vnd.ms-windows.printerpairing": {
    source: "iana"
  },
  "application/vnd.ms-windows.wsd.oob": {
    source: "iana"
  },
  "application/vnd.ms-wmdrm.lic-chlg-req": {
    source: "iana"
  },
  "application/vnd.ms-wmdrm.lic-resp": {
    source: "iana"
  },
  "application/vnd.ms-wmdrm.meter-chlg-req": {
    source: "iana"
  },
  "application/vnd.ms-wmdrm.meter-resp": {
    source: "iana"
  },
  "application/vnd.ms-word.document.macroenabled.12": {
    source: "iana",
    extensions: ["docm"]
  },
  "application/vnd.ms-word.template.macroenabled.12": {
    source: "iana",
    extensions: ["dotm"]
  },
  "application/vnd.ms-works": {
    source: "iana",
    extensions: ["wps", "wks", "wcm", "wdb"]
  },
  "application/vnd.ms-wpl": {
    source: "iana",
    extensions: ["wpl"]
  },
  "application/vnd.ms-xpsdocument": {
    source: "iana",
    compressible: false,
    extensions: ["xps"]
  },
  "application/vnd.msa-disk-image": {
    source: "iana"
  },
  "application/vnd.mseq": {
    source: "iana",
    extensions: ["mseq"]
  },
  "application/vnd.msign": {
    source: "iana"
  },
  "application/vnd.multiad.creator": {
    source: "iana"
  },
  "application/vnd.multiad.creator.cif": {
    source: "iana"
  },
  "application/vnd.music-niff": {
    source: "iana"
  },
  "application/vnd.musician": {
    source: "iana",
    extensions: ["mus"]
  },
  "application/vnd.muvee.style": {
    source: "iana",
    extensions: ["msty"]
  },
  "application/vnd.mynfc": {
    source: "iana",
    extensions: ["taglet"]
  },
  "application/vnd.nacamar.ybrid+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ncd.control": {
    source: "iana"
  },
  "application/vnd.ncd.reference": {
    source: "iana"
  },
  "application/vnd.nearst.inv+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.nebumind.line": {
    source: "iana"
  },
  "application/vnd.nervana": {
    source: "iana"
  },
  "application/vnd.netfpx": {
    source: "iana"
  },
  "application/vnd.neurolanguage.nlu": {
    source: "iana",
    extensions: ["nlu"]
  },
  "application/vnd.nimn": {
    source: "iana"
  },
  "application/vnd.nintendo.nitro.rom": {
    source: "iana"
  },
  "application/vnd.nintendo.snes.rom": {
    source: "iana"
  },
  "application/vnd.nitf": {
    source: "iana",
    extensions: ["ntf", "nitf"]
  },
  "application/vnd.noblenet-directory": {
    source: "iana",
    extensions: ["nnd"]
  },
  "application/vnd.noblenet-sealer": {
    source: "iana",
    extensions: ["nns"]
  },
  "application/vnd.noblenet-web": {
    source: "iana",
    extensions: ["nnw"]
  },
  "application/vnd.nokia.catalogs": {
    source: "iana"
  },
  "application/vnd.nokia.conml+wbxml": {
    source: "iana"
  },
  "application/vnd.nokia.conml+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.nokia.iptv.config+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.nokia.isds-radio-presets": {
    source: "iana"
  },
  "application/vnd.nokia.landmark+wbxml": {
    source: "iana"
  },
  "application/vnd.nokia.landmark+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.nokia.landmarkcollection+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.nokia.n-gage.ac+xml": {
    source: "iana",
    compressible: true,
    extensions: ["ac"]
  },
  "application/vnd.nokia.n-gage.data": {
    source: "iana",
    extensions: ["ngdat"]
  },
  "application/vnd.nokia.n-gage.symbian.install": {
    source: "apache",
    extensions: ["n-gage"]
  },
  "application/vnd.nokia.ncd": {
    source: "iana"
  },
  "application/vnd.nokia.pcd+wbxml": {
    source: "iana"
  },
  "application/vnd.nokia.pcd+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.nokia.radio-preset": {
    source: "iana",
    extensions: ["rpst"]
  },
  "application/vnd.nokia.radio-presets": {
    source: "iana",
    extensions: ["rpss"]
  },
  "application/vnd.novadigm.edm": {
    source: "iana",
    extensions: ["edm"]
  },
  "application/vnd.novadigm.edx": {
    source: "iana",
    extensions: ["edx"]
  },
  "application/vnd.novadigm.ext": {
    source: "iana",
    extensions: ["ext"]
  },
  "application/vnd.ntt-local.content-share": {
    source: "iana"
  },
  "application/vnd.ntt-local.file-transfer": {
    source: "iana"
  },
  "application/vnd.ntt-local.ogw_remote-access": {
    source: "iana"
  },
  "application/vnd.ntt-local.sip-ta_remote": {
    source: "iana"
  },
  "application/vnd.ntt-local.sip-ta_tcp_stream": {
    source: "iana"
  },
  "application/vnd.oasis.opendocument.chart": {
    source: "iana",
    extensions: ["odc"]
  },
  "application/vnd.oasis.opendocument.chart-template": {
    source: "iana",
    extensions: ["otc"]
  },
  "application/vnd.oasis.opendocument.database": {
    source: "iana",
    extensions: ["odb"]
  },
  "application/vnd.oasis.opendocument.formula": {
    source: "iana",
    extensions: ["odf"]
  },
  "application/vnd.oasis.opendocument.formula-template": {
    source: "iana",
    extensions: ["odft"]
  },
  "application/vnd.oasis.opendocument.graphics": {
    source: "iana",
    compressible: false,
    extensions: ["odg"]
  },
  "application/vnd.oasis.opendocument.graphics-template": {
    source: "iana",
    extensions: ["otg"]
  },
  "application/vnd.oasis.opendocument.image": {
    source: "iana",
    extensions: ["odi"]
  },
  "application/vnd.oasis.opendocument.image-template": {
    source: "iana",
    extensions: ["oti"]
  },
  "application/vnd.oasis.opendocument.presentation": {
    source: "iana",
    compressible: false,
    extensions: ["odp"]
  },
  "application/vnd.oasis.opendocument.presentation-template": {
    source: "iana",
    extensions: ["otp"]
  },
  "application/vnd.oasis.opendocument.spreadsheet": {
    source: "iana",
    compressible: false,
    extensions: ["ods"]
  },
  "application/vnd.oasis.opendocument.spreadsheet-template": {
    source: "iana",
    extensions: ["ots"]
  },
  "application/vnd.oasis.opendocument.text": {
    source: "iana",
    compressible: false,
    extensions: ["odt"]
  },
  "application/vnd.oasis.opendocument.text-master": {
    source: "iana",
    extensions: ["odm"]
  },
  "application/vnd.oasis.opendocument.text-template": {
    source: "iana",
    extensions: ["ott"]
  },
  "application/vnd.oasis.opendocument.text-web": {
    source: "iana",
    extensions: ["oth"]
  },
  "application/vnd.obn": {
    source: "iana"
  },
  "application/vnd.ocf+cbor": {
    source: "iana"
  },
  "application/vnd.oci.image.manifest.v1+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oftn.l10n+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oipf.contentaccessdownload+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oipf.contentaccessstreaming+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oipf.cspg-hexbinary": {
    source: "iana"
  },
  "application/vnd.oipf.dae.svg+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oipf.dae.xhtml+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oipf.mippvcontrolmessage+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oipf.pae.gem": {
    source: "iana"
  },
  "application/vnd.oipf.spdiscovery+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oipf.spdlist+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oipf.ueprofile+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oipf.userprofile+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.olpc-sugar": {
    source: "iana",
    extensions: ["xo"]
  },
  "application/vnd.oma-scws-config": {
    source: "iana"
  },
  "application/vnd.oma-scws-http-request": {
    source: "iana"
  },
  "application/vnd.oma-scws-http-response": {
    source: "iana"
  },
  "application/vnd.oma.bcast.associated-procedure-parameter+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.bcast.drm-trigger+xml": {
    source: "apache",
    compressible: true
  },
  "application/vnd.oma.bcast.imd+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.bcast.ltkm": {
    source: "iana"
  },
  "application/vnd.oma.bcast.notification+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.bcast.provisioningtrigger": {
    source: "iana"
  },
  "application/vnd.oma.bcast.sgboot": {
    source: "iana"
  },
  "application/vnd.oma.bcast.sgdd+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.bcast.sgdu": {
    source: "iana"
  },
  "application/vnd.oma.bcast.simple-symbol-container": {
    source: "iana"
  },
  "application/vnd.oma.bcast.smartcard-trigger+xml": {
    source: "apache",
    compressible: true
  },
  "application/vnd.oma.bcast.sprov+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.bcast.stkm": {
    source: "iana"
  },
  "application/vnd.oma.cab-address-book+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.cab-feature-handler+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.cab-pcc+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.cab-subs-invite+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.cab-user-prefs+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.dcd": {
    source: "iana"
  },
  "application/vnd.oma.dcdc": {
    source: "iana"
  },
  "application/vnd.oma.dd2+xml": {
    source: "iana",
    compressible: true,
    extensions: ["dd2"]
  },
  "application/vnd.oma.drm.risd+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.group-usage-list+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.lwm2m+cbor": {
    source: "iana"
  },
  "application/vnd.oma.lwm2m+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.lwm2m+tlv": {
    source: "iana"
  },
  "application/vnd.oma.pal+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.poc.detailed-progress-report+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.poc.final-report+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.poc.groups+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.poc.invocation-descriptor+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.poc.optimized-progress-report+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.push": {
    source: "iana"
  },
  "application/vnd.oma.scidm.messages+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.xcap-directory+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.omads-email+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/vnd.omads-file+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/vnd.omads-folder+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/vnd.omaloc-supl-init": {
    source: "iana"
  },
  "application/vnd.onepager": {
    source: "iana"
  },
  "application/vnd.onepagertamp": {
    source: "iana"
  },
  "application/vnd.onepagertamx": {
    source: "iana"
  },
  "application/vnd.onepagertat": {
    source: "iana"
  },
  "application/vnd.onepagertatp": {
    source: "iana"
  },
  "application/vnd.onepagertatx": {
    source: "iana"
  },
  "application/vnd.onvif.metadata": {
    source: "iana"
  },
  "application/vnd.openblox.game+xml": {
    source: "iana",
    compressible: true,
    extensions: ["obgx"]
  },
  "application/vnd.openblox.game-binary": {
    source: "iana"
  },
  "application/vnd.openeye.oeb": {
    source: "iana"
  },
  "application/vnd.openofficeorg.extension": {
    source: "apache",
    extensions: ["oxt"]
  },
  "application/vnd.openstreetmap.data+xml": {
    source: "iana",
    compressible: true,
    extensions: ["osm"]
  },
  "application/vnd.opentimestamps.ots": {
    source: "iana"
  },
  "application/vnd.openxmlformats-officedocument.custom-properties+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.customxmlproperties+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.drawing+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.drawingml.chart+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.drawingml.chartshapes+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.drawingml.diagramcolors+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.drawingml.diagramdata+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.drawingml.diagramlayout+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.drawingml.diagramstyle+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.extended-properties+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.commentauthors+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.comments+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.handoutmaster+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.notesmaster+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.notesslide+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
    source: "iana",
    compressible: false,
    extensions: ["pptx"]
  },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.presprops+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slide": {
    source: "iana",
    extensions: ["sldx"]
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slide+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slidelayout+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slidemaster+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slideshow": {
    source: "iana",
    extensions: ["ppsx"]
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slideshow.main+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slideupdateinfo+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.tablestyles+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.tags+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.template": {
    source: "iana",
    extensions: ["potx"]
  },
  "application/vnd.openxmlformats-officedocument.presentationml.template.main+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.viewprops+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.calcchain+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.connections+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.externallink+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcachedefinition+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcacherecords+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.pivottable+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.querytable+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionheaders+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionlog+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sharedstrings+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
    source: "iana",
    compressible: false,
    extensions: ["xlsx"]
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheetmetadata+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.tablesinglecells+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.template": {
    source: "iana",
    extensions: ["xltx"]
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.usernames+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.volatiledependencies+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.theme+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.themeoverride+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.vmldrawing": {
    source: "iana"
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    source: "iana",
    compressible: false,
    extensions: ["docx"]
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document.glossary+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.fonttable+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.template": {
    source: "iana",
    extensions: ["dotx"]
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.websettings+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-package.core-properties+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-package.digital-signature-xmlsignature+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-package.relationships+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oracle.resource+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.orange.indata": {
    source: "iana"
  },
  "application/vnd.osa.netdeploy": {
    source: "iana"
  },
  "application/vnd.osgeo.mapguide.package": {
    source: "iana",
    extensions: ["mgp"]
  },
  "application/vnd.osgi.bundle": {
    source: "iana"
  },
  "application/vnd.osgi.dp": {
    source: "iana",
    extensions: ["dp"]
  },
  "application/vnd.osgi.subsystem": {
    source: "iana",
    extensions: ["esa"]
  },
  "application/vnd.otps.ct-kip+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oxli.countgraph": {
    source: "iana"
  },
  "application/vnd.pagerduty+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.palm": {
    source: "iana",
    extensions: ["pdb", "pqa", "oprc"]
  },
  "application/vnd.panoply": {
    source: "iana"
  },
  "application/vnd.paos.xml": {
    source: "iana"
  },
  "application/vnd.patentdive": {
    source: "iana"
  },
  "application/vnd.patientecommsdoc": {
    source: "iana"
  },
  "application/vnd.pawaafile": {
    source: "iana",
    extensions: ["paw"]
  },
  "application/vnd.pcos": {
    source: "iana"
  },
  "application/vnd.pg.format": {
    source: "iana",
    extensions: ["str"]
  },
  "application/vnd.pg.osasli": {
    source: "iana",
    extensions: ["ei6"]
  },
  "application/vnd.piaccess.application-licence": {
    source: "iana"
  },
  "application/vnd.picsel": {
    source: "iana",
    extensions: ["efif"]
  },
  "application/vnd.pmi.widget": {
    source: "iana",
    extensions: ["wg"]
  },
  "application/vnd.poc.group-advertisement+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.pocketlearn": {
    source: "iana",
    extensions: ["plf"]
  },
  "application/vnd.powerbuilder6": {
    source: "iana",
    extensions: ["pbd"]
  },
  "application/vnd.powerbuilder6-s": {
    source: "iana"
  },
  "application/vnd.powerbuilder7": {
    source: "iana"
  },
  "application/vnd.powerbuilder7-s": {
    source: "iana"
  },
  "application/vnd.powerbuilder75": {
    source: "iana"
  },
  "application/vnd.powerbuilder75-s": {
    source: "iana"
  },
  "application/vnd.preminet": {
    source: "iana"
  },
  "application/vnd.previewsystems.box": {
    source: "iana",
    extensions: ["box"]
  },
  "application/vnd.proteus.magazine": {
    source: "iana",
    extensions: ["mgz"]
  },
  "application/vnd.psfs": {
    source: "iana"
  },
  "application/vnd.publishare-delta-tree": {
    source: "iana",
    extensions: ["qps"]
  },
  "application/vnd.pvi.ptid1": {
    source: "iana",
    extensions: ["ptid"]
  },
  "application/vnd.pwg-multiplexed": {
    source: "iana"
  },
  "application/vnd.pwg-xhtml-print+xml": {
    source: "iana",
    compressible: true,
    extensions: ["xhtm"]
  },
  "application/vnd.qualcomm.brew-app-res": {
    source: "iana"
  },
  "application/vnd.quarantainenet": {
    source: "iana"
  },
  "application/vnd.quark.quarkxpress": {
    source: "iana",
    extensions: ["qxd", "qxt", "qwd", "qwt", "qxl", "qxb"]
  },
  "application/vnd.quobject-quoxdocument": {
    source: "iana"
  },
  "application/vnd.radisys.moml+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-audit+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-audit-conf+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-audit-conn+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-audit-dialog+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-audit-stream+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-conf+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-dialog+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-dialog-base+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-dialog-fax-detect+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-dialog-fax-sendrecv+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-dialog-group+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-dialog-speech+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-dialog-transform+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.rainstor.data": {
    source: "iana"
  },
  "application/vnd.rapid": {
    source: "iana"
  },
  "application/vnd.rar": {
    source: "iana",
    extensions: ["rar"]
  },
  "application/vnd.realvnc.bed": {
    source: "iana",
    extensions: ["bed"]
  },
  "application/vnd.recordare.musicxml": {
    source: "iana",
    extensions: ["mxl"]
  },
  "application/vnd.recordare.musicxml+xml": {
    source: "iana",
    compressible: true,
    extensions: ["musicxml"]
  },
  "application/vnd.renlearn.rlprint": {
    source: "iana"
  },
  "application/vnd.resilient.logic": {
    source: "iana"
  },
  "application/vnd.restful+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.rig.cryptonote": {
    source: "iana",
    extensions: ["cryptonote"]
  },
  "application/vnd.rim.cod": {
    source: "apache",
    extensions: ["cod"]
  },
  "application/vnd.rn-realmedia": {
    source: "apache",
    extensions: ["rm"]
  },
  "application/vnd.rn-realmedia-vbr": {
    source: "apache",
    extensions: ["rmvb"]
  },
  "application/vnd.route66.link66+xml": {
    source: "iana",
    compressible: true,
    extensions: ["link66"]
  },
  "application/vnd.rs-274x": {
    source: "iana"
  },
  "application/vnd.ruckus.download": {
    source: "iana"
  },
  "application/vnd.s3sms": {
    source: "iana"
  },
  "application/vnd.sailingtracker.track": {
    source: "iana",
    extensions: ["st"]
  },
  "application/vnd.sar": {
    source: "iana"
  },
  "application/vnd.sbm.cid": {
    source: "iana"
  },
  "application/vnd.sbm.mid2": {
    source: "iana"
  },
  "application/vnd.scribus": {
    source: "iana"
  },
  "application/vnd.sealed.3df": {
    source: "iana"
  },
  "application/vnd.sealed.csf": {
    source: "iana"
  },
  "application/vnd.sealed.doc": {
    source: "iana"
  },
  "application/vnd.sealed.eml": {
    source: "iana"
  },
  "application/vnd.sealed.mht": {
    source: "iana"
  },
  "application/vnd.sealed.net": {
    source: "iana"
  },
  "application/vnd.sealed.ppt": {
    source: "iana"
  },
  "application/vnd.sealed.tiff": {
    source: "iana"
  },
  "application/vnd.sealed.xls": {
    source: "iana"
  },
  "application/vnd.sealedmedia.softseal.html": {
    source: "iana"
  },
  "application/vnd.sealedmedia.softseal.pdf": {
    source: "iana"
  },
  "application/vnd.seemail": {
    source: "iana",
    extensions: ["see"]
  },
  "application/vnd.seis+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.sema": {
    source: "iana",
    extensions: ["sema"]
  },
  "application/vnd.semd": {
    source: "iana",
    extensions: ["semd"]
  },
  "application/vnd.semf": {
    source: "iana",
    extensions: ["semf"]
  },
  "application/vnd.shade-save-file": {
    source: "iana"
  },
  "application/vnd.shana.informed.formdata": {
    source: "iana",
    extensions: ["ifm"]
  },
  "application/vnd.shana.informed.formtemplate": {
    source: "iana",
    extensions: ["itp"]
  },
  "application/vnd.shana.informed.interchange": {
    source: "iana",
    extensions: ["iif"]
  },
  "application/vnd.shana.informed.package": {
    source: "iana",
    extensions: ["ipk"]
  },
  "application/vnd.shootproof+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.shopkick+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.shp": {
    source: "iana"
  },
  "application/vnd.shx": {
    source: "iana"
  },
  "application/vnd.sigrok.session": {
    source: "iana"
  },
  "application/vnd.simtech-mindmapper": {
    source: "iana",
    extensions: ["twd", "twds"]
  },
  "application/vnd.siren+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.smaf": {
    source: "iana",
    extensions: ["mmf"]
  },
  "application/vnd.smart.notebook": {
    source: "iana"
  },
  "application/vnd.smart.teacher": {
    source: "iana",
    extensions: ["teacher"]
  },
  "application/vnd.snesdev-page-table": {
    source: "iana"
  },
  "application/vnd.software602.filler.form+xml": {
    source: "iana",
    compressible: true,
    extensions: ["fo"]
  },
  "application/vnd.software602.filler.form-xml-zip": {
    source: "iana"
  },
  "application/vnd.solent.sdkm+xml": {
    source: "iana",
    compressible: true,
    extensions: ["sdkm", "sdkd"]
  },
  "application/vnd.spotfire.dxp": {
    source: "iana",
    extensions: ["dxp"]
  },
  "application/vnd.spotfire.sfs": {
    source: "iana",
    extensions: ["sfs"]
  },
  "application/vnd.sqlite3": {
    source: "iana"
  },
  "application/vnd.sss-cod": {
    source: "iana"
  },
  "application/vnd.sss-dtf": {
    source: "iana"
  },
  "application/vnd.sss-ntf": {
    source: "iana"
  },
  "application/vnd.stardivision.calc": {
    source: "apache",
    extensions: ["sdc"]
  },
  "application/vnd.stardivision.draw": {
    source: "apache",
    extensions: ["sda"]
  },
  "application/vnd.stardivision.impress": {
    source: "apache",
    extensions: ["sdd"]
  },
  "application/vnd.stardivision.math": {
    source: "apache",
    extensions: ["smf"]
  },
  "application/vnd.stardivision.writer": {
    source: "apache",
    extensions: ["sdw", "vor"]
  },
  "application/vnd.stardivision.writer-global": {
    source: "apache",
    extensions: ["sgl"]
  },
  "application/vnd.stepmania.package": {
    source: "iana",
    extensions: ["smzip"]
  },
  "application/vnd.stepmania.stepchart": {
    source: "iana",
    extensions: ["sm"]
  },
  "application/vnd.street-stream": {
    source: "iana"
  },
  "application/vnd.sun.wadl+xml": {
    source: "iana",
    compressible: true,
    extensions: ["wadl"]
  },
  "application/vnd.sun.xml.calc": {
    source: "apache",
    extensions: ["sxc"]
  },
  "application/vnd.sun.xml.calc.template": {
    source: "apache",
    extensions: ["stc"]
  },
  "application/vnd.sun.xml.draw": {
    source: "apache",
    extensions: ["sxd"]
  },
  "application/vnd.sun.xml.draw.template": {
    source: "apache",
    extensions: ["std"]
  },
  "application/vnd.sun.xml.impress": {
    source: "apache",
    extensions: ["sxi"]
  },
  "application/vnd.sun.xml.impress.template": {
    source: "apache",
    extensions: ["sti"]
  },
  "application/vnd.sun.xml.math": {
    source: "apache",
    extensions: ["sxm"]
  },
  "application/vnd.sun.xml.writer": {
    source: "apache",
    extensions: ["sxw"]
  },
  "application/vnd.sun.xml.writer.global": {
    source: "apache",
    extensions: ["sxg"]
  },
  "application/vnd.sun.xml.writer.template": {
    source: "apache",
    extensions: ["stw"]
  },
  "application/vnd.sus-calendar": {
    source: "iana",
    extensions: ["sus", "susp"]
  },
  "application/vnd.svd": {
    source: "iana",
    extensions: ["svd"]
  },
  "application/vnd.swiftview-ics": {
    source: "iana"
  },
  "application/vnd.sycle+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.syft+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.symbian.install": {
    source: "apache",
    extensions: ["sis", "sisx"]
  },
  "application/vnd.syncml+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true,
    extensions: ["xsm"]
  },
  "application/vnd.syncml.dm+wbxml": {
    source: "iana",
    charset: "UTF-8",
    extensions: ["bdm"]
  },
  "application/vnd.syncml.dm+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true,
    extensions: ["xdm"]
  },
  "application/vnd.syncml.dm.notification": {
    source: "iana"
  },
  "application/vnd.syncml.dmddf+wbxml": {
    source: "iana"
  },
  "application/vnd.syncml.dmddf+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true,
    extensions: ["ddf"]
  },
  "application/vnd.syncml.dmtnds+wbxml": {
    source: "iana"
  },
  "application/vnd.syncml.dmtnds+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/vnd.syncml.ds.notification": {
    source: "iana"
  },
  "application/vnd.tableschema+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.tao.intent-module-archive": {
    source: "iana",
    extensions: ["tao"]
  },
  "application/vnd.tcpdump.pcap": {
    source: "iana",
    extensions: ["pcap", "cap", "dmp"]
  },
  "application/vnd.think-cell.ppttc+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.tmd.mediaflex.api+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.tml": {
    source: "iana"
  },
  "application/vnd.tmobile-livetv": {
    source: "iana",
    extensions: ["tmo"]
  },
  "application/vnd.tri.onesource": {
    source: "iana"
  },
  "application/vnd.trid.tpt": {
    source: "iana",
    extensions: ["tpt"]
  },
  "application/vnd.triscape.mxs": {
    source: "iana",
    extensions: ["mxs"]
  },
  "application/vnd.trueapp": {
    source: "iana",
    extensions: ["tra"]
  },
  "application/vnd.truedoc": {
    source: "iana"
  },
  "application/vnd.ubisoft.webplayer": {
    source: "iana"
  },
  "application/vnd.ufdl": {
    source: "iana",
    extensions: ["ufd", "ufdl"]
  },
  "application/vnd.uiq.theme": {
    source: "iana",
    extensions: ["utz"]
  },
  "application/vnd.umajin": {
    source: "iana",
    extensions: ["umj"]
  },
  "application/vnd.unity": {
    source: "iana",
    extensions: ["unityweb"]
  },
  "application/vnd.uoml+xml": {
    source: "iana",
    compressible: true,
    extensions: ["uoml", "uo"]
  },
  "application/vnd.uplanet.alert": {
    source: "iana"
  },
  "application/vnd.uplanet.alert-wbxml": {
    source: "iana"
  },
  "application/vnd.uplanet.bearer-choice": {
    source: "iana"
  },
  "application/vnd.uplanet.bearer-choice-wbxml": {
    source: "iana"
  },
  "application/vnd.uplanet.cacheop": {
    source: "iana"
  },
  "application/vnd.uplanet.cacheop-wbxml": {
    source: "iana"
  },
  "application/vnd.uplanet.channel": {
    source: "iana"
  },
  "application/vnd.uplanet.channel-wbxml": {
    source: "iana"
  },
  "application/vnd.uplanet.list": {
    source: "iana"
  },
  "application/vnd.uplanet.list-wbxml": {
    source: "iana"
  },
  "application/vnd.uplanet.listcmd": {
    source: "iana"
  },
  "application/vnd.uplanet.listcmd-wbxml": {
    source: "iana"
  },
  "application/vnd.uplanet.signal": {
    source: "iana"
  },
  "application/vnd.uri-map": {
    source: "iana"
  },
  "application/vnd.valve.source.material": {
    source: "iana"
  },
  "application/vnd.vcx": {
    source: "iana",
    extensions: ["vcx"]
  },
  "application/vnd.vd-study": {
    source: "iana"
  },
  "application/vnd.vectorworks": {
    source: "iana"
  },
  "application/vnd.vel+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.verimatrix.vcas": {
    source: "iana"
  },
  "application/vnd.veritone.aion+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.veryant.thin": {
    source: "iana"
  },
  "application/vnd.ves.encrypted": {
    source: "iana"
  },
  "application/vnd.vidsoft.vidconference": {
    source: "iana"
  },
  "application/vnd.visio": {
    source: "iana",
    extensions: ["vsd", "vst", "vss", "vsw"]
  },
  "application/vnd.visionary": {
    source: "iana",
    extensions: ["vis"]
  },
  "application/vnd.vividence.scriptfile": {
    source: "iana"
  },
  "application/vnd.vsf": {
    source: "iana",
    extensions: ["vsf"]
  },
  "application/vnd.wap.sic": {
    source: "iana"
  },
  "application/vnd.wap.slc": {
    source: "iana"
  },
  "application/vnd.wap.wbxml": {
    source: "iana",
    charset: "UTF-8",
    extensions: ["wbxml"]
  },
  "application/vnd.wap.wmlc": {
    source: "iana",
    extensions: ["wmlc"]
  },
  "application/vnd.wap.wmlscriptc": {
    source: "iana",
    extensions: ["wmlsc"]
  },
  "application/vnd.webturbo": {
    source: "iana",
    extensions: ["wtb"]
  },
  "application/vnd.wfa.dpp": {
    source: "iana"
  },
  "application/vnd.wfa.p2p": {
    source: "iana"
  },
  "application/vnd.wfa.wsc": {
    source: "iana"
  },
  "application/vnd.windows.devicepairing": {
    source: "iana"
  },
  "application/vnd.wmc": {
    source: "iana"
  },
  "application/vnd.wmf.bootstrap": {
    source: "iana"
  },
  "application/vnd.wolfram.mathematica": {
    source: "iana"
  },
  "application/vnd.wolfram.mathematica.package": {
    source: "iana"
  },
  "application/vnd.wolfram.player": {
    source: "iana",
    extensions: ["nbp"]
  },
  "application/vnd.wordperfect": {
    source: "iana",
    extensions: ["wpd"]
  },
  "application/vnd.wqd": {
    source: "iana",
    extensions: ["wqd"]
  },
  "application/vnd.wrq-hp3000-labelled": {
    source: "iana"
  },
  "application/vnd.wt.stf": {
    source: "iana",
    extensions: ["stf"]
  },
  "application/vnd.wv.csp+wbxml": {
    source: "iana"
  },
  "application/vnd.wv.csp+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.wv.ssp+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.xacml+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.xara": {
    source: "iana",
    extensions: ["xar"]
  },
  "application/vnd.xfdl": {
    source: "iana",
    extensions: ["xfdl"]
  },
  "application/vnd.xfdl.webform": {
    source: "iana"
  },
  "application/vnd.xmi+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.xmpie.cpkg": {
    source: "iana"
  },
  "application/vnd.xmpie.dpkg": {
    source: "iana"
  },
  "application/vnd.xmpie.plan": {
    source: "iana"
  },
  "application/vnd.xmpie.ppkg": {
    source: "iana"
  },
  "application/vnd.xmpie.xlim": {
    source: "iana"
  },
  "application/vnd.yamaha.hv-dic": {
    source: "iana",
    extensions: ["hvd"]
  },
  "application/vnd.yamaha.hv-script": {
    source: "iana",
    extensions: ["hvs"]
  },
  "application/vnd.yamaha.hv-voice": {
    source: "iana",
    extensions: ["hvp"]
  },
  "application/vnd.yamaha.openscoreformat": {
    source: "iana",
    extensions: ["osf"]
  },
  "application/vnd.yamaha.openscoreformat.osfpvg+xml": {
    source: "iana",
    compressible: true,
    extensions: ["osfpvg"]
  },
  "application/vnd.yamaha.remote-setup": {
    source: "iana"
  },
  "application/vnd.yamaha.smaf-audio": {
    source: "iana",
    extensions: ["saf"]
  },
  "application/vnd.yamaha.smaf-phrase": {
    source: "iana",
    extensions: ["spf"]
  },
  "application/vnd.yamaha.through-ngn": {
    source: "iana"
  },
  "application/vnd.yamaha.tunnel-udpencap": {
    source: "iana"
  },
  "application/vnd.yaoweme": {
    source: "iana"
  },
  "application/vnd.yellowriver-custom-menu": {
    source: "iana",
    extensions: ["cmp"]
  },
  "application/vnd.zul": {
    source: "iana",
    extensions: ["zir", "zirz"]
  },
  "application/vnd.zzazz.deck+xml": {
    source: "iana",
    compressible: true,
    extensions: ["zaz"]
  },
  "application/voicexml+xml": {
    source: "iana",
    compressible: true,
    extensions: ["vxml"]
  },
  "application/voucher-cms+json": {
    source: "iana",
    compressible: true
  },
  "application/vq-rtcpxr": {
    source: "iana"
  },
  "application/wasm": {
    source: "iana",
    compressible: true,
    extensions: ["wasm"]
  },
  "application/watcherinfo+xml": {
    source: "iana",
    compressible: true,
    extensions: ["wif"]
  },
  "application/webpush-options+json": {
    source: "iana",
    compressible: true
  },
  "application/whoispp-query": {
    source: "iana"
  },
  "application/whoispp-response": {
    source: "iana"
  },
  "application/widget": {
    source: "iana",
    extensions: ["wgt"]
  },
  "application/winhlp": {
    source: "apache",
    extensions: ["hlp"]
  },
  "application/wita": {
    source: "iana"
  },
  "application/wordperfect5.1": {
    source: "iana"
  },
  "application/wsdl+xml": {
    source: "iana",
    compressible: true,
    extensions: ["wsdl"]
  },
  "application/wspolicy+xml": {
    source: "iana",
    compressible: true,
    extensions: ["wspolicy"]
  },
  "application/x-7z-compressed": {
    source: "apache",
    compressible: false,
    extensions: ["7z"]
  },
  "application/x-abiword": {
    source: "apache",
    extensions: ["abw"]
  },
  "application/x-ace-compressed": {
    source: "apache",
    extensions: ["ace"]
  },
  "application/x-amf": {
    source: "apache"
  },
  "application/x-apple-diskimage": {
    source: "apache",
    extensions: ["dmg"]
  },
  "application/x-arj": {
    compressible: false,
    extensions: ["arj"]
  },
  "application/x-authorware-bin": {
    source: "apache",
    extensions: ["aab", "x32", "u32", "vox"]
  },
  "application/x-authorware-map": {
    source: "apache",
    extensions: ["aam"]
  },
  "application/x-authorware-seg": {
    source: "apache",
    extensions: ["aas"]
  },
  "application/x-bcpio": {
    source: "apache",
    extensions: ["bcpio"]
  },
  "application/x-bdoc": {
    compressible: false,
    extensions: ["bdoc"]
  },
  "application/x-bittorrent": {
    source: "apache",
    extensions: ["torrent"]
  },
  "application/x-blorb": {
    source: "apache",
    extensions: ["blb", "blorb"]
  },
  "application/x-bzip": {
    source: "apache",
    compressible: false,
    extensions: ["bz"]
  },
  "application/x-bzip2": {
    source: "apache",
    compressible: false,
    extensions: ["bz2", "boz"]
  },
  "application/x-cbr": {
    source: "apache",
    extensions: ["cbr", "cba", "cbt", "cbz", "cb7"]
  },
  "application/x-cdlink": {
    source: "apache",
    extensions: ["vcd"]
  },
  "application/x-cfs-compressed": {
    source: "apache",
    extensions: ["cfs"]
  },
  "application/x-chat": {
    source: "apache",
    extensions: ["chat"]
  },
  "application/x-chess-pgn": {
    source: "apache",
    extensions: ["pgn"]
  },
  "application/x-chrome-extension": {
    extensions: ["crx"]
  },
  "application/x-cocoa": {
    source: "nginx",
    extensions: ["cco"]
  },
  "application/x-compress": {
    source: "apache"
  },
  "application/x-conference": {
    source: "apache",
    extensions: ["nsc"]
  },
  "application/x-cpio": {
    source: "apache",
    extensions: ["cpio"]
  },
  "application/x-csh": {
    source: "apache",
    extensions: ["csh"]
  },
  "application/x-deb": {
    compressible: false
  },
  "application/x-debian-package": {
    source: "apache",
    extensions: ["deb", "udeb"]
  },
  "application/x-dgc-compressed": {
    source: "apache",
    extensions: ["dgc"]
  },
  "application/x-director": {
    source: "apache",
    extensions: ["dir", "dcr", "dxr", "cst", "cct", "cxt", "w3d", "fgd", "swa"]
  },
  "application/x-doom": {
    source: "apache",
    extensions: ["wad"]
  },
  "application/x-dtbncx+xml": {
    source: "apache",
    compressible: true,
    extensions: ["ncx"]
  },
  "application/x-dtbook+xml": {
    source: "apache",
    compressible: true,
    extensions: ["dtb"]
  },
  "application/x-dtbresource+xml": {
    source: "apache",
    compressible: true,
    extensions: ["res"]
  },
  "application/x-dvi": {
    source: "apache",
    compressible: false,
    extensions: ["dvi"]
  },
  "application/x-envoy": {
    source: "apache",
    extensions: ["evy"]
  },
  "application/x-eva": {
    source: "apache",
    extensions: ["eva"]
  },
  "application/x-font-bdf": {
    source: "apache",
    extensions: ["bdf"]
  },
  "application/x-font-dos": {
    source: "apache"
  },
  "application/x-font-framemaker": {
    source: "apache"
  },
  "application/x-font-ghostscript": {
    source: "apache",
    extensions: ["gsf"]
  },
  "application/x-font-libgrx": {
    source: "apache"
  },
  "application/x-font-linux-psf": {
    source: "apache",
    extensions: ["psf"]
  },
  "application/x-font-pcf": {
    source: "apache",
    extensions: ["pcf"]
  },
  "application/x-font-snf": {
    source: "apache",
    extensions: ["snf"]
  },
  "application/x-font-speedo": {
    source: "apache"
  },
  "application/x-font-sunos-news": {
    source: "apache"
  },
  "application/x-font-type1": {
    source: "apache",
    extensions: ["pfa", "pfb", "pfm", "afm"]
  },
  "application/x-font-vfont": {
    source: "apache"
  },
  "application/x-freearc": {
    source: "apache",
    extensions: ["arc"]
  },
  "application/x-futuresplash": {
    source: "apache",
    extensions: ["spl"]
  },
  "application/x-gca-compressed": {
    source: "apache",
    extensions: ["gca"]
  },
  "application/x-glulx": {
    source: "apache",
    extensions: ["ulx"]
  },
  "application/x-gnumeric": {
    source: "apache",
    extensions: ["gnumeric"]
  },
  "application/x-gramps-xml": {
    source: "apache",
    extensions: ["gramps"]
  },
  "application/x-gtar": {
    source: "apache",
    extensions: ["gtar"]
  },
  "application/x-gzip": {
    source: "apache"
  },
  "application/x-hdf": {
    source: "apache",
    extensions: ["hdf"]
  },
  "application/x-httpd-php": {
    compressible: true,
    extensions: ["php"]
  },
  "application/x-install-instructions": {
    source: "apache",
    extensions: ["install"]
  },
  "application/x-iso9660-image": {
    source: "apache",
    extensions: ["iso"]
  },
  "application/x-iwork-keynote-sffkey": {
    extensions: ["key"]
  },
  "application/x-iwork-numbers-sffnumbers": {
    extensions: ["numbers"]
  },
  "application/x-iwork-pages-sffpages": {
    extensions: ["pages"]
  },
  "application/x-java-archive-diff": {
    source: "nginx",
    extensions: ["jardiff"]
  },
  "application/x-java-jnlp-file": {
    source: "apache",
    compressible: false,
    extensions: ["jnlp"]
  },
  "application/x-javascript": {
    compressible: true
  },
  "application/x-keepass2": {
    extensions: ["kdbx"]
  },
  "application/x-latex": {
    source: "apache",
    compressible: false,
    extensions: ["latex"]
  },
  "application/x-lua-bytecode": {
    extensions: ["luac"]
  },
  "application/x-lzh-compressed": {
    source: "apache",
    extensions: ["lzh", "lha"]
  },
  "application/x-makeself": {
    source: "nginx",
    extensions: ["run"]
  },
  "application/x-mie": {
    source: "apache",
    extensions: ["mie"]
  },
  "application/x-mobipocket-ebook": {
    source: "apache",
    extensions: ["prc", "mobi"]
  },
  "application/x-mpegurl": {
    compressible: false
  },
  "application/x-ms-application": {
    source: "apache",
    extensions: ["application"]
  },
  "application/x-ms-shortcut": {
    source: "apache",
    extensions: ["lnk"]
  },
  "application/x-ms-wmd": {
    source: "apache",
    extensions: ["wmd"]
  },
  "application/x-ms-wmz": {
    source: "apache",
    extensions: ["wmz"]
  },
  "application/x-ms-xbap": {
    source: "apache",
    extensions: ["xbap"]
  },
  "application/x-msaccess": {
    source: "apache",
    extensions: ["mdb"]
  },
  "application/x-msbinder": {
    source: "apache",
    extensions: ["obd"]
  },
  "application/x-mscardfile": {
    source: "apache",
    extensions: ["crd"]
  },
  "application/x-msclip": {
    source: "apache",
    extensions: ["clp"]
  },
  "application/x-msdos-program": {
    extensions: ["exe"]
  },
  "application/x-msdownload": {
    source: "apache",
    extensions: ["exe", "dll", "com", "bat", "msi"]
  },
  "application/x-msmediaview": {
    source: "apache",
    extensions: ["mvb", "m13", "m14"]
  },
  "application/x-msmetafile": {
    source: "apache",
    extensions: ["wmf", "wmz", "emf", "emz"]
  },
  "application/x-msmoney": {
    source: "apache",
    extensions: ["mny"]
  },
  "application/x-mspublisher": {
    source: "apache",
    extensions: ["pub"]
  },
  "application/x-msschedule": {
    source: "apache",
    extensions: ["scd"]
  },
  "application/x-msterminal": {
    source: "apache",
    extensions: ["trm"]
  },
  "application/x-mswrite": {
    source: "apache",
    extensions: ["wri"]
  },
  "application/x-netcdf": {
    source: "apache",
    extensions: ["nc", "cdf"]
  },
  "application/x-ns-proxy-autoconfig": {
    compressible: true,
    extensions: ["pac"]
  },
  "application/x-nzb": {
    source: "apache",
    extensions: ["nzb"]
  },
  "application/x-perl": {
    source: "nginx",
    extensions: ["pl", "pm"]
  },
  "application/x-pilot": {
    source: "nginx",
    extensions: ["prc", "pdb"]
  },
  "application/x-pkcs12": {
    source: "apache",
    compressible: false,
    extensions: ["p12", "pfx"]
  },
  "application/x-pkcs7-certificates": {
    source: "apache",
    extensions: ["p7b", "spc"]
  },
  "application/x-pkcs7-certreqresp": {
    source: "apache",
    extensions: ["p7r"]
  },
  "application/x-pki-message": {
    source: "iana"
  },
  "application/x-rar-compressed": {
    source: "apache",
    compressible: false,
    extensions: ["rar"]
  },
  "application/x-redhat-package-manager": {
    source: "nginx",
    extensions: ["rpm"]
  },
  "application/x-research-info-systems": {
    source: "apache",
    extensions: ["ris"]
  },
  "application/x-sea": {
    source: "nginx",
    extensions: ["sea"]
  },
  "application/x-sh": {
    source: "apache",
    compressible: true,
    extensions: ["sh"]
  },
  "application/x-shar": {
    source: "apache",
    extensions: ["shar"]
  },
  "application/x-shockwave-flash": {
    source: "apache",
    compressible: false,
    extensions: ["swf"]
  },
  "application/x-silverlight-app": {
    source: "apache",
    extensions: ["xap"]
  },
  "application/x-sql": {
    source: "apache",
    extensions: ["sql"]
  },
  "application/x-stuffit": {
    source: "apache",
    compressible: false,
    extensions: ["sit"]
  },
  "application/x-stuffitx": {
    source: "apache",
    extensions: ["sitx"]
  },
  "application/x-subrip": {
    source: "apache",
    extensions: ["srt"]
  },
  "application/x-sv4cpio": {
    source: "apache",
    extensions: ["sv4cpio"]
  },
  "application/x-sv4crc": {
    source: "apache",
    extensions: ["sv4crc"]
  },
  "application/x-t3vm-image": {
    source: "apache",
    extensions: ["t3"]
  },
  "application/x-tads": {
    source: "apache",
    extensions: ["gam"]
  },
  "application/x-tar": {
    source: "apache",
    compressible: true,
    extensions: ["tar"]
  },
  "application/x-tcl": {
    source: "apache",
    extensions: ["tcl", "tk"]
  },
  "application/x-tex": {
    source: "apache",
    extensions: ["tex"]
  },
  "application/x-tex-tfm": {
    source: "apache",
    extensions: ["tfm"]
  },
  "application/x-texinfo": {
    source: "apache",
    extensions: ["texinfo", "texi"]
  },
  "application/x-tgif": {
    source: "apache",
    extensions: ["obj"]
  },
  "application/x-ustar": {
    source: "apache",
    extensions: ["ustar"]
  },
  "application/x-virtualbox-hdd": {
    compressible: true,
    extensions: ["hdd"]
  },
  "application/x-virtualbox-ova": {
    compressible: true,
    extensions: ["ova"]
  },
  "application/x-virtualbox-ovf": {
    compressible: true,
    extensions: ["ovf"]
  },
  "application/x-virtualbox-vbox": {
    compressible: true,
    extensions: ["vbox"]
  },
  "application/x-virtualbox-vbox-extpack": {
    compressible: false,
    extensions: ["vbox-extpack"]
  },
  "application/x-virtualbox-vdi": {
    compressible: true,
    extensions: ["vdi"]
  },
  "application/x-virtualbox-vhd": {
    compressible: true,
    extensions: ["vhd"]
  },
  "application/x-virtualbox-vmdk": {
    compressible: true,
    extensions: ["vmdk"]
  },
  "application/x-wais-source": {
    source: "apache",
    extensions: ["src"]
  },
  "application/x-web-app-manifest+json": {
    compressible: true,
    extensions: ["webapp"]
  },
  "application/x-www-form-urlencoded": {
    source: "iana",
    compressible: true
  },
  "application/x-x509-ca-cert": {
    source: "iana",
    extensions: ["der", "crt", "pem"]
  },
  "application/x-x509-ca-ra-cert": {
    source: "iana"
  },
  "application/x-x509-next-ca-cert": {
    source: "iana"
  },
  "application/x-xfig": {
    source: "apache",
    extensions: ["fig"]
  },
  "application/x-xliff+xml": {
    source: "apache",
    compressible: true,
    extensions: ["xlf"]
  },
  "application/x-xpinstall": {
    source: "apache",
    compressible: false,
    extensions: ["xpi"]
  },
  "application/x-xz": {
    source: "apache",
    extensions: ["xz"]
  },
  "application/x-zmachine": {
    source: "apache",
    extensions: ["z1", "z2", "z3", "z4", "z5", "z6", "z7", "z8"]
  },
  "application/x400-bp": {
    source: "iana"
  },
  "application/xacml+xml": {
    source: "iana",
    compressible: true
  },
  "application/xaml+xml": {
    source: "apache",
    compressible: true,
    extensions: ["xaml"]
  },
  "application/xcap-att+xml": {
    source: "iana",
    compressible: true,
    extensions: ["xav"]
  },
  "application/xcap-caps+xml": {
    source: "iana",
    compressible: true,
    extensions: ["xca"]
  },
  "application/xcap-diff+xml": {
    source: "iana",
    compressible: true,
    extensions: ["xdf"]
  },
  "application/xcap-el+xml": {
    source: "iana",
    compressible: true,
    extensions: ["xel"]
  },
  "application/xcap-error+xml": {
    source: "iana",
    compressible: true
  },
  "application/xcap-ns+xml": {
    source: "iana",
    compressible: true,
    extensions: ["xns"]
  },
  "application/xcon-conference-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/xcon-conference-info-diff+xml": {
    source: "iana",
    compressible: true
  },
  "application/xenc+xml": {
    source: "iana",
    compressible: true,
    extensions: ["xenc"]
  },
  "application/xfdf": {
    source: "iana",
    extensions: ["xfdf"]
  },
  "application/xhtml+xml": {
    source: "iana",
    compressible: true,
    extensions: ["xhtml", "xht"]
  },
  "application/xhtml-voice+xml": {
    source: "apache",
    compressible: true
  },
  "application/xliff+xml": {
    source: "iana",
    compressible: true,
    extensions: ["xlf"]
  },
  "application/xml": {
    source: "iana",
    compressible: true,
    extensions: ["xml", "xsl", "xsd", "rng"]
  },
  "application/xml-dtd": {
    source: "iana",
    compressible: true,
    extensions: ["dtd"]
  },
  "application/xml-external-parsed-entity": {
    source: "iana"
  },
  "application/xml-patch+xml": {
    source: "iana",
    compressible: true
  },
  "application/xmpp+xml": {
    source: "iana",
    compressible: true
  },
  "application/xop+xml": {
    source: "iana",
    compressible: true,
    extensions: ["xop"]
  },
  "application/xproc+xml": {
    source: "apache",
    compressible: true,
    extensions: ["xpl"]
  },
  "application/xslt+xml": {
    source: "iana",
    compressible: true,
    extensions: ["xsl", "xslt"]
  },
  "application/xspf+xml": {
    source: "apache",
    compressible: true,
    extensions: ["xspf"]
  },
  "application/xv+xml": {
    source: "iana",
    compressible: true,
    extensions: ["mxml", "xhvml", "xvml", "xvm"]
  },
  "application/yang": {
    source: "iana",
    extensions: ["yang"]
  },
  "application/yang-data+cbor": {
    source: "iana"
  },
  "application/yang-data+json": {
    source: "iana",
    compressible: true
  },
  "application/yang-data+xml": {
    source: "iana",
    compressible: true
  },
  "application/yang-patch+json": {
    source: "iana",
    compressible: true
  },
  "application/yang-patch+xml": {
    source: "iana",
    compressible: true
  },
  "application/yin+xml": {
    source: "iana",
    compressible: true,
    extensions: ["yin"]
  },
  "application/zip": {
    source: "iana",
    compressible: false,
    extensions: ["zip"]
  },
  "application/zlib": {
    source: "iana"
  },
  "application/zstd": {
    source: "iana"
  },
  "audio/1d-interleaved-parityfec": {
    source: "iana"
  },
  "audio/32kadpcm": {
    source: "iana"
  },
  "audio/3gpp": {
    source: "iana",
    compressible: false,
    extensions: ["3gpp"]
  },
  "audio/3gpp2": {
    source: "iana"
  },
  "audio/aac": {
    source: "iana",
    extensions: ["adts", "aac"]
  },
  "audio/ac3": {
    source: "iana"
  },
  "audio/adpcm": {
    source: "apache",
    extensions: ["adp"]
  },
  "audio/amr": {
    source: "iana",
    extensions: ["amr"]
  },
  "audio/amr-wb": {
    source: "iana"
  },
  "audio/amr-wb+": {
    source: "iana"
  },
  "audio/aptx": {
    source: "iana"
  },
  "audio/asc": {
    source: "iana"
  },
  "audio/atrac-advanced-lossless": {
    source: "iana"
  },
  "audio/atrac-x": {
    source: "iana"
  },
  "audio/atrac3": {
    source: "iana"
  },
  "audio/basic": {
    source: "iana",
    compressible: false,
    extensions: ["au", "snd"]
  },
  "audio/bv16": {
    source: "iana"
  },
  "audio/bv32": {
    source: "iana"
  },
  "audio/clearmode": {
    source: "iana"
  },
  "audio/cn": {
    source: "iana"
  },
  "audio/dat12": {
    source: "iana"
  },
  "audio/dls": {
    source: "iana"
  },
  "audio/dsr-es201108": {
    source: "iana"
  },
  "audio/dsr-es202050": {
    source: "iana"
  },
  "audio/dsr-es202211": {
    source: "iana"
  },
  "audio/dsr-es202212": {
    source: "iana"
  },
  "audio/dv": {
    source: "iana"
  },
  "audio/dvi4": {
    source: "iana"
  },
  "audio/eac3": {
    source: "iana"
  },
  "audio/encaprtp": {
    source: "iana"
  },
  "audio/evrc": {
    source: "iana"
  },
  "audio/evrc-qcp": {
    source: "iana"
  },
  "audio/evrc0": {
    source: "iana"
  },
  "audio/evrc1": {
    source: "iana"
  },
  "audio/evrcb": {
    source: "iana"
  },
  "audio/evrcb0": {
    source: "iana"
  },
  "audio/evrcb1": {
    source: "iana"
  },
  "audio/evrcnw": {
    source: "iana"
  },
  "audio/evrcnw0": {
    source: "iana"
  },
  "audio/evrcnw1": {
    source: "iana"
  },
  "audio/evrcwb": {
    source: "iana"
  },
  "audio/evrcwb0": {
    source: "iana"
  },
  "audio/evrcwb1": {
    source: "iana"
  },
  "audio/evs": {
    source: "iana"
  },
  "audio/flexfec": {
    source: "iana"
  },
  "audio/fwdred": {
    source: "iana"
  },
  "audio/g711-0": {
    source: "iana"
  },
  "audio/g719": {
    source: "iana"
  },
  "audio/g722": {
    source: "iana"
  },
  "audio/g7221": {
    source: "iana"
  },
  "audio/g723": {
    source: "iana"
  },
  "audio/g726-16": {
    source: "iana"
  },
  "audio/g726-24": {
    source: "iana"
  },
  "audio/g726-32": {
    source: "iana"
  },
  "audio/g726-40": {
    source: "iana"
  },
  "audio/g728": {
    source: "iana"
  },
  "audio/g729": {
    source: "iana"
  },
  "audio/g7291": {
    source: "iana"
  },
  "audio/g729d": {
    source: "iana"
  },
  "audio/g729e": {
    source: "iana"
  },
  "audio/gsm": {
    source: "iana"
  },
  "audio/gsm-efr": {
    source: "iana"
  },
  "audio/gsm-hr-08": {
    source: "iana"
  },
  "audio/ilbc": {
    source: "iana"
  },
  "audio/ip-mr_v2.5": {
    source: "iana"
  },
  "audio/isac": {
    source: "apache"
  },
  "audio/l16": {
    source: "iana"
  },
  "audio/l20": {
    source: "iana"
  },
  "audio/l24": {
    source: "iana",
    compressible: false
  },
  "audio/l8": {
    source: "iana"
  },
  "audio/lpc": {
    source: "iana"
  },
  "audio/melp": {
    source: "iana"
  },
  "audio/melp1200": {
    source: "iana"
  },
  "audio/melp2400": {
    source: "iana"
  },
  "audio/melp600": {
    source: "iana"
  },
  "audio/mhas": {
    source: "iana"
  },
  "audio/midi": {
    source: "apache",
    extensions: ["mid", "midi", "kar", "rmi"]
  },
  "audio/mobile-xmf": {
    source: "iana",
    extensions: ["mxmf"]
  },
  "audio/mp3": {
    compressible: false,
    extensions: ["mp3"]
  },
  "audio/mp4": {
    source: "iana",
    compressible: false,
    extensions: ["m4a", "mp4a"]
  },
  "audio/mp4a-latm": {
    source: "iana"
  },
  "audio/mpa": {
    source: "iana"
  },
  "audio/mpa-robust": {
    source: "iana"
  },
  "audio/mpeg": {
    source: "iana",
    compressible: false,
    extensions: ["mpga", "mp2", "mp2a", "mp3", "m2a", "m3a"]
  },
  "audio/mpeg4-generic": {
    source: "iana"
  },
  "audio/musepack": {
    source: "apache"
  },
  "audio/ogg": {
    source: "iana",
    compressible: false,
    extensions: ["oga", "ogg", "spx", "opus"]
  },
  "audio/opus": {
    source: "iana"
  },
  "audio/parityfec": {
    source: "iana"
  },
  "audio/pcma": {
    source: "iana"
  },
  "audio/pcma-wb": {
    source: "iana"
  },
  "audio/pcmu": {
    source: "iana"
  },
  "audio/pcmu-wb": {
    source: "iana"
  },
  "audio/prs.sid": {
    source: "iana"
  },
  "audio/qcelp": {
    source: "iana"
  },
  "audio/raptorfec": {
    source: "iana"
  },
  "audio/red": {
    source: "iana"
  },
  "audio/rtp-enc-aescm128": {
    source: "iana"
  },
  "audio/rtp-midi": {
    source: "iana"
  },
  "audio/rtploopback": {
    source: "iana"
  },
  "audio/rtx": {
    source: "iana"
  },
  "audio/s3m": {
    source: "apache",
    extensions: ["s3m"]
  },
  "audio/scip": {
    source: "iana"
  },
  "audio/silk": {
    source: "apache",
    extensions: ["sil"]
  },
  "audio/smv": {
    source: "iana"
  },
  "audio/smv-qcp": {
    source: "iana"
  },
  "audio/smv0": {
    source: "iana"
  },
  "audio/sofa": {
    source: "iana"
  },
  "audio/sp-midi": {
    source: "iana"
  },
  "audio/speex": {
    source: "iana"
  },
  "audio/t140c": {
    source: "iana"
  },
  "audio/t38": {
    source: "iana"
  },
  "audio/telephone-event": {
    source: "iana"
  },
  "audio/tetra_acelp": {
    source: "iana"
  },
  "audio/tetra_acelp_bb": {
    source: "iana"
  },
  "audio/tone": {
    source: "iana"
  },
  "audio/tsvcis": {
    source: "iana"
  },
  "audio/uemclip": {
    source: "iana"
  },
  "audio/ulpfec": {
    source: "iana"
  },
  "audio/usac": {
    source: "iana"
  },
  "audio/vdvi": {
    source: "iana"
  },
  "audio/vmr-wb": {
    source: "iana"
  },
  "audio/vnd.3gpp.iufp": {
    source: "iana"
  },
  "audio/vnd.4sb": {
    source: "iana"
  },
  "audio/vnd.audiokoz": {
    source: "iana"
  },
  "audio/vnd.celp": {
    source: "iana"
  },
  "audio/vnd.cisco.nse": {
    source: "iana"
  },
  "audio/vnd.cmles.radio-events": {
    source: "iana"
  },
  "audio/vnd.cns.anp1": {
    source: "iana"
  },
  "audio/vnd.cns.inf1": {
    source: "iana"
  },
  "audio/vnd.dece.audio": {
    source: "iana",
    extensions: ["uva", "uvva"]
  },
  "audio/vnd.digital-winds": {
    source: "iana",
    extensions: ["eol"]
  },
  "audio/vnd.dlna.adts": {
    source: "iana"
  },
  "audio/vnd.dolby.heaac.1": {
    source: "iana"
  },
  "audio/vnd.dolby.heaac.2": {
    source: "iana"
  },
  "audio/vnd.dolby.mlp": {
    source: "iana"
  },
  "audio/vnd.dolby.mps": {
    source: "iana"
  },
  "audio/vnd.dolby.pl2": {
    source: "iana"
  },
  "audio/vnd.dolby.pl2x": {
    source: "iana"
  },
  "audio/vnd.dolby.pl2z": {
    source: "iana"
  },
  "audio/vnd.dolby.pulse.1": {
    source: "iana"
  },
  "audio/vnd.dra": {
    source: "iana",
    extensions: ["dra"]
  },
  "audio/vnd.dts": {
    source: "iana",
    extensions: ["dts"]
  },
  "audio/vnd.dts.hd": {
    source: "iana",
    extensions: ["dtshd"]
  },
  "audio/vnd.dts.uhd": {
    source: "iana"
  },
  "audio/vnd.dvb.file": {
    source: "iana"
  },
  "audio/vnd.everad.plj": {
    source: "iana"
  },
  "audio/vnd.hns.audio": {
    source: "iana"
  },
  "audio/vnd.lucent.voice": {
    source: "iana",
    extensions: ["lvp"]
  },
  "audio/vnd.ms-playready.media.pya": {
    source: "iana",
    extensions: ["pya"]
  },
  "audio/vnd.nokia.mobile-xmf": {
    source: "iana"
  },
  "audio/vnd.nortel.vbk": {
    source: "iana"
  },
  "audio/vnd.nuera.ecelp4800": {
    source: "iana",
    extensions: ["ecelp4800"]
  },
  "audio/vnd.nuera.ecelp7470": {
    source: "iana",
    extensions: ["ecelp7470"]
  },
  "audio/vnd.nuera.ecelp9600": {
    source: "iana",
    extensions: ["ecelp9600"]
  },
  "audio/vnd.octel.sbc": {
    source: "iana"
  },
  "audio/vnd.presonus.multitrack": {
    source: "iana"
  },
  "audio/vnd.qcelp": {
    source: "apache"
  },
  "audio/vnd.rhetorex.32kadpcm": {
    source: "iana"
  },
  "audio/vnd.rip": {
    source: "iana",
    extensions: ["rip"]
  },
  "audio/vnd.rn-realaudio": {
    compressible: false
  },
  "audio/vnd.sealedmedia.softseal.mpeg": {
    source: "iana"
  },
  "audio/vnd.vmx.cvsd": {
    source: "iana"
  },
  "audio/vnd.wave": {
    compressible: false
  },
  "audio/vorbis": {
    source: "iana",
    compressible: false
  },
  "audio/vorbis-config": {
    source: "iana"
  },
  "audio/wav": {
    compressible: false,
    extensions: ["wav"]
  },
  "audio/wave": {
    compressible: false,
    extensions: ["wav"]
  },
  "audio/webm": {
    source: "apache",
    compressible: false,
    extensions: ["weba"]
  },
  "audio/x-aac": {
    source: "apache",
    compressible: false,
    extensions: ["aac"]
  },
  "audio/x-aiff": {
    source: "apache",
    extensions: ["aif", "aiff", "aifc"]
  },
  "audio/x-caf": {
    source: "apache",
    compressible: false,
    extensions: ["caf"]
  },
  "audio/x-flac": {
    source: "apache",
    extensions: ["flac"]
  },
  "audio/x-m4a": {
    source: "nginx",
    extensions: ["m4a"]
  },
  "audio/x-matroska": {
    source: "apache",
    extensions: ["mka"]
  },
  "audio/x-mpegurl": {
    source: "apache",
    extensions: ["m3u"]
  },
  "audio/x-ms-wax": {
    source: "apache",
    extensions: ["wax"]
  },
  "audio/x-ms-wma": {
    source: "apache",
    extensions: ["wma"]
  },
  "audio/x-pn-realaudio": {
    source: "apache",
    extensions: ["ram", "ra"]
  },
  "audio/x-pn-realaudio-plugin": {
    source: "apache",
    extensions: ["rmp"]
  },
  "audio/x-realaudio": {
    source: "nginx",
    extensions: ["ra"]
  },
  "audio/x-tta": {
    source: "apache"
  },
  "audio/x-wav": {
    source: "apache",
    extensions: ["wav"]
  },
  "audio/xm": {
    source: "apache",
    extensions: ["xm"]
  },
  "chemical/x-cdx": {
    source: "apache",
    extensions: ["cdx"]
  },
  "chemical/x-cif": {
    source: "apache",
    extensions: ["cif"]
  },
  "chemical/x-cmdf": {
    source: "apache",
    extensions: ["cmdf"]
  },
  "chemical/x-cml": {
    source: "apache",
    extensions: ["cml"]
  },
  "chemical/x-csml": {
    source: "apache",
    extensions: ["csml"]
  },
  "chemical/x-pdb": {
    source: "apache"
  },
  "chemical/x-xyz": {
    source: "apache",
    extensions: ["xyz"]
  },
  "font/collection": {
    source: "iana",
    extensions: ["ttc"]
  },
  "font/otf": {
    source: "iana",
    compressible: true,
    extensions: ["otf"]
  },
  "font/sfnt": {
    source: "iana"
  },
  "font/ttf": {
    source: "iana",
    compressible: true,
    extensions: ["ttf"]
  },
  "font/woff": {
    source: "iana",
    extensions: ["woff"]
  },
  "font/woff2": {
    source: "iana",
    extensions: ["woff2"]
  },
  "image/aces": {
    source: "iana",
    extensions: ["exr"]
  },
  "image/apng": {
    compressible: false,
    extensions: ["apng"]
  },
  "image/avci": {
    source: "iana",
    extensions: ["avci"]
  },
  "image/avcs": {
    source: "iana",
    extensions: ["avcs"]
  },
  "image/avif": {
    source: "iana",
    compressible: false,
    extensions: ["avif"]
  },
  "image/bmp": {
    source: "iana",
    compressible: true,
    extensions: ["bmp", "dib"]
  },
  "image/cgm": {
    source: "iana",
    extensions: ["cgm"]
  },
  "image/dicom-rle": {
    source: "iana",
    extensions: ["drle"]
  },
  "image/emf": {
    source: "iana",
    extensions: ["emf"]
  },
  "image/fits": {
    source: "iana",
    extensions: ["fits"]
  },
  "image/g3fax": {
    source: "iana",
    extensions: ["g3"]
  },
  "image/gif": {
    source: "iana",
    compressible: false,
    extensions: ["gif"]
  },
  "image/heic": {
    source: "iana",
    extensions: ["heic"]
  },
  "image/heic-sequence": {
    source: "iana",
    extensions: ["heics"]
  },
  "image/heif": {
    source: "iana",
    extensions: ["heif"]
  },
  "image/heif-sequence": {
    source: "iana",
    extensions: ["heifs"]
  },
  "image/hej2k": {
    source: "iana",
    extensions: ["hej2"]
  },
  "image/hsj2": {
    source: "iana",
    extensions: ["hsj2"]
  },
  "image/ief": {
    source: "iana",
    extensions: ["ief"]
  },
  "image/jls": {
    source: "iana",
    extensions: ["jls"]
  },
  "image/jp2": {
    source: "iana",
    compressible: false,
    extensions: ["jp2", "jpg2"]
  },
  "image/jpeg": {
    source: "iana",
    compressible: false,
    extensions: ["jpeg", "jpg", "jpe"]
  },
  "image/jph": {
    source: "iana",
    extensions: ["jph"]
  },
  "image/jphc": {
    source: "iana",
    extensions: ["jhc"]
  },
  "image/jpm": {
    source: "iana",
    compressible: false,
    extensions: ["jpm"]
  },
  "image/jpx": {
    source: "iana",
    compressible: false,
    extensions: ["jpx", "jpf"]
  },
  "image/jxr": {
    source: "iana",
    extensions: ["jxr"]
  },
  "image/jxra": {
    source: "iana",
    extensions: ["jxra"]
  },
  "image/jxrs": {
    source: "iana",
    extensions: ["jxrs"]
  },
  "image/jxs": {
    source: "iana",
    extensions: ["jxs"]
  },
  "image/jxsc": {
    source: "iana",
    extensions: ["jxsc"]
  },
  "image/jxsi": {
    source: "iana",
    extensions: ["jxsi"]
  },
  "image/jxss": {
    source: "iana",
    extensions: ["jxss"]
  },
  "image/ktx": {
    source: "iana",
    extensions: ["ktx"]
  },
  "image/ktx2": {
    source: "iana",
    extensions: ["ktx2"]
  },
  "image/naplps": {
    source: "iana"
  },
  "image/pjpeg": {
    compressible: false
  },
  "image/png": {
    source: "iana",
    compressible: false,
    extensions: ["png"]
  },
  "image/prs.btif": {
    source: "iana",
    extensions: ["btif", "btf"]
  },
  "image/prs.pti": {
    source: "iana",
    extensions: ["pti"]
  },
  "image/pwg-raster": {
    source: "iana"
  },
  "image/sgi": {
    source: "apache",
    extensions: ["sgi"]
  },
  "image/svg+xml": {
    source: "iana",
    compressible: true,
    extensions: ["svg", "svgz"]
  },
  "image/t38": {
    source: "iana",
    extensions: ["t38"]
  },
  "image/tiff": {
    source: "iana",
    compressible: false,
    extensions: ["tif", "tiff"]
  },
  "image/tiff-fx": {
    source: "iana",
    extensions: ["tfx"]
  },
  "image/vnd.adobe.photoshop": {
    source: "iana",
    compressible: true,
    extensions: ["psd"]
  },
  "image/vnd.airzip.accelerator.azv": {
    source: "iana",
    extensions: ["azv"]
  },
  "image/vnd.cns.inf2": {
    source: "iana"
  },
  "image/vnd.dece.graphic": {
    source: "iana",
    extensions: ["uvi", "uvvi", "uvg", "uvvg"]
  },
  "image/vnd.djvu": {
    source: "iana",
    extensions: ["djvu", "djv"]
  },
  "image/vnd.dvb.subtitle": {
    source: "iana",
    extensions: ["sub"]
  },
  "image/vnd.dwg": {
    source: "iana",
    extensions: ["dwg"]
  },
  "image/vnd.dxf": {
    source: "iana",
    extensions: ["dxf"]
  },
  "image/vnd.fastbidsheet": {
    source: "iana",
    extensions: ["fbs"]
  },
  "image/vnd.fpx": {
    source: "iana",
    extensions: ["fpx"]
  },
  "image/vnd.fst": {
    source: "iana",
    extensions: ["fst"]
  },
  "image/vnd.fujixerox.edmics-mmr": {
    source: "iana",
    extensions: ["mmr"]
  },
  "image/vnd.fujixerox.edmics-rlc": {
    source: "iana",
    extensions: ["rlc"]
  },
  "image/vnd.globalgraphics.pgb": {
    source: "iana"
  },
  "image/vnd.microsoft.icon": {
    source: "iana",
    compressible: true,
    extensions: ["ico"]
  },
  "image/vnd.mix": {
    source: "iana"
  },
  "image/vnd.mozilla.apng": {
    source: "iana",
    extensions: ["apng"]
  },
  "image/vnd.ms-dds": {
    compressible: true,
    extensions: ["dds"]
  },
  "image/vnd.ms-modi": {
    source: "iana",
    extensions: ["mdi"]
  },
  "image/vnd.ms-photo": {
    source: "apache",
    extensions: ["wdp"]
  },
  "image/vnd.net-fpx": {
    source: "iana",
    extensions: ["npx"]
  },
  "image/vnd.pco.b16": {
    source: "iana",
    extensions: ["b16"]
  },
  "image/vnd.radiance": {
    source: "iana"
  },
  "image/vnd.sealed.png": {
    source: "iana"
  },
  "image/vnd.sealedmedia.softseal.gif": {
    source: "iana"
  },
  "image/vnd.sealedmedia.softseal.jpg": {
    source: "iana"
  },
  "image/vnd.svf": {
    source: "iana"
  },
  "image/vnd.tencent.tap": {
    source: "iana",
    extensions: ["tap"]
  },
  "image/vnd.valve.source.texture": {
    source: "iana",
    extensions: ["vtf"]
  },
  "image/vnd.wap.wbmp": {
    source: "iana",
    extensions: ["wbmp"]
  },
  "image/vnd.xiff": {
    source: "iana",
    extensions: ["xif"]
  },
  "image/vnd.zbrush.pcx": {
    source: "iana",
    extensions: ["pcx"]
  },
  "image/webp": {
    source: "apache",
    extensions: ["webp"]
  },
  "image/wmf": {
    source: "iana",
    extensions: ["wmf"]
  },
  "image/x-3ds": {
    source: "apache",
    extensions: ["3ds"]
  },
  "image/x-cmu-raster": {
    source: "apache",
    extensions: ["ras"]
  },
  "image/x-cmx": {
    source: "apache",
    extensions: ["cmx"]
  },
  "image/x-freehand": {
    source: "apache",
    extensions: ["fh", "fhc", "fh4", "fh5", "fh7"]
  },
  "image/x-icon": {
    source: "apache",
    compressible: true,
    extensions: ["ico"]
  },
  "image/x-jng": {
    source: "nginx",
    extensions: ["jng"]
  },
  "image/x-mrsid-image": {
    source: "apache",
    extensions: ["sid"]
  },
  "image/x-ms-bmp": {
    source: "nginx",
    compressible: true,
    extensions: ["bmp"]
  },
  "image/x-pcx": {
    source: "apache",
    extensions: ["pcx"]
  },
  "image/x-pict": {
    source: "apache",
    extensions: ["pic", "pct"]
  },
  "image/x-portable-anymap": {
    source: "apache",
    extensions: ["pnm"]
  },
  "image/x-portable-bitmap": {
    source: "apache",
    extensions: ["pbm"]
  },
  "image/x-portable-graymap": {
    source: "apache",
    extensions: ["pgm"]
  },
  "image/x-portable-pixmap": {
    source: "apache",
    extensions: ["ppm"]
  },
  "image/x-rgb": {
    source: "apache",
    extensions: ["rgb"]
  },
  "image/x-tga": {
    source: "apache",
    extensions: ["tga"]
  },
  "image/x-xbitmap": {
    source: "apache",
    extensions: ["xbm"]
  },
  "image/x-xcf": {
    compressible: false
  },
  "image/x-xpixmap": {
    source: "apache",
    extensions: ["xpm"]
  },
  "image/x-xwindowdump": {
    source: "apache",
    extensions: ["xwd"]
  },
  "message/cpim": {
    source: "iana"
  },
  "message/delivery-status": {
    source: "iana"
  },
  "message/disposition-notification": {
    source: "iana",
    extensions: ["disposition-notification"]
  },
  "message/external-body": {
    source: "iana"
  },
  "message/feedback-report": {
    source: "iana"
  },
  "message/global": {
    source: "iana",
    extensions: ["u8msg"]
  },
  "message/global-delivery-status": {
    source: "iana",
    extensions: ["u8dsn"]
  },
  "message/global-disposition-notification": {
    source: "iana",
    extensions: ["u8mdn"]
  },
  "message/global-headers": {
    source: "iana",
    extensions: ["u8hdr"]
  },
  "message/http": {
    source: "iana",
    compressible: false
  },
  "message/imdn+xml": {
    source: "iana",
    compressible: true
  },
  "message/news": {
    source: "apache"
  },
  "message/partial": {
    source: "iana",
    compressible: false
  },
  "message/rfc822": {
    source: "iana",
    compressible: true,
    extensions: ["eml", "mime"]
  },
  "message/s-http": {
    source: "apache"
  },
  "message/sip": {
    source: "iana"
  },
  "message/sipfrag": {
    source: "iana"
  },
  "message/tracking-status": {
    source: "iana"
  },
  "message/vnd.si.simp": {
    source: "apache"
  },
  "message/vnd.wfa.wsc": {
    source: "iana",
    extensions: ["wsc"]
  },
  "model/3mf": {
    source: "iana",
    extensions: ["3mf"]
  },
  "model/e57": {
    source: "iana"
  },
  "model/gltf+json": {
    source: "iana",
    compressible: true,
    extensions: ["gltf"]
  },
  "model/gltf-binary": {
    source: "iana",
    compressible: true,
    extensions: ["glb"]
  },
  "model/iges": {
    source: "iana",
    compressible: false,
    extensions: ["igs", "iges"]
  },
  "model/mesh": {
    source: "iana",
    compressible: false,
    extensions: ["msh", "mesh", "silo"]
  },
  "model/mtl": {
    source: "iana",
    extensions: ["mtl"]
  },
  "model/obj": {
    source: "iana",
    extensions: ["obj"]
  },
  "model/prc": {
    source: "iana",
    extensions: ["prc"]
  },
  "model/step": {
    source: "iana"
  },
  "model/step+xml": {
    source: "iana",
    compressible: true,
    extensions: ["stpx"]
  },
  "model/step+zip": {
    source: "iana",
    compressible: false,
    extensions: ["stpz"]
  },
  "model/step-xml+zip": {
    source: "iana",
    compressible: false,
    extensions: ["stpxz"]
  },
  "model/stl": {
    source: "iana",
    extensions: ["stl"]
  },
  "model/u3d": {
    source: "iana",
    extensions: ["u3d"]
  },
  "model/vnd.collada+xml": {
    source: "iana",
    compressible: true,
    extensions: ["dae"]
  },
  "model/vnd.dwf": {
    source: "iana",
    extensions: ["dwf"]
  },
  "model/vnd.flatland.3dml": {
    source: "iana"
  },
  "model/vnd.gdl": {
    source: "iana",
    extensions: ["gdl"]
  },
  "model/vnd.gs-gdl": {
    source: "apache"
  },
  "model/vnd.gs.gdl": {
    source: "iana"
  },
  "model/vnd.gtw": {
    source: "iana",
    extensions: ["gtw"]
  },
  "model/vnd.moml+xml": {
    source: "iana",
    compressible: true
  },
  "model/vnd.mts": {
    source: "iana",
    extensions: ["mts"]
  },
  "model/vnd.opengex": {
    source: "iana",
    extensions: ["ogex"]
  },
  "model/vnd.parasolid.transmit.binary": {
    source: "iana",
    extensions: ["x_b"]
  },
  "model/vnd.parasolid.transmit.text": {
    source: "iana",
    extensions: ["x_t"]
  },
  "model/vnd.pytha.pyox": {
    source: "iana",
    extensions: ["pyo", "pyox"]
  },
  "model/vnd.rosette.annotated-data-model": {
    source: "iana"
  },
  "model/vnd.sap.vds": {
    source: "iana",
    extensions: ["vds"]
  },
  "model/vnd.usdz+zip": {
    source: "iana",
    compressible: false,
    extensions: ["usdz"]
  },
  "model/vnd.valve.source.compiled-map": {
    source: "iana",
    extensions: ["bsp"]
  },
  "model/vnd.vtu": {
    source: "iana",
    extensions: ["vtu"]
  },
  "model/vrml": {
    source: "iana",
    compressible: false,
    extensions: ["wrl", "vrml"]
  },
  "model/x3d+binary": {
    source: "apache",
    compressible: false,
    extensions: ["x3db", "x3dbz"]
  },
  "model/x3d+fastinfoset": {
    source: "iana",
    extensions: ["x3db"]
  },
  "model/x3d+vrml": {
    source: "apache",
    compressible: false,
    extensions: ["x3dv", "x3dvz"]
  },
  "model/x3d+xml": {
    source: "iana",
    compressible: true,
    extensions: ["x3d", "x3dz"]
  },
  "model/x3d-vrml": {
    source: "iana",
    extensions: ["x3dv"]
  },
  "multipart/alternative": {
    source: "iana",
    compressible: false
  },
  "multipart/appledouble": {
    source: "iana"
  },
  "multipart/byteranges": {
    source: "iana"
  },
  "multipart/digest": {
    source: "iana"
  },
  "multipart/encrypted": {
    source: "iana",
    compressible: false
  },
  "multipart/form-data": {
    source: "iana",
    compressible: false
  },
  "multipart/header-set": {
    source: "iana"
  },
  "multipart/mixed": {
    source: "iana"
  },
  "multipart/multilingual": {
    source: "iana"
  },
  "multipart/parallel": {
    source: "iana"
  },
  "multipart/related": {
    source: "iana",
    compressible: false
  },
  "multipart/report": {
    source: "iana"
  },
  "multipart/signed": {
    source: "iana",
    compressible: false
  },
  "multipart/vnd.bint.med-plus": {
    source: "iana"
  },
  "multipart/voice-message": {
    source: "iana"
  },
  "multipart/x-mixed-replace": {
    source: "iana"
  },
  "text/1d-interleaved-parityfec": {
    source: "iana"
  },
  "text/cache-manifest": {
    source: "iana",
    compressible: true,
    extensions: ["appcache", "manifest"]
  },
  "text/calendar": {
    source: "iana",
    extensions: ["ics", "ifb"]
  },
  "text/calender": {
    compressible: true
  },
  "text/cmd": {
    compressible: true
  },
  "text/coffeescript": {
    extensions: ["coffee", "litcoffee"]
  },
  "text/cql": {
    source: "iana"
  },
  "text/cql-expression": {
    source: "iana"
  },
  "text/cql-identifier": {
    source: "iana"
  },
  "text/css": {
    source: "iana",
    charset: "UTF-8",
    compressible: true,
    extensions: ["css"]
  },
  "text/csv": {
    source: "iana",
    compressible: true,
    extensions: ["csv"]
  },
  "text/csv-schema": {
    source: "iana"
  },
  "text/directory": {
    source: "iana"
  },
  "text/dns": {
    source: "iana"
  },
  "text/ecmascript": {
    source: "apache"
  },
  "text/encaprtp": {
    source: "iana"
  },
  "text/enriched": {
    source: "iana"
  },
  "text/fhirpath": {
    source: "iana"
  },
  "text/flexfec": {
    source: "iana"
  },
  "text/fwdred": {
    source: "iana"
  },
  "text/gff3": {
    source: "iana"
  },
  "text/grammar-ref-list": {
    source: "iana"
  },
  "text/html": {
    source: "iana",
    compressible: true,
    extensions: ["html", "htm", "shtml"]
  },
  "text/jade": {
    extensions: ["jade"]
  },
  "text/javascript": {
    source: "iana",
    charset: "UTF-8",
    compressible: true,
    extensions: ["js", "mjs"]
  },
  "text/jcr-cnd": {
    source: "iana"
  },
  "text/jsx": {
    compressible: true,
    extensions: ["jsx"]
  },
  "text/less": {
    compressible: true,
    extensions: ["less"]
  },
  "text/markdown": {
    source: "iana",
    compressible: true,
    extensions: ["md", "markdown"]
  },
  "text/mathml": {
    source: "nginx",
    extensions: ["mml"]
  },
  "text/mdx": {
    compressible: true,
    extensions: ["mdx"]
  },
  "text/mizar": {
    source: "iana"
  },
  "text/n3": {
    source: "iana",
    charset: "UTF-8",
    compressible: true,
    extensions: ["n3"]
  },
  "text/parameters": {
    source: "iana",
    charset: "UTF-8"
  },
  "text/parityfec": {
    source: "iana"
  },
  "text/plain": {
    source: "iana",
    compressible: true,
    extensions: ["txt", "text", "conf", "def", "list", "log", "in", "ini"]
  },
  "text/provenance-notation": {
    source: "iana",
    charset: "UTF-8"
  },
  "text/prs.fallenstein.rst": {
    source: "iana"
  },
  "text/prs.lines.tag": {
    source: "iana",
    extensions: ["dsc"]
  },
  "text/prs.prop.logic": {
    source: "iana"
  },
  "text/raptorfec": {
    source: "iana"
  },
  "text/red": {
    source: "iana"
  },
  "text/rfc822-headers": {
    source: "iana"
  },
  "text/richtext": {
    source: "iana",
    compressible: true,
    extensions: ["rtx"]
  },
  "text/rtf": {
    source: "iana",
    compressible: true,
    extensions: ["rtf"]
  },
  "text/rtp-enc-aescm128": {
    source: "iana"
  },
  "text/rtploopback": {
    source: "iana"
  },
  "text/rtx": {
    source: "iana"
  },
  "text/sgml": {
    source: "iana",
    extensions: ["sgml", "sgm"]
  },
  "text/shaclc": {
    source: "iana"
  },
  "text/shex": {
    source: "iana",
    extensions: ["shex"]
  },
  "text/slim": {
    extensions: ["slim", "slm"]
  },
  "text/spdx": {
    source: "iana",
    extensions: ["spdx"]
  },
  "text/strings": {
    source: "iana"
  },
  "text/stylus": {
    extensions: ["stylus", "styl"]
  },
  "text/t140": {
    source: "iana"
  },
  "text/tab-separated-values": {
    source: "iana",
    compressible: true,
    extensions: ["tsv"]
  },
  "text/troff": {
    source: "iana",
    extensions: ["t", "tr", "roff", "man", "me", "ms"]
  },
  "text/turtle": {
    source: "iana",
    charset: "UTF-8",
    extensions: ["ttl"]
  },
  "text/ulpfec": {
    source: "iana"
  },
  "text/uri-list": {
    source: "iana",
    compressible: true,
    extensions: ["uri", "uris", "urls"]
  },
  "text/vcard": {
    source: "iana",
    compressible: true,
    extensions: ["vcard"]
  },
  "text/vnd.a": {
    source: "iana"
  },
  "text/vnd.abc": {
    source: "iana"
  },
  "text/vnd.ascii-art": {
    source: "iana"
  },
  "text/vnd.curl": {
    source: "iana",
    extensions: ["curl"]
  },
  "text/vnd.curl.dcurl": {
    source: "apache",
    extensions: ["dcurl"]
  },
  "text/vnd.curl.mcurl": {
    source: "apache",
    extensions: ["mcurl"]
  },
  "text/vnd.curl.scurl": {
    source: "apache",
    extensions: ["scurl"]
  },
  "text/vnd.debian.copyright": {
    source: "iana",
    charset: "UTF-8"
  },
  "text/vnd.dmclientscript": {
    source: "iana"
  },
  "text/vnd.dvb.subtitle": {
    source: "iana",
    extensions: ["sub"]
  },
  "text/vnd.esmertec.theme-descriptor": {
    source: "iana",
    charset: "UTF-8"
  },
  "text/vnd.familysearch.gedcom": {
    source: "iana",
    extensions: ["ged"]
  },
  "text/vnd.ficlab.flt": {
    source: "iana"
  },
  "text/vnd.fly": {
    source: "iana",
    extensions: ["fly"]
  },
  "text/vnd.fmi.flexstor": {
    source: "iana",
    extensions: ["flx"]
  },
  "text/vnd.gml": {
    source: "iana"
  },
  "text/vnd.graphviz": {
    source: "iana",
    extensions: ["gv"]
  },
  "text/vnd.hans": {
    source: "iana"
  },
  "text/vnd.hgl": {
    source: "iana"
  },
  "text/vnd.in3d.3dml": {
    source: "iana",
    extensions: ["3dml"]
  },
  "text/vnd.in3d.spot": {
    source: "iana",
    extensions: ["spot"]
  },
  "text/vnd.iptc.newsml": {
    source: "iana"
  },
  "text/vnd.iptc.nitf": {
    source: "iana"
  },
  "text/vnd.latex-z": {
    source: "iana"
  },
  "text/vnd.motorola.reflex": {
    source: "iana"
  },
  "text/vnd.ms-mediapackage": {
    source: "iana"
  },
  "text/vnd.net2phone.commcenter.command": {
    source: "iana"
  },
  "text/vnd.radisys.msml-basic-layout": {
    source: "iana"
  },
  "text/vnd.senx.warpscript": {
    source: "iana"
  },
  "text/vnd.si.uricatalogue": {
    source: "apache"
  },
  "text/vnd.sosi": {
    source: "iana"
  },
  "text/vnd.sun.j2me.app-descriptor": {
    source: "iana",
    charset: "UTF-8",
    extensions: ["jad"]
  },
  "text/vnd.trolltech.linguist": {
    source: "iana",
    charset: "UTF-8"
  },
  "text/vnd.wap.si": {
    source: "iana"
  },
  "text/vnd.wap.sl": {
    source: "iana"
  },
  "text/vnd.wap.wml": {
    source: "iana",
    extensions: ["wml"]
  },
  "text/vnd.wap.wmlscript": {
    source: "iana",
    extensions: ["wmls"]
  },
  "text/vtt": {
    source: "iana",
    charset: "UTF-8",
    compressible: true,
    extensions: ["vtt"]
  },
  "text/x-asm": {
    source: "apache",
    extensions: ["s", "asm"]
  },
  "text/x-c": {
    source: "apache",
    extensions: ["c", "cc", "cxx", "cpp", "h", "hh", "dic"]
  },
  "text/x-component": {
    source: "nginx",
    extensions: ["htc"]
  },
  "text/x-fortran": {
    source: "apache",
    extensions: ["f", "for", "f77", "f90"]
  },
  "text/x-gwt-rpc": {
    compressible: true
  },
  "text/x-handlebars-template": {
    extensions: ["hbs"]
  },
  "text/x-java-source": {
    source: "apache",
    extensions: ["java"]
  },
  "text/x-jquery-tmpl": {
    compressible: true
  },
  "text/x-lua": {
    extensions: ["lua"]
  },
  "text/x-markdown": {
    compressible: true,
    extensions: ["mkd"]
  },
  "text/x-nfo": {
    source: "apache",
    extensions: ["nfo"]
  },
  "text/x-opml": {
    source: "apache",
    extensions: ["opml"]
  },
  "text/x-org": {
    compressible: true,
    extensions: ["org"]
  },
  "text/x-pascal": {
    source: "apache",
    extensions: ["p", "pas"]
  },
  "text/x-processing": {
    compressible: true,
    extensions: ["pde"]
  },
  "text/x-sass": {
    extensions: ["sass"]
  },
  "text/x-scss": {
    extensions: ["scss"]
  },
  "text/x-setext": {
    source: "apache",
    extensions: ["etx"]
  },
  "text/x-sfv": {
    source: "apache",
    extensions: ["sfv"]
  },
  "text/x-suse-ymp": {
    compressible: true,
    extensions: ["ymp"]
  },
  "text/x-uuencode": {
    source: "apache",
    extensions: ["uu"]
  },
  "text/x-vcalendar": {
    source: "apache",
    extensions: ["vcs"]
  },
  "text/x-vcard": {
    source: "apache",
    extensions: ["vcf"]
  },
  "text/xml": {
    source: "iana",
    compressible: true,
    extensions: ["xml"]
  },
  "text/xml-external-parsed-entity": {
    source: "iana"
  },
  "text/yaml": {
    compressible: true,
    extensions: ["yaml", "yml"]
  },
  "video/1d-interleaved-parityfec": {
    source: "iana"
  },
  "video/3gpp": {
    source: "iana",
    extensions: ["3gp", "3gpp"]
  },
  "video/3gpp-tt": {
    source: "iana"
  },
  "video/3gpp2": {
    source: "iana",
    extensions: ["3g2"]
  },
  "video/av1": {
    source: "iana"
  },
  "video/bmpeg": {
    source: "iana"
  },
  "video/bt656": {
    source: "iana"
  },
  "video/celb": {
    source: "iana"
  },
  "video/dv": {
    source: "iana"
  },
  "video/encaprtp": {
    source: "iana"
  },
  "video/ffv1": {
    source: "iana"
  },
  "video/flexfec": {
    source: "iana"
  },
  "video/h261": {
    source: "iana",
    extensions: ["h261"]
  },
  "video/h263": {
    source: "iana",
    extensions: ["h263"]
  },
  "video/h263-1998": {
    source: "iana"
  },
  "video/h263-2000": {
    source: "iana"
  },
  "video/h264": {
    source: "iana",
    extensions: ["h264"]
  },
  "video/h264-rcdo": {
    source: "iana"
  },
  "video/h264-svc": {
    source: "iana"
  },
  "video/h265": {
    source: "iana"
  },
  "video/iso.segment": {
    source: "iana",
    extensions: ["m4s"]
  },
  "video/jpeg": {
    source: "iana",
    extensions: ["jpgv"]
  },
  "video/jpeg2000": {
    source: "iana"
  },
  "video/jpm": {
    source: "apache",
    extensions: ["jpm", "jpgm"]
  },
  "video/jxsv": {
    source: "iana"
  },
  "video/mj2": {
    source: "iana",
    extensions: ["mj2", "mjp2"]
  },
  "video/mp1s": {
    source: "iana"
  },
  "video/mp2p": {
    source: "iana"
  },
  "video/mp2t": {
    source: "iana",
    extensions: ["ts"]
  },
  "video/mp4": {
    source: "iana",
    compressible: false,
    extensions: ["mp4", "mp4v", "mpg4"]
  },
  "video/mp4v-es": {
    source: "iana"
  },
  "video/mpeg": {
    source: "iana",
    compressible: false,
    extensions: ["mpeg", "mpg", "mpe", "m1v", "m2v"]
  },
  "video/mpeg4-generic": {
    source: "iana"
  },
  "video/mpv": {
    source: "iana"
  },
  "video/nv": {
    source: "iana"
  },
  "video/ogg": {
    source: "iana",
    compressible: false,
    extensions: ["ogv"]
  },
  "video/parityfec": {
    source: "iana"
  },
  "video/pointer": {
    source: "iana"
  },
  "video/quicktime": {
    source: "iana",
    compressible: false,
    extensions: ["qt", "mov"]
  },
  "video/raptorfec": {
    source: "iana"
  },
  "video/raw": {
    source: "iana"
  },
  "video/rtp-enc-aescm128": {
    source: "iana"
  },
  "video/rtploopback": {
    source: "iana"
  },
  "video/rtx": {
    source: "iana"
  },
  "video/scip": {
    source: "iana"
  },
  "video/smpte291": {
    source: "iana"
  },
  "video/smpte292m": {
    source: "iana"
  },
  "video/ulpfec": {
    source: "iana"
  },
  "video/vc1": {
    source: "iana"
  },
  "video/vc2": {
    source: "iana"
  },
  "video/vnd.cctv": {
    source: "iana"
  },
  "video/vnd.dece.hd": {
    source: "iana",
    extensions: ["uvh", "uvvh"]
  },
  "video/vnd.dece.mobile": {
    source: "iana",
    extensions: ["uvm", "uvvm"]
  },
  "video/vnd.dece.mp4": {
    source: "iana"
  },
  "video/vnd.dece.pd": {
    source: "iana",
    extensions: ["uvp", "uvvp"]
  },
  "video/vnd.dece.sd": {
    source: "iana",
    extensions: ["uvs", "uvvs"]
  },
  "video/vnd.dece.video": {
    source: "iana",
    extensions: ["uvv", "uvvv"]
  },
  "video/vnd.directv.mpeg": {
    source: "iana"
  },
  "video/vnd.directv.mpeg-tts": {
    source: "iana"
  },
  "video/vnd.dlna.mpeg-tts": {
    source: "iana"
  },
  "video/vnd.dvb.file": {
    source: "iana",
    extensions: ["dvb"]
  },
  "video/vnd.fvt": {
    source: "iana",
    extensions: ["fvt"]
  },
  "video/vnd.hns.video": {
    source: "iana"
  },
  "video/vnd.iptvforum.1dparityfec-1010": {
    source: "iana"
  },
  "video/vnd.iptvforum.1dparityfec-2005": {
    source: "iana"
  },
  "video/vnd.iptvforum.2dparityfec-1010": {
    source: "iana"
  },
  "video/vnd.iptvforum.2dparityfec-2005": {
    source: "iana"
  },
  "video/vnd.iptvforum.ttsavc": {
    source: "iana"
  },
  "video/vnd.iptvforum.ttsmpeg2": {
    source: "iana"
  },
  "video/vnd.motorola.video": {
    source: "iana"
  },
  "video/vnd.motorola.videop": {
    source: "iana"
  },
  "video/vnd.mpegurl": {
    source: "iana",
    extensions: ["mxu", "m4u"]
  },
  "video/vnd.ms-playready.media.pyv": {
    source: "iana",
    extensions: ["pyv"]
  },
  "video/vnd.nokia.interleaved-multimedia": {
    source: "iana"
  },
  "video/vnd.nokia.mp4vr": {
    source: "iana"
  },
  "video/vnd.nokia.videovoip": {
    source: "iana"
  },
  "video/vnd.objectvideo": {
    source: "iana"
  },
  "video/vnd.radgamettools.bink": {
    source: "iana"
  },
  "video/vnd.radgamettools.smacker": {
    source: "apache"
  },
  "video/vnd.sealed.mpeg1": {
    source: "iana"
  },
  "video/vnd.sealed.mpeg4": {
    source: "iana"
  },
  "video/vnd.sealed.swf": {
    source: "iana"
  },
  "video/vnd.sealedmedia.softseal.mov": {
    source: "iana"
  },
  "video/vnd.uvvu.mp4": {
    source: "iana",
    extensions: ["uvu", "uvvu"]
  },
  "video/vnd.vivo": {
    source: "iana",
    extensions: ["viv"]
  },
  "video/vnd.youtube.yt": {
    source: "iana"
  },
  "video/vp8": {
    source: "iana"
  },
  "video/vp9": {
    source: "iana"
  },
  "video/webm": {
    source: "apache",
    compressible: false,
    extensions: ["webm"]
  },
  "video/x-f4v": {
    source: "apache",
    extensions: ["f4v"]
  },
  "video/x-fli": {
    source: "apache",
    extensions: ["fli"]
  },
  "video/x-flv": {
    source: "apache",
    compressible: false,
    extensions: ["flv"]
  },
  "video/x-m4v": {
    source: "apache",
    extensions: ["m4v"]
  },
  "video/x-matroska": {
    source: "apache",
    compressible: false,
    extensions: ["mkv", "mk3d", "mks"]
  },
  "video/x-mng": {
    source: "apache",
    extensions: ["mng"]
  },
  "video/x-ms-asf": {
    source: "apache",
    extensions: ["asf", "asx"]
  },
  "video/x-ms-vob": {
    source: "apache",
    extensions: ["vob"]
  },
  "video/x-ms-wm": {
    source: "apache",
    extensions: ["wm"]
  },
  "video/x-ms-wmv": {
    source: "apache",
    compressible: false,
    extensions: ["wmv"]
  },
  "video/x-ms-wmx": {
    source: "apache",
    extensions: ["wmx"]
  },
  "video/x-ms-wvx": {
    source: "apache",
    extensions: ["wvx"]
  },
  "video/x-msvideo": {
    source: "apache",
    extensions: ["avi"]
  },
  "video/x-sgi-movie": {
    source: "apache",
    extensions: ["movie"]
  },
  "video/x-smv": {
    source: "apache",
    extensions: ["smv"]
  },
  "x-conference/x-cooltalk": {
    source: "apache",
    extensions: ["ice"]
  },
  "x-shader/x-fragment": {
    compressible: true
  },
  "x-shader/x-vertex": {
    compressible: true
  }
};

// src/mime-types.ts
var extensions = {};
var types = {};
populateMaps(extensions, {});
var getExt = (contentType) => {
  return mimeDb[contentType.toLowerCase()]?.extensions?.[0] ?? null;
};
function mimeLookup(path10) {
  if (!path10 || typeof path10 !== "string") {
    return false;
  }
  const ext = extname("." + path10).toLowerCase().substr(1);
  if (!ext) {
    return false;
  }
  return types[ext] || false;
}
function populateMaps(exts, _types) {
  const preference = ["nginx", "apache", undefined, "iana"];
  Object.keys(mimeDb).forEach((type) => {
    const mime = mimeDb[type];
    const _exts = mime.extensions;
    if (!_exts?.length) {
      return;
    }
    exts[type] = _exts;
    for (let i = 0;i < _exts.length; i++) {
      const _ext = _exts[i];
      if (_types[_ext]) {
        const from = preference.indexOf(mimeDb[_types[_ext]].source);
        const to = preference.indexOf(mime.source);
        if (_types[_ext] !== "application/octet-stream" && (from > to || from === to && _types[_ext].substr(0, 12) === "application/")) {
          continue;
        }
      }
      types[_ext] = type;
    }
  });
}
function mimeContentType(str) {
  if (!str || typeof str !== "string") {
    return false;
  }
  let mime = str.indexOf("/") === -1 ? mimeLookup(str) : str;
  if (!mime) {
    return false;
  }
  if (mime.indexOf("charset") === -1) {
    const _charset = charset(mime);
    if (_charset)
      mime += "; charset=" + _charset.toLowerCase();
  }
  return mime;
}
var EXTRACT_TYPE_REGEXP = /^\s*([^;\s]*)(?:;|\s|$)/;
var TEXT_TYPE_REGEXP = /^text\//i;
function charset(type) {
  if (!type || typeof type !== "string") {
    return false;
  }
  const match = EXTRACT_TYPE_REGEXP.exec(type);
  const mime = match && mimeDb[match[1].toLowerCase()];
  if (mime?.charset) {
    return mime.charset;
  }
  if (match && TEXT_TYPE_REGEXP.test(match[1])) {
    return "UTF-8";
  }
  return false;
}

// src/p-limit.ts
var pLimit = (concurrency) => {
  const queue = [];
  let activeCount = 0;
  const next = () => {
    activeCount--;
    if (queue.length > 0) {
      queue.shift()?.();
    }
  };
  const run = async (fn, resolve2, ...args) => {
    activeCount++;
    const result = (async () => fn(...args))();
    resolve2(result);
    try {
      await result;
    } catch {}
    next();
  };
  const enqueue = (fn, resolve2, ...args) => {
    queue.push(() => run(fn, resolve2, ...args));
    (async () => {
      await Promise.resolve();
      if (activeCount < concurrency && queue.length > 0) {
        queue.shift()?.();
      }
    })();
  };
  const generator = (fn, ...args) => new Promise((resolve2) => {
    enqueue(fn, resolve2, ...args);
  });
  Object.defineProperties(generator, {
    activeCount: {
      get: () => activeCount
    },
    pendingCount: {
      get: () => queue.length
    },
    clearQueue: {
      value: () => {
        queue.length = 0;
      }
    }
  });
  return generator;
};

// src/assets/get-audio-channels.ts
var limit = pLimit(1);
var getAudioChannelsAndDurationWithoutCache = async ({
  src,
  indent,
  logLevel,
  binariesDirectory,
  cancelSignal,
  audioStreamIndex
}) => {
  const args = [
    ["-v", "error"],
    ["-select_streams", audioStreamIndex ? `a:${audioStreamIndex}` : "a:0"],
    [
      "-show_entries",
      "stream=channels:stream=start_time:format=duration:format=format_name"
    ],
    ["-of", "default=nw=1"],
    [src]
  ].reduce((acc, val) => acc.concat(val), []).filter(Boolean);
  try {
    const task = await callFf({
      bin: "ffprobe",
      args,
      indent,
      logLevel,
      binariesDirectory,
      cancelSignal
    });
    const channels = task.stdout.match(/channels=([0-9]+)/);
    const duration = task.stdout.match(/duration=([0-9.]+)/);
    const startTime = task.stdout.match(/start_time=([0-9.]+)/);
    const container = task.stdout.match(/format_name=([a-zA-Z0-9.]+)/);
    const isMP3 = container ? container[1] === "mp3" : false;
    const result = {
      channels: channels ? parseInt(channels[1], 10) : 0,
      duration: duration ? parseFloat(duration[1]) : null,
      startTime: startTime ? isMP3 ? 0 : parseFloat(startTime[1]) : null
    };
    return result;
  } catch (err) {
    if (err.message.includes("This file cannot be read by `ffprobe`. Is it a valid multimedia file?")) {
      throw new Error("This file cannot be read by `ffprobe`. Is it a valid multimedia file?");
    }
    throw err;
  }
};
async function getAudioChannelsAndDurationUnlimited({
  downloadMap,
  src,
  indent,
  logLevel,
  binariesDirectory,
  cancelSignal,
  audioStreamIndex
}) {
  const cacheKey = audioStreamIndex ? `${src}-${audioStreamIndex}` : src;
  if (downloadMap.durationOfAssetCache[cacheKey]) {
    return downloadMap.durationOfAssetCache[cacheKey];
  }
  const result = await getAudioChannelsAndDurationWithoutCache({
    src,
    indent,
    logLevel,
    binariesDirectory,
    cancelSignal,
    audioStreamIndex
  });
  downloadMap.durationOfAssetCache[cacheKey] = result;
  return result;
}
var getAudioChannelsAndDuration = ({
  downloadMap,
  src,
  indent,
  logLevel,
  binariesDirectory,
  cancelSignal,
  audioStreamIndex
}) => {
  return limit(() => getAudioChannelsAndDurationUnlimited({
    downloadMap,
    src,
    indent,
    logLevel,
    binariesDirectory,
    cancelSignal,
    audioStreamIndex
  }));
};

// src/assets/sanitize-filepath.ts
import path10 from "node:path";

// src/assets/truncate-utf8-bytes.ts
function isHighSurrogate(codePoint) {
  return codePoint >= 55296 && codePoint <= 56319;
}
function isLowSurrogate(codePoint) {
  return codePoint >= 56320 && codePoint <= 57343;
}
var getLength = Buffer.byteLength.bind(Buffer);
function truncateUtf8Bytes(string, byteLength) {
  if (typeof string !== "string") {
    throw new Error("Input must be string");
  }
  const charLength = string.length;
  let curByteLength = 0;
  let codePoint;
  let segment;
  for (let i = 0;i < charLength; i += 1) {
    codePoint = string.charCodeAt(i);
    segment = string[i];
    if (isHighSurrogate(codePoint) && isLowSurrogate(string.charCodeAt(i + 1))) {
      i += 1;
      segment += string[i];
    }
    curByteLength += getLength(segment);
    if (curByteLength === byteLength) {
      return string.slice(0, i + 1);
    }
    if (curByteLength > byteLength) {
      return string.slice(0, i - segment.length + 1);
    }
  }
  return string;
}

// src/assets/sanitize-filename.ts
var illegalRe = /[/?<>\\:*|"]/g;
var controlRe = /[\x00-\x1f\x80-\x9f]/g;
var reservedRe = /^\.+$/;
var windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
var windowsTrailingRe = /[. ]+$/;
function sanitize(input, replacement) {
  if (typeof input !== "string") {
    throw new Error("Input must be string");
  }
  const sanitized = input.replace(illegalRe, replacement).replace(controlRe, replacement).replace(reservedRe, replacement).replace(windowsReservedRe, replacement).replace(windowsTrailingRe, replacement);
  return truncateUtf8Bytes(sanitized, 255);
}
var sanitizeFilename = (input) => {
  const replacement = "";
  const output = sanitize(input, replacement);
  if (replacement === "") {
    return output;
  }
  return sanitize(output, "");
};

// src/assets/sanitize-filepath.ts
var pathSeparators = /[/\\]/;
var sanitizeFilePath = (pathToSanitize) => {
  return pathToSanitize.split(pathSeparators).map((s) => sanitizeFilename(s)).join(path10.sep);
};

// src/assets/download-and-map-assets-to-file.ts
var waitForAssetToBeDownloaded = ({
  src,
  downloadDir,
  downloadMap
}) => {
  if (downloadMap.hasBeenDownloadedMap[src]?.[downloadDir]) {
    return Promise.resolve(downloadMap.hasBeenDownloadedMap[src]?.[downloadDir]);
  }
  if (!downloadMap.listeners[src]) {
    downloadMap.listeners[src] = {};
  }
  if (!downloadMap.listeners[src][downloadDir]) {
    downloadMap.listeners[src][downloadDir] = [];
  }
  return new Promise((resolve2) => {
    downloadMap.listeners[src][downloadDir].push(() => {
      const srcMap = downloadMap.hasBeenDownloadedMap[src];
      if (!srcMap?.[downloadDir]) {
        throw new Error("Expected file for " + src + "to be available in " + downloadDir);
      }
      resolve2(srcMap[downloadDir]);
    });
  });
};
var notifyAssetIsDownloaded = ({
  src,
  downloadDir,
  to,
  downloadMap
}) => {
  if (!downloadMap.listeners[src]) {
    downloadMap.listeners[src] = {};
  }
  if (!downloadMap.listeners[src][downloadDir]) {
    downloadMap.listeners[src][downloadDir] = [];
  }
  if (!downloadMap.isDownloadingMap[src]) {
    downloadMap.isDownloadingMap[src] = {};
  }
  downloadMap.isDownloadingMap[src][downloadDir] = false;
  if (!downloadMap.hasBeenDownloadedMap[src]) {
    downloadMap.hasBeenDownloadedMap[src] = {};
  }
  downloadMap.hasBeenDownloadedMap[src][downloadDir] = to;
  downloadMap.listeners[src][downloadDir].forEach((fn) => fn());
};
var validateMimeType = (mimeType, src) => {
  if (!mimeType.includes("/")) {
    const errMessage = [
      "A data URL was passed but did not have the correct format so that Remotion could convert it for the video to be rendered.",
      "The format of the data URL must be `data:[mime-type];[encoding],[data]`.",
      "The `mime-type` parameter must be a valid mime type.",
      "The data that was received is (truncated to 100 characters):",
      src.substr(0, 100)
    ].join(" ");
    throw new TypeError(errMessage);
  }
};
function validateBufferEncoding(potentialEncoding, dataUrl) {
  const asserted = potentialEncoding;
  const validEncodings = [
    "ascii",
    "base64",
    "base64url",
    "binary",
    "hex",
    "latin1",
    "ucs-2",
    "ucs2",
    "utf-8",
    "utf16le",
    "utf8"
  ];
  if (!validEncodings.find((en) => asserted === en)) {
    const errMessage = [
      "A data URL was passed but did not have the correct format so that Remotion could convert it for the video to be rendered.",
      "The format of the data URL must be `data:[mime-type];[encoding],[data]`.",
      "The `encoding` parameter must be one of the following:",
      `${validEncodings.join(" ")}.`,
      "The data that was received is (truncated to 100 characters):",
      dataUrl.substr(0, 100)
    ].join(" ");
    throw new TypeError(errMessage);
  }
}
var downloadAsset = async ({
  src,
  downloadMap,
  indent,
  logLevel,
  shouldAnalyzeAudioImmediately,
  binariesDirectory,
  cancelSignalForAudioAnalysis,
  audioStreamIndex
}) => {
  if (isAssetCompressed(src)) {
    return src;
  }
  const { downloadDir } = downloadMap;
  if (downloadMap.hasBeenDownloadedMap[src]?.[downloadDir]) {
    const claimedDownloadLocation = downloadMap.hasBeenDownloadedMap[src]?.[downloadDir];
    if (fs11.existsSync(claimedDownloadLocation)) {
      return claimedDownloadLocation;
    }
    downloadMap.hasBeenDownloadedMap[src][downloadDir] = null;
    if (!downloadMap.isDownloadingMap[src]) {
      downloadMap.isDownloadingMap[src] = {};
    }
    downloadMap.isDownloadingMap[src][downloadDir] = false;
  }
  if (downloadMap.isDownloadingMap[src]?.[downloadDir]) {
    return waitForAssetToBeDownloaded({ downloadMap, src, downloadDir });
  }
  if (!downloadMap.isDownloadingMap[src]) {
    downloadMap.isDownloadingMap[src] = {};
  }
  downloadMap.isDownloadingMap[src][downloadDir] = true;
  downloadMap.emitter.dispatchDownload(src);
  if (src.startsWith("data:")) {
    const [assetDetails, assetData] = src.substring("data:".length).split(",");
    if (!assetDetails.includes(";")) {
      const errMessage = [
        "A data URL was passed but did not have the correct format so that Remotion could convert it for the video to be rendered.",
        "The format of the data URL must be `data:[mime-type];[encoding],[data]`.",
        "The data that was received is (truncated to 100 characters):",
        src.substring(0, 100)
      ].join(" ");
      throw new TypeError(errMessage);
    }
    const [mimeType, encoding] = assetDetails.split(";");
    validateMimeType(mimeType, src);
    validateBufferEncoding(encoding, src);
    const output = getSanitizedFilenameForAssetUrl({
      contentDisposition: null,
      downloadDir,
      src,
      contentType: mimeType
    });
    ensureOutputDirectory(output);
    const buff = Buffer.from(assetData, encoding);
    await fs11.promises.writeFile(output, buff);
    notifyAssetIsDownloaded({ src, downloadMap, downloadDir, to: output });
    return output;
  }
  const { to } = await downloadFile({
    url: src,
    onProgress: (progress) => {
      downloadMap.emitter.dispatchDownloadProgress(src, progress.percent, progress.downloaded, progress.totalSize);
    },
    to: (contentDisposition, contentType) => getSanitizedFilenameForAssetUrl({
      contentDisposition,
      downloadDir,
      src,
      contentType
    }),
    indent,
    logLevel,
    abortSignal: downloadMap.cleanupController.signal
  });
  notifyAssetIsDownloaded({ src, downloadMap, downloadDir, to });
  if (shouldAnalyzeAudioImmediately) {
    await getAudioChannelsAndDuration({
      binariesDirectory,
      downloadMap,
      src: to,
      indent,
      logLevel,
      cancelSignal: cancelSignalForAudioAnalysis,
      audioStreamIndex
    });
  }
  return to;
};
var markAllAssetsAsDownloaded = (downloadMap) => {
  Object.keys(downloadMap.hasBeenDownloadedMap).forEach((key) => {
    delete downloadMap.hasBeenDownloadedMap[key];
  });
  Object.keys(downloadMap.isDownloadingMap).forEach((key) => {
    delete downloadMap.isDownloadingMap[key];
  });
};
var getFilename = ({
  contentDisposition,
  src,
  contentType
}) => {
  const filenameProbe = "filename=";
  if (contentDisposition?.includes(filenameProbe)) {
    const start = contentDisposition.indexOf(filenameProbe);
    const onlyFromFileName = contentDisposition.substring(start + filenameProbe.length);
    const hasSemi = onlyFromFileName.indexOf(";");
    if (hasSemi === -1) {
      return { pathname: onlyFromFileName.trim(), search: "" };
    }
    return {
      search: "",
      pathname: onlyFromFileName.substring(0, hasSemi).trim()
    };
  }
  const { pathname, search } = new URL(src);
  const ext = extname2(pathname);
  if (!ext && contentType) {
    const matchedExt = getExt(contentType);
    return {
      pathname: `${pathname}.${matchedExt}`,
      search
    };
  }
  return { pathname, search };
};
var getSanitizedFilenameForAssetUrl = ({
  src,
  downloadDir,
  contentDisposition,
  contentType
}) => {
  if (isAssetCompressed(src)) {
    return src;
  }
  const { pathname, search } = getFilename({
    contentDisposition,
    contentType,
    src
  });
  const split = pathname.split(".");
  const fileExtension = split.length > 1 && split[split.length - 1] ? `.${split[split.length - 1]}` : "";
  const hashedFileName = String(random(`${src}${pathname}${search}`)).replace("0.", "");
  const filename = hashedFileName + fileExtension;
  return path11.join(downloadDir, sanitizeFilePath(filename));
};
var downloadAndMapAssetsToFileUrl = async ({
  renderAsset,
  onDownload,
  downloadMap,
  logLevel,
  indent,
  binariesDirectory,
  cancelSignalForAudioAnalysis,
  shouldAnalyzeAudioImmediately
}) => {
  const cleanup = attachDownloadListenerToEmitter(downloadMap, onDownload);
  const newSrc = await downloadAsset({
    src: renderAsset.src,
    downloadMap,
    indent,
    logLevel,
    shouldAnalyzeAudioImmediately,
    binariesDirectory,
    cancelSignalForAudioAnalysis,
    audioStreamIndex: renderAsset.audioStreamIndex
  });
  cleanup();
  return {
    ...renderAsset,
    src: newSrc
  };
};
var attachDownloadListenerToEmitter = (downloadMap, onDownload) => {
  const cleanup = [];
  if (!onDownload) {
    return () => {
      return;
    };
  }
  if (downloadMap.downloadListeners.includes(onDownload)) {
    return () => {
      return;
    };
  }
  downloadMap.downloadListeners.push(onDownload);
  cleanup.push(() => {
    downloadMap.downloadListeners = downloadMap.downloadListeners.filter((l) => l !== onDownload);
    return Promise.resolve();
  });
  const cleanupDownloadListener = downloadMap.emitter.addEventListener("download", ({ detail: { src: initialSrc } }) => {
    const progress = onDownload(initialSrc);
    const cleanupProgressListener = downloadMap.emitter.addEventListener("progress", ({ detail: { downloaded, percent, src: progressSrc, totalSize } }) => {
      if (initialSrc === progressSrc) {
        progress?.({ downloaded, percent, totalSize });
      }
    });
    cleanup.push(() => {
      cleanupProgressListener();
      return Promise.resolve();
    });
  });
  cleanup.push(() => {
    cleanupDownloadListener();
    return Promise.resolve();
  });
  return () => {
    cleanup.forEach((c) => c());
  };
};

// src/assets/download-map.ts
import { mkdirSync as mkdirSync2 } from "node:fs";
import path15 from "node:path";
import { VERSION as VERSION2 } from "remotion/version";

// src/offthread-video-server.ts
import { URLSearchParams } from "node:url";

// src/compositor/compositor.ts
import { spawn as spawn3 } from "node:child_process";
import path12 from "node:path";
import { makeStreamer } from "@remotion/streaming";

// src/compositor/make-nonce.ts
var makeNonce = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// src/compositor/serialize-command.ts
var serializeCommand = (command, params) => {
  return {
    nonce: makeNonce(),
    payload: {
      type: command,
      params
    }
  };
};

// src/compositor/compositor.ts
var startLongRunningCompositor = ({
  maximumFrameCacheItemsInBytes,
  logLevel,
  indent,
  binariesDirectory,
  extraThreads
}) => {
  return startCompositor({
    type: "StartLongRunningProcess",
    payload: {
      concurrency: extraThreads,
      maximum_frame_cache_size_in_bytes: maximumFrameCacheItemsInBytes,
      verbose: isEqualOrBelowLogLevel(logLevel, "verbose")
    },
    logLevel,
    indent,
    binariesDirectory
  });
};
var startCompositor = ({
  type,
  payload,
  logLevel,
  indent,
  binariesDirectory = null
}) => {
  const bin = getExecutablePath({
    type: "compositor",
    indent,
    logLevel,
    binariesDirectory
  });
  makeFileExecutableIfItIsNot(bin);
  const fullCommand = serializeCommand(type, payload);
  const cwd = path12.dirname(bin);
  const child = spawn3(bin, [JSON.stringify(fullCommand)], {
    cwd,
    env: process.platform === "darwin" ? {
      DYLD_LIBRARY_PATH: cwd
    } : undefined
  });
  let stderrChunks = [];
  const waiters = new Map;
  const onMessage = (statusType, nonce, data) => {
    if (nonce === "0") {
      Log.verbose({ indent, logLevel, tag: "compositor" }, new TextDecoder("utf8").decode(data));
    } else if (waiters.has(nonce)) {
      if (statusType === "error") {
        try {
          const parsed = JSON.parse(new TextDecoder("utf8").decode(data));
          waiters.get(nonce).reject(new Error(`Compositor error: ${parsed.error}
${parsed.backtrace}`));
        } catch {
          waiters.get(nonce).reject(new Error(new TextDecoder("utf8").decode(data)));
        }
      } else {
        waiters.get(nonce).resolve(data);
      }
      waiters.delete(nonce);
    }
  };
  const { onData, getOutputBuffer, clear } = makeStreamer(onMessage);
  let runningStatus = { type: "running" };
  child.stdout.on("data", onData);
  child.stderr.on("data", (data) => {
    stderrChunks.push(data);
  });
  let resolve2 = null;
  let reject = null;
  child.on("close", (code, signal) => {
    const waitersToKill = Array.from(waiters.values());
    if (code === 0) {
      runningStatus = { type: "quit-without-error", signal };
      resolve2?.();
      for (const waiter of waitersToKill) {
        waiter.reject(new Error(`Compositor quit${signal ? ` with signal ${signal}` : ""}`));
      }
      waiters.clear();
    } else {
      const errorMessage = Buffer.concat(stderrChunks).toString("utf-8") + new TextDecoder("utf-8").decode(getOutputBuffer());
      runningStatus = { type: "quit-with-error", error: errorMessage, signal };
      Log.verbose({ indent, logLevel }, `Compositor exited with code ${code} and signal ${signal}`);
      const error = code === null ? new Error(`Compositor exited with signal ${signal}`) : new Error(`Compositor exited with code ${code}: ${errorMessage}`);
      for (const waiter of waitersToKill) {
        waiter.reject(error);
      }
      waiters.clear();
      reject?.(error);
    }
    clear();
    stderrChunks = [];
  });
  const waitForDone = () => {
    return new Promise((res, rej) => {
      if (runningStatus.type === "quit-without-error") {
        rej(new Error(`Compositor quit${runningStatus.signal ? ` with signal ${runningStatus.signal}` : ""}`));
        return;
      }
      if (runningStatus.type === "quit-with-error") {
        rej(new Error(`Compositor quit${runningStatus.signal ? ` with signal ${runningStatus.signal}` : ""}: ${runningStatus.error}`));
        return;
      }
      resolve2 = res;
      reject = rej;
    });
  };
  const finishCommands = async () => {
    await Promise.resolve();
    if (runningStatus.type === "quit-with-error") {
      return Promise.reject(new Error(`Compositor quit${runningStatus.signal ? ` with signal ${runningStatus.signal}` : ""}: ${runningStatus.error}`));
    }
    if (runningStatus.type === "quit-without-error") {
      return Promise.reject(new Error(`Compositor quit${runningStatus.signal ? ` with signal ${runningStatus.signal}` : ""}`));
    }
    return new Promise((res, rej) => {
      child.stdin.write(`EOF
`, (e) => {
        if (e) {
          rej(e);
          return;
        }
        res();
      });
    });
  };
  const shutDownOrKill = () => {
    const shutDownCase = async () => {
      await finishCommands();
      await waitForDone();
    };
    let timeout = null;
    const killCase = async () => {
      await new Promise((res) => {
        timeout = setTimeout(res, 5000);
      });
      child.kill("SIGKILL");
    };
    return Promise.race([shutDownCase(), killCase()]).finally(() => {
      if (timeout !== null) {
        clearTimeout(timeout);
      }
    });
  };
  return {
    shutDownOrKill,
    waitForDone,
    finishCommands,
    executeCommand: (command, params) => {
      return new Promise((_resolve, _reject) => {
        if (runningStatus.type === "quit-without-error") {
          _reject(new Error(`Compositor quit${runningStatus.signal ? ` with signal ${runningStatus.signal}` : ""}`));
          return;
        }
        if (runningStatus.type === "quit-with-error") {
          _reject(new Error(`Compositor quit${runningStatus.signal ? ` with signal ${runningStatus.signal}` : ""}: ${runningStatus.error.trim()}`));
          return;
        }
        const nonce = makeNonce();
        const composed = {
          nonce,
          payload: {
            type: command,
            params
          }
        };
        child.stdin.write(JSON.stringify(composed) + `
`, (e) => {
          if (e) {
            _reject(e);
          }
        });
        waiters.set(nonce, {
          resolve: _resolve,
          reject: _reject
        });
      });
    },
    pid: child.pid ?? null
  };
};

// src/options/offthreadvideo-cache-size.tsx
import { jsx as jsx3, jsxs as jsxs3, Fragment as Fragment3 } from "react/jsx-runtime";
var validateOffthreadVideoCacheSizeInBytes = (option) => {
  if (option === undefined || option === null) {
    return;
  }
  if (typeof option !== "number") {
    throw new Error("Expected a number");
  }
  if (option < 0 || option === 0) {
    throw new Error("Expected a positive number");
  }
  if (Number.isNaN(option)) {
    throw new Error("Expected a number");
  }
  if (!Number.isFinite(option)) {
    throw new Error("Expected a finite number");
  }
  if (option % 1 !== 0) {
    throw new Error("Expected a whole number");
  }
};

// src/offthread-video-server.ts
var extractUrlAndSourceFromUrl = (url) => {
  const parsed = new URL(url, "http://localhost");
  const query = parsed.search;
  if (!query.trim()) {
    throw new Error("Expected query from " + url);
  }
  const params = new URLSearchParams(query);
  const src = params.get("src");
  if (!src) {
    throw new Error("Did not pass `src` parameter");
  }
  const time = params.get("time");
  if (!time) {
    throw new Error("Did not get `time` parameter");
  }
  const transparent = params.get("transparent");
  const toneMapped = params.get("toneMapped");
  if (!toneMapped) {
    throw new Error("Did not get `toneMapped` parameter");
  }
  return {
    src,
    time: parseFloat(time),
    transparent: transparent === "true",
    toneMapped: toneMapped === "true"
  };
};
var REQUEST_CLOSED_TOKEN = "Request closed";
var startOffthreadVideoServer = ({
  downloadMap,
  logLevel,
  indent,
  offthreadVideoCacheSizeInBytes,
  binariesDirectory,
  offthreadVideoThreads
}) => {
  validateOffthreadVideoCacheSizeInBytes(offthreadVideoCacheSizeInBytes);
  const compositor = startCompositor({
    type: "StartLongRunningProcess",
    payload: {
      concurrency: offthreadVideoThreads,
      maximum_frame_cache_size_in_bytes: offthreadVideoCacheSizeInBytes,
      verbose: isEqualOrBelowLogLevel(logLevel, "verbose")
    },
    logLevel,
    indent,
    binariesDirectory
  });
  return {
    close: () => {
      return compositor.shutDownOrKill();
    },
    listener: (req, response) => {
      if (!req.url) {
        throw new Error("Request came in without URL");
      }
      if (!req.url.startsWith("/proxy")) {
        response.writeHead(404);
        response.end();
        return;
      }
      const { src, time, transparent, toneMapped } = extractUrlAndSourceFromUrl(req.url);
      response.setHeader("access-control-allow-origin", "*");
      response.setHeader("cache-control", "no-cache, no-store, must-revalidate");
      if (req.method === "OPTIONS") {
        response.statusCode = 200;
        if (req.headers["access-control-request-private-network"]) {
          response.setHeader("Access-Control-Allow-Private-Network", "true");
        }
        response.end();
        return;
      }
      let closed = false;
      req.on("close", () => {
        closed = true;
      });
      let extractStart = Date.now();
      downloadAsset({
        src,
        downloadMap,
        indent,
        logLevel,
        binariesDirectory,
        cancelSignalForAudioAnalysis: undefined,
        shouldAnalyzeAudioImmediately: true,
        audioStreamIndex: undefined
      }).then((to) => {
        return new Promise((resolve2, reject) => {
          if (closed) {
            reject(Error(REQUEST_CLOSED_TOKEN));
            return;
          }
          extractStart = Date.now();
          compositor.executeCommand("ExtractFrame", {
            src: to,
            original_src: src,
            time,
            transparent,
            tone_mapped: toneMapped
          }).then(resolve2).catch(reject);
        });
      }).then((readable) => {
        return new Promise((resolve2, reject) => {
          if (closed) {
            reject(Error(REQUEST_CLOSED_TOKEN));
            return;
          }
          if (!readable) {
            reject(new Error("no readable from compositor"));
            return;
          }
          const extractEnd = Date.now();
          const timeToExtract = extractEnd - extractStart;
          if (timeToExtract > 1000) {
            Log.verbose({ indent, logLevel }, `Took ${timeToExtract}ms to extract frame from ${src} at ${time}`);
          }
          const firstByte = readable.at(0);
          const secondByte = readable.at(1);
          const thirdByte = readable.at(2);
          const isPng = firstByte === 137 && secondByte === 80 && thirdByte === 78;
          const isBmp = firstByte === 66 && secondByte === 77;
          if (isPng) {
            response.setHeader("content-type", `image/png`);
            response.setHeader("content-length", readable.byteLength);
          } else if (isBmp) {
            response.setHeader("content-type", `image/bmp`);
            response.setHeader("content-length", readable.byteLength);
          } else {
            reject(new Error(`Unknown file type: ${firstByte} ${secondByte} ${thirdByte}`));
            return;
          }
          response.writeHead(200);
          response.write(readable, (err) => {
            response.end();
            if (err) {
              reject(err);
            } else {
              resolve2();
            }
          });
        });
      }).catch((err) => {
        Log.error({ indent, logLevel }, "Could not extract frame from compositor", err);
        if (response.headersSent) {
          Log.error({ indent, logLevel }, "Cannot propagate error message to client because headers have already been sent");
        } else {
          response.writeHead(500);
          response.write(JSON.stringify({ error: err.stack }));
        }
        response.end();
      });
    },
    compositor
  };
};

class OffthreadVideoServerEmitter {
  listeners = {
    progress: [],
    download: []
  };
  addEventListener(name, callback) {
    this.listeners[name].push(callback);
    return () => {
      this.removeEventListener(name, callback);
    };
  }
  removeEventListener(name, callback) {
    this.listeners[name] = this.listeners[name].filter((l) => l !== callback);
  }
  dispatchEvent(dispatchName, context) {
    this.listeners[dispatchName].forEach((callback) => {
      callback({ detail: context });
    });
  }
  dispatchDownloadProgress(src, percent, downloaded, totalSize) {
    this.dispatchEvent("progress", {
      downloaded,
      percent,
      totalSize,
      src
    });
  }
  dispatchDownload(src) {
    this.dispatchEvent("download", {
      src
    });
  }
}

// src/tmp-dir.ts
import fs12, { mkdirSync } from "node:fs";
import os6 from "node:os";
import path13 from "node:path";
var alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
var randomHash = () => {
  return new Array(10).fill(1).map(() => {
    return alphabet[Math.floor(Math.random() * alphabet.length)];
  }).join("");
};
var tmpDir = (str) => {
  const newDir = path13.join(os6.tmpdir(), str + randomHash());
  if (fs12.existsSync(newDir)) {
    fs12.rmSync(newDir, {
      recursive: true,
      force: true
    });
  }
  mkdirSync(newDir);
  return newDir;
};

// src/assets/inline-audio-mixing.ts
import fs13, { writeSync } from "node:fs";
import path14 from "node:path";

// src/sample-rate.ts
var DEFAULT_SAMPLE_RATE = 48000;

// src/assets/apply-tone-frequency.ts
var applyToneFrequencyUsingFfmpeg = async ({
  input,
  output,
  toneFrequency,
  indent,
  logLevel,
  binariesDirectory,
  cancelSignal
}) => {
  const filter = `asetrate=${DEFAULT_SAMPLE_RATE}*${toneFrequency},aresample=${DEFAULT_SAMPLE_RATE},atempo=1/${toneFrequency}`;
  const args = [
    "-hide_banner",
    "-i",
    input,
    ["-ac", "2"],
    "-filter:a",
    filter,
    ["-c:a", "pcm_s16le"],
    ["-ar", String(DEFAULT_SAMPLE_RATE)],
    "-y",
    output
  ].flat(2);
  Log.verbose({ indent, logLevel }, "Changing tone frequency using FFmpeg:", JSON.stringify(args.join(" ")), "Filter:", filter);
  const startTimestamp = Date.now();
  const task = callFf({
    bin: "ffmpeg",
    args,
    indent,
    logLevel,
    binariesDirectory,
    cancelSignal
  });
  await task;
  Log.verbose({ indent, logLevel }, "Changed tone frequency using FFmpeg", `${Date.now() - startTimestamp}ms`);
};

// src/assets/inline-audio-mixing.ts
var numberTo32BiIntLittleEndian = (num) => {
  return new Uint8Array([
    num & 255,
    num >> 8 & 255,
    num >> 16 & 255,
    num >> 24 & 255
  ]);
};
var numberTo16BitLittleEndian = (num) => {
  return new Uint8Array([num & 255, num >> 8 & 255]);
};
var correctFloatingPointError = (value) => {
  const rounded = Math.round(value);
  if (Math.abs(value - rounded) < 0.00001) {
    return rounded;
  }
  return value;
};
var BIT_DEPTH = 16;
var BYTES_PER_SAMPLE = BIT_DEPTH / 8;
var NUMBER_OF_CHANNELS = 2;
var makeInlineAudioMixing = (dir) => {
  const folderToAdd = makeAndReturn(dir, "remotion-inline-audio-mixing");
  const openFiles = {};
  const writtenHeaders = {};
  const toneFrequencies = {};
  const cleanup = () => {
    for (const fd of Object.values(openFiles)) {
      try {
        fs13.closeSync(fd);
      } catch {}
    }
    deleteDirectory(folderToAdd);
  };
  const getListOfAssets = () => {
    return Object.keys(openFiles);
  };
  const getFilePath = (asset) => {
    return path14.join(folderToAdd, `${asset.id}.wav`);
  };
  const ensureAsset = ({
    asset,
    fps,
    totalNumberOfFrames,
    trimLeftOffset,
    trimRightOffset
  }) => {
    const filePath = getFilePath(asset);
    if (!openFiles[filePath]) {
      openFiles[filePath] = fs13.openSync(filePath, "w");
    }
    if (writtenHeaders[filePath]) {
      return;
    }
    writtenHeaders[filePath] = true;
    const expectedDataSize = Math.round((totalNumberOfFrames / fps - trimLeftOffset + trimRightOffset) * NUMBER_OF_CHANNELS * DEFAULT_SAMPLE_RATE * BYTES_PER_SAMPLE);
    const expectedSize = 40 + expectedDataSize;
    const fd = openFiles[filePath];
    writeSync(fd, new Uint8Array([82, 73, 70, 70]), 0, 4, 0);
    writeSync(fd, new Uint8Array(numberTo32BiIntLittleEndian(expectedSize)), 0, 4, 4);
    writeSync(fd, new Uint8Array([87, 65, 86, 69]), 0, 4, 8);
    writeSync(fd, new Uint8Array([102, 109, 116, 32]), 0, 4, 12);
    writeSync(fd, new Uint8Array([BIT_DEPTH, 0, 0, 0]), 0, 4, 16);
    writeSync(fd, new Uint8Array([1, 0]), 0, 2, 20);
    writeSync(fd, new Uint8Array([NUMBER_OF_CHANNELS, 0]), 0, 2, 22);
    writeSync(fd, new Uint8Array(numberTo32BiIntLittleEndian(DEFAULT_SAMPLE_RATE)), 0, 4, 24);
    writeSync(fd, new Uint8Array(numberTo32BiIntLittleEndian(DEFAULT_SAMPLE_RATE * NUMBER_OF_CHANNELS * BYTES_PER_SAMPLE)), 0, 4, 28);
    writeSync(fd, new Uint8Array(numberTo16BitLittleEndian(NUMBER_OF_CHANNELS * BYTES_PER_SAMPLE)), 0, 2, 32);
    writeSync(fd, numberTo16BitLittleEndian(BIT_DEPTH), 0, 2, 34);
    writeSync(fd, new Uint8Array([100, 97, 116, 97]), 0, 4, 36);
    writeSync(fd, new Uint8Array(numberTo32BiIntLittleEndian(expectedDataSize)), 0, 4, 40);
  };
  const finish = async ({
    binariesDirectory,
    indent,
    logLevel,
    cancelSignal
  }) => {
    for (const fd of Object.keys(openFiles)) {
      const frequency = toneFrequencies[fd];
      if (frequency !== 1) {
        const tmpFile = fd.replace(/.wav$/, "-tmp.wav");
        await applyToneFrequencyUsingFfmpeg({
          input: fd,
          output: tmpFile,
          toneFrequency: frequency,
          indent,
          logLevel,
          binariesDirectory,
          cancelSignal
        });
        fs13.renameSync(tmpFile, fd);
      }
    }
  };
  const addAsset = ({
    asset,
    fps,
    totalNumberOfFrames,
    firstFrame,
    trimLeftOffset,
    trimRightOffset
  }) => {
    ensureAsset({
      asset,
      fps,
      totalNumberOfFrames,
      trimLeftOffset,
      trimRightOffset
    });
    const filePath = getFilePath(asset);
    if (toneFrequencies[filePath] !== undefined && toneFrequencies[filePath] !== asset.toneFrequency) {
      throw new Error(`toneFrequency must be the same across the entire audio, got ${asset.toneFrequency}, but before it was ${toneFrequencies[filePath]}`);
    }
    const fileDescriptor = openFiles[filePath];
    toneFrequencies[filePath] = asset.toneFrequency;
    let arr = new Int16Array(asset.audio);
    const isFirst = asset.frame === firstFrame;
    const isLast = asset.frame === totalNumberOfFrames + firstFrame - 1;
    const samplesToShaveFromStart = trimLeftOffset * DEFAULT_SAMPLE_RATE;
    const samplesToShaveFromEnd = trimRightOffset * DEFAULT_SAMPLE_RATE;
    if (isFirst) {
      arr = arr.slice(Math.floor(correctFloatingPointError(samplesToShaveFromStart)) * NUMBER_OF_CHANNELS);
    }
    if (isLast) {
      arr = arr.slice(0, arr.length + Math.ceil(correctFloatingPointError(samplesToShaveFromEnd)) * NUMBER_OF_CHANNELS);
    }
    const positionInSeconds = (asset.frame - firstFrame) / fps - (isFirst ? 0 : trimLeftOffset);
    const position = Math.floor(correctFloatingPointError(positionInSeconds * DEFAULT_SAMPLE_RATE)) * NUMBER_OF_CHANNELS * BYTES_PER_SAMPLE;
    writeSync(fileDescriptor, arr, 0, arr.byteLength, 44 + position);
  };
  return {
    cleanup,
    addAsset,
    getListOfAssets,
    finish
  };
};

// src/assets/download-map.ts
var makeAndReturn = (dir, name) => {
  const p = path15.join(dir, name);
  mkdirSync2(p);
  return p;
};
var makeDownloadMap = () => {
  const dir = tmpDir(`remotion-v${VERSION2}-assets`);
  let prevented = false;
  return {
    isDownloadingMap: {},
    hasBeenDownloadedMap: {},
    listeners: {},
    durationOfAssetCache: {},
    id: String(Math.random()),
    assetDir: dir,
    downloadListeners: [],
    downloadDir: makeAndReturn(dir, "remotion-assets-dir"),
    complexFilter: makeAndReturn(dir, "remotion-complex-filter"),
    preEncode: makeAndReturn(dir, "pre-encode"),
    audioMixing: makeAndReturn(dir, "remotion-audio-mixing"),
    audioPreprocessing: makeAndReturn(dir, "remotion-audio-preprocessing"),
    stitchFrames: makeAndReturn(dir, "remotion-stitch-temp-dir"),
    compositingDir: makeAndReturn(dir, "remotion-compositing-temp-dir"),
    emitter: new OffthreadVideoServerEmitter,
    preventCleanup: () => {
      prevented = true;
    },
    allowCleanup: () => {
      prevented = false;
    },
    isPreventedFromCleanup: () => {
      return prevented;
    },
    inlineAudioMixing: makeInlineAudioMixing(dir),
    cleanupController: new AbortController
  };
};
var cleanDownloadMap = (downloadMap) => {
  if (downloadMap.isPreventedFromCleanup()) {
    return;
  }
  downloadMap.cleanupController.abort();
  deleteDirectory(downloadMap.downloadDir);
  deleteDirectory(downloadMap.complexFilter);
  deleteDirectory(downloadMap.compositingDir);
  downloadMap.inlineAudioMixing.cleanup();
  deleteDirectory(downloadMap.assetDir);
};

// src/get-bundle-url-from-serve-url.ts
import path16 from "path";
import { NoReactInternals as NoReactInternals6 } from "remotion/no-react";
var map = (webpackBundleOrServeUrl, suffix) => {
  if (isServeUrl(webpackBundleOrServeUrl)) {
    const parsed = new URL(webpackBundleOrServeUrl);
    const idx = parsed.pathname.lastIndexOf("/");
    if (idx === -1) {
      return parsed.origin + "/" + suffix;
    }
    return parsed.origin + parsed.pathname.substring(0, idx + 1) + suffix;
  }
  const index = webpackBundleOrServeUrl.lastIndexOf(path16.sep);
  const url = webpackBundleOrServeUrl.substring(0, index + 1) + suffix;
  return url;
};
var getBundleMapUrlFromServeUrl = (serveUrl) => {
  return map(serveUrl, NoReactInternals6.bundleMapName);
};

// src/normalize-serve-url.ts
var normalizeServeUrl = (unnormalized) => {
  const hasQuery = unnormalized.includes("?");
  if (hasQuery) {
    return normalizeServeUrl(unnormalized.substr(0, unnormalized.indexOf("?")));
  }
  const endsInIndexHtml = unnormalized.endsWith("index.html");
  if (endsInIndexHtml) {
    return unnormalized;
  }
  if (unnormalized.endsWith("/")) {
    return `${unnormalized}index.html`;
  }
  return `${unnormalized}/index.html`;
};

// src/serve-static.ts
import http2 from "node:http";

// src/get-port.ts
import net from "net";

// src/locks.ts
var createLock = ({ timeout }) => {
  let locks = [];
  const waiters = [];
  const lock = () => {
    const id = Math.random();
    locks.push(id);
    return id;
  };
  const unlock = (id) => {
    locks = locks.filter((l) => l !== id);
    resolveWaiters();
  };
  const resolveWaiters = () => {
    if (locks.length === 0) {
      waiters.forEach((w) => w());
    }
  };
  const waitForAllToBeDone = () => {
    const success = new Promise((resolve2) => {
      waiters.push(() => {
        resolve2();
      });
    });
    resolveWaiters();
    if (locks.length === 0) {
      return Promise.resolve();
    }
    if (timeout === null) {
      return success;
    }
    const timeoutFn = new Promise((resolve2) => {
      setTimeout(() => {
        return resolve2();
      }, timeout);
    });
    return Promise.race([success, timeoutFn]);
  };
  return {
    lock,
    unlock,
    waitForAllToBeDone
  };
};

// src/get-port.ts
var isPortAvailableOnHost = ({
  portToTry,
  host
}) => {
  return new Promise((resolve2) => {
    let status = "unavailable";
    const socket = new net.Socket;
    socket.on("connect", () => {
      status = "unavailable";
      socket.destroy();
    });
    socket.setTimeout(3000);
    socket.on("timeout", () => {
      status = "unavailable";
      socket.destroy();
      resolve2(status);
    });
    socket.on("error", () => {
      status = "available";
    });
    socket.on("close", () => resolve2(status));
    socket.connect(portToTry, host);
  });
};
var testPortAvailableOnMultipleHosts = async ({
  hosts,
  port
}) => {
  const results = await Promise.all(hosts.map((host) => {
    return isPortAvailableOnHost({ portToTry: port, host });
  }));
  return results.every((r) => r === "available") ? "available" : "unavailable";
};
var getPort = async ({
  from,
  to,
  hostsToTest,
  onPortUnavailable
}) => {
  const ports = makeRange(from, to);
  for (const port of ports) {
    if (await testPortAvailableOnMultipleHosts({
      port,
      hosts: hostsToTest
    }) === "available") {
      return { port, didUsePort: false };
    }
    if (onPortUnavailable) {
      const action = await onPortUnavailable(port);
      if (action === "stop") {
        return { port, didUsePort: true };
      }
    }
  }
  throw new Error("No available ports found");
};
var portLocks = createLock({ timeout: 1e4 });
var getDesiredPort = async ({
  desiredPort,
  from,
  hostsToTry,
  to,
  onPortUnavailable
}) => {
  await portLocks.waitForAllToBeDone();
  const lockPortSelection = portLocks.lock();
  const unlockPort = () => portLocks.unlock(lockPortSelection);
  if (typeof desiredPort !== "undefined" && await testPortAvailableOnMultipleHosts({
    port: desiredPort,
    hosts: hostsToTry
  }) === "available") {
    return { port: desiredPort, unlockPort, didUsePort: false };
  }
  if (typeof desiredPort !== "undefined" && onPortUnavailable) {
    const action = await onPortUnavailable(desiredPort);
    if (action === "stop") {
      return { port: desiredPort, unlockPort, didUsePort: true };
    }
  }
  const result = await getPort({
    from,
    to,
    hostsToTest: hostsToTry,
    onPortUnavailable
  });
  if (result.didUsePort) {
    return { port: result.port, unlockPort, didUsePort: true };
  }
  if (desiredPort && desiredPort !== result.port) {
    unlockPort();
    throw new Error(`You specified port ${desiredPort} to be used for the HTTP server, but it is not available. Choose a different port or remove the setting to let Remotion automatically select a free port.`);
  }
  return { port: result.port, unlockPort, didUsePort: false };
};
var makeRange = (from, to) => {
  if (!Number.isInteger(from) || !Number.isInteger(to)) {
    throw new TypeError("`from` and `to` must be integer numbers");
  }
  if (from < 1024 || from > 65535) {
    throw new RangeError("`from` must be between 1024 and 65535");
  }
  if (to < 1024 || to > 65536) {
    throw new RangeError("`to` must be between 1024 and 65536");
  }
  if (to < from) {
    throw new RangeError("`to` must be greater than or equal to `from`");
  }
  return new Array(to - from + 1).fill(true).map((_, i) => {
    return i + from;
  });
};

// src/port-config.ts
import os7 from "os";
var cached = null;
var getPortConfig = (preferIpv4) => {
  if (cached) {
    return cached;
  }
  const networkInterfaces = os7.networkInterfaces();
  const flattened = flattenNetworkInterfaces(networkInterfaces);
  const host = getHostToBind(flattened, preferIpv4);
  const hostsToTry = getHostsToTry(flattened);
  const response = { host, hostsToTry };
  cached = response;
  return response;
};
var getHostToBind = (flattened, preferIpv4) => {
  if (preferIpv4 || !isIpV6Supported(flattened)) {
    return "0.0.0.0";
  }
  return "::";
};
var getHostsToTry = (flattened) => {
  return [
    hasIPv6LoopbackAddress(flattened) ? "::1" : null,
    hasIpv4LoopbackAddress(flattened) ? "127.0.0.1" : null,
    isIpV6Supported(flattened) ? "::" : null,
    "0.0.0.0"
  ].filter(truthy);
};
var flattenNetworkInterfaces = (networkInterfaces) => {
  const result = [];
  for (const iface in networkInterfaces) {
    for (const configuration of networkInterfaces[iface]) {
      result.push(configuration);
    }
  }
  return result;
};
var isIpV6Supported = (flattened) => {
  for (const configuration of flattened) {
    if (configuration.family === "IPv6" && !configuration.internal) {
      return true;
    }
  }
  return false;
};
var hasIPv6LoopbackAddress = (flattened) => {
  for (const configuration of flattened) {
    if (configuration.family === "IPv6" && configuration.internal && configuration.address === "::1") {
      return true;
    }
  }
  return false;
};
var hasIpv4LoopbackAddress = (flattened) => {
  for (const configuration of flattened) {
    if (configuration.family === "IPv4" && configuration.internal && configuration.address === "127.0.0.1") {
      return true;
    }
  }
  return false;
};

// src/serve-handler/index.ts
import { createReadStream, promises as promises2 } from "node:fs";
import path18 from "node:path";

// src/serve-handler/is-path-inside.ts
import path17 from "node:path";
var isPathInside = function(thePath, potentialParent) {
  thePath = stripTrailingSep(thePath);
  potentialParent = stripTrailingSep(potentialParent);
  if (process.platform === "win32") {
    thePath = thePath.toLowerCase();
    potentialParent = potentialParent.toLowerCase();
  }
  return thePath.lastIndexOf(potentialParent, 0) === 0 && (thePath[potentialParent.length] === path17.sep || thePath[potentialParent.length] === undefined);
};
function stripTrailingSep(thePath) {
  if (thePath[thePath.length - 1] === path17.sep) {
    return thePath.slice(0, -1);
  }
  return thePath;
}

// src/serve-handler/range-parser.ts
/*!
 * range-parser
 * Copyright(c) 2012-2014 TJ Holowaychuk
 * Copyright(c) 2015-2016 Douglas Christopher Wilson
 * MIT Licensed
 */
var rangeParser = (size, str) => {
  if (typeof str !== "string") {
    throw new TypeError("argument str must be a string");
  }
  const index = str.indexOf("=");
  if (index === -1) {
    return -2;
  }
  const arr = str.slice(index + 1).split(",");
  const ranges = [];
  const type = str.slice(0, index);
  for (let i = 0;i < arr.length; i++) {
    const range = arr[i].split("-");
    let start = parseInt(range[0], 10);
    let end = parseInt(range[1], 10);
    if (isNaN(start)) {
      start = size - end;
      end = size - 1;
    } else if (isNaN(end)) {
      end = size - 1;
    }
    if (end > size - 1) {
      end = size - 1;
    }
    if (isNaN(start) || isNaN(end) || start > end || start < 0) {
      continue;
    }
    ranges.push({
      start,
      end
    });
  }
  if (ranges.length < 1) {
    return -1;
  }
  return { ranges, type };
};

// src/serve-handler/index.ts
var getHeaders = (absolutePath, stats) => {
  const { base } = path18.parse(absolutePath);
  let defaultHeaders = {};
  if (stats) {
    defaultHeaders = {
      "Content-Length": String(stats.size),
      "Accept-Ranges": "bytes"
    };
    defaultHeaders["Last-Modified"] = stats.mtime.toUTCString();
    const _contentType = mimeContentType(base);
    if (_contentType) {
      defaultHeaders["Content-Type"] = _contentType;
    }
  }
  return defaultHeaders;
};
var getPossiblePaths = (relativePath, extension) => [
  path18.join(relativePath, `index${extension}`),
  relativePath.endsWith("/") ? relativePath.replace(/\/$/g, extension) : relativePath + extension
].filter((item) => path18.basename(item) !== extension);
var findRelated = async (current, relativePath) => {
  const possible = getPossiblePaths(relativePath, ".html");
  let stats = null;
  for (let index = 0;index < possible.length; index++) {
    const related = possible[index];
    const absolutePath = path18.join(current, related);
    try {
      stats = await promises2.lstat(absolutePath);
    } catch (err) {
      if (err.code !== "ENOENT" && err.code !== "ENOTDIR") {
        throw err;
      }
    }
    if (stats) {
      return {
        stats,
        absolutePath
      };
    }
  }
  return null;
};
var sendError = (absolutePath, response, spec) => {
  const { message, statusCode } = spec;
  const headers = getHeaders(absolutePath, null);
  response.writeHead(statusCode, {
    ...headers,
    "Content-Type": "application/json"
  });
  response.end(JSON.stringify({ statusCode, message }));
};
var internalError = (absolutePath, response) => {
  return sendError(absolutePath, response, {
    statusCode: 500,
    code: "internal_server_error",
    message: "A server error has occurred"
  });
};
var serveHandler = async (request, response, config) => {
  const cwd = process.cwd();
  const current = path18.resolve(cwd, config.public);
  let relativePath = null;
  try {
    const parsedUrl = new URL(request.url, `http://${request.headers.host}`);
    relativePath = decodeURIComponent(parsedUrl.pathname);
  } catch {
    return sendError("/", response, {
      statusCode: 400,
      code: "bad_request",
      message: "Bad Request"
    });
  }
  let absolutePath = path18.join(current, relativePath);
  if (!isPathInside(absolutePath, current)) {
    return sendError(absolutePath, response, {
      statusCode: 400,
      code: "bad_request",
      message: "Bad Request"
    });
  }
  let stats = null;
  if (path18.extname(relativePath) !== "") {
    try {
      stats = await promises2.lstat(absolutePath);
    } catch (err) {
      if (err.code !== "ENOENT" && err.code !== "ENOTDIR") {
        return internalError(absolutePath, response);
      }
    }
  }
  if (!stats) {
    try {
      const related = await findRelated(current, relativePath);
      if (related) {
        stats = related.stats;
        absolutePath = related.absolutePath;
      }
    } catch (err) {
      if (err.code !== "ENOENT" && err.code !== "ENOTDIR") {
        return internalError(absolutePath, response);
      }
    }
    try {
      stats = await promises2.lstat(absolutePath);
    } catch (err) {
      if (err.code !== "ENOENT" && err.code !== "ENOTDIR") {
        return internalError(absolutePath, response);
      }
    }
  }
  if (stats?.isDirectory()) {
    const directory = null;
    const singleFile = null;
    if (directory) {
      const _contentType = "text/html; charset=utf-8";
      response.statusCode = 200;
      response.setHeader("Content-Type", _contentType);
      response.end("Is a directory");
      return;
    }
    if (!singleFile) {
      stats = null;
    }
  }
  const isSymLink = stats?.isSymbolicLink();
  if (!stats || isSymLink) {
    return sendError(absolutePath, response, {
      statusCode: 404,
      code: "not_found",
      message: "The requested path (" + absolutePath + ") could not be found"
    });
  }
  let streamOpts = null;
  if (request.headers.range && stats.size) {
    const range = rangeParser(stats.size, request.headers.range);
    if (typeof range === "object" && range.type === "bytes") {
      const { start, end } = range.ranges[0];
      streamOpts = {
        start,
        end
      };
      response.statusCode = 206;
    } else {
      response.statusCode = 416;
      response.setHeader("Content-Range", `bytes */${stats.size}`);
    }
  }
  let stream = null;
  try {
    stream = createReadStream(absolutePath, streamOpts ?? {});
  } catch {
    return internalError(absolutePath, response);
  }
  const headers = getHeaders(absolutePath, stats);
  if (streamOpts !== null) {
    headers["Content-Range"] = `bytes ${streamOpts.start}-${streamOpts.end}/${stats.size}`;
    headers["Content-Length"] = String(streamOpts.end - streamOpts.start + 1);
  }
  headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
  response.writeHead(response.statusCode || 200, headers);
  stream.pipe(response);
};

// src/serve-static.ts
var serveStatic = async (path19, options) => {
  const {
    listener: offthreadRequest,
    close: closeCompositor,
    compositor
  } = startOffthreadVideoServer({
    downloadMap: options.downloadMap,
    offthreadVideoThreads: options.offthreadVideoThreads,
    logLevel: options.logLevel,
    indent: options.indent,
    offthreadVideoCacheSizeInBytes: options.offthreadVideoCacheSizeInBytes,
    binariesDirectory: options.binariesDirectory
  });
  const connections = {};
  const server = http2.createServer((request, response) => {
    if (request.url?.startsWith("/proxy")) {
      return offthreadRequest(request, response);
    }
    if (path19 === null) {
      response.writeHead(404);
      response.end("Server only supports /proxy");
      return;
    }
    serveHandler(request, response, {
      public: path19
    }).catch(() => {
      if (!response.headersSent) {
        response.writeHead(500);
      }
      response.end("Error serving file");
    });
  });
  server.on("connection", (conn) => {
    let key;
    try {
      key = conn.remoteAddress + ":" + conn.remotePort;
    } catch {
      key = ":";
    }
    connections[key] = conn;
    conn.on("close", () => {
      delete connections[key];
    });
  });
  let selectedPort = null;
  const maxTries = 10;
  const portConfig = getPortConfig(options.forceIPv4);
  for (let i = 0;i < maxTries; i++) {
    let unlock = () => {};
    try {
      selectedPort = await new Promise((resolve2, reject) => {
        getDesiredPort({
          desiredPort: options?.port ?? undefined,
          from: 3000,
          to: 3100,
          hostsToTry: portConfig.hostsToTry
        }).then(({ port, unlockPort }) => {
          unlock = unlockPort;
          server.listen({ port, host: portConfig.host });
          server.on("listening", () => {
            resolve2(port);
            return unlock();
          });
          server.on("error", (err) => {
            unlock();
            reject(err);
          });
        }).catch((err) => {
          unlock();
          return reject(err);
        });
      });
      const destroyConnections = function() {
        for (const key in connections)
          connections[key].destroy();
      };
      const close = async () => {
        await Promise.all([
          new Promise((resolve2, reject) => {
            closeCompositor().catch((err) => {
              if (err.message.includes("Compositor quit")) {
                resolve2();
                return;
              }
              reject(err);
            }).finally(() => {
              resolve2();
            });
          }),
          new Promise((resolve2, reject) => {
            destroyConnections();
            server.close((err) => {
              if (err) {
                if (err.code === "ERR_SERVER_NOT_RUNNING") {
                  return resolve2();
                }
                reject(err);
              } else {
                resolve2();
              }
            });
          })
        ]);
      };
      return { port: selectedPort, close, compositor };
    } catch (err) {
      if (!(err instanceof Error)) {
        throw err;
      }
      const codedError = err;
      if (codedError.code === "EADDRINUSE") {} else {
        throw err;
      }
    }
  }
  throw new Error(`Tried ${maxTries} times to find a free port. Giving up.`);
};

// src/wait-for-symbolication-error-to-be-done.ts
var { lock, unlock, waitForAllToBeDone } = createLock({ timeout: 50000 });
var registerErrorSymbolicationLock = lock;
var unlockErrorSymbolicationLock = unlock;
var waitForSymbolicationToBeDone = waitForAllToBeDone;

// src/prepare-server.ts
var prepareServer = async ({
  webpackConfigOrServeUrl,
  port,
  remotionRoot,
  offthreadVideoThreads,
  logLevel,
  indent,
  offthreadVideoCacheSizeInBytes,
  binariesDirectory,
  forceIPv4
}) => {
  const downloadMap = makeDownloadMap();
  Log.verbose({ indent, logLevel }, "Created directory for temporary files", downloadMap.assetDir);
  if (isServeUrl(webpackConfigOrServeUrl)) {
    const {
      port: offthreadPort,
      close: closeProxy,
      compositor: comp
    } = await serveStatic(null, {
      port,
      downloadMap,
      remotionRoot,
      offthreadVideoThreads,
      logLevel,
      indent,
      offthreadVideoCacheSizeInBytes,
      binariesDirectory,
      forceIPv4
    });
    const normalized = normalizeServeUrl(webpackConfigOrServeUrl);
    let remoteSourceMap = null;
    getSourceMapFromRemoteUrl(getBundleMapUrlFromServeUrl(normalized)).then((s) => {
      remoteSourceMap = s;
    }).catch((err) => {
      Log.verbose({ indent, logLevel }, "Could not fetch sourcemap for ", normalized, err);
    });
    return Promise.resolve({
      serveUrl: normalized,
      closeServer: () => {
        cleanDownloadMap(downloadMap);
        remoteSourceMap?.destroy();
        remoteSourceMap = null;
        return closeProxy();
      },
      offthreadPort,
      compositor: comp,
      sourceMap: () => remoteSourceMap,
      downloadMap
    });
  }
  const indexFile = path19.join(webpackConfigOrServeUrl, "index.html");
  const exists = existsSync4(indexFile);
  if (!exists) {
    throw new Error(`Tried to serve the Webpack bundle on a HTTP server, but the file ${indexFile} does not exist. Is this a valid path to a Webpack bundle?`);
  }
  let localSourceMap = null;
  getSourceMapFromLocalFile(path19.join(webpackConfigOrServeUrl, NoReactInternals7.bundleName)).then((s) => {
    localSourceMap = s;
  }).catch((err) => {
    Log.verbose({ indent, logLevel }, "Could not fetch sourcemap for ", webpackConfigOrServeUrl, err);
  });
  const {
    port: serverPort,
    close,
    compositor
  } = await serveStatic(webpackConfigOrServeUrl, {
    port,
    downloadMap,
    remotionRoot,
    offthreadVideoThreads,
    logLevel,
    indent,
    offthreadVideoCacheSizeInBytes,
    binariesDirectory,
    forceIPv4
  });
  return Promise.resolve({
    closeServer: async (force) => {
      localSourceMap?.destroy();
      localSourceMap = null;
      cleanDownloadMap(downloadMap);
      if (!force) {
        await waitForSymbolicationToBeDone();
      }
      return close();
    },
    serveUrl: `http://localhost:${serverPort}`,
    offthreadPort: serverPort,
    compositor,
    sourceMap: () => localSourceMap,
    downloadMap
  });
};
var makeOrReuseServer = async (server, config, {
  onDownload
}) => {
  if (server) {
    const cleanupOnDownload = attachDownloadListenerToEmitter(server.downloadMap, onDownload);
    return {
      server,
      cleanupServer: () => {
        cleanupOnDownload();
        return Promise.resolve();
      }
    };
  }
  const newServer = await prepareServer(config);
  const cleanupOnDownloadNew = attachDownloadListenerToEmitter(newServer.downloadMap, onDownload);
  return {
    server: newServer,
    cleanupServer: (force) => {
      cleanupOnDownloadNew();
      return Promise.all([newServer.closeServer(force)]);
    }
  };
};

// src/puppeteer-evaluate.ts
var EVALUATION_SCRIPT_URL2 = "__puppeteer_evaluation_script__";
function valueFromRemoteObject2(remoteObject) {
  if (remoteObject.unserializableValue) {
    if (remoteObject.type === "bigint" && typeof BigInt !== "undefined")
      return BigInt(remoteObject.unserializableValue.replace("n", ""));
    switch (remoteObject.unserializableValue) {
      case "-0":
        return -0;
      case "NaN":
        return NaN;
      case "Infinity":
        return Infinity;
      case "-Infinity":
        return -Infinity;
      default:
        throw new Error("Unsupported unserializable value: " + remoteObject.unserializableValue);
    }
  }
  return remoteObject.value;
}
function puppeteerEvaluateWithCatchAndTimeout({
  args,
  frame,
  page,
  pageFunction,
  timeoutInMilliseconds
}) {
  let timeout = null;
  return Promise.race([
    new Promise((_, reject) => {
      timeout = setTimeout(() => {
        reject(new Error(`Timed out evaluating page function "${pageFunction.toString()}"`));
      }, timeoutInMilliseconds);
    }),
    puppeteerEvaluateWithCatch({
      args,
      frame,
      page,
      pageFunction,
      timeoutInMilliseconds
    })
  ]).then((data) => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    return data;
  });
}
async function puppeteerEvaluateWithCatch({
  page,
  pageFunction,
  frame,
  args
}) {
  const contextId = (await page.mainFrame().executionContext())._contextId;
  const client = page._client();
  const suffix = `//# sourceURL=${EVALUATION_SCRIPT_URL2}`;
  if (typeof pageFunction !== "function")
    throw new Error(`Expected to get |string| or |function| as the first argument, but got "${pageFunction}" instead.`);
  let functionText = pageFunction.toString();
  try {
    new Function("(" + functionText + ")");
  } catch {
    if (functionText.startsWith("async "))
      functionText = "async function " + functionText.substring("async ".length);
    else
      functionText = "function " + functionText;
    try {
      new Function("(" + functionText + ")");
    } catch {
      throw new Error("Passed function is not well-serializable!");
    }
  }
  let callFunctionOnPromise;
  try {
    callFunctionOnPromise = client.send("Runtime.callFunctionOn", {
      functionDeclaration: functionText + `
` + suffix + `
`,
      executionContextId: contextId,
      arguments: args.map((a) => convertArgument(a)),
      returnByValue: true,
      awaitPromise: true,
      userGesture: true
    });
  } catch (error) {
    if (error instanceof TypeError && error.message.startsWith("Converting circular structure to JSON")) {
      error.message += " Are you passing a nested JSHandle?";
    }
    throw error;
  }
  try {
    const {
      value: { exceptionDetails, result: remoteObject },
      size
    } = await callFunctionOnPromise;
    if (exceptionDetails) {
      const err = new SymbolicateableError({
        stack: exceptionDetails.exception?.description,
        name: exceptionDetails.exception?.className,
        message: exceptionDetails.exception?.description?.split(`
`)[0],
        frame,
        stackFrame: parseStack((exceptionDetails.exception?.description).split(`
`)),
        chunk: null
      });
      page.close();
      throw err;
    }
    return { size, value: valueFromRemoteObject2(remoteObject) };
  } catch (error) {
    if (error?.originalMessage?.startsWith("Object couldn't be returned by value")) {
      throw new Error("Could not serialize the return value of the function. Did you pass non-serializable values to defaultProps?");
    }
    throw error;
  }
}
function convertArgument(arg) {
  if (typeof arg === "number") {
    return { value: arg };
  }
  if (typeof arg === "string") {
    return { value: arg };
  }
  if (typeof arg === "boolean") {
    return { value: arg };
  }
  if (typeof arg === "bigint")
    return { unserializableValue: `${arg.toString()}n` };
  if (Object.is(arg, -0))
    return { unserializableValue: "-0" };
  if (Object.is(arg, Infinity))
    return { unserializableValue: "Infinity" };
  if (Object.is(arg, -Infinity))
    return { unserializableValue: "-Infinity" };
  if (Object.is(arg, NaN))
    return { unserializableValue: "NaN" };
  const objectHandle = arg && arg instanceof JSHandle ? arg : null;
  if (objectHandle) {
    if (objectHandle._disposed)
      throw new Error("JSHandle is disposed!");
    if (objectHandle._remoteObject.unserializableValue)
      return {
        unserializableValue: objectHandle._remoteObject.unserializableValue
      };
    if (!objectHandle._remoteObject.objectId)
      return { value: objectHandle._remoteObject.value };
    return { objectId: objectHandle._remoteObject.objectId };
  }
  return { value: arg };
}

// src/seek-to-frame.ts
var cancelledToken = "cancelled";
var readyToken = "ready";
var waitForReady = ({
  page,
  timeoutInMilliseconds,
  frame,
  indent,
  logLevel
}) => {
  const cleanups = [];
  const retrieveCancelledErrorAndReject = () => {
    return new Promise((_, reject) => {
      puppeteerEvaluateWithCatch({
        pageFunction: () => window.remotion_cancelledError,
        args: [],
        frame: null,
        page,
        timeoutInMilliseconds
      }).then(({ value: val }) => {
        if (typeof val !== "string") {
          reject(val);
          return;
        }
        reject(new SymbolicateableError({
          frame: null,
          stack: val,
          name: "CancelledError",
          message: val.split(`
`)[0],
          stackFrame: parseStack(val.split(`
`)),
          chunk: null
        }));
      }).catch((err) => {
        Log.verbose({ indent, logLevel }, "Could not get cancelled error", err);
        reject(new Error("Render was cancelled using cancelRender()"));
      });
    });
  };
  const waitForReadyProm = new Promise((resolve2, reject) => {
    const waitTask = page.mainFrame()._mainWorld.waitForFunction({
      browser: page.browser,
      timeout: timeoutInMilliseconds + 3000,
      pageFunction: `window.remotion_renderReady === true ? "${readyToken}" : window.remotion_cancelledError !== undefined ? "${cancelledToken}" : false`,
      title: frame === null ? "the page to render the React component" : `the page to render the React component at frame ${frame}`
    });
    cleanups.push(() => {
      waitTask.terminate(new Error("cleanup"));
    });
    waitTask.promise.then((a) => {
      const token = a.toString();
      if (token === cancelledToken) {
        return retrieveCancelledErrorAndReject();
      }
      if (token === readyToken) {
        return resolve2(a);
      }
      reject(new Error("Unexpected token " + token));
    }).catch((err) => {
      if (err.message.includes("timeout") && err.message.includes("exceeded")) {
        puppeteerEvaluateWithCatchAndTimeout({
          pageFunction: () => {
            return Object.keys(window.remotion_delayRenderTimeouts).map((id, i) => {
              const { label } = window.remotion_delayRenderTimeouts[id];
              if (label === null) {
                return `${i + 1}. (no label)`;
              }
              return `"${i + 1}. ${label}"`;
            }).join(", ");
          },
          args: [],
          frame,
          page,
          timeoutInMilliseconds: 5000
        }).then((res) => {
          reject(new Error(`Timeout (${timeoutInMilliseconds}ms) exceeded rendering the component${frame ? " at frame " + frame : " initially"}. ${res.value ? `Open delayRender() handles: ${res.value}` : ""}. You can increase the timeout using the "timeoutInMilliseconds" / "--timeout" option of the function or command you used to trigger this render.`));
        }).catch((newErr) => {
          Log.warn({ indent, logLevel }, "Tried to get delayRender() handles for timeout, but could not do so because of", newErr);
          reject(err);
        });
      } else {
        reject(err);
      }
    });
  });
  const onDisposedPromise = new Promise((_, reject) => {
    const onDispose = () => {
      reject(new Error("Target closed (page disposed)"));
    };
    page.on("disposed" /* Disposed */, onDispose);
    cleanups.push(() => {
      page.off("disposed" /* Disposed */, onDispose);
    });
  });
  const onClosedSilentPromise = new Promise((_, reject) => {
    const onClosedSilent = () => {
      reject(new Error("Target closed"));
    };
    page.browser.on("closed-silent" /* ClosedSilent */, onClosedSilent);
    cleanups.push(() => {
      page.browser.off("closed-silent" /* ClosedSilent */, onClosedSilent);
    });
  });
  return Promise.race([
    onDisposedPromise,
    onClosedSilentPromise,
    waitForReadyProm
  ]).finally(() => {
    cleanups.forEach((cleanup) => {
      cleanup();
    });
  });
};
var seekToFrame = async ({
  frame,
  page,
  composition,
  timeoutInMilliseconds,
  logLevel,
  indent,
  attempt
}) => {
  await waitForReady({
    page,
    timeoutInMilliseconds,
    frame: null,
    indent,
    logLevel
  });
  await puppeteerEvaluateWithCatchAndTimeout({
    pageFunction: (f, c, a) => {
      window.remotion_setFrame(f, c, a);
    },
    args: [frame, composition, attempt],
    frame,
    page,
    timeoutInMilliseconds
  });
  await waitForReady({ page, timeoutInMilliseconds, frame, indent, logLevel });
  await page.evaluateHandle("document.fonts.ready");
};

// src/set-props-and-env.ts
import { VERSION as VERSION3 } from "remotion/version";

// src/goto-page-or-throw.ts
var gotoPageOrThrow = async (page, urlToVisit, actualTimeout) => {
  try {
    const pageRes = await page.goto({ url: urlToVisit, timeout: actualTimeout });
    if (pageRes === null) {
      return [null, new Error(`Visited "${urlToVisit}" but got no response.`)];
    }
    return [pageRes, null];
  } catch (err) {
    return [null, err];
  }
};

// src/validate-puppeteer-timeout.ts
var validatePuppeteerTimeout = (timeoutInMilliseconds) => {
  if (timeoutInMilliseconds === null || timeoutInMilliseconds === undefined) {
    return;
  }
  if (typeof timeoutInMilliseconds !== "number") {
    throw new TypeError(`'timeoutInMilliseconds' should be a number, but is: ${JSON.stringify(timeoutInMilliseconds)}`);
  }
  if (timeoutInMilliseconds < 7000 && true) {
    throw new TypeError(`'timeoutInMilliseconds' should be bigger or equal than 7000, but is ${timeoutInMilliseconds}`);
  }
  if (Number.isNaN(timeoutInMilliseconds)) {
    throw new TypeError(`'timeoutInMilliseconds' should not be NaN, but is ${timeoutInMilliseconds}`);
  }
  if (!Number.isFinite(timeoutInMilliseconds)) {
    throw new TypeError(`'timeoutInMilliseconds' should be finite, but is ${timeoutInMilliseconds}`);
  }
  if (timeoutInMilliseconds % 1 !== 0) {
    throw new TypeError(`'timeoutInMilliseconds' should be an integer, but is ${timeoutInMilliseconds}`);
  }
};

// src/set-props-and-env.ts
var innerSetPropsAndEnv = async ({
  serializedInputPropsWithCustomSchema,
  envVariables,
  page,
  serveUrl,
  initialFrame,
  timeoutInMilliseconds,
  proxyPort,
  retriesRemaining,
  audioEnabled,
  videoEnabled,
  indent,
  logLevel,
  onServeUrlVisited,
  isMainTab,
  mediaCacheSizeInBytes,
  initialMemoryAvailable,
  darkMode
}) => {
  validatePuppeteerTimeout(timeoutInMilliseconds);
  const actualTimeout = timeoutInMilliseconds ?? DEFAULT_TIMEOUT;
  page.setDefaultTimeout(actualTimeout);
  page.setDefaultNavigationTimeout(actualTimeout);
  const urlToVisit = normalizeServeUrl(serveUrl);
  await page.evaluateOnNewDocument((timeout, mainTab, cacheSizeInBytes, initMemoryAvailable) => {
    window.remotion_puppeteerTimeout = timeout;
    window.remotion_isMainTab = mainTab;
    window.remotion_mediaCacheSizeInBytes = cacheSizeInBytes;
    window.remotion_initialMemoryAvailable = initMemoryAvailable;
    if (window.process === undefined) {
      window.process = {};
    }
    if (window.process.env === undefined) {
      window.process.env = {};
    }
    window.process.env.NODE_ENV = "production";
  }, actualTimeout, isMainTab, mediaCacheSizeInBytes, initialMemoryAvailable);
  await page.evaluateOnNewDocument('window.remotion_broadcastChannel = new BroadcastChannel("remotion-video-frame-extraction")');
  if (envVariables) {
    await page.evaluateOnNewDocument((input) => {
      window.remotion_envVariables = input;
    }, JSON.stringify(envVariables));
  }
  if (darkMode) {
    await page.setAutoDarkModeOverride();
  }
  await page.evaluateOnNewDocument((input, key, port, audEnabled, vidEnabled, level) => {
    window.remotion_inputProps = input;
    window.remotion_initialFrame = key;
    window.remotion_attempt = 1;
    window.remotion_proxyPort = port;
    window.remotion_audioEnabled = audEnabled;
    window.remotion_videoEnabled = vidEnabled;
    window.remotion_logLevel = level;
    window.alert = (message) => {
      if (message) {
        window.window.remotion_cancelledError = new Error(`alert("${message}") was called. It cannot be called in a headless browser.`).stack;
      } else {
        window.window.remotion_cancelledError = new Error("alert() was called. It cannot be called in a headless browser.").stack;
      }
    };
    window.confirm = (message) => {
      if (message) {
        window.remotion_cancelledError = new Error(`confirm("${message}") was called. It cannot be called in a headless browser.`).stack;
      } else {
        window.remotion_cancelledError = new Error("confirm() was called. It cannot be called in a headless browser.").stack;
      }
      return false;
    };
  }, serializedInputPropsWithCustomSchema, initialFrame, proxyPort, audioEnabled, videoEnabled, logLevel);
  const retry = async () => {
    await new Promise((resolve2) => {
      setTimeout(() => {
        resolve2();
      }, 2000);
    });
    return innerSetPropsAndEnv({
      envVariables,
      initialFrame,
      serializedInputPropsWithCustomSchema,
      page,
      proxyPort,
      retriesRemaining: retriesRemaining - 1,
      serveUrl,
      timeoutInMilliseconds,
      audioEnabled,
      videoEnabled,
      indent,
      logLevel,
      onServeUrlVisited,
      isMainTab,
      mediaCacheSizeInBytes,
      initialMemoryAvailable,
      darkMode
    });
  };
  const [pageRes, error] = await gotoPageOrThrow(page, urlToVisit, actualTimeout);
  if (error !== null) {
    if (error.message.includes("ECONNRESET") || error.message.includes("ERR_CONNECTION_TIMED_OUT")) {
      return retry();
    }
    throw error;
  }
  const status = pageRes.status();
  if (status >= 500 && status <= 504 && retriesRemaining > 0) {
    return retry();
  }
  if (!redirectStatusCodes.every((code) => code !== status)) {
    throw new Error(`Error while getting compositions: Tried to go to ${urlToVisit} but the status code was ${status} instead of 200. Does the site you specified exist?`);
  }
  onServeUrlVisited();
  const { value: isRemotionFn } = await puppeteerEvaluateWithCatch({
    pageFunction: () => {
      return window.getStaticCompositions;
    },
    args: [],
    frame: null,
    page,
    timeoutInMilliseconds: actualTimeout
  });
  if (typeof isRemotionFn === "undefined") {
    const { value: body } = await puppeteerEvaluateWithCatch({
      pageFunction: () => {
        return document.body.innerHTML;
      },
      args: [],
      frame: null,
      page,
      timeoutInMilliseconds: actualTimeout
    });
    if (body.includes("We encountered an internal error.")) {
      return retry();
    }
    const errorMessage = [
      `Error while getting compositions: Tried to go to ${urlToVisit} and verify that it is a Remotion project by checking if window.getStaticCompositions is defined.`,
      "However, the function was undefined, which indicates that this is not a valid Remotion project. Please check the URL you passed.",
      "The page loaded contained the following markup:",
      body.substring(0, 500) + (body.length > 500 ? "..." : ""),
      "Does this look like a foreign page? If so, try to stop this server."
    ].join(`
`);
    throw new Error(errorMessage);
  }
  const { value: siteVersion } = await puppeteerEvaluateWithCatch({
    pageFunction: () => {
      return window.siteVersion;
    },
    args: [],
    frame: null,
    page,
    timeoutInMilliseconds: actualTimeout
  });
  const { value: remotionVersion } = await puppeteerEvaluateWithCatch({
    pageFunction: () => {
      return window.remotion_version;
    },
    args: [],
    frame: null,
    page,
    timeoutInMilliseconds: actualTimeout
  });
  const requiredVersion = "11";
  if (siteVersion !== requiredVersion) {
    throw new Error([
      `Incompatible site: When visiting ${urlToVisit}, a bundle was found, but one that is not compatible with this version of Remotion. Found version: ${siteVersion} - Required version: ${requiredVersion}. To resolve this error:`,
      "When using server-side rendering:",
      ` ▸ Use 'bundle()' with '@remotion/bundler' of version ${VERSION3} to create a compatible bundle.`,
      "When using the Remotion Lambda:",
      " ▸ Use `npx remotion lambda sites create` to redeploy the site with the latest version.",
      " ℹ Use --site-name with the same name as before to overwrite your site.",
      " ▸ Use `deploySite()` if you are using the Node.JS APIs."
    ].join(`
`));
  }
  if (remotionVersion !== VERSION3 && true) {
    if (remotionVersion) {
      Log.warn({
        indent,
        logLevel
      }, [
        `The site was bundled with version ${remotionVersion} of @remotion/bundler, while @remotion/renderer is on version ${VERSION3}. You may not have the newest bugfixes and features.`,
        `To resolve this warning:`,
        "▸ Use `npx remotion lambda sites create` to redeploy the site with the latest version.",
        "  ℹ Use --site-name with the same name as before to overwrite your site.",
        "▸ Use `deploySite()` if you are using the Node.JS APIs."
      ].join(`
`));
    } else {
      Log.warn({
        indent,
        logLevel
      }, `The site was bundled with an old version of Remotion, while @remotion/renderer is on version ${VERSION3}. You may not have the newest bugfixes and features. Re-bundle the site to fix this issue.`);
    }
  }
};
var setPropsAndEnv = async (params) => {
  let timeout = null;
  try {
    const result = await Promise.race([
      innerSetPropsAndEnv(params),
      new Promise((_, reject) => {
        timeout = setTimeout(() => {
          reject(new Error([
            `Timed out after ${params.timeoutInMilliseconds}ms while setting up the headless browser.`,
            "This could be because the you specified takes a long time to load (or network resources that it includes like fonts) or because the browser is not responding.",
            process.platform === "linux" ? "Make sure you have installed the Linux depdendencies: https://www.remotion.dev/docs/miscellaneous/linux-dependencies" : null
          ].filter(truthy).join(`
`)));
        }, params.timeoutInMilliseconds);
      })
    ]);
    return result;
  } finally {
    if (timeout !== null) {
      clearTimeout(timeout);
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

// src/get-compositions.ts
var innerGetCompositions = async ({
  envVariables,
  serializedInputPropsWithCustomSchema,
  page,
  proxyPort,
  serveUrl,
  timeoutInMilliseconds,
  indent,
  logLevel,
  mediaCacheSizeInBytes,
  darkMode
}) => {
  validatePuppeteerTimeout(timeoutInMilliseconds);
  await setPropsAndEnv({
    serializedInputPropsWithCustomSchema,
    envVariables,
    page,
    serveUrl,
    initialFrame: 0,
    timeoutInMilliseconds,
    proxyPort,
    retriesRemaining: 2,
    audioEnabled: false,
    videoEnabled: false,
    indent,
    logLevel,
    onServeUrlVisited: () => {
      return;
    },
    isMainTab: true,
    mediaCacheSizeInBytes,
    initialMemoryAvailable: getAvailableMemory(logLevel),
    darkMode
  });
  await puppeteerEvaluateWithCatch({
    page,
    pageFunction: () => {
      window.remotion_setBundleMode({
        type: "evaluation"
      });
    },
    frame: null,
    args: [],
    timeoutInMilliseconds
  });
  await waitForReady({
    page,
    timeoutInMilliseconds,
    frame: null,
    indent,
    logLevel
  });
  const { value: result } = await puppeteerEvaluateWithCatch({
    pageFunction: () => {
      return window.getStaticCompositions();
    },
    frame: null,
    page,
    args: [],
    timeoutInMilliseconds
  });
  const res = result;
  return res.map((r) => {
    const {
      width,
      durationInFrames,
      fps,
      height,
      id,
      defaultCodec,
      defaultOutName,
      defaultVideoImageFormat,
      defaultPixelFormat,
      defaultProResProfile
    } = r;
    return {
      id,
      width,
      height,
      fps,
      durationInFrames,
      props: NoReactInternals8.deserializeJSONWithSpecialTypes(r.serializedResolvedPropsWithCustomSchema),
      defaultProps: NoReactInternals8.deserializeJSONWithSpecialTypes(r.serializedDefaultPropsWithCustomSchema),
      defaultCodec,
      defaultOutName,
      defaultVideoImageFormat,
      defaultPixelFormat,
      defaultProResProfile
    };
  });
};
var internalGetCompositionsRaw = async ({
  browserExecutable,
  chromiumOptions,
  envVariables,
  indent,
  serializedInputPropsWithCustomSchema,
  onBrowserLog,
  port,
  puppeteerInstance,
  serveUrlOrWebpackUrl,
  server,
  timeoutInMilliseconds,
  logLevel,
  offthreadVideoCacheSizeInBytes,
  binariesDirectory,
  onBrowserDownload,
  chromeMode,
  offthreadVideoThreads,
  mediaCacheSizeInBytes,
  onLog
}) => {
  const { page, cleanupPage } = await getPageAndCleanupFn({
    passedInInstance: puppeteerInstance,
    browserExecutable,
    chromiumOptions,
    forceDeviceScaleFactor: undefined,
    indent,
    logLevel,
    onBrowserDownload,
    chromeMode,
    pageIndex: 0,
    onBrowserLog,
    onLog
  });
  const cleanup = [cleanupPage];
  return new Promise((resolve2, reject) => {
    const onError = (err) => reject(err);
    cleanup.push(handleJavascriptException({
      page,
      frame: null,
      onError
    }));
    makeOrReuseServer(server, {
      webpackConfigOrServeUrl: serveUrlOrWebpackUrl,
      port,
      remotionRoot: findRemotionRoot(),
      offthreadVideoThreads: offthreadVideoThreads ?? DEFAULT_RENDER_FRAMES_OFFTHREAD_VIDEO_THREADS,
      logLevel,
      indent,
      offthreadVideoCacheSizeInBytes,
      binariesDirectory,
      forceIPv4: false
    }, {
      onDownload: () => {
        return;
      }
    }).then(({ server: { serveUrl, offthreadPort, sourceMap }, cleanupServer }) => {
      page.setBrowserSourceMapGetter(sourceMap);
      cleanup.push(() => {
        return cleanupServer(true);
      });
      return innerGetCompositions({
        envVariables,
        serializedInputPropsWithCustomSchema,
        page,
        proxyPort: offthreadPort,
        serveUrl,
        timeoutInMilliseconds,
        indent,
        logLevel,
        offthreadVideoCacheSizeInBytes,
        binariesDirectory,
        onBrowserDownload,
        chromeMode,
        offthreadVideoThreads,
        mediaCacheSizeInBytes,
        darkMode: chromiumOptions.darkMode ?? false
      });
    }).then((comp) => {
      return resolve2(comp);
    }).catch((err) => {
      reject(err);
    }).finally(() => {
      cleanup.forEach((c) => {
        c();
      });
    });
  });
};
var internalGetCompositions = wrapWithErrorHandling(internalGetCompositionsRaw);
var getCompositions = (serveUrlOrWebpackUrl, config) => {
  if (!serveUrlOrWebpackUrl) {
    throw new Error("No serve URL or webpack bundle directory was passed to getCompositions().");
  }
  const {
    browserExecutable,
    chromiumOptions,
    envVariables,
    inputProps,
    onBrowserLog,
    port,
    puppeteerInstance,
    timeoutInMilliseconds,
    logLevel: passedLogLevel,
    onBrowserDownload,
    binariesDirectory,
    offthreadVideoCacheSizeInBytes,
    chromeMode,
    offthreadVideoThreads,
    mediaCacheSizeInBytes
  } = config ?? {};
  const indent = false;
  const logLevel = passedLogLevel ?? "info";
  return internalGetCompositions({
    browserExecutable: browserExecutable ?? null,
    chromiumOptions: chromiumOptions ?? {},
    envVariables: envVariables ?? {},
    serializedInputPropsWithCustomSchema: NoReactInternals8.serializeJSONWithSpecialTypes({
      data: inputProps ?? {},
      indent: undefined,
      staticBase: null
    }).serializedString,
    indent,
    onBrowserLog: onBrowserLog ?? null,
    port: port ?? null,
    puppeteerInstance: puppeteerInstance ?? undefined,
    serveUrlOrWebpackUrl,
    server: undefined,
    timeoutInMilliseconds: timeoutInMilliseconds ?? DEFAULT_TIMEOUT,
    logLevel,
    offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytes ?? null,
    binariesDirectory: binariesDirectory ?? null,
    onBrowserDownload: onBrowserDownload ?? defaultBrowserDownloadProgress({
      indent,
      logLevel,
      api: "getCompositions()"
    }),
    chromeMode: chromeMode ?? "headless-shell",
    offthreadVideoThreads: offthreadVideoThreads ?? null,
    mediaCacheSizeInBytes: mediaCacheSizeInBytes ?? null,
    onLog: defaultOnLog
  });
};

// src/get-concurrency.ts
var resolveConcurrency = (userPreference) => {
  const maxCpus = getCpuCount();
  if (userPreference === null) {
    return Math.round(Math.min(8, Math.max(1, maxCpus / 2)));
  }
  const min = 1;
  let rounded;
  if (typeof userPreference === "string") {
    const percentage = parseInt(userPreference.slice(0, -1), 10);
    rounded = Math.floor(percentage / 100 * maxCpus);
  } else {
    rounded = Math.floor(userPreference);
  }
  if (rounded > maxCpus) {
    throw new Error(`Maximum for --concurrency is ${maxCpus} (number of cores on this system)`);
  }
  if (rounded < min) {
    throw new Error(`Minimum for concurrency is ${min}.`);
  }
  return rounded;
};

// src/get-duration-from-frame-range.ts
var getFramesToRender = (frameRange, everyNthFrame) => {
  if (everyNthFrame === 0) {
    throw new Error("everyNthFrame cannot be 0");
  }
  return new Array(frameRange[1] - frameRange[0] + 1).fill(true).map((_, index) => {
    return index + frameRange[0];
  }).filter((index) => {
    return index % everyNthFrame === 0;
  });
};

// src/get-extension-from-codec.ts
var getFileExtensionFromCodec = (codec, audioCodec) => {
  if (!validCodecs.includes(codec)) {
    throw new Error(`Codec must be one of the following: ${validCodecs.join(", ")}, but got ${codec}`);
  }
  const map2 = defaultFileExtensionMap[codec];
  if (audioCodec === null) {
    return map2.default;
  }
  const typedAudioCodec = audioCodec;
  if (!(typedAudioCodec in map2.forAudioCodec)) {
    throw new Error(`Audio codec ${typedAudioCodec} is not supported for codec ${codec}`);
  }
  return map2.forAudioCodec[audioCodec].default;
};
var makeFileExtensionMap = () => {
  const map2 = {};
  Object.keys(defaultFileExtensionMap).forEach((_codec) => {
    const codec = _codec;
    const fileExtMap = defaultFileExtensionMap[codec];
    const audioCodecs = Object.keys(fileExtMap.forAudioCodec);
    const possibleExtensionsForAudioCodec = audioCodecs.map((audioCodec) => fileExtMap.forAudioCodec[audioCodec].possible);
    const allPossibleExtensions = [
      fileExtMap.default,
      ...possibleExtensionsForAudioCodec.flat(1)
    ];
    for (const extension of allPossibleExtensions) {
      if (!map2[extension]) {
        map2[extension] = [];
      }
      if (!map2[extension].includes(codec)) {
        map2[extension].push(codec);
      }
    }
  });
  return map2;
};
var defaultCodecsForFileExtension = {
  "3gp": "aac",
  aac: "aac",
  gif: "gif",
  hevc: "h265",
  m4a: "aac",
  m4b: "aac",
  mkv: "h264-mkv",
  mov: "prores",
  mp3: "mp3",
  mp4: "h264",
  mpeg: "aac",
  mpg: "aac",
  mxf: "prores",
  wav: "wav",
  webm: "vp8",
  ts: "h264-ts"
};

// src/path-normalize.ts
var SLASH = 47;
var DOT = 46;
var assertPath = (path20) => {
  const t = typeof path20;
  if (t !== "string") {
    throw new TypeError(`Expected a string, got a ${t}`);
  }
};
var posixNormalize = (path20, allowAboveRoot) => {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let code;
  for (let i = 0;i <= path20.length; ++i) {
    if (i < path20.length) {
      code = path20.charCodeAt(i);
    } else if (code === SLASH) {
      break;
    } else {
      code = SLASH;
    }
    if (code === SLASH) {
      if (lastSlash === i - 1 || dots === 1) {} else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== DOT || res.charCodeAt(res.length - 2) !== DOT) {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf("/");
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1) {
                res = "";
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
              }
              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0) {
            res += "/..";
          } else {
            res = "..";
          }
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) {
          res += "/" + path20.slice(lastSlash + 1, i);
        } else {
          res = path20.slice(lastSlash + 1, i);
        }
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === DOT && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
};
var decode = (s) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};
var pathNormalize = (p) => {
  assertPath(p);
  let path20 = p;
  if (path20.length === 0) {
    return ".";
  }
  const isAbsolute = path20.charCodeAt(0) === SLASH;
  const trailingSeparator = path20.charCodeAt(path20.length - 1) === SLASH;
  path20 = decode(path20);
  path20 = posixNormalize(path20, !isAbsolute);
  if (path20.length === 0 && !isAbsolute) {
    path20 = ".";
  }
  if (path20.length > 0 && trailingSeparator) {
    path20 += "/";
  }
  if (isAbsolute) {
    return "/" + path20;
  }
  return path20;
};

// src/get-extension-of-filename.ts
var getExtensionOfFilename = (filename) => {
  if (filename === null) {
    return null;
  }
  const filenameArr = pathNormalize(filename).split(".");
  const hasExtension = filenameArr.length >= 2;
  const filenameArrLength = filenameArr.length;
  const extension = hasExtension ? filenameArr[filenameArrLength - 1] : null;
  return extension;
};

// src/get-frame-to-render.ts
var getRealFrameRange = (durationInFrames, frameRange) => {
  if (frameRange === null) {
    return [0, durationInFrames - 1];
  }
  if (typeof frameRange === "number") {
    if (frameRange < 0 || frameRange >= durationInFrames) {
      throw new Error(`Frame number is out of range, must be between 0 and ${durationInFrames - 1} but got ${frameRange}`);
    }
    return [frameRange, frameRange];
  }
  const resolved = [
    frameRange[0],
    frameRange[1] === null ? durationInFrames - 1 : frameRange[1]
  ];
  if (resolved[0] < 0 || resolved[1] >= durationInFrames || resolved[0] > resolved[1]) {
    throw new Error(`The "durationInFrames" of the <Composition /> was evaluated to be ${durationInFrames}, but frame range ${resolved.join("-")} is not inbetween 0-${durationInFrames - 1}`);
  }
  return resolved;
};

// src/image-format.ts
var validVideoImageFormats = ["png", "jpeg", "none"];
var validStillImageFormats = ["png", "jpeg", "pdf", "webp"];
var DEFAULT_VIDEO_IMAGE_FORMAT = "jpeg";
var DEFAULT_STILL_IMAGE_FORMAT = "png";
var validateSelectedPixelFormatAndImageFormatCombination = (pixelFormat, videoImageFormat) => {
  if (videoImageFormat === "none") {
    return "none";
  }
  if (typeof pixelFormat === "undefined") {
    return "valid";
  }
  if (!validVideoImageFormats.includes(videoImageFormat)) {
    throw new TypeError(`Value ${videoImageFormat} is not valid as an image format.`);
  }
  if (pixelFormat !== "yuva420p" && pixelFormat !== "yuva444p10le") {
    return "valid";
  }
  if (videoImageFormat !== "png") {
    throw new TypeError(`Pixel format was set to '${pixelFormat}' but the image format is not PNG. To render transparent videos, you need to set PNG as the image format.`);
  }
  return "valid";
};
var validateStillImageFormat = (imageFormat) => {
  if (!validStillImageFormats.includes(imageFormat)) {
    throw new TypeError(String(`Image format should be one of: ${validStillImageFormats.map((v) => `"${v}"`).join(", ")}`));
  }
};

// src/jpeg-quality.ts
var DEFAULT_JPEG_QUALITY = 80;
var validateJpegQuality = (q) => {
  if (typeof q !== "undefined" && typeof q !== "number") {
    throw new Error(`JPEG Quality option must be a number or undefined. Got ${typeof q} (${JSON.stringify(q)})`);
  }
  if (typeof q === "undefined") {
    return;
  }
  if (!Number.isFinite(q)) {
    throw new RangeError(`JPEG Quality must be a finite number, but is ${q}`);
  }
  if (Number.isNaN(q)) {
    throw new RangeError(`JPEG Quality is NaN, but must be a real number`);
  }
  if (q > 100 || q < 0) {
    throw new RangeError("JPEG Quality option must be between 0 and 100.");
  }
};

// src/perf.ts
var exports_perf = {};
__export(exports_perf, {
  stopPerfMeasure: () => stopPerfMeasure,
  startPerfMeasure: () => startPerfMeasure,
  getPerf: () => getPerf
});
var perf = {
  capture: [],
  "extract-frame": [],
  piping: []
};
var map2 = {};
var startPerfMeasure = (marker) => {
  const id = Math.random();
  map2[id] = {
    id,
    marker,
    start: Date.now()
  };
  return id;
};
var stopPerfMeasure = (id) => {
  const now = Date.now();
  const diff = now - map2[id].start;
  perf[map2[id].marker].push(diff);
  delete map2[id];
};
var getPerf = () => {
  return [
    "Render performance:",
    ...Object.keys(perf).filter((p) => perf[p].length).map((p) => {
      return `  ${p} => ${Math.round(perf[p].reduce((a, b) => a + b, 0) / perf[p].length)}ms (n = ${perf[p].length})`;
    })
  ];
};

// src/pixel-format.ts
var validPixelFormats = [
  "yuv420p",
  "yuva420p",
  "yuv422p",
  "yuv444p",
  "yuv420p10le",
  "yuv422p10le",
  "yuv444p10le",
  "yuva444p10le"
];
var DEFAULT_PIXEL_FORMAT = "yuv420p";
var validPixelFormatsForCodec = (codec) => {
  if (codec === "vp8" || codec === "vp9") {
    return validPixelFormats;
  }
  return validPixelFormats.filter((format2) => format2 !== "yuva420p");
};
var validateSelectedPixelFormatAndCodecCombination = (pixelFormat, codec) => {
  if (typeof pixelFormat === "undefined") {
    return pixelFormat;
  }
  if (!validPixelFormats.includes(pixelFormat)) {
    throw new TypeError(`Value ${pixelFormat} is not valid as a pixel format.`);
  }
  if (pixelFormat !== "yuva420p") {
    return;
  }
  const validFormats = validPixelFormatsForCodec(codec);
  if (!validFormats.includes(pixelFormat)) {
    throw new TypeError(`Pixel format was set to 'yuva420p' but codec ${codec} does not support it. Valid pixel formats for codec ${codec} are: ${validFormats.join(", ")}.`);
  }
};

// src/render-frames.ts
import fs15 from "node:fs";
import path21 from "node:path";
import { NoReactInternals as NoReactInternals12 } from "remotion/no-react";

// src/cycle-browser-tabs.ts
var cycleBrowserTabs = ({
  puppeteerInstance,
  concurrency,
  logLevel,
  indent
}) => {
  if (concurrency <= 1) {
    return {
      stopCycling: () => {
        return;
      }
    };
  }
  let interval = null;
  let i = 0;
  let stopped = false;
  const set = () => {
    interval = setTimeout(() => {
      puppeteerInstance.getBrowser().pages().then((pages) => {
        if (pages.length === 0) {
          return;
        }
        const currentPage = pages[i % pages.length];
        i++;
        if (!currentPage?.closed && !stopped && currentPage?.url() !== "about:blank") {
          return currentPage.bringToFront();
        }
      }).catch((err) => Log.error({ indent, logLevel }, err)).finally(() => {
        if (!stopped) {
          set();
        }
      });
    }, 200);
  };
  set();
  return {
    stopCycling: () => {
      if (!interval) {
        return;
      }
      stopped = true;
      return clearTimeout(interval);
    }
  };
};

// src/combine-audio.ts
import { rmSync as rmSync3, writeFileSync as writeFileSync2 } from "fs";
import { join as join3 } from "path";
import { VERSION as VERSION4 } from "remotion/version";

// src/options/separate-audio.tsx
var DEFAULT = null;
var cliFlag = "separate-audio-to";
var separateAudioOption = {
  cliFlag,
  description: () => `If set, the audio will not be included in the main output but rendered as a separate file at the location you pass. It is recommended to use an absolute path. If a relative path is passed, it is relative to the Remotion Root.`,
  docLink: "https://remotion.dev/docs/renderer/render-media",
  getValue: ({ commandLine }) => {
    if (commandLine[cliFlag]) {
      return {
        source: "cli",
        value: commandLine[cliFlag]
      };
    }
    return {
      source: "default",
      value: DEFAULT
    };
  },
  name: "Separate audio to",
  setConfig: () => {
    throw new Error("Not implemented");
  },
  ssrName: "separateAudioTo",
  type: "string",
  id: cliFlag
};

// src/options/audio-codec.tsx
var validAudioCodecs = ["pcm-16", "aac", "mp3", "opus"];
var supportedAudioCodecs = {
  h264: ["aac", "pcm-16", "mp3"],
  "h264-mkv": ["pcm-16", "mp3"],
  "h264-ts": ["pcm-16", "aac"],
  aac: ["aac", "pcm-16"],
  avi: [],
  gif: [],
  h265: ["aac", "pcm-16"],
  mp3: ["mp3", "pcm-16"],
  prores: ["aac", "pcm-16"],
  vp8: ["opus", "pcm-16"],
  vp9: ["opus", "pcm-16"],
  wav: ["pcm-16"]
};
var _satisfies = supportedAudioCodecs;
if (_satisfies) {}
var mapAudioCodecToFfmpegAudioCodecName = (audioCodec) => {
  if (audioCodec === "aac") {
    return "libfdk_aac";
  }
  if (audioCodec === "mp3") {
    return "libmp3lame";
  }
  if (audioCodec === "opus") {
    return "libopus";
  }
  if (audioCodec === "pcm-16") {
    return "pcm_s16le";
  }
  throw new Error("unknown audio codec: " + audioCodec);
};
var cliFlag2 = "audio-codec";
var ssrName = "audioCodec";
var defaultAudioCodecs = {
  "h264-mkv": {
    lossless: "pcm-16",
    compressed: "pcm-16"
  },
  "h264-ts": {
    lossless: "pcm-16",
    compressed: "aac"
  },
  aac: {
    lossless: "pcm-16",
    compressed: "aac"
  },
  gif: {
    lossless: null,
    compressed: null
  },
  h264: {
    lossless: "pcm-16",
    compressed: "aac"
  },
  h265: {
    lossless: "pcm-16",
    compressed: "aac"
  },
  mp3: {
    lossless: "pcm-16",
    compressed: "mp3"
  },
  prores: {
    lossless: "pcm-16",
    compressed: "pcm-16"
  },
  vp8: {
    lossless: "pcm-16",
    compressed: "opus"
  },
  vp9: {
    lossless: "pcm-16",
    compressed: "opus"
  },
  wav: {
    lossless: "pcm-16",
    compressed: "pcm-16"
  }
};
var extensionMap = {
  aac: "aac",
  mp3: "mp3",
  opus: "opus",
  "pcm-16": "wav"
};
var getExtensionFromAudioCodec = (audioCodec) => {
  if (extensionMap[audioCodec]) {
    return extensionMap[audioCodec];
  }
  throw new Error(`Unsupported audio codec: ${audioCodec}`);
};
var resolveAudioCodec = ({
  codec,
  setting,
  preferLossless,
  separateAudioTo
}) => {
  let derivedFromSeparateAudioToExtension = null;
  if (separateAudioTo) {
    const extension = separateAudioTo.split(".").pop();
    for (const [key, value] of Object.entries(extensionMap)) {
      if (value === extension) {
        derivedFromSeparateAudioToExtension = key;
        if (!supportedAudioCodecs[codec].includes(derivedFromSeparateAudioToExtension) && derivedFromSeparateAudioToExtension) {
          throw new Error(`The codec is ${codec} but the audio codec derived from --${separateAudioOption.cliFlag} is ${derivedFromSeparateAudioToExtension}. The only supported codecs are: ${supportedAudioCodecs[codec].join(", ")}`);
        }
      }
    }
  }
  if (preferLossless) {
    const selected = getDefaultAudioCodec({ codec, preferLossless });
    if (derivedFromSeparateAudioToExtension && selected !== derivedFromSeparateAudioToExtension) {
      throw new Error(`The audio codec derived from --${separateAudioOption.cliFlag} is ${derivedFromSeparateAudioToExtension}, but does not match the audio codec derived from the "Prefer lossless" option (${selected}). Remove any conflicting options.`);
    }
    return selected;
  }
  if (setting === null) {
    if (derivedFromSeparateAudioToExtension) {
      return derivedFromSeparateAudioToExtension;
    }
    return getDefaultAudioCodec({ codec, preferLossless });
  }
  if (derivedFromSeparateAudioToExtension !== setting && derivedFromSeparateAudioToExtension) {
    throw new Error(`The audio codec derived from --${separateAudioOption.cliFlag} is ${derivedFromSeparateAudioToExtension}, but does not match the audio codec derived from your ${audioCodecOption.name} setting (${setting}). Remove any conflicting options.`);
  }
  return setting;
};
var getDefaultAudioCodec = ({
  codec,
  preferLossless
}) => {
  return defaultAudioCodecs[codec][preferLossless ? "lossless" : "compressed"];
};
var _audioCodec = null;
var audioCodecOption = {
  cliFlag: cliFlag2,
  setConfig: (audioCodec) => {
    if (audioCodec === null) {
      _audioCodec = null;
      return;
    }
    if (!validAudioCodecs.includes(audioCodec)) {
      throw new Error(`Audio codec must be one of the following: ${validAudioCodecs.join(", ")}, but got ${audioCodec}`);
    }
    _audioCodec = audioCodec;
  },
  getValue: ({ commandLine }) => {
    if (commandLine[cliFlag2]) {
      const codec = commandLine[cliFlag2];
      if (!validAudioCodecs.includes(commandLine[cliFlag2])) {
        throw new Error(`Audio codec must be one of the following: ${validAudioCodecs.join(", ")}, but got ${codec}`);
      }
      return {
        source: "cli",
        value: commandLine[cliFlag2]
      };
    }
    if (_audioCodec !== null) {
      return {
        source: "config",
        value: _audioCodec
      };
    }
    return {
      source: "default",
      value: null
    };
  },
  description: () => `Set the format of the audio that is embedded in the video. Not all codec and audio codec combinations are supported and certain combinations require a certain file extension and container format. See the table in the docs to see possible combinations.`,
  docLink: "https://www.remotion.dev/docs/encoding/#audio-codec",
  name: "Audio Codec",
  ssrName,
  type: "aac",
  id: cliFlag2
};

// src/parse-ffmpeg-progress.ts
var parseFfmpegProgress = (input, fps) => {
  const match = input.match(/frame=(\s+)?([0-9]+)\s/);
  if (match) {
    return Number(match[2]);
  }
  const match2 = input.match(/time=(\d+):(\d+):(\d+).(\d+)\s/);
  if (match2) {
    const [, hours, minutes, seconds, hundreds] = match2;
    return Number(hundreds) / 100 * fps + Number(seconds) * fps + Number(minutes) * fps * 60 + Number(hours) * fps * 60 * 60;
  }
};

// src/combine-audio.ts
var durationOf1Frame = 1024 / DEFAULT_SAMPLE_RATE * 1e6;
var roundWithFix = (targetTime) => {
  if (targetTime % 1 > 0.4999999) {
    return Math.ceil(targetTime);
  }
  return Math.floor(targetTime);
};
var getClosestAlignedTime = (targetTime) => {
  const decimalFramesToTargetTime = targetTime * 1e6 / durationOf1Frame;
  const nearestFrameIndexForTargetTime = roundWithFix(decimalFramesToTargetTime);
  return nearestFrameIndexForTargetTime * durationOf1Frame / 1e6;
};
var encodeAudio = async ({
  files,
  resolvedAudioCodec,
  audioBitrate,
  filelistDir,
  output,
  indent,
  logLevel,
  addRemotionMetadata,
  fps,
  binariesDirectory,
  cancelSignal,
  onProgress
}) => {
  const fileList = files.map((p) => `file '${p}'`).join(`
`);
  const fileListTxt = join3(filelistDir, "audio-files.txt");
  writeFileSync2(fileListTxt, fileList);
  const startCombining = Date.now();
  const command = [
    "-hide_banner",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    fileListTxt,
    "-c:a",
    mapAudioCodecToFfmpegAudioCodecName(resolvedAudioCodec),
    resolvedAudioCodec === "aac" ? "-cutoff" : null,
    resolvedAudioCodec === "aac" ? "18000" : null,
    "-b:a",
    audioBitrate ? audioBitrate : "320k",
    "-vn",
    addRemotionMetadata ? `-metadata` : null,
    addRemotionMetadata ? `comment=Made with Remotion ${VERSION4}` : null,
    "-y",
    output
  ];
  Log.verbose({ indent, logLevel }, `Combining audio with re-encoding, command: ${command.join(" ")}`);
  try {
    const task = callFf({
      args: command,
      bin: "ffmpeg",
      indent,
      logLevel,
      binariesDirectory,
      cancelSignal
    });
    task.stderr?.on("data", (data) => {
      const utf8 = data.toString("utf8");
      const parsed = parseFfmpegProgress(utf8, fps);
      if (parsed === undefined) {
        Log.verbose({ indent, logLevel }, utf8);
      } else {
        onProgress(parsed);
        Log.verbose({ indent, logLevel }, `Encoded ${parsed} audio frames`);
      }
    });
    await task;
    Log.verbose({ indent, logLevel }, `Encoded audio in ${Date.now() - startCombining}ms`);
    return output;
  } catch (e) {
    rmSync3(fileListTxt, { recursive: true });
    throw e;
  }
};
var combineAudioSeamlessly = async ({
  files,
  filelistDir,
  indent,
  logLevel,
  output,
  chunkDurationInSeconds,
  addRemotionMetadata,
  fps,
  binariesDirectory,
  cancelSignal,
  onProgress
}) => {
  const startConcatenating = Date.now();
  const fileList = files.map((p, i) => {
    const isLast = i === files.length - 1;
    const targetStart = i * chunkDurationInSeconds;
    const endStart = (i + 1) * chunkDurationInSeconds;
    const startTime = getClosestAlignedTime(targetStart) * 1e6;
    const endTime = getClosestAlignedTime(endStart) * 1e6;
    const realDuration = endTime - startTime;
    let inpoint = 0;
    if (i > 0) {
      inpoint = durationOf1Frame * 4;
    }
    const outpoint = (i === 0 ? durationOf1Frame * 2 : inpoint) + realDuration - (isLast ? 0 : durationOf1Frame);
    return [`file '${p}'`, `inpoint ${inpoint}us`, `outpoint ${outpoint}us`].filter(truthy).join(`
`);
  }).join(`
`);
  const fileListTxt = join3(filelistDir, "audio-files.txt");
  writeFileSync2(fileListTxt, fileList);
  const command = [
    "-hide_banner",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    fileListTxt,
    "-c:a",
    "copy",
    "-vn",
    addRemotionMetadata ? `-metadata` : null,
    addRemotionMetadata ? `comment=Made with Remotion ${VERSION4}` : null,
    "-y",
    output
  ];
  Log.verbose({ indent, logLevel }, `Combining AAC audio seamlessly, command: ${command.join(" ")}`);
  try {
    const task = callFf({
      args: command,
      bin: "ffmpeg",
      indent,
      logLevel,
      binariesDirectory,
      cancelSignal
    });
    task.stderr?.on("data", (data) => {
      const utf8 = data.toString("utf8");
      const parsed = parseFfmpegProgress(utf8, fps);
      if (parsed !== undefined) {
        onProgress(parsed);
        Log.verbose({ indent, logLevel }, `Encoded ${parsed} audio frames`);
      }
    });
    await task;
    Log.verbose({ indent, logLevel }, `Combined audio seamlessly in ${Date.now() - startConcatenating}ms`);
    return output;
  } catch (e) {
    rmSync3(fileListTxt, { recursive: true });
    Log.error({ indent, logLevel }, e);
    throw e;
  }
};
var createCombinedAudio = ({
  seamless,
  filelistDir,
  files,
  indent,
  logLevel,
  audioBitrate,
  resolvedAudioCodec,
  output,
  chunkDurationInSeconds,
  addRemotionMetadata,
  binariesDirectory,
  fps,
  cancelSignal,
  onProgress
}) => {
  if (seamless) {
    return combineAudioSeamlessly({
      filelistDir,
      files,
      indent,
      logLevel,
      output,
      chunkDurationInSeconds,
      addRemotionMetadata,
      binariesDirectory,
      fps,
      cancelSignal,
      onProgress
    });
  }
  return encodeAudio({
    filelistDir,
    files,
    resolvedAudioCodec,
    audioBitrate,
    output,
    indent,
    logLevel,
    addRemotionMetadata,
    binariesDirectory,
    fps,
    cancelSignal,
    onProgress
  });
};

// src/get-extra-frames-to-capture.ts
var getExtraFramesToCapture = ({
  compositionStart,
  realFrameRange,
  fps,
  forSeamlessAacConcatenation
}) => {
  if (!forSeamlessAacConcatenation) {
    return {
      extraFramesToCaptureAssetsBackend: [],
      extraFramesToCaptureAssetsFrontend: [],
      chunkLengthInSeconds: (realFrameRange[1] - realFrameRange[0] + 1) / fps,
      trimLeftOffset: 0,
      trimRightOffset: 0
    };
  }
  const chunkStart = realFrameRange[0];
  if (chunkStart < compositionStart) {
    throw new Error("chunkStart may not be below compositionStart");
  }
  const realLeftEnd = chunkStart - compositionStart;
  if (realLeftEnd < 0) {
    throw new Error("chunkStat - compositionStart may not be below 0");
  }
  const realRightEnd = realLeftEnd + (realFrameRange[1] - realFrameRange[0] + 1);
  const aacAdjustedLeftEnd = Math.max(0, getClosestAlignedTime(realLeftEnd / fps) - 2 * (1024 / DEFAULT_SAMPLE_RATE));
  const aacAdjustedRightEnd = getClosestAlignedTime(realRightEnd / fps) + 2 * (1024 / DEFAULT_SAMPLE_RATE);
  const alignedStartFrameWithoutOffset = Math.floor(aacAdjustedLeftEnd * fps);
  const alignedStartFrame = alignedStartFrameWithoutOffset + compositionStart;
  const alignedEndFrame = Math.ceil(aacAdjustedRightEnd * fps) + compositionStart;
  const extraFramesToCaptureAudioOnlyFrontend = new Array(realFrameRange[0] - alignedStartFrame).fill(true).map((_, f) => f + alignedStartFrame);
  const extraFramesToCaptureAudioOnlyBackend = new Array(alignedEndFrame - realFrameRange[1] - 1).fill(true).map((_, f) => f + realFrameRange[1] + 1);
  const trimLeftOffset = (aacAdjustedLeftEnd * fps - alignedStartFrameWithoutOffset) / fps;
  const trimRightOffset = (aacAdjustedRightEnd * fps - Math.ceil(aacAdjustedRightEnd * fps)) / fps;
  const chunkLengthInSeconds = aacAdjustedRightEnd - aacAdjustedLeftEnd;
  return {
    extraFramesToCaptureAssetsFrontend: extraFramesToCaptureAudioOnlyFrontend,
    extraFramesToCaptureAssetsBackend: extraFramesToCaptureAudioOnlyBackend,
    chunkLengthInSeconds,
    trimLeftOffset,
    trimRightOffset
  };
};

// src/get-frame-padded-index.ts
var getFrameOutputFileNameFromPattern = ({
  pattern,
  frame,
  ext
}) => {
  return pattern.replace(/\[frame\]/g, frame).replace(/\[ext\]/g, ext);
};
var getFrameOutputFileName = ({
  index,
  frame,
  imageFormat,
  countType,
  lastFrame,
  totalFrames,
  imageSequencePattern
}) => {
  const filePadLength = getFilePadLength({ lastFrame, countType, totalFrames });
  const frameStr = countType === "actual-frames" ? String(frame).padStart(filePadLength, "0") : String(index).padStart(filePadLength, "0");
  if (imageSequencePattern) {
    return getFrameOutputFileNameFromPattern({
      pattern: imageSequencePattern,
      frame: frameStr,
      ext: imageFormat
    });
  }
  const prefix = "element";
  if (countType === "actual-frames") {
    return `${prefix}-${frameStr}.${imageFormat}`;
  }
  if (countType === "from-zero") {
    return `${prefix}-${frameStr}.${imageFormat}`;
  }
  throw new TypeError("Unknown count type");
};
var getFilePadLength = ({
  lastFrame,
  totalFrames,
  countType
}) => {
  if (countType === "actual-frames") {
    return String(lastFrame).length;
  }
  if (countType === "from-zero") {
    return String(totalFrames - 1).length;
  }
  throw new Error("Unknown file type");
};

// src/make-cancel-signal.ts
var makeCancelSignal = () => {
  const callbacks = [];
  let cancelled = false;
  return {
    cancelSignal: (callback) => {
      callbacks.push(callback);
      if (cancelled) {
        callback();
      }
    },
    cancel: () => {
      if (cancelled) {
        return;
      }
      callbacks.forEach((cb) => {
        cb();
      });
      cancelled = true;
    }
  };
};
var cancelErrorMessages = {
  renderMedia: "renderMedia() got cancelled",
  renderFrames: "renderFrames() got cancelled",
  renderStill: "renderStill() got cancelled",
  stitchFramesToVideo: "stitchFramesToVideo() got cancelled"
};
var isUserCancelledRender = (err) => {
  if (typeof err === "object" && err !== null && "message" in err && typeof err.message === "string") {
    return err.message.includes(cancelErrorMessages.renderMedia) || err.message.includes(cancelErrorMessages.renderFrames) || err.message.includes(cancelErrorMessages.renderStill) || err.message.includes(cancelErrorMessages.stitchFramesToVideo);
  }
  return false;
};

// src/make-page.ts
var makePage = async ({
  context,
  initialFrame,
  browserReplacer,
  logLevel,
  indent,
  pagesArray,
  onBrowserLog,
  scale,
  timeoutInMilliseconds,
  composition,
  proxyPort,
  serveUrl,
  muted,
  envVariables,
  serializedInputPropsWithCustomSchema,
  imageFormat,
  serializedResolvedPropsWithCustomSchema,
  pageIndex,
  isMainTab,
  mediaCacheSizeInBytes,
  onLog,
  darkMode
}) => {
  const page = await browserReplacer.getBrowser().newPage({ context, logLevel, indent, pageIndex, onBrowserLog, onLog });
  pagesArray.push(page);
  await page.setViewport({
    width: composition.width,
    height: composition.height,
    deviceScaleFactor: scale
  });
  await setPropsAndEnv({
    serializedInputPropsWithCustomSchema,
    envVariables,
    page,
    serveUrl,
    initialFrame,
    timeoutInMilliseconds,
    proxyPort,
    retriesRemaining: 2,
    audioEnabled: !muted,
    videoEnabled: imageFormat !== "none",
    indent,
    logLevel,
    onServeUrlVisited: () => {
      return;
    },
    isMainTab,
    mediaCacheSizeInBytes,
    initialMemoryAvailable: getAvailableMemory(logLevel),
    darkMode
  });
  await puppeteerEvaluateWithCatch({
    pageFunction: (id, props, durationInFrames, fps, height, width, defaultCodec, defaultOutName, defaultVideoImageFormat, defaultPixelFormat, defaultProResProfile) => {
      window.remotion_setBundleMode({
        type: "composition",
        compositionName: id,
        serializedResolvedPropsWithSchema: props,
        compositionDurationInFrames: durationInFrames,
        compositionFps: fps,
        compositionHeight: height,
        compositionWidth: width,
        compositionDefaultCodec: defaultCodec,
        compositionDefaultOutName: defaultOutName,
        compositionDefaultVideoImageFormat: defaultVideoImageFormat,
        compositionDefaultPixelFormat: defaultPixelFormat,
        compositionDefaultProResProfile: defaultProResProfile
      });
    },
    args: [
      composition.id,
      serializedResolvedPropsWithCustomSchema,
      composition.durationInFrames,
      composition.fps,
      composition.height,
      composition.width,
      composition.defaultCodec,
      composition.defaultOutName,
      composition.defaultVideoImageFormat,
      composition.defaultPixelFormat,
      composition.defaultProResProfile
    ],
    frame: null,
    page,
    timeoutInMilliseconds
  });
  return page;
};

// src/render-partitions.ts
var renderPartitions = ({
  frames,
  concurrency
}) => {
  const partitions = [];
  let start = 0;
  for (let i = 0;i < concurrency; i++) {
    const end = start + Math.ceil((frames.length - start) / (concurrency - i));
    partitions.push(frames.slice(start, end));
    start = end;
  }
  return {
    partitions,
    getNextFrame: (pageIndex) => {
      if (partitions[pageIndex].length === 0) {
        const partitionLengths = partitions.map((p) => p.length);
        if (partitionLengths.every((p) => p === 0)) {
          throw new Error("No more frames to render");
        }
        let longestRemainingPartitionIndex = -1;
        for (let i = 0;i < partitions.length; i++) {
          if (longestRemainingPartitionIndex === -1) {
            longestRemainingPartitionIndex = i;
            continue;
          }
          if (partitions[i].length > partitions[longestRemainingPartitionIndex].length) {
            longestRemainingPartitionIndex = i;
          }
        }
        if (longestRemainingPartitionIndex === -1) {
          throw new Error("No more frames to render");
        }
        const slicePoint = Math.ceil(partitions[longestRemainingPartitionIndex].length / 2) - 1;
        partitions[pageIndex] = partitions[longestRemainingPartitionIndex].slice(slicePoint);
        partitions[longestRemainingPartitionIndex] = partitions[longestRemainingPartitionIndex].slice(0, slicePoint);
      }
      const value = partitions[pageIndex].shift();
      if (value === undefined) {
        throw new Error("No more frames to render");
      }
      return value;
    }
  };
};

// src/next-frame-to-render.ts
var nextFrameToRenderState = ({
  allFramesAndExtraFrames,
  concurrencyOrFramesToRender: _concurrency
}) => {
  const rendered = new Map;
  return {
    getNextFrame: (_pageIndex) => {
      const nextFrame = allFramesAndExtraFrames.find((frame) => {
        return !rendered.has(frame);
      });
      if (nextFrame === undefined) {
        throw new Error("No more frames to render");
      }
      rendered.set(nextFrame, true);
      return nextFrame;
    },
    returnFrame: (frame) => {
      rendered.delete(frame);
    }
  };
};
var partitionedNextFrameToRenderState = ({
  allFramesAndExtraFrames,
  concurrencyOrFramesToRender: concurrency
}) => {
  const partitions = renderPartitions({
    frames: allFramesAndExtraFrames,
    concurrency
  });
  return {
    getNextFrame: (pageIndex) => {
      return partitions.getNextFrame(pageIndex);
    },
    returnFrame: () => {
      throw new Error("retrying failed frames for partitioned rendering is not supported. Disable partitioned rendering.");
    }
  };
};

// src/pool.ts
class Pool {
  resources;
  waiters;
  constructor(resources) {
    this.resources = resources;
    this.waiters = [];
  }
  acquire() {
    const resource = this.resources.shift();
    if (resource !== undefined) {
      return Promise.resolve(resource);
    }
    return new Promise((resolve2) => {
      this.waiters.push((freeResource) => {
        resolve2(freeResource);
      });
    });
  }
  release(resource) {
    const waiter = this.waiters.shift();
    if (waiter === undefined) {
      this.resources.push(resource);
    } else {
      waiter(resource);
    }
  }
}

// src/render-frame-and-retry-target-close.ts
import { NoReactInternals as NoReactInternals10 } from "remotion/no-react";

// src/is-delay-render-error-with-retry.ts
import { NoReactInternals as NoReactInternals9 } from "remotion/no-react";
var getRetriesLeftFromError = (error) => {
  if (!error) {
    throw new Error("Expected stack");
  }
  const { stack } = error;
  if (!stack) {
    throw new Error("Expected stack: " + JSON.stringify(error));
  }
  const beforeIndex = stack.indexOf(NoReactInternals9.DELAY_RENDER_ATTEMPT_TOKEN);
  if (beforeIndex === -1) {
    throw new Error("Expected to find attempt token in stack");
  }
  const afterIndex = stack.indexOf(NoReactInternals9.DELAY_RENDER_RETRY_TOKEN);
  if (afterIndex === -1) {
    throw new Error("Expected to find retry token in stack");
  }
  const inbetween = stack.substring(beforeIndex + NoReactInternals9.DELAY_RENDER_ATTEMPT_TOKEN.length, afterIndex);
  const parsed = Number(inbetween);
  if (Number.isNaN(parsed)) {
    throw new Error(`Expected to find a number in the stack ${stack}`);
  }
  return parsed;
};

// src/render-frame-with-option-to-reject.ts
import path20 from "path";

// src/collect-assets.ts
var collectAssets = async ({
  frame,
  freePage,
  timeoutInMilliseconds
}) => {
  const { value } = await puppeteerEvaluateWithCatch({
    pageFunction: () => {
      return window.remotion_collectAssets();
    },
    args: [],
    frame,
    page: freePage,
    timeoutInMilliseconds
  });
  const fixedArtifacts = value.map((asset) => {
    if (asset.type !== "artifact") {
      return asset;
    }
    if (asset.contentType === "binary" || asset.contentType === "text") {
      if (typeof asset.content !== "string") {
        throw new Error(`Expected string content for artifact ${asset.id}, but got ${asset.content}`);
      }
      const stringOrUintArray = asset.contentType === "binary" ? new TextEncoder().encode(atob(asset.content)) : asset.content;
      return {
        ...asset,
        content: stringOrUintArray
      };
    }
    if (asset.contentType === "thumbnail") {
      return asset;
    }
    return asset;
  });
  return fixedArtifacts;
};

// src/filter-asset-types.ts
var onlyAudioAndVideoAssets = (assets) => {
  return assets.filter((asset) => asset.type === "audio" || asset.type === "video");
};
var onlyArtifact = ({
  assets,
  frameBuffer
}) => {
  const artifacts = assets.filter((asset) => asset.type === "artifact");
  return artifacts.map((artifact) => {
    if (artifact.contentType === "binary" || artifact.contentType === "text") {
      return {
        frame: artifact.frame,
        content: artifact.content,
        filename: artifact.filename,
        downloadBehavior: artifact.downloadBehavior
      };
    }
    if (artifact.contentType === "thumbnail") {
      if (frameBuffer === null) {
        return null;
      }
      return {
        frame: artifact.frame,
        content: new Uint8Array(frameBuffer),
        filename: artifact.filename,
        downloadBehavior: artifact.downloadBehavior
      };
    }
    throw new Error("Unknown artifact type: " + artifact);
  }).filter(truthy);
};
var onlyInlineAudio = (assets) => {
  return assets.filter((asset) => asset.type === "inline-audio");
};

// src/puppeteer-screenshot.ts
import * as assert2 from "node:assert";

// src/screenshot-task.ts
import fs14 from "node:fs";
var screenshotTask = async ({
  format: format2,
  height,
  omitBackground,
  page,
  width,
  path: path20,
  jpegQuality,
  scale
}) => {
  const client = page._client();
  const target = page.target();
  await client.send("Target.activateTarget", {
    targetId: target._targetId
  });
  if (omitBackground) {
    await client.send("Emulation.setDefaultBackgroundColorOverride", {
      color: { r: 0, g: 0, b: 0, a: 0 }
    });
  }
  const cap = startPerfMeasure("capture");
  try {
    let result;
    if (format2 === "pdf") {
      const res = await client.send("Page.printToPDF", {
        paperWidth: width / 96,
        paperHeight: height / 96,
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 0,
        marginRight: 0,
        scale: 1,
        printBackground: true
      });
      result = res.value;
    } else {
      const fromSurface = !process.env.DISABLE_FROM_SURFACE || height > 8192 || width > 8192;
      const scaleFactor = fromSurface ? 1 : scale;
      const { value } = await client.send("Page.captureScreenshot", {
        format: format2,
        quality: jpegQuality,
        clip: {
          x: 0,
          y: 0,
          height: height * scaleFactor,
          scale: 1,
          width: width * scaleFactor
        },
        captureBeyondViewport: true,
        optimizeForSpeed: true,
        fromSurface
      });
      result = value;
    }
    stopPerfMeasure(cap);
    if (omitBackground) {
      await client.send("Emulation.setDefaultBackgroundColorOverride");
    }
    const buffer = Buffer.from(result.data, "base64");
    if (path20) {
      await fs14.promises.writeFile(path20, buffer);
    }
    return buffer;
  } catch (err) {
    if (err.message.includes("Unable to capture screenshot")) {
      const errMessage = [
        "Could not take a screenshot because Google Chrome ran out of memory or disk space.",
        process?.env?.__RESERVED_IS_INSIDE_REMOTION_LAMBDA ? "Deploy a new Lambda function with more memory or disk space." : "Decrease the concurrency to use less RAM."
      ].join(" ");
      throw new Error(errMessage);
    }
    throw err;
  }
};

// src/puppeteer-screenshot.ts
var screenshot = (options) => {
  if (options.jpegQuality) {
    assert2.ok(typeof options.jpegQuality === "number", "Expected options.quality to be a number but found " + typeof options.jpegQuality);
    assert2.ok(Number.isInteger(options.jpegQuality), "Expected options.quality to be an integer");
    assert2.ok(options.jpegQuality >= 0 && options.jpegQuality <= 100, "Expected options.quality to be between 0 and 100 (inclusive), got " + options.jpegQuality);
  }
  return options.page.screenshotTaskQueue.postTask(() => screenshotTask({
    page: options.page,
    format: options.type,
    height: options.height,
    width: options.width,
    omitBackground: options.omitBackground,
    path: options.path,
    jpegQuality: options.type === "jpeg" ? options.jpegQuality : undefined,
    scale: options.scale
  }));
};

// src/take-frame.ts
var takeFrame = async ({
  freePage,
  imageFormat,
  jpegQuality,
  width,
  height,
  output,
  scale,
  wantsBuffer,
  timeoutInMilliseconds
}) => {
  if (imageFormat === "none") {
    return null;
  }
  if (imageFormat === "png" || imageFormat === "pdf" || imageFormat === "webp") {
    await puppeteerEvaluateWithCatch({
      pageFunction: () => {
        document.body.style.background = "transparent";
      },
      args: [],
      frame: null,
      page: freePage,
      timeoutInMilliseconds
    });
  } else {
    await puppeteerEvaluateWithCatch({
      pageFunction: () => {
        document.body.style.background = "black";
      },
      args: [],
      frame: null,
      page: freePage,
      timeoutInMilliseconds
    });
  }
  const buf = await screenshot({
    page: freePage,
    omitBackground: imageFormat === "png",
    path: (wantsBuffer ? undefined : output) ?? undefined,
    type: imageFormat,
    jpegQuality,
    width,
    height,
    scale
  });
  return buf;
};

// src/render-frame-with-option-to-reject.ts
var renderFrameWithOptionToReject = async ({
  reject,
  width,
  height,
  compId,
  attempt,
  stoppedSignal,
  indent,
  logLevel,
  timeoutInMilliseconds,
  outputDir,
  onFrameBuffer,
  imageFormat,
  onError,
  lastFrame,
  jpegQuality,
  frameDir,
  scale,
  countType,
  assets,
  framesToRender,
  onArtifact,
  onDownload,
  downloadMap,
  binariesDirectory,
  cancelSignal,
  framesRenderedObj,
  onFrameUpdate,
  frame,
  page,
  imageSequencePattern,
  fps,
  trimLeftOffset,
  trimRightOffset,
  allFramesAndExtraFrames
}) => {
  const startTime = performance.now();
  const index = framesToRender.indexOf(frame);
  const assetsOnly = index === -1;
  if (stoppedSignal.stopped) {
    return Promise.reject(new Error("Render was stopped"));
  }
  const errorCallbackOnFrame = (err) => {
    reject(err);
  };
  const cleanupPageError = handleJavascriptException({
    page,
    onError: errorCallbackOnFrame,
    frame
  });
  page.on("error", errorCallbackOnFrame);
  const startSeeking = Date.now();
  await seekToFrame({
    frame,
    page,
    composition: compId,
    timeoutInMilliseconds,
    indent,
    logLevel,
    attempt
  });
  const timeToSeek = Date.now() - startSeeking;
  if (timeToSeek > 1000) {
    Log.verbose({ indent, logLevel }, `Seeking to frame ${frame} took ${timeToSeek}ms`);
  }
  if (!outputDir && !onFrameBuffer && imageFormat !== "none") {
    throw new Error("Called renderFrames() without specifying either `outputDir` or `onFrameBuffer`");
  }
  if (outputDir && onFrameBuffer && imageFormat !== "none") {
    throw new Error("Pass either `outputDir` or `onFrameBuffer` to renderFrames(), not both.");
  }
  const [buffer, collectedAssets] = await Promise.all([
    takeFrame({
      freePage: page,
      height,
      imageFormat: assetsOnly ? "none" : imageFormat,
      output: index === null ? null : path20.join(frameDir, getFrameOutputFileName({
        frame,
        imageFormat,
        index,
        countType,
        lastFrame,
        totalFrames: framesToRender.length,
        imageSequencePattern
      })),
      jpegQuality,
      width,
      scale,
      wantsBuffer: Boolean(onFrameBuffer),
      timeoutInMilliseconds
    }),
    collectAssets({
      frame,
      freePage: page,
      timeoutInMilliseconds
    })
  ]);
  if (onFrameBuffer && !assetsOnly) {
    if (!buffer) {
      throw new Error("unexpected null buffer");
    }
    onFrameBuffer(buffer, frame);
  }
  const onlyAvailableAssets = assets.filter(truthy);
  const previousAudioRenderAssets = onlyAvailableAssets.map((a) => a.audioAndVideoAssets).flat(2);
  const previousArtifactAssets = onlyAvailableAssets.map((a) => a.artifactAssets).flat(2);
  const audioAndVideoAssets = onlyAudioAndVideoAssets(collectedAssets);
  const artifactAssets = onlyArtifact({
    assets: collectedAssets,
    frameBuffer: buffer
  });
  for (const artifact of artifactAssets) {
    for (const previousArtifact of previousArtifactAssets) {
      if (artifact.filename === previousArtifact.filename) {
        return Promise.reject(new Error(`An artifact with output "${artifact.filename}" was already registered at frame ${previousArtifact.frame}, but now registered again at frame ${artifact.frame}. Artifacts must have unique names. https://remotion.dev/docs/artifacts`));
      }
    }
    onArtifact?.(artifact);
  }
  const compressedAssets = audioAndVideoAssets.map((asset) => {
    return compressAsset(previousAudioRenderAssets, asset);
  });
  const inlineAudioAssets = onlyInlineAudio(collectedAssets);
  assets.push({
    audioAndVideoAssets: compressedAssets,
    frame,
    artifactAssets: artifactAssets.map((a) => {
      return {
        frame: a.frame,
        filename: a.filename
      };
    }),
    inlineAudioAssets
  });
  for (const renderAsset of compressedAssets) {
    downloadAndMapAssetsToFileUrl({
      renderAsset,
      onDownload,
      downloadMap,
      indent,
      logLevel,
      binariesDirectory,
      cancelSignalForAudioAnalysis: cancelSignal,
      shouldAnalyzeAudioImmediately: true
    }).catch((err) => {
      const truncateWithEllipsis = renderAsset.src.substring(0, 1000) + (renderAsset.src.length > 1000 ? "..." : "");
      onError(new Error(`Error while downloading ${truncateWithEllipsis}: ${err.stack}`));
    });
  }
  for (const renderAsset of inlineAudioAssets) {
    downloadMap.inlineAudioMixing.addAsset({
      asset: renderAsset,
      fps,
      totalNumberOfFrames: allFramesAndExtraFrames.length,
      firstFrame: allFramesAndExtraFrames[0],
      trimLeftOffset,
      trimRightOffset
    });
  }
  cleanupPageError();
  page.off("error", errorCallbackOnFrame);
  if (!assetsOnly) {
    framesRenderedObj.count++;
    onFrameUpdate?.(framesRenderedObj.count, frame, performance.now() - startTime);
  }
};

// src/render-frame.ts
var renderFrame = ({
  attempt,
  binariesDirectory,
  cancelSignal,
  imageFormat,
  indent,
  logLevel,
  assets,
  countType,
  downloadMap,
  frameDir,
  framesToRender,
  jpegQuality,
  onArtifact,
  onDownload,
  scale,
  composition,
  onError,
  outputDir,
  stoppedSignal,
  timeoutInMilliseconds,
  lastFrame,
  onFrameBuffer,
  onFrameUpdate,
  framesRenderedObj,
  frame,
  page,
  imageSequencePattern,
  trimLeftOffset,
  trimRightOffset,
  allFramesAndExtraFrames
}) => {
  return new Promise((resolve2, reject) => {
    renderFrameWithOptionToReject({
      reject,
      width: composition.width,
      height: composition.height,
      compId: composition.id,
      attempt,
      indent,
      logLevel,
      stoppedSignal,
      timeoutInMilliseconds,
      imageFormat,
      onFrameBuffer,
      outputDir,
      assets,
      binariesDirectory,
      cancelSignal,
      countType,
      downloadMap,
      frameDir,
      framesToRender,
      jpegQuality,
      lastFrame,
      onArtifact,
      onDownload,
      onError,
      scale,
      framesRenderedObj,
      onFrameUpdate,
      frame,
      page,
      imageSequencePattern,
      fps: composition.fps,
      trimLeftOffset,
      trimRightOffset,
      allFramesAndExtraFrames
    }).then(() => {
      resolve2();
    }).catch((err) => {
      reject(err);
    });
  });
};

// src/render-frame-and-retry-target-close.ts
var renderFrameAndRetryTargetClose = async ({
  retriesLeft,
  attempt,
  assets,
  imageFormat,
  binariesDirectory,
  cancelSignal,
  composition,
  countType,
  downloadMap,
  frameDir,
  framesToRender,
  jpegQuality,
  onArtifact,
  onDownload,
  onError,
  outputDir,
  poolPromise,
  scale,
  stoppedSignal,
  timeoutInMilliseconds,
  indent,
  logLevel,
  makeBrowser,
  makeNewPage,
  browserReplacer,
  concurrencyOrFramesToRender,
  framesRenderedObj,
  lastFrame,
  onFrameBuffer,
  onFrameUpdate,
  nextFrameToRender,
  imageSequencePattern,
  trimLeftOffset,
  trimRightOffset,
  allFramesAndExtraFrames
}) => {
  const currentPool = await poolPromise;
  if (stoppedSignal.stopped) {
    return;
  }
  const freePage = await currentPool.acquire();
  const frame = nextFrameToRender.getNextFrame(freePage.pageIndex);
  try {
    await Promise.race([
      renderFrame({
        trimLeftOffset,
        trimRightOffset,
        allFramesAndExtraFrames,
        attempt,
        assets,
        binariesDirectory,
        cancelSignal,
        countType,
        downloadMap,
        frameDir,
        framesToRender,
        imageFormat,
        indent,
        jpegQuality,
        logLevel,
        onArtifact,
        onDownload,
        scale,
        composition,
        framesRenderedObj,
        lastFrame,
        onError,
        onFrameBuffer,
        onFrameUpdate,
        outputDir,
        stoppedSignal,
        timeoutInMilliseconds,
        nextFrameToRender,
        frame,
        page: freePage,
        imageSequencePattern
      }),
      new Promise((_, reject) => {
        cancelSignal?.(() => {
          reject(new Error(cancelErrorMessages.renderFrames));
        });
      })
    ]);
    currentPool.release(freePage);
  } catch (err) {
    const isTargetClosedError = isTargetClosedErr(err);
    const shouldRetryError = err.stack?.includes(NoReactInternals10.DELAY_RENDER_RETRY_TOKEN);
    const flakyNetworkError = isFlakyNetworkError(err);
    if (isUserCancelledRender(err) && !shouldRetryError) {
      throw err;
    }
    if (!isTargetClosedError && !shouldRetryError && !flakyNetworkError) {
      throw err;
    }
    if (stoppedSignal.stopped) {
      return;
    }
    if (retriesLeft === 0) {
      Log.warn({
        indent,
        logLevel
      }, `The browser crashed ${attempt} times while rendering frame ${frame}. Not retrying anymore. Learn more about this error under https://www.remotion.dev/docs/target-closed`);
      throw err;
    }
    if (shouldRetryError) {
      const pool = await poolPromise;
      const newPage = await makeNewPage(frame, freePage.pageIndex);
      pool.release(newPage);
      Log.warn({ indent, logLevel }, `delayRender() timed out while rendering frame ${frame}: ${err.message}`);
      const actualRetriesLeft = getRetriesLeftFromError(err);
      nextFrameToRender.returnFrame(frame);
      return renderFrameAndRetryTargetClose({
        retriesLeft: actualRetriesLeft,
        attempt: attempt + 1,
        assets,
        imageFormat,
        binariesDirectory,
        cancelSignal,
        composition,
        countType,
        downloadMap,
        frameDir,
        framesToRender,
        indent,
        jpegQuality,
        logLevel,
        onArtifact,
        onDownload,
        onError,
        outputDir,
        poolPromise,
        scale,
        stoppedSignal,
        timeoutInMilliseconds,
        makeBrowser,
        makeNewPage,
        browserReplacer,
        concurrencyOrFramesToRender,
        framesRenderedObj,
        lastFrame,
        onFrameBuffer,
        onFrameUpdate,
        nextFrameToRender,
        imageSequencePattern,
        trimLeftOffset,
        trimRightOffset,
        allFramesAndExtraFrames
      });
    }
    Log.warn({ indent, logLevel }, `The browser crashed while rendering frame ${frame}, retrying ${retriesLeft} more times. Learn more about this error under https://www.remotion.dev/docs/target-closed`);
    await browserReplacer.replaceBrowser(makeBrowser, async () => {
      const pages = new Array(concurrencyOrFramesToRender).fill(true).map((_, i) => makeNewPage(frame, i));
      const puppeteerPages = await Promise.all(pages);
      const pool = await poolPromise;
      for (const newPage of puppeteerPages) {
        pool.release(newPage);
      }
    });
    nextFrameToRender.returnFrame(frame);
    await renderFrameAndRetryTargetClose({
      retriesLeft: retriesLeft - 1,
      attempt: attempt + 1,
      assets,
      binariesDirectory,
      cancelSignal,
      composition,
      countType,
      downloadMap,
      frameDir,
      framesToRender,
      imageFormat,
      indent,
      jpegQuality,
      logLevel,
      onArtifact,
      makeBrowser,
      onDownload,
      onError,
      outputDir,
      poolPromise,
      scale,
      stoppedSignal,
      timeoutInMilliseconds,
      browserReplacer,
      makeNewPage,
      concurrencyOrFramesToRender,
      framesRenderedObj,
      lastFrame,
      onFrameBuffer,
      onFrameUpdate,
      nextFrameToRender,
      imageSequencePattern,
      trimLeftOffset,
      trimRightOffset,
      allFramesAndExtraFrames
    });
  }
};

// src/replace-browser.ts
var handleBrowserCrash = (instance, logLevel, indent) => {
  let _instance = instance;
  const waiters = [];
  let replacing = false;
  return {
    getBrowser: () => _instance,
    replaceBrowser: async (make, makeNewPages) => {
      if (replacing) {
        const waiter = new Promise((resolve2, reject) => {
          waiters.push({
            resolve: resolve2,
            reject
          });
        });
        return waiter;
      }
      try {
        replacing = true;
        await _instance.close({ silent: true }).then(() => {
          Log.info({ indent, logLevel }, "Killed previous browser and making new one");
        }).catch(() => {});
        const browser = await make();
        _instance = browser;
        await makeNewPages();
        waiters.forEach((w) => w.resolve(browser));
        Log.info({ indent, logLevel }, "Made new browser");
        return browser;
      } catch (err) {
        waiters.forEach((w) => w.reject(err));
        throw err;
      } finally {
        replacing = false;
      }
    }
  };
};

// src/validate.ts
import { NoReactInternals as NoReactInternals11 } from "remotion/no-react";
var validateFps = NoReactInternals11.validateFps;
var validateDimension = NoReactInternals11.validateDimension;
var validateDurationInFrames = NoReactInternals11.validateDurationInFrames;

// src/validate-scale.ts
var validateScale = (scale) => {
  if (typeof scale === "undefined") {
    return;
  }
  if (typeof scale !== "number") {
    throw new Error('Scale should be a number or undefined, but is "' + JSON.stringify(scale) + '"');
  }
  if (Number.isNaN(scale)) {
    throw new Error("`scale` should not be NaN, but is NaN");
  }
  if (!Number.isFinite(scale)) {
    throw new Error(`"scale" must be finite, but is ${scale}`);
  }
  if (scale <= 0) {
    throw new Error(`"scale" must be bigger than 0, but is ${scale}`);
  }
  if (scale > 16) {
    throw new Error(`"scale" must be smaller or equal than 16, but is ${scale}`);
  }
};

// src/render-frames.ts
var MAX_RETRIES_PER_FRAME = 1;
var innerRenderFrames = async ({
  onFrameUpdate,
  outputDir,
  onStart,
  serializedInputPropsWithCustomSchema,
  serializedResolvedPropsWithCustomSchema,
  jpegQuality,
  imageFormat,
  frameRange,
  onError,
  envVariables,
  onBrowserLog,
  onFrameBuffer,
  onDownload,
  pagesArray,
  serveUrl,
  composition,
  timeoutInMilliseconds,
  scale,
  resolvedConcurrency,
  everyNthFrame,
  proxyPort,
  cancelSignal,
  downloadMap,
  muted,
  makeBrowser,
  browserReplacer,
  sourceMapGetter,
  logLevel,
  indent,
  parallelEncodingEnabled,
  compositionStart,
  forSeamlessAacConcatenation,
  onArtifact,
  binariesDirectory,
  imageSequencePattern,
  mediaCacheSizeInBytes,
  onLog,
  darkMode
}) => {
  if (outputDir) {
    if (!fs15.existsSync(outputDir)) {
      fs15.mkdirSync(outputDir, {
        recursive: true
      });
    }
  }
  const downloadPromises = [];
  const realFrameRange = getRealFrameRange(composition.durationInFrames, frameRange);
  const {
    extraFramesToCaptureAssetsBackend,
    extraFramesToCaptureAssetsFrontend,
    chunkLengthInSeconds,
    trimLeftOffset,
    trimRightOffset
  } = getExtraFramesToCapture({
    fps: composition.fps,
    compositionStart,
    realFrameRange,
    forSeamlessAacConcatenation
  });
  const framesToRender = getFramesToRender(realFrameRange, everyNthFrame);
  const lastFrame = framesToRender[framesToRender.length - 1];
  const concurrencyOrFramesToRender = Math.min(framesToRender.length, resolvedConcurrency);
  const makeNewPage = (frame, pageIndex) => {
    return makePage({
      context: sourceMapGetter,
      initialFrame: frame,
      browserReplacer,
      indent,
      logLevel,
      onBrowserLog,
      pagesArray,
      scale,
      composition,
      envVariables,
      imageFormat,
      muted,
      proxyPort,
      serializedInputPropsWithCustomSchema,
      serializedResolvedPropsWithCustomSchema,
      serveUrl,
      timeoutInMilliseconds,
      pageIndex,
      isMainTab: pageIndex === 0,
      mediaCacheSizeInBytes,
      onLog,
      darkMode
    });
  };
  const getPool = async () => {
    const pages = new Array(concurrencyOrFramesToRender).fill(true).map((_, i) => makeNewPage(framesToRender[i], i));
    const puppeteerPages = await Promise.all(pages);
    const pool = new Pool(puppeteerPages);
    return pool;
  };
  const countType = everyNthFrame === 1 ? "actual-frames" : "from-zero";
  const filePadLength = getFilePadLength({
    lastFrame,
    totalFrames: framesToRender.length,
    countType
  });
  const framesRenderedObj = {
    count: 0
  };
  const poolPromise = getPool();
  onStart?.({
    frameCount: framesToRender.length,
    parallelEncoding: parallelEncodingEnabled,
    resolvedConcurrency
  });
  const assets = [];
  const stoppedSignal = { stopped: false };
  cancelSignal?.(() => {
    stoppedSignal.stopped = true;
  });
  const frameDir = outputDir ?? downloadMap.compositingDir;
  const allFramesAndExtraFrames = [
    ...extraFramesToCaptureAssetsFrontend,
    ...framesToRender,
    ...extraFramesToCaptureAssetsBackend
  ];
  const shouldUsePartitionedRendering = getShouldUsePartitionedRendering();
  if (shouldUsePartitionedRendering) {
    Log.info({ indent, logLevel }, "Experimental: Using partitioned rendering (https://github.com/remotion-dev/remotion/pull/4830)");
  }
  const nextFrameToRender = shouldUsePartitionedRendering ? partitionedNextFrameToRenderState({
    allFramesAndExtraFrames,
    concurrencyOrFramesToRender
  }) : nextFrameToRenderState({
    allFramesAndExtraFrames,
    concurrencyOrFramesToRender
  });
  const pattern = imageSequencePattern || `element-[frame].[ext]`;
  const imageSequenceName = pattern.replace(/\[frame\]/g, `%0${filePadLength}d`).replace(/\[ext\]/g, imageFormat);
  await Promise.all(allFramesAndExtraFrames.map(() => {
    return renderFrameAndRetryTargetClose({
      retriesLeft: MAX_RETRIES_PER_FRAME,
      attempt: 1,
      assets,
      binariesDirectory,
      cancelSignal,
      composition,
      countType,
      downloadMap,
      frameDir,
      framesToRender,
      imageFormat,
      indent,
      jpegQuality,
      logLevel,
      onArtifact,
      onDownload,
      onError,
      outputDir,
      poolPromise,
      scale,
      stoppedSignal,
      timeoutInMilliseconds,
      makeBrowser,
      browserReplacer,
      concurrencyOrFramesToRender,
      framesRenderedObj,
      lastFrame,
      makeNewPage,
      onFrameBuffer,
      onFrameUpdate,
      nextFrameToRender,
      imageSequencePattern: pattern,
      trimLeftOffset,
      trimRightOffset,
      allFramesAndExtraFrames
    });
  }));
  const firstFrameIndex = countType === "from-zero" ? 0 : framesToRender[0];
  await Promise.all(downloadPromises);
  return {
    assetsInfo: {
      assets: assets.sort((a, b) => {
        return a.frame - b.frame;
      }),
      imageSequenceName: path21.join(frameDir, imageSequenceName),
      firstFrameIndex,
      downloadMap,
      trimLeftOffset,
      trimRightOffset,
      chunkLengthInSeconds,
      forSeamlessAacConcatenation
    },
    frameCount: framesToRender.length
  };
};
var internalRenderFramesRaw = ({
  browserExecutable,
  cancelSignal,
  chromiumOptions,
  composition,
  concurrency,
  envVariables,
  everyNthFrame,
  frameRange,
  imageFormat,
  indent,
  jpegQuality,
  muted,
  onBrowserLog,
  onDownload,
  onFrameBuffer,
  onFrameUpdate,
  onStart,
  outputDir,
  port,
  puppeteerInstance,
  scale,
  server,
  timeoutInMilliseconds,
  logLevel,
  webpackBundleOrServeUrl,
  serializedInputPropsWithCustomSchema,
  serializedResolvedPropsWithCustomSchema,
  offthreadVideoCacheSizeInBytes,
  parallelEncodingEnabled,
  binariesDirectory,
  forSeamlessAacConcatenation,
  compositionStart,
  onBrowserDownload,
  onArtifact,
  chromeMode,
  offthreadVideoThreads,
  imageSequencePattern,
  mediaCacheSizeInBytes,
  onLog
}) => {
  validateDimension(composition.height, "height", "in the `config` object passed to `renderFrames()`");
  validateDimension(composition.width, "width", "in the `config` object passed to `renderFrames()`");
  validateFps(composition.fps, "in the `config` object of `renderFrames()`", false);
  validateDurationInFrames(composition.durationInFrames, {
    component: "in the `config` object passed to `renderFrames()`",
    allowFloats: false
  });
  validateJpegQuality(jpegQuality);
  validateScale(scale);
  const makeBrowser = () => internalOpenBrowser({
    browser: DEFAULT_BROWSER,
    browserExecutable,
    chromiumOptions,
    forceDeviceScaleFactor: scale,
    indent,
    viewport: null,
    logLevel,
    onBrowserDownload,
    chromeMode
  });
  const browserInstance = puppeteerInstance ?? makeBrowser();
  const resolvedConcurrency = resolveConcurrency(concurrency);
  const openedPages = [];
  return new Promise((resolve2, reject) => {
    const cleanup = [];
    const onError = (err) => {
      reject(err);
    };
    Promise.race([
      new Promise((_, rej) => {
        cancelSignal?.(() => {
          rej(new Error(cancelErrorMessages.renderFrames));
        });
      }),
      Promise.all([
        makeOrReuseServer(server, {
          webpackConfigOrServeUrl: webpackBundleOrServeUrl,
          port,
          remotionRoot: findRemotionRoot(),
          offthreadVideoThreads: offthreadVideoThreads ?? DEFAULT_RENDER_FRAMES_OFFTHREAD_VIDEO_THREADS,
          logLevel,
          indent,
          offthreadVideoCacheSizeInBytes,
          binariesDirectory,
          forceIPv4: false
        }, {
          onDownload
        }),
        browserInstance
      ]).then(([{ server: openedServer, cleanupServer }, pInstance]) => {
        const { serveUrl, offthreadPort, sourceMap, downloadMap } = openedServer;
        const browserReplacer = handleBrowserCrash(pInstance, logLevel, indent);
        const cycle = cycleBrowserTabs({
          puppeteerInstance: browserReplacer,
          concurrency: resolvedConcurrency,
          logLevel,
          indent
        });
        cleanup.push(() => {
          cycle.stopCycling();
          return Promise.resolve();
        });
        cleanup.push(() => cleanupServer(false));
        return innerRenderFrames({
          onError,
          pagesArray: openedPages,
          serveUrl,
          composition,
          resolvedConcurrency,
          onDownload,
          proxyPort: offthreadPort,
          makeBrowser,
          browserReplacer,
          sourceMapGetter: sourceMap,
          downloadMap,
          cancelSignal,
          envVariables,
          everyNthFrame,
          frameRange,
          imageFormat,
          jpegQuality,
          muted,
          onBrowserLog,
          onFrameBuffer,
          onFrameUpdate,
          onStart,
          outputDir,
          scale,
          timeoutInMilliseconds,
          logLevel,
          indent,
          serializedInputPropsWithCustomSchema,
          serializedResolvedPropsWithCustomSchema,
          parallelEncodingEnabled,
          binariesDirectory,
          forSeamlessAacConcatenation,
          compositionStart,
          onBrowserDownload,
          onArtifact,
          chromeMode,
          offthreadVideoThreads,
          imageSequencePattern,
          mediaCacheSizeInBytes,
          onLog,
          darkMode: chromiumOptions.darkMode ?? false
        });
      })
    ]).then((res) => {
      server?.compositor.executeCommand("CloseAllVideos", {}).then(() => {
        Log.verbose({ indent, logLevel, tag: "compositor" }, "Freed memory from compositor");
      }).catch((err) => {
        Log.verbose({ indent, logLevel }, "Could not close compositor", err);
      });
      return resolve2(res);
    }).catch((err) => reject(err)).finally(() => {
      if (puppeteerInstance) {
        Promise.all(openedPages.map((p) => p.close())).catch((err) => {
          if (isTargetClosedErr(err)) {
            return;
          }
          Log.error({ indent, logLevel }, "Unable to close browser tab", err);
        });
      } else {
        Promise.resolve(browserInstance).then((instance) => {
          return instance.close({ silent: true });
        }).catch((err) => {
          if (!err?.message.includes("Target closed")) {
            Log.error({ indent, logLevel }, "Unable to close browser", err);
          }
        });
      }
      cleanup.forEach((c) => {
        c();
      });
    });
  });
};
var internalRenderFrames = wrapWithErrorHandling(internalRenderFramesRaw);
var renderFrames = (options) => {
  const {
    composition,
    inputProps,
    onFrameUpdate,
    onStart,
    outputDir,
    serveUrl,
    browserExecutable,
    cancelSignal,
    chromiumOptions,
    concurrency,
    dumpBrowserLogs,
    envVariables,
    everyNthFrame,
    frameRange,
    imageFormat,
    jpegQuality,
    muted,
    onBrowserLog,
    onDownload,
    onFrameBuffer,
    port,
    puppeteerInstance,
    scale,
    timeoutInMilliseconds,
    verbose,
    quality,
    logLevel: passedLogLevel,
    offthreadVideoCacheSizeInBytes,
    binariesDirectory,
    onBrowserDownload,
    onArtifact,
    chromeMode,
    offthreadVideoThreads,
    imageSequencePattern,
    mediaCacheSizeInBytes
  } = options;
  if (!composition) {
    throw new Error("No `composition` option has been specified for renderFrames()");
  }
  if (typeof jpegQuality !== "undefined" && imageFormat !== "jpeg") {
    throw new Error("You can only pass the `quality` option if `imageFormat` is 'jpeg'.");
  }
  const logLevel = verbose || dumpBrowserLogs ? "verbose" : passedLogLevel ?? "info";
  const indent = false;
  if (quality) {
    Log.warn({ indent, logLevel }, "Passing `quality()` to `renderStill` is deprecated. Use `jpegQuality` instead.");
  }
  return internalRenderFrames({
    browserExecutable: browserExecutable ?? null,
    cancelSignal,
    chromiumOptions: chromiumOptions ?? {},
    composition,
    concurrency: concurrency ?? null,
    envVariables: envVariables ?? {},
    everyNthFrame: everyNthFrame ?? 1,
    frameRange: frameRange ?? null,
    imageFormat: imageFormat ?? "jpeg",
    indent,
    jpegQuality: jpegQuality ?? DEFAULT_JPEG_QUALITY,
    onDownload: onDownload ?? null,
    serializedInputPropsWithCustomSchema: NoReactInternals12.serializeJSONWithSpecialTypes({
      indent: undefined,
      staticBase: null,
      data: inputProps ?? {}
    }).serializedString,
    serializedResolvedPropsWithCustomSchema: NoReactInternals12.serializeJSONWithSpecialTypes({
      indent: undefined,
      staticBase: null,
      data: composition.props
    }).serializedString,
    puppeteerInstance,
    muted: muted ?? false,
    onBrowserLog: onBrowserLog ?? null,
    onFrameBuffer: onFrameBuffer ?? null,
    onFrameUpdate,
    onStart,
    outputDir,
    port: port ?? null,
    scale: scale ?? 1,
    logLevel,
    timeoutInMilliseconds: timeoutInMilliseconds ?? DEFAULT_TIMEOUT,
    webpackBundleOrServeUrl: serveUrl,
    server: undefined,
    offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytes ?? null,
    parallelEncodingEnabled: false,
    binariesDirectory: binariesDirectory ?? null,
    compositionStart: 0,
    forSeamlessAacConcatenation: false,
    onBrowserDownload: onBrowserDownload ?? defaultBrowserDownloadProgress({ indent, logLevel, api: "renderFrames()" }),
    onArtifact: onArtifact ?? null,
    chromeMode: chromeMode ?? "headless-shell",
    offthreadVideoThreads: offthreadVideoThreads ?? null,
    imageSequencePattern: imageSequencePattern ?? null,
    mediaCacheSizeInBytes: mediaCacheSizeInBytes ?? null,
    onLog: defaultOnLog
  });
};

// src/render-media.ts
import fs17 from "node:fs";
import os8 from "node:os";
import path26 from "node:path";
import { LicensingInternals } from "@remotion/licensing";
import { NoReactInternals as NoReactInternals15 } from "remotion/no-react";

// src/crf.ts
var defaultCrfMap = {
  h264: 18,
  h265: 23,
  vp8: 9,
  vp9: 28,
  prores: null,
  gif: null,
  "h264-mkv": 18,
  "h264-ts": 18,
  aac: null,
  mp3: null,
  wav: null
};
var getDefaultCrfForCodec = (codec) => {
  const val = defaultCrfMap[codec];
  if (val === undefined) {
    throw new TypeError(`Got unexpected codec "${codec}"`);
  }
  return val;
};
var crfRanges = {
  h264: [1, 51],
  h265: [0, 51],
  vp8: [4, 63],
  vp9: [0, 63],
  prores: [0, 0],
  gif: [0, 0],
  "h264-mkv": [1, 51],
  "h264-ts": [1, 51],
  aac: [0, 0],
  mp3: [0, 0],
  wav: [0, 0]
};
var getValidCrfRanges = (codec) => {
  const val = crfRanges[codec];
  if (val === undefined) {
    throw new TypeError(`Got unexpected codec "${codec}"`);
  }
  return val;
};
var validateQualitySettings = ({
  codec,
  crf,
  videoBitrate,
  encodingMaxRate,
  encodingBufferSize,
  hardwareAcceleration
}) => {
  if (crf && videoBitrate) {
    throw new Error('"crf" and "videoBitrate" can not both be set. Choose one of either.');
  }
  if (crf && hardwareAcceleration === "required") {
    throw new Error('"crf" option is not supported with hardware acceleration');
  }
  if (encodingMaxRate && !encodingBufferSize) {
    throw new Error('"encodingMaxRate" can not be set without also setting "encodingBufferSize".');
  }
  const bufSizeArray = encodingBufferSize ? ["-bufsize", encodingBufferSize] : [];
  const maxRateArray = encodingMaxRate ? ["-maxrate", encodingMaxRate] : [];
  if (videoBitrate) {
    if (codec === "prores") {
      console.warn("ProRes does not support videoBitrate. Ignoring.");
      return [];
    }
    if (isAudioCodec(codec)) {
      console.warn(`${codec} does not support videoBitrate. Ignoring.`);
      return [];
    }
    return ["-b:v", videoBitrate, ...bufSizeArray, ...maxRateArray];
  }
  if (crf === null || typeof crf === "undefined") {
    const actualCrf = getDefaultCrfForCodec(codec);
    if (actualCrf === null) {
      return [...bufSizeArray, ...maxRateArray];
    }
    return ["-crf", String(actualCrf), ...bufSizeArray, ...maxRateArray];
  }
  if (typeof crf !== "number") {
    throw new TypeError("Expected CRF to be a number, but is " + JSON.stringify(crf));
  }
  const range = getValidCrfRanges(codec);
  if (crf === 0 && (codec === "h264" || codec === "h264-mkv" || codec === "h264-ts")) {
    throw new TypeError("Setting the CRF to 0 with a H264 codec is not supported anymore because of it's inconsistencies between platforms. Videos with CRF 0 cannot be played on iOS/macOS. 0 is a extreme value with inefficient settings which you probably do not want. Set CRF to a higher value to fix this error.");
  }
  if (crf < range[0] || crf > range[1]) {
    if (range[0] === 0 && range[1] === 0) {
      throw new TypeError(`The "${codec}" codec does not support the --crf option.`);
    }
    throw new TypeError(`CRF must be between ${range[0]} and ${range[1]} for codec ${codec}. Passed: ${crf}`);
  }
  if (codec === "prores") {
    console.warn('ProRes does not support the "crf" option. Ignoring.');
    return [];
  }
  if (isAudioCodec(codec)) {
    console.warn(`${codec} does not support the "crf" option. Ignoring.`);
    return [];
  }
  return ["-crf", String(crf), ...bufSizeArray, ...maxRateArray];
};

// src/codec-supports-media.ts
var support = {
  "h264-mkv": {
    audio: true,
    video: true
  },
  aac: {
    audio: true,
    video: false
  },
  gif: {
    video: true,
    audio: false
  },
  h264: {
    video: true,
    audio: true
  },
  "h264-ts": {
    video: true,
    audio: true
  },
  h265: {
    video: true,
    audio: true
  },
  mp3: {
    audio: true,
    video: false
  },
  prores: {
    audio: true,
    video: true
  },
  vp8: {
    audio: true,
    video: true
  },
  vp9: {
    audio: true,
    video: true
  },
  wav: {
    audio: true,
    video: false
  }
};
var codecSupportsMedia = (codec) => {
  return support[codec];
};

// src/ensure-frames-in-order.ts
var ensureFramesInOrder = (framesToRender) => {
  let [frameToStitch] = framesToRender;
  const finalFrame = framesToRender[framesToRender.length - 1];
  let waiters = [];
  const resolveWaiters = () => {
    for (const waiter of waiters.slice(0)) {
      if (frameToStitch === waiter.forFrame) {
        waiter.resolve();
        waiters = waiters.filter((w) => w.id !== waiter.id);
      }
    }
  };
  const waitForRightTimeOfFrameToBeInserted = (frameToBe) => {
    return new Promise((resolve2) => {
      waiters.push({
        id: String(Math.random()),
        forFrame: frameToBe,
        resolve: resolve2
      });
      resolveWaiters();
    });
  };
  const setFrameToStitch = (f) => {
    frameToStitch = f;
    resolveWaiters();
  };
  const waitForFinish = async () => {
    await waitForRightTimeOfFrameToBeInserted(finalFrame + 1);
  };
  return {
    waitForRightTimeOfFrameToBeInserted,
    setFrameToStitch,
    waitForFinish
  };
};

// src/options/color-space.tsx
import { NoReactInternals as NoReactInternals13 } from "remotion/no-react";
import { jsx as jsx4, jsxs as jsxs4, Fragment as Fragment4 } from "react/jsx-runtime";
var validV4ColorSpaces = ["default", "bt601", "bt709", "bt2020-ncl"];
var validV5ColorSpaces = ["bt601", "bt709", "bt2020-ncl"];
var validColorSpaces = NoReactInternals13.ENABLE_V5_BREAKING_CHANGES ? validV5ColorSpaces : validV4ColorSpaces;
var DEFAULT_COLOR_SPACE = NoReactInternals13.ENABLE_V5_BREAKING_CHANGES ? "bt709" : "default";

// src/options/x264-preset.tsx
import { jsx as jsx5, jsxs as jsxs5, Fragment as Fragment5 } from "react/jsx-runtime";
var x264PresetOptions = [
  "ultrafast",
  "superfast",
  "veryfast",
  "faster",
  "fast",
  "medium",
  "slow",
  "slower",
  "veryslow",
  "placebo"
];
var validateSelectedCodecAndPresetCombination = ({
  codec,
  x264Preset
}) => {
  if (x264Preset !== null && codec !== "h264" && codec !== "h264-mkv" && codec !== "h264-ts") {
    throw new TypeError(`You have set a x264 preset but the codec is "${codec}". Set the codec to "h264" or remove the Preset profile.`);
  }
  if (x264Preset !== null && !x264PresetOptions.includes(x264Preset)) {
    throw new TypeError(`The Preset profile "${x264Preset}" is not valid. Valid options are ${x264PresetOptions.map((p) => `"${p}"`).join(", ")}`);
  }
};

// src/overwrite.ts
var DEFAULT_OVERWRITE = true;

// src/get-codec-name.ts
var hasSpecifiedUnsupportedHardwareQualifySettings = ({
  encodingMaxRate,
  encodingBufferSize,
  crf
}) => {
  if (encodingBufferSize !== null) {
    return "encodingBufferSize";
  }
  if (encodingMaxRate !== null) {
    return "encodingMaxRate";
  }
  if (crf !== null && typeof crf !== "undefined") {
    return "crf";
  }
  return null;
};
var getCodecName = ({
  codec,
  encodingMaxRate,
  encodingBufferSize,
  crf,
  hardwareAcceleration,
  logLevel,
  indent
}) => {
  const preferredHwAcceleration = hardwareAcceleration === "required" || hardwareAcceleration === "if-possible";
  const unsupportedQualityOption = hasSpecifiedUnsupportedHardwareQualifySettings({
    encodingMaxRate,
    encodingBufferSize,
    crf
  });
  if (hardwareAcceleration === "required" && unsupportedQualityOption) {
    throw new Error(`When using hardware accelerated encoding, the option "${unsupportedQualityOption}" with hardware acceleration is not supported. Disable hardware accelerated encoding or use "if-possible" instead.`);
  }
  const warnAboutDisabledHardwareAcceleration = () => {
    if (hardwareAcceleration === "if-possible" && unsupportedQualityOption) {
      Log.warn({ indent, logLevel }, `${indent ? "" : `
`}Hardware accelerated encoding disabled - "${unsupportedQualityOption}" option is not supported with hardware acceleration`);
    }
  };
  if (codec === "prores") {
    if (preferredHwAcceleration && process.platform === "darwin" && !unsupportedQualityOption) {
      return { encoderName: "prores_videotoolbox", hardwareAccelerated: true };
    }
    warnAboutDisabledHardwareAcceleration();
    return { encoderName: "prores_ks", hardwareAccelerated: false };
  }
  if (codec === "h264") {
    if (preferredHwAcceleration && process.platform === "darwin" && !unsupportedQualityOption) {
      return { encoderName: "h264_videotoolbox", hardwareAccelerated: true };
    }
    warnAboutDisabledHardwareAcceleration();
    return { encoderName: "libx264", hardwareAccelerated: false };
  }
  if (codec === "h265") {
    if (preferredHwAcceleration && process.platform === "darwin" && !unsupportedQualityOption) {
      return { encoderName: "hevc_videotoolbox", hardwareAccelerated: true };
    }
    warnAboutDisabledHardwareAcceleration();
    return { encoderName: "libx265", hardwareAccelerated: false };
  }
  if (codec === "vp8") {
    return { encoderName: "libvpx", hardwareAccelerated: false };
  }
  if (codec === "vp9") {
    return { encoderName: "libvpx-vp9", hardwareAccelerated: false };
  }
  if (codec === "gif") {
    return { encoderName: "gif", hardwareAccelerated: false };
  }
  if (codec === "mp3") {
    return null;
  }
  if (codec === "aac") {
    return null;
  }
  if (codec === "wav") {
    return null;
  }
  if (codec === "h264-mkv") {
    return { encoderName: "libx264", hardwareAccelerated: false };
  }
  if (codec === "h264-ts") {
    return { encoderName: "libx264", hardwareAccelerated: false };
  }
  throw new Error(`Could not get codec for ${codec}`);
};

// src/ffmpeg-args.ts
var firstEncodingStepOnly = ({
  hasPreencoded,
  proResProfileName,
  pixelFormat,
  x264Preset,
  codec,
  crf,
  videoBitrate,
  encodingMaxRate,
  encodingBufferSize,
  hardwareAcceleration
}) => {
  if (hasPreencoded || codec === "gif") {
    return [];
  }
  return [
    proResProfileName ? ["-profile:v", proResProfileName] : null,
    ["-pix_fmt", pixelFormat],
    pixelFormat === "yuva420p" ? ["-auto-alt-ref", "0"] : null,
    x264Preset ? ["-preset", x264Preset] : null,
    ["-video_track_timescale", "90000"],
    validateQualitySettings({
      crf,
      videoBitrate,
      codec,
      encodingMaxRate,
      encodingBufferSize,
      hardwareAcceleration
    })
  ].filter(truthy);
};
var generateFfmpegArgs = ({
  hasPreencoded,
  proResProfileName,
  pixelFormat,
  x264Preset,
  codec,
  crf,
  videoBitrate,
  encodingMaxRate,
  encodingBufferSize,
  colorSpace,
  hardwareAcceleration,
  indent,
  logLevel
}) => {
  const encoderSettings = getCodecName({
    codec,
    encodingMaxRate,
    encodingBufferSize,
    crf,
    hardwareAcceleration,
    indent,
    logLevel
  });
  if (encoderSettings === null) {
    throw new TypeError(`encoderSettings is null: ${JSON.stringify(codec)} (hwaccel = ${hardwareAcceleration})`);
  }
  const { encoderName, hardwareAccelerated } = encoderSettings;
  if (!hardwareAccelerated && hardwareAcceleration === "required") {
    throw new Error(`Codec ${codec} does not support hardware acceleration on ${process.platform}, but "hardwareAcceleration" is set to "required"`);
  }
  Log.verbose({ indent, logLevel, tag: "stitchFramesToVideo()" }, `Encoder: ${encoderName}, hardware accelerated: ${hardwareAccelerated}`);
  const resolvedColorSpace = codec === "gif" ? "bt601" : colorSpace ?? DEFAULT_COLOR_SPACE;
  const colorSpaceOptions = resolvedColorSpace === "bt709" ? [
    ["-colorspace:v", "bt709"],
    ["-color_primaries:v", "bt709"],
    ["-color_trc:v", "bt709"],
    ["-color_range", "tv"],
    hasPreencoded ? [] : ["-vf", "zscale=matrix=709:matrixin=709:range=limited"]
  ] : resolvedColorSpace === "bt2020-ncl" ? [
    ["-colorspace:v", "bt2020nc"],
    ["-color_primaries:v", "bt2020"],
    ["-color_trc:v", "arib-std-b67"],
    ["-color_range", "tv"],
    hasPreencoded ? [] : [
      "-vf",
      "zscale=matrix=2020_ncl:matrixin=2020_ncl:range=limited"
    ]
  ] : [];
  return [
    ["-c:v", hasPreencoded ? "copy" : encoderName],
    codec === "h264-ts" ? ["-f", "mpegts"] : null,
    ...colorSpaceOptions,
    ...firstEncodingStepOnly({
      codec,
      crf,
      hasPreencoded,
      pixelFormat,
      proResProfileName,
      videoBitrate,
      encodingMaxRate,
      encodingBufferSize,
      x264Preset,
      hardwareAcceleration
    })
  ].filter(truthy);
};

// src/get-prores-profile-name.ts
var getProResProfileName = (codec, proResProfile) => {
  if (codec !== "prores") {
    return null;
  }
  switch (proResProfile) {
    case "4444-xq":
      return "5";
    case "4444":
      return "4";
    case "hq":
      return "3";
    case "standard":
      return "2";
    case "light":
      return "1";
    case "proxy":
      return "0";
    default:
      return "3";
  }
};

// src/validate-even-dimensions-with-codec.ts
var validateEvenDimensionsWithCodec = ({
  width,
  height,
  codec,
  scale,
  wantsImageSequence,
  indent,
  logLevel
}) => {
  if (wantsImageSequence) {
    return {
      actualWidth: width,
      actualHeight: height
    };
  }
  if (codec !== "h264-mkv" && codec !== "h264" && codec !== "h265" && codec !== "h264-ts") {
    return {
      actualWidth: width,
      actualHeight: height
    };
  }
  let heightEvenDimensions = height;
  while (Math.round(heightEvenDimensions * scale) % 2 !== 0) {
    heightEvenDimensions--;
  }
  let widthEvenDimensions = width;
  while (Math.round(widthEvenDimensions * scale) % 2 !== 0) {
    widthEvenDimensions--;
  }
  if (widthEvenDimensions !== width) {
    Log.verbose({ indent, logLevel }, `Rounding width to an even number from ${width} to ${widthEvenDimensions}`);
  }
  if (heightEvenDimensions !== height) {
    Log.verbose({ indent, logLevel }, `Rounding height to an even number from ${height} to ${heightEvenDimensions}`);
  }
  return {
    actualWidth: widthEvenDimensions,
    actualHeight: heightEvenDimensions
  };
};

// src/prespawn-ffmpeg.ts
var prespawnFfmpeg = (options) => {
  validateDimension(options.height, "height", "passed to `stitchFramesToVideo()`");
  validateDimension(options.width, "width", "passed to `stitchFramesToVideo()`");
  const codec = options.codec ?? DEFAULT_CODEC;
  validateFps(options.fps, "in `stitchFramesToVideo()`", codec === "gif");
  validateEvenDimensionsWithCodec({
    width: options.width,
    height: options.height,
    codec,
    scale: 1,
    wantsImageSequence: false,
    indent: options.indent,
    logLevel: options.logLevel
  });
  const pixelFormat = options.pixelFormat ?? DEFAULT_PIXEL_FORMAT;
  const proResProfileName = getProResProfileName(codec, options.proResProfile);
  validateSelectedPixelFormatAndCodecCombination(pixelFormat, codec);
  const ffmpegArgs = [
    ["-r", options.fps],
    ...[
      ["-f", "image2pipe"],
      ["-s", `${options.width}x${options.height}`],
      ["-vcodec", options.imageFormat === "jpeg" ? "mjpeg" : "png"],
      ["-i", "-"]
    ],
    ...generateFfmpegArgs({
      hasPreencoded: false,
      proResProfileName,
      pixelFormat,
      x264Preset: options.x264Preset,
      codec,
      crf: options.crf,
      videoBitrate: options.videoBitrate,
      encodingMaxRate: options.encodingMaxRate,
      encodingBufferSize: options.encodingBufferSize,
      colorSpace: options.colorSpace,
      hardwareAcceleration: options.hardwareAcceleration,
      indent: options.indent,
      logLevel: options.logLevel
    }),
    "-y",
    options.outputLocation
  ];
  Log.verbose({
    indent: options.indent,
    logLevel: options.logLevel,
    tag: "prespawnFfmpeg()"
  }, "Generated FFMPEG command:");
  Log.verbose({
    indent: options.indent,
    logLevel: options.logLevel,
    tag: "prespawnFfmpeg()"
  }, ffmpegArgs.join(" "));
  const ffmpegString = ffmpegArgs.flat(2).filter(Boolean);
  const finalFfmpegString = options.ffmpegOverride ? options.ffmpegOverride({ type: "pre-stitcher", args: ffmpegString }) : ffmpegString;
  const task = callFf({
    bin: "ffmpeg",
    args: finalFfmpegString,
    indent: options.indent,
    logLevel: options.logLevel,
    binariesDirectory: options.binariesDirectory,
    cancelSignal: options.signal
  });
  let ffmpegOutput = "";
  task.stderr?.on("data", (data) => {
    const str = data.toString();
    ffmpegOutput += str;
    if (options.onProgress) {
      const parsed = parseFfmpegProgress(str, options.fps);
      if (parsed !== undefined) {
        options.onProgress(parsed);
      }
    }
  });
  let exitCode = {
    type: "running"
  };
  task.on("exit", (code, signal) => {
    if (typeof code === "number" && code > 0 || signal) {
      exitCode = {
        type: "quit-with-error",
        exitCode: code ?? 1,
        signal: signal ?? null,
        stderr: ffmpegOutput
      };
    } else {
      exitCode = {
        type: "quit-successfully",
        stderr: ffmpegOutput
      };
    }
  });
  return { task, getLogs: () => ffmpegOutput, getExitStatus: () => exitCode };
};

// src/prestitcher-memory-usage.ts
var estimateMemoryUsageForPrestitcher = ({
  width,
  height
}) => {
  const memoryUsageFor4K = 1e9;
  const memoryUsageOfPixel = memoryUsageFor4K / 1e6;
  return memoryUsageOfPixel * width * height;
};
var shouldUseParallelEncoding = ({
  width,
  height,
  logLevel
}) => {
  const freeMemory = getAvailableMemory(logLevel);
  const estimatedUsage = estimateMemoryUsageForPrestitcher({
    height,
    width
  });
  const hasEnoughMemory = freeMemory - estimatedUsage > 2000000000 && estimatedUsage / freeMemory < 0.5;
  return {
    hasEnoughMemory,
    freeMemory,
    estimatedUsage
  };
};

// src/prores-profile.ts
import { NoReactInternals as NoReactInternals14 } from "remotion/no-react";
var validateSelectedCodecAndProResCombination = ({
  codec,
  proResProfile
}) => {
  if (typeof proResProfile !== "undefined" && codec !== "prores") {
    throw new TypeError(`You have set a ProRes profile but the codec is "${codec}". Set the codec to "prores" or remove the ProRes profile.`);
  }
  if (proResProfile !== undefined && !NoReactInternals14.proResProfileOptions.includes(proResProfile)) {
    throw new TypeError(`The ProRes profile "${proResProfile}" is not valid. Valid options are ${NoReactInternals14.proResProfileOptions.map((p) => `"${p}"`).join(", ")}`);
  }
};

// src/stitch-frames-to-video.ts
import { cpSync as cpSync2, promises as promises3, rmSync as rmSync4 } from "node:fs";
import path25 from "node:path";

// src/convert-number-of-gif-loops-to-ffmpeg.ts
var convertNumberOfGifLoopsToFfmpegSyntax = (loops) => {
  if (loops === null) {
    return "0";
  }
  if (loops === 0) {
    return "-1";
  }
  return String(loops);
};

// src/create-audio.ts
import path24 from "path";

// src/resolve-asset-src.ts
import url from "node:url";
var resolveAssetSrc = (src) => {
  if (!src.startsWith("file:")) {
    return src;
  }
  const { protocol } = new URL(src);
  if (protocol === "file:")
    return url.fileURLToPath(src);
  throw new TypeError(`Unexpected src ${src}`);
};

// src/assets/flatten-volume-array.ts
var flattenVolumeArray = (volume) => {
  if (typeof volume === "number") {
    return volume;
  }
  if (volume.length === 0) {
    throw new TypeError("Volume array must have at least 1 number");
  }
  if (new Set(volume).size === 1) {
    return volume[0];
  }
  return volume;
};
var convertAssetToFlattenedVolume = (asset) => {
  return {
    ...asset,
    volume: flattenVolumeArray(asset.volume)
  };
};

// src/assets/types.ts
var uncompressMediaAsset = (allRenderAssets, assetToUncompress) => {
  const isCompressed = assetToUncompress.src.match(/same-as-(.*)-([0-9.]+)$/);
  if (!isCompressed) {
    return assetToUncompress;
  }
  const [, id, frame] = isCompressed;
  const assetToFill = allRenderAssets.find((a) => a.id === id && String(a.frame) === frame);
  if (!assetToFill) {
    console.log("List of assets:");
    console.log(allRenderAssets);
    throw new TypeError(`Cannot uncompress asset, asset list seems corrupt. Please file a bug in the Remotion repo with the debug information above.`);
  }
  return {
    ...assetToUncompress,
    src: assetToFill.src
  };
};

// src/assets/calculate-asset-positions.ts
var areEqual = (a, b) => {
  return a.id === b.id;
};
var findFrom = (target, renderAsset) => {
  const index = target.findIndex((a) => areEqual(a, renderAsset));
  if (index === -1) {
    return false;
  }
  target.splice(index, 1);
  return true;
};
var copyAndDeduplicateAssets = (renderAssets) => {
  const onlyAudioAndVideo = onlyAudioAndVideoAssets(renderAssets);
  const deduplicated = [];
  for (const renderAsset of onlyAudioAndVideo) {
    if (!deduplicated.find((d) => d.id === renderAsset.id)) {
      deduplicated.push(renderAsset);
    }
  }
  return deduplicated;
};
var calculateAssetPositions = (frames) => {
  const assets = [];
  const flattened = frames.flat(1);
  for (let frame = 0;frame < frames.length; frame++) {
    const prev = copyAndDeduplicateAssets(frames[frame - 1] ?? []);
    const current = copyAndDeduplicateAssets(frames[frame]);
    const next = copyAndDeduplicateAssets(frames[frame + 1] ?? []);
    for (const asset of current) {
      if (!findFrom(prev, asset)) {
        assets.push({
          src: resolveAssetSrc(uncompressMediaAsset(flattened, asset).src),
          type: asset.type,
          duration: null,
          id: asset.id,
          startInVideo: frame,
          trimLeft: asset.mediaFrame,
          volume: [],
          playbackRate: asset.playbackRate,
          toneFrequency: asset.toneFrequency,
          audioStartFrame: asset.audioStartFrame,
          audioStreamIndex: asset.audioStreamIndex
        });
      }
      const found = assets.find((a) => a.duration === null && areEqual(a, asset));
      if (!found)
        throw new Error("something wrong");
      if (!findFrom(next, asset)) {
        found.duration = frame - found.startInVideo + 1;
      }
      found.volume = [...found.volume, asset.volume];
    }
  }
  for (const asset of assets) {
    if (asset.duration === null) {
      throw new Error("duration is unexpectedly null");
    }
  }
  return assets.map((a) => convertAssetToFlattenedVolume(a));
};

// src/assets/convert-assets-to-file-urls.ts
var chunk = (input, size) => {
  return input.reduce((arr, item, idx) => {
    return idx % size === 0 ? [...arr, [item]] : [...arr.slice(0, -1), [...arr.slice(-1)[0], item]];
  }, []);
};
var convertAssetsToFileUrls = async ({
  assets,
  onDownload,
  downloadMap,
  indent,
  logLevel,
  binariesDirectory
}) => {
  const chunks = chunk(assets, 1000);
  const results = [];
  for (const ch of chunks) {
    const assetPromises = ch.map((frame) => {
      const frameAssetPromises = frame.audioAndVideoAssets.map((a) => {
        return downloadAndMapAssetsToFileUrl({
          renderAsset: a,
          onDownload,
          downloadMap,
          indent,
          logLevel,
          binariesDirectory,
          cancelSignalForAudioAnalysis: undefined,
          shouldAnalyzeAudioImmediately: true
        });
      });
      return Promise.all(frameAssetPromises);
    });
    const result = await Promise.all(assetPromises);
    results.push(result);
  }
  return results.flat(1);
};

// src/compress-audio.ts
import { cpSync } from "node:fs";
var compressAudio = async ({
  audioCodec,
  outName,
  binariesDirectory,
  indent,
  logLevel,
  audioBitrate,
  cancelSignal,
  inName,
  onProgress,
  chunkLengthInSeconds,
  fps
}) => {
  if (audioCodec === "pcm-16") {
    cpSync(inName, outName);
    return onProgress(1);
  }
  const args = [
    ["-hide_banner"],
    ["-i", inName],
    ["-c:a", mapAudioCodecToFfmpegAudioCodecName(audioCodec)],
    audioCodec === "aac" ? ["-f", "adts"] : null,
    audioCodec ? ["-b:a", audioBitrate || "320k"] : null,
    audioCodec === "aac" ? "-cutoff" : null,
    audioCodec === "aac" ? "18000" : null,
    ["-y", outName]
  ].filter(truthy).flat(2);
  const task = callFf({
    bin: "ffmpeg",
    args,
    indent,
    logLevel,
    binariesDirectory,
    cancelSignal
  });
  task.stderr?.on("data", (data) => {
    const utf8 = data.toString("utf8");
    const parsed = parseFfmpegProgress(utf8, fps);
    if (parsed !== undefined) {
      onProgress(parsed / (chunkLengthInSeconds * fps));
    }
  });
  await task;
};

// src/merge-audio-track.ts
import path23 from "node:path";

// src/chunk.ts
var chunk2 = (input, size) => {
  return input.reduce((arr, item, idx) => {
    return idx % size === 0 ? [...arr, [item]] : [...arr.slice(0, -1), [...arr.slice(-1)[0], item]];
  }, []);
};

// src/create-ffmpeg-merge-filter.ts
var OUTPUT_FILTER_NAME = "outputaudio";
var createFfmpegMergeFilter = ({
  inputs
}) => {
  const pads = inputs.map((input, index) => {
    const filters = [
      input.filter.pad_start ? input.filter.pad_start : null,
      input.filter.pad_end ? input.filter.pad_end : null,
      "acopy"
    ];
    return `[${index}:a]${filters.filter(truthy).join(",")}[padded${index}]`;
  });
  return [
    ...pads,
    `${new Array(inputs.length).fill(true).map((_, i) => {
      return `[padded${i}]`;
    }).join("")}amix=inputs=${inputs.length}:dropout_transition=0:normalize=0[${OUTPUT_FILTER_NAME}]`
  ].join(";");
};

// src/ffmpeg-filter-file.ts
import fs16, { existsSync as existsSync5 } from "node:fs";
import path22 from "node:path";
var makeFfmpegFilterFile = (complexFilter, downloadMap) => {
  if (complexFilter.filter === null) {
    return {
      file: null,
      cleanup: () => {
        return;
      }
    };
  }
  return makeFfmpegFilterFileStr(complexFilter.filter, downloadMap);
};
var makeFfmpegFilterFileStr = async (complexFilter, downloadMap) => {
  const random2 = Math.random().toString().replace(".", "");
  const filterFile = path22.join(downloadMap.complexFilter, "complex-filter-" + random2 + ".txt");
  if (!existsSync5(downloadMap.complexFilter)) {
    fs16.mkdirSync(downloadMap.complexFilter, { recursive: true });
  }
  await fs16.promises.writeFile(filterFile, complexFilter);
  return {
    file: filterFile,
    cleanup: () => {
      fs16.unlinkSync(filterFile);
    }
  };
};

// src/create-ffmpeg-complex-filter.ts
var createFfmpegComplexFilter = async ({
  filters,
  downloadMap
}) => {
  if (filters.length === 0) {
    return {
      complexFilterFlag: null,
      cleanup: () => {
        return;
      },
      complexFilter: null
    };
  }
  const complexFilter = createFfmpegMergeFilter({
    inputs: filters
  });
  const { file, cleanup } = await makeFfmpegFilterFileStr(complexFilter, downloadMap);
  return {
    complexFilterFlag: ["-filter_complex_script", file],
    cleanup,
    complexFilter
  };
};

// src/create-silent-audio.ts
var createSilentAudio = async ({
  outName,
  indent,
  logLevel,
  binariesDirectory,
  cancelSignal,
  chunkLengthInSeconds
}) => {
  await callFf({
    bin: "ffmpeg",
    args: [
      "-f",
      "lavfi",
      "-i",
      `anullsrc=r=${DEFAULT_SAMPLE_RATE}`,
      "-c:a",
      "pcm_s16le",
      "-t",
      String(chunkLengthInSeconds),
      "-ar",
      String(DEFAULT_SAMPLE_RATE),
      outName
    ],
    indent,
    logLevel,
    binariesDirectory,
    cancelSignal
  });
};

// src/merge-audio-track.ts
var mergeAudioTrackUnlimited = async ({
  outName,
  files,
  downloadMap,
  remotionRoot,
  indent,
  logLevel,
  binariesDirectory,
  cancelSignal,
  onProgress,
  fps,
  chunkLengthInSeconds
}) => {
  if (files.length === 0) {
    await createSilentAudio({
      outName,
      chunkLengthInSeconds,
      indent,
      logLevel,
      binariesDirectory,
      cancelSignal
    });
    onProgress(1);
    return;
  }
  if (files.length >= 32) {
    const chunked = chunk2(files, 10);
    const tempPath = tmpDir("remotion-large-audio-mixing");
    try {
      const partialProgress = new Array(chunked.length).fill(0);
      let finalProgress = 0;
      const callProgress = () => {
        const totalProgress = partialProgress.reduce((a, b) => a + b, 0) / chunked.length;
        const combinedProgress = totalProgress * 0.8 + finalProgress * 0.2;
        onProgress(combinedProgress);
      };
      const chunkNames = await Promise.all(chunked.map(async (chunkFiles, i) => {
        const chunkOutname = path23.join(tempPath, `chunk-${i}.wav`);
        await mergeAudioTrack({
          files: chunkFiles,
          chunkLengthInSeconds,
          outName: chunkOutname,
          downloadMap,
          remotionRoot,
          indent,
          logLevel,
          binariesDirectory,
          cancelSignal,
          onProgress: (progress) => {
            partialProgress[i] = progress;
            callProgress();
          },
          fps
        });
        return chunkOutname;
      }));
      await mergeAudioTrack({
        files: chunkNames.map((c) => ({
          filter: {
            pad_end: null,
            pad_start: null
          },
          outName: c
        })),
        outName,
        downloadMap,
        remotionRoot,
        indent,
        logLevel,
        binariesDirectory,
        cancelSignal,
        onProgress: (progress) => {
          finalProgress = progress;
          callProgress();
        },
        fps,
        chunkLengthInSeconds
      });
      return;
    } finally {
      deleteDirectory(tempPath);
    }
  }
  const {
    complexFilterFlag: mergeFilter,
    cleanup,
    complexFilter
  } = await createFfmpegComplexFilter({
    filters: files,
    downloadMap
  });
  const args = [
    ["-hide_banner"],
    ...files.map((f) => ["-i", f.outName]),
    mergeFilter,
    ["-c:a", "pcm_s16le"],
    ["-map", `[${OUTPUT_FILTER_NAME}]`],
    ["-y", outName]
  ].filter(truthy).flat(2);
  Log.verbose({ indent, logLevel }, `Merging audio tracks`, "Command:", `ffmpeg ${args.join(" ")}`, "Complex filter script:", complexFilter);
  const task = callFf({
    bin: "ffmpeg",
    args,
    indent,
    logLevel,
    binariesDirectory,
    cancelSignal
  });
  task.stderr?.on("data", (data) => {
    const utf8 = data.toString("utf8");
    const parsed = parseFfmpegProgress(utf8, fps);
    if (parsed !== undefined) {
      onProgress(parsed / (chunkLengthInSeconds * fps));
    }
  });
  await task;
  onProgress(1);
  cleanup();
};
var limit2 = pLimit(3);
var mergeAudioTrack = (options) => {
  return limit2(mergeAudioTrackUnlimited, options);
};

// src/assets/calculate-atempo.ts
var calculateATempo = (playbackRate) => {
  if (playbackRate === 1) {
    return null;
  }
  if (playbackRate >= 0.5 && playbackRate <= 2) {
    return `atempo=${playbackRate.toFixed(5)}`;
  }
  return `${calculateATempo(Math.sqrt(playbackRate))},${calculateATempo(Math.sqrt(playbackRate))}`;
};

// src/assets/round-volume-to-avoid-stack-overflow.ts
var MAX_FFMPEG_STACK_DEPTH = 98;
var roundVolumeToAvoidStackOverflow = (volume) => {
  return Number((Math.round(volume * (MAX_FFMPEG_STACK_DEPTH - 1)) / (MAX_FFMPEG_STACK_DEPTH - 1)).toFixed(3));
};

// src/assets/ffmpeg-volume-expression.ts
var FFMPEG_TIME_VARIABLE = "t";
var ffmpegIfOrElse = (condition, then, elseDo) => {
  return `if(${condition},${then},${elseDo})`;
};
var ffmpegIsOneOfFrames = ({
  frames,
  trimLeft,
  fps
}) => {
  const consecutiveArrays = [];
  for (let i = 0;i < frames.length; i++) {
    const previousFrame = frames[i - 1];
    const frame = frames[i];
    if (previousFrame === undefined || frame !== previousFrame + 1) {
      consecutiveArrays.push([]);
    }
    consecutiveArrays[consecutiveArrays.length - 1].push(frame);
  }
  return consecutiveArrays.map((f) => {
    const firstFrame = f[0];
    const lastFrame = f[f.length - 1];
    const before = (firstFrame - 0.5) / fps;
    const after = (lastFrame + 0.5) / fps;
    return `between(${FFMPEG_TIME_VARIABLE},${(before + trimLeft).toFixed(4)},${(after + trimLeft).toFixed(4)})`;
  }).join("+");
};
var ffmpegBuildVolumeExpression = ({
  arr,
  delay,
  fps
}) => {
  if (arr.length === 0) {
    throw new Error("Volume array expression should never have length 0");
  }
  if (arr.length === 1) {
    return String(arr[0][0]);
  }
  const [first, ...rest] = arr;
  const [volume, frames] = first;
  return ffmpegIfOrElse(ffmpegIsOneOfFrames({ frames, trimLeft: delay, fps }), String(volume), ffmpegBuildVolumeExpression({ arr: rest, delay, fps }));
};
var ffmpegVolumeExpression = ({
  volume,
  fps,
  trimLeft
}) => {
  if (typeof volume === "number") {
    return {
      eval: "once",
      value: String(volume)
    };
  }
  if ([...new Set(volume)].length === 1) {
    return ffmpegVolumeExpression({
      volume: volume[0],
      fps,
      trimLeft
    });
  }
  const paddedVolume = [...volume, volume[volume.length - 1]];
  const volumeMap = {};
  paddedVolume.forEach((baseVolume, frame) => {
    const actualVolume = roundVolumeToAvoidStackOverflow(baseVolume);
    if (!volumeMap[actualVolume]) {
      volumeMap[actualVolume] = [];
    }
    volumeMap[actualVolume].push(frame);
  });
  const volumeArray = Object.keys(volumeMap).map((key) => [Number(key), volumeMap[key]]).sort((a, b) => a[1].length - b[1].length);
  const expression = ffmpegBuildVolumeExpression({
    arr: volumeArray,
    delay: trimLeft,
    fps
  });
  return {
    eval: "frame",
    value: `'${expression}'`
  };
};

// src/seamless-aac-trim.ts
var getActualTrimLeft = ({
  fps,
  trimLeftOffset,
  seamless,
  assetDuration,
  audioStartFrame,
  trimLeft,
  playbackRate
}) => {
  const sinceStart = trimLeft - audioStartFrame;
  if (!seamless) {
    return {
      trimLeft: audioStartFrame / fps + sinceStart / fps * playbackRate + trimLeftOffset,
      maxTrim: assetDuration
    };
  }
  if (seamless) {
    return {
      trimLeft: audioStartFrame / fps / playbackRate + sinceStart / fps + trimLeftOffset,
      maxTrim: assetDuration ? assetDuration / playbackRate : null
    };
  }
  throw new Error("This should never happen");
};

// src/stringify-ffmpeg-filter.ts
var cleanUpFloatingPointError = (value) => {
  if (value % 1 < 0.0000001) {
    return Math.floor(value);
  }
  if (value % 1 > 0.9999999) {
    return Math.ceil(value);
  }
  return value;
};
var stringifyTrim = (trim) => {
  const value = cleanUpFloatingPointError(trim * 1e6);
  const asString = `${value}us`;
  if (asString.includes("e-")) {
    return "0us";
  }
  return asString;
};
var trimAndSetTempo = ({
  assetDuration,
  asset,
  trimLeftOffset,
  trimRightOffset,
  fps,
  indent,
  logLevel
}) => {
  const { trimLeft, maxTrim } = getActualTrimLeft({
    trimLeft: asset.trimLeft,
    fps,
    trimLeftOffset,
    seamless: true,
    assetDuration,
    audioStartFrame: asset.audioStartFrame,
    playbackRate: asset.playbackRate
  });
  const trimRight = trimLeft + asset.duration / fps - trimLeftOffset + trimRightOffset;
  let trimRightOrAssetDuration = maxTrim ? Math.min(trimRight, maxTrim) : trimRight;
  if (trimRightOrAssetDuration < trimLeft) {
    Log.warn({ indent, logLevel }, "trimRightOrAssetDuration < trimLeft: " + JSON.stringify({
      trimRight,
      trimLeft,
      assetDuration,
      assetTrimLeft: asset.trimLeft
    }));
    trimRightOrAssetDuration = trimLeft;
  }
  return {
    filter: [
      calculateATempo(asset.playbackRate),
      `atrim=${stringifyTrim(trimLeft)}:${stringifyTrim(trimRightOrAssetDuration)}`
    ],
    actualTrimLeft: trimLeft,
    audibleDuration: trimRightOrAssetDuration - trimLeft
  };
};
var stringifyFfmpegFilter = ({
  channels,
  volume,
  fps,
  assetDuration,
  chunkLengthInSeconds,
  forSeamlessAacConcatenation,
  trimLeftOffset,
  trimRightOffset,
  asset,
  indent,
  logLevel,
  presentationTimeOffsetInSeconds
}) => {
  if (channels === 0) {
    return null;
  }
  const { toneFrequency, startInVideo } = asset;
  const startInVideoSeconds = startInVideo / fps;
  const { trimLeft, maxTrim } = getActualTrimLeft({
    trimLeft: asset.trimLeft,
    fps,
    trimLeftOffset,
    seamless: forSeamlessAacConcatenation,
    assetDuration,
    audioStartFrame: asset.audioStartFrame,
    playbackRate: asset.playbackRate
  });
  if (maxTrim && trimLeft >= maxTrim) {
    return null;
  }
  if (toneFrequency !== null && (toneFrequency <= 0 || toneFrequency > 2)) {
    throw new Error("toneFrequency must be a positive number between 0.01 and 2");
  }
  const {
    actualTrimLeft,
    audibleDuration,
    filter: trimAndTempoFilter
  } = trimAndSetTempo({
    assetDuration,
    trimLeftOffset,
    trimRightOffset,
    asset,
    fps,
    indent,
    logLevel
  });
  const volumeFilter = ffmpegVolumeExpression({
    volume,
    fps,
    trimLeft: actualTrimLeft
  });
  const padAtEnd = chunkLengthInSeconds - audibleDuration - startInVideoSeconds;
  const padStart = startInVideoSeconds + (asset.trimLeft === 0 ? presentationTimeOffsetInSeconds : 0);
  return {
    filter: "[0:a]" + [
      `aformat=sample_fmts=s16:sample_rates=${DEFAULT_SAMPLE_RATE}`,
      ...trimAndTempoFilter,
      volumeFilter.value === "1" ? null : `volume=${volumeFilter.value}:eval=${volumeFilter.eval}`,
      toneFrequency && toneFrequency !== 1 ? `asetrate=${DEFAULT_SAMPLE_RATE}*${toneFrequency},aresample=${DEFAULT_SAMPLE_RATE},atempo=1/${toneFrequency}` : null
    ].filter(truthy).join(",") + `[a0]`,
    pad_end: padAtEnd > 0.0000001 ? "apad=pad_len=" + Math.round(padAtEnd * DEFAULT_SAMPLE_RATE) : null,
    pad_start: padStart === 0 ? null : `adelay=${new Array(channels + 1).fill((padStart * 1000).toFixed(0)).join("|")}`,
    actualTrimLeft
  };
};

// src/preprocess-audio-track.ts
var preprocessAudioTrackUnlimited = async ({
  outName,
  asset,
  fps,
  downloadMap,
  indent,
  logLevel,
  binariesDirectory,
  cancelSignal,
  onProgress,
  chunkLengthInSeconds,
  trimLeftOffset,
  trimRightOffset,
  forSeamlessAacConcatenation,
  audioStreamIndex
}) => {
  const { channels, duration, startTime } = await getAudioChannelsAndDuration({
    downloadMap,
    src: resolveAssetSrc(asset.src),
    indent,
    logLevel,
    binariesDirectory,
    cancelSignal,
    audioStreamIndex
  });
  const filter = stringifyFfmpegFilter({
    asset,
    fps,
    channels,
    assetDuration: duration,
    chunkLengthInSeconds,
    trimLeftOffset,
    trimRightOffset,
    forSeamlessAacConcatenation,
    volume: flattenVolumeArray(asset.volume),
    indent,
    logLevel,
    presentationTimeOffsetInSeconds: startTime ?? 0
  });
  if (filter === null) {
    return null;
  }
  const { cleanup, file } = await makeFfmpegFilterFile(filter, downloadMap);
  const args = [
    ["-hide_banner"],
    ["-i", resolveAssetSrc(asset.src)],
    audioStreamIndex ? ["-map", `0:a:${audioStreamIndex}`] : [],
    ["-ac", "2"],
    file ? ["-filter_script:a", file] : null,
    ["-c:a", "pcm_s16le"],
    ["-ar", String(DEFAULT_SAMPLE_RATE)],
    ["-y", outName]
  ].flat(2).filter(truthy);
  Log.verbose({ indent, logLevel }, "Preprocessing audio track:", JSON.stringify(args.join(" ")), "Filter:", filter.filter);
  const startTimestamp = Date.now();
  const task = callFf({
    bin: "ffmpeg",
    args,
    indent,
    logLevel,
    binariesDirectory,
    cancelSignal
  });
  task.stderr?.on("data", (data) => {
    const utf8 = data.toString("utf8");
    const parsed = parseFfmpegProgress(utf8, fps);
    if (parsed !== undefined) {
      onProgress((parsed - filter.actualTrimLeft * fps) / (chunkLengthInSeconds * fps));
    }
  });
  await task;
  Log.verbose({ indent, logLevel }, "Preprocessed audio track", `${Date.now() - startTimestamp}ms`);
  cleanup();
  return { outName, filter };
};
var limit3 = pLimit(2);
var preprocessAudioTrack = (options) => {
  return limit3(preprocessAudioTrackUnlimited, options);
};

// src/create-audio.ts
var createAudio = async ({
  assets,
  onDownload,
  fps,
  logLevel,
  onProgress,
  downloadMap,
  remotionRoot,
  indent,
  binariesDirectory,
  audioBitrate,
  audioCodec,
  cancelSignal,
  chunkLengthInSeconds,
  trimLeftOffset,
  trimRightOffset,
  forSeamlessAacConcatenation
}) => {
  const fileUrlAssets = await convertAssetsToFileUrls({
    assets,
    onDownload: onDownload ?? (() => () => {
      return;
    }),
    downloadMap,
    indent,
    logLevel,
    binariesDirectory
  });
  markAllAssetsAsDownloaded(downloadMap);
  const assetPositions = calculateAssetPositions(fileUrlAssets);
  Log.verbose({ indent, logLevel, tag: "audio" }, "asset positions", JSON.stringify(assetPositions));
  const preprocessProgress = new Array(assetPositions.length).fill(0);
  let mergeProgress = 0;
  let compressProgress = 0;
  const updateProgress = () => {
    const preprocessProgressSum = preprocessProgress.length === 0 ? 1 : preprocessProgress.reduce((a, b) => a + b, 0) / assetPositions.length;
    const totalProgress = preprocessProgressSum * 0.7 + mergeProgress * 0.1 + compressProgress * 0.2;
    onProgress(totalProgress);
  };
  const audioTracks = await Promise.all(assetPositions.map(async (asset, index) => {
    const filterFile = path24.join(downloadMap.audioMixing, `${index}.wav`);
    const result = await preprocessAudioTrack({
      outName: filterFile,
      asset,
      fps,
      downloadMap,
      indent,
      logLevel,
      binariesDirectory,
      cancelSignal,
      onProgress: (progress) => {
        preprocessProgress[index] = progress;
        updateProgress();
      },
      chunkLengthInSeconds,
      trimLeftOffset,
      trimRightOffset,
      forSeamlessAacConcatenation,
      audioStreamIndex: asset.audioStreamIndex
    });
    preprocessProgress[index] = 1;
    updateProgress();
    return result;
  }));
  await downloadMap.inlineAudioMixing.finish({
    indent,
    logLevel,
    binariesDirectory,
    cancelSignal
  });
  const inlinedAudio = downloadMap.inlineAudioMixing.getListOfAssets();
  const preprocessed = [
    ...audioTracks.filter(truthy),
    ...inlinedAudio.map((asset) => ({
      outName: asset,
      filter: {
        filter: null,
        pad_start: null,
        pad_end: null
      }
    }))
  ];
  const merged = path24.join(downloadMap.audioPreprocessing, "merged.wav");
  const extension = getExtensionFromAudioCodec(audioCodec);
  const outName = path24.join(downloadMap.audioPreprocessing, `audio.${extension}`);
  await mergeAudioTrack({
    files: preprocessed,
    outName: merged,
    downloadMap,
    remotionRoot,
    indent,
    logLevel,
    binariesDirectory,
    cancelSignal,
    fps,
    onProgress: (progress) => {
      mergeProgress = progress;
      updateProgress();
    },
    chunkLengthInSeconds
  });
  await compressAudio({
    audioBitrate,
    audioCodec,
    binariesDirectory,
    indent,
    logLevel,
    inName: merged,
    outName,
    cancelSignal,
    chunkLengthInSeconds,
    fps,
    onProgress: (progress) => {
      compressProgress = progress;
      updateProgress();
    }
  });
  deleteDirectory(merged);
  deleteDirectory(downloadMap.audioMixing);
  preprocessed.forEach((p) => {
    deleteDirectory(p.outName);
  });
  return outName;
};

// src/make-metadata-args.ts
import { VERSION as VERSION5 } from "remotion/version";
var makeMetadataArgs = (metadata) => {
  const defaultComment = `Made with Remotion ${VERSION5}`;
  const newMetadata = {
    comment: defaultComment
  };
  Object.keys(metadata).forEach((key) => {
    const lowercaseKey = key.toLowerCase();
    if (lowercaseKey === "comment") {
      newMetadata[lowercaseKey] = `${defaultComment}; ${metadata[key]}`;
    } else {
      newMetadata[lowercaseKey] = metadata[key];
    }
  });
  const metadataArgs = Object.entries(newMetadata).map(([key, value]) => ["-metadata", `${key}=${value}`]);
  return metadataArgs.flat(1);
};

// src/render-has-audio.ts
var getShouldRenderAudio = ({
  codec,
  assetsInfo,
  enforceAudioTrack,
  muted
}) => {
  if (muted) {
    return "no";
  }
  if (!codecSupportsMedia(codec).audio) {
    return "no";
  }
  if (enforceAudioTrack) {
    return "yes";
  }
  if (assetsInfo === null) {
    return "maybe";
  }
  return assetsInfo.assets.flat(1).length > 0 ? "yes" : "no";
};

// src/validate-videobitrate.ts
var validateBitrate = (bitrate, name) => {
  if (bitrate === null || typeof bitrate === "undefined") {
    return;
  }
  if (typeof bitrate === "number") {
    throw new TypeError(`"${name}" must be a string ending in "K" or "M". Got a number: ${bitrate}`);
  }
  if (typeof bitrate !== "string") {
    throw new TypeError(`"${name}" must be a string or null, but got ${JSON.stringify(bitrate)}`);
  }
  if (!bitrate.endsWith("K") && !bitrate.endsWith("k") && !bitrate.endsWith("M")) {
    throw new TypeError(`"${name}" must end in "K", "k" or "M", but got ${JSON.stringify(bitrate)}`);
  }
};

// src/stitch-frames-to-video.ts
var innerStitchFramesToVideo = async ({
  assetsInfo,
  audioBitrate,
  audioCodec: audioCodecSetting,
  cancelSignal,
  codec,
  crf,
  enforceAudioTrack,
  ffmpegOverride,
  force,
  fps,
  height,
  indent,
  muted,
  onDownload,
  outputLocation,
  pixelFormat,
  preEncodedFileLocation,
  preferLossless,
  proResProfile,
  logLevel,
  videoBitrate,
  maxRate,
  bufferSize,
  width,
  numberOfGifLoops,
  onProgress,
  x264Preset,
  colorSpace,
  binariesDirectory,
  separateAudioTo,
  metadata,
  hardwareAcceleration
}, remotionRoot) => {
  validateDimension(height, "height", "passed to `stitchFramesToVideo()`");
  validateDimension(width, "width", "passed to `stitchFramesToVideo()`");
  validateEvenDimensionsWithCodec({
    width,
    height,
    codec,
    scale: 1,
    wantsImageSequence: false,
    indent,
    logLevel
  });
  validateSelectedCodecAndProResCombination({
    codec,
    proResProfile
  });
  validateBitrate(audioBitrate, "audioBitrate");
  validateBitrate(videoBitrate, "videoBitrate");
  validateBitrate(maxRate, "maxRate");
  validateBitrate(bufferSize, "bufferSize");
  validateFps(fps, "in `stitchFramesToVideo()`", false);
  assetsInfo.downloadMap.preventCleanup();
  const proResProfileName = getProResProfileName(codec, proResProfile);
  const mediaSupport = codecSupportsMedia(codec);
  const renderAudioEvaluation = getShouldRenderAudio({
    assetsInfo,
    codec,
    enforceAudioTrack,
    muted
  });
  if (renderAudioEvaluation === "maybe") {
    throw new Error("Remotion is not sure whether to render audio. Please report this in the Remotion repo.");
  }
  const shouldRenderAudio = renderAudioEvaluation === "yes";
  const shouldRenderVideo = mediaSupport.video;
  if (!shouldRenderAudio && !shouldRenderVideo) {
    throw new Error("The output format has neither audio nor video. This can happen if you are rendering an audio codec and the output file has no audio or the muted flag was passed.");
  }
  const resolvedAudioCodec = resolveAudioCodec({
    codec,
    preferLossless,
    setting: audioCodecSetting,
    separateAudioTo
  });
  const tempFile = outputLocation ? null : path25.join(assetsInfo.downloadMap.stitchFrames, `out.${getFileExtensionFromCodec(codec, resolvedAudioCodec)}`);
  Log.verbose({
    indent,
    logLevel,
    tag: "stitchFramesToVideo()"
  }, "audioCodec", resolvedAudioCodec);
  Log.verbose({
    indent,
    logLevel,
    tag: "stitchFramesToVideo()"
  }, "pixelFormat", pixelFormat);
  Log.verbose({
    indent,
    logLevel,
    tag: "stitchFramesToVideo()"
  }, "codec", codec);
  Log.verbose({
    indent,
    logLevel,
    tag: "stitchFramesToVideo()"
  }, "shouldRenderAudio", shouldRenderAudio);
  Log.verbose({
    indent,
    logLevel,
    tag: "stitchFramesToVideo()"
  }, "shouldRenderVideo", shouldRenderVideo);
  validateQualitySettings({
    crf,
    codec,
    videoBitrate,
    encodingMaxRate: maxRate,
    encodingBufferSize: bufferSize,
    hardwareAcceleration
  });
  validateSelectedPixelFormatAndCodecCombination(pixelFormat, codec);
  const updateProgress = (muxProgress) => {
    onProgress?.(muxProgress);
  };
  const audio = shouldRenderAudio && resolvedAudioCodec ? await createAudio({
    assets: assetsInfo.assets,
    onDownload,
    fps,
    chunkLengthInSeconds: assetsInfo.chunkLengthInSeconds,
    logLevel,
    onProgress: (progress) => {
      Log.verbose({
        indent,
        logLevel,
        tag: "audio"
      }, `Encoding progress: ${Math.round(progress * 100)}%`);
    },
    downloadMap: assetsInfo.downloadMap,
    remotionRoot,
    indent,
    binariesDirectory,
    audioBitrate,
    audioCodec: resolvedAudioCodec,
    cancelSignal: cancelSignal ?? undefined,
    trimLeftOffset: assetsInfo.trimLeftOffset,
    trimRightOffset: assetsInfo.trimRightOffset,
    forSeamlessAacConcatenation: assetsInfo.forSeamlessAacConcatenation
  }) : null;
  if (mediaSupport.audio && !mediaSupport.video) {
    if (!resolvedAudioCodec) {
      throw new TypeError("exporting audio but has no audio codec name. Report this in the Remotion repo.");
    }
    if (!audio) {
      throw new TypeError("exporting audio but has no audio file. Report this in the Remotion repo.");
    }
    if (separateAudioTo) {
      throw new Error("`separateAudioTo` was set, but this render was audio-only. This option is meant to be used for video renders.");
    }
    cpSync2(audio, outputLocation ?? tempFile);
    onProgress?.(Math.round(assetsInfo.chunkLengthInSeconds * fps));
    deleteDirectory(path25.dirname(audio));
    const file = await new Promise((resolve2, reject) => {
      if (tempFile) {
        promises3.readFile(tempFile).then((f) => {
          return resolve2(f);
        }).catch((e) => reject(e));
      } else {
        resolve2(null);
      }
    });
    deleteDirectory(assetsInfo.downloadMap.stitchFrames);
    assetsInfo.downloadMap.allowCleanup();
    return Promise.resolve(file);
  }
  const ffmpegArgs = [
    ...preEncodedFileLocation ? [["-i", preEncodedFileLocation]] : [
      ["-r", String(fps)],
      ["-f", "image2"],
      ["-s", `${width}x${height}`],
      ["-start_number", String(assetsInfo.firstFrameIndex)],
      ["-i", assetsInfo.imageSequenceName],
      codec === "gif" ? ["-filter_complex", "split[v],palettegen,[v]paletteuse"] : null
    ],
    audio && !separateAudioTo ? ["-i", audio, "-c:a", "copy"] : ["-an"],
    numberOfGifLoops === null ? null : ["-loop", convertNumberOfGifLoopsToFfmpegSyntax(numberOfGifLoops)],
    ...generateFfmpegArgs({
      codec,
      crf,
      videoBitrate,
      encodingMaxRate: maxRate,
      encodingBufferSize: bufferSize,
      hasPreencoded: Boolean(preEncodedFileLocation),
      proResProfileName,
      pixelFormat,
      x264Preset,
      colorSpace,
      hardwareAcceleration,
      indent,
      logLevel
    }),
    codec === "h264" ? ["-movflags", "faststart"] : null,
    ["-map_metadata", "-1"],
    ...makeMetadataArgs(metadata ?? {}),
    force ? "-y" : null,
    outputLocation ?? tempFile
  ];
  const ffmpegString = ffmpegArgs.flat(2).filter(Boolean);
  const finalFfmpegString = ffmpegOverride ? ffmpegOverride({ type: "stitcher", args: ffmpegString }) : ffmpegString;
  Log.verbose({
    indent: indent ?? false,
    logLevel,
    tag: "stitchFramesToVideo()"
  }, "Generated final FFmpeg command:");
  Log.verbose({
    indent,
    logLevel,
    tag: "stitchFramesToVideo()"
  }, finalFfmpegString.join(" "));
  const task = callFfNative({
    bin: "ffmpeg",
    args: finalFfmpegString,
    indent,
    logLevel,
    binariesDirectory,
    cancelSignal: cancelSignal ?? undefined
  });
  let ffmpegStderr = "";
  let isFinished = false;
  task.stderr?.on("data", (data) => {
    const str = data.toString();
    ffmpegStderr += str;
    if (onProgress) {
      const parsed = parseFfmpegProgress(str, fps);
      if (parsed !== undefined) {
        if (parsed === assetsInfo.assets.length) {
          if (isFinished) {
            task.stdin?.write("q");
          } else {
            isFinished = true;
          }
        }
        updateProgress(parsed);
      }
    }
  });
  if (separateAudioTo) {
    if (!audio) {
      throw new Error(`\`separateAudioTo\` was set to ${JSON.stringify(separateAudioTo)}, but this render included no audio`);
    }
    const finalDestination = path25.resolve(remotionRoot, separateAudioTo);
    cpSync2(audio, finalDestination);
    rmSync4(audio);
  }
  const result = await new Promise((resolve2, reject) => {
    task.once("close", (code, signal) => {
      if (code === 0) {
        if (tempFile === null) {
          cleanDownloadMap(assetsInfo.downloadMap);
          return resolve2(null);
        }
        promises3.readFile(tempFile).then((f) => {
          resolve2(f);
        }).catch((e) => {
          reject(e);
        }).finally(() => {
          cleanDownloadMap(assetsInfo.downloadMap);
        });
      } else {
        reject(new Error(`FFmpeg quit with code ${code} ${signal ? `(${signal})` : ""} The FFmpeg output was ${ffmpegStderr}`));
      }
    });
  });
  assetsInfo.downloadMap.allowCleanup();
  return result;
};
var internalStitchFramesToVideo = (options) => {
  const remotionRoot = findRemotionRoot();
  const task = innerStitchFramesToVideo(options, remotionRoot);
  return Promise.race([
    task,
    new Promise((_resolve, reject) => {
      options.cancelSignal?.(() => {
        reject(new Error(cancelErrorMessages.stitchFramesToVideo));
      });
    })
  ]);
};
var stitchFramesToVideo = ({
  assetsInfo,
  force,
  fps,
  height,
  width,
  audioBitrate,
  audioCodec,
  cancelSignal,
  codec,
  crf,
  enforceAudioTrack,
  ffmpegOverride,
  muted,
  numberOfGifLoops,
  onDownload,
  onProgress,
  outputLocation,
  pixelFormat,
  proResProfile,
  verbose,
  videoBitrate,
  maxRate,
  bufferSize,
  x264Preset,
  colorSpace,
  binariesDirectory,
  separateAudioTo,
  metadata,
  hardwareAcceleration
}) => {
  return internalStitchFramesToVideo({
    assetsInfo,
    audioBitrate: audioBitrate ?? null,
    maxRate: maxRate ?? null,
    bufferSize: bufferSize ?? null,
    audioCodec: audioCodec ?? null,
    cancelSignal: cancelSignal ?? null,
    codec: codec ?? DEFAULT_CODEC,
    crf: crf ?? null,
    enforceAudioTrack: enforceAudioTrack ?? false,
    ffmpegOverride: ffmpegOverride ?? null,
    force: force ?? true,
    fps,
    height,
    indent: false,
    muted: muted ?? false,
    numberOfGifLoops: numberOfGifLoops ?? null,
    onDownload: onDownload ?? undefined,
    onProgress,
    outputLocation: outputLocation ?? null,
    pixelFormat: pixelFormat ?? DEFAULT_PIXEL_FORMAT,
    proResProfile,
    logLevel: verbose ? "verbose" : "info",
    videoBitrate: videoBitrate ?? null,
    width,
    preEncodedFileLocation: null,
    preferLossless: false,
    x264Preset: x264Preset ?? null,
    colorSpace: colorSpace ?? DEFAULT_COLOR_SPACE,
    binariesDirectory: binariesDirectory ?? null,
    metadata: metadata ?? null,
    separateAudioTo: separateAudioTo ?? null,
    hardwareAcceleration: hardwareAcceleration ?? "disable"
  });
};

// src/succeed-or-cancel.ts
var succeedOrCancel = ({
  happyPath,
  cancelSignal,
  cancelMessage
}) => {
  if (!cancelSignal) {
    return happyPath;
  }
  let resolveCancel = () => {
    return;
  };
  const cancelProm = new Promise((_resolve, reject) => {
    cancelSignal?.(() => {
      resolveCancel = _resolve;
      reject(new Error(cancelMessage));
    });
  });
  return Promise.race([
    happyPath.then((result) => {
      process.nextTick(() => resolveCancel?.(undefined));
      return result;
    }),
    cancelProm
  ]);
};

// src/validate-every-nth-frame.ts
var validateEveryNthFrame = (everyNthFrame) => {
  if (typeof everyNthFrame === "undefined") {
    throw new TypeError(`Argument missing for parameter "everyNthFrame"`);
  }
  if (typeof everyNthFrame !== "number") {
    throw new TypeError(`Argument passed to "everyNthFrame" is not a number: ${everyNthFrame}`);
  }
  if (everyNthFrame < 1) {
    throw new RangeError(`The value for "everyNthFrame" cannot be below 1, but is ${everyNthFrame}`);
  }
  if (!Number.isFinite(everyNthFrame)) {
    throw new RangeError(`"everyNthFrame" ${everyNthFrame} is not finite`);
  }
  if (everyNthFrame % 1 !== 0) {
    throw new RangeError(`Argument for everyNthFrame must be an integer, but got ${everyNthFrame}`);
  }
  if (everyNthFrame === 1) {
    return everyNthFrame;
  }
};

// src/validate-ffmpeg-override.ts
var validateFfmpegOverride = (ffmpegArgsHook) => {
  if (typeof ffmpegArgsHook === "undefined") {
    return;
  }
  if (ffmpegArgsHook && typeof ffmpegArgsHook !== "function") {
    throw new TypeError(`Argument passed for "ffmpegArgsHook" is not a function: ${ffmpegArgsHook}`);
  }
};

// src/validate-number-of-gif-loops.ts
var validateNumberOfGifLoops = (numberOfGifLoops, codec) => {
  if (typeof numberOfGifLoops === "undefined" || numberOfGifLoops === null) {
    return;
  }
  if (typeof numberOfGifLoops !== "number") {
    throw new TypeError(`Argument passed to "numberOfGifLoops" is not a number: ${numberOfGifLoops}`);
  }
  if (numberOfGifLoops < 0) {
    throw new RangeError(`The value for "numberOfGifLoops" cannot be below 0, but is ${numberOfGifLoops}`);
  }
  if (!Number.isFinite(numberOfGifLoops)) {
    throw new RangeError(`"numberOfGifLoops" ${numberOfGifLoops} is not finite`);
  }
  if (numberOfGifLoops % 1 !== 0) {
    throw new RangeError(`Argument for numberOfGifLoops must be an integer, but got ${numberOfGifLoops}`);
  }
  if (codec !== "gif") {
    throw new Error(`"numberOfGifLoops" can only be set if "codec" is set to "gif". The codec is "${codec}"`);
  }
};

// src/validate-output-filename.ts
var validateOutputFilename = ({
  codec,
  audioCodecSetting,
  extension,
  preferLossless,
  separateAudioTo
}) => {
  if (!defaultFileExtensionMap[codec]) {
    throw new TypeError(`The codec "${codec}" is not supported. Supported codecs are: ${Object.keys(defaultFileExtensionMap).join(", ")}`);
  }
  const map3 = defaultFileExtensionMap[codec];
  const resolvedAudioCodec = resolveAudioCodec({
    codec,
    preferLossless,
    setting: audioCodecSetting,
    separateAudioTo
  });
  if (resolvedAudioCodec === null) {
    if (extension !== map3.default) {
      throw new TypeError(`When using the ${codec} codec, the output filename must end in .${map3.default}.`);
    }
    return;
  }
  if (!(resolvedAudioCodec in map3.forAudioCodec)) {
    throw new Error(`Audio codec ${resolvedAudioCodec} is not supported for codec ${codec}`);
  }
  const acceptableExtensions = map3.forAudioCodec[resolvedAudioCodec].possible;
  if (!acceptableExtensions.includes(extension) && !separateAudioTo) {
    throw new TypeError(`When using the ${codec} codec with the ${resolvedAudioCodec} audio codec, the output filename must end in one of the following: ${acceptableExtensions.join(", ")}.`);
  }
};

// src/render-media.ts
var SLOWEST_FRAME_COUNT = 10;
var MAX_RECENT_FRAME_TIMINGS = 150;
var internalRenderMediaRaw = ({
  proResProfile,
  x264Preset,
  crf,
  composition: compositionWithPossibleUnevenDimensions,
  serializedInputPropsWithCustomSchema,
  pixelFormat: userPixelFormat,
  codec,
  envVariables,
  frameRange,
  puppeteerInstance,
  outputLocation,
  onProgress,
  overwrite,
  onDownload,
  onBrowserLog,
  onStart,
  timeoutInMilliseconds,
  chromiumOptions,
  scale,
  browserExecutable,
  port,
  cancelSignal,
  muted,
  enforceAudioTrack,
  ffmpegOverride,
  audioBitrate,
  videoBitrate,
  encodingMaxRate,
  encodingBufferSize,
  audioCodec,
  concurrency,
  disallowParallelEncoding,
  everyNthFrame,
  imageFormat: provisionalImageFormat,
  indent,
  jpegQuality,
  numberOfGifLoops,
  onCtrlCExit,
  preferLossless,
  serveUrl,
  server: reusedServer,
  logLevel,
  serializedResolvedPropsWithCustomSchema,
  offthreadVideoCacheSizeInBytes,
  colorSpace,
  repro,
  binariesDirectory,
  separateAudioTo,
  forSeamlessAacConcatenation,
  compositionStart,
  onBrowserDownload,
  onArtifact,
  metadata,
  hardwareAcceleration,
  chromeMode,
  offthreadVideoThreads,
  mediaCacheSizeInBytes,
  onLog,
  licenseKey,
  isProduction
}) => {
  const pixelFormat = userPixelFormat ?? compositionWithPossibleUnevenDimensions.defaultPixelFormat ?? DEFAULT_PIXEL_FORMAT;
  if (repro) {
    enableRepro({
      serveUrl,
      compositionName: compositionWithPossibleUnevenDimensions.id,
      serializedInputPropsWithCustomSchema,
      serializedResolvedPropsWithCustomSchema
    });
  } else {
    disableRepro();
  }
  validateJpegQuality(jpegQuality);
  validateQualitySettings({
    crf,
    codec,
    videoBitrate,
    encodingMaxRate,
    encodingBufferSize,
    hardwareAcceleration
  });
  validateBitrate(audioBitrate, "audioBitrate");
  validateBitrate(videoBitrate, "videoBitrate");
  validateBitrate(encodingMaxRate, "encodingMaxRate");
  validateBitrate(encodingBufferSize, "encodingBufferSize");
  validateSelectedCodecAndProResCombination({
    codec,
    proResProfile
  });
  validateSelectedCodecAndPresetCombination({
    codec,
    x264Preset
  });
  validateSelectedPixelFormatAndCodecCombination(pixelFormat, codec);
  if (outputLocation) {
    validateOutputFilename({
      codec,
      audioCodecSetting: audioCodec,
      extension: getExtensionOfFilename(outputLocation),
      preferLossless,
      separateAudioTo
    });
  }
  const absoluteOutputLocation = outputLocation ? path26.resolve(process.cwd(), outputLocation) : null;
  validateScale(scale);
  validateFfmpegOverride(ffmpegOverride);
  validateEveryNthFrame(everyNthFrame);
  validateNumberOfGifLoops(numberOfGifLoops, codec);
  let stitchStage = "encoding";
  let stitcherFfmpeg;
  let preStitcher = null;
  let encodedFrames = 0;
  let muxedFrames = 0;
  let renderedFrames = 0;
  let renderedDoneIn = null;
  let encodedDoneIn = null;
  let cancelled = false;
  let renderEstimatedTime = 0;
  const recentFrameTimings = [];
  const renderStart = Date.now();
  const { estimatedUsage, freeMemory, hasEnoughMemory } = shouldUseParallelEncoding({
    height: compositionWithPossibleUnevenDimensions.height,
    width: compositionWithPossibleUnevenDimensions.width,
    logLevel
  });
  const parallelEncoding = !disallowParallelEncoding && hasEnoughMemory && canUseParallelEncoding(codec);
  Log.verbose({
    indent,
    logLevel,
    tag: "renderMedia()"
  }, "Free memory:", freeMemory, "Estimated usage parallel encoding", estimatedUsage);
  const resolvedConcurrency = resolveConcurrency(concurrency);
  Log.verbose({
    indent,
    logLevel,
    tag: "renderMedia()"
  }, "Using concurrency:", resolvedConcurrency);
  Log.verbose({
    indent,
    logLevel,
    tag: "renderMedia()"
  }, "delayRender() timeout:", timeoutInMilliseconds);
  Log.verbose({
    indent,
    logLevel,
    tag: "renderMedia()"
  }, "Codec supports parallel rendering:", canUseParallelEncoding(codec));
  if (disallowParallelEncoding) {
    Log.verbose({
      indent,
      logLevel,
      tag: "renderMedia()"
    }, "User disallowed parallel encoding.");
  }
  if (parallelEncoding) {
    Log.verbose({
      indent,
      logLevel,
      tag: "renderMedia()"
    }, "Parallel encoding is enabled.");
  } else {
    Log.verbose({
      indent,
      logLevel,
      tag: "renderMedia()"
    }, "Parallel encoding is disabled.");
  }
  const imageFormat = isAudioCodec(codec) ? "none" : provisionalImageFormat ?? compositionWithPossibleUnevenDimensions.defaultVideoImageFormat ?? DEFAULT_VIDEO_IMAGE_FORMAT;
  validateSelectedPixelFormatAndImageFormatCombination(pixelFormat, imageFormat);
  const workingDir = fs17.mkdtempSync(path26.join(os8.tmpdir(), "react-motion-render"));
  const preEncodedFileLocation = parallelEncoding ? path26.join(workingDir, "pre-encode." + getFileExtensionFromCodec(codec, audioCodec)) : null;
  if (onCtrlCExit && workingDir) {
    onCtrlCExit(`Delete ${workingDir}`, () => deleteDirectory(workingDir));
  }
  const { actualWidth: widthEvenDimensions, actualHeight: heightEvenDimensions } = validateEvenDimensionsWithCodec({
    codec,
    height: compositionWithPossibleUnevenDimensions.height,
    scale,
    width: compositionWithPossibleUnevenDimensions.width,
    wantsImageSequence: false,
    indent,
    logLevel
  });
  const actualWidth = widthEvenDimensions * scale;
  const actualHeight = heightEvenDimensions * scale;
  const composition = {
    ...compositionWithPossibleUnevenDimensions,
    height: heightEvenDimensions,
    width: widthEvenDimensions
  };
  const realFrameRange = getRealFrameRange(composition.durationInFrames, frameRange);
  const totalFramesToRender = getFramesToRender(realFrameRange, everyNthFrame).length;
  Log.verbose({ indent, logLevel, tag: "renderMedia()" }, `Rendering frames ${realFrameRange.join("-")}`);
  const callUpdate = () => {
    const encoded = Math.round(0.8 * encodedFrames + 0.2 * muxedFrames);
    onProgress?.({
      encodedDoneIn,
      encodedFrames: encoded,
      renderedDoneIn,
      renderedFrames,
      renderEstimatedTime,
      stitchStage,
      progress: Math.round((70 * renderedFrames + 30 * encoded) / totalFramesToRender) / 100
    });
  };
  const cancelRenderFrames = makeCancelSignal();
  const cancelPrestitcher = makeCancelSignal();
  const cancelStitcher = makeCancelSignal();
  cancelSignal?.(() => {
    cancelRenderFrames.cancel();
  });
  const { waitForRightTimeOfFrameToBeInserted, setFrameToStitch, waitForFinish } = ensureFramesInOrder(realFrameRange);
  const fps = composition.fps / everyNthFrame;
  validateFps(fps, 'in "renderMedia()"', codec === "gif");
  const createPrestitcherIfNecessary = () => {
    if (preEncodedFileLocation) {
      preStitcher = prespawnFfmpeg({
        width: actualWidth,
        height: actualHeight,
        fps,
        outputLocation: preEncodedFileLocation,
        pixelFormat,
        codec,
        proResProfile,
        crf,
        onProgress: (frame) => {
          encodedFrames = frame;
          callUpdate();
        },
        logLevel,
        imageFormat,
        signal: cancelPrestitcher.cancelSignal,
        ffmpegOverride: ffmpegOverride ?? (({ args }) => args),
        videoBitrate,
        encodingMaxRate,
        encodingBufferSize,
        indent,
        x264Preset: x264Preset ?? null,
        colorSpace,
        binariesDirectory,
        hardwareAcceleration
      });
      stitcherFfmpeg = preStitcher.task;
    }
  };
  const waitForPrestitcherIfNecessary = async () => {
    if (stitcherFfmpeg) {
      await waitForFinish();
      stitcherFfmpeg?.stdin?.end();
      try {
        await stitcherFfmpeg;
      } catch {
        throw new Error(preStitcher?.getLogs());
      }
    }
    return { usesParallelEncoding: Boolean(stitcherFfmpeg) };
  };
  const mediaSupport = codecSupportsMedia(codec);
  const disableAudio = !mediaSupport.audio || muted;
  const slowestFrames = [];
  let maxTime = 0;
  let minTime = 0;
  const recordFrameTime = (frameIndex, time) => {
    const frameTime = { frame: frameIndex, time };
    if (time < minTime && slowestFrames.length === SLOWEST_FRAME_COUNT) {
      return;
    }
    if (time > maxTime) {
      slowestFrames.unshift(frameTime);
      maxTime = time;
    } else {
      const index = slowestFrames.findIndex(({ time: indexTime }) => indexTime < time);
      slowestFrames.splice(index, 0, frameTime);
    }
    if (slowestFrames.length > SLOWEST_FRAME_COUNT) {
      slowestFrames.pop();
    }
    minTime = slowestFrames[slowestFrames.length - 1]?.time ?? minTime;
  };
  let cleanupServerFn = () => Promise.resolve(undefined);
  const happyPath = new Promise((resolve2, reject) => {
    Promise.resolve(createPrestitcherIfNecessary()).then(() => {
      return makeOrReuseServer(reusedServer, {
        offthreadVideoThreads: offthreadVideoThreads ?? DEFAULT_RENDER_FRAMES_OFFTHREAD_VIDEO_THREADS,
        indent,
        port,
        remotionRoot: findRemotionRoot(),
        logLevel,
        webpackConfigOrServeUrl: serveUrl,
        offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytes ?? null,
        binariesDirectory,
        forceIPv4: false
      }, {
        onDownload
      });
    }).then(({ server, cleanupServer }) => {
      cleanupServerFn = cleanupServer;
      let timeOfLastFrame = Date.now();
      const renderFramesProc = internalRenderFrames({
        composition,
        onFrameUpdate: (frame, frameIndex) => {
          renderedFrames = frame;
          const now = Date.now();
          const timeToRenderInMilliseconds = now - timeOfLastFrame;
          timeOfLastFrame = now;
          recentFrameTimings.push(timeToRenderInMilliseconds);
          if (recentFrameTimings.length > MAX_RECENT_FRAME_TIMINGS) {
            recentFrameTimings.shift();
          }
          const recentTimingsSum = recentFrameTimings.reduce((sum, time) => sum + time, 0);
          const newAverage = recentTimingsSum / recentFrameTimings.length;
          const remainingFrames = totalFramesToRender - renderedFrames;
          renderEstimatedTime = Math.round(remainingFrames * newAverage);
          callUpdate();
          recordFrameTime(frameIndex, timeToRenderInMilliseconds);
        },
        concurrency,
        outputDir: parallelEncoding ? null : workingDir,
        onStart: (data) => {
          renderedFrames = 0;
          callUpdate();
          onStart?.(data);
        },
        serializedInputPropsWithCustomSchema,
        envVariables,
        imageFormat,
        jpegQuality,
        frameRange,
        puppeteerInstance,
        everyNthFrame,
        onFrameBuffer: parallelEncoding ? async (buffer, frame) => {
          await waitForRightTimeOfFrameToBeInserted(frame);
          if (cancelled) {
            return;
          }
          const id = startPerfMeasure("piping");
          const exitStatus = preStitcher?.getExitStatus();
          if (exitStatus?.type === "quit-successfully") {
            throw new Error(`FFmpeg already quit while trying to pipe frame ${frame} to it. Stderr: ${exitStatus.stderr}`);
          }
          if (exitStatus?.type === "quit-with-error") {
            throw new Error(`FFmpeg quit with code ${exitStatus.exitCode}${exitStatus.signal ? ` (signal ${exitStatus.signal})` : ""} while piping frame ${frame}. Stderr: ${exitStatus.stderr}`);
          }
          stitcherFfmpeg?.stdin?.write(buffer);
          stopPerfMeasure(id);
          setFrameToStitch(Math.min(realFrameRange[1] + 1, frame + everyNthFrame));
        } : null,
        webpackBundleOrServeUrl: serveUrl,
        onBrowserLog,
        onDownload,
        timeoutInMilliseconds,
        chromiumOptions,
        scale,
        browserExecutable,
        port,
        cancelSignal: cancelRenderFrames.cancelSignal,
        muted: disableAudio,
        logLevel,
        indent,
        server,
        serializedResolvedPropsWithCustomSchema,
        offthreadVideoCacheSizeInBytes,
        offthreadVideoThreads,
        parallelEncodingEnabled: parallelEncoding,
        binariesDirectory,
        compositionStart,
        forSeamlessAacConcatenation,
        onBrowserDownload,
        onArtifact,
        chromeMode,
        imageSequencePattern: null,
        mediaCacheSizeInBytes,
        onLog
      });
      return renderFramesProc;
    }).then((renderFramesReturn) => {
      return Promise.all([
        renderFramesReturn,
        waitForPrestitcherIfNecessary()
      ]);
    }).then(([{ assetsInfo }]) => {
      renderedDoneIn = Date.now() - renderStart;
      Log.verbose({ indent, logLevel }, "Rendering frames done in", renderedDoneIn + "ms");
      if (absoluteOutputLocation) {
        ensureOutputDirectory(absoluteOutputLocation);
      }
      const stitchStart = Date.now();
      return internalStitchFramesToVideo({
        width: Math.round(actualWidth),
        height: Math.round(actualHeight),
        fps,
        outputLocation: absoluteOutputLocation,
        preEncodedFileLocation,
        preferLossless,
        indent,
        force: overwrite,
        pixelFormat,
        codec,
        proResProfile,
        crf,
        assetsInfo,
        onProgress: (frame) => {
          if (preEncodedFileLocation) {
            stitchStage = "muxing";
            muxedFrames = Math.min(frame, totalFramesToRender);
          } else {
            muxedFrames = Math.min(frame, totalFramesToRender);
            encodedFrames = Math.min(frame, totalFramesToRender);
          }
          if (encodedFrames === totalFramesToRender) {
            encodedDoneIn = Date.now() - stitchStart;
          }
          if (frame > 0) {
            callUpdate();
          }
        },
        onDownload,
        numberOfGifLoops,
        logLevel,
        cancelSignal: cancelStitcher.cancelSignal,
        muted: disableAudio,
        enforceAudioTrack,
        ffmpegOverride: ffmpegOverride ?? null,
        audioBitrate,
        videoBitrate,
        bufferSize: encodingBufferSize,
        maxRate: encodingMaxRate,
        audioCodec,
        x264Preset: x264Preset ?? null,
        colorSpace,
        binariesDirectory,
        separateAudioTo,
        metadata,
        hardwareAcceleration
      });
    }).then((buffer) => {
      Log.verbose({ indent, logLevel }, "Stitching done in", encodedDoneIn + "ms");
      slowestFrames.sort((a, b) => b.time - a.time);
      const result = {
        buffer,
        slowestFrames,
        contentType: mimeLookup("file." + getFileExtensionFromCodec(codec, audioCodec)) || "application/octet-stream"
      };
      const sendTelemetryAndResolve = () => {
        if (licenseKey === null) {
          resolve2(result);
          return;
        }
        LicensingInternals.internalRegisterUsageEvent({
          event: "cloud-render",
          host: null,
          succeeded: true,
          licenseKey: licenseKey ?? null,
          isProduction: isProduction ?? true,
          isStill: false
        }).then(() => {
          Log.verbose({ indent, logLevel }, "Usage event sent successfully");
        }).catch((err) => {
          Log.error({ indent, logLevel }, "Failed to send usage event");
          Log.error({ indent: true, logLevel }, err);
        }).finally(() => {
          resolve2(result);
        });
      };
      if (isReproEnabled()) {
        getReproWriter().onRenderSucceed({ indent, logLevel, output: absoluteOutputLocation }).then(() => {
          sendTelemetryAndResolve();
        }).catch((err) => {
          Log.error({ indent, logLevel }, "Could not create reproduction", err);
          sendTelemetryAndResolve();
        });
      } else {
        sendTelemetryAndResolve();
      }
    }).catch((err) => {
      cancelled = true;
      cancelRenderFrames.cancel();
      cancelStitcher.cancel();
      cancelPrestitcher.cancel();
      if (stitcherFfmpeg !== undefined && stitcherFfmpeg.exitCode === null) {
        const promise = new Promise((res) => {
          setTimeout(() => {
            res();
          }, 2000);
          stitcherFfmpeg.on("close", res);
        });
        try {
          stitcherFfmpeg.kill();
        } catch {}
        return promise.then(() => {
          reject(err);
        });
      }
      reject(err);
    }).finally(() => {
      if (preEncodedFileLocation !== null && fs17.existsSync(preEncodedFileLocation)) {
        deleteDirectory(path26.dirname(preEncodedFileLocation));
      }
      if (workingDir && fs17.existsSync(workingDir)) {
        deleteDirectory(workingDir);
      }
      cleanupServerFn?.(false).catch((err) => {
        Log.error({ indent, logLevel }, "Could not cleanup: ", err);
      });
    });
  });
  return succeedOrCancel({
    happyPath,
    cancelSignal,
    cancelMessage: cancelErrorMessages.renderMedia
  });
};
var internalRenderMedia = wrapWithErrorHandling(internalRenderMediaRaw);
var renderMedia = ({
  proResProfile,
  x264Preset,
  crf,
  composition,
  inputProps,
  pixelFormat,
  codec,
  envVariables,
  frameRange,
  puppeteerInstance,
  outputLocation,
  onProgress,
  overwrite,
  onDownload,
  onBrowserLog,
  onStart,
  timeoutInMilliseconds,
  chromiumOptions,
  scale,
  browserExecutable,
  port,
  cancelSignal,
  muted,
  enforceAudioTrack,
  ffmpegOverride,
  audioBitrate,
  videoBitrate,
  encodingMaxRate,
  encodingBufferSize,
  audioCodec,
  jpegQuality,
  concurrency,
  serveUrl,
  disallowParallelEncoding,
  everyNthFrame,
  imageFormat,
  numberOfGifLoops,
  dumpBrowserLogs,
  preferLossless,
  verbose,
  quality,
  logLevel: passedLogLevel,
  offthreadVideoCacheSizeInBytes,
  colorSpace,
  repro,
  binariesDirectory,
  separateAudioTo,
  forSeamlessAacConcatenation,
  onBrowserDownload,
  onArtifact,
  metadata,
  hardwareAcceleration,
  chromeMode,
  offthreadVideoThreads,
  compositionStart,
  mediaCacheSizeInBytes,
  isProduction,
  ...apiKeyOrLicenseKey
}) => {
  const indent = false;
  const logLevel = verbose || dumpBrowserLogs ? "verbose" : passedLogLevel ?? "info";
  if (quality !== undefined) {
    Log.warn({ indent, logLevel }, `The "quality" option has been renamed. Please use "jpegQuality" instead.`);
  }
  const licenseKey = "licenseKey" in apiKeyOrLicenseKey ? apiKeyOrLicenseKey.licenseKey : null;
  const apiKey = "apiKey" in apiKeyOrLicenseKey ? apiKeyOrLicenseKey.apiKey : null;
  return internalRenderMedia({
    proResProfile: proResProfile ?? undefined,
    x264Preset: x264Preset ?? null,
    codec,
    composition,
    serveUrl,
    audioBitrate: audioBitrate ?? null,
    audioCodec: audioCodec ?? null,
    browserExecutable: browserExecutable ?? null,
    cancelSignal,
    chromiumOptions: chromiumOptions ?? {},
    concurrency: concurrency ?? null,
    crf: crf ?? null,
    disallowParallelEncoding: disallowParallelEncoding ?? false,
    enforceAudioTrack: enforceAudioTrack ?? false,
    envVariables: envVariables ?? {},
    everyNthFrame: everyNthFrame ?? 1,
    ffmpegOverride: ffmpegOverride ?? undefined,
    frameRange: frameRange ?? null,
    imageFormat: imageFormat ?? null,
    serializedInputPropsWithCustomSchema: NoReactInternals15.serializeJSONWithSpecialTypes({
      indent: undefined,
      staticBase: null,
      data: inputProps ?? {}
    }).serializedString,
    jpegQuality: jpegQuality ?? quality ?? DEFAULT_JPEG_QUALITY,
    muted: muted ?? false,
    numberOfGifLoops: numberOfGifLoops ?? null,
    onBrowserLog: onBrowserLog ?? null,
    onDownload: onDownload ?? (() => {
      return;
    }),
    onProgress: onProgress ?? (() => {
      return;
    }),
    onStart: onStart ?? (() => {
      return;
    }),
    outputLocation: outputLocation ?? null,
    overwrite: overwrite ?? DEFAULT_OVERWRITE,
    pixelFormat: pixelFormat ?? null,
    port: port ?? null,
    puppeteerInstance: puppeteerInstance ?? undefined,
    scale: scale ?? 1,
    timeoutInMilliseconds: timeoutInMilliseconds ?? DEFAULT_TIMEOUT,
    videoBitrate: videoBitrate ?? null,
    encodingMaxRate: encodingMaxRate ?? null,
    encodingBufferSize: encodingBufferSize ?? null,
    logLevel,
    preferLossless: preferLossless ?? false,
    indent,
    onCtrlCExit: () => {
      return;
    },
    server: undefined,
    serializedResolvedPropsWithCustomSchema: NoReactInternals15.serializeJSONWithSpecialTypes({
      indent: undefined,
      staticBase: null,
      data: composition.props ?? {}
    }).serializedString,
    offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytes ?? null,
    offthreadVideoThreads: offthreadVideoThreads ?? null,
    colorSpace: colorSpace ?? DEFAULT_COLOR_SPACE,
    repro: repro ?? false,
    binariesDirectory: binariesDirectory ?? null,
    separateAudioTo: separateAudioTo ?? null,
    forSeamlessAacConcatenation: forSeamlessAacConcatenation ?? false,
    onBrowserDownload: onBrowserDownload ?? defaultBrowserDownloadProgress({
      indent,
      logLevel,
      api: "renderMedia()"
    }),
    onArtifact: onArtifact ?? null,
    metadata: metadata ?? null,
    compositionStart: compositionStart ?? 0,
    hardwareAcceleration: hardwareAcceleration ?? "disable",
    chromeMode: chromeMode ?? "headless-shell",
    mediaCacheSizeInBytes: mediaCacheSizeInBytes ?? null,
    licenseKey: licenseKey ?? apiKey ?? null,
    onLog: defaultOnLog,
    isProduction: isProduction ?? null
  });
};

// src/render-still.ts
import fs18, { statSync as statSync2 } from "node:fs";
import path27 from "node:path";
import { LicensingInternals as LicensingInternals2 } from "@remotion/licensing";
import { NoReactInternals as NoReactInternals16 } from "remotion/no-react";
var innerRenderStill = async ({
  composition,
  imageFormat = DEFAULT_STILL_IMAGE_FORMAT,
  serveUrl,
  puppeteerInstance,
  onError,
  serializedInputPropsWithCustomSchema,
  envVariables,
  output,
  frame = 0,
  overwrite,
  browserExecutable,
  timeoutInMilliseconds,
  chromiumOptions,
  scale,
  proxyPort,
  cancelSignal,
  jpegQuality,
  onBrowserLog,
  sourceMapGetter,
  logLevel,
  indent,
  serializedResolvedPropsWithCustomSchema,
  onBrowserDownload,
  onArtifact,
  chromeMode,
  mediaCacheSizeInBytes,
  onLog
}) => {
  validateDimension(composition.height, "height", "in the `config` object passed to `renderStill()`");
  validateDimension(composition.width, "width", "in the `config` object passed to `renderStill()`");
  validateFps(composition.fps, "in the `config` object of `renderStill()`", false);
  validateDurationInFrames(composition.durationInFrames, {
    component: "in the `config` object passed to `renderStill()`",
    allowFloats: false
  });
  validateStillImageFormat(imageFormat);
  NoReactInternals16.validateFrame({
    frame,
    durationInFrames: composition.durationInFrames,
    allowFloats: false
  });
  const stillFrame = convertToPositiveFrameIndex({
    durationInFrames: composition.durationInFrames,
    frame
  });
  validatePuppeteerTimeout(timeoutInMilliseconds);
  validateScale(scale);
  output = typeof output === "string" ? path27.resolve(process.cwd(), output) : null;
  validateJpegQuality(jpegQuality);
  if (output) {
    if (fs18.existsSync(output)) {
      if (!overwrite) {
        throw new Error(`Cannot render still - "overwrite" option was set to false, but the output destination ${output} already exists.`);
      }
      const stat = statSync2(output);
      if (!stat.isFile()) {
        throw new Error(`The output location ${output} already exists, but is not a file, but something else (e.g. folder). Cannot save to it.`);
      }
    }
    ensureOutputDirectory(output);
  }
  const browserInstance = puppeteerInstance ?? await internalOpenBrowser({
    browser: DEFAULT_BROWSER,
    browserExecutable,
    chromiumOptions,
    forceDeviceScaleFactor: scale,
    indent,
    viewport: null,
    logLevel,
    onBrowserDownload,
    chromeMode
  });
  const page = await browserInstance.newPage({
    context: sourceMapGetter,
    logLevel,
    indent,
    pageIndex: 0,
    onBrowserLog,
    onLog
  });
  await page.setViewport({
    width: composition.width,
    height: composition.height,
    deviceScaleFactor: scale
  });
  const errorCallback = (err) => {
    onError(err);
    cleanup();
  };
  const cleanUpJSException = handleJavascriptException({
    page,
    onError: errorCallback,
    frame: null
  });
  const cleanup = async () => {
    cleanUpJSException();
    if (puppeteerInstance) {
      await page.close();
    } else {
      browserInstance.close({ silent: true }).catch((err) => {
        Log.error({ indent, logLevel }, "Unable to close browser", err);
      });
    }
  };
  cancelSignal?.(() => {
    cleanup();
  });
  await setPropsAndEnv({
    serializedInputPropsWithCustomSchema,
    envVariables,
    page,
    serveUrl,
    initialFrame: stillFrame,
    timeoutInMilliseconds,
    proxyPort,
    retriesRemaining: 2,
    audioEnabled: false,
    videoEnabled: true,
    indent,
    logLevel,
    onServeUrlVisited: () => {
      return;
    },
    isMainTab: true,
    mediaCacheSizeInBytes,
    initialMemoryAvailable: getAvailableMemory(logLevel),
    darkMode: chromiumOptions.darkMode ?? false
  });
  await puppeteerEvaluateWithCatch({
    pageFunction: (id, props, durationInFrames, fps, height, width, defaultCodec, defaultOutName, defaultVideoImageFormat, defaultPixelFormat, defaultProResProfile) => {
      window.remotion_setBundleMode({
        type: "composition",
        compositionName: id,
        serializedResolvedPropsWithSchema: props,
        compositionDurationInFrames: durationInFrames,
        compositionFps: fps,
        compositionHeight: height,
        compositionWidth: width,
        compositionDefaultCodec: defaultCodec,
        compositionDefaultOutName: defaultOutName,
        compositionDefaultVideoImageFormat: defaultVideoImageFormat,
        compositionDefaultPixelFormat: defaultPixelFormat,
        compositionDefaultProResProfile: defaultProResProfile
      });
    },
    args: [
      composition.id,
      serializedResolvedPropsWithCustomSchema,
      composition.durationInFrames,
      composition.fps,
      composition.height,
      composition.width,
      composition.defaultCodec,
      composition.defaultOutName,
      composition.defaultVideoImageFormat,
      composition.defaultPixelFormat,
      composition.defaultProResProfile
    ],
    frame: null,
    page,
    timeoutInMilliseconds
  });
  await seekToFrame({
    frame: stillFrame,
    page,
    composition: composition.id,
    timeoutInMilliseconds,
    indent,
    logLevel,
    attempt: 0
  });
  const [buffer, collectedAssets] = await Promise.all([
    takeFrame({
      freePage: page,
      height: composition.height,
      width: composition.width,
      imageFormat,
      scale,
      output,
      jpegQuality,
      wantsBuffer: !output,
      timeoutInMilliseconds
    }),
    collectAssets({
      frame,
      freePage: page,
      timeoutInMilliseconds
    })
  ]);
  const artifactAssets = onlyArtifact({
    assets: collectedAssets,
    frameBuffer: buffer
  });
  const previousArtifactAssets = [];
  for (const artifact of artifactAssets) {
    for (const previousArtifact of previousArtifactAssets) {
      if (artifact.filename === previousArtifact.filename) {
        throw new Error(`An artifact with output "${artifact.filename}" was already registered at frame ${previousArtifact.frame}, but now registered again at frame ${artifact.frame}. Artifacts must have unique names. https://remotion.dev/docs/artifacts`);
      }
    }
    previousArtifactAssets.push(artifact);
    onArtifact?.(artifact);
  }
  await cleanup();
  return {
    buffer: output ? null : buffer,
    contentType: mimeLookup("file." + imageFormat) || "application/octet-stream"
  };
};
var internalRenderStillRaw = (options) => {
  const cleanup = [];
  const happyPath = new Promise((resolve2, reject) => {
    const onError = (err) => reject(err);
    makeOrReuseServer(options.server, {
      webpackConfigOrServeUrl: options.serveUrl,
      port: options.port,
      remotionRoot: findRemotionRoot(),
      offthreadVideoThreads: options.offthreadVideoThreads ?? 2,
      logLevel: options.logLevel,
      indent: options.indent,
      offthreadVideoCacheSizeInBytes: options.offthreadVideoCacheSizeInBytes,
      binariesDirectory: options.binariesDirectory,
      forceIPv4: false
    }, {
      onDownload: options.onDownload
    }).then(({ server, cleanupServer }) => {
      cleanup.push(() => cleanupServer(false));
      const { serveUrl, offthreadPort, sourceMap: sourceMapGetter } = server;
      return innerRenderStill({
        ...options,
        serveUrl,
        onError,
        proxyPort: offthreadPort,
        sourceMapGetter
      });
    }).then((res) => {
      if (options.licenseKey === null) {
        resolve2(res);
        return;
      }
      LicensingInternals2.internalRegisterUsageEvent({
        licenseKey: options.licenseKey,
        event: "cloud-render",
        host: null,
        succeeded: true,
        isStill: true,
        isProduction: options.isProduction ?? true
      }).then(() => {
        Log.verbose(options, "Usage event sent successfully");
      }).catch((err) => {
        Log.error(options, "Failed to send usage event");
        Log.error(options, err);
      }).finally(() => {
        resolve2(res);
      });
    }).catch((err) => reject(err)).finally(() => {
      cleanup.forEach((c) => {
        c().catch((err) => {
          Log.error(options, "Cleanup error:", err);
        });
      });
    });
  });
  return Promise.race([
    happyPath,
    new Promise((_resolve, reject) => {
      options.cancelSignal?.(() => {
        reject(new Error(cancelErrorMessages.renderStill));
      });
    })
  ]);
};
var internalRenderStill = wrapWithErrorHandling(internalRenderStillRaw);
var renderStill = (options) => {
  const {
    composition,
    serveUrl,
    browserExecutable,
    cancelSignal,
    chromiumOptions,
    dumpBrowserLogs,
    envVariables,
    frame,
    imageFormat,
    inputProps,
    jpegQuality,
    onBrowserLog,
    onDownload,
    output,
    overwrite,
    port,
    puppeteerInstance,
    scale,
    timeoutInMilliseconds,
    verbose,
    quality,
    offthreadVideoCacheSizeInBytes,
    logLevel: passedLogLevel,
    binariesDirectory,
    onBrowserDownload,
    onArtifact,
    chromeMode,
    offthreadVideoThreads,
    mediaCacheSizeInBytes,
    apiKey,
    licenseKey,
    isProduction
  } = options;
  if (typeof jpegQuality !== "undefined" && imageFormat !== "jpeg") {
    throw new Error("You can only pass the `quality` option if `imageFormat` is 'jpeg'.");
  }
  const indent = false;
  const logLevel = passedLogLevel ?? (verbose || dumpBrowserLogs ? "verbose" : "info");
  if (quality) {
    Log.warn({ indent, logLevel }, "Passing `quality()` to `renderStill` is deprecated. Use `jpegQuality` instead.");
  }
  return internalRenderStill({
    composition,
    browserExecutable: browserExecutable ?? null,
    cancelSignal: cancelSignal ?? null,
    chromiumOptions: chromiumOptions ?? {},
    envVariables: envVariables ?? {},
    frame: frame ?? 0,
    imageFormat: imageFormat ?? DEFAULT_STILL_IMAGE_FORMAT,
    indent,
    serializedInputPropsWithCustomSchema: NoReactInternals16.serializeJSONWithSpecialTypes({
      staticBase: null,
      indent: undefined,
      data: inputProps ?? {}
    }).serializedString,
    jpegQuality: jpegQuality ?? quality ?? DEFAULT_JPEG_QUALITY,
    onBrowserLog: onBrowserLog ?? null,
    onDownload: onDownload ?? null,
    output: output ?? null,
    overwrite: overwrite ?? DEFAULT_OVERWRITE,
    port: port ?? null,
    puppeteerInstance: puppeteerInstance ?? null,
    scale: scale ?? 1,
    server: undefined,
    serveUrl,
    timeoutInMilliseconds: timeoutInMilliseconds ?? DEFAULT_TIMEOUT,
    logLevel,
    serializedResolvedPropsWithCustomSchema: NoReactInternals16.serializeJSONWithSpecialTypes({
      indent: undefined,
      staticBase: null,
      data: composition.props ?? {}
    }).serializedString,
    offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytes ?? null,
    binariesDirectory: binariesDirectory ?? null,
    onBrowserDownload: onBrowserDownload ?? defaultBrowserDownloadProgress({
      indent,
      logLevel,
      api: "renderStill()"
    }),
    onArtifact: onArtifact ?? null,
    chromeMode: chromeMode ?? "headless-shell",
    offthreadVideoThreads: offthreadVideoThreads ?? null,
    mediaCacheSizeInBytes: mediaCacheSizeInBytes ?? null,
    licenseKey: licenseKey ?? apiKey ?? null,
    onLog: defaultOnLog,
    isProduction: isProduction ?? null
  });
};

// src/select-composition.ts
import { NoReactInternals as NoReactInternals17 } from "remotion/no-react";
var innerSelectComposition = async ({
  page,
  serializedInputPropsWithCustomSchema,
  envVariables,
  serveUrl,
  timeoutInMilliseconds,
  port,
  id,
  indent,
  logLevel,
  onServeUrlVisited,
  mediaCacheSizeInBytes,
  chromiumOptions
}) => {
  validatePuppeteerTimeout(timeoutInMilliseconds);
  await setPropsAndEnv({
    serializedInputPropsWithCustomSchema,
    envVariables,
    page,
    serveUrl,
    initialFrame: 0,
    timeoutInMilliseconds,
    proxyPort: port,
    retriesRemaining: 2,
    audioEnabled: false,
    videoEnabled: false,
    indent,
    logLevel,
    onServeUrlVisited,
    isMainTab: true,
    mediaCacheSizeInBytes,
    initialMemoryAvailable: getAvailableMemory(logLevel),
    darkMode: chromiumOptions.darkMode ?? false
  });
  await puppeteerEvaluateWithCatch({
    page,
    pageFunction: () => {
      window.remotion_setBundleMode({
        type: "evaluation"
      });
    },
    frame: null,
    args: [],
    timeoutInMilliseconds
  });
  await waitForReady({
    page,
    timeoutInMilliseconds,
    frame: null,
    logLevel,
    indent
  });
  Log.verbose({
    indent,
    tag: "selectComposition()",
    logLevel
  }, "Running calculateMetadata()...");
  const time = Date.now();
  const { value: result, size } = await puppeteerEvaluateWithCatch({
    pageFunction: (_id) => {
      return window.remotion_calculateComposition(_id);
    },
    frame: null,
    page,
    args: [id],
    timeoutInMilliseconds
  });
  Log.verbose({
    indent,
    tag: "selectComposition()",
    logLevel
  }, `calculateMetadata() took ${Date.now() - time}ms`);
  const res = result;
  const {
    width,
    durationInFrames,
    fps,
    height,
    defaultCodec,
    defaultOutName,
    defaultVideoImageFormat,
    defaultPixelFormat,
    defaultProResProfile
  } = res;
  return {
    metadata: {
      id,
      width,
      height,
      fps,
      durationInFrames,
      props: NoReactInternals17.deserializeJSONWithSpecialTypes(res.serializedResolvedPropsWithCustomSchema),
      defaultProps: NoReactInternals17.deserializeJSONWithSpecialTypes(res.serializedDefaultPropsWithCustomSchema),
      defaultCodec,
      defaultOutName,
      defaultVideoImageFormat,
      defaultPixelFormat,
      defaultProResProfile
    },
    propsSize: size
  };
};
var internalSelectCompositionRaw = async (options) => {
  const cleanup = [];
  const {
    puppeteerInstance,
    browserExecutable,
    chromiumOptions,
    serveUrl: serveUrlOrWebpackUrl,
    logLevel,
    indent,
    port,
    envVariables,
    id,
    serializedInputPropsWithCustomSchema,
    onBrowserLog,
    server,
    timeoutInMilliseconds,
    offthreadVideoCacheSizeInBytes,
    binariesDirectory,
    onBrowserDownload,
    onServeUrlVisited,
    chromeMode,
    mediaCacheSizeInBytes
  } = options;
  const [{ page, cleanupPage }, serverUsed] = await Promise.all([
    getPageAndCleanupFn({
      passedInInstance: puppeteerInstance,
      browserExecutable,
      chromiumOptions,
      forceDeviceScaleFactor: undefined,
      indent,
      logLevel,
      onBrowserDownload,
      chromeMode,
      pageIndex: 0,
      onBrowserLog,
      onLog: RenderInternals.defaultOnLog
    }),
    makeOrReuseServer(options.server, {
      webpackConfigOrServeUrl: serveUrlOrWebpackUrl,
      port,
      remotionRoot: findRemotionRoot(),
      offthreadVideoThreads: 0,
      logLevel,
      indent,
      offthreadVideoCacheSizeInBytes,
      binariesDirectory,
      forceIPv4: false
    }, {
      onDownload: () => {
        return;
      }
    }).then((result) => {
      cleanup.push(() => result.cleanupServer(true));
      return result;
    })
  ]);
  cleanup.push(() => cleanupPage());
  return new Promise((resolve2, reject) => {
    const onError = (err) => reject(err);
    cleanup.push(handleJavascriptException({
      page,
      frame: null,
      onError
    }));
    page.setBrowserSourceMapGetter(serverUsed.server.sourceMap);
    innerSelectComposition({
      serveUrl: serverUsed.server.serveUrl,
      page,
      port: serverUsed.server.offthreadPort,
      browserExecutable,
      chromiumOptions,
      envVariables,
      id,
      serializedInputPropsWithCustomSchema,
      timeoutInMilliseconds,
      logLevel,
      indent,
      puppeteerInstance,
      server,
      offthreadVideoCacheSizeInBytes,
      binariesDirectory,
      onBrowserDownload,
      onServeUrlVisited,
      chromeMode,
      mediaCacheSizeInBytes
    }).then((data) => {
      return resolve2(data);
    }).catch((err) => {
      reject(err);
    }).finally(() => {
      cleanup.forEach((c) => {
        c().catch((err) => {
          Log.error({ indent, logLevel }, "Cleanup error:", err);
        });
      });
    });
  });
};
var internalSelectComposition = wrapWithErrorHandling(internalSelectCompositionRaw);
var selectComposition = async (options) => {
  const {
    id,
    serveUrl,
    browserExecutable,
    chromiumOptions,
    envVariables,
    inputProps,
    onBrowserLog,
    port,
    puppeteerInstance,
    timeoutInMilliseconds,
    verbose,
    logLevel: passedLogLevel,
    offthreadVideoCacheSizeInBytes,
    binariesDirectory,
    onBrowserDownload,
    chromeMode,
    offthreadVideoThreads,
    mediaCacheSizeInBytes
  } = options;
  const indent = false;
  const logLevel = passedLogLevel ?? (verbose ? "verbose" : "info");
  const data = await internalSelectComposition({
    id,
    serveUrl,
    browserExecutable: browserExecutable ?? null,
    chromiumOptions: chromiumOptions ?? {},
    envVariables: envVariables ?? {},
    serializedInputPropsWithCustomSchema: NoReactInternals17.serializeJSONWithSpecialTypes({
      indent: undefined,
      staticBase: null,
      data: inputProps ?? {}
    }).serializedString,
    onBrowserLog: onBrowserLog ?? null,
    port: port ?? null,
    puppeteerInstance,
    timeoutInMilliseconds: timeoutInMilliseconds ?? DEFAULT_TIMEOUT,
    logLevel,
    indent,
    server: undefined,
    offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytes ?? null,
    binariesDirectory: binariesDirectory ?? null,
    onBrowserDownload: onBrowserDownload ?? defaultBrowserDownloadProgress({
      indent,
      logLevel,
      api: "selectComposition()"
    }),
    onServeUrlVisited: () => {
      return;
    },
    chromeMode: chromeMode ?? "headless-shell",
    offthreadVideoThreads: offthreadVideoThreads ?? null,
    mediaCacheSizeInBytes: mediaCacheSizeInBytes ?? null
  });
  return data.metadata;
};

// src/test-gpu.ts
var getChromiumGpuInformation = async ({
  browserExecutable,
  indent,
  logLevel,
  chromiumOptions,
  timeoutInMilliseconds,
  onBrowserDownload,
  chromeMode,
  onLog
}) => {
  const { page, cleanupPage: cleanup } = await getPageAndCleanupFn({
    passedInInstance: undefined,
    browserExecutable,
    chromiumOptions,
    forceDeviceScaleFactor: undefined,
    indent,
    logLevel,
    onBrowserDownload,
    chromeMode,
    pageIndex: 0,
    onBrowserLog: null,
    onLog
  });
  await page.goto({ url: "chrome://gpu", timeout: 12000 });
  const { value } = await puppeteerEvaluateWithCatch({
    pageFunction: () => {
      const statuses = [];
      const items = document.querySelector("info-view")?.shadowRoot?.querySelector("ul")?.querySelectorAll("li");
      [].forEach.call(items, (item) => {
        const [feature, status] = item.innerText.split(": ");
        statuses.push({
          feature,
          status
        });
      });
      return statuses;
    },
    frame: null,
    args: [],
    page,
    timeoutInMilliseconds
  });
  cleanup();
  return value;
};

// src/validate-concurrency.ts
var validateConcurrency = ({
  setting,
  value,
  checkIfValidForCurrentMachine
}) => {
  if (typeof value === "undefined") {
    return;
  }
  if (value === null) {
    return;
  }
  if (typeof value !== "number" && typeof value !== "string") {
    throw new Error(setting + " must a number or a string but is " + value);
  }
  if (typeof value === "number") {
    if (value % 1 !== 0) {
      throw new Error(setting + " must be an integer, but is " + value);
    }
    if (checkIfValidForCurrentMachine) {
      if (value < getMinConcurrency()) {
        throw new Error(`${setting} must be at least ${getMinConcurrency()}, but is ${JSON.stringify(value)}`);
      }
      if (value > getMaxConcurrency()) {
        throw new Error(`${setting} is set higher than the amount of CPU cores available. Available CPU cores: ${getMaxConcurrency()}, value set: ${value}`);
      }
    }
  } else if (!/^\d+(\.\d+)?%$/.test(value)) {
    throw new Error(`${setting} must be a number or percentage, but is ${JSON.stringify(value)}`);
  }
};
var getMaxConcurrency = () => {
  return getCpuCount();
};
var getMinConcurrency = () => 1;

// src/combine-chunks.ts
import { rmSync as rmSync6 } from "node:fs";
import { join as join5 } from "node:path";

// src/can-concat-seamlessly.ts
var canConcatAudioSeamlessly = (audioCodec, chunkDurationInFrames) => {
  if (chunkDurationInFrames <= 4) {
    return false;
  }
  return audioCodec === "aac";
};
var canConcatVideoSeamlessly = (codec) => {
  return codec === "h264";
};

// src/combine-video-streams.ts
import { rmSync as rmSync5, writeFileSync as writeFileSync3 } from "fs";
import { join as join4 } from "path";
import { VERSION as VERSION6 } from "remotion/version";
var combineVideoStreams = async ({
  fps,
  codec,
  filelistDir,
  numberOfGifLoops,
  output,
  indent,
  logLevel,
  onProgress,
  files,
  addRemotionMetadata,
  binariesDirectory,
  cancelSignal
}) => {
  const fileList = files.map((p) => `file '${p}'`).join(`
`);
  const fileListTxt = join4(filelistDir, "video-files.txt");
  writeFileSync3(fileListTxt, fileList);
  const encoder = codec === "gif" ? "gif" : "copy";
  const command = [
    "-hide_banner",
    "-r",
    String(fps),
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    fileListTxt,
    numberOfGifLoops === null ? null : "-loop",
    numberOfGifLoops === null ? null : convertNumberOfGifLoopsToFfmpegSyntax(numberOfGifLoops),
    codec === "gif" ? "-filter_complex" : null,
    codec === "gif" ? "split[v],palettegen,[v]paletteuse" : null,
    "-an",
    "-c:v",
    encoder,
    codec === "h265" ? "-tag:v" : null,
    codec === "h265" ? "hvc1" : null,
    addRemotionMetadata ? `-metadata` : null,
    addRemotionMetadata ? `comment=Made with Remotion ${VERSION6}` : null,
    "-y",
    output
  ].filter(truthy);
  const doesReencode = encoder !== "copy";
  const startTime = Date.now();
  Log.verbose({ indent, logLevel }, `Combining video ${doesReencode ? "with reencoding" : "without reencoding"}, command: ${command.join(" ")}`);
  try {
    const task = callFf({
      args: command,
      bin: "ffmpeg",
      indent,
      logLevel,
      binariesDirectory,
      cancelSignal
    });
    task.stderr?.on("data", (data) => {
      const parsed = parseFfmpegProgress(data.toString("utf8"), fps);
      if (parsed === undefined) {
        Log.verbose({ indent, logLevel }, data.toString("utf8"));
      } else {
        Log.verbose({ indent, logLevel }, `Encoded ${parsed} video frames`);
        onProgress(parsed);
      }
    });
    await task;
    Log.verbose({ indent, logLevel }, `Finished combining video in ${Date.now() - startTime}ms`);
    return output;
  } catch (e) {
    rmSync5(fileListTxt, { recursive: true });
    throw e;
  }
};

// src/combine-video-streams-seamlessly.ts
var combineVideoStreamsSeamlessly = ({ files }) => {
  const fileList = `concat:${files.join("|")}`;
  return fileList;
};

// src/mux-video-and-audio.ts
var muxVideoAndAudio = async ({
  videoOutput,
  audioOutput,
  output,
  indent,
  logLevel,
  onProgress,
  binariesDirectory,
  fps,
  cancelSignal,
  addFaststart,
  metadata,
  numberOfGifLoops
}) => {
  const startTime = Date.now();
  Log.verbose({ indent, logLevel }, "Muxing video and audio together");
  const command = [
    "-hide_banner",
    videoOutput ? "-i" : null,
    videoOutput,
    audioOutput ? "-i" : null,
    audioOutput,
    videoOutput ? "-c:v" : null,
    videoOutput ? "copy" : null,
    audioOutput ? "-c:a" : null,
    audioOutput ? "copy" : null,
    numberOfGifLoops === null ? null : "-loop",
    numberOfGifLoops === null ? null : convertNumberOfGifLoopsToFfmpegSyntax(numberOfGifLoops),
    addFaststart ? "-movflags" : null,
    addFaststart ? "faststart" : null,
    ...makeMetadataArgs(metadata ?? {}),
    "-y",
    output
  ].filter(truthy);
  Log.verbose({ indent, logLevel }, "Combining command: ", command);
  const task = callFf({
    bin: "ffmpeg",
    args: command,
    indent,
    logLevel,
    binariesDirectory,
    cancelSignal
  });
  task.stderr?.on("data", (data) => {
    const utf8 = data.toString("utf8");
    const parsed = parseFfmpegProgress(utf8, fps);
    if (parsed === undefined) {
      if (!utf8.includes("Estimating duration from bitrate, this may be inaccurate")) {
        Log.verbose({ indent, logLevel }, utf8);
      }
    } else {
      Log.verbose({ indent, logLevel }, `Combined ${parsed} frames`);
      onProgress(parsed);
    }
  });
  await task;
  Log.verbose({ indent, logLevel }, `Muxing done in ${Date.now() - startTime}ms`);
};

// src/combine-chunks.ts
var codecSupportsFastStart = {
  "h264-mkv": false,
  "h264-ts": false,
  h264: true,
  h265: true,
  aac: false,
  gif: false,
  mp3: false,
  prores: false,
  vp8: false,
  vp9: false,
  wav: false
};
var REMOTION_FILELIST_TOKEN = "remotion-filelist";
var internalCombineChunks = async ({
  outputLocation: output,
  onProgress,
  codec,
  fps,
  numberOfGifLoops,
  audioBitrate,
  indent,
  logLevel,
  binariesDirectory,
  cancelSignal,
  metadata,
  audioFiles,
  videoFiles,
  framesPerChunk,
  audioCodec,
  preferLossless,
  everyNthFrame,
  frameRange,
  compositionDurationInFrames
}) => {
  validateNumberOfGifLoops(numberOfGifLoops, codec);
  const filelistDir = tmpDir(REMOTION_FILELIST_TOKEN);
  const shouldCreateVideo = !isAudioCodec(codec);
  const resolvedAudioCodec = resolveAudioCodec({
    setting: audioCodec,
    codec,
    preferLossless,
    separateAudioTo: null
  });
  const shouldCreateAudio = resolvedAudioCodec !== null && audioFiles.length > 0;
  const seamlessVideo = canConcatVideoSeamlessly(codec);
  const seamlessAudio = canConcatAudioSeamlessly(resolvedAudioCodec, framesPerChunk);
  const realFrameRange = getRealFrameRange(compositionDurationInFrames, frameRange);
  const numberOfFrames = getFramesToRender(realFrameRange, everyNthFrame).length;
  const videoOutput = shouldCreateVideo ? join5(filelistDir, `video.${getFileExtensionFromCodec(codec, resolvedAudioCodec)}`) : null;
  const audioOutput = shouldCreateAudio ? join5(filelistDir, `audio.${getExtensionFromAudioCodec(resolvedAudioCodec)}`) : null;
  const chunkDurationInSeconds = framesPerChunk / fps;
  let concatenatedAudio = 0;
  let concatenatedVideo = 0;
  let muxing = 0;
  const updateProgress = () => {
    const totalFrames = (shouldCreateAudio ? numberOfFrames : 0) + (shouldCreateVideo ? numberOfFrames : 0) + numberOfFrames;
    const actualProgress = concatenatedAudio + concatenatedVideo + muxing;
    onProgress({
      frames: actualProgress / totalFrames * numberOfFrames,
      totalProgress: actualProgress / totalFrames
    });
  };
  Log.verbose({ indent, logLevel }, `Combining chunks, audio = ${shouldCreateAudio === false ? "no" : seamlessAudio ? "seamlessly" : "normally"}, video = ${shouldCreateVideo === false ? "no" : seamlessVideo ? "seamlessly" : "normally"}`);
  await Promise.all([
    shouldCreateAudio && audioOutput ? createCombinedAudio({
      audioBitrate,
      filelistDir,
      files: audioFiles,
      indent,
      logLevel,
      output: audioOutput,
      resolvedAudioCodec,
      seamless: seamlessAudio,
      chunkDurationInSeconds,
      addRemotionMetadata: !shouldCreateVideo,
      binariesDirectory,
      fps,
      cancelSignal,
      onProgress: (frames) => {
        concatenatedAudio = frames;
        updateProgress();
      }
    }) : null,
    shouldCreateVideo && !seamlessVideo && videoOutput ? combineVideoStreams({
      codec,
      filelistDir,
      fps,
      indent,
      logLevel,
      numberOfGifLoops,
      output: videoOutput,
      files: videoFiles,
      addRemotionMetadata: !shouldCreateAudio,
      binariesDirectory,
      cancelSignal,
      onProgress: (frames) => {
        concatenatedVideo = frames;
        updateProgress();
      }
    }) : null
  ].filter(truthy));
  try {
    await muxVideoAndAudio({
      audioOutput,
      indent,
      logLevel,
      onProgress: (frames) => {
        muxing = frames;
        updateProgress();
      },
      output,
      videoOutput: seamlessVideo ? combineVideoStreamsSeamlessly({ files: videoFiles }) : videoOutput,
      binariesDirectory,
      fps,
      cancelSignal,
      addFaststart: codecSupportsFastStart[codec],
      metadata,
      numberOfGifLoops
    });
    onProgress({ totalProgress: 1, frames: numberOfFrames });
    rmSync6(filelistDir, { recursive: true });
  } catch (err) {
    rmSync6(filelistDir, { recursive: true });
    throw err;
  }
};
var combineChunks = (options) => {
  return internalCombineChunks({
    audioBitrate: options.audioBitrate ?? null,
    numberOfGifLoops: options.numberOfGifLoops ?? null,
    indent: false,
    logLevel: options.logLevel ?? "info",
    binariesDirectory: options.binariesDirectory ?? null,
    cancelSignal: options.cancelSignal,
    metadata: options.metadata ?? null,
    audioCodec: options.audioCodec ?? null,
    preferLossless: options.preferLossless,
    audioFiles: options.audioFiles,
    codec: options.codec,
    fps: options.fps,
    framesPerChunk: options.framesPerChunk,
    outputLocation: options.outputLocation,
    onProgress: options.onProgress ?? (() => {}),
    videoFiles: options.videoFiles,
    everyNthFrame: options.everyNthFrame ?? 1,
    frameRange: options.frameRange ?? null,
    compositionDurationInFrames: options.compositionDurationInFrames
  });
};
// src/extract-audio.ts
var extractAudio = async (options) => {
  const compositor = startLongRunningCompositor({
    maximumFrameCacheItemsInBytes: null,
    logLevel: options?.logLevel ?? "info",
    indent: false,
    binariesDirectory: options.binariesDirectory ?? null,
    extraThreads: 0
  });
  await compositor.executeCommand("ExtractAudio", {
    input_path: options.videoSource,
    output_path: options.audioOutput
  });
  await compositor.finishCommands();
  await compositor.waitForDone();
};
// src/get-silent-parts.ts
var getSilentParts = async ({
  src,
  noiseThresholdInDecibels: passedNoiseThresholdInDecibels,
  minDurationInSeconds: passedMinDuration,
  logLevel,
  binariesDirectory
}) => {
  const compositor = startLongRunningCompositor({
    maximumFrameCacheItemsInBytes: null,
    logLevel: logLevel ?? "info",
    indent: false,
    binariesDirectory: binariesDirectory ?? null,
    extraThreads: 0
  });
  const minDurationInSeconds = passedMinDuration ?? 1;
  if (typeof minDurationInSeconds !== "number") {
    throw new Error(`minDurationInSeconds must be a number, but was ${minDurationInSeconds}`);
  }
  if (minDurationInSeconds <= 0) {
    throw new Error(`minDurationInSeconds must be greater than 0, but was ${minDurationInSeconds}`);
  }
  const noiseThresholdInDecibels = passedNoiseThresholdInDecibels ?? -20;
  if (typeof noiseThresholdInDecibels !== "number") {
    throw new Error(`noiseThresholdInDecibels must be a number, but was ${noiseThresholdInDecibels}`);
  }
  if (noiseThresholdInDecibels >= 30) {
    throw new Error(`noiseThresholdInDecibels must be less than 30, but was ${noiseThresholdInDecibels}`);
  }
  const res = await compositor.executeCommand("GetSilences", {
    src,
    minDurationInSeconds,
    noiseThresholdInDecibels
  });
  const response = JSON.parse(new TextDecoder("utf-8").decode(res));
  await compositor.finishCommands();
  await compositor.waitForDone();
  const { silentParts, durationInSeconds } = response;
  return {
    silentParts,
    audibleParts: getAudibleParts({ silentParts, durationInSeconds }),
    durationInSeconds
  };
};
var getAudibleParts = ({
  silentParts,
  durationInSeconds
}) => {
  const audibleParts = [];
  let lastEnd = 0;
  for (const silentPart of silentParts) {
    if (silentPart.startInSeconds - lastEnd > 0) {
      audibleParts.push({
        startInSeconds: lastEnd,
        endInSeconds: silentPart.startInSeconds
      });
    }
    lastEnd = silentPart.endInSeconds;
  }
  if (durationInSeconds - lastEnd > 0) {
    audibleParts.push({
      startInSeconds: lastEnd,
      endInSeconds: durationInSeconds
    });
  }
  return audibleParts;
};
// src/get-video-metadata.ts
import { resolve as resolve2 } from "node:path";
var getVideoMetadata = async (videoSource, options) => {
  const compositor = startLongRunningCompositor({
    maximumFrameCacheItemsInBytes: null,
    logLevel: options?.logLevel ?? "info",
    indent: false,
    binariesDirectory: options?.binariesDirectory ?? null,
    extraThreads: 0
  });
  const metadataResponse = await compositor.executeCommand("GetVideoMetadata", {
    src: resolve2(process.cwd(), videoSource)
  });
  await compositor.finishCommands();
  await compositor.waitForDone();
  return JSON.parse(new TextDecoder("utf-8").decode(metadataResponse));
};
// src/index.ts
var RenderInternals = {
  resolveConcurrency,
  serveStatic,
  validateEvenDimensionsWithCodec,
  getFileExtensionFromCodec,
  tmpDir,
  deleteDirectory,
  isServeUrl,
  ensureOutputDirectory,
  getRealFrameRange,
  validatePuppeteerTimeout,
  downloadFile,
  parseStack,
  symbolicateError,
  SymbolicateableError,
  getFramesToRender,
  getExtensionOfFilename,
  getDesiredPort,
  isPathInside,
  execa: execa2,
  registerErrorSymbolicationLock,
  unlockErrorSymbolicationLock,
  canUseParallelEncoding,
  mimeContentType,
  mimeLookup,
  validateConcurrency,
  validPixelFormats,
  DEFAULT_BROWSER,
  validateFrameRange,
  DEFAULT_OPENGL_RENDERER,
  validateOpenGlRenderer,
  validCodecs,
  DEFAULT_PIXEL_FORMAT,
  validateJpegQuality,
  DEFAULT_TIMEOUT,
  DEFAULT_CODEC,
  logLevels,
  isEqualOrBelowLogLevel,
  isValidLogLevel,
  perf: exports_perf,
  convertToPositiveFrameIndex,
  findRemotionRoot,
  validateBitrate,
  getMinConcurrency,
  getMaxConcurrency,
  getDefaultAudioCodec,
  defaultFileExtensionMap,
  supportedAudioCodecs,
  makeFileExtensionMap,
  defaultCodecsForFileExtension,
  getExecutablePath,
  callFf,
  validStillImageFormats,
  validVideoImageFormats,
  DEFAULT_STILL_IMAGE_FORMAT,
  DEFAULT_VIDEO_IMAGE_FORMAT,
  DEFAULT_JPEG_QUALITY,
  chalk,
  Log,
  INDENT_TOKEN,
  isColorSupported,
  HeadlessBrowser,
  prepareServer,
  makeOrReuseServer,
  internalRenderStill,
  internalOpenBrowser,
  internalSelectComposition,
  internalGetCompositions,
  internalRenderFrames,
  internalRenderMedia,
  validOpenGlRenderers,
  isIpV6Supported,
  getChromiumGpuInformation,
  getPortConfig,
  makeDownloadMap,
  getExtensionFromAudioCodec,
  makeFileExecutableIfItIsNot,
  resolveAudioCodec,
  getShouldRenderAudio,
  codecSupportsMedia,
  toMegabytes,
  internalEnsureBrowser,
  printUsefulErrorMessage,
  DEFAULT_RENDER_FRAMES_OFFTHREAD_VIDEO_THREADS,
  canConcatVideoSeamlessly,
  canConcatAudioSeamlessly,
  internalCombineChunks,
  defaultOnLog
};
checkRuntimeVersion("info", false);
export {
  validateSelectedPixelFormatAndImageFormatCombination,
  validateOutputFilename,
  stitchFramesToVideo,
  selectComposition,
  renderStill,
  renderMedia,
  renderFrames,
  openBrowser,
  makeCancelSignal,
  getVideoMetadata,
  getSilentParts,
  getCompositions,
  extractAudio,
  ensureBrowser,
  combineChunks,
  RenderInternals,
  ErrorWithStackFrame
};
