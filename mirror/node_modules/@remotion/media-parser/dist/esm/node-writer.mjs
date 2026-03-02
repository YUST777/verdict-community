// src/writers/node.ts
import fs from "node:fs";

// src/log.ts
var logLevels = ["trace", "verbose", "info", "warn", "error"];
var getNumberForLogLevel = (level) => {
  return logLevels.indexOf(level);
};
var isEqualOrBelowLogLevel = (currentLevel, level) => {
  return getNumberForLogLevel(currentLevel) <= getNumberForLogLevel(level);
};
var Log = {
  trace: (logLevel, ...args) => {
    if (isEqualOrBelowLogLevel(logLevel, "trace")) {
      return console.log(...args);
    }
  },
  verbose: (logLevel, ...args) => {
    if (isEqualOrBelowLogLevel(logLevel, "verbose")) {
      return console.log(...args);
    }
  },
  info: (logLevel, ...args) => {
    if (isEqualOrBelowLogLevel(logLevel, "info")) {
      return console.log(...args);
    }
  },
  warn: (logLevel, ...args) => {
    if (isEqualOrBelowLogLevel(logLevel, "warn")) {
      return console.warn(...args);
    }
  },
  error: (...args) => {
    return console.error(...args);
  }
};

// src/writers/node.ts
var createContent = (filename) => {
  return async ({ logLevel }) => {
    let writPromise = Promise.resolve();
    const remove = async () => {
      Log.verbose(logLevel, "Removing file", filename);
      await fs.promises.unlink(filename).catch(() => {});
    };
    await remove();
    if (!fs.existsSync(filename)) {
      Log.verbose(logLevel, "Creating file", filename);
      fs.writeFileSync(filename, "");
    }
    const writeStream = fs.openSync(filename, "w");
    let written = 0;
    const write = async (data) => {
      await new Promise((resolve, reject) => {
        fs.write(writeStream, data, 0, data.length, undefined, (err) => {
          if (err) {
            reject(err);
            return;
          }
          Log.verbose(logLevel, "Wrote", data.length, "bytes to", filename);
          resolve();
        });
      });
      written += data.byteLength;
    };
    const updateDataAt = (position, data) => {
      return new Promise((resolve, reject) => {
        fs.write(writeStream, data, 0, data.length, position, (err) => {
          if (err) {
            reject(err);
            return;
          }
          Log.verbose(logLevel, "Wrote", data.length, "bytes to", filename, "at position", position);
          resolve();
        });
      });
    };
    const writer = {
      write: (arr) => {
        writPromise = writPromise.then(() => write(arr));
        return writPromise;
      },
      updateDataAt: (position, data) => {
        writPromise = writPromise.then(() => updateDataAt(position, data));
        return writPromise;
      },
      getWrittenByteCount: () => written,
      remove,
      finish: async () => {
        await writPromise;
        try {
          Log.verbose(logLevel, "Closing file", filename);
          fs.closeSync(writeStream);
          return Promise.resolve();
        } catch (e) {
          return Promise.reject(e);
        }
      },
      getBlob: async () => {
        const file = await fs.promises.readFile(filename);
        return new Blob([file]);
      }
    };
    return writer;
  };
};
var nodeWriter = (path) => {
  return { createContent: createContent(path) };
};
export {
  nodeWriter
};
