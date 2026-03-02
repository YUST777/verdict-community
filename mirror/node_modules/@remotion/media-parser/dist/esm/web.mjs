// src/errors.ts
class MediaParserAbortError extends Error {
  constructor(message) {
    super(message);
    this.name = "MediaParserAbortError";
    this.cause = undefined;
  }
}

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

// src/readers/fetch/get-body-and-reader.ts
var getLengthAndReader = async ({
  canLiveWithoutContentLength,
  res,
  ownController,
  requestedWithoutRange
}) => {
  const length = res.headers.get("content-length");
  const contentLength = length === null ? null : parseInt(length, 10);
  if (requestedWithoutRange || canLiveWithoutContentLength && contentLength === null) {
    const buffer = await res.arrayBuffer();
    const encoded = new Uint8Array(buffer);
    let streamCancelled = false;
    const stream = new ReadableStream({
      start(controller) {
        if (ownController.signal.aborted) {
          return;
        }
        if (streamCancelled) {
          return;
        }
        try {
          controller.enqueue(encoded);
          controller.close();
        } catch {}
      },
      cancel() {
        streamCancelled = true;
      }
    });
    return {
      contentLength: encoded.byteLength,
      reader: {
        reader: stream.getReader(),
        abort: () => {
          ownController.abort();
          return Promise.resolve();
        }
      },
      needsContentRange: false
    };
  }
  if (!res.body) {
    throw new Error("No body");
  }
  const reader = res.body.getReader();
  return {
    reader: {
      reader,
      abort: () => {
        ownController.abort();
        return Promise.resolve();
      }
    },
    contentLength,
    needsContentRange: true
  };
};

// src/readers/fetch/resolve-url.ts
var resolveUrl = (src) => {
  try {
    const resolvedUrl = typeof window !== "undefined" && typeof window.location !== "undefined" ? new URL(src, window.location.origin) : new URL(src);
    return resolvedUrl;
  } catch {
    return src;
  }
};

// src/readers/from-fetch.ts
function parseContentRange(input) {
  const matches = input.match(/^(\w+) ((\d+)-(\d+)|\*)\/(\d+|\*)$/);
  if (!matches)
    return null;
  const [, unit, , start, end, size] = matches;
  const range = {
    unit,
    start: start != null ? Number(start) : null,
    end: end != null ? Number(end) : null,
    size: size === "*" ? null : Number(size)
  };
  if (range.start === null && range.end === null && range.size === null) {
    return null;
  }
  return range;
}
var validateContentRangeAndDetectIfSupported = ({
  requestedRange,
  parsedContentRange,
  statusCode
}) => {
  if (statusCode === 206) {
    return { supportsContentRange: true };
  }
  if (typeof requestedRange === "number" && parsedContentRange?.start !== requestedRange) {
    if (requestedRange === 0) {
      return { supportsContentRange: false };
    }
    throw new Error(`Range header (${requestedRange}) does not match content-range header (${parsedContentRange?.start})`);
  }
  if (requestedRange !== null && typeof requestedRange !== "number" && (parsedContentRange?.start !== requestedRange[0] || parsedContentRange?.end !== requestedRange[1])) {
    throw new Error(`Range header (${requestedRange}) does not match content-range header (${parsedContentRange?.start})`);
  }
  return { supportsContentRange: true };
};
var makeFetchRequest = async ({
  range,
  src,
  controller
}) => {
  const resolvedUrl = resolveUrl(src);
  const resolvedUrlString = resolvedUrl.toString();
  if (!resolvedUrlString.startsWith("https://") && !resolvedUrlString.startsWith("blob:") && !resolvedUrlString.startsWith("data:") && !resolvedUrlString.startsWith("http://")) {
    return Promise.reject(new Error(`${resolvedUrlString} is not a URL - needs to start with http:// or https:// or blob:. If you want to read a local file, pass \`reader: nodeReader\` to parseMedia().`));
  }
  const ownController = new AbortController;
  const cache = typeof navigator !== "undefined" && navigator.userAgent.includes("Cloudflare-Workers") ? undefined : "no-store";
  const requestedRange = range === null ? 0 : range;
  const asString = typeof resolvedUrl === "string" ? resolvedUrl : resolvedUrl.pathname;
  const requestWithoutRange = asString.endsWith(".m3u8");
  const canLiveWithoutContentLength = asString.endsWith(".m3u8") || asString.endsWith(".ts");
  const headers = requestedRange === 0 && requestWithoutRange ? {} : typeof requestedRange === "number" ? {
    Range: `bytes=${requestedRange}-`
  } : {
    Range: `bytes=${`${requestedRange[0]}-${requestedRange[1]}`}`
  };
  const res = await fetch(resolvedUrl, {
    headers,
    signal: ownController.signal,
    cache
  });
  const contentRange = res.headers.get("content-range");
  const parsedContentRange = contentRange ? parseContentRange(contentRange) : null;
  if (!res.ok) {
    throw new Error(`Server returned status code ${res.status} for ${resolvedUrl} and range ${requestedRange}`);
  }
  const { supportsContentRange } = validateContentRangeAndDetectIfSupported({
    requestedRange,
    parsedContentRange,
    statusCode: res.status
  });
  if (controller) {
    controller._internals.signal.addEventListener("abort", () => {
      ownController.abort(new MediaParserAbortError("Aborted by user"));
    }, { once: true });
  }
  const contentDisposition = res.headers.get("content-disposition");
  const name = contentDisposition?.match(/filename="([^"]+)"/)?.[1];
  const { contentLength, needsContentRange, reader } = await getLengthAndReader({
    canLiveWithoutContentLength,
    res,
    ownController,
    requestedWithoutRange: requestWithoutRange
  });
  const contentType = res.headers.get("content-type");
  return {
    contentLength,
    needsContentRange,
    reader,
    name,
    contentType,
    supportsContentRange
  };
};
var cacheKey = ({
  src,
  range
}) => {
  return `${src}-${JSON.stringify(range)}`;
};
var makeFetchRequestOrGetCached = ({
  range,
  src,
  controller,
  logLevel,
  prefetchCache
}) => {
  const key = cacheKey({ src, range });
  const cached = prefetchCache.get(key);
  if (cached) {
    Log.verbose(logLevel, `Reading from preload cache for ${key}`);
    return cached;
  }
  Log.verbose(logLevel, `Fetching ${key}`);
  const result = makeFetchRequest({ range, src, controller });
  prefetchCache.set(key, result);
  return result;
};
var fetchReadContent = async ({
  src,
  range,
  controller,
  logLevel,
  prefetchCache
}) => {
  if (typeof src !== "string" && src instanceof URL === false) {
    throw new Error("src must be a string when using `fetchReader`");
  }
  const fallbackName = src.toString().split("/").pop();
  const res = makeFetchRequestOrGetCached({
    range,
    src,
    controller,
    logLevel,
    prefetchCache
  });
  const key = cacheKey({ src, range });
  prefetchCache.delete(key);
  const {
    reader,
    contentLength,
    needsContentRange,
    name,
    supportsContentRange,
    contentType
  } = await res;
  if (controller) {
    controller._internals.signal.addEventListener("abort", () => {
      reader.reader.cancel().catch(() => {});
    }, { once: true });
  }
  return {
    reader,
    contentLength,
    contentType,
    name: name ?? fallbackName,
    supportsContentRange,
    needsContentRange
  };
};
var fetchPreload = ({
  src,
  range,
  logLevel,
  prefetchCache
}) => {
  if (typeof src !== "string" && src instanceof URL === false) {
    throw new Error("src must be a string when using `fetchReader`");
  }
  const key = cacheKey({ src, range });
  if (prefetchCache.has(key)) {
    return prefetchCache.get(key);
  }
  makeFetchRequestOrGetCached({
    range,
    src,
    controller: null,
    logLevel,
    prefetchCache
  });
};
var fetchReadWholeAsText = async (src) => {
  if (typeof src !== "string" && src instanceof URL === false) {
    throw new Error("src must be a string when using `fetchReader`");
  }
  const res = await fetch(src);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${src} (HTTP code: ${res.status})`);
  }
  return res.text();
};
var fetchCreateAdjacentFileSource = (relativePath, src) => {
  if (typeof src !== "string" && src instanceof URL === false) {
    throw new Error("src must be a string or URL when using `fetchReader`");
  }
  return new URL(relativePath, src).toString();
};

// src/readers/from-web-file.ts
var webFileReadContent = ({ src, range, controller }) => {
  if (typeof src === "string" || src instanceof URL) {
    throw new Error("`inputTypeFileReader` only supports `File` objects");
  }
  const part = range === null ? src : typeof range === "number" ? src.slice(range) : src.slice(range[0], range[1] + 1);
  const stream = part.stream();
  const streamReader = stream.getReader();
  if (controller) {
    controller._internals.signal.addEventListener("abort", () => {
      streamReader.cancel();
    }, { once: true });
  }
  return Promise.resolve({
    reader: {
      reader: streamReader,
      async abort() {
        try {
          await streamReader.cancel();
        } catch {}
        return Promise.resolve();
      }
    },
    contentLength: src.size,
    name: src instanceof File ? src.name : src.toString(),
    supportsContentRange: true,
    contentType: src.type,
    needsContentRange: true
  });
};
var webFileReadWholeAsText = () => {
  throw new Error("`webFileReader` cannot read auxiliary files.");
};
var webFileCreateAdjacentFileSource = () => {
  throw new Error("`webFileReader` cannot create adjacent file sources.");
};

// src/readers/web.ts
var webReader = {
  read: (params) => {
    if (params.src instanceof Blob) {
      return webFileReadContent(params);
    }
    return fetchReadContent(params);
  },
  createAdjacentFileSource: (relativePath, src) => {
    if (src instanceof Blob) {
      return webFileCreateAdjacentFileSource(relativePath, src);
    }
    return fetchCreateAdjacentFileSource(relativePath, src);
  },
  readWholeAsText: (src) => {
    if (src instanceof Blob) {
      return webFileReadWholeAsText(src);
    }
    return fetchReadWholeAsText(src);
  },
  preload: ({ range, src, logLevel, prefetchCache }) => {
    if (src instanceof Blob) {
      return;
    }
    return fetchPreload({ range, src, logLevel, prefetchCache });
  }
};
export {
  webReader
};
