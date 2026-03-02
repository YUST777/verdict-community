// src/errors.ts
class IsAnImageError extends Error {
  imageType;
  dimensions;
  mimeType;
  sizeInBytes;
  fileName;
  constructor({
    dimensions,
    imageType,
    message,
    mimeType,
    sizeInBytes,
    fileName
  }) {
    super(message);
    this.name = "IsAnImageError";
    this.imageType = imageType;
    this.dimensions = dimensions;
    this.mimeType = mimeType;
    this.sizeInBytes = sizeInBytes;
    this.fileName = fileName;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, IsAnImageError);
    }
  }
}

class IsAPdfError extends Error {
  mimeType;
  sizeInBytes;
  fileName;
  constructor({
    message,
    mimeType,
    sizeInBytes,
    fileName
  }) {
    super(message);
    this.name = "IsAPdfError";
    this.mimeType = mimeType;
    this.sizeInBytes = sizeInBytes;
    this.fileName = fileName;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, IsAPdfError);
    }
  }
}

class IsAnUnsupportedFileTypeError extends Error {
  mimeType;
  sizeInBytes;
  fileName;
  constructor({
    message,
    mimeType,
    sizeInBytes,
    fileName
  }) {
    super(message);
    this.name = "IsAnUnsupportedFileTypeError";
    this.mimeType = mimeType;
    this.sizeInBytes = sizeInBytes;
    this.fileName = fileName;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, IsAnUnsupportedFileTypeError);
    }
  }
}

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

// src/readers/from-node.ts
import { createReadStream, existsSync, promises, statSync } from "fs";
import { dirname, join, relative, sep } from "path";
var nodeReadContent = async ({
  src,
  range,
  controller
}) => {
  if (typeof src !== "string") {
    throw new Error("src must be a string when using `nodeReader`");
  }
  await Promise.resolve();
  const ownController = new AbortController;
  try {
    if (!existsSync(src)) {
      throw new Error(`File does not exist: ${src}`);
    }
    const stream = createReadStream(src, {
      start: range === null ? 0 : typeof range === "number" ? range : range[0],
      end: range === null ? Infinity : typeof range === "number" ? Infinity : range[1]
    });
    controller._internals.signal.addEventListener("abort", () => {
      ownController.abort();
    }, { once: true });
    const stats = statSync(src);
    let readerCancelled = false;
    const reader = new ReadableStream({
      start(c) {
        if (readerCancelled) {
          return;
        }
        stream.on("data", (chunk) => {
          c.enqueue(chunk);
        });
        stream.on("end", () => {
          if (readerCancelled) {
            return;
          }
          c.close();
        });
        stream.on("error", (err) => {
          c.error(err);
        });
      },
      cancel() {
        readerCancelled = true;
        stream.destroy();
      }
    }).getReader();
    if (controller) {
      controller._internals.signal.addEventListener("abort", () => {
        reader.cancel().catch(() => {});
      }, { once: true });
    }
    return Promise.resolve({
      reader: {
        reader,
        abort: async () => {
          try {
            stream.destroy();
            ownController.abort();
            await reader.cancel();
          } catch {}
        }
      },
      contentLength: stats.size,
      contentType: null,
      name: src.split(sep).pop(),
      supportsContentRange: true,
      needsContentRange: true
    });
  } catch (err) {
    return Promise.reject(err);
  }
};
var nodeReadWholeAsText = (src) => {
  if (typeof src !== "string") {
    throw new Error("src must be a string when using `nodeReader`");
  }
  return promises.readFile(src, "utf8");
};
var nodeCreateAdjacentFileSource = (relativePath, src) => {
  if (typeof src !== "string") {
    throw new Error("src must be a string when using `nodeReader`");
  }
  const result = join(dirname(src), relativePath);
  const rel = relative(dirname(src), result);
  if (rel.startsWith("..")) {
    throw new Error("Path is outside of the parent directory - not allowing reading of arbitrary files");
  }
  return result;
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

// src/readers/universal.ts
var universalReader = {
  read: (params) => {
    if (params.src instanceof Blob) {
      return webFileReadContent(params);
    }
    if (params.src.toString().startsWith("http") || params.src.toString().startsWith("blob:")) {
      return fetchReadContent(params);
    }
    return nodeReadContent(params);
  },
  readWholeAsText: (src) => {
    if (src instanceof Blob) {
      return webFileReadWholeAsText(src);
    }
    if (src.toString().startsWith("http") || src.toString().startsWith("blob:")) {
      return fetchReadWholeAsText(src);
    }
    return nodeReadWholeAsText(src);
  },
  createAdjacentFileSource: (relativePath, src) => {
    if (src instanceof Blob) {
      return webFileCreateAdjacentFileSource(relativePath, src);
    }
    if (src.toString().startsWith("http") || src.toString().startsWith("blob:")) {
      return fetchCreateAdjacentFileSource(relativePath, src);
    }
    return nodeCreateAdjacentFileSource(relativePath, src);
  },
  preload: ({ src, range, logLevel, prefetchCache }) => {
    if (src instanceof Blob) {
      return;
    }
    if (src.toString().startsWith("http") || src.toString().startsWith("blob:")) {
      return fetchPreload({ range, src, logLevel, prefetchCache });
    }
  }
};
// src/containers/m3u/select-stream.ts
var selectAssociatedPlaylists = async ({
  playlists,
  fn,
  skipAudioTracks
}) => {
  if (playlists.length < 1) {
    return Promise.resolve([]);
  }
  const streams = await fn({ associatedPlaylists: playlists });
  if (!Array.isArray(streams)) {
    throw new Error("Expected an array of associated playlists");
  }
  const selectedStreams = [];
  for (const stream of streams) {
    if (stream.isAudio && skipAudioTracks) {
      continue;
    }
    if (!playlists.find((playlist) => playlist.src === stream.src)) {
      throw new Error(`The associated playlist ${JSON.stringify(streams)} cannot be selected because it was not in the list of selectable playlists`);
    }
    selectedStreams.push(stream);
  }
  return selectedStreams;
};
var defaultSelectM3uAssociatedPlaylists = ({ associatedPlaylists }) => {
  if (associatedPlaylists.length === 1) {
    return associatedPlaylists;
  }
  return associatedPlaylists.filter((playlist) => playlist.default);
};
var selectStream = async ({
  streams,
  fn
}) => {
  if (streams.length < 1) {
    throw new Error("No streams found");
  }
  const selectedStreamId = await fn({ streams });
  const selectedStream = streams.find((stream) => stream.id === selectedStreamId);
  if (!selectedStream) {
    throw new Error(`No stream with the id ${selectedStreamId} found`);
  }
  return Promise.resolve(selectedStream);
};
var defaultSelectM3uStreamFn = ({ streams }) => {
  return Promise.resolve(streams[0].id);
};

// src/with-resolvers.ts
var withResolvers = function() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

// src/controller/emitter.ts
class MediaParserEmitter {
  listeners = {
    pause: [],
    resume: [],
    abort: [],
    seek: []
  };
  readyPromise;
  #markAsReady;
  constructor() {
    const { promise, resolve } = withResolvers();
    this.readyPromise = promise;
    this.#markAsReady = resolve;
  }
  markAsReady = () => {
    this.#markAsReady();
  };
  addEventListener = (name, callback) => {
    this.listeners[name].push(callback);
  };
  removeEventListener = (name, callback) => {
    this.listeners[name] = this.listeners[name].filter((l) => l !== callback);
  };
  dispatchEvent(dispatchName, context) {
    this.listeners[dispatchName].forEach((callback) => {
      callback({ detail: context });
    });
  }
  dispatchPause = () => {
    this.readyPromise = this.readyPromise.then(() => {
      this.dispatchEvent("pause", undefined);
    });
  };
  dispatchResume = () => {
    this.readyPromise = this.readyPromise.then(() => {
      this.dispatchEvent("resume", undefined);
    });
  };
  dispatchAbort = (reason) => {
    this.readyPromise = this.readyPromise.then(() => {
      this.dispatchEvent("abort", { reason });
    });
  };
  dispatchSeek = (seek) => {
    this.readyPromise = this.readyPromise.then(() => {
      this.dispatchEvent("seek", { seek });
    });
  };
}

// src/controller/pause-signal.ts
var makePauseSignal = (emitter) => {
  const waiterFns = [];
  let paused = false;
  return {
    pause: () => {
      if (paused) {
        return;
      }
      emitter.dispatchPause();
      paused = true;
    },
    resume: () => {
      if (!paused) {
        return;
      }
      paused = false;
      for (const waiterFn of waiterFns) {
        waiterFn();
      }
      waiterFns.length = 0;
      emitter.dispatchResume();
    },
    waitUntilResume: () => {
      return new Promise((resolve) => {
        if (!paused) {
          resolve();
        } else {
          waiterFns.push(resolve);
        }
      });
    }
  };
};

// src/controller/performed-seeks-stats.ts
var performedSeeksStats = () => {
  const performedSeeks = [];
  const markLastSeekAsUserInitiated = () => {
    if (performedSeeks.length > 0) {
      performedSeeks[performedSeeks.length - 1].type = "user-initiated";
    }
  };
  return {
    recordSeek: (seek) => {
      performedSeeks.push(seek);
    },
    getPerformedSeeks: () => {
      return performedSeeks;
    },
    markLastSeekAsUserInitiated
  };
};

// src/controller/seek-signal.ts
var makeSeekSignal = (emitter) => {
  let seek = null;
  return {
    seek: (seekRequest) => {
      seek = seekRequest;
      emitter.dispatchSeek(seekRequest);
    },
    getSeek() {
      return seek;
    },
    clearSeekIfStillSame(previousSeek) {
      if (seek === previousSeek) {
        seek = null;
        return { hasChanged: false };
      }
      return { hasChanged: true };
    }
  };
};

// src/controller/media-parser-controller.ts
var mediaParserController = () => {
  const abortController = new AbortController;
  const emitter = new MediaParserEmitter;
  const pauseSignal = makePauseSignal(emitter);
  const seekSignal = makeSeekSignal(emitter);
  const performedSeeksSignal = performedSeeksStats();
  const checkForAbortAndPause = async () => {
    if (abortController.signal.aborted) {
      const err = new MediaParserAbortError("Aborted");
      if (abortController.signal.reason) {
        err.cause = abortController.signal.reason;
      }
      throw err;
    }
    await pauseSignal.waitUntilResume();
  };
  let seekingHintResolution = null;
  let simulateSeekResolution = null;
  const getSeekingHints = () => {
    if (!seekingHintResolution) {
      throw new Error("The mediaParserController() was not yet used in a parseMedia() call");
    }
    return seekingHintResolution();
  };
  const simulateSeek = (seekInSeconds) => {
    if (!simulateSeekResolution) {
      throw new Error("The mediaParserController() was not yet used in a parseMedia() call");
    }
    return simulateSeekResolution(seekInSeconds);
  };
  const attachSeekingHintResolution = (callback) => {
    if (seekingHintResolution) {
      throw new Error("The mediaParserController() was used in multiple parseMedia() calls. Create a separate controller for each call.");
    }
    seekingHintResolution = callback;
  };
  const attachSimulateSeekResolution = (callback) => {
    if (simulateSeekResolution) {
      throw new Error("The mediaParserController() was used in multiple parseMedia() calls. Create a separate controller for each call.");
    }
    simulateSeekResolution = callback;
  };
  return {
    abort: (reason) => {
      abortController.abort(reason);
      emitter.dispatchAbort(reason);
    },
    seek: seekSignal.seek,
    simulateSeek,
    pause: pauseSignal.pause,
    resume: pauseSignal.resume,
    addEventListener: emitter.addEventListener,
    removeEventListener: emitter.removeEventListener,
    getSeekingHints,
    _internals: {
      signal: abortController.signal,
      checkForAbortAndPause,
      seekSignal,
      markAsReadyToEmitEvents: emitter.markAsReady,
      performedSeeksSignal,
      attachSeekingHintResolution,
      attachSimulateSeekResolution
    }
  };
};

// src/containers/m3u/get-streams.ts
var isIndependentSegments = (structure) => {
  if (structure === null || structure.type !== "m3u") {
    return false;
  }
  return structure.boxes.some((box) => box.type === "m3u-independent-segments" || box.type === "m3u-stream-info");
};
var getM3uStreams = ({
  structure,
  originalSrc,
  readerInterface
}) => {
  if (structure === null || structure.type !== "m3u") {
    return null;
  }
  const boxes = [];
  for (let i = 0;i < structure.boxes.length; i++) {
    const str = structure.boxes[i];
    if (str.type === "m3u-stream-info") {
      const next = structure.boxes[i + 1];
      if (next.type !== "m3u-text-value") {
        throw new Error("Expected m3u-text-value");
      }
      const associatedPlaylists = [];
      if (str.audio) {
        const match = structure.boxes.filter((box) => {
          return box.type === "m3u-media-info" && box.groupId === str.audio;
        });
        for (const audioTrack of match) {
          associatedPlaylists.push({
            autoselect: audioTrack.autoselect,
            channels: audioTrack.channels,
            default: audioTrack.default,
            groupId: audioTrack.groupId,
            language: audioTrack.language,
            name: audioTrack.name,
            src: readerInterface.createAdjacentFileSource(audioTrack.uri, originalSrc),
            id: associatedPlaylists.length,
            isAudio: true
          });
        }
      }
      boxes.push({
        src: readerInterface.createAdjacentFileSource(next.value, originalSrc),
        averageBandwidthInBitsPerSec: str.averageBandwidthInBitsPerSec,
        bandwidthInBitsPerSec: str.bandwidthInBitsPerSec,
        codecs: str.codecs,
        dimensions: str.dimensions,
        associatedPlaylists
      });
    }
  }
  if (boxes.length === 0) {
    return null;
  }
  const sorted = boxes.slice().sort((a, b) => {
    const aResolution = a.dimensions ? a.dimensions.width * a.dimensions.height : 0;
    const bResolution = b.dimensions ? b.dimensions.width * b.dimensions.height : 0;
    if (aResolution === bResolution) {
      const bandwidthA = a.averageBandwidthInBitsPerSec ?? a.bandwidthInBitsPerSec ?? 0;
      const bandwidthB = b.averageBandwidthInBitsPerSec ?? b.bandwidthInBitsPerSec ?? 0;
      return bandwidthB - bandwidthA;
    }
    return bResolution - aResolution;
  });
  return sorted.map((box, index) => ({ ...box, id: index }));
};
var m3uHasStreams = (state) => {
  const structure = state.structure.getStructureOrNull();
  if (!structure) {
    return false;
  }
  if (structure.type !== "m3u") {
    return true;
  }
  return state.m3u.hasFinishedManifest();
};

// src/state/iso-base-media/precomputed-moof.ts
var precomputedMoofState = () => {
  let moofBoxes = [];
  return {
    getMoofBoxes: () => moofBoxes,
    setMoofBoxes: (boxes) => {
      moofBoxes = boxes;
    }
  };
};
var toMoofBox = (box) => {
  if (box.type !== "regular-box") {
    throw new Error("expected regular bpx");
  }
  return {
    offset: box.offset,
    trafBoxes: box.children.filter((c) => c.type === "regular-box" && c.boxType === "traf"),
    size: box.boxSize
  };
};
var deduplicateMoofBoxesByOffset = (moofBoxes) => {
  return moofBoxes.filter((m, i, arr) => i === arr.findIndex((t) => t.offset === m.offset));
};

// src/containers/iso-base-media/traversal.ts
var getMoovFromFromIsoStructure = (structure) => {
  const moovBox = structure.boxes.find((s) => s.type === "moov-box");
  if (!moovBox || moovBox.type !== "moov-box") {
    return null;
  }
  return moovBox;
};
var getMoovBoxFromState = ({
  structureState,
  isoState,
  mp4HeaderSegment,
  mayUsePrecomputed
}) => {
  const got = isoState.moov.getMoovBoxAndPrecomputed();
  if (got && (mayUsePrecomputed || !got.precomputed)) {
    return got.moovBox;
  }
  if (mp4HeaderSegment) {
    return getMoovFromFromIsoStructure(mp4HeaderSegment);
  }
  const structure = structureState.getIsoStructure();
  return getMoovFromFromIsoStructure(structure);
};
var getMoofBoxes = (main) => {
  const moofBoxes = main.filter((s) => s.type === "regular-box" && s.boxType === "moof");
  return moofBoxes.map((m) => toMoofBox(m));
};
var getMvhdBox = (moovBox) => {
  const mvHdBox = moovBox.children.find((s) => s.type === "mvhd-box");
  if (!mvHdBox || mvHdBox.type !== "mvhd-box") {
    return null;
  }
  return mvHdBox;
};
var getTraks = (moovBox) => {
  return moovBox.children.filter((s) => s.type === "trak-box");
};
var getTkhdBox = (trakBox) => {
  const tkhdBox = trakBox.children.find((s) => s.type === "tkhd-box");
  return tkhdBox;
};
var getMdiaBox = (trakBox) => {
  const mdiaBox = trakBox.children.find((s) => s.type === "regular-box" && s.boxType === "mdia");
  if (!mdiaBox || mdiaBox.type !== "regular-box") {
    return null;
  }
  return mdiaBox;
};
var getMdhdBox = (trakBox) => {
  const mdiaBox = getMdiaBox(trakBox);
  if (!mdiaBox) {
    return null;
  }
  const mdhdBox = mdiaBox.children.find((c) => c.type === "mdhd-box");
  return mdhdBox;
};
var getStblBox = (trakBox) => {
  const mdiaBox = getMdiaBox(trakBox);
  if (!mdiaBox) {
    return null;
  }
  const minfBox = mdiaBox.children.find((s) => s.type === "regular-box" && s.boxType === "minf");
  if (!minfBox || minfBox.type !== "regular-box") {
    return null;
  }
  const stblBox = minfBox.children.find((s) => s.type === "regular-box" && s.boxType === "stbl");
  if (!stblBox || stblBox.type !== "regular-box") {
    return null;
  }
  return stblBox;
};
var getStsdBox = (trakBox) => {
  const stblBox = getStblBox(trakBox);
  if (!stblBox || stblBox.type !== "regular-box") {
    return null;
  }
  const stsdBox = stblBox.children.find((s) => s.type === "stsd-box");
  return stsdBox;
};
var getVideoDescriptors = (trakBox) => {
  const stsdBox = getStsdBox(trakBox);
  if (!stsdBox) {
    return null;
  }
  const descriptors = stsdBox.samples.map((s) => {
    return s.type === "video" ? s.descriptors.map((d) => {
      return d.type === "avcc-box" ? d.privateData : d.type === "hvcc-box" ? d.privateData : null;
    }) : [];
  });
  return descriptors.flat(1).filter(Boolean)[0] ?? null;
};
var getStcoBox = (trakBox) => {
  const stblBox = getStblBox(trakBox);
  if (!stblBox || stblBox.type !== "regular-box") {
    return null;
  }
  const stcoBox = stblBox.children.find((s) => s.type === "stco-box");
  return stcoBox;
};
var getSttsBox = (trakBox) => {
  const stblBox = getStblBox(trakBox);
  if (!stblBox || stblBox.type !== "regular-box") {
    return null;
  }
  const sttsBox = stblBox.children.find((s) => s.type === "stts-box");
  return sttsBox;
};
var getCttsBox = (trakBox) => {
  const stblBox = getStblBox(trakBox);
  if (!stblBox || stblBox.type !== "regular-box") {
    return null;
  }
  const cttsBox = stblBox.children.find((s) => s.type === "ctts-box");
  return cttsBox;
};
var getStszBox = (trakBox) => {
  const stblBox = getStblBox(trakBox);
  if (!stblBox || stblBox.type !== "regular-box") {
    return null;
  }
  const stszBox = stblBox.children.find((s) => s.type === "stsz-box");
  return stszBox;
};
var getStscBox = (trakBox) => {
  const stblBox = getStblBox(trakBox);
  if (!stblBox || stblBox.type !== "regular-box") {
    return null;
  }
  const stcoBox = stblBox.children.find((b) => b.type === "stsc-box");
  return stcoBox;
};
var getStssBox = (trakBox) => {
  const stblBox = getStblBox(trakBox);
  if (!stblBox || stblBox.type !== "regular-box") {
    return null;
  }
  const stssBox = stblBox.children.find((b) => b.type === "stss-box");
  return stssBox;
};
var getTfdtBox = (segment) => {
  if (segment.type !== "regular-box" || segment.boxType !== "traf") {
    throw new Error("Expected traf-box");
  }
  const tfhdBox = segment.children.find((c) => c.type === "tfdt-box");
  if (!tfhdBox || tfhdBox.type !== "tfdt-box") {
    throw new Error("Expected tfhd-box");
  }
  return tfhdBox;
};
var getTfhdBox = (segment) => {
  if (segment.type !== "regular-box" || segment.boxType !== "traf") {
    throw new Error("Expected traf-box");
  }
  const tfhdBox = segment.children.find((c) => c.type === "tfhd-box");
  if (!tfhdBox || tfhdBox.type !== "tfhd-box") {
    throw new Error("Expected tfhd-box");
  }
  return tfhdBox;
};
var getTrunBoxes = (segment) => {
  if (segment.type !== "regular-box" || segment.boxType !== "traf") {
    throw new Error("Expected traf-box");
  }
  const trunBoxes = segment.children.filter((c) => c.type === "trun-box");
  return trunBoxes;
};
var getMvexBox = (moovAtom) => {
  const mvexBox = moovAtom.children.find((s) => s.type === "regular-box" && s.boxType === "mvex");
  if (!mvexBox || mvexBox.type !== "regular-box") {
    return null;
  }
  return mvexBox;
};
var getTrexBoxes = (moovAtom) => {
  const mvexBox = getMvexBox(moovAtom);
  if (!mvexBox) {
    return [];
  }
  const trexBoxes = mvexBox.children.filter((c) => c.type === "trex-box");
  return trexBoxes;
};
var getTfraBoxesFromMfraBoxChildren = (mfraBoxChildren) => {
  const tfraBoxes = mfraBoxChildren.filter((b) => b.type === "tfra-box");
  return tfraBoxes;
};
var getTfraBoxes = (structure) => {
  const mfraBox = structure.find((b) => b.type === "regular-box" && b.boxType === "mfra");
  if (!mfraBox) {
    return [];
  }
  return getTfraBoxesFromMfraBoxChildren(mfraBox.children);
};
var getTrakBoxByTrackId = (moovBox, trackId) => {
  const trakBoxes = getTraks(moovBox);
  return trakBoxes.find((t) => {
    const tkhd = getTkhdBox(t);
    if (!tkhd) {
      return false;
    }
    return tkhd.trackId === trackId;
  }) ?? null;
};
var getElstBox = (trakBox) => {
  const edtsBox = trakBox.children.find((s) => s.type === "regular-box" && s.boxType === "edts");
  if (!edtsBox || edtsBox.type !== "regular-box") {
    return null;
  }
  const elstBox = edtsBox.children.find((s) => s.type === "elst-box");
  return elstBox;
};

// src/containers/riff/traversal.ts
var isRiffAvi = (structure) => {
  return structure.boxes.some((box) => box.type === "riff-header" && box.fileType === "AVI");
};
var getHdlrBox = (structure) => {
  return structure.boxes.find((box) => box.type === "list-box" && box.listType === "hdrl");
};
var getAvihBox = (structure) => {
  const hdlrBox = getHdlrBox(structure);
  if (!hdlrBox) {
    return null;
  }
  return hdlrBox.children.find((box) => box.type === "avih-box");
};
var getStrlBoxes = (structure) => {
  const hdlrBox = getHdlrBox(structure);
  if (!hdlrBox) {
    return [];
  }
  return hdlrBox.children.filter((box) => box.type === "list-box" && box.listType === "strl");
};
var getStrhBox = (strlBoxChildren) => {
  return strlBoxChildren.find((box) => box.type === "strh-box");
};

// src/is-audio-structure.ts
var isAudioStructure = (structure) => {
  if (structure.type === "mp3") {
    return true;
  }
  if (structure.type === "wav") {
    return true;
  }
  if (structure.type === "aac") {
    return true;
  }
  if (structure.type === "flac") {
    return true;
  }
  if (structure.type === "iso-base-media") {
    return false;
  }
  if (structure.type === "matroska") {
    return false;
  }
  if (structure.type === "transport-stream") {
    return false;
  }
  if (structure.type === "riff") {
    return false;
  }
  if (structure.type === "m3u") {
    return false;
  }
  throw new Error(`Unhandled structure type: ${structure}`);
};

// src/get-fps.ts
var calculateFps = ({
  sttsBox,
  timeScale,
  durationInSamples
}) => {
  let totalSamples = 0;
  for (const sample of sttsBox.sampleDistribution) {
    totalSamples += sample.sampleCount;
  }
  if (totalSamples === 0) {
    return null;
  }
  const durationInSeconds = durationInSamples / timeScale;
  const fps = totalSamples / durationInSeconds;
  return fps;
};
var trakBoxContainsAudio = (trakBox) => {
  const stsd = getStsdBox(trakBox);
  if (!stsd) {
    return false;
  }
  const videoSample = stsd.samples.find((s) => s.type === "audio");
  if (!videoSample || videoSample.type !== "audio") {
    return false;
  }
  return true;
};
var trakBoxContainsVideo = (trakBox) => {
  const stsd = getStsdBox(trakBox);
  if (!stsd) {
    return false;
  }
  const videoSample = stsd.samples.find((s) => s.type === "video");
  if (!videoSample || videoSample.type !== "video") {
    return false;
  }
  return true;
};
var getTimescaleAndDuration = (trakBox) => {
  const mdhdBox = getMdhdBox(trakBox);
  if (mdhdBox) {
    return { timescale: mdhdBox.timescale, duration: mdhdBox.duration };
  }
  return null;
};
var getFpsFromMp4TrakBox = (trakBox) => {
  const timescaleAndDuration = getTimescaleAndDuration(trakBox);
  if (!timescaleAndDuration) {
    return null;
  }
  const sttsBox = getSttsBox(trakBox);
  if (!sttsBox) {
    return null;
  }
  return calculateFps({
    sttsBox,
    timeScale: timescaleAndDuration.timescale,
    durationInSamples: timescaleAndDuration.duration
  });
};
var getFpsFromIsoMaseMedia = (state) => {
  const moovBox = getMoovBoxFromState({
    structureState: state.structure,
    isoState: state.iso,
    mp4HeaderSegment: state.m3uPlaylistContext?.mp4HeaderSegment ?? null,
    mayUsePrecomputed: true
  });
  if (!moovBox) {
    return null;
  }
  const trackBoxes = getTraks(moovBox);
  const trackBox = trackBoxes.find(trakBoxContainsVideo);
  if (!trackBox) {
    return null;
  }
  return getFpsFromMp4TrakBox(trackBox);
};
var getFpsFromAvi = (structure) => {
  const strl = getStrlBoxes(structure);
  for (const s of strl) {
    const strh = getStrhBox(s.children);
    if (!strh) {
      throw new Error("No strh box");
    }
    if (strh.fccType === "auds") {
      continue;
    }
    return strh.rate;
  }
  return null;
};
var getFps = (state) => {
  const segments = state.structure.getStructure();
  if (segments.type === "iso-base-media") {
    return getFpsFromIsoMaseMedia(state);
  }
  if (segments.type === "riff") {
    return getFpsFromAvi(segments);
  }
  if (segments.type === "matroska") {
    return null;
  }
  if (segments.type === "transport-stream") {
    return null;
  }
  if (segments.type === "m3u") {
    return null;
  }
  if (segments.type === "mp3" || segments.type === "wav" || segments.type === "flac" || segments.type === "aac") {
    return null;
  }
  throw new Error("Cannot get fps, not implemented: " + segments);
};
var hasFpsSuitedForSlowFps = (state) => {
  try {
    return getFps(state) !== null;
  } catch {
    return false;
  }
};
var hasFps = (state) => {
  const structure = state.structure.getStructure();
  if (isAudioStructure(structure)) {
    return true;
  }
  if (structure.type === "matroska") {
    return true;
  }
  if (structure.type === "transport-stream") {
    return true;
  }
  if (structure.type === "m3u") {
    return true;
  }
  return hasFpsSuitedForSlowFps(state);
};

// src/get-sample-aspect-ratio.ts
var getStsdVideoConfig = (trakBox) => {
  const stsdBox = getStsdBox(trakBox);
  if (!stsdBox) {
    return null;
  }
  const videoConfig = stsdBox.samples.find((s) => s.type === "video");
  if (!videoConfig || videoConfig.type !== "video") {
    return null;
  }
  return videoConfig;
};
var getAvccBox = (trakBox) => {
  const videoConfig = getStsdVideoConfig(trakBox);
  if (!videoConfig) {
    return null;
  }
  const avccBox = videoConfig.descriptors.find((c) => c.type === "avcc-box");
  if (!avccBox || avccBox.type !== "avcc-box") {
    return null;
  }
  return avccBox;
};
var getVpccBox = (trakBox) => {
  const videoConfig = getStsdVideoConfig(trakBox);
  if (!videoConfig) {
    return null;
  }
  const vpccBox = videoConfig.descriptors.find((c) => c.type === "vpcc-box");
  if (!vpccBox || vpccBox.type !== "vpcc-box") {
    return null;
  }
  return vpccBox;
};
var getAv1CBox = (trakBox) => {
  const videoConfig = getStsdVideoConfig(trakBox);
  if (!videoConfig) {
    return null;
  }
  const av1cBox = videoConfig.descriptors.find((c) => c.type === "av1C-box");
  if (!av1cBox || av1cBox.type !== "av1C-box") {
    return null;
  }
  return av1cBox;
};
var getPaspBox = (trakBox) => {
  const videoConfig = getStsdVideoConfig(trakBox);
  if (!videoConfig) {
    return null;
  }
  const paspBox = videoConfig.descriptors.find((c) => c.type === "pasp-box");
  if (!paspBox || paspBox.type !== "pasp-box") {
    return null;
  }
  return paspBox;
};
var getHvccBox = (trakBox) => {
  const videoConfig = getStsdVideoConfig(trakBox);
  if (!videoConfig) {
    return null;
  }
  const hvccBox = videoConfig.descriptors.find((c) => c.type === "hvcc-box");
  if (!hvccBox || hvccBox.type !== "hvcc-box") {
    return null;
  }
  return hvccBox;
};
var getSampleAspectRatio = (trakBox) => {
  const paspBox = getPaspBox(trakBox);
  if (!paspBox) {
    return {
      numerator: 1,
      denominator: 1
    };
  }
  return {
    numerator: paspBox.hSpacing,
    denominator: paspBox.vSpacing
  };
};
var getColrBox = (videoSample) => {
  const colrBox = videoSample.descriptors.find((c) => c.type === "colr-box");
  if (!colrBox || colrBox.type !== "colr-box") {
    return null;
  }
  return colrBox;
};
var applyTkhdBox = (aspectRatioApplied, tkhdBox) => {
  if (tkhdBox === null || tkhdBox.rotation === 0) {
    return {
      displayAspectWidth: aspectRatioApplied.width,
      displayAspectHeight: aspectRatioApplied.height,
      width: aspectRatioApplied.width,
      height: aspectRatioApplied.height,
      rotation: 0
    };
  }
  return {
    width: tkhdBox.width,
    height: tkhdBox.height,
    rotation: tkhdBox.rotation,
    displayAspectWidth: aspectRatioApplied.width,
    displayAspectHeight: aspectRatioApplied.height
  };
};
var applyAspectRatios = ({
  dimensions,
  sampleAspectRatio,
  displayAspectRatio
}) => {
  if (displayAspectRatio.numerator === 0) {
    return dimensions;
  }
  if (displayAspectRatio.denominator === 0) {
    return dimensions;
  }
  const newWidth = Math.round(dimensions.width * sampleAspectRatio.numerator / sampleAspectRatio.denominator);
  const newHeight = Math.floor(newWidth / (displayAspectRatio.numerator / displayAspectRatio.denominator));
  return {
    width: Math.floor(newWidth),
    height: newHeight
  };
};
function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}
function reduceFraction(numerator, denominator) {
  const greatestCommonDivisor = gcd(Math.abs(numerator), Math.abs(denominator));
  return {
    numerator: numerator / greatestCommonDivisor,
    denominator: denominator / greatestCommonDivisor
  };
}
var getDisplayAspectRatio = ({
  sampleAspectRatio,
  nativeDimensions
}) => {
  const num = Math.round(nativeDimensions.width * sampleAspectRatio.numerator);
  const den = Math.round(nativeDimensions.height * sampleAspectRatio.denominator);
  return reduceFraction(num, den);
};

// src/containers/avc/color.ts
var getMatrixCoefficientsFromIndex = (index) => {
  if (index === 0) {
    return "rgb";
  }
  if (index === 1) {
    return "bt709";
  }
  if (index === 5) {
    return "bt470bg";
  }
  if (index === 6) {
    return "smpte170m";
  }
  if (index === 9) {
    return "bt2020-ncl";
  }
  return null;
};
var getTransferCharacteristicsFromIndex = (index) => {
  if (index === 1) {
    return "bt709";
  }
  if (index === 6) {
    return "smpte170m";
  }
  if (index === 8) {
    return "linear";
  }
  if (index === 13) {
    return "iec61966-2-1";
  }
  if (index === 16) {
    return "pq";
  }
  if (index === 18) {
    return "hlg";
  }
  return null;
};
var getPrimariesFromIndex = (index) => {
  if (index === 1) {
    return "bt709";
  }
  if (index === 5) {
    return "bt470bg";
  }
  if (index === 6) {
    return "smpte170m";
  }
  if (index === 9) {
    return "bt2020";
  }
  if (index === 12) {
    return "smpte432";
  }
  return null;
};

// src/containers/webm/segments/all-segments.ts
var matroskaElements = {
  Header: "0x1a45dfa3",
  EBMLMaxIDLength: "0x42f2",
  EBMLVersion: "0x4286",
  EBMLReadVersion: "0x42f7",
  EBMLMaxSizeLength: "0x42f3",
  DocType: "0x4282",
  DocTypeVersion: "0x4287",
  DocTypeReadVersion: "0x4285",
  Segment: "0x18538067",
  SeekHead: "0x114d9b74",
  Seek: "0x4dbb",
  SeekID: "0x53ab",
  SeekPosition: "0x53ac",
  Info: "0x1549a966",
  SegmentUUID: "0x73a4",
  SegmentFilename: "0x7384",
  PrevUUID: "0x3cb923",
  PrevFilename: "0x3c83ab",
  NextUUID: "0x3eb923",
  NextFilename: "0x3e83bb",
  SegmentFamily: "0x4444",
  ChapterTranslate: "0x6924",
  ChapterTranslateID: "0x69a5",
  ChapterTranslateCodec: "0x69bf",
  ChapterTranslateEditionUID: "0x69fc",
  TimestampScale: "0x2ad7b1",
  Duration: "0x4489",
  DateUTC: "0x4461",
  Title: "0x7ba9",
  MuxingApp: "0x4d80",
  WritingApp: "0x5741",
  Cluster: "0x1f43b675",
  Timestamp: "0xe7",
  SilentTracks: "0x5854",
  SilentTrackNumber: "0x58d7",
  Position: "0xa7",
  PrevSize: "0xab",
  SimpleBlock: "0xa3",
  BlockGroup: "0xa0",
  Block: "0xa1",
  BlockVirtual: "0xa2",
  BlockAdditions: "0x75a1",
  BlockMore: "0xa6",
  BlockAdditional: "0xa5",
  BlockAddID: "0xee",
  BlockDuration: "0x9b",
  ReferencePriority: "0xfa",
  ReferenceBlock: "0xfb",
  ReferenceVirtual: "0xfd",
  CodecState: "0xa4",
  DiscardPadding: "0x75a2",
  Slices: "0x8e",
  TimeSlice: "0xe8",
  LaceNumber: "0xcc",
  FrameNumber: "0xcd",
  BlockAdditionID: "0xcb",
  Delay: "0xce",
  SliceDuration: "0xcf",
  ReferenceFrame: "0xc8",
  ReferenceOffset: "0xc9",
  ReferenceTimestamp: "0xca",
  EncryptedBlock: "0xaf",
  Tracks: "0x1654ae6b",
  TrackEntry: "0xae",
  TrackNumber: "0xd7",
  TrackUID: "0x73c5",
  TrackType: "0x83",
  FlagEnabled: "0xb9",
  FlagDefault: "0x88",
  FlagForced: "0x55aa",
  FlagHearingImpaired: "0x55ab",
  FlagVisualImpaired: "0x55ac",
  FlagTextDescriptions: "0x55ad",
  FlagOriginal: "0x55ae",
  FlagCommentary: "0x55af",
  FlagLacing: "0x9c",
  MinCache: "0x6de7",
  MaxCache: "0x6df8",
  DefaultDuration: "0x23e383",
  DefaultDecodedFieldDuration: "0x234e7a",
  TrackTimestampScale: "0x23314f",
  TrackOffset: "0x537f",
  MaxBlockAdditionID: "0x55ee",
  BlockAdditionMapping: "0x41e4",
  BlockAddIDValue: "0x41f0",
  BlockAddIDName: "0x41a4",
  BlockAddIDType: "0x41e7",
  BlockAddIDExtraData: "0x41ed",
  Name: "0x536e",
  Language: "0x22b59c",
  LanguageBCP47: "0x22b59d",
  CodecID: "0x86",
  CodecPrivate: "0x63a2",
  CodecName: "0x258688",
  AttachmentLink: "0x7446",
  CodecSettings: "0x3a9697",
  CodecInfoURL: "0x3b4040",
  CodecDownloadURL: "0x26b240",
  CodecDecodeAll: "0xaa",
  TrackOverlay: "0x6fab",
  CodecDelay: "0x56aa",
  SeekPreRoll: "0x56bb",
  TrackTranslate: "0x6624",
  TrackTranslateTrackID: "0x66a5",
  TrackTranslateCodec: "0x66bf",
  TrackTranslateEditionUID: "0x66fc",
  Video: "0xe0",
  FlagInterlaced: "0x9a",
  FieldOrder: "0x9d",
  StereoMode: "0x53b8",
  AlphaMode: "0x53c0",
  OldStereoMode: "0x53b9",
  PixelWidth: "0xb0",
  PixelHeight: "0xba",
  PixelCropBottom: "0x54aa",
  PixelCropTop: "0x54bb",
  PixelCropLeft: "0x54cc",
  PixelCropRight: "0x54dd",
  DisplayWidth: "0x54b0",
  DisplayHeight: "0x54ba",
  DisplayUnit: "0x54b2",
  AspectRatioType: "0x54b3",
  UncompressedFourCC: "0x2eb524",
  GammaValue: "0x2fb523",
  FrameRate: "0x2383e3",
  Colour: "0x55b0",
  MatrixCoefficients: "0x55b1",
  BitsPerChannel: "0x55b2",
  ChromaSubsamplingHorz: "0x55b3",
  ChromaSubsamplingVert: "0x55b4",
  CbSubsamplingHorz: "0x55b5",
  CbSubsamplingVert: "0x55b6",
  ChromaSitingHorz: "0x55b7",
  ChromaSitingVert: "0x55b8",
  Range: "0x55b9",
  TransferCharacteristics: "0x55ba",
  Primaries: "0x55bb",
  MaxCLL: "0x55bc",
  MaxFALL: "0x55bd",
  MasteringMetadata: "0x55d0",
  PrimaryRChromaticityX: "0x55d1",
  PrimaryRChromaticityY: "0x55d2",
  PrimaryGChromaticityX: "0x55d3",
  PrimaryGChromaticityY: "0x55d4",
  PrimaryBChromaticityX: "0x55d5",
  PrimaryBChromaticityY: "0x55d6",
  WhitePointChromaticityX: "0x55d7",
  WhitePointChromaticityY: "0x55d8",
  LuminanceMax: "0x55d9",
  LuminanceMin: "0x55da",
  Projection: "0x7670",
  ProjectionType: "0x7671",
  ProjectionPrivate: "0x7672",
  ProjectionPoseYaw: "0x7673",
  ProjectionPosePitch: "0x7674",
  ProjectionPoseRoll: "0x7675",
  Audio: "0xe1",
  SamplingFrequency: "0xb5",
  OutputSamplingFrequency: "0x78b5",
  Channels: "0x9f",
  ChannelPositions: "0x7d7b",
  BitDepth: "0x6264",
  Emphasis: "0x52f1",
  TrackOperation: "0xe2",
  TrackCombinePlanes: "0xe3",
  TrackPlane: "0xe4",
  TrackPlaneUID: "0xe5",
  TrackPlaneType: "0xe6",
  TrackJoinBlocks: "0xe9",
  TrackJoinUID: "0xed",
  TrickTrackUID: "0xc0",
  TrickTrackSegmentUID: "0xc1",
  TrickTrackFlag: "0xc6",
  TrickMasterTrackUID: "0xc7",
  TrickMasterTrackSegmentUID: "0xc4",
  ContentEncodings: "0x6d80",
  ContentEncoding: "0x6240",
  ContentEncodingOrder: "0x5031",
  ContentEncodingScope: "0x5032",
  ContentEncodingType: "0x5033",
  ContentCompression: "0x5034",
  ContentCompAlgo: "0x4254",
  ContentCompSettings: "0x4255",
  ContentEncryption: "0x5035",
  ContentEncAlgo: "0x47e1",
  ContentEncKeyID: "0x47e2",
  ContentEncAESSettings: "0x47e7",
  AESSettingsCipherMode: "0x47e8",
  ContentSignature: "0x47e3",
  ContentSigKeyID: "0x47e4",
  ContentSigAlgo: "0x47e5",
  ContentSigHashAlgo: "0x47e6",
  Cues: "0x1c53bb6b",
  CuePoint: "0xbb",
  CueTime: "0xb3",
  CueTrackPositions: "0xb7",
  CueTrack: "0xf7",
  CueClusterPosition: "0xf1",
  CueRelativePosition: "0xf0",
  CueDuration: "0xb2",
  CueBlockNumber: "0x5378",
  CueCodecState: "0xea",
  CueReference: "0xdb",
  CueRefTime: "0x96",
  CueRefCluster: "0x97",
  CueRefNumber: "0x535f",
  CueRefCodecState: "0xeb",
  Attachments: "0x1941a469",
  AttachedFile: "0x61a7",
  FileDescription: "0x467e",
  FileName: "0x466e",
  FileMediaType: "0x4660",
  FileData: "0x465c",
  FileUID: "0x46ae",
  FileReferral: "0x4675",
  FileUsedStartTime: "0x4661",
  FileUsedEndTime: "0x4662",
  Chapters: "0x1043a770",
  EditionEntry: "0x45b9",
  EditionUID: "0x45bc",
  EditionFlagHidden: "0x45bd",
  EditionFlagDefault: "0x45db",
  EditionFlagOrdered: "0x45dd",
  EditionDisplay: "0x4520",
  EditionString: "0x4521",
  EditionLanguageIETF: "0x45e4",
  ChapterAtom: "0xb6",
  ChapterUID: "0x73c4",
  ChapterStringUID: "0x5654",
  ChapterTimeStart: "0x91",
  ChapterTimeEnd: "0x92",
  ChapterFlagHidden: "0x98",
  ChapterFlagEnabled: "0x4598",
  ChapterSegmentUUID: "0x6e67",
  ChapterSkipType: "0x4588",
  ChapterSegmentEditionUID: "0x6ebc",
  ChapterPhysicalEquiv: "0x63c3",
  ChapterTrack: "0x8f",
  ChapterTrackUID: "0x89",
  ChapterDisplay: "0x80",
  ChapString: "0x85",
  ChapLanguage: "0x437c",
  ChapLanguageBCP47: "0x437d",
  ChapCountry: "0x437e",
  ChapProcess: "0x6944",
  ChapProcessCodecID: "0x6955",
  ChapProcessPrivate: "0x450d",
  ChapProcessCommand: "0x6911",
  ChapProcessTime: "0x6922",
  ChapProcessData: "0x6933",
  Tags: "0x1254c367",
  Tag: "0x7373",
  Targets: "0x63c0",
  TargetTypeValue: "0x68ca",
  TargetType: "0x63ca",
  TagTrackUID: "0x63c5",
  TagEditionUID: "0x63c9",
  TagChapterUID: "0x63c4",
  TagAttachmentUID: "0x63c6",
  SimpleTag: "0x67c8",
  TagName: "0x45a3",
  TagLanguage: "0x447a",
  TagLanguageBCP47: "0x447b",
  TagDefault: "0x4484",
  TagDefaultBogus: "0x44b4",
  TagString: "0x4487",
  TagBinary: "0x4485",
  Void: "0xec",
  Crc32: "0xbf"
};
var matroskaIds = Object.values(matroskaElements);
var knownIdsWithOneLength = matroskaIds.filter((id) => id.length === 4);
var knownIdsWithTwoLength = matroskaIds.filter((id) => id.length === 6);
var knownIdsWithThreeLength = matroskaIds.filter((id) => id.length === 8);
var ebmlVersion = {
  name: "EBMLVersion",
  type: "uint"
};
var ebmlReadVersion = {
  name: "EBMLReadVersion",
  type: "uint"
};
var ebmlMaxIdLength = {
  name: "EBMLMaxIDLength",
  type: "uint"
};
var ebmlMaxSizeLength = {
  name: "EBMLMaxSizeLength",
  type: "uint"
};
var docType = {
  name: "DocType",
  type: "string"
};
var docTypeVersion = {
  name: "DocTypeVersion",
  type: "uint"
};
var docTypeReadVersion = {
  name: "DocTypeReadVersion",
  type: "uint"
};
var voidEbml = {
  name: "Void",
  type: "uint8array"
};
var matroskaHeader = {
  name: "Header",
  type: "children"
};
var seekId = {
  name: "SeekID",
  type: "hex-string"
};
var _name = {
  name: "Name",
  type: "string"
};
var minCache = {
  name: "MinCache",
  type: "uint"
};
var maxCache = {
  name: "MaxCache",
  type: "uint"
};
var seekPosition = {
  name: "SeekPosition",
  type: "uint"
};
var seek = {
  name: "Seek",
  type: "children"
};
var seekHead = {
  name: "SeekHead",
  type: "children"
};
var trackType = {
  name: "TrackType",
  type: "uint"
};
var widthType = {
  name: "PixelWidth",
  type: "uint"
};
var heightType = {
  name: "PixelHeight",
  type: "uint"
};
var muxingApp = {
  name: "MuxingApp",
  type: "string"
};
var duration = {
  name: "Duration",
  type: "float"
};
var timestampScale = {
  name: "TimestampScale",
  type: "uint"
};
var infoType = {
  name: "Info",
  type: "children"
};
var titleType = {
  name: "Title",
  type: "string"
};
var tagTrackUidType = {
  name: "TagTrackUID",
  type: "hex-string"
};
var samplingFrequency = {
  name: "SamplingFrequency",
  type: "float"
};
var channels = {
  name: "Channels",
  type: "uint"
};
var alphaMode = {
  name: "AlphaMode",
  type: "uint"
};
var interlaced = {
  name: "FlagInterlaced",
  type: "uint"
};
var bitDepth = {
  name: "BitDepth",
  type: "uint"
};
var displayWidth = {
  name: "DisplayWidth",
  type: "uint"
};
var displayHeight = {
  name: "DisplayHeight",
  type: "uint"
};
var displayUnit = {
  name: "DisplayUnit",
  type: "uint"
};
var flagLacing = {
  name: "FlagLacing",
  type: "uint"
};
var tagSegment = {
  name: "Tag",
  type: "children"
};
var tags = {
  name: "Tags",
  type: "children"
};
var trackNumber = {
  name: "TrackNumber",
  type: "uint"
};
var trackUID = {
  name: "TrackUID",
  type: "hex-string"
};
var color = {
  name: "Colour",
  type: "children"
};
var transferCharacteristics = {
  name: "TransferCharacteristics",
  type: "uint"
};
var matrixCoefficients = {
  name: "MatrixCoefficients",
  type: "uint"
};
var primaries = {
  name: "Primaries",
  type: "uint"
};
var range = {
  name: "Range",
  type: "uint"
};
var ChromaSitingHorz = {
  name: "ChromaSitingHorz",
  type: "uint"
};
var ChromaSitingVert = {
  name: "ChromaSitingVert",
  type: "uint"
};
var language = {
  name: "Language",
  type: "string"
};
var defaultDuration = {
  name: "DefaultDuration",
  type: "uint"
};
var codecPrivate = {
  name: "CodecPrivate",
  type: "uint8array"
};
var blockAdditionsSegment = {
  name: "BlockAdditions",
  type: "uint8array"
};
var maxBlockAdditionIdSegment = {
  name: "MaxBlockAdditionID",
  type: "uint"
};
var audioSegment = {
  name: "Audio",
  type: "children"
};
var videoSegment = {
  name: "Video",
  type: "children"
};
var flagDefault = {
  name: "FlagDefault",
  type: "uint"
};
var referenceBlock = {
  name: "ReferenceBlock",
  type: "uint"
};
var blockDurationSegment = {
  name: "BlockDuration",
  type: "uint"
};
var codecName = {
  name: "CodecName",
  type: "string"
};
var trackTimestampScale = {
  name: "TrackTimestampScale",
  type: "float"
};
var trackEntry = {
  name: "TrackEntry",
  type: "children"
};
var tracks = {
  name: "Tracks",
  type: "children"
};
var block = {
  name: "Block",
  type: "uint8array"
};
var simpleBlock = {
  name: "SimpleBlock",
  type: "uint8array"
};
var blockGroup = {
  name: "BlockGroup",
  type: "children"
};
var targetsType = {
  name: "Targets",
  type: "children"
};
var simpleTagType = {
  name: "SimpleTag",
  type: "children"
};
var tagNameType = {
  name: "TagName",
  type: "string"
};
var tagStringType = {
  name: "TagString",
  type: "string"
};
var ebmlMap = {
  [matroskaElements.Header]: matroskaHeader,
  [matroskaElements.DocType]: docType,
  [matroskaElements.Targets]: targetsType,
  [matroskaElements.SimpleTag]: simpleTagType,
  [matroskaElements.TagName]: tagNameType,
  [matroskaElements.TagString]: tagStringType,
  [matroskaElements.DocTypeVersion]: docTypeVersion,
  [matroskaElements.DocTypeReadVersion]: docTypeReadVersion,
  [matroskaElements.EBMLVersion]: ebmlVersion,
  [matroskaElements.EBMLReadVersion]: ebmlReadVersion,
  [matroskaElements.EBMLMaxIDLength]: ebmlMaxIdLength,
  [matroskaElements.EBMLMaxSizeLength]: ebmlMaxSizeLength,
  [matroskaElements.Void]: voidEbml,
  [matroskaElements.Cues]: {
    name: "Cues",
    type: "children"
  },
  [matroskaElements.CuePoint]: {
    name: "CuePoint",
    type: "children"
  },
  [matroskaElements.CueTime]: {
    name: "CueTime",
    type: "uint"
  },
  [matroskaElements.CueTrackPositions]: {
    name: "CueTrackPositions",
    type: "children"
  },
  [matroskaElements.CueClusterPosition]: {
    name: "CueClusterPosition",
    type: "uint"
  },
  [matroskaElements.CueRelativePosition]: {
    name: "CueRelativePosition",
    type: "uint"
  },
  [matroskaElements.CueBlockNumber]: {
    name: "CueBlockNumber",
    type: "uint"
  },
  [matroskaElements.CueTrack]: {
    name: "CueTrack",
    type: "uint"
  },
  [matroskaElements.DateUTC]: {
    name: "DateUTC",
    type: "uint8array"
  },
  [matroskaElements.TrackTimestampScale]: trackTimestampScale,
  [matroskaElements.CodecDelay]: {
    name: "CodecDelay",
    type: "uint8array"
  },
  [matroskaElements.SeekPreRoll]: {
    name: "SeekPreRoll",
    type: "uint8array"
  },
  [matroskaElements.DiscardPadding]: {
    name: "DiscardPadding",
    type: "uint8array"
  },
  [matroskaElements.OutputSamplingFrequency]: {
    name: "OutputSamplingFrequency",
    type: "uint8array"
  },
  [matroskaElements.CodecName]: codecName,
  [matroskaElements.Position]: {
    name: "Position",
    type: "uint8array"
  },
  [matroskaElements.SliceDuration]: {
    name: "SliceDuration",
    type: "uint8array"
  },
  [matroskaElements.TagTrackUID]: tagTrackUidType,
  [matroskaElements.SeekHead]: seekHead,
  [matroskaElements.Seek]: seek,
  [matroskaElements.SeekID]: seekId,
  [matroskaElements.Name]: _name,
  [matroskaElements.MinCache]: minCache,
  [matroskaElements.MaxCache]: maxCache,
  [matroskaElements.SeekPosition]: seekPosition,
  [matroskaElements.Crc32]: {
    name: "Crc32",
    type: "uint8array"
  },
  [matroskaElements.MuxingApp]: muxingApp,
  [matroskaElements.WritingApp]: {
    name: "WritingApp",
    type: "string"
  },
  [matroskaElements.SegmentUUID]: {
    name: "SegmentUUID",
    type: "string"
  },
  [matroskaElements.Duration]: duration,
  [matroskaElements.CodecID]: {
    name: "CodecID",
    type: "string"
  },
  [matroskaElements.TrackType]: trackType,
  [matroskaElements.PixelWidth]: widthType,
  [matroskaElements.PixelHeight]: heightType,
  [matroskaElements.TimestampScale]: timestampScale,
  [matroskaElements.Info]: infoType,
  [matroskaElements.Title]: titleType,
  [matroskaElements.SamplingFrequency]: samplingFrequency,
  [matroskaElements.Channels]: channels,
  [matroskaElements.AlphaMode]: alphaMode,
  [matroskaElements.FlagInterlaced]: interlaced,
  [matroskaElements.BitDepth]: bitDepth,
  [matroskaElements.DisplayHeight]: displayHeight,
  [matroskaElements.DisplayWidth]: displayWidth,
  [matroskaElements.DisplayUnit]: displayUnit,
  [matroskaElements.FlagLacing]: flagLacing,
  [matroskaElements.Tags]: tags,
  [matroskaElements.Tag]: tagSegment,
  [matroskaElements.TrackNumber]: trackNumber,
  [matroskaElements.TrackUID]: trackUID,
  [matroskaElements.Colour]: color,
  [matroskaElements.Language]: language,
  [matroskaElements.DefaultDuration]: defaultDuration,
  [matroskaElements.CodecPrivate]: codecPrivate,
  [matroskaElements.BlockDuration]: blockDurationSegment,
  [matroskaElements.BlockAdditions]: blockAdditionsSegment,
  [matroskaElements.MaxBlockAdditionID]: maxBlockAdditionIdSegment,
  [matroskaElements.Audio]: audioSegment,
  [matroskaElements.Video]: videoSegment,
  [matroskaElements.FlagDefault]: flagDefault,
  [matroskaElements.ReferenceBlock]: referenceBlock,
  [matroskaElements.TrackEntry]: trackEntry,
  [matroskaElements.Timestamp]: {
    name: "Timestamp",
    type: "uint"
  },
  [matroskaElements.Tracks]: tracks,
  [matroskaElements.Block]: block,
  [matroskaElements.SimpleBlock]: simpleBlock,
  [matroskaElements.BlockGroup]: blockGroup,
  [matroskaElements.Segment]: {
    name: "Segment",
    type: "children"
  },
  [matroskaElements.Cluster]: {
    name: "Cluster",
    type: "children"
  },
  [matroskaElements.TransferCharacteristics]: transferCharacteristics,
  [matroskaElements.MatrixCoefficients]: matrixCoefficients,
  [matroskaElements.Primaries]: primaries,
  [matroskaElements.Range]: range,
  [matroskaElements.ChromaSitingHorz]: ChromaSitingHorz,
  [matroskaElements.ChromaSitingVert]: ChromaSitingVert
};

// src/file-types/detect-file-type.ts
var webmPattern = new Uint8Array([26, 69, 223, 163]);
var matchesPattern = (pattern) => {
  return (data) => {
    return pattern.every((value, index) => data[index] === value);
  };
};
var isRiffAvi2 = (data) => {
  const riffPattern = new Uint8Array([82, 73, 70, 70]);
  if (!matchesPattern(riffPattern)(data.subarray(0, 4))) {
    return false;
  }
  const fileType = data.subarray(8, 12);
  const aviPattern = new Uint8Array([65, 86, 73, 32]);
  return matchesPattern(aviPattern)(fileType);
};
var isRiffWave = (data) => {
  const riffPattern = new Uint8Array([82, 73, 70, 70]);
  if (!matchesPattern(riffPattern)(data.subarray(0, 4))) {
    return false;
  }
  const fileType = data.subarray(8, 12);
  const wavePattern = new Uint8Array([87, 65, 86, 69]);
  return matchesPattern(wavePattern)(fileType);
};
var isWebm = (data) => {
  return matchesPattern(webmPattern)(data.subarray(0, 4));
};
var isIsoBaseMedia = (data) => {
  const isoBaseMediaMp4Pattern = new TextEncoder().encode("ftyp");
  return matchesPattern(isoBaseMediaMp4Pattern)(data.subarray(4, 8));
};
var isTransportStream = (data) => {
  return data[0] === 71 && data[188] === 71;
};
var isMp3 = (data) => {
  const mpegPattern = new Uint8Array([255, 243]);
  const mpegPattern2 = new Uint8Array([255, 251]);
  const id3v4Pattern = new Uint8Array([73, 68, 51, 4]);
  const id3v3Pattern = new Uint8Array([73, 68, 51, 3]);
  const id3v2Pattern = new Uint8Array([73, 68, 51, 2]);
  const subarray = data.subarray(0, 4);
  return matchesPattern(mpegPattern)(subarray) || matchesPattern(mpegPattern2)(subarray) || matchesPattern(id3v4Pattern)(subarray) || matchesPattern(id3v3Pattern)(subarray) || matchesPattern(id3v2Pattern)(subarray);
};
var isAac = (data) => {
  const aacPattern = new Uint8Array([255, 241]);
  return matchesPattern(aacPattern)(data.subarray(0, 2));
};
var isFlac = (data) => {
  const flacPattern = new Uint8Array([102, 76, 97, 67]);
  return matchesPattern(flacPattern)(data.subarray(0, 4));
};
var isM3u = (data) => {
  return new TextDecoder("utf-8").decode(data.slice(0, 7)) === "#EXTM3U";
};

// src/file-types/bmp.ts
function getBmpDimensions(bmpData) {
  if (bmpData.length < 26) {
    return null;
  }
  const view = new DataView(bmpData.buffer, bmpData.byteOffset);
  return {
    width: view.getUint32(18, true),
    height: Math.abs(view.getInt32(22, true))
  };
}
var isBmp = (data) => {
  const bmpPattern = new Uint8Array([66, 77]);
  if (matchesPattern(bmpPattern)(data.subarray(0, 2))) {
    const bmp = getBmpDimensions(data);
    return { dimensions: bmp, type: "bmp" };
  }
  return null;
};

// src/file-types/gif.ts
var getGifDimensions = (data) => {
  const view = new DataView(data.buffer, data.byteOffset);
  const width = view.getUint16(6, true);
  const height = view.getUint16(8, true);
  return { width, height };
};
var isGif = (data) => {
  const gifPattern = new Uint8Array([71, 73, 70, 56]);
  if (matchesPattern(gifPattern)(data.subarray(0, 4))) {
    return { type: "gif", dimensions: getGifDimensions(data) };
  }
  return null;
};

// src/file-types/jpeg.ts
function getJpegDimensions(data) {
  let offset = 0;
  function readUint16BE(o) {
    return data[o] << 8 | data[o + 1];
  }
  if (readUint16BE(offset) !== 65496) {
    return null;
  }
  offset += 2;
  while (offset < data.length) {
    if (data[offset] === 255) {
      const marker = data[offset + 1];
      if (marker === 192 || marker === 194) {
        const height = readUint16BE(offset + 5);
        const width = readUint16BE(offset + 7);
        return { width, height };
      }
      const length = readUint16BE(offset + 2);
      offset += length + 2;
    } else {
      offset++;
    }
  }
  return null;
}
var isJpeg = (data) => {
  const jpegPattern = new Uint8Array([255, 216]);
  const jpeg = matchesPattern(jpegPattern)(data.subarray(0, 2));
  if (!jpeg) {
    return null;
  }
  const dim = getJpegDimensions(data);
  return { dimensions: dim, type: "jpeg" };
};

// src/file-types/pdf.ts
var isPdf = (data) => {
  if (data.length < 4) {
    return null;
  }
  const pdfPattern = new Uint8Array([37, 80, 68, 70]);
  return matchesPattern(pdfPattern)(data.subarray(0, 4)) ? { type: "pdf" } : null;
};

// src/file-types/png.ts
function getPngDimensions(pngData) {
  if (pngData.length < 24) {
    return null;
  }
  const view = new DataView(pngData.buffer, pngData.byteOffset);
  const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];
  for (let i = 0;i < 8; i++) {
    if (pngData[i] !== pngSignature[i]) {
      return null;
    }
  }
  return {
    width: view.getUint32(16, false),
    height: view.getUint32(20, false)
  };
}
var isPng = (data) => {
  const pngPattern = new Uint8Array([137, 80, 78, 71]);
  if (matchesPattern(pngPattern)(data.subarray(0, 4))) {
    const png = getPngDimensions(data);
    return { dimensions: png, type: "png" };
  }
  return null;
};

// src/file-types/webp.ts
function getWebPDimensions(bytes) {
  if (bytes.length < 30) {
    return null;
  }
  if (bytes[0] !== 82 || bytes[1] !== 73 || bytes[2] !== 70 || bytes[3] !== 70 || bytes[8] !== 87 || bytes[9] !== 69 || bytes[10] !== 66 || bytes[11] !== 80) {
    return null;
  }
  if (bytes[12] === 86 && bytes[13] === 80 && bytes[14] === 56) {
    if (bytes[15] === 32) {
      return {
        width: bytes[26] | bytes[27] << 8 & 16383,
        height: bytes[28] | bytes[29] << 8 & 16383
      };
    }
  }
  if (bytes[12] === 86 && bytes[13] === 80 && bytes[14] === 56 && bytes[15] === 76) {
    return {
      width: 1 + (bytes[21] | (bytes[22] & 63) << 8),
      height: 1 + ((bytes[22] & 192) >> 6 | bytes[23] << 2 | (bytes[24] & 15) << 10)
    };
  }
  if (bytes[12] === 86 && bytes[13] === 80 && bytes[14] === 56 && bytes[15] === 88) {
    return {
      width: 1 + (bytes[24] | bytes[25] << 8 | bytes[26] << 16),
      height: 1 + (bytes[27] | bytes[28] << 8 | bytes[29] << 16)
    };
  }
  return null;
}
var isWebp = (data) => {
  const webpPattern = new Uint8Array([82, 73, 70, 70]);
  if (matchesPattern(webpPattern)(data.subarray(0, 4))) {
    return {
      type: "webp",
      dimensions: getWebPDimensions(data)
    };
  }
  return null;
};

// src/file-types/index.ts
var detectFileType = (data) => {
  if (isRiffWave(data)) {
    return { type: "wav" };
  }
  if (isRiffAvi2(data)) {
    return { type: "riff" };
  }
  if (isAac(data)) {
    return { type: "aac" };
  }
  if (isFlac(data)) {
    return { type: "flac" };
  }
  if (isM3u(data)) {
    return { type: "m3u" };
  }
  const webp = isWebp(data);
  if (webp) {
    return webp;
  }
  if (isWebm(data)) {
    return { type: "webm" };
  }
  if (isIsoBaseMedia(data)) {
    return { type: "iso-base-media" };
  }
  if (isTransportStream(data)) {
    return { type: "transport-stream" };
  }
  if (isMp3(data)) {
    return { type: "mp3" };
  }
  const gif = isGif(data);
  if (gif) {
    return gif;
  }
  const png = isPng(data);
  if (png) {
    return png;
  }
  const pdf = isPdf(data);
  if (pdf) {
    return pdf;
  }
  const bmp = isBmp(data);
  if (bmp) {
    return bmp;
  }
  const jpeg = isJpeg(data);
  if (jpeg) {
    return jpeg;
  }
  return { type: "unknown" };
};

// src/iterator/polyfilled-arraybuffer.ts
class ResizableBuffer {
  buffer;
  uintarray;
  constructor(buffer) {
    this.buffer = buffer;
    this.uintarray = new Uint8Array(buffer);
  }
  resize(newLength) {
    if (typeof this.buffer.resize === "function") {
      this.buffer.resize(newLength);
    } else {
      const newBuffer = new ArrayBuffer(newLength);
      new Uint8Array(newBuffer).set(new Uint8Array(this.buffer).subarray(0, Math.min(this.buffer.byteLength, newLength)));
      this.buffer = newBuffer;
      this.uintarray = new Uint8Array(newBuffer);
    }
  }
}

// src/iterator/buffer-manager.ts
var makeBufferWithMaxBytes = (initialData, maxBytes) => {
  const maxByteLength = Math.min(maxBytes, 2 ** 31);
  try {
    const buf = new ArrayBuffer(initialData.byteLength, {
      maxByteLength
    });
    return new ResizableBuffer(buf);
  } catch (e) {
    if (e instanceof RangeError && maxBytes > 2 ** 27) {
      return new ResizableBuffer(new ArrayBuffer(initialData.byteLength, {
        maxByteLength: 2 ** 27
      }));
    }
    throw e;
  }
};
var bufferManager = ({
  initialData,
  maxBytes,
  counter,
  logLevel
}) => {
  const buf = makeBufferWithMaxBytes(initialData, maxBytes);
  if (!buf.buffer.resize) {
    Log.warn(logLevel, "`ArrayBuffer.resize` is not supported in this Runtime. Using slow polyfill.");
  }
  buf.uintarray.set(initialData);
  let view = new DataView(buf.uintarray.buffer);
  const destroy = () => {
    buf.uintarray = new Uint8Array(0);
    buf.resize(0);
  };
  const flushBytesRead = (force, mode) => {
    const bytesToRemove = counter.getDiscardedOffset();
    if (bytesToRemove < 3000000 && !force) {
      return { bytesRemoved: 0, removedData: null };
    }
    if (view.byteLength < bytesToRemove && !force) {
      return { bytesRemoved: 0, removedData: null };
    }
    counter.discardBytes(bytesToRemove);
    const removedData = mode === "download" ? buf.uintarray.slice(0, bytesToRemove) : null;
    const newData = buf.uintarray.slice(bytesToRemove);
    buf.uintarray.set(newData);
    buf.resize(newData.byteLength);
    view = new DataView(buf.uintarray.buffer);
    return { bytesRemoved: bytesToRemove, removedData };
  };
  const skipTo = (offset) => {
    const becomesSmaller = offset < counter.getOffset();
    if (becomesSmaller) {
      const toDecrement = counter.getOffset() - offset;
      if (toDecrement > counter.getDiscardedOffset()) {
        throw new Error("Cannot count backwards, data has already been flushed");
      }
      counter.decrement(toDecrement);
    }
    const currentOffset = counter.getOffset();
    counter.increment(offset - currentOffset);
  };
  const addData = (newData) => {
    const oldLength = buf.buffer.byteLength;
    const newLength = oldLength + newData.byteLength;
    if (newLength < oldLength) {
      throw new Error("Cannot decrement size");
    }
    if (newLength > (maxBytes ?? Infinity)) {
      throw new Error(`Exceeded maximum byte length ${maxBytes} with ${newLength}`);
    }
    buf.resize(newLength);
    buf.uintarray = new Uint8Array(buf.buffer);
    buf.uintarray.set(newData, oldLength);
    view = new DataView(buf.uintarray.buffer);
  };
  const replaceData = (newData, seekTo) => {
    buf.resize(newData.byteLength);
    buf.uintarray = new Uint8Array(buf.buffer);
    buf.uintarray.set(newData);
    view = new DataView(buf.uintarray.buffer);
    counter.setDiscardedOffset(seekTo);
    counter.decrement(counter.getOffset());
    counter.increment(seekTo);
  };
  return {
    getView: () => view,
    getUint8Array: () => buf.uintarray,
    destroy,
    addData,
    skipTo,
    removeBytesRead: flushBytesRead,
    replaceData
  };
};

// src/iterator/offset-counter.ts
var makeOffsetCounter = (initial) => {
  let offset = initial;
  let discardedBytes = 0;
  return {
    getOffset: () => offset,
    discardBytes: (bytes) => {
      discardedBytes += bytes;
    },
    increment: (bytes) => {
      if (bytes < 0) {
        throw new Error("Cannot increment by a negative amount: " + bytes);
      }
      offset += bytes;
    },
    getDiscardedBytes: () => discardedBytes,
    setDiscardedOffset: (bytes) => {
      discardedBytes = bytes;
    },
    getDiscardedOffset: () => offset - discardedBytes,
    decrement: (bytes) => {
      if (bytes < 0) {
        throw new Error("Cannot decrement by a negative amount: " + bytes);
      }
      offset -= bytes;
    }
  };
};

// src/iterator/buffer-iterator.ts
var getArrayBufferIterator = ({
  initialData,
  maxBytes,
  logLevel
}) => {
  const counter = makeOffsetCounter(0);
  const {
    getUint8Array,
    getView,
    addData,
    destroy,
    removeBytesRead,
    skipTo,
    replaceData
  } = bufferManager({ initialData, maxBytes, counter, logLevel });
  const startCheckpoint = () => {
    const checkpoint = counter.getOffset();
    return {
      returnToCheckpoint: () => {
        counter.decrement(counter.getOffset() - checkpoint);
      }
    };
  };
  const getSlice = (amount) => {
    const value = getUint8Array().slice(counter.getDiscardedOffset(), counter.getDiscardedOffset() + amount);
    counter.increment(value.length);
    return value;
  };
  const discard = (length) => {
    counter.increment(length);
  };
  const readUntilNullTerminator = () => {
    const bytes = [];
    let byte;
    while ((byte = getUint8()) !== 0) {
      bytes.push(byte);
    }
    counter.decrement(1);
    return new TextDecoder().decode(new Uint8Array(bytes));
  };
  const readUntilLineEnd = () => {
    const bytes = [];
    while (true) {
      if (bytesRemaining() === 0) {
        return null;
      }
      const byte = getUint8();
      bytes.push(byte);
      if (byte === 10) {
        break;
      }
    }
    const str = new TextDecoder().decode(new Uint8Array(bytes)).trim();
    return str;
  };
  const getUint8 = () => {
    const val = getView().getUint8(counter.getDiscardedOffset());
    counter.increment(1);
    return val;
  };
  const getEightByteNumber = (littleEndian = false) => {
    if (littleEndian) {
      const one = getUint8();
      const two = getUint8();
      const three = getUint8();
      const four = getUint8();
      const five = getUint8();
      const six = getUint8();
      const seven = getUint8();
      const eight = getUint8();
      return (eight << 56 | seven << 48 | six << 40 | five << 32 | four << 24 | three << 16 | two << 8 | one) >>> 0;
    }
    function byteArrayToBigInt(byteArray) {
      let result = BigInt(0);
      for (let i = 0;i < byteArray.length; i++) {
        result = (result << BigInt(8)) + BigInt(byteArray[i]);
      }
      return result;
    }
    const bigInt = byteArrayToBigInt([
      getUint8(),
      getUint8(),
      getUint8(),
      getUint8(),
      getUint8(),
      getUint8(),
      getUint8(),
      getUint8()
    ]);
    return Number(bigInt);
  };
  const getFourByteNumber = () => {
    const unsigned = getUint8() << 24 | getUint8() << 16 | getUint8() << 8 | getUint8();
    return unsigned >>> 0;
  };
  const getPaddedFourByteNumber = () => {
    let lastInt = 128;
    while (lastInt = getUint8(), lastInt === 128) {}
    return lastInt;
  };
  const getUint32 = () => {
    const val = getView().getUint32(counter.getDiscardedOffset());
    counter.increment(4);
    return val;
  };
  const getSyncSafeInt32 = () => {
    const val = getView().getUint32(counter.getDiscardedOffset());
    counter.increment(4);
    return (val & 2130706432) >> 3 | (val & 8323072) >> 2 | (val & 32512) >> 1 | val & 127;
  };
  const getUint64 = (littleEndian = false) => {
    const val = getView().getBigUint64(counter.getDiscardedOffset(), littleEndian);
    counter.increment(8);
    return val;
  };
  const getInt64 = (littleEndian = false) => {
    const val = getView().getBigInt64(counter.getDiscardedOffset(), littleEndian);
    counter.increment(8);
    return val;
  };
  const startBox = (size) => {
    const startOffset = counter.getOffset();
    return {
      discardRest: () => discard(size - (counter.getOffset() - startOffset)),
      expectNoMoreBytes: () => {
        const remaining = size - (counter.getOffset() - startOffset);
        if (remaining !== 0) {
          throw new Error("expected 0 bytes, got " + remaining);
        }
      }
    };
  };
  const getUint32Le = () => {
    const val = getView().getUint32(counter.getDiscardedOffset(), true);
    counter.increment(4);
    return val;
  };
  const getInt32Le = () => {
    const val = getView().getInt32(counter.getDiscardedOffset(), true);
    counter.increment(4);
    return val;
  };
  const getInt32 = () => {
    const val = getView().getInt32(counter.getDiscardedOffset());
    counter.increment(4);
    return val;
  };
  const bytesRemaining = () => {
    return getUint8Array().byteLength - counter.getDiscardedOffset();
  };
  const readExpGolomb = () => {
    if (!bitReadingMode) {
      throw new Error("Not in bit reading mode");
    }
    let zerosCount = 0;
    while (getBits(1) === 0) {
      zerosCount++;
    }
    let suffix = 0;
    for (let i = 0;i < zerosCount; i++) {
      suffix = suffix << 1 | getBits(1);
    }
    return (1 << zerosCount) - 1 + suffix;
  };
  const peekB = (length) => {
    Log.info("info", [...getSlice(length)].map((b) => b.toString(16).padStart(2, "0")));
    counter.decrement(length);
  };
  const peekD = (length) => {
    Log.info("info", [...getSlice(length)].map((b) => b.toString(16).padStart(2, "0")));
    counter.decrement(length);
  };
  const leb128 = () => {
    let result = 0;
    let shift = 0;
    let byte;
    do {
      byte = getBits(8);
      result |= (byte & 127) << shift;
      shift += 7;
    } while (byte >= 128);
    return result;
  };
  let bitIndex = 0;
  const stopReadingBits = () => {
    bitIndex = 0;
    bitReadingMode = false;
  };
  let byteToShift = 0;
  let bitReadingMode = false;
  const startReadingBits = () => {
    bitReadingMode = true;
    byteToShift = getUint8();
  };
  const getFlacCodecNumber = () => {
    let ones = 0;
    let bits = 0;
    while ((++bits || true) && getBits(1) === 1) {
      ones++;
    }
    if (ones === 0) {
      return getBits(7);
    }
    const bitArray = [];
    const firstByteBits = 8 - ones - 1;
    for (let i = 0;i < firstByteBits; i++) {
      bitArray.unshift(getBits(1));
    }
    const extraBytes = ones - 1;
    for (let i = 0;i < extraBytes; i++) {
      for (let j = 0;j < 8; j++) {
        const val = getBits(1);
        if (j < 2) {
          continue;
        }
        bitArray.unshift(val);
      }
    }
    const encoded = bitArray.reduce((acc, bit, index) => {
      return acc | bit << index;
    }, 0);
    return encoded;
  };
  const getBits = (bits) => {
    let result = 0;
    let bitsCollected = 0;
    while (bitsCollected < bits) {
      if (bitIndex >= 8) {
        bitIndex = 0;
        byteToShift = getUint8();
      }
      const remainingBitsInByte = 8 - bitIndex;
      const bitsToReadNow = Math.min(bits - bitsCollected, remainingBitsInByte);
      const mask = (1 << bitsToReadNow) - 1;
      const shift = remainingBitsInByte - bitsToReadNow;
      result <<= bitsToReadNow;
      result |= byteToShift >> shift & mask;
      bitsCollected += bitsToReadNow;
      bitIndex += bitsToReadNow;
    }
    return result;
  };
  return {
    startReadingBits,
    stopReadingBits,
    skipTo,
    addData,
    counter,
    peekB,
    peekD,
    getBits,
    bytesRemaining,
    leb128,
    removeBytesRead,
    discard,
    getEightByteNumber,
    getFourByteNumber,
    getSlice,
    getAtom: () => {
      const atom = getSlice(4);
      return new TextDecoder().decode(atom);
    },
    detectFileType: () => {
      return detectFileType(getUint8Array());
    },
    getPaddedFourByteNumber,
    getMatroskaSegmentId: () => {
      if (bytesRemaining() === 0) {
        return null;
      }
      const first = getSlice(1);
      const firstOneString = `0x${Array.from(new Uint8Array(first)).map((b) => {
        return b.toString(16).padStart(2, "0");
      }).join("")}`;
      if (knownIdsWithOneLength.includes(firstOneString)) {
        return firstOneString;
      }
      if (bytesRemaining() === 0) {
        return null;
      }
      const firstTwo = getSlice(1);
      const firstTwoString = `${firstOneString}${Array.from(new Uint8Array(firstTwo)).map((b) => {
        return b.toString(16).padStart(2, "0");
      }).join("")}`;
      if (knownIdsWithTwoLength.includes(firstTwoString)) {
        return firstTwoString;
      }
      if (bytesRemaining() === 0) {
        return null;
      }
      const firstThree = getSlice(1);
      const firstThreeString = `${firstTwoString}${Array.from(new Uint8Array(firstThree)).map((b) => {
        return b.toString(16).padStart(2, "0");
      }).join("")}`;
      if (knownIdsWithThreeLength.includes(firstThreeString)) {
        return firstThreeString;
      }
      if (bytesRemaining() === 0) {
        return null;
      }
      const segmentId = getSlice(1);
      return `${firstThreeString}${Array.from(new Uint8Array(segmentId)).map((b) => {
        return b.toString(16).padStart(2, "0");
      }).join("")}`;
    },
    getVint: () => {
      if (bytesRemaining() === 0) {
        return null;
      }
      const firstByte = getUint8();
      const totalLength = firstByte;
      if (totalLength === 0) {
        return 0;
      }
      let actualLength = 0;
      while ((totalLength >> 7 - actualLength & 1) === 0) {
        actualLength++;
      }
      if (bytesRemaining() < actualLength) {
        return null;
      }
      const slice = getSlice(actualLength);
      const d = [firstByte, ...Array.from(new Uint8Array(slice))];
      actualLength += 1;
      let value = 0;
      value = totalLength & 255 >> actualLength;
      for (let i = 1;i < actualLength; i++) {
        value = value << 8 | d[i];
      }
      if (value === -1) {
        return Infinity;
      }
      return value;
    },
    getUint8,
    getEBML: () => {
      const val = getUint8();
      const actualValue = val & 127;
      return actualValue;
    },
    getInt8: () => {
      const val = getView().getInt8(counter.getDiscardedOffset());
      counter.increment(1);
      return val;
    },
    getUint16: () => {
      const val = getView().getUint16(counter.getDiscardedOffset());
      counter.increment(2);
      return val;
    },
    getUint16Le: () => {
      const val = getView().getUint16(counter.getDiscardedOffset(), true);
      counter.increment(2);
      return val;
    },
    getUint24: () => {
      const val1 = getView().getUint8(counter.getDiscardedOffset());
      const val2 = getView().getUint8(counter.getDiscardedOffset() + 1);
      const val3 = getView().getUint8(counter.getDiscardedOffset() + 2);
      counter.increment(3);
      return val1 << 16 | val2 << 8 | val3;
    },
    getInt24: () => {
      const val1 = getView().getInt8(counter.getDiscardedOffset());
      const val2 = getView().getUint8(counter.getDiscardedOffset() + 1);
      const val3 = getView().getUint8(counter.getDiscardedOffset() + 2);
      counter.increment(3);
      return val1 << 16 | val2 << 8 | val3;
    },
    getInt16: () => {
      const val = getView().getInt16(counter.getDiscardedOffset());
      counter.increment(2);
      return val;
    },
    getUint32,
    getUint64,
    getInt64,
    getFixedPointUnsigned1616Number: () => {
      const val = getUint32();
      return val / 2 ** 16;
    },
    getFixedPointSigned1616Number: () => {
      const val = getInt32();
      return val / 2 ** 16;
    },
    getFixedPointSigned230Number: () => {
      const val = getInt32();
      return val / 2 ** 30;
    },
    getPascalString: () => {
      const val = getSlice(32);
      return [...Array.from(new Uint8Array(val))];
    },
    getUint(length) {
      const bytes = getSlice(length);
      const numbers = [...Array.from(new Uint8Array(bytes))];
      return numbers.reduce((acc, byte, index) => acc + (byte << 8 * (numbers.length - index - 1)), 0);
    },
    getByteString(length, trimTrailingZeroes) {
      let bytes = getSlice(length);
      while (trimTrailingZeroes && bytes[bytes.length - 1] === 0) {
        bytes = bytes.slice(0, -1);
      }
      return new TextDecoder().decode(bytes).trim();
    },
    planBytes: (size) => {
      const currentOffset = counter.getOffset();
      return {
        discardRest: () => {
          const toDiscard = size - (counter.getOffset() - currentOffset);
          if (toDiscard < 0) {
            throw new Error("read too many bytes");
          }
          return getSlice(toDiscard);
        }
      };
    },
    getFloat64: () => {
      const val = getView().getFloat64(counter.getDiscardedOffset());
      counter.increment(8);
      return val;
    },
    readUntilNullTerminator,
    getFloat32: () => {
      const val = getView().getFloat32(counter.getDiscardedOffset());
      counter.increment(4);
      return val;
    },
    getUint32Le,
    getInt32Le,
    getInt32,
    destroy,
    startBox,
    readExpGolomb,
    startCheckpoint,
    getFlacCodecNumber,
    readUntilLineEnd,
    getSyncSafeInt32,
    replaceData
  };
};

// src/containers/webm/av1-codec-private.ts
var parseAv1PrivateData = (data, colrAtom) => {
  const iterator = getArrayBufferIterator({
    initialData: data,
    maxBytes: data.byteLength,
    logLevel: "error"
  });
  iterator.startReadingBits();
  if (iterator.getBits(1) !== 1) {
    iterator.destroy();
    throw new Error("Expected av1 private data to be version 1");
  }
  const version = iterator.getBits(7);
  if (version !== 1) {
    iterator.destroy();
    throw new Error(`Expected av1 private data to be version 1, got ${version}`);
  }
  let str = "av01.";
  const seqProfile = iterator.getBits(3);
  str += seqProfile;
  str += ".";
  const seq_level_idx = iterator.getBits(5);
  const seq_tier_0 = iterator.getBits(1);
  str += String(seq_level_idx).padStart(2, "0");
  str += seq_tier_0 ? "H" : "M";
  str += ".";
  const high_bitdepth = iterator.getBits(1);
  const twelve_bit = iterator.getBits(1);
  const bitDepth2 = high_bitdepth && seqProfile === 2 ? twelve_bit ? 12 : 10 : high_bitdepth ? 10 : 8;
  str += bitDepth2.toString().padStart(2, "0");
  str += ".";
  const mono_chrome = iterator.getBits(1);
  str += mono_chrome ? "1" : "0";
  str += ".";
  const subsampling_x = iterator.getBits(1);
  str += subsampling_x ? "1" : "0";
  const subsampling_y = iterator.getBits(1);
  str += subsampling_y ? "1" : "0";
  const chroma_sample_position = iterator.getBits(2);
  str += subsampling_x && subsampling_y ? chroma_sample_position === 1 ? "1" : "0" : "0";
  str += ".";
  if (colrAtom && colrAtom.colorType === "transfer-characteristics") {
    str += colrAtom.primaries.toString().padStart(2, "0");
    str += ".";
    str += colrAtom.transfer.toString().padStart(2, "0");
    str += ".";
    str += colrAtom.matrixIndex.toString().padStart(2, "0");
    str += ".";
    str += colrAtom.fullRangeFlag ? "1" : "0";
  } else {
    str += "01";
    str += ".";
    str += "01";
    str += ".";
    str += "01";
    str += ".";
    str += "0";
  }
  const suffix = ".0.110.01.01.01.0";
  if (str.endsWith(suffix)) {
    str = str.slice(0, -suffix.length);
  }
  iterator.destroy();
  return str;
};

// src/get-video-codec.ts
var getVideoCodec = (state) => {
  const track = getTracks(state, true);
  return track.find((t) => t.type === "video")?.codecEnum ?? null;
};
var hasVideoCodec = (state) => {
  return getHasTracks(state, true);
};
var getVideoPrivateData = (trakBox) => {
  const videoSample = getStsdVideoConfig(trakBox);
  const avccBox = getAvccBox(trakBox);
  const hvccBox = getHvccBox(trakBox);
  const av1cBox = getAv1CBox(trakBox);
  if (!videoSample) {
    return null;
  }
  if (avccBox) {
    return { type: "avc-sps-pps", data: avccBox.privateData };
  }
  if (hvccBox) {
    return { type: "hvcc-data", data: hvccBox.privateData };
  }
  if (av1cBox) {
    return { type: "av1c-data", data: av1cBox.privateData };
  }
  return null;
};
var getIsoBmColrConfig = (trakBox) => {
  const videoSample = getStsdVideoConfig(trakBox);
  if (!videoSample) {
    return null;
  }
  const colrAtom = getColrBox(videoSample);
  if (!colrAtom) {
    return null;
  }
  if (colrAtom.colorType !== "transfer-characteristics") {
    return null;
  }
  return {
    fullRange: colrAtom.fullRangeFlag,
    matrix: getMatrixCoefficientsFromIndex(colrAtom.matrixIndex),
    primaries: getPrimariesFromIndex(colrAtom.primaries),
    transfer: getTransferCharacteristicsFromIndex(colrAtom.transfer)
  };
};
var getVideoCodecString = (trakBox) => {
  const videoSample = getStsdVideoConfig(trakBox);
  const avccBox = getAvccBox(trakBox);
  if (!videoSample) {
    return null;
  }
  if (avccBox) {
    return `${videoSample.format}.${avccBox.configurationString}`;
  }
  const hvccBox = getHvccBox(trakBox);
  if (hvccBox) {
    return `${videoSample.format}.${hvccBox.configurationString}`;
  }
  const av1cBox = getAv1CBox(trakBox);
  if (av1cBox) {
    const colrAtom = getColrBox(videoSample);
    return parseAv1PrivateData(av1cBox.privateData, colrAtom);
  }
  const vpccBox = getVpccBox(trakBox);
  if (vpccBox) {
    return `${videoSample.format}.${vpccBox.codecString}`;
  }
  return videoSample.format;
};

// src/normalize-video-rotation.ts
var normalizeVideoRotation = (rotation) => {
  return (rotation % 360 + 360) % 360;
};

// src/webcodecs-timescale.ts
var WEBCODECS_TIMESCALE = 1e6;

// src/containers/iso-base-media/color-to-webcodecs-colors.ts
var mediaParserAdvancedColorToWebCodecsColor = (color2) => {
  return {
    transfer: color2.transfer,
    matrix: color2.matrix,
    primaries: color2.primaries,
    fullRange: color2.fullRange
  };
};

// src/aac-codecprivate.ts
var getSampleRateFromSampleFrequencyIndex = (samplingFrequencyIndex) => {
  switch (samplingFrequencyIndex) {
    case 0:
      return 96000;
    case 1:
      return 88200;
    case 2:
      return 64000;
    case 3:
      return 48000;
    case 4:
      return 44100;
    case 5:
      return 32000;
    case 6:
      return 24000;
    case 7:
      return 22050;
    case 8:
      return 16000;
    case 9:
      return 12000;
    case 10:
      return 11025;
    case 11:
      return 8000;
    case 12:
      return 7350;
    default:
      throw new Error(`Unexpected sampling frequency index ${samplingFrequencyIndex}`);
  }
};
var getConfigForSampleRate = (sampleRate) => {
  if (sampleRate === 96000) {
    return 0;
  }
  if (sampleRate === 88200) {
    return 1;
  }
  if (sampleRate === 64000) {
    return 2;
  }
  if (sampleRate === 48000) {
    return 3;
  }
  if (sampleRate === 44100) {
    return 4;
  }
  if (sampleRate === 32000) {
    return 5;
  }
  if (sampleRate === 24000) {
    return 6;
  }
  if (sampleRate === 22050) {
    return 7;
  }
  if (sampleRate === 16000) {
    return 8;
  }
  if (sampleRate === 12000) {
    return 9;
  }
  if (sampleRate === 11025) {
    return 10;
  }
  if (sampleRate === 8000) {
    return 11;
  }
  if (sampleRate === 7350) {
    return 12;
  }
  throw new Error(`Unexpected sample rate ${sampleRate}`);
};
var createAacCodecPrivate = ({
  audioObjectType,
  sampleRate,
  channelConfiguration,
  codecPrivate: codecPrivate2
}) => {
  if (codecPrivate2 !== null && codecPrivate2.length > 2) {
    return codecPrivate2;
  }
  const bits = `${audioObjectType.toString(2).padStart(5, "0")}${getConfigForSampleRate(sampleRate).toString(2).padStart(4, "0")}${channelConfiguration.toString(2).padStart(4, "0")}000`;
  if (bits.length !== 16) {
    throw new Error("Invalid AAC codec private " + bits.length);
  }
  if (channelConfiguration === 0 || channelConfiguration > 7) {
    throw new Error("Invalid channel configuration " + channelConfiguration);
  }
  const firstByte = parseInt(bits.slice(0, 8), 2);
  const secondByte = parseInt(bits.slice(8, 16), 2);
  return new Uint8Array([firstByte, secondByte]);
};
var parseAacCodecPrivate = (bytes) => {
  if (bytes.length < 2) {
    throw new Error("Invalid AAC codec private length");
  }
  const bits = [...bytes].map((b) => b.toString(2).padStart(8, "0")).join("");
  let offset = 0;
  const audioObjectType = parseInt(bits.slice(offset, offset + 5), 2);
  offset += 5;
  const samplingFrequencyIndex = parseInt(bits.slice(offset, offset + 4), 2);
  offset += 4;
  if (samplingFrequencyIndex === 15) {
    offset += 24;
  }
  const channelConfiguration = parseInt(bits.slice(offset, offset + 4), 2);
  offset += 4;
  if (audioObjectType === 5) {
    const extensionSamplingFrequencyIndex = parseInt(bits.slice(offset, offset + 4), 2);
    offset += 4;
    const newAudioObjectType = parseInt(bits.slice(offset, offset + 5), 2);
    offset += 5;
    return {
      audioObjectType: newAudioObjectType,
      sampleRate: getSampleRateFromSampleFrequencyIndex(extensionSamplingFrequencyIndex),
      channelConfiguration
    };
  }
  const sampleRate = getSampleRateFromSampleFrequencyIndex(samplingFrequencyIndex);
  return {
    audioObjectType,
    sampleRate,
    channelConfiguration
  };
};
var mapAudioObjectTypeToCodecString = (audioObjectType) => {
  switch (audioObjectType) {
    case 1:
      return "mp4a.40.2";
    case 2:
      return "mp4a.40.5";
    case 3:
      return "mp4a.40.29";
    case 4:
      return "mp4a.40.1";
    case 5:
      return "mp4a.40.3";
    case 6:
      return "mp4a.40.4";
    case 17:
      return "mp4a.40.17";
    case 23:
      return "mp4a.40.23";
    default:
      throw new Error(`Unexpected audio object type ${audioObjectType}`);
  }
};

// src/containers/iso-base-media/get-actual-number-of-channels.ts
var getActualDecoderParameters = ({
  audioCodec,
  codecPrivate: codecPrivate2,
  numberOfChannels,
  sampleRate
}) => {
  if (audioCodec !== "aac") {
    return {
      numberOfChannels,
      sampleRate,
      codecPrivate: codecPrivate2
    };
  }
  if (codecPrivate2 === null) {
    return { numberOfChannels, sampleRate, codecPrivate: codecPrivate2 };
  }
  if (codecPrivate2.type !== "aac-config") {
    throw new Error("Expected AAC codec private data");
  }
  const parsed = parseAacCodecPrivate(codecPrivate2.data);
  const actual = createAacCodecPrivate({
    ...parsed,
    codecPrivate: codecPrivate2.data
  });
  return {
    numberOfChannels: parsed.channelConfiguration,
    sampleRate: parsed.sampleRate,
    codecPrivate: { type: "aac-config", data: actual }
  };
};

// src/containers/iso-base-media/get-video-codec-from-iso-track.ts
var getVideoCodecFromIsoTrak = (trakBox) => {
  const stsdBox = getStsdBox(trakBox);
  if (stsdBox && stsdBox.type === "stsd-box") {
    const videoSample = stsdBox.samples.find((s) => s.type === "video");
    if (videoSample && videoSample.type === "video") {
      if (videoSample.format === "hvc1" || videoSample.format === "hev1") {
        return "h265";
      }
      if (videoSample.format === "avc1") {
        return "h264";
      }
      if (videoSample.format === "av01") {
        return "av1";
      }
      if (videoSample.format === "vp09") {
        return "vp9";
      }
      if (videoSample.format === "ap4h") {
        return "prores";
      }
      if (videoSample.format === "ap4x") {
        return "prores";
      }
      if (videoSample.format === "apch") {
        return "prores";
      }
      if (videoSample.format === "apcn") {
        return "prores";
      }
      if (videoSample.format === "apcs") {
        return "prores";
      }
      if (videoSample.format === "apco") {
        return "prores";
      }
      if (videoSample.format === "aprh") {
        return "prores";
      }
      if (videoSample.format === "aprn") {
        return "prores";
      }
    }
  }
  throw new Error("Could not find video codec");
};

// src/containers/iso-base-media/mdat/get-editlist.ts
var findTrackStartTimeInSeconds = ({
  movieTimeScale,
  trakBox
}) => {
  const elstBox = getElstBox(trakBox);
  if (!elstBox) {
    return 0;
  }
  const { entries } = elstBox;
  let dwellTime = 0;
  for (const entry of entries) {
    const { editDuration, mediaTime } = entry;
    if (mediaTime !== -1) {
      continue;
    }
    dwellTime += editDuration;
  }
  return dwellTime / movieTimeScale;
};
var findTrackMediaTimeOffsetInTrackTimescale = ({
  trakBox
}) => {
  const elstBox = getElstBox(trakBox);
  if (!elstBox) {
    return 0;
  }
  const { entries } = elstBox;
  let dwellTime = 0;
  for (const entry of entries) {
    const { mediaTime } = entry;
    if (mediaTime === -1) {
      continue;
    }
    dwellTime += mediaTime;
  }
  return dwellTime;
};

// src/containers/iso-base-media/make-track.ts
var makeBaseMediaTrack = (trakBox, startTimeInSeconds) => {
  const tkhdBox = getTkhdBox(trakBox);
  const videoDescriptors = getVideoDescriptors(trakBox);
  const timescaleAndDuration = getTimescaleAndDuration(trakBox);
  if (!tkhdBox) {
    throw new Error("Expected tkhd box in trak box");
  }
  if (!timescaleAndDuration) {
    throw new Error("Expected timescale and duration in trak box");
  }
  if (trakBoxContainsAudio(trakBox)) {
    const numberOfChannels = getNumberOfChannelsFromTrak(trakBox);
    if (numberOfChannels === null) {
      throw new Error("Could not find number of channels");
    }
    const sampleRate = getSampleRate(trakBox);
    if (sampleRate === null) {
      throw new Error("Could not find sample rate");
    }
    const { codecString, description } = getAudioCodecStringFromTrak(trakBox);
    const codecPrivate2 = getCodecPrivateFromTrak(trakBox) ?? description ?? null;
    const codecEnum = getAudioCodecFromTrack(trakBox);
    const actual = getActualDecoderParameters({
      audioCodec: codecEnum,
      codecPrivate: codecPrivate2 ?? null,
      numberOfChannels,
      sampleRate
    });
    return {
      type: "audio",
      trackId: tkhdBox.trackId,
      originalTimescale: timescaleAndDuration.timescale,
      codec: codecString,
      numberOfChannels: actual.numberOfChannels,
      sampleRate: actual.sampleRate,
      description: actual.codecPrivate?.data ?? undefined,
      codecData: actual.codecPrivate,
      codecEnum,
      startInSeconds: startTimeInSeconds,
      timescale: WEBCODECS_TIMESCALE,
      trackMediaTimeOffsetInTrackTimescale: findTrackMediaTimeOffsetInTrackTimescale({
        trakBox
      })
    };
  }
  if (!trakBoxContainsVideo(trakBox)) {
    return {
      type: "other",
      trackId: tkhdBox.trackId,
      originalTimescale: timescaleAndDuration.timescale,
      trakBox,
      startInSeconds: startTimeInSeconds,
      timescale: WEBCODECS_TIMESCALE,
      trackMediaTimeOffsetInTrackTimescale: findTrackMediaTimeOffsetInTrackTimescale({
        trakBox
      })
    };
  }
  const videoSample = getStsdVideoConfig(trakBox);
  if (!videoSample) {
    throw new Error("No video sample");
  }
  const sampleAspectRatio = getSampleAspectRatio(trakBox);
  const aspectRatioApplied = applyAspectRatios({
    dimensions: videoSample,
    sampleAspectRatio,
    displayAspectRatio: getDisplayAspectRatio({
      sampleAspectRatio,
      nativeDimensions: videoSample
    })
  });
  const { displayAspectHeight, displayAspectWidth, height, rotation, width } = applyTkhdBox(aspectRatioApplied, tkhdBox);
  const codec = getVideoCodecString(trakBox);
  if (!codec) {
    throw new Error("Could not find video codec");
  }
  const privateData = getVideoPrivateData(trakBox);
  const advancedColor = getIsoBmColrConfig(trakBox) ?? {
    fullRange: null,
    matrix: null,
    primaries: null,
    transfer: null
  };
  const track = {
    m3uStreamFormat: null,
    type: "video",
    trackId: tkhdBox.trackId,
    description: videoDescriptors ?? undefined,
    originalTimescale: timescaleAndDuration.timescale,
    codec,
    sampleAspectRatio: getSampleAspectRatio(trakBox),
    width,
    height,
    codedWidth: videoSample.width,
    codedHeight: videoSample.height,
    displayAspectWidth,
    displayAspectHeight,
    rotation: normalizeVideoRotation(0 - rotation),
    codecData: privateData,
    colorSpace: mediaParserAdvancedColorToWebCodecsColor(advancedColor),
    advancedColor,
    codecEnum: getVideoCodecFromIsoTrak(trakBox),
    fps: getFpsFromMp4TrakBox(trakBox),
    startInSeconds: startTimeInSeconds,
    timescale: WEBCODECS_TIMESCALE,
    trackMediaTimeOffsetInTrackTimescale: findTrackMediaTimeOffsetInTrackTimescale({
      trakBox
    })
  };
  return track;
};

// src/containers/avc/codec-string.ts
var getCodecStringFromSpsAndPps = (sps) => {
  return `avc1.${sps.spsData.profile.toString(16).padStart(2, "0")}${sps.spsData.compatibility.toString(16).padStart(2, "0")}${sps.spsData.level.toString(16).padStart(2, "0")}`;
};

// src/combine-uint8-arrays.ts
var combineUint8Arrays = (arrays) => {
  if (arrays.length === 0) {
    return new Uint8Array([]);
  }
  if (arrays.length === 1) {
    return arrays[0];
  }
  let totalLength = 0;
  for (const array of arrays) {
    totalLength += array.length;
  }
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const array of arrays) {
    result.set(array, offset);
    offset += array.length;
  }
  return result;
};

// src/truthy.ts
function truthy(value) {
  return Boolean(value);
}

// src/containers/avc/create-sps-pps-data.ts
function serializeUint16(value) {
  const buffer = new ArrayBuffer(2);
  const view = new DataView(buffer);
  view.setUint16(0, value);
  return new Uint8Array(buffer);
}
var createSpsPpsData = (avc1Profile) => {
  return combineUint8Arrays([
    new Uint8Array([
      1,
      avc1Profile.sps.spsData.profile,
      avc1Profile.sps.spsData.compatibility,
      avc1Profile.sps.spsData.level,
      255,
      225
    ]),
    serializeUint16(avc1Profile.sps.sps.length),
    avc1Profile.sps.sps,
    new Uint8Array([1]),
    serializeUint16(avc1Profile.pps.pps.length),
    avc1Profile.pps.pps,
    [66, 77, 88].some((b) => avc1Profile.sps.spsData.profile === b) ? null : new Uint8Array([253, 248, 248, 0])
  ].filter(truthy));
};

// src/add-avc-profile-to-track.ts
var addAvcProfileToTrack = (track, avc1Profile) => {
  if (avc1Profile === null) {
    return track;
  }
  return {
    ...track,
    codec: getCodecStringFromSpsAndPps(avc1Profile.sps),
    codecData: { type: "avc-sps-pps", data: createSpsPpsData(avc1Profile) },
    description: undefined
  };
};

// src/containers/riff/timescale.ts
var MEDIA_PARSER_RIFF_TIMESCALE = 1e6;

// src/containers/riff/get-tracks-from-avi.ts
var TO_BE_OVERRIDDEN_LATER = "to-be-overriden-later";
var getNumberOfTracks = (structure) => {
  const avihBox = getAvihBox(structure);
  if (avihBox) {
    return avihBox.streams;
  }
  throw new Error("No avih box found");
};
var makeAviAudioTrack = ({
  strf,
  index
}) => {
  if (strf.formatTag !== 255) {
    throw new Error(`Unsupported audio format ${strf.formatTag}`);
  }
  return {
    type: "audio",
    codec: "mp4a.40.2",
    codecData: { type: "aac-config", data: new Uint8Array([18, 16]) },
    codecEnum: "aac",
    description: new Uint8Array([18, 16]),
    numberOfChannels: strf.numberOfChannels,
    sampleRate: strf.sampleRate,
    originalTimescale: MEDIA_PARSER_RIFF_TIMESCALE,
    trackId: index,
    startInSeconds: 0,
    timescale: WEBCODECS_TIMESCALE,
    trackMediaTimeOffsetInTrackTimescale: 0
  };
};
var makeAviVideoTrack = ({
  strh,
  strf,
  index
}) => {
  if (strh.handler !== "H264") {
    throw new Error(`Unsupported video codec ${strh.handler}`);
  }
  return {
    codecData: null,
    codec: TO_BE_OVERRIDDEN_LATER,
    codecEnum: "h264",
    codedHeight: strf.height,
    codedWidth: strf.width,
    width: strf.width,
    height: strf.height,
    type: "video",
    displayAspectHeight: strf.height,
    originalTimescale: MEDIA_PARSER_RIFF_TIMESCALE,
    description: undefined,
    m3uStreamFormat: null,
    trackId: index,
    colorSpace: {
      fullRange: null,
      matrix: null,
      primaries: null,
      transfer: null
    },
    advancedColor: {
      fullRange: null,
      matrix: null,
      primaries: null,
      transfer: null
    },
    displayAspectWidth: strf.width,
    rotation: 0,
    sampleAspectRatio: {
      numerator: 1,
      denominator: 1
    },
    fps: strh.rate / strh.scale,
    startInSeconds: 0,
    timescale: WEBCODECS_TIMESCALE,
    trackMediaTimeOffsetInTrackTimescale: 0
  };
};
var getTracksFromAvi = (structure, state) => {
  const tracks2 = [];
  const boxes = getStrlBoxes(structure);
  let i = 0;
  for (const box of boxes) {
    const strh = getStrhBox(box.children);
    if (!strh) {
      continue;
    }
    const { strf } = strh;
    if (strf.type === "strf-box-video") {
      tracks2.push(addAvcProfileToTrack(makeAviVideoTrack({ strh, strf, index: i }), state.riff.getAvcProfile()));
    } else if (strh.fccType === "auds") {
      tracks2.push(makeAviAudioTrack({ strf, index: i }));
    } else {
      throw new Error(`Unsupported track type ${strh.fccType}`);
    }
    i++;
  }
  return tracks2;
};
var hasAllTracksFromAvi = (state) => {
  try {
    const structure = state.structure.getRiffStructure();
    const numberOfTracks = getNumberOfTracks(structure);
    const tracks2 = getTracksFromAvi(structure, state);
    return tracks2.length === numberOfTracks && !tracks2.find((t) => t.type === "video" && t.codec === TO_BE_OVERRIDDEN_LATER);
  } catch {
    return false;
  }
};

// src/containers/transport-stream/traversal.ts
var findProgramAssociationTableOrThrow = (structure) => {
  const box = structure.boxes.find((b) => b.type === "transport-stream-pat-box");
  if (!box) {
    throw new Error("No PAT box found");
  }
  return box;
};
var findProgramMapOrNull = (structure) => {
  const box = structure.boxes.find((b) => b.type === "transport-stream-pmt-box");
  if (!box) {
    return null;
  }
  return box;
};
var findProgramMapTableOrThrow = (structure) => {
  const box = findProgramMapOrNull(structure);
  if (!box) {
    throw new Error("No PMT box found");
  }
  return box;
};
var getProgramForId = (structure, packetIdentifier) => {
  const box = findProgramAssociationTableOrThrow(structure);
  const entry = box.pat.find((e) => e.programMapIdentifier === packetIdentifier);
  return entry ?? null;
};
var getStreamForId = (structure, packetIdentifier) => {
  const box = findProgramMapTableOrThrow(structure);
  const entry = box.streams.find((e) => e.pid === packetIdentifier);
  return entry ?? null;
};

// src/containers/transport-stream/get-tracks.ts
var filterStreamsBySupportedTypes = (streams) => {
  return streams.filter((stream) => stream.streamType === 27 || stream.streamType === 15);
};
var getTracksFromTransportStream = (parserState) => {
  const structure = parserState.structure.getTsStructure();
  const programMapTable = findProgramMapTableOrThrow(structure);
  const parserTracks = parserState.callbacks.tracks.getTracks();
  const mapped = filterStreamsBySupportedTypes(programMapTable.streams).map((stream) => {
    return parserTracks.find((track) => track.trackId === stream.pid);
  }).filter(truthy);
  if (mapped.length !== filterStreamsBySupportedTypes(programMapTable.streams).length) {
    throw new Error("Not all tracks found");
  }
  return mapped;
};
var hasAllTracksFromTransportStream = (parserState) => {
  try {
    getTracksFromTransportStream(parserState);
    return true;
  } catch {
    return false;
  }
};

// src/make-hvc1-codec-strings.ts
var getHvc1CodecString = (data) => {
  const configurationVersion = data.getUint8();
  if (configurationVersion !== 1) {
    throw new Error(`Unsupported HVCC version ${configurationVersion}`);
  }
  const generalProfileSpaceTierFlagAndIdc = data.getUint8();
  let generalProfileCompatibility = data.getUint32();
  const generalProfileSpace = generalProfileSpaceTierFlagAndIdc >> 6;
  const generalTierFlag = (generalProfileSpaceTierFlagAndIdc & 32) >> 5;
  const generalProfileIdc = generalProfileSpaceTierFlagAndIdc & 31;
  const generalConstraintIndicator = data.getSlice(6);
  const generalLevelIdc = data.getUint8();
  let profileId = 0;
  for (let i = 0;i < 32; i++) {
    profileId |= generalProfileCompatibility & 1;
    if (i === 31)
      break;
    profileId <<= 1;
    generalProfileCompatibility >>= 1;
  }
  const profileSpaceChar = generalProfileSpace === 0 ? "" : generalProfileSpace === 1 ? "A" : generalProfileSpace === 2 ? "B" : "C";
  const generalTierChar = generalTierFlag === 0 ? "L" : "H";
  let hasByte = false;
  let generalConstraintString = "";
  for (let i = 5;i >= 0; i--) {
    if (generalConstraintIndicator[i] || hasByte) {
      generalConstraintString = generalConstraintIndicator[i].toString(16) + generalConstraintString;
      hasByte = true;
    }
  }
  return `${profileSpaceChar}${generalProfileIdc.toString(16)}.${profileId.toString(16)}.${generalTierChar}${generalLevelIdc}${generalConstraintString ? "." : ""}${generalConstraintString}`;
};

// src/containers/webm/traversal.ts
var getMainSegment = (segments) => {
  return segments.find((s) => s.type === "Segment") ?? null;
};
var getTrackCodec = (track) => {
  const child = track.value.find((b) => b.type === "CodecID");
  return child ?? null;
};
var getTrackTimestampScale = (track) => {
  const child = track.value.find((b) => b.type === "TrackTimestampScale");
  if (!child) {
    return null;
  }
  if (child.type !== "TrackTimestampScale") {
    throw new Error("Expected TrackTimestampScale");
  }
  return child.value;
};
var getTrackId = (track) => {
  const trackId = track.value.find((b) => b.type === "TrackNumber");
  if (!trackId || trackId.type !== "TrackNumber") {
    throw new Error("Expected track number segment");
  }
  return trackId.value.value;
};
var getCodecSegment = (track) => {
  const codec = track.value.find((b) => b.type === "CodecID");
  if (!codec || codec.type !== "CodecID") {
    return null;
  }
  return codec;
};
var getColourSegment = (track) => {
  const videoSegment2 = getVideoSegment(track);
  if (!videoSegment2) {
    return null;
  }
  const colour = videoSegment2.value.find((b) => b.type === "Colour");
  if (!colour || colour.type !== "Colour") {
    return null;
  }
  return colour;
};
var getTransferCharacteristicsSegment = (color2) => {
  if (!color2 || color2.type !== "Colour") {
    return null;
  }
  const box = color2.value.find((b) => b.type === "TransferCharacteristics");
  if (!box || box.type !== "TransferCharacteristics") {
    return null;
  }
  return box;
};
var getMatrixCoefficientsSegment = (color2) => {
  if (!color2 || color2.type !== "Colour") {
    return null;
  }
  const box = color2.value.find((b) => b.type === "MatrixCoefficients");
  if (!box || box.type !== "MatrixCoefficients") {
    return null;
  }
  return box;
};
var getPrimariesSegment = (color2) => {
  if (!color2 || color2.type !== "Colour") {
    return null;
  }
  const box = color2.value.find((b) => b.type === "Primaries");
  if (!box || box.type !== "Primaries") {
    return null;
  }
  return box;
};
var getRangeSegment = (color2) => {
  if (!color2 || color2.type !== "Colour") {
    return null;
  }
  const box = color2.value.find((b) => b.type === "Range");
  if (!box || box.type !== "Range") {
    return null;
  }
  return box;
};
var getDisplayHeightSegment = (track) => {
  const videoSegment2 = getVideoSegment(track);
  if (!videoSegment2) {
    return null;
  }
  const displayHeight2 = videoSegment2.value.find((b) => b.type === "DisplayHeight");
  if (!displayHeight2 || displayHeight2.type !== "DisplayHeight") {
    return null;
  }
  return displayHeight2;
};
var getTrackTypeSegment = (track) => {
  const trackType2 = track.value.find((b) => b.type === "TrackType");
  if (!trackType2 || trackType2.type !== "TrackType") {
    return null;
  }
  return trackType2;
};
var getWidthSegment = (track) => {
  const videoSegment2 = getVideoSegment(track);
  if (!videoSegment2) {
    return null;
  }
  const width = videoSegment2.value.find((b) => b.type === "PixelWidth");
  if (!width || width.type !== "PixelWidth") {
    return null;
  }
  return width;
};
var getHeightSegment = (track) => {
  const videoSegment2 = getVideoSegment(track);
  if (!videoSegment2) {
    return null;
  }
  const height = videoSegment2.value.find((b) => b.type === "PixelHeight");
  if (!height || height.type !== "PixelHeight") {
    return null;
  }
  return height;
};
var getDisplayWidthSegment = (track) => {
  const videoSegment2 = getVideoSegment(track);
  if (!videoSegment2) {
    return null;
  }
  const displayWidth2 = videoSegment2.value.find((b) => b.type === "DisplayWidth");
  if (!displayWidth2 || displayWidth2.type !== "DisplayWidth") {
    return null;
  }
  return displayWidth2;
};
var getTracksSegment = (segment) => {
  const tracksSegment = segment.value.find((b) => b.type === "Tracks");
  if (!tracksSegment) {
    return null;
  }
  return tracksSegment;
};
var getTrackWithUid = (segment, trackUid) => {
  const tracksSegment = getTracksSegment(segment);
  if (!tracksSegment) {
    return null;
  }
  const trackEntries = tracksSegment.value.filter((t) => t.type === "TrackEntry");
  const trackEntry2 = trackEntries.find((entry) => {
    return entry?.value.find((t) => t.type === "TrackUID" && t.value === trackUid);
  });
  if (!trackEntry2) {
    return null;
  }
  return trackEntry2.value.find((t) => t.type === "TrackNumber")?.value.value ?? null;
};
var getVideoSegment = (track) => {
  const videoSegment2 = track.value.find((b) => b.type === "Video");
  if (!videoSegment2 || videoSegment2.type !== "Video") {
    return null;
  }
  return videoSegment2 ?? null;
};
var getAudioSegment = (track) => {
  const audioSegment2 = track.value.find((b) => b.type === "Audio");
  if (!audioSegment2 || audioSegment2.type !== "Audio") {
    return null;
  }
  return audioSegment2 ?? null;
};
var getSampleRate2 = (track) => {
  const audioSegment2 = getAudioSegment(track);
  if (!audioSegment2) {
    return null;
  }
  const samplingFrequency2 = audioSegment2.value.find((b) => b.type === "SamplingFrequency");
  if (!samplingFrequency2 || samplingFrequency2.type !== "SamplingFrequency") {
    return null;
  }
  return samplingFrequency2.value.value;
};
var getNumberOfChannels = (track) => {
  const audioSegment2 = getAudioSegment(track);
  if (!audioSegment2) {
    throw new Error("Could not find audio segment");
  }
  const channels2 = audioSegment2.value.find((b) => b.type === "Channels");
  if (!channels2 || channels2.type !== "Channels") {
    return 1;
  }
  return channels2.value.value;
};
var getBitDepth = (track) => {
  const audioSegment2 = getAudioSegment(track);
  if (!audioSegment2) {
    return null;
  }
  const bitDepth2 = audioSegment2.value.find((b) => b.type === "BitDepth");
  if (!bitDepth2 || bitDepth2.type !== "BitDepth") {
    return null;
  }
  return bitDepth2.value.value;
};
var getPrivateData = (track) => {
  const privateData = track.value.find((b) => b.type === "CodecPrivate");
  if (!privateData || privateData.type !== "CodecPrivate") {
    return null;
  }
  return privateData.value;
};

// src/containers/webm/color.ts
var parseColorSegment = (colourSegment) => {
  const transferCharacteristics2 = getTransferCharacteristicsSegment(colourSegment);
  const matrixCoefficients2 = getMatrixCoefficientsSegment(colourSegment);
  const primaries2 = getPrimariesSegment(colourSegment);
  const range2 = getRangeSegment(colourSegment);
  return {
    transfer: transferCharacteristics2 ? getTransferCharacteristicsFromIndex(transferCharacteristics2.value.value) : null,
    matrix: matrixCoefficients2 ? getMatrixCoefficientsFromIndex(matrixCoefficients2.value.value) : null,
    primaries: primaries2 ? getPrimariesFromIndex(primaries2.value.value) : null,
    fullRange: transferCharacteristics2?.value.value && matrixCoefficients2?.value.value ? null : range2 ? Boolean(range2?.value.value) : null
  };
};

// src/containers/webm/description.ts
var getAudioDescription = (track) => {
  const codec = getCodecSegment(track);
  if (!codec || codec.value !== "A_VORBIS") {
    return;
  }
  const privateData = getPrivateData(track);
  if (!privateData) {
    return;
  }
  if (privateData[0] !== 2) {
    throw new Error("Expected vorbis private data version 2");
  }
  let offset = 1;
  let vorbisInfoLength = 0;
  let vorbisSkipLength = 0;
  while ((privateData[offset] & 255) === 255) {
    vorbisInfoLength += 255;
    offset++;
  }
  vorbisInfoLength += privateData[offset++] & 255;
  while ((privateData[offset] & 255) === 255) {
    vorbisSkipLength += 255;
    offset++;
  }
  vorbisSkipLength += privateData[offset++] & 255;
  if (privateData[offset] !== 1) {
    throw new Error("Error parsing vorbis codec private");
  }
  const vorbisInfo = privateData.slice(offset, offset + vorbisInfoLength);
  offset += vorbisInfoLength;
  if (privateData[offset] !== 3) {
    throw new Error("Error parsing vorbis codec private");
  }
  const vorbisComments = privateData.slice(offset, offset + vorbisSkipLength);
  offset += vorbisSkipLength;
  if (privateData[offset] !== 5) {
    throw new Error("Error parsing vorbis codec private");
  }
  const vorbisBooks = privateData.slice(offset);
  const bufferIterator = getArrayBufferIterator({
    initialData: vorbisInfo.slice(0),
    maxBytes: vorbisInfo.length,
    logLevel: "error"
  });
  bufferIterator.getUint8();
  const vorbis = bufferIterator.getByteString(6, false);
  if (vorbis !== "vorbis") {
    throw new Error("Error parsing vorbis codec private");
  }
  const vorbisVersion = bufferIterator.getUint32Le();
  if (vorbisVersion !== 0) {
    throw new Error("Error parsing vorbis codec private");
  }
  const vorbisDescription = new Uint8Array([
    2,
    vorbisInfo.length,
    vorbisComments.length,
    ...vorbisInfo,
    ...vorbisComments,
    ...vorbisBooks
  ]);
  return vorbisDescription;
};

// src/containers/webm/segments/track-entry.ts
var trackTypeToString = (trackType2) => {
  switch (trackType2) {
    case 1:
      return "video";
    case 2:
      return "audio";
    case 3:
      return "complex";
    case 4:
      return "subtitle";
    case 5:
      return "button";
    case 6:
      return "control";
    case 7:
      return "metadata";
    default:
      throw new Error(`Unknown track type: ${trackType2}`);
  }
};

// src/containers/webm/make-track.ts
var NO_CODEC_PRIVATE_SHOULD_BE_DERIVED_FROM_SPS = "no-codec-private-should-be-derived-from-sps";
var getDescription = (track) => {
  const codec = getCodecSegment(track);
  if (!codec) {
    return;
  }
  if (codec.value === "V_MPEG4/ISO/AVC" || codec.value === "V_MPEGH/ISO/HEVC") {
    const priv = getPrivateData(track);
    if (priv) {
      return priv;
    }
  }
  return;
};
var getMatroskaVideoCodecEnum = ({
  codecSegment: codec
}) => {
  if (codec.value === "V_VP8") {
    return "vp8";
  }
  if (codec.value === "V_VP9") {
    return "vp9";
  }
  if (codec.value === "V_MPEG4/ISO/AVC") {
    return "h264";
  }
  if (codec.value === "V_AV1") {
    return "av1";
  }
  if (codec.value === "V_MPEGH/ISO/HEVC") {
    return "h265";
  }
  throw new Error(`Unknown codec: ${codec.value}`);
};
var getMatroskaVideoCodecString = ({
  track,
  codecSegment: codec
}) => {
  if (codec.value === "V_VP8") {
    return "vp8";
  }
  if (codec.value === "V_VP9") {
    const priv = getPrivateData(track);
    if (priv) {
      throw new Error("@remotion/media-parser cannot handle the private data for VP9. Do you have an example file you could send so we can implement it? https://remotion.dev/report");
    }
    return "vp09.00.10.08";
  }
  if (codec.value === "V_MPEG4/ISO/AVC") {
    const priv = getPrivateData(track);
    if (priv) {
      return `avc1.${priv[1].toString(16).padStart(2, "0")}${priv[2].toString(16).padStart(2, "0")}${priv[3].toString(16).padStart(2, "0")}`;
    }
    return NO_CODEC_PRIVATE_SHOULD_BE_DERIVED_FROM_SPS;
  }
  if (codec.value === "V_MPEGH/ISO/HEVC") {
    const priv = getPrivateData(track);
    const iterator = getArrayBufferIterator({
      initialData: priv,
      maxBytes: priv.length,
      logLevel: "error"
    });
    return "hvc1." + getHvc1CodecString(iterator);
  }
  if (codec.value === "V_AV1") {
    const priv = getPrivateData(track);
    if (!priv) {
      throw new Error("Expected private data in AV1 track");
    }
    return parseAv1PrivateData(priv, null);
  }
  throw new Error(`Unknown codec: ${codec.value}`);
};
var getMatroskaAudioCodecEnum = ({
  track
}) => {
  const codec = getCodecSegment(track);
  if (!codec) {
    throw new Error("Expected codec segment");
  }
  if (codec.value === "A_OPUS") {
    return "opus";
  }
  if (codec.value === "A_VORBIS") {
    return "vorbis";
  }
  if (codec.value === "A_PCM/INT/LIT") {
    const bitDepth2 = getBitDepth(track);
    if (bitDepth2 === null) {
      throw new Error("Expected bit depth");
    }
    if (bitDepth2 === 8) {
      return "pcm-u8";
    }
    if (bitDepth2 === 16) {
      return "pcm-s16";
    }
    if (bitDepth2 === 24) {
      return "pcm-s24";
    }
    throw new Error("Unknown audio format");
  }
  if (codec.value === "A_AAC") {
    return `aac`;
  }
  if (codec.value === "A_MPEG/L3") {
    return "mp3";
  }
  throw new Error(`Unknown codec: ${codec.value}`);
};
var getMatroskaAudioCodecString = (track) => {
  const codec = getCodecSegment(track);
  if (!codec) {
    throw new Error("Expected codec segment");
  }
  if (codec.value === "A_OPUS") {
    return "opus";
  }
  if (codec.value === "A_VORBIS") {
    return "vorbis";
  }
  if (codec.value === "A_PCM/INT/LIT") {
    const bitDepth2 = getBitDepth(track);
    if (bitDepth2 === null) {
      throw new Error("Expected bit depth");
    }
    if (bitDepth2 === 8) {
      return "pcm-u8";
    }
    return "pcm-s" + bitDepth2;
  }
  if (codec.value === "A_AAC") {
    const priv = getPrivateData(track);
    const iterator = getArrayBufferIterator({
      initialData: priv,
      maxBytes: priv.length,
      logLevel: "error"
    });
    iterator.startReadingBits();
    const profile = iterator.getBits(5);
    iterator.stopReadingBits();
    iterator.destroy();
    return `mp4a.40.${profile.toString().padStart(2, "0")}`;
  }
  if (codec.value === "A_MPEG/L3") {
    return "mp3";
  }
  throw new Error(`Unknown codec: ${codec.value}`);
};
var getTrack = ({
  timescale,
  track
}) => {
  const trackType2 = getTrackTypeSegment(track);
  if (!trackType2) {
    throw new Error("Expected track type segment");
  }
  const trackId = getTrackId(track);
  if (trackTypeToString(trackType2.value.value) === "video") {
    const width = getWidthSegment(track);
    if (width === null) {
      throw new Error("Expected width segment");
    }
    const height = getHeightSegment(track);
    if (height === null) {
      throw new Error("Expected height segment");
    }
    const displayHeight2 = getDisplayHeightSegment(track);
    const displayWidth2 = getDisplayWidthSegment(track);
    const codec = getCodecSegment(track);
    if (!codec) {
      return null;
    }
    const codecPrivate2 = getPrivateData(track);
    const codecString = getMatroskaVideoCodecString({
      track,
      codecSegment: codec
    });
    const colour = getColourSegment(track);
    if (!codecString) {
      return null;
    }
    const codecEnum = getMatroskaVideoCodecEnum({
      codecSegment: codec
    });
    const codecData = codecPrivate2 === null ? null : codecEnum === "h264" ? { type: "avc-sps-pps", data: codecPrivate2 } : codecEnum === "av1" ? {
      type: "av1c-data",
      data: codecPrivate2
    } : codecEnum === "h265" ? {
      type: "hvcc-data",
      data: codecPrivate2
    } : codecEnum === "vp8" ? {
      type: "unknown-data",
      data: codecPrivate2
    } : codecEnum === "vp9" ? {
      type: "unknown-data",
      data: codecPrivate2
    } : null;
    const advancedColor = colour ? parseColorSegment(colour) : {
      fullRange: null,
      matrix: null,
      primaries: null,
      transfer: null
    };
    return {
      m3uStreamFormat: null,
      type: "video",
      trackId,
      codec: codecString,
      description: getDescription(track),
      height: displayHeight2 ? displayHeight2.value.value : height.value.value,
      width: displayWidth2 ? displayWidth2.value.value : width.value.value,
      sampleAspectRatio: {
        numerator: 1,
        denominator: 1
      },
      originalTimescale: timescale,
      codedHeight: height.value.value,
      codedWidth: width.value.value,
      displayAspectHeight: displayHeight2 ? displayHeight2.value.value : height.value.value,
      displayAspectWidth: displayWidth2 ? displayWidth2.value.value : width.value.value,
      rotation: 0,
      codecData,
      colorSpace: mediaParserAdvancedColorToWebCodecsColor(advancedColor),
      advancedColor,
      codecEnum,
      fps: null,
      startInSeconds: 0,
      timescale: WEBCODECS_TIMESCALE,
      trackMediaTimeOffsetInTrackTimescale: 0
    };
  }
  if (trackTypeToString(trackType2.value.value) === "audio") {
    const sampleRate = getSampleRate2(track);
    const numberOfChannels = getNumberOfChannels(track);
    const codecPrivate2 = getPrivateData(track);
    if (sampleRate === null) {
      throw new Error("Could not find sample rate or number of channels");
    }
    const codecString = getMatroskaAudioCodecString(track);
    return {
      type: "audio",
      trackId,
      codec: codecString,
      originalTimescale: timescale,
      numberOfChannels,
      sampleRate,
      description: getAudioDescription(track),
      codecData: codecPrivate2 ? codecString === "opus" ? { type: "ogg-identification", data: codecPrivate2 } : { type: "unknown-data", data: codecPrivate2 } : null,
      codecEnum: getMatroskaAudioCodecEnum({
        track
      }),
      startInSeconds: 0,
      timescale: WEBCODECS_TIMESCALE,
      trackMediaTimeOffsetInTrackTimescale: 0
    };
  }
  return null;
};

// src/containers/webm/get-ready-tracks.ts
var getTracksFromMatroska = ({
  structureState,
  webmState
}) => {
  const structure = structureState.getMatroskaStructure();
  const mainSegment = getMainSegment(structure.boxes);
  if (!mainSegment) {
    throw new Error("No main segment");
  }
  const tracksSegment = getTracksSegment(mainSegment);
  if (!tracksSegment) {
    throw new Error("No tracks segment");
  }
  const resolvedTracks = [];
  const missingInfo = [];
  for (const trackEntrySegment of tracksSegment.value) {
    if (trackEntrySegment.type === "Crc32") {
      continue;
    }
    if (trackEntrySegment.type !== "TrackEntry") {
      throw new Error("Expected track entry segment");
    }
    const track = getTrack({
      track: trackEntrySegment,
      timescale: webmState.getTimescale()
    });
    if (!track) {
      continue;
    }
    if (track.codec === NO_CODEC_PRIVATE_SHOULD_BE_DERIVED_FROM_SPS) {
      const avc = webmState.getAvcProfileForTrackNumber(track.trackId);
      if (avc) {
        resolvedTracks.push({
          ...track,
          codec: getCodecStringFromSpsAndPps(avc)
        });
      } else {
        missingInfo.push(track);
      }
    } else {
      resolvedTracks.push(track);
    }
  }
  return { missingInfo, resolved: resolvedTracks };
};
var matroskaHasTracks = ({
  structureState,
  webmState
}) => {
  const structure = structureState.getMatroskaStructure();
  const mainSegment = getMainSegment(structure.boxes);
  if (!mainSegment) {
    return false;
  }
  return getTracksSegment(mainSegment) !== null && getTracksFromMatroska({
    structureState,
    webmState
  }).missingInfo.length === 0;
};

// src/get-tracks.ts
var isoBaseMediaHasTracks = (state, mayUsePrecomputed) => {
  return Boolean(getMoovBoxFromState({
    structureState: state.structure,
    isoState: state.iso,
    mp4HeaderSegment: state.m3uPlaylistContext?.mp4HeaderSegment ?? null,
    mayUsePrecomputed
  }));
};
var getHasTracks = (state, mayUsePrecomputed) => {
  const structure = state.structure.getStructure();
  if (structure.type === "matroska") {
    return matroskaHasTracks({
      structureState: state.structure,
      webmState: state.webm
    });
  }
  if (structure.type === "iso-base-media") {
    return isoBaseMediaHasTracks(state, mayUsePrecomputed);
  }
  if (structure.type === "riff") {
    return hasAllTracksFromAvi(state);
  }
  if (structure.type === "transport-stream") {
    return hasAllTracksFromTransportStream(state);
  }
  if (structure.type === "mp3") {
    return state.callbacks.tracks.getTracks().length > 0;
  }
  if (structure.type === "wav") {
    return state.callbacks.tracks.hasAllTracks();
  }
  if (structure.type === "aac") {
    return state.callbacks.tracks.hasAllTracks();
  }
  if (structure.type === "flac") {
    return state.callbacks.tracks.hasAllTracks();
  }
  if (structure.type === "m3u") {
    return state.callbacks.tracks.hasAllTracks();
  }
  throw new Error("Unknown container " + structure);
};
var getCategorizedTracksFromMatroska = (state) => {
  const { resolved } = getTracksFromMatroska({
    structureState: state.structure,
    webmState: state.webm
  });
  return resolved;
};
var getTracksFromMoovBox = (moovBox) => {
  const mediaParserTracks = [];
  const tracks2 = getTraks(moovBox);
  for (const trakBox of tracks2) {
    const mvhdBox = getMvhdBox(moovBox);
    if (!mvhdBox) {
      throw new Error("Mvhd box is not found");
    }
    const startTime = findTrackStartTimeInSeconds({
      movieTimeScale: mvhdBox.timeScale,
      trakBox
    });
    const track = makeBaseMediaTrack(trakBox, startTime);
    if (!track) {
      continue;
    }
    mediaParserTracks.push(track);
  }
  return mediaParserTracks;
};
var getTracksFromIsoBaseMedia = ({
  mayUsePrecomputed,
  structure,
  isoState,
  m3uPlaylistContext
}) => {
  const moovBox = getMoovBoxFromState({
    structureState: structure,
    isoState,
    mp4HeaderSegment: m3uPlaylistContext?.mp4HeaderSegment ?? null,
    mayUsePrecomputed
  });
  if (!moovBox) {
    return [];
  }
  return getTracksFromMoovBox(moovBox);
};
var defaultGetTracks = (parserState) => {
  const tracks2 = parserState.callbacks.tracks.getTracks();
  if (tracks2.length === 0) {
    throw new Error("No tracks found");
  }
  return tracks2;
};
var getTracks = (state, mayUsePrecomputed) => {
  const structure = state.structure.getStructure();
  if (structure.type === "matroska") {
    return getCategorizedTracksFromMatroska(state);
  }
  if (structure.type === "iso-base-media") {
    return getTracksFromIsoBaseMedia({
      isoState: state.iso,
      m3uPlaylistContext: state.m3uPlaylistContext,
      structure: state.structure,
      mayUsePrecomputed
    });
  }
  if (structure.type === "riff") {
    return getTracksFromAvi(structure, state);
  }
  if (structure.type === "transport-stream") {
    return getTracksFromTransportStream(state);
  }
  if (structure.type === "mp3" || structure.type === "wav" || structure.type === "flac" || structure.type === "aac" || structure.type === "m3u") {
    return defaultGetTracks(state);
  }
  throw new Error(`Unknown container${structure}`);
};

// src/get-audio-codec.ts
var getAudioCodec = (parserState) => {
  const tracks2 = getTracks(parserState, true);
  if (tracks2.length === 0) {
    throw new Error("No tracks yet");
  }
  const audioTrack = tracks2.find((t) => t.type === "audio");
  if (!audioTrack) {
    return null;
  }
  if (audioTrack.type === "audio") {
    return audioTrack.codecEnum;
  }
  return null;
};
var hasAudioCodec = (state) => {
  return getHasTracks(state, true);
};
var getCodecSpecificatorFromEsdsBox = ({
  child
}) => {
  const descriptor = child.descriptors.find((d) => d.type === "decoder-config-descriptor");
  if (!descriptor) {
    throw new Error("No decoder-config-descriptor");
  }
  if (descriptor.type !== "decoder-config-descriptor") {
    throw new Error("Expected decoder-config-descriptor");
  }
  if (descriptor.asNumber !== 64) {
    return {
      primary: descriptor.asNumber,
      secondary: null,
      description: undefined
    };
  }
  const audioSpecificConfig = descriptor.decoderSpecificConfigs.find((d) => {
    return d.type === "mp4a-specific-config" ? d : null;
  });
  if (!audioSpecificConfig || audioSpecificConfig.type !== "mp4a-specific-config") {
    throw new Error("No audio-specific-config");
  }
  return {
    primary: descriptor.asNumber,
    secondary: audioSpecificConfig.audioObjectType,
    description: audioSpecificConfig.asBytes
  };
};
var getCodecPrivateFromTrak = (trakBox) => {
  const stsdBox = getStsdBox(trakBox);
  if (!stsdBox) {
    return null;
  }
  const audioSample = stsdBox.samples.find((s) => s.type === "audio");
  if (!audioSample || audioSample.type !== "audio") {
    return null;
  }
  const esds = audioSample.children.find((b) => b.type === "esds-box");
  if (!esds || esds.type !== "esds-box") {
    return null;
  }
  const decoderConfigDescriptor = esds.descriptors.find((d) => d.type === "decoder-config-descriptor");
  if (!decoderConfigDescriptor) {
    return null;
  }
  const mp4a = decoderConfigDescriptor.decoderSpecificConfigs.find((d) => d.type === "mp4a-specific-config");
  if (!mp4a) {
    return null;
  }
  return { type: "aac-config", data: mp4a.asBytes };
};
var onSample = (sample, children) => {
  const child = children.find((c) => c.type === "esds-box");
  if (child && child.type === "esds-box") {
    const ret = getCodecSpecificatorFromEsdsBox({ child });
    return {
      format: sample.format,
      primarySpecificator: ret.primary,
      secondarySpecificator: ret.secondary,
      description: ret.description
    };
  }
  return {
    format: sample.format,
    primarySpecificator: null,
    secondarySpecificator: null,
    description: undefined
  };
};
var getNumberOfChannelsFromTrak = (trak) => {
  const stsdBox = getStsdBox(trak);
  if (!stsdBox) {
    return null;
  }
  const sample = stsdBox.samples.find((s) => s.type === "audio");
  if (!sample || sample.type !== "audio") {
    return null;
  }
  return sample.numberOfChannels;
};
var getSampleRate = (trak) => {
  const stsdBox = getStsdBox(trak);
  if (!stsdBox) {
    return null;
  }
  const sample = stsdBox.samples.find((s) => s.type === "audio");
  if (!sample || sample.type !== "audio") {
    return null;
  }
  return sample.sampleRate;
};
var getAudioCodecFromTrak = (trak) => {
  const stsdBox = getStsdBox(trak);
  if (!stsdBox) {
    return null;
  }
  const sample = stsdBox.samples.find((s) => s.type === "audio");
  if (!sample || sample.type !== "audio") {
    return null;
  }
  const waveBox = sample.children.find((b) => b.type === "regular-box" && b.boxType === "wave");
  if (waveBox && waveBox.type === "regular-box" && waveBox.boxType === "wave") {
    const esdsSample = onSample(sample, waveBox.children);
    if (esdsSample) {
      return esdsSample;
    }
  }
  const ret = onSample(sample, sample.children);
  if (ret) {
    return ret;
  }
  return null;
};
var isLpcmAudioCodec = (trak) => {
  return getAudioCodecFromTrak(trak)?.format === "lpcm";
};
var isIn24AudioCodec = (trak) => {
  return getAudioCodecFromTrak(trak)?.format === "in24";
};
var isTwosAudioCodec = (trak) => {
  return getAudioCodecFromTrak(trak)?.format === "twos";
};
var getAudioCodecStringFromTrak = (trak) => {
  const codec = getAudioCodecFromTrak(trak);
  if (!codec) {
    throw new Error("Expected codec");
  }
  if (codec.format === "lpcm") {
    return {
      codecString: "pcm-s16",
      description: codec.description ? { type: "unknown-data", data: codec.description } : undefined
    };
  }
  if (codec.format === "twos") {
    return {
      codecString: "pcm-s16",
      description: codec.description ? { type: "unknown-data", data: codec.description } : undefined
    };
  }
  if (codec.format === "in24") {
    return {
      codecString: "pcm-s24",
      description: codec.description ? { type: "unknown-data", data: codec.description } : undefined
    };
  }
  const codecStringWithoutMp3Exception = [
    codec.format,
    codec.primarySpecificator ? codec.primarySpecificator.toString(16) : null,
    codec.secondarySpecificator ? codec.secondarySpecificator.toString().padStart(2, "0") : null
  ].filter(Boolean).join(".");
  const codecString = codecStringWithoutMp3Exception.toLowerCase() === "mp4a.6b" || codecStringWithoutMp3Exception.toLowerCase() === "mp4a.69" ? "mp3" : codecStringWithoutMp3Exception;
  if (codecString === "mp3") {
    return {
      codecString,
      description: codec.description ? {
        type: "unknown-data",
        data: codec.description
      } : undefined
    };
  }
  if (codecString.startsWith("mp4a.")) {
    return {
      codecString,
      description: codec.description ? {
        type: "aac-config",
        data: codec.description
      } : undefined
    };
  }
  return {
    codecString,
    description: codec.description ? {
      type: "unknown-data",
      data: codec.description
    } : undefined
  };
};
var getAudioCodecFromAudioCodecInfo = (codec) => {
  if (codec.format === "twos") {
    return "pcm-s16";
  }
  if (codec.format === "in24") {
    return "pcm-s24";
  }
  if (codec.format === "lpcm") {
    return "pcm-s16";
  }
  if (codec.format === "sowt") {
    return "aiff";
  }
  if (codec.format === "ac-3") {
    return "ac3";
  }
  if (codec.format === "Opus") {
    return "opus";
  }
  if (codec.format === "mp4a") {
    if (codec.primarySpecificator === 64) {
      return "aac";
    }
    if (codec.primarySpecificator === 107) {
      return "mp3";
    }
    if (codec.primarySpecificator === null) {
      return "aac";
    }
    throw new Error("Unknown mp4a codec: " + codec.primarySpecificator);
  }
  throw new Error(`Unknown audio format: ${codec.format}`);
};
var getAudioCodecFromTrack = (track) => {
  const audioSample = getAudioCodecFromTrak(track);
  if (!audioSample) {
    throw new Error("Could not find audio sample");
  }
  return getAudioCodecFromAudioCodecInfo(audioSample);
};

// src/get-container.ts
var getContainer = (segments) => {
  if (segments.type === "iso-base-media") {
    return "mp4";
  }
  if (segments.type === "matroska") {
    return "webm";
  }
  if (segments.type === "transport-stream") {
    return "transport-stream";
  }
  if (segments.type === "mp3") {
    return "mp3";
  }
  if (segments.type === "wav") {
    return "wav";
  }
  if (segments.type === "flac") {
    return "flac";
  }
  if (segments.type === "riff") {
    if (isRiffAvi(segments)) {
      return "avi";
    }
    throw new Error("Unknown RIFF container " + segments.type);
  }
  if (segments.type === "aac") {
    return "aac";
  }
  if (segments.type === "m3u") {
    return "m3u8";
  }
  throw new Error("Unknown container " + segments);
};
var hasContainer = (boxes) => {
  try {
    return getContainer(boxes) !== null;
  } catch {
    return false;
  }
};

// src/get-dimensions.ts
var getDimensions = (state) => {
  const structure = state.structure.getStructureOrNull();
  if (structure && isAudioStructure(structure)) {
    return null;
  }
  const tracks2 = getTracks(state, true);
  if (!tracks2.length) {
    return null;
  }
  const firstVideoTrack = tracks2.find((t) => t.type === "video");
  if (!firstVideoTrack) {
    return null;
  }
  return {
    width: firstVideoTrack.width,
    height: firstVideoTrack.height,
    rotation: firstVideoTrack.rotation,
    unrotatedHeight: firstVideoTrack.displayAspectHeight,
    unrotatedWidth: firstVideoTrack.displayAspectWidth
  };
};
var hasDimensions = (state) => {
  const structure = state.structure.getStructureOrNull();
  if (structure && isAudioStructure(structure)) {
    return true;
  }
  try {
    return getDimensions(state) !== null;
  } catch {
    return false;
  }
};

// src/containers/flac/get-duration-from-flac.ts
var getDurationFromFlac = (parserState) => {
  const structure = parserState.structure.getFlacStructure();
  const streaminfo = structure.boxes.find((b) => b.type === "flac-streaminfo");
  if (!streaminfo) {
    throw new Error("Streaminfo not found");
  }
  return streaminfo.totalSamples / streaminfo.sampleRate;
};

// src/containers/iso-base-media/are-samples-complete.ts
var areSamplesComplete = ({
  moofBoxes,
  tfraBoxes
}) => {
  if (moofBoxes.length === 0) {
    return true;
  }
  return tfraBoxes.length > 0 && tfraBoxes.every((t) => t.entries.length === moofBoxes.length);
};

// src/samples-from-moof.ts
var getSamplesFromTraf = (trafSegment, moofOffset, trexBoxes) => {
  if (trafSegment.type !== "regular-box" || trafSegment.boxType !== "traf") {
    throw new Error("Expected traf-box");
  }
  const tfhdBox = getTfhdBox(trafSegment);
  const trexBox = trexBoxes.find((t) => t.trackId === tfhdBox?.trackId) ?? null;
  const defaultTrackSampleDuration = tfhdBox?.defaultSampleDuration || trexBox?.defaultSampleDuration || null;
  const defaultTrackSampleSize = tfhdBox?.defaultSampleSize || trexBox?.defaultSampleSize || null;
  const defaultTrackSampleFlags = tfhdBox?.defaultSampleFlags ?? trexBox?.defaultSampleFlags ?? null;
  const tfdtBox = getTfdtBox(trafSegment);
  const trunBoxes = getTrunBoxes(trafSegment);
  let time = 0;
  let offset = 0;
  let dataOffset = 0;
  const samples = [];
  for (const trunBox of trunBoxes) {
    let i = -1;
    if (trunBox.dataOffset) {
      dataOffset = trunBox.dataOffset;
      offset = 0;
    }
    for (const sample of trunBox.samples) {
      i++;
      const duration2 = sample.sampleDuration || defaultTrackSampleDuration;
      if (duration2 === null) {
        throw new Error("Expected duration");
      }
      const size = sample.sampleSize ?? defaultTrackSampleSize;
      if (size === null) {
        throw new Error("Expected size");
      }
      const isFirstSample = i === 0;
      const sampleFlags = sample.sampleFlags ? sample.sampleFlags : isFirstSample && trunBox.firstSampleFlags !== null ? trunBox.firstSampleFlags : defaultTrackSampleFlags;
      if (sampleFlags === null) {
        throw new Error("Expected sample flags");
      }
      const keyframe = !(sampleFlags >> 16 & 1);
      const dts = time + (tfdtBox?.baseMediaDecodeTime ?? 0);
      const samplePosition = {
        offset: offset + (moofOffset ?? 0) + (dataOffset ?? 0),
        decodingTimestamp: dts,
        timestamp: dts + (sample.sampleCompositionTimeOffset ?? 0),
        duration: duration2,
        isKeyframe: keyframe,
        size,
        chunk: 0,
        bigEndian: false,
        chunkSize: null
      };
      samples.push(samplePosition);
      offset += size;
      time += duration2;
    }
  }
  return samples;
};
var getSamplesFromMoof = ({
  moofBox,
  trackId,
  trexBoxes
}) => {
  const mapped = moofBox.trafBoxes.map((traf) => {
    const tfhdBox = getTfhdBox(traf);
    if (!tfhdBox || tfhdBox.trackId !== trackId) {
      return [];
    }
    return getSamplesFromTraf(traf, moofBox.offset, trexBoxes);
  });
  return mapped.flat(1);
};

// src/containers/iso-base-media/collect-sample-positions-from-moof-boxes.ts
var collectSamplePositionsFromMoofBoxes = ({
  moofBoxes,
  tkhdBox,
  isComplete,
  trexBoxes
}) => {
  const samplePositions = moofBoxes.map((m, index) => {
    const isLastFragment = index === moofBoxes.length - 1 && isComplete;
    return {
      isLastFragment,
      samples: getSamplesFromMoof({
        moofBox: m,
        trackId: tkhdBox.trackId,
        trexBoxes
      })
    };
  });
  return { samplePositions, isComplete };
};

// src/get-sample-positions.ts
var getSamplePositions = ({
  stcoBox,
  stszBox,
  stscBox,
  stssBox,
  sttsBox,
  cttsBox
}) => {
  const sttsDeltas = [];
  for (const distribution of sttsBox.sampleDistribution) {
    for (let i = 0;i < distribution.sampleCount; i++) {
      sttsDeltas.push(distribution.sampleDelta);
    }
  }
  const cttsEntries = [];
  for (const entry of cttsBox?.entries ?? [
    { sampleCount: sttsDeltas.length, sampleOffset: 0 }
  ]) {
    for (let i = 0;i < entry.sampleCount; i++) {
      cttsEntries.push(entry.sampleOffset);
    }
  }
  let dts = 0;
  const chunks = stcoBox.entries;
  const samples = [];
  let samplesPerChunk = 1;
  for (let i = 0;i < chunks.length; i++) {
    const hasEntry = stscBox.entries.get(i + 1);
    if (hasEntry !== undefined) {
      samplesPerChunk = hasEntry;
    }
    let offsetInThisChunk = 0;
    for (let j = 0;j < samplesPerChunk; j++) {
      const size = stszBox.countType === "fixed" ? stszBox.sampleSize : stszBox.entries[samples.length];
      const isKeyframe = stssBox ? stssBox.sampleNumber.has(samples.length + 1) : true;
      const delta = sttsDeltas[samples.length];
      const ctsOffset = cttsEntries[samples.length];
      const cts = dts + ctsOffset;
      samples.push({
        offset: Number(chunks[i]) + offsetInThisChunk,
        size,
        isKeyframe,
        decodingTimestamp: dts,
        timestamp: cts,
        duration: delta,
        chunk: i,
        bigEndian: false,
        chunkSize: null
      });
      dts += delta;
      offsetInThisChunk += size;
    }
  }
  return samples;
};

// src/get-sample-positions-from-mp4.ts
var getGroupedSamplesPositionsFromMp4 = ({
  trakBox,
  bigEndian
}) => {
  const stscBox = getStscBox(trakBox);
  const stszBox = getStszBox(trakBox);
  const stcoBox = getStcoBox(trakBox);
  if (!stscBox) {
    throw new Error("Expected stsc box in trak box");
  }
  if (!stcoBox) {
    throw new Error("Expected stco box in trak box");
  }
  if (!stszBox) {
    throw new Error("Expected stsz box in trak box");
  }
  if (stszBox.countType !== "fixed") {
    throw new Error("Only supporting fixed count type in stsz box");
  }
  const samples = [];
  let timestamp = 0;
  const stscKeys = Array.from(stscBox.entries.keys());
  for (let i = 0;i < stcoBox.entries.length; i++) {
    const entry = stcoBox.entries[i];
    const chunk = i + 1;
    const stscEntry = stscKeys.findLast((e) => e <= chunk);
    if (stscEntry === undefined) {
      throw new Error("should not be");
    }
    const samplesPerChunk = stscBox.entries.get(stscEntry);
    if (samplesPerChunk === undefined) {
      throw new Error("should not be");
    }
    samples.push({
      chunk,
      timestamp,
      decodingTimestamp: timestamp,
      offset: Number(entry),
      size: stszBox.sampleSize * samplesPerChunk,
      duration: samplesPerChunk,
      isKeyframe: true,
      bigEndian,
      chunkSize: stszBox.sampleSize
    });
    timestamp += samplesPerChunk;
  }
  return samples;
};

// src/containers/iso-base-media/should-group-audio-samples.ts
var shouldGroupAudioSamples = (trakBox) => {
  const isLpcm = isLpcmAudioCodec(trakBox);
  const isIn24 = isIn24AudioCodec(trakBox);
  const isTwos = isTwosAudioCodec(trakBox);
  if (isLpcm || isIn24 || isTwos) {
    return {
      bigEndian: isTwos || isIn24
    };
  }
  return null;
};

// src/containers/iso-base-media/collect-sample-positions-from-trak.ts
var collectSamplePositionsFromTrak = (trakBox) => {
  const shouldGroupSamples = shouldGroupAudioSamples(trakBox);
  const timescaleAndDuration = getTimescaleAndDuration(trakBox);
  if (shouldGroupSamples) {
    return getGroupedSamplesPositionsFromMp4({
      trakBox,
      bigEndian: shouldGroupSamples.bigEndian
    });
  }
  const stszBox = getStszBox(trakBox);
  const stcoBox = getStcoBox(trakBox);
  const stscBox = getStscBox(trakBox);
  const stssBox = getStssBox(trakBox);
  const sttsBox = getSttsBox(trakBox);
  const cttsBox = getCttsBox(trakBox);
  if (!stszBox) {
    throw new Error("Expected stsz box in trak box");
  }
  if (!stcoBox) {
    throw new Error("Expected stco box in trak box");
  }
  if (!stscBox) {
    throw new Error("Expected stsc box in trak box");
  }
  if (!sttsBox) {
    throw new Error("Expected stts box in trak box");
  }
  if (!timescaleAndDuration) {
    throw new Error("Expected timescale and duration in trak box");
  }
  const samplePositions = getSamplePositions({
    stcoBox,
    stscBox,
    stszBox,
    stssBox,
    sttsBox,
    cttsBox
  });
  return samplePositions;
};

// src/containers/iso-base-media/get-sample-positions-from-track.ts
var getSamplePositionsFromTrack = ({
  trakBox,
  moofBoxes,
  moofComplete,
  trexBoxes
}) => {
  const tkhdBox = getTkhdBox(trakBox);
  if (!tkhdBox) {
    throw new Error("Expected tkhd box in trak box");
  }
  if (moofBoxes.length > 0) {
    const { samplePositions } = collectSamplePositionsFromMoofBoxes({
      moofBoxes,
      tkhdBox,
      isComplete: moofComplete,
      trexBoxes
    });
    return {
      samplePositions: samplePositions.map((s) => s.samples).flat(1),
      isComplete: moofComplete
    };
  }
  return {
    samplePositions: collectSamplePositionsFromTrak(trakBox),
    isComplete: true
  };
};

// src/containers/m3u/get-playlist.ts
var getAllPlaylists = ({
  structure,
  src
}) => {
  const isIndependent = isIndependentSegments(structure);
  if (!isIndependent) {
    return [
      {
        type: "m3u-playlist",
        boxes: structure.boxes,
        src
      }
    ];
  }
  const playlists = structure.boxes.filter((box) => box.type === "m3u-playlist");
  if (playlists.length === 0) {
    return [
      {
        type: "m3u-playlist",
        boxes: structure.boxes,
        src
      }
    ];
  }
  return playlists;
};
var getPlaylist = (structure, src) => {
  const allPlaylists = getAllPlaylists({ structure, src });
  const playlists = allPlaylists.find((box) => box.src === src);
  if (!playlists) {
    throw new Error(`Expected m3u-playlist with src ${src}`);
  }
  return playlists;
};
var getDurationFromPlaylist = (playlist) => {
  const duration2 = playlist.boxes.filter((box) => box.type === "m3u-extinf");
  if (duration2.length === 0) {
    throw new Error("Expected duration in m3u playlist");
  }
  return duration2.reduce((acc, d) => acc + d.value, 0);
};

// src/containers/m3u/get-duration-from-m3u.ts
var getDurationFromM3u = (state) => {
  const playlists = getAllPlaylists({
    structure: state.structure.getM3uStructure(),
    src: state.src
  });
  return Math.max(...playlists.map((p) => {
    return getDurationFromPlaylist(p);
  }));
};

// src/containers/mp3/get-frame-length.ts
var getUnroundedMpegFrameLength = ({
  samplesPerFrame,
  bitrateKbit,
  samplingFrequency: samplingFrequency2,
  padding,
  layer
}) => {
  if (layer === 1) {
    throw new Error("MPEG Layer I is not supported");
  }
  return samplesPerFrame / 8 * bitrateKbit / samplingFrequency2 * 1000 + (padding ? layer === 1 ? 4 : 1 : 0);
};
var getAverageMpegFrameLength = ({
  samplesPerFrame,
  bitrateKbit,
  samplingFrequency: samplingFrequency2,
  layer
}) => {
  const withoutPadding = getUnroundedMpegFrameLength({
    bitrateKbit,
    layer,
    padding: false,
    samplesPerFrame,
    samplingFrequency: samplingFrequency2
  });
  const rounded = Math.floor(withoutPadding);
  const rest = withoutPadding % 1;
  return rest * (rounded + 1) + (1 - rest) * rounded;
};
var getMpegFrameLength = ({
  samplesPerFrame,
  bitrateKbit,
  samplingFrequency: samplingFrequency2,
  padding,
  layer
}) => {
  return Math.floor(getUnroundedMpegFrameLength({
    bitrateKbit,
    layer,
    padding,
    samplesPerFrame,
    samplingFrequency: samplingFrequency2
  }));
};

// src/containers/mp3/samples-per-mpeg-file.ts
var getSamplesPerMpegFrame = ({
  mpegVersion,
  layer
}) => {
  if (mpegVersion === 1) {
    if (layer === 1) {
      return 384;
    }
    if (layer === 2 || layer === 3) {
      return 1152;
    }
  }
  if (mpegVersion === 2) {
    if (layer === 1) {
      return 384;
    }
    if (layer === 2) {
      return 1152;
    }
    if (layer === 3) {
      return 576;
    }
  }
  throw new Error("Invalid MPEG layer");
};

// src/containers/mp3/get-duration.ts
var getDurationFromMp3Xing = ({
  xingData,
  samplesPerFrame
}) => {
  const xingFrames = xingData.numberOfFrames;
  if (!xingFrames) {
    throw new Error("Cannot get duration of VBR MP3 file - no frames");
  }
  const { sampleRate } = xingData;
  if (!sampleRate) {
    throw new Error("Cannot get duration of VBR MP3 file - no sample rate");
  }
  const xingSamples = xingFrames * samplesPerFrame;
  return xingSamples / sampleRate;
};
var getDurationFromMp3 = (state) => {
  const mp3Info = state.mp3.getMp3Info();
  const mp3BitrateInfo = state.mp3.getMp3BitrateInfo();
  if (!mp3Info || !mp3BitrateInfo) {
    return null;
  }
  const samplesPerFrame = getSamplesPerMpegFrame({
    layer: mp3Info.layer,
    mpegVersion: mp3Info.mpegVersion
  });
  if (mp3BitrateInfo.type === "variable") {
    return getDurationFromMp3Xing({
      xingData: mp3BitrateInfo.xingData,
      samplesPerFrame
    });
  }
  const frameLengthInBytes = getMpegFrameLength({
    bitrateKbit: mp3BitrateInfo.bitrateInKbit,
    padding: false,
    samplesPerFrame,
    samplingFrequency: mp3Info.sampleRate,
    layer: mp3Info.layer
  });
  const frames = Math.floor((state.contentLength - state.mediaSection.getMediaSectionAssertOnlyOne().start) / frameLengthInBytes);
  const samples = frames * samplesPerFrame;
  const durationInSeconds = samples / mp3Info.sampleRate;
  return durationInSeconds;
};

// src/containers/riff/get-duration.ts
var getDurationFromAvi = (structure) => {
  const strl = getStrlBoxes(structure);
  const lengths = [];
  for (const s of strl) {
    const strh = getStrhBox(s.children);
    if (!strh) {
      throw new Error("No strh box");
    }
    const samplesPerSecond = strh.rate / strh.scale;
    const streamLength = strh.length / samplesPerSecond;
    lengths.push(streamLength);
  }
  return Math.max(...lengths);
};

// src/containers/wav/get-duration-from-wav.ts
var getDurationFromWav = (state) => {
  const structure = state.structure.getWavStructure();
  const fmt = structure.boxes.find((b) => b.type === "wav-fmt");
  if (!fmt) {
    throw new Error("Expected fmt box");
  }
  const dataBox = structure.boxes.find((b) => b.type === "wav-data");
  if (!dataBox) {
    throw new Error("Expected data box");
  }
  const durationInSeconds = dataBox.dataSize / (fmt.sampleRate * fmt.blockAlign);
  return durationInSeconds;
};

// src/state/iso-base-media/precomputed-tfra.ts
var precomputedTfraState = () => {
  let tfraBoxes = [];
  return {
    getTfraBoxes: () => tfraBoxes,
    setTfraBoxes: (boxes) => {
      tfraBoxes = boxes;
    }
  };
};
var deduplicateTfraBoxesByOffset = (tfraBoxes) => {
  return tfraBoxes.filter((m, i, arr) => i === arr.findIndex((t) => t.offset === m.offset));
};

// src/get-duration.ts
var getDurationFromMatroska = (segments) => {
  const mainSegment = segments.find((s) => s.type === "Segment");
  if (!mainSegment || mainSegment.type !== "Segment") {
    return null;
  }
  const { value: children } = mainSegment;
  if (!children) {
    return null;
  }
  const infoSegment = children.find((s) => s.type === "Info");
  const relevantBoxes = [
    ...mainSegment.value,
    ...infoSegment && infoSegment.type === "Info" ? infoSegment.value : []
  ];
  const timestampScale2 = relevantBoxes.find((s) => s.type === "TimestampScale");
  if (!timestampScale2 || timestampScale2.type !== "TimestampScale") {
    return null;
  }
  const duration2 = relevantBoxes.find((s) => s.type === "Duration");
  if (!duration2 || duration2.type !== "Duration") {
    return null;
  }
  return duration2.value.value / timestampScale2.value.value * 1000;
};
var getDurationFromIsoBaseMedia = (parserState) => {
  const structure = parserState.structure.getIsoStructure();
  const moovBox = getMoovBoxFromState({
    structureState: parserState.structure,
    isoState: parserState.iso,
    mp4HeaderSegment: parserState.m3uPlaylistContext?.mp4HeaderSegment ?? null,
    mayUsePrecomputed: true
  });
  if (!moovBox) {
    return null;
  }
  const moofBoxes = getMoofBoxes(structure.boxes);
  const mfra = parserState.iso.mfra.getIfAlreadyLoaded();
  const tfraBoxes = deduplicateTfraBoxesByOffset([
    ...mfra ? getTfraBoxesFromMfraBoxChildren(mfra) : [],
    ...getTfraBoxes(structure.boxes)
  ]);
  if (!areSamplesComplete({ moofBoxes, tfraBoxes })) {
    return null;
  }
  const mvhdBox = getMvhdBox(moovBox);
  if (!mvhdBox) {
    return null;
  }
  if (mvhdBox.type !== "mvhd-box") {
    throw new Error("Expected mvhd-box");
  }
  if (mvhdBox.durationInSeconds > 0) {
    return mvhdBox.durationInSeconds;
  }
  const tracks2 = getTracks(parserState, true);
  const allSamples = tracks2.map((t) => {
    const { originalTimescale: ts } = t;
    const trakBox = getTrakBoxByTrackId(moovBox, t.trackId);
    if (!trakBox) {
      return null;
    }
    const { samplePositions, isComplete } = getSamplePositionsFromTrack({
      trakBox,
      moofBoxes,
      moofComplete: areSamplesComplete({ moofBoxes, tfraBoxes }),
      trexBoxes: getTrexBoxes(moovBox)
    });
    if (!isComplete) {
      return null;
    }
    if (samplePositions.length === 0) {
      return null;
    }
    const highest = samplePositions?.map((sp) => (sp.timestamp + sp.duration) / ts).reduce((a, b) => Math.max(a, b), 0);
    return highest ?? 0;
  });
  if (allSamples.every((s) => s === null)) {
    return null;
  }
  const highestTimestamp = Math.max(...allSamples.filter((s) => s !== null));
  return highestTimestamp;
};
var getDuration = (parserState) => {
  const structure = parserState.structure.getStructure();
  if (structure.type === "matroska") {
    return getDurationFromMatroska(structure.boxes);
  }
  if (structure.type === "iso-base-media") {
    return getDurationFromIsoBaseMedia(parserState);
  }
  if (structure.type === "riff") {
    return getDurationFromAvi(structure);
  }
  if (structure.type === "transport-stream") {
    return null;
  }
  if (structure.type === "mp3") {
    return getDurationFromMp3(parserState);
  }
  if (structure.type === "wav") {
    return getDurationFromWav(parserState);
  }
  if (structure.type === "aac") {
    return null;
  }
  if (structure.type === "flac") {
    return getDurationFromFlac(parserState);
  }
  if (structure.type === "m3u") {
    return getDurationFromM3u(parserState);
  }
  throw new Error("Has no duration " + structure);
};
var hasDuration = (parserState) => {
  const structure = parserState.structure.getStructureOrNull();
  if (structure === null) {
    return false;
  }
  return getHasTracks(parserState, true);
};
var hasSlowDuration = (parserState) => {
  try {
    if (!hasDuration(parserState)) {
      return false;
    }
    return getDuration(parserState) !== null;
  } catch {
    return false;
  }
};

// src/get-is-hdr.ts
var isVideoTrackHdr = (track) => {
  return track.advancedColor.matrix === "bt2020-ncl" && (track.advancedColor.transfer === "hlg" || track.advancedColor.transfer === "pq") && track.advancedColor.primaries === "bt2020";
};
var getIsHdr = (state) => {
  const tracks2 = getTracks(state, true);
  return tracks2.some((track) => track.type === "video" && isVideoTrackHdr(track));
};
var hasHdr = (state) => {
  return getHasTracks(state, true);
};

// src/containers/iso-base-media/get-keyframes.ts
var getKeyframesFromIsoBaseMedia = (state) => {
  const tracks2 = getTracksFromIsoBaseMedia({
    isoState: state.iso,
    m3uPlaylistContext: state.m3uPlaylistContext,
    structure: state.structure,
    mayUsePrecomputed: true
  });
  const videoTracks = tracks2.filter((t) => t.type === "video");
  const structure = state.structure.getIsoStructure();
  const moofBoxes = getMoofBoxes(structure.boxes);
  const tfraBoxes = getTfraBoxes(structure.boxes);
  const moov = getMoovFromFromIsoStructure(structure);
  if (!moov) {
    return [];
  }
  const allSamples = videoTracks.map((t) => {
    const { originalTimescale: ts } = t;
    const trakBox = getTrakBoxByTrackId(moov, t.trackId);
    if (!trakBox) {
      return [];
    }
    const { samplePositions, isComplete } = getSamplePositionsFromTrack({
      trakBox,
      moofBoxes,
      moofComplete: areSamplesComplete({
        moofBoxes,
        tfraBoxes
      }),
      trexBoxes: getTrexBoxes(moov)
    });
    if (!isComplete) {
      return [];
    }
    const keyframes = samplePositions.filter((k) => {
      return k.isKeyframe;
    }).map((k) => {
      return {
        trackId: t.trackId,
        presentationTimeInSeconds: k.timestamp / ts,
        decodingTimeInSeconds: k.decodingTimestamp / ts,
        positionInBytes: k.offset,
        sizeInBytes: k.size
      };
    });
    return keyframes;
  });
  return allSamples.flat();
};

// src/get-keyframes.ts
var getKeyframes = (state) => {
  const structure = state.structure.getStructure();
  if (structure.type === "iso-base-media") {
    return getKeyframesFromIsoBaseMedia(state);
  }
  return null;
};
var hasKeyframes = (parserState) => {
  const structure = parserState.structure.getStructure();
  if (structure.type === "iso-base-media") {
    return getHasTracks(parserState, true);
  }
  return true;
};

// src/containers/flac/get-metadata-from-flac.ts
var getMetadataFromFlac = (structure) => {
  const box = structure.boxes.find((b) => b.type === "flac-vorbis-comment");
  if (!box) {
    return null;
  }
  return box.fields;
};

// src/containers/mp3/get-metadata-from-mp3.ts
var getMetadataFromMp3 = (mp3Structure) => {
  const findHeader = mp3Structure.boxes.find((b) => b.type === "id3-header");
  return findHeader ? findHeader.metatags : null;
};

// src/containers/wav/get-metadata-from-wav.ts
var getMetadataFromWav = (structure) => {
  const list = structure.boxes.find((b) => b.type === "wav-list");
  if (!list) {
    return null;
  }
  return list.metadata;
};

// src/metadata/metadata-from-iso.ts
var mapToKey = (index) => {
  if (index === "�ART") {
    return "artist";
  }
  if (index === "�alb") {
    return "album";
  }
  if (index === "�cmt") {
    return "comment";
  }
  if (index === "�day") {
    return "releaseDate";
  }
  if (index === "�gen") {
    return "genre";
  }
  if (index === "�nam") {
    return "title";
  }
  if (index === "�too") {
    return "encoder";
  }
  if (index === "�wrt") {
    return "writer";
  }
  if (index === "�cpy") {
    return "copyright";
  }
  if (index === "�dir") {
    return "director";
  }
  if (index === "�prd") {
    return "producer";
  }
  if (index === "�des") {
    return "description";
  }
  return null;
};
var parseIlstBoxWithoutKeys = (ilstBox) => {
  return ilstBox.entries.map((entry) => {
    const key = mapToKey(entry.index);
    if (!key) {
      return null;
    }
    if (entry.value.type === "unknown") {
      return null;
    }
    return {
      trackId: null,
      key,
      value: entry.value.value
    };
  }).filter(truthy);
};
var parseIsoMetaBox = (meta, trackId) => {
  const ilstBox = meta.children.find((b) => b.type === "ilst-box");
  const keysBox = meta.children.find((b) => b.type === "keys-box");
  if (!ilstBox || !keysBox) {
    if (ilstBox) {
      return parseIlstBoxWithoutKeys(ilstBox);
    }
    return [];
  }
  const entries = [];
  for (let i = 0;i < ilstBox.entries.length; i++) {
    const ilstEntry = ilstBox.entries[i];
    const keysEntry = keysBox.entries[i];
    if (ilstEntry.value.type !== "unknown") {
      const value = typeof ilstEntry.value.value === "string" && ilstEntry.value.value.endsWith("\x00") ? ilstEntry.value.value.slice(0, -1) : ilstEntry.value.value;
      entries.push({
        key: keysEntry.value,
        value,
        trackId
      });
    }
  }
  return entries;
};
var getMetadataFromIsoBase = (state) => {
  const moov = getMoovBoxFromState({
    structureState: state.structure,
    isoState: state.iso,
    mp4HeaderSegment: state.m3uPlaylistContext?.mp4HeaderSegment ?? null,
    mayUsePrecomputed: true
  });
  if (!moov) {
    return [];
  }
  const traks = getTraks(moov);
  const meta = moov.children.find((b) => b.type === "regular-box" && b.boxType === "meta");
  const udta = moov.children.find((b) => b.type === "regular-box" && b.boxType === "udta");
  const metaInUdta = udta?.children.find((b) => {
    return b.type === "regular-box" && b.boxType === "meta";
  });
  const metaInTracks = traks.map((t) => {
    const metaBox = t.children.find((child) => child.type === "regular-box" && child.boxType === "meta");
    if (metaBox) {
      const tkhd = getTkhdBox(t);
      if (!tkhd) {
        throw new Error("No tkhd box found");
      }
      return parseIsoMetaBox(metaBox, tkhd.trackId);
    }
    return null;
  }).filter(truthy);
  return [
    ...meta ? parseIsoMetaBox(meta, null) : [],
    ...metaInUdta ? parseIsoMetaBox(metaInUdta, null) : [],
    ...metaInTracks.flat(1)
  ];
};

// src/metadata/metadata-from-matroska.ts
var removeEndZeroes = (value) => {
  return value.endsWith("\x00") ? removeEndZeroes(value.slice(0, -1)) : value;
};
var parseSimpleTagIntoEbml = (children, trackId) => {
  const tagName = children.find((c) => c.type === "TagName");
  const tagString = children.find((c) => c.type === "TagString");
  if (!tagName || !tagString) {
    return null;
  }
  return {
    trackId,
    key: tagName.value.toLowerCase(),
    value: removeEndZeroes(tagString.value)
  };
};
var getMetadataFromMatroska = (structure) => {
  const entries = [];
  for (const segment of structure.boxes) {
    if (segment.type !== "Segment") {
      continue;
    }
    const tags2 = segment.value.filter((s) => s.type === "Tags");
    for (const tag of tags2) {
      for (const child of tag.value) {
        if (child.type !== "Tag") {
          continue;
        }
        let trackId = null;
        const target = child.value.find((c) => c.type === "Targets");
        if (target) {
          const tagTrackId = target.value.find((c) => c.type === "TagTrackUID")?.value;
          if (tagTrackId) {
            trackId = getTrackWithUid(segment, tagTrackId);
          }
        }
        const simpleTags = child.value.filter((s) => s.type === "SimpleTag");
        for (const simpleTag of simpleTags) {
          const parsed = parseSimpleTagIntoEbml(simpleTag.value, trackId);
          if (parsed) {
            entries.push(parsed);
          }
        }
      }
    }
  }
  return entries;
};

// src/metadata/metadata-from-riff.ts
var getMetadataFromRiff = (structure) => {
  const boxes = structure.boxes.find((b) => b.type === "list-box" && b.listType === "INFO");
  if (!boxes) {
    return [];
  }
  const { children } = boxes;
  return children.map((child) => {
    if (child.type !== "isft-box") {
      return null;
    }
    return {
      trackId: null,
      key: "encoder",
      value: child.software
    };
  }).filter(truthy);
};

// src/metadata/get-metadata.ts
var getMetadata = (state) => {
  const structure = state.structure.getStructure();
  if (structure.type === "matroska") {
    return getMetadataFromMatroska(structure);
  }
  if (structure.type === "riff") {
    return getMetadataFromRiff(structure);
  }
  if (structure.type === "transport-stream" || structure.type === "m3u") {
    return [];
  }
  if (structure.type === "mp3") {
    const tags2 = getMetadataFromMp3(structure);
    return tags2 ?? [];
  }
  if (structure.type === "wav") {
    return getMetadataFromWav(structure) ?? [];
  }
  if (structure.type === "aac") {
    return [];
  }
  if (structure.type === "flac") {
    return getMetadataFromFlac(structure) ?? [];
  }
  if (structure.type === "iso-base-media") {
    return getMetadataFromIsoBase(state);
  }
  throw new Error("Unknown container " + structure);
};
var hasMetadata = (structure) => {
  if (structure.type === "mp3") {
    return getMetadataFromMp3(structure) !== null;
  }
  if (structure.type === "wav") {
    return getMetadataFromWav(structure) !== null;
  }
  if (structure.type === "m3u" || structure.type === "transport-stream" || structure.type === "aac") {
    return true;
  }
  if (structure.type === "flac") {
    return getMetadataFromFlac(structure) !== null;
  }
  if (structure.type === "iso-base-media") {
    return false;
  }
  if (structure.type === "matroska") {
    return false;
  }
  if (structure.type === "riff") {
    return false;
  }
  throw new Error("Unknown container " + structure);
};

// src/get-location.ts
function parseLocation(locationString) {
  const locationPattern = /^([+-]\d{2}\.?\d{0,10})([+-]\d{3}\.?\d{0,10})([+-]\d+(\.\d+)?)?\/$/;
  const match = locationString.match(locationPattern);
  if (!match) {
    return null;
  }
  const latitude = parseFloat(match[1]);
  const longitude = parseFloat(match[2]);
  const altitude = match[3] ? parseFloat(match[3]) : null;
  return {
    latitude,
    longitude,
    altitude
  };
}
var getLocation = (state) => {
  const metadata = getMetadata(state);
  const locationEntry = metadata.find((entry) => entry.key === "com.apple.quicktime.location.ISO6709");
  const horizontalAccuracy = metadata.find((entry) => entry.key === "com.apple.quicktime.location.accuracy.horizontal");
  if (locationEntry) {
    const parsed = parseLocation(locationEntry.value);
    if (parsed === null) {
      return null;
    }
    return {
      ...parsed,
      horizontalAccuracy: horizontalAccuracy?.value ? parseFloat(String(horizontalAccuracy.value)) : null
    };
  }
  return null;
};

// src/get-number-of-audio-channels.ts
var getNumberOfAudioChannels = (state) => {
  return state.callbacks.tracks.getTracks().find((track) => {
    return track.type === "audio";
  })?.numberOfChannels ?? null;
};
var hasNumberOfAudioChannels = (state) => {
  return state.callbacks.tracks.hasAllTracks();
};

// src/get-sample-rate.ts
var getSampleRate3 = (state) => {
  return state.callbacks.tracks.getTracks().find((track) => {
    return track.type === "audio";
  })?.sampleRate ?? null;
};
var hasSampleRate = (state) => {
  return state.callbacks.tracks.hasAllTracks();
};

// src/containers/aac/get-seeking-byte.ts
var getSeekingByteForAac = ({
  time,
  seekingHints
}) => {
  let bestAudioSample;
  for (const hint of seekingHints.audioSampleMap) {
    if (hint.timeInSeconds > time) {
      continue;
    }
    if (hint.timeInSeconds + hint.durationInSeconds < time && !seekingHints.lastSampleObserved) {
      continue;
    }
    if (!bestAudioSample) {
      bestAudioSample = hint;
      continue;
    }
    if (bestAudioSample.timeInSeconds < hint.timeInSeconds) {
      bestAudioSample = hint;
    }
  }
  if (bestAudioSample) {
    return {
      type: "do-seek",
      byte: bestAudioSample.offset,
      timeInSeconds: bestAudioSample.timeInSeconds
    };
  }
  return { type: "valid-but-must-wait" };
};

// src/containers/flac/get-seeking-byte.ts
var getSeekingByteForFlac = ({
  time,
  seekingHints
}) => {
  let bestAudioSample;
  for (const hint of seekingHints.audioSampleMap) {
    if (hint.timeInSeconds > time) {
      continue;
    }
    if (hint.timeInSeconds + hint.durationInSeconds < time && !seekingHints.lastSampleObserved) {
      continue;
    }
    if (!bestAudioSample) {
      bestAudioSample = hint;
      continue;
    }
    if (bestAudioSample.timeInSeconds < hint.timeInSeconds) {
      bestAudioSample = hint;
    }
  }
  if (bestAudioSample) {
    return bestAudioSample;
  }
  return null;
};

// src/containers/iso-base-media/find-keyframe-before-time.ts
var findKeyframeBeforeTime = ({
  samplePositions,
  time,
  timescale,
  mediaSections,
  logLevel,
  startInSeconds
}) => {
  let videoByte = 0;
  let videoSample = null;
  for (const sample of samplePositions) {
    const ctsInSeconds = sample.timestamp / timescale + startInSeconds;
    const dtsInSeconds = sample.decodingTimestamp / timescale + startInSeconds;
    if (!sample.isKeyframe) {
      continue;
    }
    if (!(ctsInSeconds <= time || dtsInSeconds <= time)) {
      continue;
    }
    if (videoByte <= sample.offset) {
      videoByte = sample.offset;
      videoSample = sample;
    }
  }
  if (!videoSample) {
    throw new Error("No sample found");
  }
  const mediaSection = mediaSections.find((section) => videoSample.offset >= section.start && videoSample.offset < section.start + section.size);
  if (!mediaSection) {
    Log.trace(logLevel, "Found a sample, but the offset has not yet been marked as a video section yet. Not yet able to seek, but probably once we have started reading the next box.", videoSample);
    return null;
  }
  return videoSample;
};

// src/containers/iso-base-media/find-track-to-seek.ts
var findAnyTrackWithSamplePositions = (allTracks, struc) => {
  const moov = getMoovFromFromIsoStructure(struc);
  if (!moov) {
    return null;
  }
  for (const track of allTracks) {
    if (track.type === "video" || track.type === "audio") {
      const trakBox = getTrakBoxByTrackId(moov, track.trackId);
      if (!trakBox) {
        continue;
      }
      const { samplePositions } = getSamplePositionsFromTrack({
        trakBox,
        moofBoxes: getMoofBoxes(struc.boxes),
        moofComplete: areSamplesComplete({
          moofBoxes: getMoofBoxes(struc.boxes),
          tfraBoxes: getTfraBoxes(struc.boxes)
        }),
        trexBoxes: getTrexBoxes(moov)
      });
      if (samplePositions.length === 0) {
        continue;
      }
      return { track, samplePositions };
    }
  }
  return null;
};
var findTrackToSeek = (allTracks, structure) => {
  const firstVideoTrack = allTracks.find((t) => t.type === "video");
  const struc = structure.getIsoStructure();
  if (!firstVideoTrack) {
    return findAnyTrackWithSamplePositions(allTracks, struc);
  }
  const moov = getMoovFromFromIsoStructure(struc);
  if (!moov) {
    return null;
  }
  const trakBox = getTrakBoxByTrackId(moov, firstVideoTrack.trackId);
  if (!trakBox) {
    return null;
  }
  const { samplePositions } = getSamplePositionsFromTrack({
    trakBox,
    moofBoxes: getMoofBoxes(struc.boxes),
    moofComplete: areSamplesComplete({
      moofBoxes: getMoofBoxes(struc.boxes),
      tfraBoxes: getTfraBoxes(struc.boxes)
    }),
    trexBoxes: getTrexBoxes(moov)
  });
  if (samplePositions.length === 0) {
    return findAnyTrackWithSamplePositions(allTracks, struc);
  }
  return { track: firstVideoTrack, samplePositions };
};

// src/state/video-section.ts
var isByteInMediaSection = ({
  position,
  mediaSections
}) => {
  if (mediaSections.length === 0) {
    return "no-section-defined";
  }
  for (const section of mediaSections) {
    if (position >= section.start && position < section.start + section.size) {
      return "in-section";
    }
  }
  return "outside-section";
};
var getCurrentMediaSection = ({
  offset,
  mediaSections
}) => {
  for (const section of mediaSections) {
    if (offset >= section.start && offset < section.start + section.size) {
      return section;
    }
  }
  return null;
};
var mediaSectionState = () => {
  const mediaSections = [];
  const addMediaSection = (section) => {
    const overlaps = mediaSections.some((existingSection) => section.start < existingSection.start + existingSection.size && section.start + section.size > existingSection.start);
    if (overlaps) {
      return;
    }
    for (let i = mediaSections.length - 1;i >= 0; i--) {
      const existingSection = mediaSections[i];
      if (section.start <= existingSection.start && section.start + section.size >= existingSection.start + existingSection.size) {
        mediaSections.splice(i, 1);
      }
    }
    mediaSections.push(section);
  };
  const getMediaSections = () => {
    return mediaSections;
  };
  const isCurrentByteInMediaSection = (iterator) => {
    const offset = iterator.counter.getOffset();
    return isByteInMediaSection({
      position: offset,
      mediaSections
    });
  };
  const getMediaSectionAssertOnlyOne = () => {
    if (mediaSections.length !== 1) {
      throw new Error("Expected only one video section");
    }
    return mediaSections[0];
  };
  return {
    addMediaSection,
    getMediaSections,
    isCurrentByteInMediaSection,
    isByteInMediaSection,
    getCurrentMediaSection,
    getMediaSectionAssertOnlyOne,
    mediaSections
  };
};

// src/containers/iso-base-media/get-sample-position-bounds.ts
var getSamplePositionBounds = (samplePositions, timescale) => {
  let min = Infinity;
  let max = -Infinity;
  for (const samplePosition of samplePositions) {
    const timestampMin = Math.min(samplePosition.timestamp, samplePosition.decodingTimestamp);
    const timestampMax = Math.max(samplePosition.timestamp, samplePosition.decodingTimestamp) + (samplePosition.duration ?? 0);
    if (timestampMin < min) {
      min = timestampMin;
    }
    if (timestampMax > max) {
      max = timestampMax;
    }
  }
  return { min: min / timescale, max: max / timescale };
};

// src/containers/iso-base-media/mfra/find-best-segment-from-tfra.ts
var findBestSegmentFromTfra = ({
  mfra,
  time,
  firstTrack,
  timescale
}) => {
  const tfra = mfra.find((b) => b.type === "tfra-box" && b.trackId === firstTrack.trackId);
  if (!tfra) {
    return null;
  }
  let bestSegment = null;
  for (const segment of tfra.entries) {
    if (segment.time / timescale <= time) {
      bestSegment = segment;
    }
  }
  if (!bestSegment) {
    return null;
  }
  const currentSegmentIndex = tfra.entries.indexOf(bestSegment);
  const offsetOfNext = currentSegmentIndex === tfra.entries.length - 1 ? Infinity : tfra.entries[currentSegmentIndex + 1].moofOffset;
  return {
    start: bestSegment.moofOffset,
    end: offsetOfNext
  };
};

// src/containers/iso-base-media/get-seeking-byte-from-fragmented-mp4.ts
var getSeekingByteFromFragmentedMp4 = async ({
  info,
  time,
  logLevel,
  currentPosition,
  isoState,
  tracks: tracks2,
  isLastChunkInPlaylist,
  structure,
  mp4HeaderSegment
}) => {
  const firstVideoTrack = tracks2.find((t) => t.type === "video");
  const firstTrack = firstVideoTrack ?? tracks2.find((t) => t.type === "audio");
  if (!firstTrack) {
    throw new Error("no video and no audio tracks");
  }
  const moov = getMoovBoxFromState({
    structureState: structure,
    isoState,
    mp4HeaderSegment,
    mayUsePrecomputed: true
  });
  if (!moov) {
    throw new Error("No moov atom found");
  }
  const trakBox = getTrakBoxByTrackId(moov, firstTrack.trackId);
  if (!trakBox) {
    throw new Error("No trak box found");
  }
  const tkhdBox = getTkhdBox(trakBox);
  if (!tkhdBox) {
    throw new Error("Expected tkhd box in trak box");
  }
  const isComplete = areSamplesComplete({
    moofBoxes: info.moofBoxes,
    tfraBoxes: info.tfraBoxes
  });
  const { samplePositions: samplePositionsArray } = collectSamplePositionsFromMoofBoxes({
    moofBoxes: info.moofBoxes,
    tkhdBox,
    isComplete,
    trexBoxes: getTrexBoxes(moov)
  });
  Log.trace(logLevel, "Fragmented MP4 - Checking if we have seeking info for this time range");
  for (const positions of samplePositionsArray) {
    const { min, max } = getSamplePositionBounds(positions.samples, firstTrack.originalTimescale);
    if (min <= time && (positions.isLastFragment || isLastChunkInPlaylist || time <= max)) {
      Log.trace(logLevel, `Fragmented MP4 - Found that we have seeking info for this time range: ${min} <= ${time} <= ${max}`);
      const kf = findKeyframeBeforeTime({
        samplePositions: positions.samples,
        time,
        timescale: firstTrack.originalTimescale,
        logLevel,
        mediaSections: info.mediaSections,
        startInSeconds: firstTrack.startInSeconds
      });
      if (kf) {
        return {
          type: "do-seek",
          byte: kf.offset,
          timeInSeconds: Math.min(kf.decodingTimestamp, kf.timestamp) / firstTrack.originalTimescale
        };
      }
    }
  }
  const atom = await (info.mfraAlreadyLoaded ? Promise.resolve(info.mfraAlreadyLoaded) : isoState.mfra.triggerLoad());
  if (atom) {
    const moofOffset = findBestSegmentFromTfra({
      mfra: atom,
      time,
      firstTrack,
      timescale: firstTrack.originalTimescale
    });
    if (moofOffset !== null && !(moofOffset.start <= currentPosition && currentPosition < moofOffset.end)) {
      Log.verbose(logLevel, `Fragmented MP4 - Found based on mfra information that we should seek to: ${moofOffset.start} ${moofOffset.end}`);
      return {
        type: "intermediary-seek",
        byte: moofOffset.start
      };
    }
  }
  Log.trace(logLevel, "Fragmented MP4 - No seeking info found for this time range.");
  if (isByteInMediaSection({
    position: currentPosition,
    mediaSections: info.mediaSections
  }) !== "in-section") {
    return {
      type: "valid-but-must-wait"
    };
  }
  Log.trace(logLevel, "Fragmented MP4 - Inside the wrong video section, skipping to the end of the section");
  const mediaSection = getCurrentMediaSection({
    offset: currentPosition,
    mediaSections: info.mediaSections
  });
  if (!mediaSection) {
    throw new Error("No video section defined");
  }
  return {
    type: "intermediary-seek",
    byte: mediaSection.start + mediaSection.size
  };
};

// src/containers/iso-base-media/get-seeking-byte.ts
var getSeekingByteFromIsoBaseMedia = ({
  info,
  time,
  logLevel,
  currentPosition,
  isoState,
  m3uPlaylistContext,
  structure
}) => {
  const tracks2 = getTracksFromIsoBaseMedia({
    isoState,
    m3uPlaylistContext,
    structure,
    mayUsePrecomputed: false
  });
  const hasMoov = Boolean(getMoovBoxFromState({
    structureState: structure,
    isoState,
    mayUsePrecomputed: false,
    mp4HeaderSegment: m3uPlaylistContext?.mp4HeaderSegment ?? null
  }));
  if (!hasMoov) {
    Log.trace(logLevel, "No moov box found, must wait");
    return Promise.resolve({
      type: "valid-but-must-wait"
    });
  }
  if (info.moofBoxes.length > 0) {
    return getSeekingByteFromFragmentedMp4({
      info,
      time,
      logLevel,
      currentPosition,
      isoState,
      tracks: tracks2,
      isLastChunkInPlaylist: m3uPlaylistContext?.isLastChunkInPlaylist ?? false,
      structure,
      mp4HeaderSegment: m3uPlaylistContext?.mp4HeaderSegment ?? null
    });
  }
  const trackWithSamplePositions = findTrackToSeek(tracks2, structure);
  if (!trackWithSamplePositions) {
    return Promise.resolve({
      type: "valid-but-must-wait"
    });
  }
  const { track, samplePositions } = trackWithSamplePositions;
  const keyframe = findKeyframeBeforeTime({
    samplePositions,
    time,
    timescale: track.originalTimescale,
    logLevel,
    mediaSections: info.mediaSections,
    startInSeconds: track.startInSeconds
  });
  if (keyframe) {
    return Promise.resolve({
      type: "do-seek",
      byte: keyframe.offset,
      timeInSeconds: Math.min(keyframe.decodingTimestamp, keyframe.timestamp) / track.originalTimescale
    });
  }
  return Promise.resolve({
    type: "invalid"
  });
};

// src/containers/m3u/get-seeking-byte.ts
var clearM3uStateInPrepareForSeek = ({
  m3uState,
  logLevel
}) => {
  const selectedPlaylists = m3uState.getSelectedPlaylists();
  for (const playlistUrl of selectedPlaylists) {
    const streamRun = m3uState.getM3uStreamRun(playlistUrl);
    if (streamRun) {
      streamRun.abort();
    }
    Log.trace(logLevel, "Clearing M3U stream run for", playlistUrl);
    m3uState.setM3uStreamRun(playlistUrl, null);
  }
  m3uState.clearAllChunksProcessed();
  m3uState.sampleSorter.clearSamples();
};
var getSeekingByteForM3u8 = ({
  time,
  currentPosition,
  m3uState,
  logLevel
}) => {
  clearM3uStateInPrepareForSeek({ m3uState, logLevel });
  const selectedPlaylists = m3uState.getSelectedPlaylists();
  for (const playlistUrl of selectedPlaylists) {
    m3uState.setSeekToSecondsToProcess(playlistUrl, {
      targetTime: time
    });
  }
  return {
    type: "do-seek",
    byte: currentPosition,
    timeInSeconds: time
  };
};

// src/containers/mp3/seek/get-approximate-byte-from-bitrate.ts
var getApproximateByteFromBitrate = ({
  mp3BitrateInfo,
  timeInSeconds,
  mp3Info,
  mediaSection,
  contentLength
}) => {
  if (mp3BitrateInfo.type === "variable") {
    return null;
  }
  const samplesPerFrame = getSamplesPerMpegFrame({
    layer: mp3Info.layer,
    mpegVersion: mp3Info.mpegVersion
  });
  const frameLengthInBytes = getMpegFrameLength({
    bitrateKbit: mp3BitrateInfo.bitrateInKbit,
    padding: false,
    samplesPerFrame,
    samplingFrequency: mp3Info.sampleRate,
    layer: mp3Info.layer
  });
  const frameIndexUnclamped = Math.floor(timeInSeconds * mp3Info.sampleRate / samplesPerFrame);
  const frames = Math.floor((contentLength - mediaSection.start) / frameLengthInBytes);
  const frameIndex = Math.min(frames - 1, frameIndexUnclamped);
  const byteRelativeToMediaSection = frameIndex * frameLengthInBytes;
  const byteBeforeFrame = byteRelativeToMediaSection + mediaSection.start;
  return byteBeforeFrame;
};

// src/containers/mp3/seek/get-byte-from-observed-samples.ts
var getByteFromObservedSamples = ({
  info,
  timeInSeconds
}) => {
  let bestAudioSample;
  for (const hint of info.audioSampleMap) {
    if (hint.timeInSeconds > timeInSeconds) {
      continue;
    }
    if (hint.timeInSeconds + hint.durationInSeconds < timeInSeconds && !info.lastSampleObserved) {
      continue;
    }
    if (!bestAudioSample) {
      bestAudioSample = hint;
      continue;
    }
    if (bestAudioSample.timeInSeconds < hint.timeInSeconds) {
      bestAudioSample = hint;
    }
  }
  return bestAudioSample;
};

// src/containers/mp3/parse-xing.ts
var SAMPLE_RATES = [44100, 48000, 32000, 99999];
var FRAMES_FLAG = 1;
var BYTES_FLAG = 2;
var TOC_FLAG = 4;
var VBR_SCALE_FLAG = 8;
var extractI4 = (data, offset) => {
  let x = 0;
  x = data[offset];
  x <<= 8;
  x |= data[offset + 1];
  x <<= 8;
  x |= data[offset + 2];
  x <<= 8;
  x |= data[offset + 3];
  return x;
};
var parseXing = (data) => {
  const h_id = data[1] >> 3 & 1;
  const h_sr_index = data[2] >> 2 & 3;
  const h_mode = data[3] >> 6 & 3;
  let xingOffset = 0;
  if (h_id) {
    if (h_mode !== 3) {
      xingOffset += 32 + 4;
    } else {
      xingOffset += 17 + 4;
    }
  } else if (h_mode !== 3) {
    xingOffset += 17 + 4;
  } else {
    xingOffset += 9 + 4;
  }
  const expectXing = new TextDecoder("utf8").decode(data.slice(xingOffset, xingOffset + 4));
  if (expectXing !== "Xing") {
    throw new Error("Invalid Xing header");
  }
  let sampleRate = SAMPLE_RATES[h_sr_index];
  if (h_id === 0) {
    sampleRate >>= 1;
  }
  let offset = xingOffset + 4;
  const flags = extractI4(data, offset);
  offset += 4;
  let numberOfFrames;
  let fileSize;
  let tableOfContents;
  let vbrScale;
  if (flags & FRAMES_FLAG) {
    numberOfFrames = extractI4(data, offset);
    offset += 4;
  }
  if (flags & BYTES_FLAG) {
    fileSize = extractI4(data, offset);
    offset += 4;
  }
  if (flags & TOC_FLAG) {
    tableOfContents = data.slice(offset, offset + 100);
    offset += 100;
  }
  if (flags & VBR_SCALE_FLAG) {
    vbrScale = extractI4(data, offset);
    offset += 4;
  }
  if (offset > data.length) {
    throw new Error("xing header was parsed wrong: read beyond available data");
  }
  return {
    sampleRate,
    numberOfFrames: numberOfFrames ?? null,
    fileSize: fileSize ?? null,
    tableOfContents: tableOfContents ? Array.from(tableOfContents.slice(0, 100)) : null,
    vbrScale: vbrScale ?? null
  };
};
var getSeekPointInBytes = ({
  fileSize,
  percentBetween0And100,
  tableOfContents
}) => {
  let index = Math.floor(percentBetween0And100);
  if (index > 99) {
    index = 99;
  }
  const fa = tableOfContents[index];
  let fb;
  if (index < 99) {
    fb = tableOfContents[index + 1];
  } else {
    fb = 256;
  }
  const fx = fa + (fb - fa) * (percentBetween0And100 - index);
  const seekPoint = 1 / 256 * fx * fileSize;
  return Math.floor(seekPoint);
};
var getTimeFromPosition = ({
  position,
  fileSize,
  tableOfContents,
  durationInSeconds
}) => {
  const positionNormalized = position / fileSize * 256;
  let index = 0;
  while (index < 99 && tableOfContents[index + 1] <= positionNormalized) {
    index++;
  }
  const fa = tableOfContents[index];
  const fb = index < 99 ? tableOfContents[index + 1] : 256;
  const percentWithinSegment = (positionNormalized - fa) / (fb - fa);
  const percentBetween0And100 = index + percentWithinSegment;
  return percentBetween0And100 / 100 * durationInSeconds;
};

// src/containers/mp3/seek/get-seek-point-from-xing.ts
var getSeekPointFromXing = ({
  timeInSeconds,
  xingData,
  mp3Info
}) => {
  const samplesPerFrame = getSamplesPerMpegFrame({
    layer: mp3Info.layer,
    mpegVersion: mp3Info.mpegVersion
  });
  const duration2 = getDurationFromMp3Xing({
    xingData,
    samplesPerFrame
  });
  const totalSamples = timeInSeconds * xingData.sampleRate;
  const oneFrameSubtracted = totalSamples - samplesPerFrame;
  const timeToTarget = Math.max(0, oneFrameSubtracted / xingData.sampleRate);
  if (!xingData.fileSize || !xingData.tableOfContents) {
    throw new Error("Cannot seek of VBR MP3 file");
  }
  return getSeekPointInBytes({
    fileSize: xingData.fileSize,
    percentBetween0And100: timeToTarget / duration2 * 100,
    tableOfContents: xingData.tableOfContents
  });
};

// src/containers/mp3/get-seeking-byte.ts
var getSeekingByteForMp3 = ({
  time,
  info
}) => {
  if (info.mp3BitrateInfo === null || info.mp3Info === null || info.mediaSection === null) {
    return {
      type: "valid-but-must-wait"
    };
  }
  const approximateByte = getApproximateByteFromBitrate({
    mp3BitrateInfo: info.mp3BitrateInfo,
    timeInSeconds: time,
    mp3Info: info.mp3Info,
    mediaSection: info.mediaSection,
    contentLength: info.contentLength
  });
  const bestAudioSample = getByteFromObservedSamples({
    info,
    timeInSeconds: time
  });
  const xingSeekPoint = info.mp3BitrateInfo.type === "variable" ? getSeekPointFromXing({
    mp3Info: info.mp3Info,
    timeInSeconds: time,
    xingData: info.mp3BitrateInfo.xingData
  }) : null;
  const candidates = [
    approximateByte,
    bestAudioSample?.offset ?? null,
    xingSeekPoint
  ].filter((b) => b !== null);
  if (candidates.length === 0) {
    return {
      type: "valid-but-must-wait"
    };
  }
  const byte = Math.max(...candidates);
  const timeInSeconds = byte === bestAudioSample?.offset ? bestAudioSample.timeInSeconds : time;
  return {
    type: "do-seek",
    byte,
    timeInSeconds
  };
};

// src/find-last-keyframe.ts
function findLastKeyframe({
  keyframes,
  timeInSeconds
}) {
  let bestKeyframe = null;
  for (const keyframe of keyframes) {
    if (keyframe.presentationTimeInSeconds > timeInSeconds && keyframe.decodingTimeInSeconds > timeInSeconds) {
      break;
    }
    if (bestKeyframe === null || keyframe.presentationTimeInSeconds > bestKeyframe.presentationTimeInSeconds) {
      bestKeyframe = keyframe;
    }
  }
  return bestKeyframe;
}

// src/containers/riff/get-seeking-byte.ts
var getSeekingByteForRiff = async ({
  info,
  time,
  riffState,
  avcState
}) => {
  const idx1Entries = await (info.hasIndex ? riffState.lazyIdx1.waitForLoaded() : Promise.resolve(null));
  if (idx1Entries === null) {
    const lastKeyframe = findLastKeyframe({
      keyframes: info.observedKeyframes,
      timeInSeconds: time
    });
    if (lastKeyframe === null) {
      return {
        type: "valid-but-must-wait"
      };
    }
    riffState.sampleCounter.setSamplesFromSeek(lastKeyframe.sampleCounts);
    riffState.queuedBFrames.clear();
    avcState.clear();
    return {
      type: "do-seek",
      byte: lastKeyframe.positionInBytes,
      timeInSeconds: Math.min(lastKeyframe.decodingTimeInSeconds, lastKeyframe.presentationTimeInSeconds)
    };
  }
  if (idx1Entries.videoTrackIndex === null) {
    throw new Error("videoTrackIndex is null");
  }
  if (info.samplesPerSecond === null) {
    throw new Error("samplesPerSecond is null");
  }
  const index = Math.floor(time * info.samplesPerSecond);
  let bestEntry = null;
  for (const entry of idx1Entries.entries) {
    if (entry.sampleCounts[idx1Entries.videoTrackIndex] > index) {
      continue;
    }
    if (bestEntry && entry.sampleCounts[idx1Entries.videoTrackIndex] < bestEntry.sampleCounts[idx1Entries.videoTrackIndex]) {
      continue;
    }
    bestEntry = entry;
  }
  if (!bestEntry) {
    throw new Error("No best entry");
  }
  if (info.moviOffset === null) {
    throw new Error("moviOffset is null");
  }
  riffState.sampleCounter.setSamplesFromSeek(bestEntry.sampleCounts);
  riffState.queuedBFrames.clear();
  avcState.clear();
  return {
    type: "do-seek",
    byte: bestEntry.offset + info.moviOffset - 4,
    timeInSeconds: bestEntry.sampleCounts[idx1Entries.videoTrackIndex] / info.samplesPerSecond
  };
};

// src/convert-audio-or-video-sample.ts
var fixFloat = (value) => {
  if (value % 1 < 0.0000001) {
    return Math.floor(value);
  }
  if (value % 1 > 0.9999999) {
    return Math.ceil(value);
  }
  return value;
};
var convertAudioOrVideoSampleToWebCodecsTimestamps = ({
  sample,
  timescale
}) => {
  if (timescale === WEBCODECS_TIMESCALE) {
    return sample;
  }
  const { decodingTimestamp: dts, timestamp } = sample;
  return {
    decodingTimestamp: fixFloat(dts * (WEBCODECS_TIMESCALE / timescale)),
    timestamp: fixFloat(timestamp * (WEBCODECS_TIMESCALE / timescale)),
    duration: sample.duration === undefined ? undefined : fixFloat(sample.duration * (WEBCODECS_TIMESCALE / timescale)),
    data: sample.data,
    type: sample.type,
    offset: sample.offset,
    ..."avc" in sample ? { avc: sample.avc } : {}
  };
};

// src/register-track.ts
var registerVideoTrack = async ({
  track,
  container,
  logLevel,
  onVideoTrack,
  registerVideoSampleCallback,
  tracks: tracks2
}) => {
  if (tracks2.getTracks().find((t) => t.trackId === track.trackId)) {
    Log.trace(logLevel, `Track ${track.trackId} already registered, skipping`);
    return null;
  }
  if (track.type !== "video") {
    throw new Error("Expected video track");
  }
  tracks2.addTrack(track);
  if (!onVideoTrack) {
    return null;
  }
  const callback = await onVideoTrack({
    track,
    container
  });
  await registerVideoSampleCallback(track.trackId, callback ?? null);
  return callback;
};
var registerAudioTrack = async ({
  track,
  container,
  tracks: tracks2,
  logLevel,
  onAudioTrack,
  registerAudioSampleCallback
}) => {
  if (tracks2.getTracks().find((t) => t.trackId === track.trackId)) {
    Log.trace(logLevel, `Track ${track.trackId} already registered, skipping`);
    return null;
  }
  if (track.type !== "audio") {
    throw new Error("Expected audio track");
  }
  tracks2.addTrack(track);
  if (!onAudioTrack) {
    return null;
  }
  const callback = await onAudioTrack({
    track,
    container
  });
  await registerAudioSampleCallback(track.trackId, callback ?? null);
  return callback;
};
var registerVideoTrackWhenProfileIsAvailable = ({
  state,
  track,
  container
}) => {
  state.riff.registerOnAvcProfileCallback(async (profile) => {
    await registerVideoTrack({
      track: addAvcProfileToTrack(track, profile),
      container,
      logLevel: state.logLevel,
      onVideoTrack: state.onVideoTrack,
      registerVideoSampleCallback: state.callbacks.registerVideoSampleCallback,
      tracks: state.callbacks.tracks
    });
  });
};

// src/containers/avc/interpret-sps.ts
var getDimensionsFromSps = (sps) => {
  const height = sps.pic_height_in_map_units_minus1;
  const width = sps.pic_width_in_mbs_minus1;
  return {
    height: (height + 1) * 16 - (sps.frame_crop_bottom_offset ?? 0) * 2 - (sps.frame_crop_top_offset ?? 0) * 2,
    width: (width + 1) * 16 - (sps.frame_crop_right_offset ?? 0) * 2 - (sps.frame_crop_left_offset ?? 0) * 2
  };
};
var getSampleAspectRatioFromSps = (sps) => {
  if (sps.vui_parameters?.sar_height && sps.vui_parameters.sar_width) {
    return {
      width: sps.vui_parameters.sar_width,
      height: sps.vui_parameters.sar_height
    };
  }
  return {
    width: 1,
    height: 1
  };
};
var getVideoColorFromSps = (sps) => {
  const matrixCoefficients2 = sps.vui_parameters?.matrix_coefficients;
  const transferCharacteristics2 = sps.vui_parameters?.transfer_characteristics;
  const colorPrimaries = sps.vui_parameters?.colour_primaries;
  return {
    matrix: matrixCoefficients2 ? getMatrixCoefficientsFromIndex(matrixCoefficients2) : null,
    transfer: transferCharacteristics2 ? getTransferCharacteristicsFromIndex(transferCharacteristics2) : null,
    primaries: colorPrimaries ? getPrimariesFromIndex(colorPrimaries) : null,
    fullRange: sps.vui_parameters?.video_full_range_flag ?? null
  };
};

// src/containers/avc/key.ts
var getKeyFrameOrDeltaFromAvcInfo = (infos) => {
  const keyOrDelta = infos.find((i) => i.type === "keyframe" || i.type === "delta-frame");
  if (!keyOrDelta) {
    throw new Error("expected avc to contain info about key or delta");
  }
  return keyOrDelta.type === "keyframe" ? "key" : keyOrDelta.isBidirectionalFrame ? "bidirectional" : "delta";
};

// src/containers/avc/parse-avc.ts
var Extended_SAR = 255;
var getPoc = (iterator, sps, avcState, isReferencePicture) => {
  const { pic_order_cnt_type, log2_max_pic_order_cnt_lsb_minus4 } = sps;
  if (pic_order_cnt_type !== 0) {
    return null;
  }
  const prevPicOrderCntLsb = avcState.getPrevPicOrderCntLsb();
  const prevPicOrderCntMsb = avcState.getPrevPicOrderCntMsb();
  if (log2_max_pic_order_cnt_lsb_minus4 === null) {
    throw new Error("log2_max_pic_order_cnt_lsb_minus4 is null");
  }
  const max_pic_order_cnt_lsb = 2 ** (log2_max_pic_order_cnt_lsb_minus4 + 4);
  const pic_order_cnt_lsb = iterator.getBits(log2_max_pic_order_cnt_lsb_minus4 + 4);
  let picOrderCntMsb;
  if (pic_order_cnt_lsb < prevPicOrderCntLsb && prevPicOrderCntLsb - pic_order_cnt_lsb >= max_pic_order_cnt_lsb / 2) {
    picOrderCntMsb = prevPicOrderCntMsb + max_pic_order_cnt_lsb;
  } else if (pic_order_cnt_lsb > prevPicOrderCntLsb && pic_order_cnt_lsb - prevPicOrderCntLsb > max_pic_order_cnt_lsb / 2) {
    picOrderCntMsb = prevPicOrderCntMsb - max_pic_order_cnt_lsb;
  } else {
    picOrderCntMsb = prevPicOrderCntMsb;
  }
  const poc = picOrderCntMsb + pic_order_cnt_lsb;
  if (isReferencePicture) {
    avcState.setPrevPicOrderCntLsb(pic_order_cnt_lsb);
    avcState.setPrevPicOrderCntMsb(picOrderCntMsb);
  }
  return poc;
};
var readVuiParameters = (iterator) => {
  let sar_width = null;
  let sar_height = null;
  let overscan_appropriate_flag = null;
  let video_format = null;
  let video_full_range_flag = null;
  let colour_primaries = null;
  let transfer_characteristics = null;
  let matrix_coefficients = null;
  let chroma_sample_loc_type_top_field = null;
  let chroma_sample_loc_type_bottom_field = null;
  const aspect_ratio_info_present_flag = iterator.getBits(1);
  if (aspect_ratio_info_present_flag) {
    const aspect_ratio_idc = iterator.getBits(8);
    if (aspect_ratio_idc === Extended_SAR) {
      sar_width = iterator.getBits(16);
      sar_height = iterator.getBits(16);
    }
  }
  const overscan_info_present_flag = iterator.getBits(1);
  if (overscan_info_present_flag) {
    overscan_appropriate_flag = iterator.getBits(1);
  }
  const video_signal_type_present_flag = iterator.getBits(1);
  if (video_signal_type_present_flag) {
    video_format = iterator.getBits(3);
    video_full_range_flag = Boolean(iterator.getBits(1));
    const colour_description_present_flag = iterator.getBits(1);
    if (colour_description_present_flag) {
      colour_primaries = iterator.getBits(8);
      transfer_characteristics = iterator.getBits(8);
      matrix_coefficients = iterator.getBits(8);
    }
  }
  const chroma_loc_info_present_flag = iterator.getBits(1);
  if (chroma_loc_info_present_flag) {
    chroma_sample_loc_type_top_field = iterator.readExpGolomb();
    chroma_sample_loc_type_bottom_field = iterator.readExpGolomb();
  }
  return {
    sar_width,
    sar_height,
    overscan_appropriate_flag,
    chroma_sample_loc_type_bottom_field,
    chroma_sample_loc_type_top_field,
    colour_primaries,
    matrix_coefficients,
    transfer_characteristics,
    video_format,
    video_full_range_flag
  };
};
var readSps = (iterator) => {
  const profile = iterator.getUint8();
  const compatibility = iterator.getUint8();
  const level = iterator.getUint8();
  iterator.startReadingBits();
  const seq_parameter_set_id = iterator.readExpGolomb();
  let separate_colour_plane_flag = null;
  let bit_depth_luma_minus8 = null;
  let bit_depth_chroma_minus8 = null;
  let qpprime_y_zero_transform_bypass_flag = null;
  let log2_max_frame_num_minus4 = null;
  let log2_max_pic_order_cnt_lsb_minus4 = null;
  let max_num_ref_frames = null;
  let gaps_in_frame_num_value_allowed_flag = null;
  let mb_adaptive_frame_field_flag = null;
  let direct_8x8_inference_flag = null;
  let frame_crop_left_offset = null;
  let frame_crop_right_offset = null;
  let frame_crop_top_offset = null;
  let frame_crop_bottom_offset = null;
  let vui_parameters = null;
  if (profile === 100 || profile === 110 || profile === 122 || profile === 244 || profile === 44 || profile === 83 || profile === 86 || profile === 118 || profile === 128 || profile === 138 || profile === 139 || profile === 134 || profile === 135) {
    const chromaFormat = iterator.readExpGolomb();
    if (chromaFormat === 3) {
      separate_colour_plane_flag = iterator.getBits(1);
    }
    bit_depth_luma_minus8 = iterator.readExpGolomb();
    bit_depth_chroma_minus8 = iterator.readExpGolomb();
    qpprime_y_zero_transform_bypass_flag = iterator.getBits(1);
    const seq_scaling_matrix_present_flag = iterator.getBits(1);
    const seq_scaling_list_present_flag = [];
    if (seq_scaling_matrix_present_flag) {
      for (let i = 0;i < (chromaFormat !== 3 ? 8 : 12); i++) {
        seq_scaling_list_present_flag[i] = iterator.getBits(1);
        if (seq_scaling_list_present_flag[i]) {
          if (i < 6) {
            throw new Error("Not implemented");
          } else {
            throw new Error("Not implemented");
          }
        }
      }
    }
  }
  log2_max_frame_num_minus4 = iterator.readExpGolomb();
  const pic_order_cnt_type = iterator.readExpGolomb();
  if (pic_order_cnt_type === 0) {
    log2_max_pic_order_cnt_lsb_minus4 = iterator.readExpGolomb();
  } else if (pic_order_cnt_type === 1) {
    throw new Error("pic_order_cnt_type = 1 not implemented");
  }
  max_num_ref_frames = iterator.readExpGolomb();
  gaps_in_frame_num_value_allowed_flag = iterator.getBits(1);
  const pic_width_in_mbs_minus1 = iterator.readExpGolomb();
  const pic_height_in_map_units_minus1 = iterator.readExpGolomb();
  const frame_mbs_only_flag = iterator.getBits(1);
  if (!frame_mbs_only_flag) {
    mb_adaptive_frame_field_flag = iterator.getBits(1);
  }
  direct_8x8_inference_flag = iterator.getBits(1);
  const frame_cropping_flag = iterator.getBits(1);
  if (frame_cropping_flag) {
    frame_crop_left_offset = iterator.readExpGolomb();
    frame_crop_right_offset = iterator.readExpGolomb();
    frame_crop_top_offset = iterator.readExpGolomb();
    frame_crop_bottom_offset = iterator.readExpGolomb();
  }
  const vui_parameters_present_flag = iterator.getBits(1);
  if (vui_parameters_present_flag) {
    vui_parameters = readVuiParameters(iterator);
  }
  iterator.stopReadingBits();
  return {
    profile,
    compatibility,
    level,
    bit_depth_chroma_minus8,
    bit_depth_luma_minus8,
    gaps_in_frame_num_value_allowed_flag,
    log2_max_frame_num_minus4,
    log2_max_pic_order_cnt_lsb_minus4,
    max_num_ref_frames,
    pic_height_in_map_units_minus1,
    pic_width_in_mbs_minus1,
    qpprime_y_zero_transform_bypass_flag,
    separate_colour_plane_flag,
    seq_parameter_set_id,
    direct_8x8_inference_flag,
    frame_crop_bottom_offset,
    frame_crop_left_offset,
    frame_crop_right_offset,
    frame_crop_top_offset,
    mb_adaptive_frame_field_flag,
    vui_parameters,
    pic_order_cnt_type
  };
};
var findEnd = (buffer) => {
  let zeroesInARow = 0;
  for (let i = 0;i < buffer.length; i++) {
    const val = buffer[i];
    if (val === 0) {
      zeroesInARow++;
      continue;
    }
    if (zeroesInARow >= 2 && val === 1) {
      return i - zeroesInARow;
    }
    zeroesInARow = 0;
  }
  return null;
};
var inspect = (buffer, avcState) => {
  const iterator = getArrayBufferIterator({
    initialData: buffer,
    maxBytes: buffer.byteLength,
    logLevel: "error"
  });
  iterator.startReadingBits();
  iterator.getBits(1);
  const nal_ref_idc = iterator.getBits(2);
  const isReferencePicture = nal_ref_idc !== 0;
  const type = iterator.getBits(5);
  if (type === 7) {
    iterator.stopReadingBits();
    const end = findEnd(buffer);
    const data = readSps(iterator);
    const sps = buffer.slice(0, end === null ? Infinity : end);
    avcState.setSps(data);
    if (isReferencePicture) {
      avcState.setPrevPicOrderCntLsb(0);
      avcState.setPrevPicOrderCntMsb(0);
    }
    return {
      spsData: data,
      sps,
      type: "avc-profile"
    };
  }
  if (type === 5) {
    avcState.setPrevPicOrderCntLsb(0);
    avcState.setPrevPicOrderCntMsb(0);
    iterator.readExpGolomb();
    iterator.readExpGolomb();
    iterator.readExpGolomb();
    const sps = avcState.getSps();
    if (!sps) {
      throw new Error("SPS not found");
    }
    const numberOfBitsForFrameNum = sps.log2_max_frame_num_minus4 + 4;
    iterator.getBits(numberOfBitsForFrameNum);
    iterator.readExpGolomb();
    const { pic_order_cnt_type } = sps;
    let poc = null;
    if (pic_order_cnt_type === 0) {
      poc = getPoc(iterator, sps, avcState, isReferencePicture);
    }
    iterator.stopReadingBits();
    return {
      type: "keyframe",
      poc
    };
  }
  if (type === 8) {
    iterator.stopReadingBits();
    const end = findEnd(buffer);
    const pps = buffer.slice(0, end === null ? Infinity : end);
    return {
      type: "avc-pps",
      pps
    };
  }
  if (type === 1) {
    iterator.readExpGolomb();
    const slice_type = iterator.readExpGolomb();
    const isBidirectionalFrame = slice_type === 6;
    iterator.readExpGolomb();
    const sps = avcState.getSps();
    if (!sps) {
      throw new Error("SPS not found");
    }
    const numberOfBitsForFrameNum = sps.log2_max_frame_num_minus4 + 4;
    iterator.getBits(numberOfBitsForFrameNum);
    const { pic_order_cnt_type } = sps;
    let poc = null;
    if (pic_order_cnt_type === 0) {
      poc = getPoc(iterator, sps, avcState, isReferencePicture);
    }
    iterator.stopReadingBits();
    return {
      type: "delta-frame",
      isBidirectionalFrame,
      poc
    };
  }
  iterator.destroy();
  return null;
};
var parseAvc = (buffer, avcState) => {
  let zeroesInARow = 0;
  const infos = [];
  for (let i = 0;i < buffer.length; i++) {
    const val = buffer[i];
    if (val === 0) {
      zeroesInARow++;
      continue;
    }
    if (zeroesInARow >= 2 && val === 1) {
      zeroesInARow = 0;
      const info = inspect(buffer.slice(i + 1, i + 100), avcState);
      if (info) {
        infos.push(info);
        if (info.type === "keyframe" || info.type === "delta-frame") {
          break;
        }
      }
    }
    if (val !== 1) {
      zeroesInARow = 0;
    }
  }
  return infos;
};

// src/containers/avc/sps-and-pps.ts
var getSpsAndPps = (infos) => {
  const avcProfile = infos.find((i) => i.type === "avc-profile");
  const ppsProfile = infos.find((i) => i.type === "avc-pps");
  if (!avcProfile || !ppsProfile) {
    throw new Error("Expected avcProfile and ppsProfile");
  }
  return { pps: ppsProfile, sps: avcProfile };
};

// src/containers/transport-stream/handle-avc-packet.ts
var MPEG_TIMESCALE = 90000;
var handleAvcPacket = async ({
  streamBuffer,
  programId,
  offset,
  sampleCallbacks,
  logLevel,
  onVideoTrack,
  transportStream,
  makeSamplesStartAtZero,
  avcState
}) => {
  const avc = parseAvc(streamBuffer.getBuffer(), avcState);
  const isTrackRegistered = sampleCallbacks.tracks.getTracks().find((t) => {
    return t.trackId === programId;
  });
  if (!isTrackRegistered) {
    const spsAndPps = getSpsAndPps(avc);
    const dimensions = getDimensionsFromSps(spsAndPps.sps.spsData);
    const sampleAspectRatio = getSampleAspectRatioFromSps(spsAndPps.sps.spsData);
    const startOffset = makeSamplesStartAtZero ? Math.min(streamBuffer.pesHeader.pts, streamBuffer.pesHeader.dts ?? Infinity) : 0;
    transportStream.startOffset.setOffset({
      trackId: programId,
      newOffset: startOffset
    });
    const codecPrivate2 = createSpsPpsData(spsAndPps);
    const advancedColor = getVideoColorFromSps(spsAndPps.sps.spsData);
    const track = {
      m3uStreamFormat: null,
      rotation: 0,
      trackId: programId,
      type: "video",
      originalTimescale: MPEG_TIMESCALE,
      codec: getCodecStringFromSpsAndPps(spsAndPps.sps),
      codecData: { type: "avc-sps-pps", data: codecPrivate2 },
      fps: null,
      codedWidth: dimensions.width,
      codedHeight: dimensions.height,
      height: dimensions.height,
      width: dimensions.width,
      displayAspectWidth: dimensions.width,
      displayAspectHeight: dimensions.height,
      codecEnum: "h264",
      description: undefined,
      sampleAspectRatio: {
        denominator: sampleAspectRatio.height,
        numerator: sampleAspectRatio.width
      },
      colorSpace: mediaParserAdvancedColorToWebCodecsColor(advancedColor),
      advancedColor,
      startInSeconds: 0,
      timescale: WEBCODECS_TIMESCALE,
      trackMediaTimeOffsetInTrackTimescale: 0
    };
    await registerVideoTrack({
      track,
      container: "transport-stream",
      logLevel,
      onVideoTrack,
      registerVideoSampleCallback: sampleCallbacks.registerVideoSampleCallback,
      tracks: sampleCallbacks.tracks
    });
  }
  const type = getKeyFrameOrDeltaFromAvcInfo(avc);
  const sample = {
    decodingTimestamp: (streamBuffer.pesHeader.dts ?? streamBuffer.pesHeader.pts) - transportStream.startOffset.getOffset(programId),
    timestamp: streamBuffer.pesHeader.pts - transportStream.startOffset.getOffset(programId),
    duration: undefined,
    data: streamBuffer.getBuffer(),
    type: type === "bidirectional" ? "delta" : type,
    offset
  };
  if (type === "key") {
    transportStream.observedPesHeaders.markPtsAsKeyframe(streamBuffer.pesHeader.pts);
  }
  const videoSample = convertAudioOrVideoSampleToWebCodecsTimestamps({
    sample,
    timescale: MPEG_TIMESCALE
  });
  await sampleCallbacks.onVideoSample({
    videoSample,
    trackId: programId
  });
  transportStream.lastEmittedSample.setLastEmittedSample(sample);
};

// src/containers/wav/get-seeking-byte.ts
var WAVE_SAMPLES_PER_SECOND = 25;
var getSeekingByteFromWav = ({
  info,
  time
}) => {
  const bytesPerSecond = info.sampleRate * info.blockAlign;
  const durationInSeconds = info.mediaSection.size / bytesPerSecond;
  const timeRoundedDown = Math.floor(Math.min(time, durationInSeconds - 0.0000001) * WAVE_SAMPLES_PER_SECOND) / WAVE_SAMPLES_PER_SECOND;
  const byteOffset = bytesPerSecond * timeRoundedDown;
  return Promise.resolve({
    type: "do-seek",
    byte: byteOffset + info.mediaSection.start,
    timeInSeconds: timeRoundedDown
  });
};

// src/containers/webm/seek/get-seeking-byte.ts
var toSeconds = (timeInTimescale, track) => {
  return timeInTimescale / track.timescale * 1000;
};
var findBiggestCueBeforeTime = ({
  cues,
  time,
  track
}) => {
  let biggestCueBeforeTime;
  for (const cue of cues) {
    const cueTimeInSeconds = toSeconds(cue.timeInTimescale, track);
    if (cueTimeInSeconds < time && (!biggestCueBeforeTime || cueTimeInSeconds > toSeconds(biggestCueBeforeTime.timeInTimescale, track))) {
      biggestCueBeforeTime = cue;
    }
  }
  return biggestCueBeforeTime;
};
var findKeyframeBeforeTime2 = ({
  keyframes,
  time
}) => {
  let keyframeBeforeTime;
  for (const keyframe of keyframes) {
    if (keyframe.decodingTimeInSeconds < time && (!keyframeBeforeTime || keyframe.decodingTimeInSeconds > keyframeBeforeTime.decodingTimeInSeconds)) {
      keyframeBeforeTime = keyframe;
    }
  }
  return keyframeBeforeTime ?? null;
};
var getByteFromCues = ({
  cuesResponse,
  time,
  info,
  logLevel
}) => {
  if (!cuesResponse) {
    Log.trace(logLevel, "Has no Matroska cues at the moment, cannot use them");
    return null;
  }
  const { cues, segmentOffset } = cuesResponse;
  Log.trace(logLevel, "Has Matroska cues. Will use them to perform a seek.");
  const biggestCueBeforeTime = findBiggestCueBeforeTime({
    cues,
    time,
    track: info.track
  });
  if (!biggestCueBeforeTime) {
    return null;
  }
  return {
    byte: biggestCueBeforeTime.clusterPositionInSegment + segmentOffset,
    timeInSeconds: toSeconds(biggestCueBeforeTime.timeInTimescale, info.track)
  };
};
var getSeekingByteFromMatroska = async ({
  time,
  webmState,
  info,
  logLevel,
  mediaSection
}) => {
  if (!info.track) {
    Log.trace(logLevel, "No video track found, cannot seek yet");
    return {
      type: "valid-but-must-wait"
    };
  }
  const cuesResponse = info.loadedCues ?? await webmState.cues.getLoadedCues();
  const byteFromObservedKeyframe = findKeyframeBeforeTime2({
    keyframes: info.keyframes,
    time
  });
  const byteFromCues = getByteFromCues({
    cuesResponse,
    time,
    info,
    logLevel
  });
  const byteFromFirstMediaSection = webmState.getFirstCluster()?.start ?? null;
  const seekPossibilities = [
    byteFromCues?.byte ?? null,
    byteFromObservedKeyframe?.positionInBytes ?? null,
    byteFromFirstMediaSection
  ].filter((n) => n !== null);
  const byteToSeekTo = seekPossibilities.length === 0 ? null : Math.max(...seekPossibilities);
  if (byteToSeekTo === null) {
    return {
      type: "invalid"
    };
  }
  mediaSection.addMediaSection({
    start: byteToSeekTo,
    size: 1
  });
  const timeInSeconds = (() => {
    if (byteToSeekTo === byteFromObservedKeyframe?.positionInBytes) {
      return Math.min(byteFromObservedKeyframe.decodingTimeInSeconds, byteFromObservedKeyframe.presentationTimeInSeconds);
    }
    if (byteToSeekTo === byteFromCues?.byte) {
      return byteFromCues.timeInSeconds;
    }
    if (byteToSeekTo === byteFromFirstMediaSection) {
      return 0;
    }
    throw new Error("Should not happen");
  })();
  return {
    type: "do-seek",
    byte: byteToSeekTo,
    timeInSeconds
  };
};

// src/state/transport-stream/observed-pes-header.ts
var makeObservedPesHeader = () => {
  const pesHeaders = [];
  const confirmedAsKeyframe = [];
  const addPesHeader = (pesHeader) => {
    if (pesHeaders.find((p) => p.offset === pesHeader.offset)) {
      return;
    }
    pesHeaders.push(pesHeader);
  };
  const markPtsAsKeyframe = (pts) => {
    confirmedAsKeyframe.push(pts);
  };
  const getPesKeyframeHeaders = () => {
    return pesHeaders.filter((p) => confirmedAsKeyframe.includes(p.pts));
  };
  const setPesKeyframesFromSeekingHints = (hints) => {
    for (const pesHeader of hints.observedPesHeaders) {
      addPesHeader(pesHeader);
      markPtsAsKeyframe(pesHeader.pts);
    }
  };
  const state = {
    pesHeaders,
    addPesHeader,
    markPtsAsKeyframe,
    getPesKeyframeHeaders,
    setPesKeyframesFromSeekingHints
  };
  return state;
};
var getLastKeyFrameBeforeTimeInSeconds = ({
  observedPesHeaders,
  timeInSeconds,
  ptsStartOffset
}) => {
  return observedPesHeaders.findLast((k) => (k.pts - ptsStartOffset) / MPEG_TIMESCALE <= timeInSeconds);
};

// src/get-seeking-byte.ts
var getSeekingByte = ({
  info,
  time,
  logLevel,
  currentPosition,
  isoState,
  transportStream,
  webmState,
  mediaSection,
  m3uPlaylistContext,
  structure,
  riffState,
  m3uState,
  avcState
}) => {
  if (info.type === "iso-base-media-seeking-hints") {
    return getSeekingByteFromIsoBaseMedia({
      info,
      time,
      logLevel,
      currentPosition,
      isoState,
      structure,
      m3uPlaylistContext
    });
  }
  if (info.type === "wav-seeking-hints") {
    return getSeekingByteFromWav({
      info,
      time
    });
  }
  if (info.type === "webm-seeking-hints") {
    return getSeekingByteFromMatroska({
      info,
      time,
      webmState,
      logLevel,
      mediaSection
    });
  }
  if (info.type === "flac-seeking-hints") {
    const byte = getSeekingByteForFlac({
      seekingHints: info,
      time
    });
    if (byte) {
      return Promise.resolve({
        type: "do-seek",
        byte: byte.offset,
        timeInSeconds: byte.timeInSeconds
      });
    }
    return Promise.resolve({
      type: "valid-but-must-wait"
    });
  }
  if (info.type === "transport-stream-seeking-hints") {
    const lastKeyframeBeforeTimeInSeconds = getLastKeyFrameBeforeTimeInSeconds({
      observedPesHeaders: info.observedPesHeaders,
      timeInSeconds: time,
      ptsStartOffset: info.ptsStartOffset
    });
    if (!lastKeyframeBeforeTimeInSeconds) {
      transportStream.resetBeforeSeek();
      return Promise.resolve({
        type: "do-seek",
        byte: 0,
        timeInSeconds: 0
      });
    }
    const byte = lastKeyframeBeforeTimeInSeconds.offset;
    transportStream.resetBeforeSeek();
    return Promise.resolve({
      type: "do-seek",
      byte,
      timeInSeconds: Math.min(lastKeyframeBeforeTimeInSeconds.pts, lastKeyframeBeforeTimeInSeconds.dts ?? Infinity) / MPEG_TIMESCALE
    });
  }
  if (info.type === "riff-seeking-hints") {
    return getSeekingByteForRiff({
      info,
      time,
      riffState,
      avcState
    });
  }
  if (info.type === "mp3-seeking-hints") {
    return Promise.resolve(getSeekingByteForMp3({
      info,
      time
    }));
  }
  if (info.type === "aac-seeking-hints") {
    return Promise.resolve(getSeekingByteForAac({
      time,
      seekingHints: info
    }));
  }
  if (info.type === "m3u8-seeking-hints") {
    return Promise.resolve(getSeekingByteForM3u8({
      time,
      currentPosition,
      m3uState,
      logLevel
    }));
  }
  throw new Error(`Unknown seeking info type: ${info}`);
};

// src/containers/aac/seeking-hints.ts
var getSeekingHintsForAac = ({
  aacState,
  samplesObserved
}) => {
  return {
    type: "aac-seeking-hints",
    audioSampleMap: aacState.audioSamples.getSamples(),
    lastSampleObserved: samplesObserved.getLastSampleObserved()
  };
};
var setSeekingHintsForAac = () => {};

// src/containers/flac/seeking-hints.ts
var getSeekingHintsForFlac = ({
  flacState,
  samplesObserved
}) => {
  return {
    type: "flac-seeking-hints",
    audioSampleMap: flacState.audioSamples.getSamples(),
    blockingBitStrategy: flacState.getBlockingBitStrategy() ?? null,
    lastSampleObserved: samplesObserved.getLastSampleObserved()
  };
};
var setSeekingHintsForFlac = ({
  hints,
  state
}) => {
  if (hints.blockingBitStrategy !== null) {
    state.flac.setBlockingBitStrategy(hints.blockingBitStrategy);
  }
  state.flac.audioSamples.setFromSeekingHints(hints.audioSampleMap);
};

// src/containers/iso-base-media/seeking-hints.ts
var getSeekingHintsFromMp4 = ({
  structureState,
  isoState,
  mp4HeaderSegment,
  mediaSectionState: mediaSectionState2
}) => {
  const structure = structureState.getIsoStructure();
  const moovAtom = getMoovBoxFromState({
    isoState,
    mp4HeaderSegment,
    structureState,
    mayUsePrecomputed: true
  });
  const moofBoxes = deduplicateMoofBoxesByOffset([
    ...isoState.moof.getMoofBoxes(),
    ...getMoofBoxes(structure.boxes)
  ]);
  const tfraBoxes = deduplicateTfraBoxesByOffset([
    ...isoState.tfra.getTfraBoxes(),
    ...getTfraBoxes(structure.boxes)
  ]);
  if (!moovAtom) {
    return null;
  }
  return {
    type: "iso-base-media-seeking-hints",
    moovBox: moovAtom,
    moofBoxes,
    tfraBoxes,
    mediaSections: mediaSectionState2.getMediaSections(),
    mfraAlreadyLoaded: isoState.mfra.getIfAlreadyLoaded()
  };
};
var setSeekingHintsForMp4 = ({}) => {};

// src/containers/m3u/seeking-hints.ts
var getSeekingHintsForM3u = () => {
  return {
    type: "m3u8-seeking-hints"
  };
};

// src/containers/mp3/seeking-hints.ts
var getSeekingHintsForMp3 = ({
  mp3State,
  samplesObserved,
  mediaSectionState: mediaSectionState2,
  contentLength
}) => {
  return {
    type: "mp3-seeking-hints",
    audioSampleMap: mp3State.audioSamples.getSamples(),
    lastSampleObserved: samplesObserved.getLastSampleObserved(),
    mp3BitrateInfo: mp3State.getMp3BitrateInfo(),
    mp3Info: mp3State.getMp3Info(),
    mediaSection: mediaSectionState2.getMediaSections()[0] ?? null,
    contentLength
  };
};
var setSeekingHintsForMp3 = ({
  hints,
  state
}) => {
  state.mp3.audioSamples.setFromSeekingHints(hints.audioSampleMap);
};

// src/containers/riff/has-index.ts
var riffHasIndex = (structure) => {
  return structure.boxes.find((b) => b.type === "list-box" && b.listType === "hdrl")?.children.find((box) => box.type === "avih-box")?.hasIndex ?? false;
};

// src/containers/riff/seeking-hints.ts
var getSeekingHintsForRiff = ({
  structureState,
  riffState,
  mediaSectionState: mediaSectionState2
}) => {
  const structure = structureState.getRiffStructure();
  const strl = getStrlBoxes(structure);
  let samplesPerSecond = null;
  for (const s of strl) {
    const strh = getStrhBox(s.children);
    if (!strh) {
      throw new Error("No strh box");
    }
    if (strh.strf.type !== "strf-box-video") {
      continue;
    }
    samplesPerSecond = strh.rate / strh.scale;
    break;
  }
  return {
    type: "riff-seeking-hints",
    hasIndex: riffHasIndex(structure),
    idx1Entries: riffState.lazyIdx1.getIfAlreadyLoaded(),
    samplesPerSecond,
    moviOffset: mediaSectionState2.getMediaSections()[0]?.start ?? null,
    observedKeyframes: riffState.sampleCounter.riffKeys.getKeyframes()
  };
};
var setSeekingHintsForRiff = ({
  hints,
  state
}) => {
  state.riff.lazyIdx1.setFromSeekingHints(hints);
  state.riff.sampleCounter.riffKeys.setFromSeekingHints(hints.observedKeyframes);
};

// src/containers/transport-stream/seeking-hints.ts
var getSeekingHintsFromTransportStream = (transportStream, tracksState) => {
  const firstVideoTrack = tracksState.getTracks().find((t) => t.type === "video");
  if (!firstVideoTrack) {
    return null;
  }
  return {
    type: "transport-stream-seeking-hints",
    observedPesHeaders: transportStream.observedPesHeaders.getPesKeyframeHeaders(),
    ptsStartOffset: transportStream.startOffset.getOffset(firstVideoTrack.trackId),
    firstVideoTrackId: firstVideoTrack.trackId
  };
};
var setSeekingHintsForTransportStream = ({
  hints,
  state
}) => {
  state.transportStream.observedPesHeaders.setPesKeyframesFromSeekingHints(hints);
  state.transportStream.startOffset.setOffset({
    trackId: hints.firstVideoTrackId,
    newOffset: hints.ptsStartOffset
  });
};

// src/containers/wav/seeking-hints.ts
var getSeekingHintsFromWav = ({
  structure,
  mediaSectionState: mediaSectionState2
}) => {
  const fmtBox = structure.boxes.find((box) => box.type === "wav-fmt");
  if (!fmtBox) {
    return null;
  }
  const mediaSection = mediaSectionState2.getMediaSections();
  if (mediaSection.length !== 1) {
    return null;
  }
  return {
    type: "wav-seeking-hints",
    sampleRate: fmtBox.sampleRate,
    blockAlign: fmtBox.blockAlign,
    mediaSection: mediaSection[0]
  };
};
var setSeekingHintsForWav = ({
  hints,
  state
}) => {
  state.mediaSection.addMediaSection(hints.mediaSection);
};

// src/containers/webm/seek/seeking-hints.ts
var getSeekingHintsFromMatroska = (tracksState, keyframesState, webmState) => {
  const tracks2 = tracksState.getTracks();
  const firstVideoTrack = tracks2.find((track) => track.type === "video");
  const keyframes = keyframesState.getKeyframes();
  const loadedCues = webmState.cues.getIfAlreadyLoaded();
  return {
    type: "webm-seeking-hints",
    track: firstVideoTrack ? {
      timescale: firstVideoTrack.originalTimescale,
      trackId: firstVideoTrack.trackId
    } : null,
    keyframes,
    loadedCues,
    timestampMap: webmState.getTimeStampMapForSeekingHints()
  };
};
var setSeekingHintsForWebm = ({
  hints,
  state
}) => {
  state.webm.cues.setFromSeekingHints(hints);
  state.keyframes.setFromSeekingHints(hints.keyframes);
  state.webm.setTimeStampMapForSeekingHints(hints.timestampMap);
};

// src/get-seeking-hints.ts
var getSeekingHints = ({
  structureState,
  m3uPlaylistContext,
  mediaSectionState: mediaSectionState2,
  isoState,
  transportStream,
  tracksState,
  keyframesState,
  webmState,
  flacState,
  samplesObserved,
  riffState,
  mp3State,
  contentLength,
  aacState
}) => {
  const structure = structureState.getStructureOrNull();
  if (!structure) {
    return null;
  }
  if (structure.type === "iso-base-media") {
    return getSeekingHintsFromMp4({
      structureState,
      isoState,
      mp4HeaderSegment: m3uPlaylistContext?.mp4HeaderSegment ?? null,
      mediaSectionState: mediaSectionState2
    });
  }
  if (structure.type === "wav") {
    return getSeekingHintsFromWav({
      structure,
      mediaSectionState: mediaSectionState2
    });
  }
  if (structure.type === "matroska") {
    return getSeekingHintsFromMatroska(tracksState, keyframesState, webmState);
  }
  if (structure.type === "transport-stream") {
    return getSeekingHintsFromTransportStream(transportStream, tracksState);
  }
  if (structure.type === "flac") {
    return getSeekingHintsForFlac({
      flacState,
      samplesObserved
    });
  }
  if (structure.type === "riff") {
    return getSeekingHintsForRiff({
      structureState,
      riffState,
      mediaSectionState: mediaSectionState2
    });
  }
  if (structure.type === "mp3") {
    return getSeekingHintsForMp3({
      mp3State,
      samplesObserved,
      mediaSectionState: mediaSectionState2,
      contentLength
    });
  }
  if (structure.type === "aac") {
    return getSeekingHintsForAac({
      aacState,
      samplesObserved
    });
  }
  if (structure.type === "m3u") {
    return getSeekingHintsForM3u();
  }
  throw new Error(`Seeking is not supported for this format: ${structure}`);
};

// src/seek-backwards.ts
var seekBackwards = async ({
  iterator,
  seekTo,
  readerInterface,
  src,
  controller,
  logLevel,
  currentReader,
  prefetchCache
}) => {
  const howManyBytesWeCanGoBack = iterator.counter.getDiscardedOffset();
  if (iterator.counter.getOffset() - howManyBytesWeCanGoBack <= seekTo) {
    Log.verbose(logLevel, `Seeking back to ${seekTo}`);
    iterator.skipTo(seekTo);
    return;
  }
  const time = Date.now();
  Log.verbose(logLevel, `Seeking in video from position ${iterator.counter.getOffset()} -> ${seekTo}. Re-reading because this portion is not available.`);
  await currentReader.getCurrent().abort();
  const { reader: newReader } = await readerInterface.read({
    src,
    range: seekTo,
    controller,
    logLevel,
    prefetchCache
  });
  iterator.replaceData(new Uint8Array([]), seekTo);
  Log.verbose(logLevel, `Re-reading took ${Date.now() - time}ms. New position: ${iterator.counter.getOffset()}`);
  currentReader.setCurrent(newReader);
};

// src/state/need-samples-for-fields.ts
var fieldsNeedSamplesMap = {
  slowDurationInSeconds: true,
  slowFps: true,
  slowKeyframes: true,
  slowNumberOfFrames: true,
  audioCodec: false,
  container: false,
  dimensions: false,
  durationInSeconds: false,
  fps: false,
  internalStats: false,
  isHdr: false,
  name: false,
  rotation: false,
  size: false,
  slowStructure: false,
  tracks: false,
  unrotatedDimensions: false,
  videoCodec: false,
  metadata: false,
  location: false,
  mimeType: false,
  keyframes: false,
  images: false,
  numberOfAudioChannels: false,
  sampleRate: false,
  slowAudioBitrate: true,
  slowVideoBitrate: true,
  m3uStreams: false
};
var needsToIterateOverSamples = ({
  fields,
  emittedFields
}) => {
  const keys = Object.keys(fields ?? {});
  const selectedKeys = keys.filter((k) => fields[k]);
  return selectedKeys.some((k) => fieldsNeedSamplesMap[k] && !emittedFields[k]);
};
var fieldsNeedEverySampleMap = {
  ...fieldsNeedSamplesMap,
  slowDurationInSeconds: false
};
var needsToIterateOverEverySample = ({
  fields,
  emittedFields
}) => {
  const keys = Object.keys(fields ?? {});
  const selectedKeys = keys.filter((k) => fields[k]);
  return selectedKeys.some((k) => fieldsNeedEverySampleMap[k] && !emittedFields[k]);
};

// src/disallow-forward-seek-if-samples-are-needed.ts
var disallowForwardSeekIfSamplesAreNeeded = ({
  seekTo,
  previousPosition,
  fields
}) => {
  const fieldsNeedingSamples = Object.entries(fields).filter(([, value]) => value).map(([key]) => key).filter((key) => fieldsNeedSamplesMap[key]);
  if (fieldsNeedingSamples.length > 0) {
    throw new Error(`Forward seeking is not allowed when the following fields are requested from parseMedia(): ${fieldsNeedingSamples.join(", ")}. Seek was from 0x${previousPosition.toString(16)} to 0x${seekTo.toString(16)}. Either don't seek forward, or don't request these fields.`);
  }
};

// src/seek-forwards.ts
var seekForward = async ({
  seekTo,
  userInitiated,
  iterator,
  fields,
  logLevel,
  currentReader,
  readerInterface,
  src,
  controller,
  discardReadBytes,
  prefetchCache
}) => {
  if (userInitiated) {
    disallowForwardSeekIfSamplesAreNeeded({
      fields,
      seekTo,
      previousPosition: iterator.counter.getOffset()
    });
  }
  const alreadyHasBuffer = iterator.bytesRemaining() >= seekTo - iterator.counter.getOffset();
  Log.verbose(logLevel, `Performing seek from ${iterator.counter.getOffset()} to ${seekTo}`);
  if (alreadyHasBuffer) {
    iterator.skipTo(seekTo);
    Log.verbose(logLevel, `Already read ahead enough, skipping forward`);
    return;
  }
  const time = Date.now();
  Log.verbose(logLevel, `Skipping over video data from position ${iterator.counter.getOffset()} -> ${seekTo}. Re-reading because this portion is not available`);
  await currentReader.getCurrent().abort();
  const { reader: newReader } = await readerInterface.read({
    src,
    range: seekTo,
    controller,
    logLevel,
    prefetchCache
  });
  iterator.skipTo(seekTo);
  await discardReadBytes(true);
  Log.verbose(logLevel, `Re-reading took ${Date.now() - time}ms. New position: ${iterator.counter.getOffset()}`);
  currentReader.setCurrent(newReader);
};

// src/perform-seek.ts
var performSeek = async ({
  seekTo,
  userInitiated,
  controller,
  mediaSection,
  iterator,
  seekInfiniteLoop,
  logLevel,
  mode,
  contentLength,
  currentReader,
  readerInterface,
  src,
  discardReadBytes,
  fields,
  prefetchCache,
  isoState
}) => {
  const byteInMediaSection = isByteInMediaSection({
    position: seekTo,
    mediaSections: mediaSection.getMediaSections()
  });
  if (byteInMediaSection !== "in-section" && userInitiated) {
    const sections = mediaSection.getMediaSections();
    const sectionStrings = sections.map((section) => {
      return `start: ${section.start}, end: ${section.size + section.start}`;
    });
    throw new Error(`Cannot seek to a byte that is not in the video section. Seeking to: ${seekTo}, sections: ${sectionStrings.join(" | ")}`);
  }
  seekInfiniteLoop.registerSeek(seekTo);
  if (seekTo <= iterator.counter.getOffset() && mode === "download") {
    throw new Error(`Seeking backwards is not supported in parseAndDownloadMedia() mode. Current position: ${iterator.counter.getOffset()}, seekTo: ${seekTo}`);
  }
  if (seekTo > contentLength) {
    throw new Error(`Cannot seek beyond the end of the file: ${seekTo} > ${contentLength}`);
  }
  if (mode === "download") {
    Log.verbose(logLevel, `Skipping over video data from position ${iterator.counter.getOffset()} -> ${seekTo}. Fetching but not reading all the data inbetween because in download mode`);
    iterator.discard(seekTo - iterator.counter.getOffset());
    return;
  }
  await controller._internals.checkForAbortAndPause();
  const alreadyAtByte = iterator.counter.getOffset() === seekTo;
  if (alreadyAtByte) {
    Log.verbose(logLevel, `Already at the desired position, seeking done`);
    controller._internals.performedSeeksSignal.markLastSeekAsUserInitiated();
    return;
  }
  const skippingForward = seekTo > iterator.counter.getOffset();
  controller._internals.performedSeeksSignal.recordSeek({
    from: iterator.counter.getOffset(),
    to: seekTo,
    type: userInitiated ? "user-initiated" : "internal"
  });
  if (skippingForward) {
    await seekForward({
      seekTo,
      userInitiated,
      iterator,
      fields,
      logLevel,
      currentReader,
      readerInterface,
      src,
      controller,
      discardReadBytes,
      prefetchCache
    });
  } else {
    await seekBackwards({
      controller,
      seekTo,
      iterator,
      logLevel,
      currentReader,
      readerInterface,
      src,
      prefetchCache
    });
  }
  if (userInitiated) {
    isoState.flatSamples.updateAfterSeek(seekTo);
  }
  await controller._internals.checkForAbortAndPause();
};

// src/work-on-seek-request.ts
var turnSeekIntoByte = async ({
  seek: seek2,
  mediaSectionState: mediaSectionState2,
  logLevel,
  iterator,
  structureState,
  m3uPlaylistContext,
  isoState,
  transportStream,
  tracksState,
  webmState,
  keyframes,
  flacState,
  samplesObserved,
  riffState,
  mp3State,
  contentLength,
  aacState,
  m3uState,
  avcState
}) => {
  const mediaSections = mediaSectionState2.getMediaSections();
  if (mediaSections.length === 0) {
    Log.trace(logLevel, "No media sections defined, cannot seek yet");
    return {
      type: "valid-but-must-wait"
    };
  }
  if (seek2 < 0) {
    throw new Error(`Cannot seek to a negative time: ${JSON.stringify(seek2)}`);
  }
  const seekingHints = getSeekingHints({
    riffState,
    samplesObserved,
    structureState,
    mediaSectionState: mediaSectionState2,
    isoState,
    transportStream,
    tracksState,
    keyframesState: keyframes,
    webmState,
    flacState,
    mp3State,
    contentLength,
    aacState,
    m3uPlaylistContext
  });
  if (!seekingHints) {
    Log.trace(logLevel, "No seeking info, cannot seek yet");
    return {
      type: "valid-but-must-wait"
    };
  }
  const seekingByte = await getSeekingByte({
    info: seekingHints,
    time: seek2,
    logLevel,
    currentPosition: iterator.counter.getOffset(),
    isoState,
    transportStream,
    webmState,
    mediaSection: mediaSectionState2,
    m3uPlaylistContext,
    structure: structureState,
    riffState,
    m3uState,
    avcState
  });
  return seekingByte;
};
var getWorkOnSeekRequestOptions = (state) => {
  return {
    logLevel: state.logLevel,
    controller: state.controller,
    isoState: state.iso,
    iterator: state.iterator,
    structureState: state.structure,
    src: state.src,
    contentLength: state.contentLength,
    readerInterface: state.readerInterface,
    mediaSection: state.mediaSection,
    m3uPlaylistContext: state.m3uPlaylistContext,
    mode: state.mode,
    seekInfiniteLoop: state.seekInfiniteLoop,
    currentReader: state.currentReader,
    discardReadBytes: state.discardReadBytes,
    fields: state.fields,
    transportStream: state.transportStream,
    tracksState: state.callbacks.tracks,
    webmState: state.webm,
    keyframes: state.keyframes,
    flacState: state.flac,
    samplesObserved: state.samplesObserved,
    riffState: state.riff,
    mp3State: state.mp3,
    aacState: state.aac,
    m3uState: state.m3u,
    prefetchCache: state.prefetchCache,
    avcState: state.avc
  };
};
var workOnSeekRequest = async (options) => {
  const {
    logLevel,
    controller,
    mediaSection,
    m3uPlaylistContext,
    isoState,
    iterator,
    structureState,
    src,
    contentLength,
    readerInterface,
    mode,
    seekInfiniteLoop,
    currentReader,
    discardReadBytes,
    fields,
    transportStream,
    tracksState,
    webmState,
    keyframes,
    flacState,
    samplesObserved,
    riffState,
    mp3State,
    aacState,
    prefetchCache,
    m3uState,
    avcState
  } = options;
  const seek2 = controller._internals.seekSignal.getSeek();
  if (seek2 === null) {
    return;
  }
  Log.trace(logLevel, `Has seek request for ${src}: ${JSON.stringify(seek2)}`);
  const resolution = await turnSeekIntoByte({
    seek: seek2,
    mediaSectionState: mediaSection,
    logLevel,
    iterator,
    structureState,
    m3uPlaylistContext,
    isoState,
    transportStream,
    tracksState,
    webmState,
    keyframes,
    flacState,
    samplesObserved,
    riffState,
    mp3State,
    contentLength,
    aacState,
    m3uState,
    avcState
  });
  Log.trace(logLevel, `Seek action: ${JSON.stringify(resolution)}`);
  if (resolution.type === "intermediary-seek") {
    await performSeek({
      seekTo: resolution.byte,
      userInitiated: false,
      controller,
      mediaSection,
      iterator,
      logLevel,
      mode,
      contentLength,
      seekInfiniteLoop,
      currentReader,
      readerInterface,
      src,
      discardReadBytes,
      fields,
      prefetchCache,
      isoState
    });
    return;
  }
  if (resolution.type === "do-seek") {
    await performSeek({
      seekTo: resolution.byte,
      userInitiated: true,
      controller,
      mediaSection,
      iterator,
      logLevel,
      mode,
      contentLength,
      seekInfiniteLoop,
      currentReader,
      readerInterface,
      src,
      discardReadBytes,
      fields,
      prefetchCache,
      isoState
    });
    const { hasChanged } = controller._internals.seekSignal.clearSeekIfStillSame(seek2);
    if (hasChanged) {
      Log.trace(logLevel, `Seek request has changed while seeking, seeking again`);
      await workOnSeekRequest(options);
    }
    return;
  }
  if (resolution.type === "invalid") {
    throw new Error(`The seek request ${JSON.stringify(seek2)} cannot be processed`);
  }
  if (resolution.type === "valid-but-must-wait") {
    Log.trace(logLevel, "Seek request is valid but cannot be processed yet");
  }
};

// src/emit-available-info.ts
var emitAvailableInfo = async ({
  hasInfo,
  state
}) => {
  const keys = Object.keys(hasInfo);
  const {
    emittedFields,
    fieldsInReturnValue,
    returnValue,
    name,
    callbackFunctions
  } = state;
  for (const key of keys) {
    await workOnSeekRequest(getWorkOnSeekRequestOptions(state));
    if (key === "slowStructure") {
      if (hasInfo.slowStructure && !emittedFields.slowStructure) {
        await callbackFunctions.onSlowStructure?.(state.structure.getStructure());
        if (fieldsInReturnValue.slowStructure) {
          returnValue.slowStructure = state.structure.getStructure();
        }
        emittedFields.slowStructure = true;
      }
      continue;
    }
    if (key === "durationInSeconds") {
      if (hasInfo.durationInSeconds) {
        if (!emittedFields.durationInSeconds) {
          const durationInSeconds = getDuration(state);
          await callbackFunctions.onDurationInSeconds?.(durationInSeconds);
          if (fieldsInReturnValue.durationInSeconds) {
            returnValue.durationInSeconds = durationInSeconds;
          }
          emittedFields.durationInSeconds = true;
        }
      }
      continue;
    }
    if (key === "slowDurationInSeconds") {
      if (hasInfo.slowDurationInSeconds && !emittedFields.slowDurationInSeconds) {
        const slowDurationInSeconds = getDuration(state) ?? state.samplesObserved.getSlowDurationInSeconds();
        await callbackFunctions.onSlowDurationInSeconds?.(slowDurationInSeconds);
        if (fieldsInReturnValue.slowDurationInSeconds) {
          returnValue.slowDurationInSeconds = slowDurationInSeconds;
        }
        emittedFields.slowDurationInSeconds = true;
      }
      continue;
    }
    if (key === "fps") {
      if (hasInfo.fps) {
        if (!emittedFields.fps) {
          const fps = getFps(state);
          await callbackFunctions.onFps?.(fps);
          if (fieldsInReturnValue.fps) {
            returnValue.fps = fps;
          }
          emittedFields.fps = true;
        }
        if (!emittedFields.slowFps) {
          const fps = getFps(state);
          if (fps) {
            await callbackFunctions.onSlowFps?.(fps);
            if (fieldsInReturnValue.slowFps) {
              returnValue.slowFps = fps;
            }
            emittedFields.slowFps = true;
          }
        }
      }
      continue;
    }
    if (key === "slowFps") {
      if (hasInfo.slowFps && !emittedFields.slowFps) {
        const slowFps = getFps(state) ?? state.samplesObserved.getFps();
        await callbackFunctions.onSlowFps?.(slowFps);
        if (fieldsInReturnValue.slowFps) {
          returnValue.slowFps = slowFps;
        }
        emittedFields.slowFps = true;
      }
      continue;
    }
    if (key === "dimensions") {
      if (hasInfo.dimensions && !emittedFields.dimensions) {
        const dimensionsQueried = getDimensions(state);
        const dimensions = dimensionsQueried === null ? null : {
          height: dimensionsQueried.height,
          width: dimensionsQueried.width
        };
        await callbackFunctions.onDimensions?.(dimensions);
        if (fieldsInReturnValue.dimensions) {
          returnValue.dimensions = dimensions;
        }
        emittedFields.dimensions = true;
      }
      continue;
    }
    if (key === "unrotatedDimensions") {
      if (hasInfo.unrotatedDimensions && !emittedFields.unrotatedDimensions) {
        const dimensionsQueried = getDimensions(state);
        const unrotatedDimensions = dimensionsQueried === null ? null : {
          height: dimensionsQueried.unrotatedHeight,
          width: dimensionsQueried.unrotatedWidth
        };
        await callbackFunctions.onUnrotatedDimensions?.(unrotatedDimensions);
        if (fieldsInReturnValue.unrotatedDimensions) {
          returnValue.unrotatedDimensions = unrotatedDimensions;
        }
        emittedFields.unrotatedDimensions = true;
      }
      continue;
    }
    if (key === "rotation") {
      if (hasInfo.rotation && !emittedFields.rotation) {
        const dimensionsQueried = getDimensions(state);
        const rotation = dimensionsQueried?.rotation ?? 0;
        await callbackFunctions.onRotation?.(rotation);
        if (fieldsInReturnValue.rotation) {
          returnValue.rotation = rotation;
        }
        emittedFields.rotation = true;
      }
      continue;
    }
    if (key === "videoCodec") {
      if (!emittedFields.videoCodec && hasInfo.videoCodec) {
        const videoCodec = getVideoCodec(state);
        await callbackFunctions.onVideoCodec?.(videoCodec);
        if (fieldsInReturnValue.videoCodec) {
          returnValue.videoCodec = videoCodec;
        }
        emittedFields.videoCodec = true;
      }
      continue;
    }
    if (key === "audioCodec") {
      if (!emittedFields.audioCodec && hasInfo.audioCodec) {
        const audioCodec = getAudioCodec(state);
        await callbackFunctions.onAudioCodec?.(audioCodec);
        if (fieldsInReturnValue.audioCodec) {
          returnValue.audioCodec = audioCodec;
        }
        emittedFields.audioCodec = true;
      }
      continue;
    }
    if (key === "tracks") {
      if (!emittedFields.tracks && hasInfo.tracks) {
        const tracks2 = getTracks(state, true);
        await callbackFunctions.onTracks?.(tracks2);
        if (fieldsInReturnValue.tracks) {
          returnValue.tracks = tracks2;
        }
        emittedFields.tracks = true;
      }
      continue;
    }
    if (key === "internalStats") {
      if (hasInfo.internalStats) {
        const internalStats = state.getInternalStats();
        if (fieldsInReturnValue.internalStats) {
          returnValue.internalStats = internalStats;
        }
        emittedFields.internalStats = true;
      }
      continue;
    }
    if (key === "size") {
      if (!emittedFields.size && hasInfo.size) {
        await callbackFunctions.onSize?.(state.contentLength);
        if (fieldsInReturnValue.size) {
          returnValue.size = state.contentLength;
        }
        emittedFields.size = true;
      }
      continue;
    }
    if (key === "mimeType") {
      if (!emittedFields.mimeType && hasInfo.mimeType) {
        await callbackFunctions.onMimeType?.(state.mimeType);
        if (fieldsInReturnValue.mimeType) {
          returnValue.mimeType = state.mimeType;
        }
        emittedFields.mimeType = true;
      }
      continue;
    }
    if (key === "name") {
      if (!emittedFields.name && hasInfo.name) {
        await callbackFunctions.onName?.(name);
        if (fieldsInReturnValue.name) {
          returnValue.name = name;
        }
        emittedFields.name = true;
      }
      continue;
    }
    if (key === "isHdr") {
      if (!returnValue.isHdr && hasInfo.isHdr) {
        const isHdr = getIsHdr(state);
        await callbackFunctions.onIsHdr?.(isHdr);
        if (fieldsInReturnValue.isHdr) {
          returnValue.isHdr = isHdr;
        }
        emittedFields.isHdr = true;
      }
      continue;
    }
    if (key === "container") {
      if (!returnValue.container && hasInfo.container) {
        const container = getContainer(state.structure.getStructure());
        await callbackFunctions.onContainer?.(container);
        if (fieldsInReturnValue.container) {
          returnValue.container = container;
        }
        emittedFields.container = true;
      }
      continue;
    }
    if (key === "metadata") {
      if (!emittedFields.metadata && hasInfo.metadata) {
        const metadata = getMetadata(state);
        await callbackFunctions.onMetadata?.(metadata);
        if (fieldsInReturnValue.metadata) {
          returnValue.metadata = metadata;
        }
        emittedFields.metadata = true;
      }
      continue;
    }
    if (key === "location") {
      if (!emittedFields.location && hasInfo.location) {
        const location = getLocation(state);
        await callbackFunctions.onLocation?.(location);
        if (fieldsInReturnValue.location) {
          returnValue.location = location;
        }
        emittedFields.location = true;
      }
      continue;
    }
    if (key === "slowKeyframes") {
      if (!emittedFields.slowKeyframes && hasInfo.slowKeyframes) {
        await callbackFunctions.onSlowKeyframes?.(state.keyframes.getKeyframes());
        if (fieldsInReturnValue.slowKeyframes) {
          returnValue.slowKeyframes = state.keyframes.getKeyframes();
        }
        emittedFields.slowKeyframes = true;
      }
      continue;
    }
    if (key === "slowNumberOfFrames") {
      if (!emittedFields.slowNumberOfFrames && hasInfo.slowNumberOfFrames) {
        await callbackFunctions.onSlowNumberOfFrames?.(state.samplesObserved.getSlowNumberOfFrames());
        if (fieldsInReturnValue.slowNumberOfFrames) {
          returnValue.slowNumberOfFrames = state.samplesObserved.getSlowNumberOfFrames();
        }
        emittedFields.slowNumberOfFrames = true;
      }
      continue;
    }
    if (key === "slowAudioBitrate") {
      if (!emittedFields.slowAudioBitrate && hasInfo.slowAudioBitrate) {
        await callbackFunctions.onSlowAudioBitrate?.(state.samplesObserved.getAudioBitrate());
        if (fieldsInReturnValue.slowAudioBitrate) {
          returnValue.slowAudioBitrate = state.samplesObserved.getAudioBitrate();
        }
        emittedFields.slowAudioBitrate = true;
      }
      continue;
    }
    if (key === "slowVideoBitrate") {
      if (!emittedFields.slowVideoBitrate && hasInfo.slowVideoBitrate) {
        await callbackFunctions.onSlowVideoBitrate?.(state.samplesObserved.getVideoBitrate());
        if (fieldsInReturnValue.slowVideoBitrate) {
          returnValue.slowVideoBitrate = state.samplesObserved.getVideoBitrate();
        }
        emittedFields.slowVideoBitrate = true;
      }
      continue;
    }
    if (key === "keyframes") {
      if (!emittedFields.keyframes && hasInfo.keyframes) {
        await callbackFunctions.onKeyframes?.(getKeyframes(state));
        if (fieldsInReturnValue.keyframes) {
          returnValue.keyframes = getKeyframes(state);
        }
        emittedFields.keyframes = true;
      }
      continue;
    }
    if (key === "images") {
      if (!emittedFields.images && hasInfo.images) {
        await callbackFunctions.onImages?.(state.images.images);
        if (fieldsInReturnValue.images) {
          returnValue.images = state.images.images;
        }
        emittedFields.images = true;
      }
      continue;
    }
    if (key === "sampleRate") {
      if (!emittedFields.sampleRate && hasInfo.sampleRate) {
        const sampleRate = getSampleRate3(state);
        await callbackFunctions.onSampleRate?.(sampleRate);
        if (fieldsInReturnValue.sampleRate) {
          returnValue.sampleRate = sampleRate;
        }
        emittedFields.sampleRate = true;
      }
      continue;
    }
    if (key === "numberOfAudioChannels") {
      if (!emittedFields.numberOfAudioChannels && hasInfo.numberOfAudioChannels) {
        const numberOfAudioChannels = getNumberOfAudioChannels(state);
        await callbackFunctions.onNumberOfAudioChannels?.(numberOfAudioChannels);
        if (fieldsInReturnValue.numberOfAudioChannels) {
          returnValue.numberOfAudioChannels = numberOfAudioChannels;
        }
        emittedFields.numberOfAudioChannels = true;
      }
      continue;
    }
    if (key === "m3uStreams") {
      if (!emittedFields.m3uStreams && hasInfo.m3uStreams) {
        const streams = getM3uStreams({
          structure: state.structure.getStructureOrNull(),
          originalSrc: state.src,
          readerInterface: state.readerInterface
        });
        await callbackFunctions.onM3uStreams?.(streams);
        if (fieldsInReturnValue.m3uStreams) {
          returnValue.m3uStreams = streams;
        }
        emittedFields.m3uStreams = true;
      }
      continue;
    }
    throw new Error(`Unhandled key: ${key}`);
  }
  await workOnSeekRequest(getWorkOnSeekRequestOptions(state));
};

// src/state/may-skip-video-data.ts
var getHasCallbacks = (state) => {
  const hasNoTrackHandlers = !state.callbacks.hasAudioTrackHandlers && !state.callbacks.hasVideoTrackHandlers;
  if (hasNoTrackHandlers) {
    return false;
  }
  const hasAllTracksAndNoCallbacks = !state.callbacks.tracks.hasAllTracks() || Object.values(state.callbacks.videoSampleCallbacks).length > 0 || Object.values(state.callbacks.audioSampleCallbacks).length > 0;
  return hasAllTracksAndNoCallbacks;
};
var missesMatroskaTracks = (state) => {
  const struct = state.structure.getStructureOrNull();
  if (struct === null) {
    return false;
  }
  if (struct.type !== "matroska") {
    return false;
  }
  const mainSegment = getMainSegment(struct.boxes);
  if (mainSegment === null) {
    return false;
  }
  return getTracksFromMatroska({
    structureState: state.structure,
    webmState: state.webm
  }).missingInfo.length > 0;
};
var maySkipVideoData = ({ state }) => {
  const hasCallbacks = getHasCallbacks(state);
  return !hasCallbacks && !needsToIterateOverSamples({
    emittedFields: state.emittedFields,
    fields: state.fields
  }) && !missesMatroskaTracks(state);
};
var maySkipOverSamplesInTheMiddle = ({
  state
}) => {
  const hasCallbacks = getHasCallbacks(state);
  return !hasCallbacks && !needsToIterateOverEverySample({
    emittedFields: state.emittedFields,
    fields: state.fields
  });
};

// src/has-all-info.ts
var getAvailableInfo = ({
  state
}) => {
  const keys = Object.entries(state.fields).filter(([, value]) => value);
  const structure = state.structure.getStructureOrNull();
  const infos = keys.map(([_key]) => {
    const key = _key;
    if (key === "slowStructure") {
      return false;
    }
    if (key === "durationInSeconds") {
      return Boolean(structure && hasDuration(state));
    }
    if (key === "slowDurationInSeconds") {
      const res = Boolean(structure && hasSlowDuration(state));
      return res;
    }
    if (key === "dimensions" || key === "rotation" || key === "unrotatedDimensions") {
      return Boolean(structure && hasDimensions(state));
    }
    if (key === "fps") {
      return Boolean(structure && hasFps(state));
    }
    if (key === "slowFps") {
      return Boolean(structure && hasFpsSuitedForSlowFps(state));
    }
    if (key === "isHdr") {
      return Boolean(structure && hasHdr(state));
    }
    if (key === "videoCodec") {
      return Boolean(structure && hasVideoCodec(state));
    }
    if (key === "audioCodec") {
      return Boolean(structure && hasAudioCodec(state));
    }
    if (key === "tracks") {
      return Boolean(structure && getHasTracks(state, true));
    }
    if (key === "keyframes") {
      return Boolean(structure && hasKeyframes(state));
    }
    if (key === "internalStats") {
      return true;
    }
    if (key === "size") {
      return true;
    }
    if (key === "mimeType") {
      return true;
    }
    if (key === "name") {
      return true;
    }
    if (key === "container") {
      return Boolean(structure && hasContainer(structure));
    }
    if (key === "metadata" || key === "location" || key === "images") {
      return Boolean(structure && hasMetadata(structure));
    }
    if (key === "slowKeyframes" || key === "slowVideoBitrate" || key === "slowAudioBitrate" || key === "slowNumberOfFrames") {
      return false;
    }
    if (key === "numberOfAudioChannels") {
      return hasNumberOfAudioChannels(state);
    }
    if (key === "sampleRate") {
      return hasSampleRate(state);
    }
    if (key === "m3uStreams") {
      return m3uHasStreams(state);
    }
    throw new Error(`Unknown field passed: ${key}. Available fields: ${Object.keys(state.fields).join(", ")}`);
  });
  const entries = [];
  let i = 0;
  for (const [key] of keys) {
    entries.push([key, infos[i++]]);
  }
  return Object.fromEntries(entries);
};
var hasAllInfo = ({ state }) => {
  const availableInfo = getAvailableInfo({
    state
  });
  if (!Object.values(availableInfo).every(Boolean)) {
    return false;
  }
  if (maySkipVideoData({ state })) {
    return true;
  }
  if (state.callbacks.canSkipTracksState.canSkipTracks()) {
    return true;
  }
  return false;
};

// src/emit-all-info.ts
var emitAllInfo = async (state) => {
  const allFields = Object.keys(state.fields).reduce((acc, key) => {
    if (state.fields?.[key]) {
      acc[key] = true;
    }
    return acc;
  }, {});
  await emitAvailableInfo({
    hasInfo: allFields,
    state
  });
};
var triggerInfoEmit = async (state) => {
  const availableInfo = getAvailableInfo({
    state
  });
  await emitAvailableInfo({
    hasInfo: availableInfo,
    state
  });
};

// src/check-if-done.ts
var checkIfDone = async (state) => {
  const startCheck = Date.now();
  const hasAll = hasAllInfo({
    state
  });
  state.timings.timeCheckingIfDone += Date.now() - startCheck;
  if (hasAll && state.mode === "query") {
    Log.verbose(state.logLevel, "Got all info, skipping to the end.");
    state.increaseSkippedBytes(state.contentLength - state.iterator.counter.getOffset());
    return true;
  }
  if (state.iterator.counter.getOffset() === state.contentLength) {
    if (state.structure.getStructure().type === "m3u" && !state.m3u.getAllChunksProcessedOverall()) {
      return false;
    }
    state.riff.queuedBFrames.flush();
    if (state.riff.queuedBFrames.hasReleasedFrames()) {
      return false;
    }
    Log.verbose(state.logLevel, "Reached end of file");
    await state.discardReadBytes(true);
    return true;
  }
  if (state.iterator.counter.getOffset() + state.iterator.bytesRemaining() === state.contentLength && state.errored) {
    Log.verbose(state.logLevel, "Reached end of file and errorred");
    return true;
  }
  return false;
};

// src/make-progress-object.ts
var makeProgressObject = (state) => {
  return {
    bytes: state.iterator.counter.getOffset(),
    percentage: state.contentLength ? state.iterator.counter.getOffset() / state.contentLength : null,
    totalBytes: state.contentLength
  };
};

// src/containers/aac/parse-aac.ts
var parseAac = async (state) => {
  const { iterator } = state;
  const startOffset = iterator.counter.getOffset();
  iterator.startReadingBits();
  const syncWord = iterator.getBits(12);
  if (syncWord !== 4095) {
    throw new Error("Invalid syncword: " + syncWord);
  }
  const id = iterator.getBits(1);
  if (id !== 0) {
    throw new Error("Only supporting MPEG-4 for .aac");
  }
  const layer = iterator.getBits(2);
  if (layer !== 0) {
    throw new Error("Only supporting layer 0 for .aac");
  }
  const protectionAbsent = iterator.getBits(1);
  const audioObjectType = iterator.getBits(2);
  const samplingFrequencyIndex = iterator.getBits(4);
  const sampleRate = getSampleRateFromSampleFrequencyIndex(samplingFrequencyIndex);
  iterator.getBits(1);
  const channelConfiguration = iterator.getBits(3);
  const codecPrivate2 = createAacCodecPrivate({
    audioObjectType,
    sampleRate,
    channelConfiguration,
    codecPrivate: null
  });
  iterator.getBits(1);
  iterator.getBits(1);
  iterator.getBits(1);
  iterator.getBits(1);
  const frameLength = iterator.getBits(13);
  iterator.getBits(11);
  iterator.getBits(2);
  if (!protectionAbsent) {
    iterator.getBits(16);
  }
  iterator.stopReadingBits();
  iterator.counter.decrement(iterator.counter.getOffset() - startOffset);
  const data = iterator.getSlice(frameLength);
  if (state.callbacks.tracks.getTracks().length === 0) {
    state.mediaSection.addMediaSection({
      start: startOffset,
      size: state.contentLength - startOffset
    });
    await registerAudioTrack({
      container: "aac",
      track: {
        codec: mapAudioObjectTypeToCodecString(audioObjectType),
        codecEnum: "aac",
        codecData: { type: "aac-config", data: codecPrivate2 },
        description: codecPrivate2,
        numberOfChannels: channelConfiguration,
        sampleRate,
        originalTimescale: WEBCODECS_TIMESCALE,
        trackId: 0,
        type: "audio",
        startInSeconds: 0,
        timescale: WEBCODECS_TIMESCALE,
        trackMediaTimeOffsetInTrackTimescale: 0
      },
      registerAudioSampleCallback: state.callbacks.registerAudioSampleCallback,
      tracks: state.callbacks.tracks,
      logLevel: state.logLevel,
      onAudioTrack: state.onAudioTrack
    });
    state.callbacks.tracks.setIsDone(state.logLevel);
  }
  const duration2 = 1024 / sampleRate;
  const { index } = state.aac.addSample({ offset: startOffset, size: frameLength });
  const timestamp = 1024 / sampleRate * index;
  state.aac.audioSamples.addSample({
    timeInSeconds: timestamp,
    offset: startOffset,
    durationInSeconds: duration2
  });
  const audioSample = convertAudioOrVideoSampleToWebCodecsTimestamps({
    sample: {
      duration: duration2,
      type: "key",
      data,
      offset: startOffset,
      decodingTimestamp: timestamp,
      timestamp
    },
    timescale: 1
  });
  await state.callbacks.onAudioSample({
    audioSample,
    trackId: 0
  });
  return Promise.resolve(null);
};

// src/skip.ts
var makeSkip = (skipTo) => ({
  action: "skip",
  skipTo
});
var makeFetchMoreData = (bytesNeeded) => ({
  action: "fetch-more-data",
  bytesNeeded
});

// src/containers/flac/get-block-size.ts
var getBlockSize = (iterator) => {
  const bits = iterator.getBits(4);
  if (bits === 0) {
    return null;
  }
  if (bits === 1) {
    return 192;
  }
  if (bits >= 2 && bits <= 5) {
    return 144 * 2 ** bits;
  }
  if (bits === 6) {
    return "uncommon-u8";
  }
  if (bits === 7) {
    return "uncommon-u16";
  }
  if (bits >= 8 && bits <= 15) {
    return 2 ** bits;
  }
  throw new Error("Invalid block size");
};

// src/containers/flac/get-channel-count.ts
var getChannelCount = (iterator) => {
  const bits = iterator.getBits(4);
  if (bits === 0) {
    return 1;
  }
  if (bits === 1) {
    return 2;
  }
  if (bits === 2) {
    return 3;
  }
  if (bits === 3) {
    return 4;
  }
  if (bits === 4) {
    return 5;
  }
  if (bits === 5) {
    return 6;
  }
  if (bits === 6) {
    return 7;
  }
  if (bits === 7) {
    return 8;
  }
  if (bits === 8 || bits === 9 || bits === 10) {
    return 2;
  }
  if (bits >= 11 && bits <= 15) {
    return 2;
  }
  throw new Error(`Invalid channel count: ${bits.toString(2)}`);
};

// src/containers/flac/get-sample-rate.ts
var getSampleRate4 = (iterator, state) => {
  const mode = iterator.getBits(4);
  if (mode === 0 || mode === 15) {
    const structure = state.structure.getFlacStructure();
    const sampleRate = structure.boxes.find((box) => box.type === "flac-streaminfo")?.sampleRate ?? null;
    if (sampleRate === null) {
      throw new Error("Sample rate not found");
    }
    return sampleRate;
  }
  if (mode === 1) {
    return 88200;
  }
  if (mode === 2) {
    return 176400;
  }
  if (mode === 3) {
    return 192000;
  }
  if (mode === 4) {
    return 8000;
  }
  if (mode === 5) {
    return 16000;
  }
  if (mode === 6) {
    return 22050;
  }
  if (mode === 7) {
    return 24000;
  }
  if (mode === 8) {
    return 32000;
  }
  if (mode === 9) {
    return 44100;
  }
  if (mode === 10) {
    return 48000;
  }
  if (mode === 11) {
    return 96000;
  }
  if (mode === 12) {
    return "uncommon-u8";
  }
  if (mode === 13) {
    return "uncommon-u16";
  }
  if (mode === 14) {
    return "uncommon-u16-10";
  }
  throw new Error(`Invalid sample rate mode: ${mode.toString(2)}`);
};

// src/containers/flac/parse-flac-frame.ts
function calculateCRC8(data) {
  const polynomial = 7;
  let crc = 0;
  for (const byte of data) {
    crc ^= byte;
    for (let i = 0;i < 8; i++) {
      if ((crc & 128) !== 0) {
        crc = crc << 1 ^ polynomial;
      } else {
        crc <<= 1;
      }
      crc &= 255;
    }
  }
  return crc;
}
var parseFrameHeader = ({
  iterator,
  state
}) => {
  if (iterator.bytesRemaining() < 10) {
    return null;
  }
  const startOffset = iterator.counter.getOffset();
  iterator.discard(2);
  iterator.startReadingBits();
  const blockSizeBits = getBlockSize(iterator);
  if (blockSizeBits === null) {
    return null;
  }
  const sampleRateBits = getSampleRate4(iterator, state);
  getChannelCount(iterator);
  iterator.getBits(3);
  iterator.getBits(1);
  const num = iterator.getFlacCodecNumber();
  const blockSize = blockSizeBits === "uncommon-u16" ? iterator.getBits(16) + 1 : blockSizeBits === "uncommon-u8" ? iterator.getBits(8) + 1 : blockSizeBits;
  const sampleRate = sampleRateBits === "uncommon-u16" ? iterator.getBits(16) : sampleRateBits === "uncommon-u16-10" ? iterator.getBits(16) * 10 : sampleRateBits === "uncommon-u8" ? iterator.getBits(8) : sampleRateBits;
  iterator.stopReadingBits();
  const size = iterator.counter.getOffset() - startOffset;
  const crc = iterator.getUint8();
  iterator.counter.decrement(size + 1);
  const crcCalculated = calculateCRC8(iterator.getSlice(size));
  iterator.counter.decrement(size);
  if (crcCalculated !== crc) {
    return null;
  }
  return { num, blockSize, sampleRate };
};
var emitSample = async ({
  state,
  data,
  offset
}) => {
  const iterator = getArrayBufferIterator({
    initialData: data,
    maxBytes: data.length,
    logLevel: "error"
  });
  const parsed = parseFrameHeader({ iterator, state });
  if (!parsed) {
    throw new Error("Invalid CRC");
  }
  const { blockSize, num, sampleRate } = parsed;
  const duration2 = blockSize / sampleRate;
  const structure = state.structure.getFlacStructure();
  const streamInfo = structure.boxes.find((box) => box.type === "flac-streaminfo");
  if (!streamInfo) {
    throw new Error("Stream info not found");
  }
  if (streamInfo.minimumBlockSize !== streamInfo.maximumBlockSize) {
    throw new Error("Cannot determine timestamp");
  }
  const timestamp = num * streamInfo.maximumBlockSize / streamInfo.sampleRate;
  state.flac.audioSamples.addSample({
    timeInSeconds: timestamp,
    offset,
    durationInSeconds: duration2
  });
  const audioSample = convertAudioOrVideoSampleToWebCodecsTimestamps({
    sample: {
      data,
      duration: duration2,
      decodingTimestamp: timestamp,
      timestamp,
      type: "key",
      offset
    },
    timescale: 1
  });
  await state.callbacks.onAudioSample({
    audioSample,
    trackId: 0
  });
  iterator.destroy();
};
var parseFlacFrame = async ({
  state,
  iterator
}) => {
  const blockingBit = state.flac.getBlockingBitStrategy();
  const offset = iterator.counter.getOffset();
  const { returnToCheckpoint } = iterator.startCheckpoint();
  iterator.startReadingBits();
  if (blockingBit === undefined) {
    const bits = iterator.getBits(15);
    if (bits !== 32764) {
      throw new Error("Invalid sync code");
    }
    state.flac.setBlockingBitStrategy(iterator.getBits(1));
  } else if (blockingBit === 1) {
    const bits = iterator.getBits(16);
    if (bits !== 65529) {
      throw new Error("Blocking bit changed, it should not");
    }
  } else if (blockingBit === 0) {
    const bits = iterator.getBits(16);
    if (bits !== 65528) {
      throw new Error("Blocking bit changed, it should not");
    }
  }
  const setBlockingBit = state.flac.getBlockingBitStrategy();
  if (setBlockingBit === undefined) {
    throw new Error("Blocking bit should be set");
  }
  iterator.stopReadingBits();
  const structure = state.structure.getFlacStructure();
  const minimumFrameSize = structure.boxes.find((b) => b.type === "flac-streaminfo")?.minimumFrameSize ?? null;
  if (minimumFrameSize === null) {
    throw new Error("Expected flac-streaminfo");
  }
  if (minimumFrameSize !== 0) {
    iterator.getSlice(minimumFrameSize - 2);
  }
  while (true) {
    if (iterator.counter.getOffset() === state.contentLength) {
      const size = iterator.counter.getOffset() - offset;
      returnToCheckpoint();
      const slice = iterator.getSlice(size);
      await emitSample({ state, data: slice, offset });
      break;
    }
    if (iterator.bytesRemaining() === 0) {
      returnToCheckpoint();
      break;
    }
    const nextByte = iterator.getUint8();
    if (nextByte === 255) {
      const nextBits = iterator.getUint8();
      const expected = setBlockingBit === 1 ? 249 : 248;
      if (nextBits !== expected) {
        iterator.counter.decrement(1);
        continue;
      }
      iterator.counter.decrement(2);
      const nextIsLegit = parseFrameHeader({ iterator, state });
      if (!nextIsLegit) {
        iterator.discard(1);
        continue;
      }
      const size = iterator.counter.getOffset() - offset;
      returnToCheckpoint();
      const data = iterator.getSlice(size);
      await emitSample({ state, data, offset });
      break;
    }
  }
  return null;
};

// src/containers/flac/parse-header.ts
var parseFlacHeader = ({
  state
}) => {
  state.structure.getFlacStructure().boxes.push({
    type: "flac-header"
  });
  return Promise.resolve(null);
};

// src/containers/flac/parse-metadata.ts
var parseVorbisComment = ({
  state,
  iterator,
  size
}) => {
  const { expectNoMoreBytes } = iterator.startBox(size);
  const box = {
    type: "flac-vorbis-comment",
    fields: []
  };
  const vendorLength = iterator.getUint32Le();
  const vendorString = iterator.getByteString(vendorLength, true);
  const numberOfFields = iterator.getUint32Le();
  box.fields.push({ key: "vendor", value: vendorString, trackId: null });
  for (let i = 0;i < numberOfFields; i++) {
    const fieldLength = iterator.getUint32Le();
    const field = iterator.getByteString(fieldLength, true);
    const [key, value] = field.split("=");
    box.fields.push({ key: key.toLowerCase(), value, trackId: null });
  }
  state.structure.getFlacStructure().boxes.push(box);
  expectNoMoreBytes();
  return Promise.resolve(null);
};

// src/containers/flac/parse-streaminfo.ts
var parseStreamInfo = async ({
  iterator,
  state
}) => {
  const counter = iterator.counter.getOffset();
  const minimumBlockSize = iterator.getUint16();
  const maximumBlockSize = iterator.getUint16();
  const minimumFrameSize = iterator.getUint24();
  const maximumFrameSize = iterator.getUint24();
  iterator.startReadingBits();
  const sampleRate = iterator.getBits(20);
  const channels2 = iterator.getBits(3) + 1;
  const bitsPerSample = iterator.getBits(5);
  const totalSamples = iterator.getBits(36);
  iterator.getBits(128);
  iterator.stopReadingBits();
  const counterNow = iterator.counter.getOffset();
  const size = counterNow - counter;
  iterator.counter.decrement(size);
  const asUint8Array = iterator.getSlice(size);
  const flacStreamInfo = {
    type: "flac-streaminfo",
    bitsPerSample,
    channels: channels2,
    maximumBlockSize,
    maximumFrameSize,
    minimumBlockSize,
    minimumFrameSize,
    sampleRate,
    totalSamples
  };
  state.structure.getFlacStructure().boxes.push(flacStreamInfo);
  await registerAudioTrack({
    container: "flac",
    track: {
      codec: "flac",
      type: "audio",
      description: asUint8Array,
      codecData: { type: "flac-description", data: asUint8Array },
      codecEnum: "flac",
      numberOfChannels: channels2,
      sampleRate,
      originalTimescale: WEBCODECS_TIMESCALE,
      trackId: 0,
      startInSeconds: 0,
      timescale: WEBCODECS_TIMESCALE,
      trackMediaTimeOffsetInTrackTimescale: 0
    },
    registerAudioSampleCallback: state.callbacks.registerAudioSampleCallback,
    tracks: state.callbacks.tracks,
    logLevel: state.logLevel,
    onAudioTrack: state.onAudioTrack
  });
  state.callbacks.tracks.setIsDone(state.logLevel);
  return Promise.resolve(null);
};

// src/containers/flac/parse-unknown-block.ts
var parseFlacUnkownBlock = ({
  iterator,
  state,
  size
}) => {
  iterator.discard(size);
  state.structure.getFlacStructure().boxes.push({
    type: "flac-header"
  });
  return Promise.resolve(null);
};

// src/containers/flac/parse-meta.ts
var flacTypes = {
  streaminfo: 0,
  vorbisComment: 4
};
var parseMetaBlock = ({
  iterator,
  state
}) => {
  iterator.startReadingBits();
  const isLastMetadata = iterator.getBits(1);
  const metaBlockType = iterator.getBits(7);
  iterator.stopReadingBits();
  const size = iterator.getUint24();
  if (isLastMetadata) {
    state.mediaSection.addMediaSection({
      start: iterator.counter.getOffset() + size,
      size: state.contentLength - iterator.counter.getOffset() - size
    });
  }
  if (metaBlockType === flacTypes.streaminfo) {
    return parseStreamInfo({ iterator, state });
  }
  if (metaBlockType === flacTypes.vorbisComment) {
    return parseVorbisComment({ iterator, state, size });
  }
  return parseFlacUnkownBlock({ iterator, state, size });
};

// src/containers/flac/parse-flac.ts
var parseFlac = ({
  iterator,
  state
}) => {
  const mediaSectionState2 = state.mediaSection.isCurrentByteInMediaSection(iterator);
  if (mediaSectionState2 === "in-section") {
    if (maySkipVideoData({ state })) {
      return Promise.resolve(makeSkip(state.contentLength));
    }
    return parseFlacFrame({ state, iterator });
  }
  const bytes = iterator.getByteString(4, true);
  if (bytes === "fLaC") {
    return parseFlacHeader({ state, iterator });
  }
  iterator.counter.decrement(4);
  return parseMetaBlock({
    iterator,
    state
  });
};

// src/state/iso-base-media/cached-sample-positions.ts
var calculateSamplePositions = ({
  state,
  mediaSectionStart,
  trackIds
}) => {
  const tracks2 = getTracks(state, true);
  const moofBoxes = getMoofBoxes(state.structure.getIsoStructure().boxes);
  const tfraBoxes = deduplicateTfraBoxesByOffset([
    ...state.iso.tfra.getTfraBoxes(),
    ...getTfraBoxes(state.structure.getIsoStructure().boxes)
  ]);
  const moofComplete = areSamplesComplete({ moofBoxes, tfraBoxes });
  const relevantMoofBox = moofBoxes.find((moofBox) => moofBox.offset + moofBox.size + 8 === mediaSectionStart);
  if (moofBoxes.length > 0 && !relevantMoofBox) {
    throw new Error("No relevant moof box found");
  }
  const moov = getMoovBoxFromState({
    structureState: state.structure,
    isoState: state.iso,
    mp4HeaderSegment: state.m3uPlaylistContext?.mp4HeaderSegment ?? null,
    mayUsePrecomputed: true
  });
  if (!moov) {
    throw new Error("No moov box found");
  }
  const trackIdAndSamplePositions = [];
  for (const track of tracks2) {
    const trakBox = getTrakBoxByTrackId(moov, track.trackId);
    if (!trackIds.includes(track.trackId)) {
      Log.verbose(state.logLevel, "Skipping calculating sample positions for track", track.trackId);
      continue;
    }
    if (!trakBox) {
      throw new Error("No trak box found");
    }
    const { samplePositions } = getSamplePositionsFromTrack({
      trakBox,
      moofBoxes: relevantMoofBox ? [relevantMoofBox] : [],
      moofComplete,
      trexBoxes: getTrexBoxes(moov)
    });
    trackIdAndSamplePositions.push({
      trackId: track.trackId,
      samplePositions
    });
  }
  return trackIdAndSamplePositions;
};
var updateSampleIndicesAfterSeek = ({
  samplePositionsForMdatStart,
  seekedByte
}) => {
  const currentSampleIndices = {};
  const keys = Object.keys(samplePositionsForMdatStart).map(Number).sort();
  const mdat = keys.find((key) => seekedByte >= key);
  if (!mdat) {
    return currentSampleIndices;
  }
  const samplePositions = samplePositionsForMdatStart[mdat];
  if (!samplePositions) {
    return currentSampleIndices;
  }
  for (const track of samplePositions) {
    const currentSampleIndex = track.samplePositions.findIndex((sample) => sample.offset >= seekedByte);
    if (!currentSampleIndices[mdat]) {
      currentSampleIndices[mdat] = {};
    }
    if (!currentSampleIndices[mdat][track.trackId]) {
      currentSampleIndices[mdat][track.trackId] = 0;
    }
    if (currentSampleIndex === -1) {
      currentSampleIndices[mdat][track.trackId] = track.samplePositions.length;
    } else {
      currentSampleIndices[mdat][track.trackId] = currentSampleIndex;
    }
  }
  return currentSampleIndices;
};
var cachedSamplePositionsState = () => {
  const samplePositionsForMdatStart = {};
  let currentSampleIndex = {};
  return {
    getSamples: (mdatStart) => {
      return samplePositionsForMdatStart[mdatStart] ?? null;
    },
    setSamples: (mdatStart, samples) => {
      samplePositionsForMdatStart[mdatStart] = samples;
    },
    setCurrentSampleIndex: (mdatStart, trackId, index) => {
      if (!currentSampleIndex[mdatStart]) {
        currentSampleIndex[mdatStart] = {};
      }
      if (!currentSampleIndex[mdatStart][trackId]) {
        currentSampleIndex[mdatStart][trackId] = 0;
      }
      currentSampleIndex[mdatStart][trackId] = index;
    },
    getCurrentSampleIndices: (mdatStart) => {
      return currentSampleIndex[mdatStart] ?? {};
    },
    updateAfterSeek: (seekedByte) => {
      currentSampleIndex = updateSampleIndicesAfterSeek({
        samplePositionsForMdatStart,
        seekedByte
      });
    }
  };
};
var getSampleWithLowestDts = (samplePositions, currentSampleIndexMap) => {
  const lowestDts = [];
  for (const track of samplePositions) {
    const currentSampleIndex = currentSampleIndexMap[track.trackId] ?? 0;
    const currentSample = track.samplePositions[currentSampleIndex];
    if (currentSample && (lowestDts.length === 0 || currentSample.decodingTimestamp <= lowestDts[0].samplePosition.decodingTimestamp)) {
      lowestDts.push({
        samplePosition: currentSample,
        trackId: track.trackId,
        index: currentSampleIndex
      });
    }
  }
  return lowestDts;
};

// src/state/iso-base-media/last-moof-box.ts
var getLastMoofBox = (boxes) => {
  if (boxes) {
    const tfras = boxes.filter((b) => b.type === "tfra-box");
    const lastMoofOffsets = tfras.map((f) => {
      if (f.entries.length <= 1) {
        return null;
      }
      return f.entries[f.entries.length - 1].moofOffset;
    });
    if (lastMoofOffsets.length > 0) {
      const maxOffset = Math.max(...lastMoofOffsets.filter(truthy));
      return maxOffset;
    }
    return null;
  }
};
var getMaxFirstMoofOffset = (boxes) => {
  const tfras = boxes.filter((b) => b.type === "tfra-box");
  const firstMoofOffsets = tfras.map((f) => {
    return f.entries[0].moofOffset;
  });
  return Math.max(...firstMoofOffsets.filter(truthy));
};

// src/state/can-skip-tracks.ts
var needsTracksForField = ({
  field,
  structure
}) => {
  if (field === "dimensions") {
    if (structure?.type === "riff") {
      return false;
    }
    return true;
  }
  if (field === "audioCodec" || field === "durationInSeconds" || field === "slowDurationInSeconds" || field === "slowFps" || field === "fps" || field === "isHdr" || field === "rotation" || field === "slowStructure" || field === "tracks" || field === "unrotatedDimensions" || field === "videoCodec" || field === "metadata" || field === "location" || field === "slowKeyframes" || field === "slowNumberOfFrames" || field === "keyframes" || field === "images" || field === "sampleRate" || field === "numberOfAudioChannels" || field === "slowAudioBitrate" || field === "slowVideoBitrate" || field === "m3uStreams") {
    return true;
  }
  if (field === "container" || field === "internalStats" || field === "mimeType" || field === "name" || field === "size") {
    return false;
  }
  throw new Error(`field not implemeted ${field}`);
};
var makeCanSkipTracksState = ({
  hasAudioTrackHandlers,
  fields,
  hasVideoTrackHandlers,
  structure
}) => {
  const doFieldsNeedTracks = () => {
    const keys = Object.keys(fields ?? {});
    const selectedKeys = keys.filter((k) => fields[k]);
    return selectedKeys.some((k) => needsTracksForField({
      field: k,
      structure: structure.getStructureOrNull()
    }));
  };
  return {
    doFieldsNeedTracks,
    canSkipTracks: () => {
      if (hasAudioTrackHandlers || hasVideoTrackHandlers) {
        return false;
      }
      return !doFieldsNeedTracks();
    }
  };
};

// src/state/has-tracks-section.ts
var makeTracksSectionState = (canSkipTracksState, src) => {
  const tracks2 = [];
  let doneWithTracks = false;
  return {
    hasAllTracks: () => doneWithTracks,
    getIsDone: () => doneWithTracks,
    setIsDone: (logLevel) => {
      if (doneWithTracks) {
        throw new Error("Error in Media Parser: Tracks have already been parsed");
      }
      Log.verbose(logLevel, "All tracks have been parsed");
      doneWithTracks = true;
    },
    addTrack: (track) => {
      tracks2.push(track);
    },
    getTracks: () => {
      return tracks2;
    },
    ensureHasTracksAtEnd: (fields) => {
      if (canSkipTracksState.canSkipTracks()) {
        return;
      }
      if (!fields.tracks) {
        return;
      }
      if (!doneWithTracks) {
        throw new Error("Error in Media Parser: End of parsing of " + src + " has been reached, but no tracks have been found ");
      }
    }
  };
};

// src/state/structure.ts
var structureState = () => {
  let structure = null;
  const getStructure = () => {
    if (structure === null) {
      throw new Error("Expected structure");
    }
    return structure;
  };
  return {
    getStructureOrNull: () => {
      return structure;
    },
    getStructure,
    setStructure: (value) => {
      structure = value;
    },
    getFlacStructure: () => {
      const struc = getStructure();
      if (struc.type !== "flac") {
        throw new Error("Invalid structure type");
      }
      return struc;
    },
    getIsoStructure: () => {
      const struc = getStructure();
      if (struc.type !== "iso-base-media") {
        throw new Error("Invalid structure type");
      }
      return struc;
    },
    getMp3Structure: () => {
      const struc = getStructure();
      if (struc.type !== "mp3") {
        throw new Error("Invalid structure type");
      }
      return struc;
    },
    getM3uStructure: () => {
      const struc = getStructure();
      if (struc.type !== "m3u") {
        throw new Error("Invalid structure type");
      }
      return struc;
    },
    getRiffStructure: () => {
      const struc = getStructure();
      if (struc.type !== "riff") {
        throw new Error("Invalid structure type");
      }
      return struc;
    },
    getTsStructure: () => {
      const struc = getStructure();
      if (struc.type !== "transport-stream") {
        throw new Error("Invalid structure type");
      }
      return struc;
    },
    getWavStructure: () => {
      const struc = getStructure();
      if (struc.type !== "wav") {
        throw new Error("Invalid structure type");
      }
      return struc;
    },
    getMatroskaStructure: () => {
      const struc = getStructure();
      if (struc.type !== "matroska") {
        throw new Error("Invalid structure type");
      }
      return struc;
    }
  };
};

// src/containers/iso-base-media/elst.ts
var parseElst = ({
  iterator,
  size,
  offset
}) => {
  const { discardRest } = iterator.startBox(size - 8);
  const version = iterator.getUint8();
  const flags = iterator.getUint24();
  const entryCount = iterator.getUint32();
  const entries = [];
  for (let i = 0;i < entryCount; i++) {
    const editDuration = Number(version === 1 ? iterator.getUint64() : iterator.getUint32());
    const mediaTime = Number(version === 1 ? iterator.getUint64() : iterator.getInt32());
    const mediaRateInteger = iterator.getUint16();
    const mediaRateFraction = iterator.getUint16();
    entries.push({
      editDuration,
      mediaTime,
      mediaRateInteger,
      mediaRateFraction
    });
  }
  discardRest();
  const result = {
    type: "elst-box",
    version,
    flags,
    entries,
    boxSize: size,
    offset
  };
  return result;
};

// src/containers/iso-base-media/esds/decoder-specific-config.ts
var parseDecoderSpecificConfig = (iterator) => {
  const layerTag = iterator.getUint8();
  const layerSize = iterator.getPaddedFourByteNumber();
  const start = iterator.counter.getOffset();
  if (layerTag !== 5) {
    iterator.discard(layerSize);
    return {
      type: "unknown-decoder-specific-config"
    };
  }
  const bytes = iterator.getSlice(layerSize);
  iterator.counter.decrement(layerSize);
  iterator.startReadingBits();
  const audioObjectType = iterator.getBits(5);
  const samplingFrequencyIndex = iterator.getBits(4);
  if (samplingFrequencyIndex === 15) {
    iterator.getBits(24);
  }
  const channelConfiguration = iterator.getBits(4);
  iterator.stopReadingBits();
  const read = iterator.counter.getOffset() - start;
  if (read < layerSize) {
    iterator.discard(layerSize - read);
  }
  return {
    type: "mp4a-specific-config",
    audioObjectType,
    samplingFrequencyIndex,
    channelConfiguration,
    asBytes: bytes
  };
};

// src/containers/iso-base-media/esds/esds-descriptors.ts
var mapToObjectAudioIndicator = (num) => {
  if (num === 64) {
    return "aac";
  }
  if (num === 107) {
    return "mp3";
  }
  return "unknown";
};
var processDescriptor = ({
  iterator
}) => {
  const tag = iterator.getUint8();
  if (tag === 4) {
    const size = iterator.getPaddedFourByteNumber();
    const initialOffset = iterator.counter.getOffset();
    const objectTypeIndication = iterator.getUint8();
    iterator.startReadingBits();
    const streamType = iterator.getBits(6);
    const upStream = iterator.getBits(1);
    iterator.getBits(1);
    const bufferSizeDB = iterator.getBits(24);
    iterator.stopReadingBits();
    const maxBitrate = iterator.getUint32();
    const avgBitrate = iterator.getUint32();
    const decoderSpecificConfigs = [];
    while (size - (iterator.counter.getOffset() - initialOffset) > 0) {
      const decoderSpecificConfig = parseDecoderSpecificConfig(iterator);
      decoderSpecificConfigs.push(decoderSpecificConfig);
    }
    return {
      descriptor: {
        type: "decoder-config-descriptor",
        objectTypeIndication: mapToObjectAudioIndicator(objectTypeIndication),
        asNumber: objectTypeIndication,
        bufferSizeDB,
        streamType,
        upStream,
        avgBitrate,
        maxBitrate,
        decoderSpecificConfigs
      }
    };
  }
  if (tag === 6) {
    const size = iterator.getPaddedFourByteNumber();
    iterator.discard(size);
    return {
      descriptor: {
        type: "sl-config-descriptor"
      }
    };
  }
  return {
    descriptor: null
  };
};
var parseDescriptors = (iterator, maxBytes) => {
  const descriptors = [];
  const initialOffset = iterator.counter.getOffset();
  while (iterator.bytesRemaining() > 0 && iterator.counter.getOffset() - initialOffset < maxBytes) {
    const { descriptor } = processDescriptor({
      iterator
    });
    if (descriptor) {
      descriptors.push(descriptor);
    } else {
      break;
    }
  }
  return descriptors;
};

// src/containers/iso-base-media/esds/esds.ts
var parseEsds = ({
  data,
  size,
  fileOffset
}) => {
  const version = data.getUint8();
  data.discard(3);
  const tag = data.getUint8();
  const sizeOfInstance = data.getPaddedFourByteNumber();
  const esId = data.getUint16();
  data.discard(1);
  const remaining = size - (data.counter.getOffset() - fileOffset);
  const descriptors = parseDescriptors(data, remaining);
  const remainingNow = size - (data.counter.getOffset() - fileOffset);
  data.discard(remainingNow);
  return {
    type: "esds-box",
    version,
    tag,
    sizeOfInstance,
    esId,
    descriptors
  };
};

// src/containers/iso-base-media/ftyp.ts
var parseFtyp = ({
  iterator,
  size,
  offset
}) => {
  const majorBrand = iterator.getByteString(4, false);
  const minorVersion = iterator.getFourByteNumber();
  const types = (size - iterator.counter.getOffset()) / 4;
  const compatibleBrands = [];
  for (let i = 0;i < types; i++) {
    compatibleBrands.push(iterator.getByteString(4, false).trim());
  }
  const offsetAtEnd = iterator.counter.getOffset();
  return {
    type: "ftyp-box",
    majorBrand,
    minorVersion,
    compatibleBrands,
    offset,
    boxSize: offsetAtEnd - offset
  };
};

// src/containers/iso-base-media/get-children.ts
var getIsoBaseMediaChildren = async ({
  size,
  iterator,
  logLevel,
  onlyIfMoovAtomExpected,
  contentLength
}) => {
  const boxes = [];
  const initial = iterator.counter.getOffset();
  while (iterator.counter.getOffset() < size + initial) {
    const parsed = await processBox({
      iterator,
      logLevel,
      onlyIfMoovAtomExpected,
      onlyIfMdatAtomExpected: null,
      contentLength
    });
    if (parsed.type !== "box") {
      throw new Error("Expected box");
    }
    boxes.push(parsed.box);
  }
  if (iterator.counter.getOffset() > size + initial) {
    throw new Error(`read too many bytes - size: ${size}, read: ${iterator.counter.getOffset() - initial}. initial offset: ${initial}`);
  }
  return boxes;
};

// src/containers/iso-base-media/mdhd.ts
var parseMdhd = ({
  data,
  size,
  fileOffset
}) => {
  const version = data.getUint8();
  data.discard(3);
  const creationTime = version === 1 ? Number(data.getUint64()) : data.getUint32();
  const modificationTime = version === 1 ? Number(data.getUint64()) : data.getUint32();
  const timescale = data.getUint32();
  const duration2 = version === 1 ? data.getUint64() : data.getUint32();
  const language2 = data.getUint16();
  const quality = data.getUint16();
  const remaining = size - (data.counter.getOffset() - fileOffset);
  if (remaining !== 0) {
    throw new Error(`Expected remaining bytes to be 0, got ${remaining}`);
  }
  return {
    type: "mdhd-box",
    duration: Number(duration2),
    timescale,
    version,
    language: language2,
    quality,
    creationTime,
    modificationTime
  };
};

// src/containers/iso-base-media/meta/hdlr.ts
var parseHdlr = ({
  iterator,
  size,
  offset
}) => {
  const box = iterator.startBox(size - 8);
  const version = iterator.getUint8();
  if (version !== 0) {
    throw new Error(`Unsupported hdlr version: ${version}`);
  }
  iterator.discard(3);
  iterator.discard(4);
  const hdlrType = iterator.getByteString(4, false);
  iterator.discard(4);
  iterator.discard(4);
  iterator.discard(4);
  const componentName = iterator.readUntilNullTerminator();
  box.discardRest();
  return Promise.resolve({
    type: "hdlr-box",
    boxSize: size,
    offset,
    hdlrType,
    componentName
  });
};

// src/containers/iso-base-media/meta/ilst.ts
var parseFromWellKnownType = (wellKnownType, iterator, size) => {
  if (wellKnownType === 1) {
    const value = iterator.getByteString(size, false);
    return { type: "text", value };
  }
  if (wellKnownType === 21) {
    if (size === 1) {
      return { type: "number", value: iterator.getInt8() };
    }
    if (size === 2) {
      return { type: "number", value: iterator.getInt16() };
    }
    if (size === 3) {
      return { type: "number", value: iterator.getInt24() };
    }
    if (size === 4) {
      return { type: "number", value: iterator.getInt32() };
    }
    if (size === 8) {
      return { type: "number", value: Number(iterator.getInt64()) };
    }
    throw new Error(`Weird size for number ${size}`);
  }
  if (wellKnownType === 22) {
    if (size === 1) {
      return { type: "number", value: iterator.getUint8() };
    }
    if (size === 2) {
      return { type: "number", value: iterator.getUint16() };
    }
    if (size === 3) {
      return { type: "number", value: iterator.getUint24() };
    }
    if (size === 4) {
      return { type: "number", value: iterator.getUint32() };
    }
    throw new Error(`Weird size for number ${size}`);
  }
  if (wellKnownType === 23) {
    if (size === 4) {
      return { type: "number", value: iterator.getFloat32() };
    }
    if (size === 8) {
      return { type: "number", value: iterator.getFloat64() };
    }
    throw new Error(`Weird size for number ${size}`);
  }
  iterator.discard(size);
  return { type: "unknown", value: null };
};
var parseIlstBox = ({
  iterator,
  size,
  offset
}) => {
  const box = iterator.startBox(size - 8);
  const entries = [];
  while (iterator.counter.getOffset() < size + offset) {
    const metadataSize = iterator.getUint32();
    const index = iterator.getAtom();
    if (!index.startsWith("�") && !index.startsWith("\x00")) {
      if (index === "skip") {
        iterator.discard(metadataSize - 8);
        continue;
      }
      if (index === "----") {
        iterator.discard(metadataSize - 8);
        continue;
      }
      iterator.discard(metadataSize - 8);
      continue;
    }
    const innerSize = iterator.getUint32();
    const type = iterator.getAtom();
    const typeIndicator = iterator.getUint8();
    if (typeIndicator !== 0) {
      throw new Error("Expected type indicator to be 0");
    }
    const wellKnownType = iterator.getUint24();
    iterator.discard(4);
    const value = parseFromWellKnownType(wellKnownType, iterator, innerSize - 16);
    entries.push({ index, type, wellKnownType, value });
  }
  box.discardRest();
  return {
    type: "ilst-box",
    boxSize: size,
    offset,
    entries
  };
};

// src/containers/iso-base-media/mfra/tfra.ts
var readTrafNumber = (iterator, lengthSizeOfTrafNum) => {
  const uintTypeTrafNum = (lengthSizeOfTrafNum + 1) * 8;
  if (uintTypeTrafNum === 8) {
    return iterator.getUint8();
  }
  if (uintTypeTrafNum === 16) {
    return iterator.getUint16();
  }
  if (uintTypeTrafNum === 32) {
    return iterator.getUint32();
  }
  if (uintTypeTrafNum === 64) {
    return Number(iterator.getUint64());
  }
  throw new Error("Invalid traf number size");
};
var readTrunNumber = (iterator, lengthSizeOfTrunNum) => {
  const uintTypeTrunNum = (lengthSizeOfTrunNum + 1) * 8;
  if (uintTypeTrunNum === 8) {
    return iterator.getUint8();
  }
  if (uintTypeTrunNum === 16) {
    return iterator.getUint16();
  }
  if (uintTypeTrunNum === 32) {
    return iterator.getUint32();
  }
  if (uintTypeTrunNum === 64) {
    return Number(iterator.getUint64());
  }
  throw new Error("Invalid trun number size");
};
var readSampleNumber = (iterator, lengthSizeOfSampleNum) => {
  const uintTypeSampleNum = (lengthSizeOfSampleNum + 1) * 8;
  if (uintTypeSampleNum === 8) {
    return iterator.getUint8();
  }
  if (uintTypeSampleNum === 16) {
    return iterator.getUint16();
  }
  if (uintTypeSampleNum === 32) {
    return iterator.getUint32();
  }
  if (uintTypeSampleNum === 64) {
    return Number(iterator.getUint64());
  }
  throw new Error("Invalid sample number size");
};
var readTime = (iterator, version) => {
  if (version === 1) {
    return Number(iterator.getUint64());
  }
  return iterator.getUint32();
};
var readMoofOffset = (iterator, version) => {
  if (version === 1) {
    return Number(iterator.getUint64());
  }
  return iterator.getUint32();
};
var parseTfraBox = ({
  iterator,
  size,
  offset
}) => {
  const box = iterator.startBox(size - 8);
  const version = iterator.getUint8();
  iterator.discard(3);
  const trackId = iterator.getUint32();
  iterator.getUint24();
  const tmpByte = iterator.getUint8();
  const lengthSizeOfTrafNum = tmpByte >> 4 & 3;
  const lengthSizeOfTrunNum = tmpByte >> 2 & 3;
  const lengthSizeOfSampleNum = tmpByte & 3;
  const numberOfEntries = iterator.getUint32();
  const entries = [];
  for (let i = 0;i < numberOfEntries; i++) {
    const time = readTime(iterator, version);
    const moofOffset = readMoofOffset(iterator, version);
    const trafNumber = readTrafNumber(iterator, lengthSizeOfTrafNum);
    const trunNumber = readTrunNumber(iterator, lengthSizeOfTrunNum);
    const sampleNumber = readSampleNumber(iterator, lengthSizeOfSampleNum);
    entries.push({
      time,
      moofOffset,
      trafNumber,
      trunNumber,
      sampleNumber
    });
  }
  box.expectNoMoreBytes();
  return {
    offset,
    boxSize: size,
    type: "tfra-box",
    entries,
    trackId
  };
};

// src/containers/iso-base-media/moov/moov.ts
var parseMoov = async ({
  offset,
  size,
  onlyIfMoovAtomExpected,
  iterator,
  logLevel,
  contentLength
}) => {
  const children = await getIsoBaseMediaChildren({
    onlyIfMoovAtomExpected,
    size: size - 8,
    iterator,
    logLevel,
    contentLength
  });
  return {
    offset,
    boxSize: size,
    type: "moov-box",
    children
  };
};

// src/containers/iso-base-media/to-date.ts
var toUnixTimestamp = (value) => {
  if (value === 0) {
    return null;
  }
  const baseDate = new Date("1904-01-01T00:00:00Z");
  return Math.floor(value + baseDate.getTime() / 1000) * 1000;
};

// src/containers/iso-base-media/moov/mvhd.ts
var parseMvhd = ({
  iterator,
  offset,
  size
}) => {
  const version = iterator.getUint8();
  iterator.discard(3);
  const creationTime = version === 1 ? iterator.getUint64() : iterator.getUint32();
  const modificationTime = version === 1 ? iterator.getUint64() : iterator.getUint32();
  const timeScale = iterator.getUint32();
  const durationInUnits = version === 1 ? iterator.getUint64() : iterator.getUint32();
  const durationInSeconds = Number(durationInUnits) / timeScale;
  const rateArray = iterator.getSlice(4);
  const rateView = getArrayBufferIterator({
    initialData: rateArray,
    maxBytes: rateArray.length,
    logLevel: "error"
  });
  const rate = rateView.getInt8() * 10 + rateView.getInt8() + rateView.getInt8() * 0.1 + rateView.getInt8() * 0.01;
  const volumeArray = iterator.getSlice(2);
  const volumeView = getArrayBufferIterator({
    initialData: volumeArray,
    maxBytes: volumeArray.length,
    logLevel: "error"
  });
  const volume = volumeView.getInt8() + volumeView.getInt8() * 0.1;
  iterator.discard(2);
  iterator.discard(4);
  iterator.discard(4);
  const matrix = [
    iterator.getFixedPointSigned1616Number(),
    iterator.getFixedPointSigned1616Number(),
    iterator.getFixedPointSigned230Number(),
    iterator.getFixedPointSigned1616Number(),
    iterator.getFixedPointSigned1616Number(),
    iterator.getFixedPointSigned230Number(),
    iterator.getFixedPointSigned1616Number(),
    iterator.getFixedPointSigned1616Number(),
    iterator.getFixedPointSigned230Number()
  ];
  iterator.discard(4 * 6);
  const nextTrackId = iterator.getUint32();
  volumeView.destroy();
  const bytesRemaining = size - (iterator.counter.getOffset() - offset);
  if (bytesRemaining !== 0) {
    throw new Error("expected 0 bytes " + bytesRemaining);
  }
  return {
    creationTime: toUnixTimestamp(Number(creationTime)),
    modificationTime: toUnixTimestamp(Number(modificationTime)),
    timeScale,
    durationInUnits: Number(durationInUnits),
    durationInSeconds,
    rate,
    volume,
    matrix,
    nextTrackId,
    type: "mvhd-box",
    boxSize: size,
    offset
  };
};

// src/containers/iso-base-media/moov/trex.ts
var parseTrex = ({
  iterator,
  offset,
  size
}) => {
  const box = iterator.startBox(size - 8);
  const version = iterator.getUint8();
  iterator.discard(3);
  const trackId = iterator.getUint32();
  const defaultSampleDescriptionIndex = iterator.getUint32();
  const defaultSampleDuration = iterator.getUint32();
  const defaultSampleSize = iterator.getUint32();
  const defaultSampleFlags = iterator.getUint32();
  box.expectNoMoreBytes();
  return {
    type: "trex-box",
    boxSize: size,
    offset,
    trackId,
    version,
    defaultSampleDescriptionIndex,
    defaultSampleDuration,
    defaultSampleSize,
    defaultSampleFlags
  };
};

// src/containers/iso-base-media/stsd/av1c.ts
var parseAv1C = ({
  data,
  size
}) => {
  return {
    type: "av1C-box",
    privateData: data.getSlice(size - 8)
  };
};

// src/containers/iso-base-media/stsd/avcc.ts
var parseAvcc = ({
  data,
  size
}) => {
  const confVersion = data.getUint8();
  if (confVersion !== 1) {
    throw new Error(`Unsupported AVCC version ${confVersion}`);
  }
  const profile = data.getUint8();
  const profileCompatibility = data.getUint8();
  const level = data.getUint8();
  const str = `${profile.toString(16).padStart(2, "0")}${profileCompatibility.toString(16).padStart(2, "0")}${level.toString(16).padStart(2, "0")}`;
  data.counter.decrement(4);
  const privateData = data.getSlice(size - 8);
  return {
    type: "avcc-box",
    privateData,
    configurationString: str
  };
};

// src/containers/iso-base-media/parse-icc-profile.ts
var parseIccProfile = (data) => {
  const iterator = getArrayBufferIterator({
    initialData: data,
    maxBytes: data.length,
    logLevel: "error"
  });
  const size = iterator.getUint32();
  if (size !== data.length) {
    throw new Error("Invalid ICC profile size");
  }
  const preferredCMMType = iterator.getByteString(4, false);
  const profileVersion = iterator.getByteString(4, false);
  const profileDeviceClass = iterator.getByteString(4, false);
  const colorSpace = iterator.getByteString(4, false);
  const pcs = iterator.getByteString(4, false);
  const dateTime = iterator.getSlice(12);
  const signature = iterator.getByteString(4, false);
  if (signature !== "acsp") {
    throw new Error("Invalid ICC profile signature");
  }
  const primaryPlatform = iterator.getByteString(4, false);
  const profileFlags = iterator.getUint32();
  const deviceManufacturer = iterator.getByteString(4, false);
  const deviceModel = iterator.getByteString(4, false);
  const deviceAttributes = iterator.getUint64();
  const renderingIntent = iterator.getUint32();
  const pcsIlluminant1 = iterator.getUint32();
  const pcsIlluminant2 = iterator.getUint32();
  const pcsIlluminant3 = iterator.getUint32();
  const profileCreator = iterator.getByteString(4, false);
  const profileId = iterator.getByteString(16, false);
  iterator.discard(28);
  const tagCount = iterator.getUint32();
  const entries = [];
  for (let i = 0;i < tagCount; i++) {
    const entry = {
      tag: iterator.getByteString(4, false),
      offset: iterator.getUint32(),
      size: iterator.getUint32()
    };
    entries.push(entry);
  }
  let lastOffset = -1;
  let rXYZ = null;
  let gXYZ = null;
  let bXYZ = null;
  let whitePoint = null;
  for (const entry of entries) {
    const found = data.slice(entry.offset, entry.offset + entry.size);
    if (entry.tag === "rXYZ" || entry.tag === "gXYZ" || entry.tag === "bXYZ" || entry.tag === "wtpt") {
      const it = getArrayBufferIterator({
        initialData: found,
        maxBytes: found.length,
        logLevel: "error"
      });
      it.discard(4);
      const x = it.getInt32() / 65536;
      const y = it.getInt32() / 65536;
      const z = it.getInt32() / 65536;
      it.destroy();
      const point = { x, y, z };
      if (entry.tag === "rXYZ") {
        rXYZ = point;
      } else if (entry.tag === "gXYZ") {
        gXYZ = point;
      } else if (entry.tag === "bXYZ") {
        bXYZ = point;
      } else if (entry.tag === "wtpt") {
        whitePoint = point;
      }
    }
    if (lastOffset !== -1) {
      const bytesToAdvance = entry.offset - lastOffset;
      const bytesToGoBackwards = entry.size - bytesToAdvance;
      if (bytesToGoBackwards > 0) {
        iterator.counter.decrement(bytesToGoBackwards);
      }
    }
    lastOffset = entry.offset;
  }
  const profile = {
    size,
    preferredCMMType,
    profileVersion,
    profileDeviceClass,
    colorSpace,
    pcs,
    dateTime,
    signature,
    primaryPlatform,
    profileFlags,
    deviceManufacturer,
    deviceModel,
    deviceAttributes,
    renderingIntent,
    pcsIlluminant: [
      pcsIlluminant1 / 65536,
      pcsIlluminant2 / 65536,
      pcsIlluminant3 / 65536
    ],
    profileCreator,
    profileId,
    entries,
    bXYZ,
    gXYZ,
    rXYZ,
    whitePoint
  };
  iterator.destroy();
  return profile;
};

// src/containers/iso-base-media/stsd/colr.ts
var parseColorParameterBox = ({
  iterator,
  size
}) => {
  const byteString = iterator.getByteString(4, false);
  if (byteString === "nclx") {
    const primaries2 = iterator.getUint16();
    const transfer = iterator.getUint16();
    const matrixIndex = iterator.getUint16();
    iterator.startReadingBits();
    const fullRangeFlag = Boolean(iterator.getBits(1));
    iterator.stopReadingBits();
    return {
      type: "colr-box",
      colorType: "transfer-characteristics",
      fullRangeFlag,
      matrixIndex,
      primaries: primaries2,
      transfer
    };
  }
  if (byteString === "nclc") {
    const primaries2 = iterator.getUint16();
    const transfer = iterator.getUint16();
    const matrixIndex = iterator.getUint16();
    return {
      type: "colr-box",
      colorType: "transfer-characteristics",
      fullRangeFlag: false,
      matrixIndex,
      primaries: primaries2,
      transfer
    };
  }
  if (byteString === "prof") {
    const profile = iterator.getSlice(size - 12);
    return {
      type: "colr-box",
      colorType: "icc-profile",
      profile,
      parsed: parseIccProfile(profile)
    };
  }
  throw new Error("Unexpected box type " + byteString);
};

// src/containers/iso-base-media/stsd/ctts.ts
var parseCtts = ({
  iterator,
  offset,
  size
}) => {
  const version = iterator.getUint8();
  if (version !== 0 && version !== 1) {
    throw new Error(`Unsupported CTTS version ${version}`);
  }
  const flags = iterator.getSlice(3);
  const entryCount = iterator.getUint32();
  const entries = [];
  for (let i = 0;i < entryCount; i++) {
    const sampleCount = iterator.getUint32();
    const sampleOffset = iterator.getInt32();
    entries.push({
      sampleCount,
      sampleOffset
    });
  }
  return {
    type: "ctts-box",
    boxSize: size,
    offset,
    version,
    flags: [...flags],
    entryCount,
    entries
  };
};

// src/containers/iso-base-media/stsd/hvcc.ts
var parseHvcc = ({
  data,
  size,
  offset
}) => {
  const privateData = data.getSlice(size - 8);
  data.counter.decrement(size - 8);
  const constraintString = getHvc1CodecString(data);
  const remaining = size - (data.counter.getOffset() - offset);
  data.discard(remaining);
  return {
    type: "hvcc-box",
    privateData,
    configurationString: constraintString
  };
};

// src/containers/iso-base-media/stsd/keys.ts
var parseKeys = ({
  iterator,
  offset,
  size
}) => {
  const box = iterator.startBox(size - 8);
  const version = iterator.getUint8();
  iterator.discard(3);
  const entryCount = iterator.getUint32();
  const entries = [];
  for (let i = 0;i < entryCount; i++) {
    const keySize = iterator.getUint32();
    const namespace = iterator.getAtom();
    const value = iterator.getByteString(keySize - 8, false);
    const entry = {
      keySize,
      namespace,
      value
    };
    entries.push(entry);
  }
  box.discardRest();
  return {
    type: "keys-box",
    boxSize: size,
    offset,
    version,
    entryCount,
    entries
  };
};

// src/containers/iso-base-media/stsd/mebx.ts
var parseMebx = async ({
  offset,
  size,
  iterator,
  logLevel,
  contentLength
}) => {
  iterator.discard(6);
  const dataReferenceIndex = iterator.getUint16();
  const children = await getIsoBaseMediaChildren({
    iterator,
    size: size - 8,
    logLevel,
    onlyIfMoovAtomExpected: null,
    contentLength
  });
  return {
    type: "mebx-box",
    boxSize: size,
    offset,
    dataReferenceIndex,
    format: "mebx",
    children
  };
};

// src/containers/iso-base-media/stsd/pasp.ts
var parsePasp = ({
  iterator,
  offset,
  size
}) => {
  const hSpacing = iterator.getUint32();
  const vSpacing = iterator.getUint32();
  const bytesRemainingInBox = size - (iterator.counter.getOffset() - offset);
  iterator.discard(bytesRemainingInBox);
  return {
    type: "pasp-box",
    boxSize: size,
    offset,
    hSpacing,
    vSpacing
  };
};

// src/containers/iso-base-media/stsd/stco.ts
var parseStco = ({
  iterator,
  offset,
  size,
  mode64Bit
}) => {
  const version = iterator.getUint8();
  if (version !== 0) {
    throw new Error(`Unsupported STSD version ${version}`);
  }
  const flags = iterator.getSlice(3);
  const entryCount = iterator.getUint32();
  const entries = [];
  for (let i = 0;i < entryCount; i++) {
    const bytesRemaining = size - (iterator.counter.getOffset() - offset);
    if (bytesRemaining < 4) {
      break;
    }
    entries.push(mode64Bit ? iterator.getUint64() : iterator.getUint32());
  }
  iterator.discard(size - (iterator.counter.getOffset() - offset));
  return {
    type: "stco-box",
    boxSize: size,
    offset,
    version,
    flags: [...flags],
    entries,
    entryCount
  };
};

// src/containers/iso-base-media/stsd/stsc.ts
var parseStsc = ({
  iterator,
  offset,
  size
}) => {
  const version = iterator.getUint8();
  if (version !== 0) {
    throw new Error(`Unsupported STSD version ${version}`);
  }
  const flags = iterator.getSlice(3);
  const entryCount = iterator.getUint32();
  const entries = new Map;
  for (let i = 0;i < entryCount; i++) {
    const firstChunk = iterator.getUint32();
    const samplesPerChunk = iterator.getUint32();
    const sampleDescriptionIndex = iterator.getUint32();
    if (sampleDescriptionIndex !== 1) {
      throw new Error(`Expected sampleDescriptionIndex to be 1, but got ${sampleDescriptionIndex}`);
    }
    entries.set(firstChunk, samplesPerChunk);
  }
  return {
    type: "stsc-box",
    boxSize: size,
    offset,
    version,
    flags: [...flags],
    entryCount,
    entries
  };
};

// src/containers/iso-base-media/stsd/samples.ts
var videoTags = [
  "cvid",
  "jpeg",
  "smc ",
  "rle ",
  "rpza",
  "kpcd",
  "png ",
  "mjpa",
  "mjpb",
  "SVQ1",
  "SVQ3",
  "mp4v",
  "avc1",
  "dvc ",
  "dvcp",
  "gif ",
  "h263",
  "tiff",
  "raw ",
  "2vuY",
  "yuv2",
  "v308",
  "v408",
  "v216",
  "v410",
  "v210",
  "hvc1",
  "hev1",
  "ap4h",
  "av01",
  "vp08",
  "vp09"
];
var audioTags = [
  0,
  "NONE",
  "raw ",
  "twos",
  "sowt",
  "MAC3 ",
  "MAC6 ",
  "ima4",
  "fl32",
  "lpcm",
  "fl64",
  "in24",
  "in32",
  "ulaw",
  "alaw",
  1836253186,
  1836253201,
  "dvca",
  "QDMC",
  "QDM2",
  "Qclp",
  1836253269,
  ".mp3",
  "mp4a",
  "ac-3",
  "Opus"
];
var processIsoFormatBox = async ({
  iterator,
  logLevel,
  contentLength
}) => {
  const fileOffset = iterator.counter.getOffset();
  const bytesRemaining = iterator.bytesRemaining();
  const boxSize = iterator.getUint32();
  if (bytesRemaining < boxSize) {
    throw new Error(`Expected box size of ${bytesRemaining}, got ${boxSize}`);
  }
  const boxFormat = iterator.getAtom();
  const isVideo = videoTags.includes(boxFormat);
  const isAudio = audioTags.includes(boxFormat) || audioTags.includes(Number(boxFormat));
  iterator.discard(6);
  const dataReferenceIndex = iterator.getUint16();
  if (!isVideo && !isAudio) {
    const bytesRemainingInBox = boxSize - (iterator.counter.getOffset() - fileOffset);
    iterator.discard(bytesRemainingInBox);
    return {
      sample: {
        type: "unknown",
        offset: fileOffset,
        dataReferenceIndex,
        size: boxSize,
        format: boxFormat
      }
    };
  }
  if (isAudio) {
    const version = iterator.getUint16();
    const revisionLevel = iterator.getUint16();
    const vendor = iterator.getSlice(4);
    if (version === 0) {
      const numberOfChannels = iterator.getUint16();
      const sampleSize = iterator.getUint16();
      const compressionId = iterator.getUint16();
      const packetSize = iterator.getUint16();
      const sampleRate = iterator.getFixedPointUnsigned1616Number();
      const children = await getIsoBaseMediaChildren({
        iterator,
        logLevel,
        size: boxSize - (iterator.counter.getOffset() - fileOffset),
        onlyIfMoovAtomExpected: null,
        contentLength
      });
      return {
        sample: {
          format: boxFormat,
          offset: fileOffset,
          dataReferenceIndex,
          version,
          revisionLevel,
          vendor: [...Array.from(new Uint8Array(vendor))],
          size: boxSize,
          type: "audio",
          numberOfChannels,
          sampleSize,
          compressionId,
          packetSize,
          sampleRate,
          samplesPerPacket: null,
          bytesPerPacket: null,
          bytesPerFrame: null,
          bitsPerSample: null,
          children
        }
      };
    }
    if (version === 1) {
      const numberOfChannels = iterator.getUint16();
      const sampleSize = iterator.getUint16();
      const compressionId = iterator.getInt16();
      const packetSize = iterator.getUint16();
      const sampleRate = iterator.getFixedPointUnsigned1616Number();
      const samplesPerPacket = iterator.getUint32();
      const bytesPerPacket = iterator.getUint32();
      const bytesPerFrame = iterator.getUint32();
      const bytesPerSample = iterator.getUint32();
      const children = await getIsoBaseMediaChildren({
        iterator,
        logLevel,
        size: boxSize - (iterator.counter.getOffset() - fileOffset),
        onlyIfMoovAtomExpected: null,
        contentLength
      });
      return {
        sample: {
          format: boxFormat,
          offset: fileOffset,
          dataReferenceIndex,
          version,
          revisionLevel,
          vendor: [...Array.from(new Uint8Array(vendor))],
          size: boxSize,
          type: "audio",
          numberOfChannels,
          sampleSize,
          compressionId,
          packetSize,
          sampleRate,
          samplesPerPacket,
          bytesPerPacket,
          bytesPerFrame,
          bitsPerSample: bytesPerSample,
          children
        }
      };
    }
    if (version === 2) {
      iterator.getUint16();
      const sampleSize = iterator.getUint16();
      const compressionId = iterator.getUint16();
      const packetSize = iterator.getUint16();
      iterator.getFixedPointUnsigned1616Number();
      iterator.getUint32();
      const higherSampleRate = iterator.getFloat64();
      const numAudioChannel = iterator.getUint32();
      iterator.getUint32();
      const bitsPerChannel = iterator.getUint32();
      iterator.getUint32();
      const bytesPerFrame = iterator.getUint32();
      const samplesPerPacket = iterator.getUint32();
      const children = await getIsoBaseMediaChildren({
        iterator,
        logLevel,
        size: boxSize - (iterator.counter.getOffset() - fileOffset),
        onlyIfMoovAtomExpected: null,
        contentLength
      });
      return {
        sample: {
          format: boxFormat,
          offset: fileOffset,
          dataReferenceIndex,
          version,
          revisionLevel,
          vendor: [...Array.from(new Uint8Array(vendor))],
          size: boxSize,
          type: "audio",
          numberOfChannels: numAudioChannel,
          sampleSize,
          compressionId,
          packetSize,
          sampleRate: higherSampleRate,
          samplesPerPacket,
          bytesPerPacket: null,
          bytesPerFrame,
          bitsPerSample: bitsPerChannel,
          children
        }
      };
    }
    throw new Error(`Unsupported version ${version}`);
  }
  if (isVideo) {
    const version = iterator.getUint16();
    const revisionLevel = iterator.getUint16();
    const vendor = iterator.getSlice(4);
    const temporalQuality = iterator.getUint32();
    const spacialQuality = iterator.getUint32();
    const width = iterator.getUint16();
    const height = iterator.getUint16();
    const horizontalResolution = iterator.getFixedPointUnsigned1616Number();
    const verticalResolution = iterator.getFixedPointUnsigned1616Number();
    const dataSize = iterator.getUint32();
    const frameCountPerSample = iterator.getUint16();
    const compressorName = iterator.getPascalString();
    const depth = iterator.getUint16();
    const colorTableId = iterator.getInt16();
    const bytesRemainingInBox = boxSize - (iterator.counter.getOffset() - fileOffset);
    const children = bytesRemainingInBox > 8 ? await getIsoBaseMediaChildren({
      onlyIfMoovAtomExpected: null,
      iterator,
      logLevel,
      size: bytesRemainingInBox,
      contentLength
    }) : (iterator.discard(bytesRemainingInBox), []);
    return {
      sample: {
        format: boxFormat,
        offset: fileOffset,
        dataReferenceIndex,
        version,
        revisionLevel,
        vendor: [...Array.from(new Uint8Array(vendor))],
        size: boxSize,
        type: "video",
        width,
        height,
        horizontalResolutionPpi: horizontalResolution,
        verticalResolutionPpi: verticalResolution,
        spacialQuality,
        temporalQuality,
        dataSize,
        frameCountPerSample,
        compressorName,
        depth,
        colorTableId,
        descriptors: children
      }
    };
  }
  throw new Error(`Unknown sample format ${boxFormat}`);
};
var parseIsoFormatBoxes = async ({
  maxBytes,
  logLevel,
  iterator,
  contentLength
}) => {
  const samples = [];
  const initialOffset = iterator.counter.getOffset();
  while (iterator.bytesRemaining() > 0 && iterator.counter.getOffset() - initialOffset < maxBytes) {
    const { sample } = await processIsoFormatBox({
      iterator,
      logLevel,
      contentLength
    });
    if (sample) {
      samples.push(sample);
    }
  }
  return samples;
};

// src/containers/iso-base-media/stsd/stsd.ts
var parseStsd = async ({
  offset,
  size,
  iterator,
  logLevel,
  contentLength
}) => {
  const version = iterator.getUint8();
  if (version !== 0) {
    throw new Error(`Unsupported STSD version ${version}`);
  }
  iterator.discard(3);
  const numberOfEntries = iterator.getUint32();
  const bytesRemainingInBox = size - (iterator.counter.getOffset() - offset);
  const boxes = await parseIsoFormatBoxes({
    maxBytes: bytesRemainingInBox,
    logLevel,
    iterator,
    contentLength
  });
  if (boxes.length !== numberOfEntries) {
    throw new Error(`Expected ${numberOfEntries} sample descriptions, got ${boxes.length}`);
  }
  return {
    type: "stsd-box",
    boxSize: size,
    offset,
    numberOfEntries,
    samples: boxes
  };
};

// src/containers/iso-base-media/stsd/stss.ts
var parseStss = ({
  iterator,
  offset,
  boxSize
}) => {
  const version = iterator.getUint8();
  if (version !== 0) {
    throw new Error(`Unsupported STSS version ${version}`);
  }
  const flags = iterator.getSlice(3);
  const sampleCount = iterator.getUint32();
  const sampleNumber = new Set;
  for (let i = 0;i < sampleCount; i++) {
    sampleNumber.add(iterator.getUint32());
  }
  const bytesRemainingInBox = boxSize - (iterator.counter.getOffset() - offset);
  if (bytesRemainingInBox > 0) {
    iterator.discard(bytesRemainingInBox);
  }
  return {
    type: "stss-box",
    version,
    flags: [...flags],
    sampleNumber,
    boxSize,
    offset
  };
};

// src/containers/iso-base-media/stsd/stsz.ts
var parseStsz = ({
  iterator,
  offset,
  size
}) => {
  const version = iterator.getUint8();
  if (version !== 0) {
    throw new Error(`Unsupported STSD version ${version}`);
  }
  const flags = iterator.getSlice(3);
  const sampleSize = iterator.getUint32();
  const sampleCount = iterator.getUint32();
  if (sampleSize !== 0) {
    return {
      type: "stsz-box",
      boxSize: size,
      offset,
      version,
      flags: [...flags],
      sampleCount,
      countType: "fixed",
      sampleSize
    };
  }
  const samples = [];
  for (let i = 0;i < sampleCount; i++) {
    const bytesRemaining = size - (iterator.counter.getOffset() - offset);
    if (bytesRemaining < 4) {
      break;
    }
    samples.push(iterator.getUint32());
  }
  iterator.discard(size - (iterator.counter.getOffset() - offset));
  return {
    type: "stsz-box",
    boxSize: size,
    offset,
    version,
    flags: [...flags],
    sampleCount,
    countType: "variable",
    entries: samples
  };
};

// src/containers/iso-base-media/stsd/stts.ts
var parseStts = ({
  data,
  size,
  fileOffset
}) => {
  const initialOffset = data.counter.getOffset();
  const initialCounter = initialOffset - fileOffset;
  const version = data.getUint8();
  if (version !== 0) {
    throw new Error(`Unsupported STTS version ${version}`);
  }
  data.discard(3);
  const entryCount = data.getUint32();
  const sampleDistributions = [];
  for (let i = 0;i < entryCount; i++) {
    const sampleCount = data.getUint32();
    const sampleDelta = data.getUint32();
    const sampleDistribution = {
      sampleCount,
      sampleDelta
    };
    sampleDistributions.push(sampleDistribution);
  }
  const bytesUsed = data.counter.getOffset() - initialOffset + initialCounter;
  if (bytesUsed !== size) {
    throw new Error(`Expected stts box to be ${size} bytes, but was ${bytesUsed} bytes`);
  }
  return {
    type: "stts-box",
    sampleDistribution: sampleDistributions
  };
};

// src/containers/iso-base-media/stsd/vpcc.ts
var getvp09ConfigurationString = ({
  profile,
  level,
  bitDepth: bitDepth2
}) => {
  return `${String(profile).padStart(2, "0")}.${String(level).padStart(2, "0")}.${String(bitDepth2).padStart(2, "0")}`;
};
var parseVpcc = ({
  data,
  size
}) => {
  const box = data.startBox(size - 8);
  const confVersion = data.getUint8();
  if (confVersion !== 1) {
    throw new Error(`Unsupported AVCC version ${confVersion}`);
  }
  data.discard(3);
  const profile = data.getUint8();
  const level = data.getUint8();
  data.startReadingBits();
  const bitDepth2 = data.getBits(4);
  const chromaSubsampling = data.getBits(3);
  const videoFullRangeFlag = data.getBits(1);
  const videoColorPrimaries = data.getBits(8);
  const videoTransferCharacteristics = data.getBits(8);
  const videoMatrixCoefficients = data.getBits(8);
  data.stopReadingBits();
  const codecInitializationDataSize = data.getUint16();
  const codecInitializationData = data.getSlice(codecInitializationDataSize);
  box.expectNoMoreBytes();
  return {
    type: "vpcc-box",
    profile,
    level,
    bitDepth: bitDepth2,
    chromaSubsampling,
    videoFullRangeFlag,
    videoColorPrimaries,
    videoTransferCharacteristics,
    videoMatrixCoefficients,
    codecInitializationDataSize,
    codecInitializationData,
    codecString: getvp09ConfigurationString({ profile, level, bitDepth: bitDepth2 })
  };
};

// src/containers/iso-base-media/tfdt.ts
var parseTfdt = ({
  iterator,
  size,
  offset
}) => {
  const version = iterator.getUint8();
  iterator.discard(3);
  const num = version === 0 ? iterator.getUint32() : Number(iterator.getUint64());
  const bytesRemaining = size - (iterator.counter.getOffset() - offset);
  if (bytesRemaining !== 0) {
    throw new Error("expected 0 bytes " + bytesRemaining);
  }
  return {
    type: "tfdt-box",
    version,
    baseMediaDecodeTime: num,
    offset
  };
};

// src/containers/iso-base-media/tfhd.ts
var getTfhd = ({
  iterator,
  offset,
  size
}) => {
  const version = iterator.getUint8();
  const flags = iterator.getUint24();
  const trackId = iterator.getUint32();
  const baseDataOffsetPresent = flags & 1;
  const baseDataOffset = baseDataOffsetPresent ? Number(iterator.getUint64()) : 0;
  const baseSampleDescriptionIndexPresent = flags & 2;
  const baseSampleDescriptionIndex = baseSampleDescriptionIndexPresent ? iterator.getUint32() : 0;
  const defaultSampleDurationPresent = flags & 8;
  const defaultSampleDuration = defaultSampleDurationPresent ? iterator.getUint32() : 0;
  const defaultSampleSizePresent = flags & 16;
  const defaultSampleSize = defaultSampleSizePresent ? iterator.getUint32() : 0;
  const defaultSampleFlagsPresent = flags & 32;
  const defaultSampleFlags = defaultSampleFlagsPresent ? iterator.getUint32() : 0;
  const bytesRemaining = size - (iterator.counter.getOffset() - offset);
  if (bytesRemaining !== 0) {
    throw new Error("expected 0 bytes " + bytesRemaining);
  }
  return {
    type: "tfhd-box",
    version,
    trackId,
    baseDataOffset,
    baseSampleDescriptionIndex,
    defaultSampleDuration,
    defaultSampleSize,
    defaultSampleFlags
  };
};

// src/containers/iso-base-media/tkhd.ts
function getRotationAngleFromMatrix(matrix) {
  const [a, b, c, d] = matrix;
  if (a === 0 && b === 0 && c === 0 && d === 0) {
    return 0;
  }
  if (Math.round(a * a + b * b) !== 1 || Math.round(c * c + d * d) !== 1) {
    throw new Error("The provided matrix is not a valid rotation matrix.");
  }
  const angleRadians = Math.atan2(c, a);
  const angleDegrees = angleRadians * (180 / Math.PI);
  return angleDegrees;
}
var applyRotation = ({
  matrix,
  width,
  height
}) => {
  const newWidth = matrix[0] * width + matrix[1] * height;
  const newHeight = matrix[2] * width + matrix[3] * height;
  return {
    width: Math.abs(newWidth),
    height: Math.abs(newHeight)
  };
};
var parseTkhd = ({
  iterator,
  offset,
  size
}) => {
  const version = iterator.getUint8();
  iterator.discard(3);
  const creationTime = version === 1 ? iterator.getUint64() : iterator.getUint32();
  const modificationTime = version === 1 ? iterator.getUint64() : iterator.getUint32();
  const trackId = iterator.getUint32();
  iterator.discard(4);
  const duration2 = version === 1 ? iterator.getUint64() : iterator.getUint32();
  iterator.discard(4);
  iterator.discard(4);
  const layer = iterator.getUint16();
  const alternateGroup = iterator.getUint16();
  const volume = iterator.getUint16();
  iterator.discard(2);
  const matrix = [
    iterator.getFixedPointSigned1616Number(),
    iterator.getFixedPointSigned1616Number(),
    iterator.getFixedPointSigned230Number(),
    iterator.getFixedPointSigned1616Number(),
    iterator.getFixedPointSigned1616Number(),
    iterator.getFixedPointSigned230Number(),
    iterator.getFixedPointSigned1616Number(),
    iterator.getFixedPointSigned1616Number(),
    iterator.getFixedPointSigned230Number()
  ];
  const rotationMatrix = [matrix[0], matrix[1], matrix[3], matrix[4]];
  const widthWithoutRotationApplied = iterator.getFixedPointUnsigned1616Number();
  const heightWithoutRotationApplied = iterator.getFixedPointSigned1616Number();
  const { width, height } = applyRotation({
    matrix: rotationMatrix,
    width: widthWithoutRotationApplied,
    height: heightWithoutRotationApplied
  });
  const rotation = getRotationAngleFromMatrix(rotationMatrix);
  return {
    offset,
    boxSize: size,
    type: "tkhd-box",
    creationTime: toUnixTimestamp(Number(creationTime)),
    modificationTime: toUnixTimestamp(Number(modificationTime)),
    trackId,
    duration: Number(duration2),
    layer,
    alternateGroup,
    volume,
    matrix,
    width,
    height,
    version,
    rotation,
    unrotatedWidth: widthWithoutRotationApplied,
    unrotatedHeight: heightWithoutRotationApplied
  };
};

// src/containers/iso-base-media/trak/trak.ts
var parseTrak = async ({
  size,
  offsetAtStart,
  iterator,
  logLevel,
  contentLength
}) => {
  const children = await getIsoBaseMediaChildren({
    onlyIfMoovAtomExpected: null,
    size: size - 8,
    iterator,
    logLevel,
    contentLength
  });
  return {
    offset: offsetAtStart,
    boxSize: size,
    type: "trak-box",
    children
  };
};

// src/containers/iso-base-media/trun.ts
var parseTrun = ({
  iterator,
  offset,
  size
}) => {
  const version = iterator.getUint8();
  if (version !== 0 && version !== 1) {
    throw new Error(`Unsupported TRUN version ${version}`);
  }
  const flags = iterator.getUint24();
  const sampleCount = iterator.getUint32();
  const dataOffset = flags & 1 ? iterator.getInt32() : null;
  const firstSampleFlags = flags & 4 ? iterator.getUint32() : null;
  const samples = [];
  for (let i = 0;i < sampleCount; i++) {
    const sampleDuration = flags & 256 ? iterator.getUint32() : null;
    const sampleSize = flags & 512 ? iterator.getUint32() : null;
    const sampleFlags = flags & 1024 ? iterator.getUint32() : null;
    const sampleCompositionTimeOffset = flags & 2048 ? version === 0 ? iterator.getUint32() : iterator.getInt32() : null;
    samples.push({
      sampleDuration,
      sampleSize,
      sampleFlags,
      sampleCompositionTimeOffset
    });
  }
  const currentOffset = iterator.counter.getOffset();
  const left = size - (currentOffset - offset);
  if (left !== 0) {
    throw new Error(`Unexpected data left in TRUN box: ${left}`);
  }
  return {
    type: "trun-box",
    version,
    sampleCount,
    dataOffset,
    firstSampleFlags,
    samples
  };
};

// src/containers/iso-base-media/process-box.ts
var processBox = async ({
  iterator,
  logLevel,
  onlyIfMoovAtomExpected,
  onlyIfMdatAtomExpected,
  contentLength
}) => {
  const fileOffset = iterator.counter.getOffset();
  const { returnToCheckpoint } = iterator.startCheckpoint();
  const bytesRemaining = iterator.bytesRemaining();
  const startOff = iterator.counter.getOffset();
  const boxSizeRaw = iterator.getFourByteNumber();
  if (boxSizeRaw === 0) {
    return {
      type: "box",
      box: {
        type: "void-box",
        boxSize: 0
      }
    };
  }
  if (boxSizeRaw === 1 && iterator.bytesRemaining() < 12 || iterator.bytesRemaining() < 4) {
    iterator.counter.decrement(iterator.counter.getOffset() - fileOffset);
    throw new Error(`Expected box size of ${bytesRemaining}, got ${boxSizeRaw}. Incomplete boxes are not allowed.`);
  }
  const maxSize = contentLength - startOff;
  const boxType = iterator.getByteString(4, false);
  const boxSizeUnlimited = boxSizeRaw === 1 ? iterator.getEightByteNumber() : boxSizeRaw;
  const boxSize = Math.min(boxSizeUnlimited, maxSize);
  const headerLength = iterator.counter.getOffset() - startOff;
  if (boxType === "mdat") {
    if (!onlyIfMdatAtomExpected) {
      return { type: "nothing" };
    }
    const { mediaSectionState: mediaSectionState2 } = onlyIfMdatAtomExpected;
    mediaSectionState2.addMediaSection({
      size: boxSize - headerLength,
      start: iterator.counter.getOffset()
    });
    return { type: "nothing" };
  }
  if (bytesRemaining < boxSize) {
    returnToCheckpoint();
    return {
      type: "fetch-more-data",
      bytesNeeded: makeFetchMoreData(boxSize - bytesRemaining)
    };
  }
  if (boxType === "ftyp") {
    return {
      type: "box",
      box: parseFtyp({ iterator, size: boxSize, offset: fileOffset })
    };
  }
  if (boxType === "elst") {
    return {
      type: "box",
      box: parseElst({
        iterator,
        size: boxSize,
        offset: fileOffset
      })
    };
  }
  if (boxType === "colr") {
    return {
      type: "box",
      box: parseColorParameterBox({
        iterator,
        size: boxSize
      })
    };
  }
  if (boxType === "mvhd") {
    const mvhdBox = parseMvhd({
      iterator,
      offset: fileOffset,
      size: boxSize
    });
    if (!onlyIfMoovAtomExpected) {
      throw new Error("State is required");
    }
    onlyIfMoovAtomExpected.movieTimeScaleState.setTrackTimescale(mvhdBox.timeScale);
    return {
      type: "box",
      box: mvhdBox
    };
  }
  if (boxType === "tkhd") {
    return {
      type: "box",
      box: parseTkhd({ iterator, offset: fileOffset, size: boxSize })
    };
  }
  if (boxType === "trun") {
    return {
      type: "box",
      box: parseTrun({ iterator, offset: fileOffset, size: boxSize })
    };
  }
  if (boxType === "tfdt") {
    return {
      type: "box",
      box: parseTfdt({ iterator, size: boxSize, offset: fileOffset })
    };
  }
  if (boxType === "stsd") {
    return {
      type: "box",
      box: await parseStsd({
        offset: fileOffset,
        size: boxSize,
        iterator,
        logLevel,
        contentLength
      })
    };
  }
  if (boxType === "stsz") {
    return {
      type: "box",
      box: parseStsz({
        iterator,
        offset: fileOffset,
        size: boxSize
      })
    };
  }
  if (boxType === "stco" || boxType === "co64") {
    return {
      type: "box",
      box: parseStco({
        iterator,
        offset: fileOffset,
        size: boxSize,
        mode64Bit: boxType === "co64"
      })
    };
  }
  if (boxType === "pasp") {
    return {
      type: "box",
      box: parsePasp({
        iterator,
        offset: fileOffset,
        size: boxSize
      })
    };
  }
  if (boxType === "stss") {
    return {
      type: "box",
      box: parseStss({
        iterator,
        offset: fileOffset,
        boxSize
      })
    };
  }
  if (boxType === "ctts") {
    return {
      type: "box",
      box: parseCtts({
        iterator,
        offset: fileOffset,
        size: boxSize
      })
    };
  }
  if (boxType === "stsc") {
    return {
      type: "box",
      box: parseStsc({
        iterator,
        offset: fileOffset,
        size: boxSize
      })
    };
  }
  if (boxType === "mebx") {
    return {
      type: "box",
      box: await parseMebx({
        offset: fileOffset,
        size: boxSize,
        iterator,
        logLevel,
        contentLength
      })
    };
  }
  if (boxType === "hdlr") {
    return {
      type: "box",
      box: await parseHdlr({ iterator, size: boxSize, offset: fileOffset })
    };
  }
  if (boxType === "keys") {
    return {
      type: "box",
      box: await parseKeys({ iterator, size: boxSize, offset: fileOffset })
    };
  }
  if (boxType === "ilst") {
    return {
      type: "box",
      box: await parseIlstBox({
        iterator,
        offset: fileOffset,
        size: boxSize
      })
    };
  }
  if (boxType === "tfra") {
    return {
      type: "box",
      box: await parseTfraBox({
        iterator,
        offset: fileOffset,
        size: boxSize
      })
    };
  }
  if (boxType === "moov") {
    if (!onlyIfMoovAtomExpected) {
      throw new Error("State is required");
    }
    const { tracks: tracks2, isoState } = onlyIfMoovAtomExpected;
    if (tracks2.hasAllTracks()) {
      iterator.discard(boxSize - 8);
      return { type: "nothing" };
    }
    if (isoState && isoState.moov.getMoovBoxAndPrecomputed() && !isoState.moov.getMoovBoxAndPrecomputed()?.precomputed) {
      Log.verbose(logLevel, "Moov box already parsed, skipping");
      iterator.discard(boxSize - 8);
      return { type: "nothing" };
    }
    const box = await parseMoov({
      offset: fileOffset,
      size: boxSize,
      onlyIfMoovAtomExpected,
      iterator,
      logLevel,
      contentLength
    });
    tracks2.setIsDone(logLevel);
    return { type: "box", box };
  }
  if (boxType === "trak") {
    if (!onlyIfMoovAtomExpected) {
      throw new Error("State is required");
    }
    const { tracks: tracks2, onAudioTrack, onVideoTrack } = onlyIfMoovAtomExpected;
    const trakBox = await parseTrak({
      size: boxSize,
      offsetAtStart: fileOffset,
      iterator,
      logLevel,
      contentLength
    });
    const movieTimeScale = onlyIfMoovAtomExpected.movieTimeScaleState.getTrackTimescale();
    if (movieTimeScale === null) {
      throw new Error("Movie timescale is not set");
    }
    const editList = findTrackStartTimeInSeconds({ movieTimeScale, trakBox });
    const transformedTrack = makeBaseMediaTrack(trakBox, editList);
    if (transformedTrack && transformedTrack.type === "video") {
      await registerVideoTrack({
        track: transformedTrack,
        container: "mp4",
        logLevel,
        onVideoTrack,
        registerVideoSampleCallback: onlyIfMoovAtomExpected.registerVideoSampleCallback,
        tracks: tracks2
      });
    }
    if (transformedTrack && transformedTrack.type === "audio") {
      await registerAudioTrack({
        track: transformedTrack,
        container: "mp4",
        registerAudioSampleCallback: onlyIfMoovAtomExpected.registerAudioSampleCallback,
        tracks: tracks2,
        logLevel,
        onAudioTrack
      });
    }
    return { type: "box", box: trakBox };
  }
  if (boxType === "stts") {
    return {
      type: "box",
      box: parseStts({
        data: iterator,
        size: boxSize,
        fileOffset
      })
    };
  }
  if (boxType === "avcC") {
    return {
      type: "box",
      box: parseAvcc({
        data: iterator,
        size: boxSize
      })
    };
  }
  if (boxType === "vpcC") {
    return {
      type: "box",
      box: parseVpcc({ data: iterator, size: boxSize })
    };
  }
  if (boxType === "av1C") {
    return {
      type: "box",
      box: parseAv1C({
        data: iterator,
        size: boxSize
      })
    };
  }
  if (boxType === "hvcC") {
    return {
      type: "box",
      box: parseHvcc({
        data: iterator,
        size: boxSize,
        offset: fileOffset
      })
    };
  }
  if (boxType === "tfhd") {
    return {
      type: "box",
      box: getTfhd({
        iterator,
        offset: fileOffset,
        size: boxSize
      })
    };
  }
  if (boxType === "mdhd") {
    return {
      type: "box",
      box: parseMdhd({
        data: iterator,
        size: boxSize,
        fileOffset
      })
    };
  }
  if (boxType === "esds") {
    return {
      type: "box",
      box: parseEsds({
        data: iterator,
        size: boxSize,
        fileOffset
      })
    };
  }
  if (boxType === "trex") {
    return {
      type: "box",
      box: parseTrex({ iterator, offset: fileOffset, size: boxSize })
    };
  }
  if (boxType === "moof") {
    await onlyIfMoovAtomExpected?.isoState?.mfra.triggerLoad();
  }
  if (boxType === "mdia" || boxType === "minf" || boxType === "stbl" || boxType === "udta" || boxType === "moof" || boxType === "dims" || boxType === "meta" || boxType === "wave" || boxType === "traf" || boxType === "mfra" || boxType === "edts" || boxType === "mvex" || boxType === "stsb") {
    const children = await getIsoBaseMediaChildren({
      iterator,
      size: boxSize - 8,
      logLevel,
      onlyIfMoovAtomExpected,
      contentLength
    });
    return {
      type: "box",
      box: {
        type: "regular-box",
        boxType,
        boxSize,
        children,
        offset: fileOffset
      }
    };
  }
  iterator.discard(boxSize - 8);
  Log.verbose(logLevel, "Unknown ISO Base Media Box:", boxType);
  return {
    type: "box",
    box: {
      type: "regular-box",
      boxType,
      boxSize,
      children: [],
      offset: fileOffset
    }
  };
};

// src/containers/iso-base-media/get-moov-atom.ts
var getMoovAtom = async ({
  endOfMdat,
  state
}) => {
  const headerSegment = state.m3uPlaylistContext?.mp4HeaderSegment;
  if (headerSegment) {
    const segment = getMoovFromFromIsoStructure(headerSegment);
    if (!segment) {
      throw new Error("No moov box found in header segment");
    }
    return segment;
  }
  const start = Date.now();
  Log.verbose(state.logLevel, "Starting second fetch to get moov atom");
  const { reader } = await state.readerInterface.read({
    src: state.src,
    range: endOfMdat,
    controller: state.controller,
    logLevel: state.logLevel,
    prefetchCache: state.prefetchCache
  });
  const onAudioTrack = state.onAudioTrack ? async ({ track, container }) => {
    await registerAudioTrack({
      track,
      container,
      logLevel: state.logLevel,
      onAudioTrack: state.onAudioTrack,
      registerAudioSampleCallback: state.callbacks.registerAudioSampleCallback,
      tracks: state.callbacks.tracks
    });
    return null;
  } : null;
  const onVideoTrack = state.onVideoTrack ? async ({ track, container }) => {
    await registerVideoTrack({
      track,
      container,
      logLevel: state.logLevel,
      onVideoTrack: state.onVideoTrack,
      registerVideoSampleCallback: state.callbacks.registerVideoSampleCallback,
      tracks: state.callbacks.tracks
    });
    return null;
  } : null;
  const iterator = getArrayBufferIterator({
    initialData: new Uint8Array([]),
    maxBytes: state.contentLength - endOfMdat,
    logLevel: "error"
  });
  while (true) {
    const result = await reader.reader.read();
    if (result.value) {
      iterator.addData(result.value);
    }
    if (result.done) {
      break;
    }
  }
  const boxes = [];
  const canSkipTracksState = makeCanSkipTracksState({
    hasAudioTrackHandlers: false,
    fields: { slowStructure: true },
    hasVideoTrackHandlers: false,
    structure: structureState()
  });
  const tracksState = makeTracksSectionState(canSkipTracksState, state.src);
  while (true) {
    const box = await processBox({
      iterator,
      logLevel: state.logLevel,
      onlyIfMoovAtomExpected: {
        tracks: tracksState,
        isoState: null,
        movieTimeScaleState: state.iso.movieTimeScale,
        onAudioTrack,
        onVideoTrack,
        registerVideoSampleCallback: () => Promise.resolve(),
        registerAudioSampleCallback: () => Promise.resolve()
      },
      onlyIfMdatAtomExpected: null,
      contentLength: state.contentLength - endOfMdat
    });
    if (box.type === "box") {
      boxes.push(box.box);
    }
    if (iterator.counter.getOffset() + endOfMdat > state.contentLength) {
      throw new Error("Read past end of file");
    }
    if (iterator.counter.getOffset() + endOfMdat === state.contentLength) {
      break;
    }
  }
  const moov = boxes.find((b) => b.type === "moov-box");
  if (!moov) {
    throw new Error("No moov box found");
  }
  Log.verbose(state.logLevel, `Finished fetching moov atom in ${Date.now() - start}ms`);
  return moov;
};

// src/containers/iso-base-media/mdat/postprocess-bytes.ts
var postprocessBytes = ({
  bytes,
  bigEndian,
  chunkSize
}) => {
  if (!bigEndian) {
    return bytes;
  }
  if (chunkSize === null) {
    return bytes;
  }
  const newBuffer = new Uint8Array(bytes);
  for (let i = 0;i < newBuffer.length; i += chunkSize) {
    const slice = newBuffer.slice(i, i + chunkSize);
    slice.reverse();
    newBuffer.set(slice, i);
  }
  return newBuffer;
};

// src/containers/iso-base-media/mdat/mdat.ts
var parseMdatSection = async (state) => {
  const mediaSection = getCurrentMediaSection({
    offset: state.iterator.counter.getOffset(),
    mediaSections: state.mediaSection.getMediaSections()
  });
  if (!mediaSection) {
    throw new Error("No video section defined");
  }
  const endOfMdat = mediaSection.size + mediaSection.start;
  if (maySkipVideoData({ state })) {
    const mfra = state.iso.mfra.getIfAlreadyLoaded();
    if (mfra) {
      const lastMoof = getLastMoofBox(mfra);
      if (lastMoof && lastMoof > endOfMdat) {
        Log.verbose(state.logLevel, "Skipping to last moof", lastMoof);
        return makeSkip(lastMoof);
      }
    }
    return makeSkip(endOfMdat);
  }
  if (maySkipOverSamplesInTheMiddle({ state })) {
    const mfra = state.iso.mfra.getIfAlreadyLoaded();
    if (mfra) {
      const lastMoof = getLastMoofBox(mfra);
      const firstMax = getMaxFirstMoofOffset(mfra);
      const mediaSectionsBiggerThanMoof = state.mediaSection.getMediaSections().filter((m) => m.start > firstMax).length;
      if (mediaSectionsBiggerThanMoof > 1 && lastMoof && lastMoof > endOfMdat) {
        Log.verbose(state.logLevel, "Skipping to last moof because only first and last samples are needed");
        return makeSkip(lastMoof);
      }
    }
  }
  const alreadyHasMoov = getHasTracks(state, true);
  if (!alreadyHasMoov) {
    const moov = await getMoovAtom({
      endOfMdat,
      state
    });
    const tracksFromMoov = getTracksFromMoovBox(moov);
    state.iso.moov.setMoovBox({
      moovBox: moov,
      precomputed: false
    });
    const existingTracks = state.callbacks.tracks.getTracks();
    for (const trackFromMoov of tracksFromMoov) {
      if (existingTracks.find((t) => t.trackId === trackFromMoov.trackId)) {
        continue;
      }
      if (trackFromMoov.type === "other") {
        continue;
      }
      state.callbacks.tracks.addTrack(trackFromMoov);
    }
    state.callbacks.tracks.setIsDone(state.logLevel);
    state.structure.getIsoStructure().boxes.push(moov);
    return parseMdatSection(state);
  }
  const tracks2 = state.callbacks.tracks.getTracks();
  if (!state.iso.flatSamples.getSamples(mediaSection.start)) {
    const samplePosition = calculateSamplePositions({
      state,
      mediaSectionStart: mediaSection.start,
      trackIds: tracks2.map((t) => t.trackId)
    });
    state.iso.flatSamples.setSamples(mediaSection.start, samplePosition);
  }
  const samplePositions = state.iso.flatSamples.getSamples(mediaSection.start);
  const sampleIndices = state.iso.flatSamples.getCurrentSampleIndices(mediaSection.start);
  const nextSampleArray = getSampleWithLowestDts(samplePositions, sampleIndices);
  if (nextSampleArray.length === 0) {
    Log.verbose(state.logLevel, "Iterated over all samples.", endOfMdat);
    return makeSkip(endOfMdat);
  }
  const exactMatch = nextSampleArray.find((s) => s.samplePosition.offset === state.iterator.counter.getOffset());
  const nextSample = exactMatch ?? nextSampleArray.sort((a, b) => a.samplePosition.offset - b.samplePosition.offset)[0];
  if (nextSample.samplePosition.offset !== state.iterator.counter.getOffset()) {
    return makeSkip(nextSample.samplePosition.offset);
  }
  if (nextSample.samplePosition.offset + nextSample.samplePosition.size > state.contentLength) {
    Log.verbose(state.logLevel, "Sample is beyond the end of the file. Don't process it.", nextSample.samplePosition.offset + nextSample.samplePosition.size, endOfMdat);
    return makeSkip(endOfMdat);
  }
  const { iterator } = state;
  if (iterator.bytesRemaining() < nextSample.samplePosition.size) {
    return makeFetchMoreData(nextSample.samplePosition.size - iterator.bytesRemaining());
  }
  const {
    timestamp: rawCts,
    decodingTimestamp: rawDts,
    duration: duration2,
    isKeyframe,
    offset,
    bigEndian,
    chunkSize
  } = nextSample.samplePosition;
  const track = tracks2.find((t) => t.trackId === nextSample.trackId);
  const {
    originalTimescale,
    startInSeconds,
    trackMediaTimeOffsetInTrackTimescale,
    timescale: trackTimescale
  } = track;
  const cts = rawCts + startInSeconds * originalTimescale - trackMediaTimeOffsetInTrackTimescale / trackTimescale * WEBCODECS_TIMESCALE;
  const dts = rawDts + startInSeconds * originalTimescale - trackMediaTimeOffsetInTrackTimescale / trackTimescale * WEBCODECS_TIMESCALE;
  const bytes = postprocessBytes({
    bytes: iterator.getSlice(nextSample.samplePosition.size),
    bigEndian,
    chunkSize
  });
  if (track.type === "audio") {
    const audioSample = convertAudioOrVideoSampleToWebCodecsTimestamps({
      sample: {
        data: bytes,
        timestamp: cts,
        duration: duration2,
        decodingTimestamp: dts,
        type: isKeyframe ? "key" : "delta",
        offset
      },
      timescale: originalTimescale
    });
    await state.callbacks.onAudioSample({
      audioSample,
      trackId: track.trackId
    });
  }
  if (track.type === "video") {
    const nalUnitType = bytes[4] & 31;
    let isRecoveryPoint = false;
    if (nalUnitType === 6) {
      const seiType = bytes[5];
      isRecoveryPoint = seiType === 6;
    }
    const videoSample = convertAudioOrVideoSampleToWebCodecsTimestamps({
      sample: {
        data: bytes,
        timestamp: cts,
        duration: duration2,
        decodingTimestamp: dts,
        type: isKeyframe && !isRecoveryPoint ? "key" : "delta",
        offset
      },
      timescale: originalTimescale
    });
    await state.callbacks.onVideoSample({
      videoSample,
      trackId: track.trackId
    });
  }
  state.iso.flatSamples.setCurrentSampleIndex(mediaSection.start, nextSample.trackId, nextSample.index + 1);
  return null;
};

// src/containers/iso-base-media/parse-boxes.ts
var parseIsoBaseMedia = async (state) => {
  const mediaSectionState2 = state.mediaSection.isCurrentByteInMediaSection(state.iterator);
  if (mediaSectionState2 === "in-section") {
    const skipTo = await parseMdatSection(state);
    return skipTo;
  }
  const result = await processBox({
    iterator: state.iterator,
    logLevel: state.logLevel,
    onlyIfMoovAtomExpected: {
      tracks: state.callbacks.tracks,
      isoState: state.iso,
      movieTimeScaleState: state.iso.movieTimeScale,
      onAudioTrack: state.onAudioTrack,
      onVideoTrack: state.onVideoTrack,
      registerAudioSampleCallback: state.callbacks.registerAudioSampleCallback,
      registerVideoSampleCallback: state.callbacks.registerVideoSampleCallback
    },
    onlyIfMdatAtomExpected: {
      mediaSectionState: state.mediaSection
    },
    contentLength: state.contentLength
  });
  if (result.type === "fetch-more-data") {
    return result.bytesNeeded;
  }
  if (result.type === "box") {
    state.structure.getIsoStructure().boxes.push(result.box);
  }
  return null;
};

// src/containers/m3u/parse-stream-inf.ts
function splitRespectingQuotes(input) {
  const result = [];
  let currentPart = "";
  let insideQuote = false;
  for (let i = 0;i < input.length; i++) {
    const char = input[i];
    if (char === '"') {
      insideQuote = !insideQuote;
      currentPart += char;
    } else if (char === "," && !insideQuote) {
      result.push(currentPart);
      currentPart = "";
    } else {
      currentPart += char;
    }
  }
  if (currentPart) {
    result.push(currentPart);
  }
  return result;
}
var parseStreamInf = (str) => {
  const quotes = splitRespectingQuotes(str);
  const map = {};
  for (const quote of quotes) {
    const firstColon = quote.indexOf("=");
    const key = firstColon === -1 ? quote : quote.slice(0, firstColon);
    const value = firstColon === -1 ? null : quote.slice(firstColon + 1);
    if (value === null) {
      throw new Error("Value is null");
    }
    const actualValue = value?.startsWith('"') && value?.endsWith('"') ? value.slice(1, -1) : value;
    map[key] = actualValue;
  }
  return {
    type: "m3u-stream-info",
    averageBandwidthInBitsPerSec: map["AVERAGE-BANDWIDTH"] ? parseInt(map["AVERAGE-BANDWIDTH"], 10) : null,
    bandwidthInBitsPerSec: map.BANDWIDTH ? parseInt(map.BANDWIDTH, 10) : null,
    codecs: map.CODECS ? map.CODECS.split(",") : null,
    dimensions: map.RESOLUTION ? {
      width: parseInt(map.RESOLUTION.split("x")[0], 10),
      height: parseInt(map.RESOLUTION.split("x")[1], 10)
    } : null,
    audio: map.AUDIO || null
  };
};

// src/containers/m3u/parse-m3u-media-directive.ts
var parseM3uKeyValue = (str) => {
  const quotes = splitRespectingQuotes(str);
  const map = {};
  for (const quote of quotes) {
    const firstColon = quote.indexOf("=");
    const key = firstColon === -1 ? quote : quote.slice(0, firstColon);
    const value = firstColon === -1 ? null : quote.slice(firstColon + 1);
    if (value === null) {
      throw new Error("Value is null");
    }
    const actualValue = value?.startsWith('"') && value?.endsWith('"') ? value.slice(1, -1) : value;
    map[key] = actualValue;
  }
  return map;
};
var parseM3uMediaDirective = (str) => {
  const map = parseM3uKeyValue(str);
  return {
    type: "m3u-media-info",
    autoselect: map.AUTOSELECT === "YES",
    channels: map.CHANNELS ? parseInt(map.CHANNELS, 10) : null,
    default: map.DEFAULT === "YES",
    groupId: map["GROUP-ID"],
    language: map.LANGUAGE || null,
    name: map.NAME || null,
    uri: map.URI,
    mediaType: map.TYPE || null
  };
};

// src/containers/m3u/parse-directive.ts
var parseM3uDirective = (str) => {
  const firstColon = str.indexOf(":");
  const directive = (firstColon === -1 ? str : str.slice(0, firstColon)).trim();
  const value = firstColon === -1 ? null : str.slice(firstColon + 1);
  if (directive === "#EXT-X-VERSION") {
    if (!value) {
      throw new Error("EXT-X-VERSION directive must have a value");
    }
    return {
      type: "m3u-version",
      version: value
    };
  }
  if (directive === "#EXT-X-INDEPENDENT-SEGMENTS") {
    return {
      type: "m3u-independent-segments"
    };
  }
  if (directive === "#EXT-X-MEDIA") {
    if (!value) {
      throw new Error("EXT-X-MEDIA directive must have a value");
    }
    const parsed = parseM3uMediaDirective(value);
    return parsed;
  }
  if (directive === "#EXT-X-TARGETDURATION") {
    if (!value) {
      throw new Error("EXT-X-TARGETDURATION directive must have a value");
    }
    return {
      type: "m3u-target-duration",
      duration: parseFloat(value)
    };
  }
  if (directive === "#EXTINF") {
    if (!value) {
      throw new Error("EXTINF has no value");
    }
    return {
      type: "m3u-extinf",
      value: parseFloat(value)
    };
  }
  if (directive === "#EXT-X-ENDLIST") {
    return {
      type: "m3u-endlist"
    };
  }
  if (directive === "#EXT-X-PLAYLIST-TYPE") {
    if (!value) {
      throw new Error("#EXT-X-PLAYLIST-TYPE. directive must have a value");
    }
    return {
      type: "m3u-playlist-type",
      playlistType: value
    };
  }
  if (directive === "#EXT-X-MEDIA-SEQUENCE") {
    if (!value) {
      throw new Error("#EXT-X-MEDIA-SEQUENCE directive must have a value");
    }
    return {
      type: "m3u-media-sequence",
      value: Number(value)
    };
  }
  if (directive === "#EXT-X-DISCONTINUITY-SEQUENCE") {
    if (!value) {
      throw new Error("#EXT-X-DISCONTINUITY-SEQUENCE directive must have a value");
    }
    return {
      type: "m3u-discontinuity-sequence",
      value: Number(value)
    };
  }
  if (directive === "#EXT-X-STREAM-INF") {
    if (!value) {
      throw new Error("EXT-X-STREAM-INF directive must have a value");
    }
    const res = parseStreamInf(value);
    return res;
  }
  if (directive === "#EXT-X-I-FRAME-STREAM-INF") {
    return {
      type: "m3u-i-frame-stream-info"
    };
  }
  if (directive === "#EXT-X-ALLOW-CACHE") {
    if (!value) {
      throw new Error("#EXT-X-ALLOW-CACHE directive must have a value");
    }
    return {
      type: "m3u-allow-cache",
      allowsCache: value === "YES"
    };
  }
  if (directive === "#EXT-X-MAP") {
    if (!value) {
      throw new Error("#EXT-X-MAP directive must have a value");
    }
    const p = parseM3uKeyValue(value);
    if (!p.URI) {
      throw new Error("EXT-X-MAP directive must have a URI");
    }
    return {
      type: "m3u-map",
      value: p.URI
    };
  }
  if (directive === "#EXT-X-PROGRAM-DATE-TIME") {
    if (!value) {
      throw new Error("#EXT-X-PROGRAM-DATE-TIME directive must have a value");
    }
    return {
      type: "m3u-program-date-time",
      dateTime: value
    };
  }
  throw new Error(`Unknown directive ${directive}. Value: ${value}`);
};

// src/containers/m3u/parse-m3u8-text.ts
var parseM3u8Text = (line, boxes) => {
  if (line === "#EXTM3U") {
    boxes.push({
      type: "m3u-header"
    });
    return;
  }
  if (line.startsWith("#")) {
    boxes.push(parseM3uDirective(line));
    return;
  }
  if (line.trim()) {
    boxes.push({
      type: "m3u-text-value",
      value: line
    });
  }
};

// src/containers/m3u/fetch-m3u8-stream.ts
var fetchM3u8Stream = async ({
  url,
  readerInterface
}) => {
  const text = await readerInterface.readWholeAsText(url);
  const lines = text.split(`
`);
  const boxes = [];
  for (const line of lines) {
    parseM3u8Text(line.trim(), boxes);
  }
  return boxes;
};

// src/containers/m3u/after-manifest-fetch.ts
var afterManifestFetch = async ({
  structure,
  m3uState,
  src,
  selectM3uStreamFn,
  logLevel,
  selectAssociatedPlaylistsFn,
  readerInterface,
  onAudioTrack,
  canSkipTracks
}) => {
  const independentSegments = isIndependentSegments(structure);
  const streams = getM3uStreams({ structure, originalSrc: src, readerInterface });
  if (!independentSegments || streams === null) {
    if (!src) {
      throw new Error("No src");
    }
    m3uState.setSelectedMainPlaylist({
      type: "initial-url",
      url: src
    });
    return m3uState.setReadyToIterateOverM3u();
  }
  const selectedPlaylist = await selectStream({ streams, fn: selectM3uStreamFn });
  if (!selectedPlaylist.dimensions) {
    throw new Error("Stream does not have a resolution");
  }
  m3uState.setSelectedMainPlaylist({
    type: "selected-stream",
    stream: selectedPlaylist
  });
  const skipAudioTracks = onAudioTrack === null && canSkipTracks.doFieldsNeedTracks() === false;
  const associatedPlaylists = await selectAssociatedPlaylists({
    playlists: selectedPlaylist.associatedPlaylists,
    fn: selectAssociatedPlaylistsFn,
    skipAudioTracks
  });
  m3uState.setAssociatedPlaylists(associatedPlaylists);
  const playlistUrls = [
    selectedPlaylist.src,
    ...associatedPlaylists.map((p) => p.src)
  ];
  const struc = await Promise.all(playlistUrls.map(async (url) => {
    Log.verbose(logLevel, `Fetching playlist ${url}`);
    const boxes = await fetchM3u8Stream({ url, readerInterface });
    return {
      type: "m3u-playlist",
      boxes,
      src: url
    };
  }));
  structure.boxes.push(...struc);
  m3uState.setReadyToIterateOverM3u();
};

// src/containers/m3u/parse-m3u-manifest.ts
var parseM3uManifest = ({
  iterator,
  structure,
  contentLength
}) => {
  const start = iterator.startCheckpoint();
  const line = iterator.readUntilLineEnd();
  if (iterator.counter.getOffset() > contentLength) {
    throw new Error("Unexpected end of file");
  }
  if (line === null) {
    start.returnToCheckpoint();
    return Promise.resolve(null);
  }
  parseM3u8Text(line.trim(), structure.boxes);
  return Promise.resolve(null);
};

// src/forward-controller-pause-resume-abort.ts
var forwardMediaParserControllerPauseResume = ({
  parentController,
  childController
}) => {
  const onAbort = ({ detail }) => {
    childController.abort(detail.reason);
  };
  const onResume = () => {
    childController.resume();
  };
  const onPause = () => {
    childController.pause();
  };
  parentController.addEventListener("abort", onAbort);
  parentController.addEventListener("resume", onResume);
  parentController.addEventListener("pause", onPause);
  return {
    cleanup: () => {
      parentController.removeEventListener("abort", onAbort);
      parentController.removeEventListener("resume", onResume);
      parentController.removeEventListener("pause", onPause);
    }
  };
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
  preload: ({ range: range2, src, logLevel, prefetchCache }) => {
    if (src instanceof Blob) {
      return;
    }
    return fetchPreload({ range: range2, src, logLevel, prefetchCache });
  }
};
// src/parse-media.ts
var parseMedia = (options) => {
  if (!options) {
    return Promise.reject(new Error("No options provided. See https://www.remotion.dev/media-parser for how to get started."));
  }
  return internalParseMedia({
    fields: options.fields ?? null,
    logLevel: options.logLevel ?? "info",
    onAudioCodec: options.onAudioCodec ?? null,
    onAudioTrack: options.onAudioTrack ?? null,
    onContainer: options.onContainer ?? null,
    onDimensions: options.onDimensions ?? null,
    onDurationInSeconds: options.onDurationInSeconds ?? null,
    onFps: options.onFps ?? null,
    onImages: options.onImages ?? null,
    onInternalStats: options.onInternalStats ?? null,
    onIsHdr: options.onIsHdr ?? null,
    onKeyframes: options.onKeyframes ?? null,
    onLocation: options.onLocation ?? null,
    onMetadata: options.onMetadata ?? null,
    onMimeType: options.onMimeType ?? null,
    onName: options.onName ?? null,
    onNumberOfAudioChannels: options.onNumberOfAudioChannels ?? null,
    onParseProgress: options.onParseProgress ?? null,
    onRotation: options.onRotation ?? null,
    onSampleRate: options.onSampleRate ?? null,
    onSize: options.onSize ?? null,
    onSlowAudioBitrate: options.onSlowAudioBitrate ?? null,
    onSlowDurationInSeconds: options.onSlowDurationInSeconds ?? null,
    onSlowFps: options.onSlowFps ?? null,
    onSlowKeyframes: options.onSlowKeyframes ?? null,
    onSlowNumberOfFrames: options.onSlowNumberOfFrames ?? null,
    onSlowVideoBitrate: options.onSlowVideoBitrate ?? null,
    onSlowStructure: options.onSlowStructure ?? null,
    onM3uStreams: options.onM3uStreams ?? null,
    onTracks: options.onTracks ?? null,
    onUnrotatedDimensions: options.onUnrotatedDimensions ?? null,
    onVideoCodec: options.onVideoCodec ?? null,
    onVideoTrack: options.onVideoTrack ?? null,
    progressIntervalInMs: options.progressIntervalInMs ?? null,
    reader: options.reader ?? webReader,
    controller: options.controller ?? undefined,
    selectM3uStream: options.selectM3uStream ?? defaultSelectM3uStreamFn,
    selectM3uAssociatedPlaylists: options.selectM3uAssociatedPlaylists ?? defaultSelectM3uAssociatedPlaylists,
    m3uPlaylistContext: options.m3uPlaylistContext ?? null,
    src: options.src,
    mode: "query",
    onDiscardedData: null,
    onError: () => ({ action: "fail" }),
    acknowledgeRemotionLicense: Boolean(options.acknowledgeRemotionLicense),
    apiName: "parseMedia()",
    makeSamplesStartAtZero: options.makeSamplesStartAtZero ?? true,
    seekingHints: options.seekingHints ?? null
  });
};

// src/containers/m3u/first-sample-in-m3u-chunk.ts
var considerSeekBasedOnChunk = async ({
  sample,
  parentController,
  childController,
  callback,
  m3uState,
  playlistUrl,
  subtractChunks,
  chunkIndex
}) => {
  const pendingSeek = m3uState.getSeekToSecondsToProcess(playlistUrl);
  if (pendingSeek === null) {
    await callback(sample);
    return;
  }
  const timestamp = Math.min(sample.decodingTimestamp / WEBCODECS_TIMESCALE, sample.timestamp / WEBCODECS_TIMESCALE);
  if (timestamp > pendingSeek.targetTime && chunkIndex !== null && chunkIndex > 0) {
    m3uState.setNextSeekShouldSubtractChunks(playlistUrl, subtractChunks + 1);
    parentController.seek(pendingSeek.targetTime);
    return;
  }
  childController.seek(pendingSeek.targetTime);
  m3uState.setNextSeekShouldSubtractChunks(playlistUrl, 0);
  m3uState.setSeekToSecondsToProcess(playlistUrl, null);
};

// src/containers/m3u/get-chunks.ts
var getChunks = (playlist) => {
  const chunks = [];
  for (let i = 0;i < playlist.boxes.length; i++) {
    const box = playlist.boxes[i];
    if (box.type === "m3u-map") {
      chunks.push({ duration: 0, url: box.value, isHeader: true });
      continue;
    }
    if (box.type === "m3u-extinf") {
      const nextBox = playlist.boxes[i + 1];
      i++;
      if (nextBox.type !== "m3u-text-value") {
        throw new Error("Expected m3u-text-value");
      }
      chunks.push({ duration: box.value, url: nextBox.value, isHeader: false });
    }
    continue;
  }
  return chunks;
};

// src/containers/m3u/seek/get-chunk-to-seek-to.ts
var getChunkToSeekTo = ({
  chunks,
  seekToSecondsToProcess
}) => {
  let duration2 = 0;
  for (let i = 0;i < chunks.length; i++) {
    if (duration2 >= seekToSecondsToProcess) {
      return Math.max(0, i - 1);
    }
    duration2 += chunks[i].duration;
  }
  return Math.max(0, chunks.length - 1);
};

// src/containers/m3u/process-m3u-chunk.ts
var processM3uChunk = ({
  playlistUrl,
  state,
  structure,
  audioDone,
  videoDone
}) => {
  const { promise, reject, resolve } = withResolvers();
  const onGlobalAudioTrack = audioDone ? null : async (track) => {
    const existingTracks = state.callbacks.tracks.getTracks();
    let { trackId } = track;
    while (existingTracks.find((t) => t.trackId === trackId)) {
      trackId++;
    }
    const onAudioSample = await registerAudioTrack({
      container: "m3u8",
      track: {
        ...track,
        trackId
      },
      registerAudioSampleCallback: state.callbacks.registerAudioSampleCallback,
      tracks: state.callbacks.tracks,
      logLevel: state.logLevel,
      onAudioTrack: state.onAudioTrack
    });
    state.m3u.sampleSorter.addToStreamWithTrack(playlistUrl);
    if (onAudioSample === null) {
      return null;
    }
    state.m3u.sampleSorter.addAudioStreamToConsider(playlistUrl, onAudioSample);
    return async (sample) => {
      await state.m3u.sampleSorter.addAudioSample(playlistUrl, sample);
    };
  };
  const onGlobalVideoTrack = videoDone ? null : async (track) => {
    const existingTracks = state.callbacks.tracks.getTracks();
    let { trackId } = track;
    while (existingTracks.find((t) => t.trackId === trackId)) {
      trackId++;
    }
    const onVideoSample = await registerVideoTrack({
      container: "m3u8",
      track: {
        ...track,
        trackId
      },
      logLevel: state.logLevel,
      onVideoTrack: state.onVideoTrack,
      registerVideoSampleCallback: state.callbacks.registerVideoSampleCallback,
      tracks: state.callbacks.tracks
    });
    state.m3u.sampleSorter.addToStreamWithTrack(playlistUrl);
    if (onVideoSample === null) {
      return null;
    }
    state.m3u.sampleSorter.addVideoStreamToConsider(playlistUrl, onVideoSample);
    return async (sample) => {
      await state.m3u.sampleSorter.addVideoSample(playlistUrl, sample);
    };
  };
  const pausableIterator = async () => {
    const playlist = getPlaylist(structure, playlistUrl);
    const chunks = getChunks(playlist);
    const seekToSecondsToProcess = state.m3u.getSeekToSecondsToProcess(playlistUrl);
    const chunksToSubtract = state.m3u.getNextSeekShouldSubtractChunks(playlistUrl);
    let chunkIndex = null;
    if (seekToSecondsToProcess !== null) {
      chunkIndex = Math.max(0, getChunkToSeekTo({
        chunks,
        seekToSecondsToProcess: seekToSecondsToProcess.targetTime
      }) - chunksToSubtract);
    }
    const currentPromise = {
      resolver: () => {
        return;
      },
      rejector: reject
    };
    const requiresHeaderToBeFetched = chunks[0].isHeader;
    for (const chunk of chunks) {
      const mp4HeaderSegment = state.m3u.getMp4HeaderSegment(playlistUrl);
      if (requiresHeaderToBeFetched && mp4HeaderSegment && chunk.isHeader) {
        continue;
      }
      if (chunkIndex !== null && chunks.indexOf(chunk) < chunkIndex && !chunk.isHeader) {
        continue;
      }
      currentPromise.resolver = (newRun) => {
        state.m3u.setM3uStreamRun(playlistUrl, newRun);
        resolve();
      };
      currentPromise.rejector = reject;
      const childController = mediaParserController();
      const forwarded = forwardMediaParserControllerPauseResume({
        childController,
        parentController: state.controller
      });
      const nextChunk = chunks[chunks.indexOf(chunk) + 1];
      if (nextChunk) {
        const nextChunkSource = state.readerInterface.createAdjacentFileSource(nextChunk.url, playlistUrl);
        state.readerInterface.preload({
          logLevel: state.logLevel,
          range: null,
          src: nextChunkSource,
          prefetchCache: state.prefetchCache
        });
      }
      const makeContinuationFn = () => {
        return {
          continue() {
            const resolver = withResolvers();
            currentPromise.resolver = resolver.resolve;
            currentPromise.rejector = resolver.reject;
            childController.resume();
            return resolver.promise;
          },
          abort() {
            childController.abort();
          }
        };
      };
      const isLastChunk = chunk === chunks[chunks.length - 1];
      await childController._internals.checkForAbortAndPause();
      const src = state.readerInterface.createAdjacentFileSource(chunk.url, playlistUrl);
      try {
        const data = await parseMedia({
          src,
          acknowledgeRemotionLicense: true,
          logLevel: state.logLevel,
          controller: childController,
          progressIntervalInMs: 0,
          onParseProgress: () => {
            childController.pause();
            currentPromise.resolver(makeContinuationFn());
          },
          fields: chunk.isHeader ? { slowStructure: true } : undefined,
          onTracks: () => {
            if (!state.m3u.hasEmittedDoneWithTracks(playlistUrl)) {
              state.m3u.setHasEmittedDoneWithTracks(playlistUrl);
              const allDone = state.m3u.setTracksDone(playlistUrl);
              if (allDone) {
                state.callbacks.tracks.setIsDone(state.logLevel);
              }
              return null;
            }
          },
          onAudioTrack: onGlobalAudioTrack === null ? null : async ({ track }) => {
            const callbackOrFalse = state.m3u.hasEmittedAudioTrack(playlistUrl);
            if (callbackOrFalse === false) {
              const callback = await onGlobalAudioTrack(track);
              if (!callback) {
                state.m3u.setHasEmittedAudioTrack(playlistUrl, null);
                return null;
              }
              state.m3u.setHasEmittedAudioTrack(playlistUrl, callback);
              return async (sample) => {
                await considerSeekBasedOnChunk({
                  sample,
                  callback,
                  parentController: state.controller,
                  childController,
                  m3uState: state.m3u,
                  playlistUrl,
                  subtractChunks: chunksToSubtract,
                  chunkIndex
                });
              };
            }
            if (callbackOrFalse === null) {
              return null;
            }
            return async (sample) => {
              await considerSeekBasedOnChunk({
                sample,
                m3uState: state.m3u,
                playlistUrl,
                callback: callbackOrFalse,
                parentController: state.controller,
                childController,
                subtractChunks: chunksToSubtract,
                chunkIndex
              });
            };
          },
          onVideoTrack: onGlobalVideoTrack === null ? null : async ({ track }) => {
            const callbackOrFalse = state.m3u.hasEmittedVideoTrack(playlistUrl);
            if (callbackOrFalse === false) {
              const callback = await onGlobalVideoTrack({
                ...track,
                m3uStreamFormat: chunk.isHeader || mp4HeaderSegment ? "mp4" : "ts"
              });
              if (!callback) {
                state.m3u.setHasEmittedVideoTrack(playlistUrl, null);
                return null;
              }
              state.m3u.setHasEmittedVideoTrack(playlistUrl, callback);
              return async (sample) => {
                await considerSeekBasedOnChunk({
                  sample,
                  m3uState: state.m3u,
                  playlistUrl,
                  callback,
                  parentController: state.controller,
                  childController,
                  subtractChunks: chunksToSubtract,
                  chunkIndex
                });
              };
            }
            if (callbackOrFalse === null) {
              return null;
            }
            return async (sample) => {
              await considerSeekBasedOnChunk({
                sample,
                m3uState: state.m3u,
                playlistUrl,
                callback: callbackOrFalse,
                parentController: state.controller,
                childController,
                subtractChunks: chunksToSubtract,
                chunkIndex
              });
            };
          },
          reader: state.readerInterface,
          makeSamplesStartAtZero: false,
          m3uPlaylistContext: {
            mp4HeaderSegment,
            isLastChunkInPlaylist: isLastChunk
          }
        });
        if (chunk.isHeader) {
          if (data.slowStructure.type !== "iso-base-media") {
            throw new Error("Expected an mp4 file");
          }
          state.m3u.setMp4HeaderSegment(playlistUrl, data.slowStructure);
        }
      } catch (e) {
        currentPromise.rejector(e);
        throw e;
      }
      forwarded.cleanup();
      if (!isLastChunk) {
        childController.pause();
        currentPromise.resolver(makeContinuationFn());
      }
    }
    currentPromise.resolver(null);
  };
  const run = pausableIterator();
  run.catch((err) => {
    reject(err);
  });
  return promise;
};

// src/containers/m3u/run-over-m3u.ts
var runOverM3u = async ({
  state,
  structure,
  playlistUrl,
  logLevel
}) => {
  const tracksDone = state.m3u.getTrackDone(playlistUrl);
  const hasAudioStreamToConsider = state.m3u.sampleSorter.hasAudioStreamToConsider(playlistUrl);
  const hasVideoStreamToConsider = state.m3u.sampleSorter.hasVideoStreamToConsider(playlistUrl);
  const audioDone = !hasAudioStreamToConsider && tracksDone;
  const videoDone = !hasVideoStreamToConsider && tracksDone;
  const bothDone = audioDone && videoDone;
  if (bothDone) {
    state.m3u.setAllChunksProcessed(playlistUrl);
    return;
  }
  const existingRun = state.m3u.getM3uStreamRun(playlistUrl);
  if (existingRun) {
    Log.trace(logLevel, "Existing M3U parsing process found for", playlistUrl);
    const run = await existingRun.continue();
    state.m3u.setM3uStreamRun(playlistUrl, run);
    if (!run) {
      state.m3u.setAllChunksProcessed(playlistUrl);
    }
    return;
  }
  Log.trace(logLevel, "Starting new M3U parsing process for", playlistUrl);
  await processM3uChunk({
    playlistUrl,
    state,
    structure,
    audioDone,
    videoDone
  });
};

// src/containers/m3u/parse-m3u.ts
var parseM3u = async ({ state }) => {
  const structure = state.structure.getM3uStructure();
  if (state.m3u.isReadyToIterateOverM3u()) {
    const selectedPlaylists = state.m3u.getSelectedPlaylists();
    const whichPlaylistToRunOver = state.m3u.sampleSorter.getNextStreamToRun(selectedPlaylists);
    await runOverM3u({
      state,
      structure,
      playlistUrl: whichPlaylistToRunOver,
      logLevel: state.logLevel
    });
    return null;
  }
  if (state.m3u.hasFinishedManifest()) {
    if (typeof state.src !== "string" && !(state.src instanceof URL)) {
      throw new Error("Expected src to be a string");
    }
    state.mediaSection.addMediaSection({
      start: 0,
      size: state.contentLength + 1
    });
    await afterManifestFetch({
      structure,
      m3uState: state.m3u,
      src: state.src.toString(),
      selectM3uStreamFn: state.selectM3uStreamFn,
      logLevel: state.logLevel,
      selectAssociatedPlaylistsFn: state.selectM3uAssociatedPlaylistsFn,
      readerInterface: state.readerInterface,
      onAudioTrack: state.onAudioTrack,
      canSkipTracks: state.callbacks.canSkipTracksState
    });
    return null;
  }
  const box = await parseM3uManifest({
    iterator: state.iterator,
    structure,
    contentLength: state.contentLength
  });
  const isDoneNow = state.iterator.counter.getOffset() === state.contentLength;
  if (isDoneNow) {
    state.m3u.setHasFinishedManifest();
  }
  return box;
};

// src/containers/mp3/id3.ts
function combine28Bits(a, b, c, d) {
  const val1 = a & 127;
  const val2 = b & 127;
  const val3 = c & 127;
  const val4 = d & 127;
  return val1 << 21 | val2 << 14 | val3 << 7 | val4;
}
var parseId3 = ({ state }) => {
  const { iterator } = state;
  if (iterator.bytesRemaining() < 9) {
    return;
  }
  const { returnToCheckpoint } = iterator.startCheckpoint();
  iterator.discard(3);
  const versionMajor = iterator.getUint8();
  const versionMinor = iterator.getUint8();
  const flags = iterator.getUint8();
  const sizeArr = iterator.getSlice(4);
  const size = combine28Bits(sizeArr[0], sizeArr[1], sizeArr[2], sizeArr[3]);
  if (iterator.bytesRemaining() < size) {
    returnToCheckpoint();
    return;
  }
  const entries = [];
  const initial = iterator.counter.getOffset();
  while (iterator.counter.getOffset() < size + initial) {
    const name = versionMajor === 3 || versionMajor === 4 ? iterator.getByteString(4, true) : iterator.getByteString(3, true);
    if (name === "") {
      iterator.discard(size + initial - iterator.counter.getOffset());
      break;
    }
    const s = versionMajor === 4 ? iterator.getSyncSafeInt32() : versionMajor === 3 ? iterator.getUint32() : iterator.getUint24();
    if (versionMajor === 3 || versionMajor === 4) {
      iterator.getUint16();
    }
    let subtract = 0;
    if (!name.startsWith("W")) {
      iterator.getUint8();
      subtract += 1;
    }
    if (name === "APIC") {
      const { discardRest } = iterator.planBytes(s - subtract);
      const mimeType = iterator.readUntilNullTerminator();
      iterator.getUint16();
      const description = iterator.readUntilNullTerminator();
      iterator.discard(1);
      const data = discardRest();
      state.images.addImage({
        data,
        description,
        mimeType
      });
    } else {
      const information = iterator.getByteString(s - subtract, true);
      entries.push({
        key: name,
        value: information,
        trackId: null
      });
    }
  }
  state.structure.getMp3Structure().boxes.push({
    type: "id3-header",
    flags,
    size,
    versionMajor,
    versionMinor,
    metatags: entries
  });
};

// src/containers/mp3/id3-v1.ts
var parseID3V1 = (iterator) => {
  if (iterator.bytesRemaining() < 128) {
    return;
  }
  iterator.discard(128);
};

// src/containers/mp3/parse-packet-header.ts
function getSamplingFrequency({
  bits,
  mpegVersion
}) {
  const samplingTable = {
    0: { MPEG1: 44100, MPEG2: 22050 },
    1: { MPEG1: 48000, MPEG2: 24000 },
    2: { MPEG1: 32000, MPEG2: 16000 },
    3: { MPEG1: "reserved", MPEG2: "reserved" }
  };
  const key = `MPEG${mpegVersion}`;
  const value = samplingTable[bits][key];
  if (value === "reserved") {
    throw new Error("Reserved sampling frequency");
  }
  if (!value) {
    throw new Error("Invalid sampling frequency for MPEG version: " + JSON.stringify({ bits, version: mpegVersion }));
  }
  return value;
}
function getBitrateKB({
  bits,
  mpegVersion,
  level
}) {
  const bitrateTable = {
    0: {
      "V1,L1": "free",
      "V1,L2": "free",
      "V1,L3": "free",
      "V2,L1": "free",
      "V2,L2&L3": "free"
    },
    1: { "V1,L1": 32, "V1,L2": 32, "V1,L3": 32, "V2,L1": 32, "V2,L2&L3": 8 },
    2: {
      "V1,L1": 64,
      "V1,L2": 48,
      "V1,L3": 40,
      "V2,L1": 48,
      "V2,L2&L3": 16
    },
    3: {
      "V1,L1": 96,
      "V1,L2": 56,
      "V1,L3": 48,
      "V2,L1": 56,
      "V2,L2&L3": 24
    },
    4: {
      "V1,L1": 128,
      "V1,L2": 64,
      "V1,L3": 56,
      "V2,L1": 64,
      "V2,L2&L3": 32
    },
    5: {
      "V1,L1": 160,
      "V1,L2": 80,
      "V1,L3": 64,
      "V2,L1": 80,
      "V2,L2&L3": 40
    },
    6: {
      "V1,L1": 192,
      "V1,L2": 96,
      "V1,L3": 80,
      "V2,L1": 96,
      "V2,L2&L3": 48
    },
    7: {
      "V1,L1": 224,
      "V1,L2": 112,
      "V1,L3": 96,
      "V2,L1": 112,
      "V2,L2&L3": 56
    },
    8: {
      "V1,L1": 256,
      "V1,L2": 128,
      "V1,L3": 112,
      "V2,L1": 128,
      "V2,L2&L3": 64
    },
    9: {
      "V1,L1": 288,
      "V1,L2": 160,
      "V1,L3": 128,
      "V2,L1": 144,
      "V2,L2&L3": 80
    },
    10: {
      "V1,L1": 320,
      "V1,L2": 192,
      "V1,L3": 160,
      "V2,L1": 160,
      "V2,L2&L3": 96
    },
    11: {
      "V1,L1": 352,
      "V1,L2": 224,
      "V1,L3": 192,
      "V2,L1": 176,
      "V2,L2&L3": 112
    },
    12: {
      "V1,L1": 384,
      "V1,L2": 256,
      "V1,L3": 224,
      "V2,L1": 192,
      "V2,L2&L3": 128
    },
    13: {
      "V1,L1": 416,
      "V1,L2": 320,
      "V1,L3": 256,
      "V2,L1": 224,
      "V2,L2&L3": 144
    },
    14: {
      "V1,L1": 448,
      "V1,L2": 384,
      "V1,L3": 320,
      "V2,L1": 256,
      "V2,L2&L3": 160
    },
    15: {
      "V1,L1": "bad",
      "V1,L2": "bad",
      "V1,L3": "bad",
      "V2,L1": "bad",
      "V2,L2&L3": "bad"
    }
  };
  let key;
  if (mpegVersion === 2 && (level === 2 || level === 3)) {
    key = "V2,L2&L3";
  } else {
    key = `V${mpegVersion},L${level}`;
  }
  return bitrateTable[bits][key];
}
var innerParseMp3PacketHeader = (iterator) => {
  for (let i = 0;i < 11; i++) {
    const expectToBe1 = iterator.getBits(1);
    if (expectToBe1 !== 1) {
      throw new Error("Expected 1");
    }
  }
  const audioVersionId = iterator.getBits(2);
  if (audioVersionId !== 3 && audioVersionId !== 2 && audioVersionId !== 0) {
    throw new Error("Expected MPEG Version 1 or 2");
  }
  const mpegVersion = audioVersionId === 3 ? 1 : 2;
  const layerBits = iterator.getBits(2);
  if (layerBits === 0) {
    throw new Error("Expected Layer I, II or III");
  }
  const layer = layerBits === 3 ? 1 : layerBits === 2 ? 2 : 3;
  iterator.getBits(1);
  const bitrateIndex = iterator.getBits(4);
  const bitrateInKbit = getBitrateKB({
    bits: bitrateIndex,
    mpegVersion,
    level: layer
  });
  if (bitrateInKbit === "bad") {
    throw new Error("Invalid bitrate");
  }
  if (bitrateInKbit === "free") {
    throw new Error("Free bitrate not supported");
  }
  const samplingFrequencyIndex = iterator.getBits(2);
  const baseSampleRate = getSamplingFrequency({
    bits: samplingFrequencyIndex,
    mpegVersion
  });
  const sampleRate = audioVersionId === 0 ? baseSampleRate / 2 : baseSampleRate;
  const padding = Boolean(iterator.getBits(1));
  iterator.getBits(1);
  const channelMode = iterator.getBits(2);
  iterator.getBits(2);
  iterator.getBits(1);
  iterator.getBits(1);
  iterator.getBits(2);
  const numberOfChannels = channelMode === 3 ? 1 : 2;
  const samplesPerFrame = getSamplesPerMpegFrame({ mpegVersion, layer });
  const frameLength = getMpegFrameLength({
    bitrateKbit: bitrateInKbit,
    padding,
    samplesPerFrame,
    samplingFrequency: sampleRate,
    layer
  });
  return {
    frameLength,
    bitrateInKbit,
    layer,
    mpegVersion,
    numberOfChannels,
    sampleRate,
    samplesPerFrame
  };
};
var parseMp3PacketHeader = (iterator) => {
  iterator.startReadingBits();
  const d = innerParseMp3PacketHeader(iterator);
  iterator.stopReadingBits();
  return d;
};
var isMp3PacketHeaderHere = (iterator) => {
  const offset = iterator.counter.getOffset();
  iterator.startReadingBits();
  try {
    const res = innerParseMp3PacketHeader(iterator);
    iterator.stopReadingBits();
    iterator.counter.decrement(iterator.counter.getOffset() - offset);
    return res;
  } catch {
    iterator.stopReadingBits();
    iterator.counter.decrement(iterator.counter.getOffset() - offset);
    return false;
  }
};
var isMp3PacketHeaderHereAndInNext = (iterator) => {
  const offset = iterator.counter.getOffset();
  const res = isMp3PacketHeaderHere(iterator);
  if (!res) {
    return false;
  }
  if (iterator.bytesRemaining() <= res.frameLength) {
    return true;
  }
  iterator.counter.increment(res.frameLength);
  const isHere = isMp3PacketHeaderHere(iterator);
  iterator.counter.decrement(iterator.counter.getOffset() - offset);
  return isHere;
};

// src/containers/mp3/seek/audio-sample-from-cbr.ts
var getAudioSampleFromCbr = ({
  bitrateInKbit,
  initialOffset,
  layer,
  sampleRate,
  samplesPerFrame,
  data,
  state
}) => {
  const avgLength = getAverageMpegFrameLength({
    bitrateKbit: bitrateInKbit,
    layer,
    samplesPerFrame,
    samplingFrequency: sampleRate
  });
  const mp3Info = state.mp3.getMp3Info();
  if (!mp3Info) {
    throw new Error("No MP3 info");
  }
  const nthFrame = Math.round((initialOffset - state.mediaSection.getMediaSectionAssertOnlyOne().start) / avgLength);
  const durationInSeconds = samplesPerFrame / sampleRate;
  const timeInSeconds = nthFrame * samplesPerFrame / sampleRate;
  const timestamp = Math.floor(timeInSeconds * WEBCODECS_TIMESCALE);
  const duration2 = Math.floor(durationInSeconds * WEBCODECS_TIMESCALE);
  const audioSample = {
    data,
    decodingTimestamp: timestamp,
    duration: duration2,
    offset: initialOffset,
    timestamp,
    type: "key"
  };
  return { audioSample, timeInSeconds, durationInSeconds };
};

// src/containers/mp3/seek/audio-sample-from-vbr.ts
var getAudioSampleFromVbr = ({
  info,
  position,
  mp3Info,
  data
}) => {
  if (!mp3Info) {
    throw new Error("No MP3 info");
  }
  const samplesPerFrame = getSamplesPerMpegFrame({
    layer: mp3Info.layer,
    mpegVersion: mp3Info.mpegVersion
  });
  const wholeFileDuration = getDurationFromMp3Xing({
    samplesPerFrame,
    xingData: info.xingData
  });
  if (!info.xingData.fileSize) {
    throw new Error("file size");
  }
  if (!info.xingData.tableOfContents) {
    throw new Error("table of contents");
  }
  const timeInSeconds = getTimeFromPosition({
    durationInSeconds: wholeFileDuration,
    fileSize: info.xingData.fileSize,
    position,
    tableOfContents: info.xingData.tableOfContents
  });
  const durationInSeconds = samplesPerFrame / info.xingData.sampleRate;
  const timestamp = Math.floor(timeInSeconds * WEBCODECS_TIMESCALE);
  const duration2 = Math.floor(durationInSeconds * WEBCODECS_TIMESCALE);
  const audioSample = {
    data,
    decodingTimestamp: timestamp,
    duration: duration2,
    offset: position,
    timestamp,
    type: "key"
  };
  return { timeInSeconds, audioSample, durationInSeconds };
};

// src/containers/mp3/parse-mpeg-header.ts
var parseMpegHeader = async ({
  state
}) => {
  const { iterator } = state;
  const initialOffset = iterator.counter.getOffset();
  if (iterator.bytesRemaining() < 32) {
    return;
  }
  const {
    frameLength,
    bitrateInKbit,
    layer,
    mpegVersion,
    numberOfChannels,
    sampleRate,
    samplesPerFrame
  } = parseMp3PacketHeader(iterator);
  const cbrMp3Info = state.mp3.getMp3BitrateInfo();
  if (cbrMp3Info && cbrMp3Info.type === "constant") {
    if (bitrateInKbit !== cbrMp3Info.bitrateInKbit) {
      throw new Error(`Bitrate mismatch at offset ${initialOffset}: ${bitrateInKbit} !== ${cbrMp3Info.bitrateInKbit}`);
    }
  }
  const offsetNow = iterator.counter.getOffset();
  iterator.counter.decrement(offsetNow - initialOffset);
  const data = iterator.getSlice(frameLength);
  if (state.callbacks.tracks.getTracks().length === 0) {
    const info = {
      layer,
      mpegVersion,
      sampleRate
    };
    const asText = new TextDecoder().decode(data);
    if (asText.includes("VBRI")) {
      throw new Error("MP3 files with VBRI are currently unsupported because we have no sample file. Submit this file at remotion.dev/report if you would like us to support this file.");
    }
    if (asText.includes("Info")) {
      return;
    }
    const isVbr = asText.includes("Xing");
    if (isVbr) {
      const xingData = parseXing(data);
      Log.verbose(state.logLevel, "MP3 has variable bit rate. Requiring whole file to be read");
      state.mp3.setMp3BitrateInfo({
        type: "variable",
        xingData
      });
      return;
    }
    if (!state.mp3.getMp3BitrateInfo()) {
      state.mp3.setMp3BitrateInfo({
        bitrateInKbit,
        type: "constant"
      });
    }
    state.mp3.setMp3Info(info);
    await registerAudioTrack({
      container: "mp3",
      track: {
        type: "audio",
        codec: "mp3",
        codecData: null,
        codecEnum: "mp3",
        description: undefined,
        numberOfChannels,
        sampleRate,
        originalTimescale: 1e6,
        trackId: 0,
        startInSeconds: 0,
        timescale: WEBCODECS_TIMESCALE,
        trackMediaTimeOffsetInTrackTimescale: 0
      },
      registerAudioSampleCallback: state.callbacks.registerAudioSampleCallback,
      tracks: state.callbacks.tracks,
      logLevel: state.logLevel,
      onAudioTrack: state.onAudioTrack
    });
    state.callbacks.tracks.setIsDone(state.logLevel);
    state.mediaSection.addMediaSection({
      start: initialOffset,
      size: state.contentLength - initialOffset
    });
  }
  const bitrateInfo = state.mp3.getMp3BitrateInfo();
  if (!bitrateInfo) {
    throw new Error("No bitrate info");
  }
  const sample = bitrateInfo.type === "constant" ? getAudioSampleFromCbr({
    bitrateInKbit,
    data,
    initialOffset,
    layer,
    sampleRate,
    samplesPerFrame,
    state
  }) : getAudioSampleFromVbr({
    data,
    info: bitrateInfo,
    mp3Info: state.mp3.getMp3Info(),
    position: initialOffset
  });
  const { audioSample, timeInSeconds, durationInSeconds } = sample;
  state.mp3.audioSamples.addSample({
    timeInSeconds,
    offset: initialOffset,
    durationInSeconds
  });
  await state.callbacks.onAudioSample({
    audioSample,
    trackId: 0
  });
};

// src/containers/mp3/seek/wait-until-syncword.ts
var discardUntilSyncword = ({
  iterator
}) => {
  while (true) {
    const next2Bytes = iterator.getUint8();
    if (next2Bytes !== 255) {
      continue;
    }
    if (iterator.bytesRemaining() === 0) {
      break;
    }
    const nextByte = iterator.getUint8();
    const mask = 224;
    if ((nextByte & mask) !== mask) {
      continue;
    }
    iterator.counter.decrement(2);
    if (isMp3PacketHeaderHereAndInNext(iterator)) {
      break;
    } else {
      iterator.counter.increment(2);
    }
  }
};

// src/containers/mp3/parse-mp3.ts
var parseMp3 = async (state) => {
  const { iterator } = state;
  if (iterator.bytesRemaining() < 3) {
    return null;
  }
  if (state.mediaSection.isCurrentByteInMediaSection(iterator) === "in-section") {
    discardUntilSyncword({ iterator });
    await parseMpegHeader({
      state
    });
    return null;
  }
  const { returnToCheckpoint } = iterator.startCheckpoint();
  const bytes = iterator.getSlice(3);
  returnToCheckpoint();
  if (bytes[0] === 84 && bytes[1] === 65 && bytes[2] === 71) {
    parseID3V1(iterator);
    return null;
  }
  if (bytes[0] === 73 && bytes[1] === 68 && bytes[2] === 51) {
    parseId3({ state });
    return null;
  }
  if (bytes[0] === 255) {
    await parseMpegHeader({
      state
    });
    return null;
  }
  throw new Error("Unknown MP3 header " + JSON.stringify(bytes));
};

// src/containers/riff/get-strh-for-index.ts
var getStrhForIndex = (structure, trackId) => {
  const boxes = getStrlBoxes(structure);
  const box = boxes[trackId];
  if (!box) {
    throw new Error("Expected box");
  }
  const strh = getStrhBox(box.children);
  if (!strh) {
    throw new Error("strh");
  }
  return strh;
};

// src/containers/riff/convert-queued-sample-to-mediaparser-sample.ts
var getKeyFrameOffsetAndPocs = ({
  state,
  sample,
  trackId
}) => {
  if (sample.type === "key") {
    const sampleOffset = state.riff.sampleCounter.getSampleCountForTrack({
      trackId
    });
    return {
      sampleOffsetAtKeyframe: sampleOffset,
      pocsAtKeyframeOffset: [sample.avc?.poc ?? 0]
    };
  }
  const riffKeyframes = state.riff.sampleCounter.riffKeys.getKeyframes();
  const keyframeAtOffset = riffKeyframes.findLast((k) => k.positionInBytes <= sample.offset);
  if (!keyframeAtOffset) {
    throw new Error("no keyframe at offset");
  }
  const sampleOffsetAtKeyframe = keyframeAtOffset.sampleCounts[trackId];
  const pocsAtKeyframeOffset = state.riff.sampleCounter.getPocAtKeyframeOffset({
    keyframeOffset: keyframeAtOffset.positionInBytes
  });
  return {
    sampleOffsetAtKeyframe,
    pocsAtKeyframeOffset
  };
};
var convertQueuedSampleToMediaParserSample = ({
  sample,
  state,
  trackId
}) => {
  const strh = getStrhForIndex(state.structure.getRiffStructure(), trackId);
  const samplesPerSecond = strh.rate / strh.scale;
  const { sampleOffsetAtKeyframe, pocsAtKeyframeOffset } = getKeyFrameOffsetAndPocs({
    sample,
    state,
    trackId
  });
  const indexOfPoc = pocsAtKeyframeOffset.findIndex((poc) => poc === sample.avc?.poc);
  if (indexOfPoc === -1) {
    throw new Error("poc not found");
  }
  const nthSample = indexOfPoc + sampleOffsetAtKeyframe;
  const timestamp = nthSample / samplesPerSecond;
  const videoSample = convertAudioOrVideoSampleToWebCodecsTimestamps({
    sample: {
      ...sample,
      timestamp,
      decodingTimestamp: timestamp
    },
    timescale: 1
  });
  return videoSample;
};

// src/containers/riff/is-movi.ts
var isMoviAtom = (iterator, ckId) => {
  if (ckId !== "LIST") {
    return false;
  }
  const listType = iterator.getByteString(4, false);
  iterator.counter.decrement(4);
  return listType === "movi";
};

// src/containers/riff/parse-avih.ts
var AVIF_HAS_INDEX = 16;
var parseAvih = ({
  iterator,
  size
}) => {
  const { expectNoMoreBytes } = iterator.startBox(size);
  const dwMicroSecPerFrame = iterator.getUint32Le();
  const dwMaxBytesPerSec = iterator.getUint32Le();
  const paddingGranularity = iterator.getUint32Le();
  const flags = iterator.getUint32Le();
  const totalFrames = iterator.getUint32Le();
  const initialFrames = iterator.getUint32Le();
  const streams = iterator.getUint32Le();
  const suggestedBufferSize = iterator.getUint32Le();
  const width = iterator.getUint32Le();
  const height = iterator.getUint32Le();
  const hasIndex = (flags & AVIF_HAS_INDEX) !== 0;
  iterator.discard(16);
  expectNoMoreBytes();
  return {
    type: "avih-box",
    hasIndex,
    microSecPerFrame: dwMicroSecPerFrame,
    maxBytesPerSecond: dwMaxBytesPerSec,
    paddingGranularity,
    flags,
    totalFrames,
    initialFrames,
    streams,
    suggestedBufferSize,
    height,
    width
  };
};

// src/containers/riff/parse-idx1.ts
var AVIIF_KEYFRAME = 16;
var parseIdx1 = ({
  iterator,
  size
}) => {
  const box = iterator.startBox(size);
  const offset = iterator.counter.getOffset();
  const entries = [];
  const sampleCounts = {};
  let videoTrackIndex = null;
  while (iterator.counter.getOffset() < offset + size) {
    const chunkId = iterator.getByteString(4, false);
    const flags = iterator.getUint32Le();
    const moffset = iterator.getUint32Le();
    const msize = iterator.getUint32Le();
    const chunk = chunkId.match(/^([0-9]{2})(wb|dc)$/);
    const isVideo = chunkId.endsWith("dc");
    if (isVideo) {
      videoTrackIndex = chunk ? parseInt(chunk[1], 10) : null;
    }
    const trackId = chunk ? parseInt(chunk[1], 10) : null;
    if (trackId === null) {
      continue;
    }
    if (!sampleCounts[trackId]) {
      sampleCounts[trackId] = 0;
    }
    const isKeyFrame = (flags & AVIIF_KEYFRAME) !== 0;
    if (isKeyFrame) {
      entries.push({
        flags,
        id: chunkId,
        offset: moffset,
        size: msize,
        sampleCounts: { ...sampleCounts }
      });
    }
    sampleCounts[trackId]++;
  }
  box.expectNoMoreBytes();
  return {
    type: "idx1-box",
    entries,
    videoTrackIndex
  };
};

// src/containers/riff/parse-isft.ts
var parseIsft = ({
  iterator,
  size
}) => {
  const { expectNoMoreBytes } = iterator.startBox(size);
  const software = iterator.getByteString(size - 1, false);
  const last = iterator.getUint8();
  if (last !== 0) {
    throw new Error(`Expected 0 byte, got ${last}`);
  }
  expectNoMoreBytes();
  return {
    type: "isft-box",
    software
  };
};

// src/containers/riff/parse-list-box.ts
var parseListBox = async ({
  size,
  iterator,
  stateIfExpectingSideEffects
}) => {
  const counter = iterator.counter.getOffset();
  const listType = iterator.getByteString(4, false);
  if (listType === "movi") {
    throw new Error("should not be handled here");
  }
  const boxes = [];
  const maxOffset = counter + size;
  while (iterator.counter.getOffset() < maxOffset) {
    const box = await expectRiffBox({
      iterator,
      stateIfExpectingSideEffects
    });
    if (box === null) {
      throw new Error("Unexpected result");
    }
    if (stateIfExpectingSideEffects) {
      await postProcessRiffBox(stateIfExpectingSideEffects, box);
    }
    boxes.push(box);
  }
  return {
    type: "list-box",
    listType,
    children: boxes
  };
};

// src/containers/riff/parse-strf.ts
var parseStrfAudio = ({
  iterator,
  size
}) => {
  const box = iterator.startBox(size);
  const formatTag = iterator.getUint16Le();
  const numberOfChannels = iterator.getUint16Le();
  const samplesPerSec = iterator.getUint32Le();
  const avgBytesPerSec = iterator.getUint32Le();
  const blockAlign = iterator.getUint16Le();
  const bitsPerSample = iterator.getUint16Le();
  const cbSize = iterator.getUint16Le();
  box.expectNoMoreBytes();
  return {
    type: "strf-box-audio",
    avgBytesPerSecond: avgBytesPerSec,
    bitsPerSample,
    blockAlign,
    cbSize,
    formatTag,
    numberOfChannels,
    sampleRate: samplesPerSec
  };
};
var parseStrfVideo = ({
  iterator,
  size
}) => {
  const box = iterator.startBox(size);
  const biSize = iterator.getUint32Le();
  const width = iterator.getInt32Le();
  const height = iterator.getInt32Le();
  const planes = iterator.getUint16Le();
  const bitCount = iterator.getUint16Le();
  const compression = iterator.getByteString(4, false);
  const sizeImage = iterator.getUint32Le();
  const xPelsPerMeter = iterator.getInt32Le();
  const yPelsPerMeter = iterator.getInt32Le();
  const clrUsed = iterator.getUint32Le();
  const clrImportant = iterator.getUint32Le();
  box.expectNoMoreBytes();
  return {
    type: "strf-box-video",
    biSize,
    bitCount,
    clrImportant,
    clrUsed,
    compression,
    height,
    planes,
    sizeImage,
    width,
    xPelsPerMeter,
    yPelsPerMeter
  };
};
var parseStrf = ({
  iterator,
  size,
  fccType
}) => {
  if (fccType === "vids") {
    return parseStrfVideo({ iterator, size });
  }
  if (fccType === "auds") {
    return parseStrfAudio({ iterator, size });
  }
  throw new Error(`Unsupported fccType: ${fccType}`);
};

// src/containers/riff/parse-strh.ts
var parseStrh = ({
  iterator,
  size
}) => {
  const box = iterator.startBox(size);
  const fccType = iterator.getByteString(4, false);
  if (fccType !== "vids" && fccType !== "auds") {
    throw new Error("Expected AVI handler to be vids / auds");
  }
  const handler = fccType === "vids" ? iterator.getByteString(4, false) : iterator.getUint32Le();
  if (typeof handler === "string" && handler !== "H264") {
    throw new Error(`Only H264 is supported as a stream type in .avi, got ${handler}`);
  }
  if (fccType === "auds" && handler !== 1) {
    throw new Error(`Only "1" is supported as a stream type in .avi, got ${handler}`);
  }
  const flags = iterator.getUint32Le();
  const priority = iterator.getUint16Le();
  const language2 = iterator.getUint16Le();
  const initialFrames = iterator.getUint32Le();
  const scale = iterator.getUint32Le();
  const rate = iterator.getUint32Le();
  const start = iterator.getUint32Le();
  const length = iterator.getUint32Le();
  const suggestedBufferSize = iterator.getUint32Le();
  const quality = iterator.getUint32Le();
  const sampleSize = iterator.getUint32Le();
  box.discardRest();
  const ckId = iterator.getByteString(4, false);
  const ckSize = iterator.getUint32Le();
  if (ckId !== "strf") {
    throw new Error(`Expected strf, got ${JSON.stringify(ckId)}`);
  }
  if (iterator.bytesRemaining() < ckSize) {
    throw new Error("Expected strf to be complete");
  }
  const strf = parseStrf({ iterator, size: ckSize, fccType });
  return {
    type: "strh-box",
    fccType,
    handler,
    flags,
    priority,
    initialFrames,
    length,
    quality,
    rate,
    sampleSize,
    scale,
    start,
    suggestedBufferSize,
    language: language2,
    strf
  };
};

// src/containers/riff/parse-riff-box.ts
var parseRiffBox = ({
  size,
  id,
  iterator,
  stateIfExpectingSideEffects
}) => {
  if (id === "LIST") {
    return parseListBox({
      size,
      iterator,
      stateIfExpectingSideEffects
    });
  }
  if (id === "ISFT") {
    return Promise.resolve(parseIsft({ iterator, size }));
  }
  if (id === "avih") {
    return Promise.resolve(parseAvih({ iterator, size }));
  }
  if (id === "strh") {
    return Promise.resolve(parseStrh({ iterator, size }));
  }
  if (id === "idx1") {
    return Promise.resolve(parseIdx1({ iterator, size }));
  }
  iterator.discard(size);
  const box = {
    type: "riff-box",
    size,
    id
  };
  return Promise.resolve(box);
};

// src/containers/riff/expect-riff-box.ts
var postProcessRiffBox = async (state, box) => {
  if (box.type === "strh-box") {
    if (box.strf.type === "strf-box-audio" && state.onAudioTrack) {
      const audioTrack = makeAviAudioTrack({
        index: state.riff.getNextTrackIndex(),
        strf: box.strf
      });
      await registerAudioTrack({
        track: audioTrack,
        container: "avi",
        registerAudioSampleCallback: state.callbacks.registerAudioSampleCallback,
        tracks: state.callbacks.tracks,
        logLevel: state.logLevel,
        onAudioTrack: state.onAudioTrack
      });
    }
    if (state.onVideoTrack && box.strf.type === "strf-box-video") {
      const videoTrack = makeAviVideoTrack({
        strh: box,
        index: state.riff.getNextTrackIndex(),
        strf: box.strf
      });
      registerVideoTrackWhenProfileIsAvailable({
        state,
        track: videoTrack,
        container: "avi"
      });
    }
    state.riff.incrementNextTrackIndex();
  }
};
var expectRiffBox = async ({
  iterator,
  stateIfExpectingSideEffects
}) => {
  if (iterator.bytesRemaining() < 16) {
    return null;
  }
  const checkpoint = iterator.startCheckpoint();
  const ckId = iterator.getByteString(4, false);
  const ckSize = iterator.getUint32Le();
  if (isMoviAtom(iterator, ckId)) {
    iterator.discard(4);
    if (!stateIfExpectingSideEffects) {
      throw new Error("No state if expecting side effects");
    }
    stateIfExpectingSideEffects.mediaSection.addMediaSection({
      start: iterator.counter.getOffset(),
      size: ckSize - 4
    });
    if (riffHasIndex(stateIfExpectingSideEffects.structure.getRiffStructure())) {
      stateIfExpectingSideEffects.riff.lazyIdx1.triggerLoad(iterator.counter.getOffset() + ckSize - 4);
    }
    return null;
  }
  if (iterator.bytesRemaining() < ckSize) {
    checkpoint.returnToCheckpoint();
    return null;
  }
  const box = await parseRiffBox({
    id: ckId,
    size: ckSize,
    iterator,
    stateIfExpectingSideEffects
  });
  return box;
};

// src/containers/riff/parse-movi.ts
var handleChunk = async ({
  state,
  ckId,
  ckSize
}) => {
  const { iterator } = state;
  const offset = iterator.counter.getOffset() - 8;
  const videoChunk = ckId.match(/^([0-9]{2})dc$/);
  if (videoChunk) {
    const trackId = parseInt(videoChunk[1], 10);
    const strh = getStrhForIndex(state.structure.getRiffStructure(), trackId);
    const samplesPerSecond = strh.rate / strh.scale;
    const data = iterator.getSlice(ckSize);
    const infos = parseAvc(data, state.avc);
    const keyOrDelta = getKeyFrameOrDeltaFromAvcInfo(infos);
    const info = infos.find((i) => i.type === "keyframe" || i.type === "delta-frame");
    const avcProfile = infos.find((i) => i.type === "avc-profile");
    const ppsProfile = infos.find((i) => i.type === "avc-pps");
    if (avcProfile && ppsProfile && !state.riff.getAvcProfile()) {
      await state.riff.onProfile({ pps: ppsProfile, sps: avcProfile });
      state.callbacks.tracks.setIsDone(state.logLevel);
    }
    const rawSample = {
      data,
      duration: 1 / samplesPerSecond,
      type: keyOrDelta === "bidirectional" ? "delta" : keyOrDelta,
      offset,
      avc: info
    };
    const maxFramesInBuffer = state.avc.getMaxFramesInBuffer();
    if (maxFramesInBuffer === null) {
      throw new Error("maxFramesInBuffer is null");
    }
    if ((info?.poc ?? null) === null) {
      throw new Error("poc is null");
    }
    const keyframeOffset = state.riff.sampleCounter.getKeyframeAtOffset(rawSample);
    if (keyframeOffset !== null) {
      state.riff.sampleCounter.setPocAtKeyframeOffset({
        keyframeOffset,
        poc: info.poc
      });
    }
    state.riff.queuedBFrames.addFrame({
      frame: rawSample,
      trackId,
      maxFramesInBuffer,
      timescale: samplesPerSecond
    });
    const releasedFrame = state.riff.queuedBFrames.getReleasedFrame();
    if (!releasedFrame) {
      return;
    }
    const videoSample = convertQueuedSampleToMediaParserSample({
      sample: releasedFrame.sample,
      state,
      trackId: releasedFrame.trackId
    });
    state.riff.sampleCounter.onVideoSample({
      trackId,
      videoSample
    });
    await state.callbacks.onVideoSample({
      videoSample,
      trackId
    });
  }
  const audioChunk = ckId.match(/^([0-9]{2})wb$/);
  if (audioChunk) {
    const trackId = parseInt(audioChunk[1], 10);
    const strh = getStrhForIndex(state.structure.getRiffStructure(), trackId);
    const { strf } = strh;
    if (strf.type !== "strf-box-audio") {
      throw new Error("audio");
    }
    const samplesPerSecond = strh.rate / strh.scale * strf.numberOfChannels;
    const nthSample = state.riff.sampleCounter.getSampleCountForTrack({
      trackId
    });
    const timeInSec = nthSample / samplesPerSecond;
    const timestamp = Math.floor(timeInSec * WEBCODECS_TIMESCALE);
    const data = iterator.getSlice(ckSize);
    const audioSample = {
      decodingTimestamp: timestamp,
      data,
      duration: undefined,
      timestamp,
      type: "key",
      offset
    };
    state.riff.sampleCounter.onAudioSample(trackId, audioSample);
    await state.callbacks.onAudioSample({
      audioSample,
      trackId
    });
  }
};
var parseMovi = async ({
  state
}) => {
  const { iterator } = state;
  if (iterator.bytesRemaining() < 8) {
    return Promise.resolve();
  }
  const checkpoint = iterator.startCheckpoint();
  const ckId = iterator.getByteString(4, false);
  const ckSize = iterator.getUint32Le();
  if (iterator.bytesRemaining() < ckSize) {
    checkpoint.returnToCheckpoint();
    return Promise.resolve();
  }
  await handleChunk({ state, ckId, ckSize });
  const mediaSection = state.mediaSection.getMediaSectionAssertOnlyOne();
  const maxOffset = mediaSection.start + mediaSection.size;
  while (iterator.counter.getOffset() < maxOffset && iterator.bytesRemaining() > 0) {
    if (iterator.getUint8() !== 0) {
      iterator.counter.decrement(1);
      break;
    }
  }
};

// src/containers/riff/parse-video-section.ts
var parseMediaSection = async (state) => {
  await parseMovi({
    state
  });
  const tracks2 = getTracks(state, false);
  if (!tracks2.some((t) => t.type === "video" && t.codec === TO_BE_OVERRIDDEN_LATER) && !state.callbacks.tracks.getIsDone()) {
    state.callbacks.tracks.setIsDone(state.logLevel);
  }
};

// src/containers/riff/parse-riff-body.ts
var parseRiffBody = async (state) => {
  const releasedFrame = state.riff.queuedBFrames.getReleasedFrame();
  if (releasedFrame) {
    const converted = convertQueuedSampleToMediaParserSample({
      sample: releasedFrame.sample,
      state,
      trackId: releasedFrame.trackId
    });
    state.riff.sampleCounter.onVideoSample({
      trackId: releasedFrame.trackId,
      videoSample: converted
    });
    await state.callbacks.onVideoSample({
      videoSample: converted,
      trackId: releasedFrame.trackId
    });
    return null;
  }
  if (state.mediaSection.isCurrentByteInMediaSection(state.iterator) === "in-section") {
    if (maySkipVideoData({
      state
    }) && state.riff.getAvcProfile()) {
      const mediaSection = getCurrentMediaSection({
        offset: state.iterator.counter.getOffset(),
        mediaSections: state.mediaSection.getMediaSections()
      });
      if (!mediaSection) {
        throw new Error("No video section defined");
      }
      return Promise.resolve(makeSkip(mediaSection.start + mediaSection.size));
    }
    await parseMediaSection(state);
    return null;
  }
  const box = await expectRiffBox({
    iterator: state.iterator,
    stateIfExpectingSideEffects: state
  });
  if (box !== null) {
    await postProcessRiffBox(state, box);
    const structure = state.structure.getRiffStructure();
    structure.boxes.push(box);
  }
  return null;
};

// src/containers/riff/parse-riff-header.ts
var parseRiffHeader = (state) => {
  const riff = state.iterator.getByteString(4, false);
  if (riff !== "RIFF") {
    throw new Error("Not a RIFF file");
  }
  const structure = state.structure.getRiffStructure();
  const size = state.iterator.getUint32Le();
  const fileType = state.iterator.getByteString(4, false);
  if (fileType !== "WAVE" && fileType !== "AVI") {
    throw new Error(`File type ${fileType} not supported`);
  }
  structure.boxes.push({ type: "riff-header", fileSize: size, fileType });
  return null;
};

// src/containers/riff/parse-riff.ts
var parseRiff = (state) => {
  if (state.iterator.counter.getOffset() === 0) {
    return Promise.resolve(parseRiffHeader(state));
  }
  return parseRiffBody(state);
};

// src/containers/transport-stream/discard-rest-of-packet.ts
var discardRestOfPacket = (iterator) => {
  const next188 = 188 - iterator.counter.getOffset() % 188;
  iterator.discard(next188);
};
var getRestOfPacket = (iterator) => {
  const next188 = 188 - iterator.counter.getOffset() % 188;
  return iterator.getSlice(next188);
};

// src/containers/transport-stream/parse-pat.ts
var parsePatTable = (iterator, tableId) => {
  iterator.getUint16();
  iterator.startReadingBits();
  iterator.getBits(7);
  iterator.getBits(1);
  const sectionNumber = iterator.getBits(8);
  const lastSectionNumber = iterator.getBits(8);
  if (tableId !== 0) {
    throw new Error("Invalid table ID: " + tableId);
  }
  const tables = [];
  for (let i = sectionNumber;i <= lastSectionNumber; i++) {
    const programNumber = iterator.getBits(16);
    iterator.getBits(3);
    const programMapIdentifier = iterator.getBits(13);
    tables.push({
      type: "transport-stream-program-association-table",
      programNumber,
      programMapIdentifier
    });
  }
  iterator.stopReadingBits();
  return {
    type: "transport-stream-pat-box",
    tableId: tableId.toString(16),
    pat: tables
  };
};
var parsePat = (iterator) => {
  iterator.startReadingBits();
  const tableId = iterator.getBits(8);
  iterator.getBits(1);
  iterator.getBits(1);
  iterator.getBits(4);
  const sectionLength = iterator.getBits(10);
  if (sectionLength > 1021) {
    throw new Error("Invalid section length");
  }
  iterator.stopReadingBits();
  const tables = parsePatTable(iterator, tableId);
  discardRestOfPacket(iterator);
  return tables;
};
var parseSdt = (iterator) => {
  iterator.startReadingBits();
  iterator.getBits(8);
  iterator.getBits(1);
  iterator.getBits(1);
  iterator.getBits(2);
  const sectionLength = iterator.getBits(12);
  iterator.stopReadingBits();
  iterator.discard(sectionLength);
  discardRestOfPacket(iterator);
  return {
    type: "transport-stream-sdt-box"
  };
};

// src/containers/transport-stream/parse-pes.ts
var parsePes = ({
  iterator,
  offset
}) => {
  const ident = iterator.getUint24();
  if (ident !== 1) {
    throw new Error(`Unexpected PES packet start code: ${ident.toString(16)}`);
  }
  const streamId = iterator.getUint8();
  iterator.getUint16();
  iterator.startReadingBits();
  const markerBits = iterator.getBits(2);
  if (markerBits !== 2) {
    throw new Error(`Invalid marker bits: ${markerBits}`);
  }
  const scrambled = iterator.getBits(2);
  if (scrambled !== 0) {
    throw new Error(`Only supporting non-scrambled streams`);
  }
  const priority = iterator.getBits(1);
  iterator.getBits(1);
  iterator.getBits(1);
  iterator.getBits(1);
  const ptsPresent = iterator.getBits(1);
  const dtsPresent = iterator.getBits(1);
  if (!ptsPresent && dtsPresent) {
    throw new Error(`DTS is present but not PTS, this is not allowed in the spec`);
  }
  iterator.getBits(1);
  iterator.getBits(1);
  iterator.getBits(1);
  iterator.getBits(1);
  iterator.getBits(1);
  iterator.getBits(1);
  const pesHeaderLength = iterator.getBits(8);
  const offsetAfterHeader = iterator.counter.getOffset();
  let pts = null;
  if (!ptsPresent) {
    throw new Error(`PTS is required`);
  }
  const fourBits = iterator.getBits(4);
  if (fourBits !== 3 && fourBits !== 2) {
    throw new Error(`Invalid PTS marker bits: ${fourBits}`);
  }
  const pts1 = iterator.getBits(3);
  iterator.getBits(1);
  const pts2 = iterator.getBits(15);
  iterator.getBits(1);
  const pts3 = iterator.getBits(15);
  iterator.getBits(1);
  pts = pts1 << 30 | pts2 << 15 | pts3;
  let dts = null;
  if (dtsPresent) {
    const _fourBits = iterator.getBits(4);
    if (_fourBits !== 1) {
      throw new Error(`Invalid DTS marker bits: ${_fourBits}`);
    }
    const dts1 = iterator.getBits(3);
    iterator.getBits(1);
    const dts2 = iterator.getBits(15);
    iterator.getBits(1);
    const dts3 = iterator.getBits(15);
    iterator.getBits(1);
    dts = dts1 << 30 | dts2 << 15 | dts3;
  }
  iterator.stopReadingBits();
  iterator.discard(pesHeaderLength - (iterator.counter.getOffset() - offsetAfterHeader));
  const packet = {
    dts,
    pts,
    streamId,
    priority,
    offset
  };
  return packet;
};

// src/containers/transport-stream/parse-pmt.ts
var parsePmtTable = ({
  iterator,
  tableId,
  sectionLength
}) => {
  const start = iterator.counter.getOffset();
  iterator.getUint16();
  iterator.startReadingBits();
  iterator.getBits(7);
  iterator.getBits(1);
  const sectionNumber = iterator.getBits(8);
  const lastSectionNumber = iterator.getBits(8);
  const tables = [];
  iterator.getBits(3);
  iterator.getBits(13);
  iterator.getBits(4);
  const programInfoLength = iterator.getBits(12);
  iterator.getBits(programInfoLength * 8);
  for (let i = sectionNumber;i <= lastSectionNumber; i++) {
    const streams = [];
    while (true) {
      const streamType = iterator.getBits(8);
      iterator.getBits(3);
      const elementaryPid = iterator.getBits(13);
      iterator.getBits(4);
      const esInfoLength = iterator.getBits(12);
      iterator.getBits(esInfoLength * 8);
      streams.push({ streamType, pid: elementaryPid });
      const remaining = sectionLength - (iterator.counter.getOffset() - start);
      if (remaining <= 4) {
        break;
      }
    }
    tables.push({
      type: "transport-stream-program-map-table",
      streams
    });
  }
  if (tables.length !== 1) {
    throw new Error("Does not PMT table with more than 1 entry, uncommon");
  }
  iterator.stopReadingBits();
  return {
    type: "transport-stream-pmt-box",
    tableId,
    streams: tables[0].streams
  };
};
var parsePmt = (iterator) => {
  iterator.startReadingBits();
  const tableId = iterator.getBits(8);
  iterator.getBits(1);
  iterator.getBits(1);
  iterator.getBits(4);
  const sectionLength = iterator.getBits(10);
  if (sectionLength > 1021) {
    throw new Error("Invalid section length");
  }
  iterator.stopReadingBits();
  const tables = parsePmtTable({ iterator, tableId, sectionLength });
  discardRestOfPacket(iterator);
  return tables;
};

// src/containers/transport-stream/find-separator.ts
function findNthSubarrayIndex({
  array,
  subarray,
  n,
  startIndex,
  startCount
}) {
  const subarrayLength = subarray.length;
  const arrayLength = array.length;
  let count = startCount;
  let i = startIndex;
  for (i;i <= arrayLength - subarrayLength; i++) {
    let match = true;
    for (let j = 0;j < subarrayLength; j++) {
      if (array[i + j] !== subarray[j]) {
        match = false;
        break;
      }
    }
    if (match) {
      count++;
      if (count === n) {
        return { type: "found", index: i };
      }
    }
  }
  return { type: "not-found", index: i, count };
}

// src/containers/transport-stream/adts-header.ts
var readAdtsHeader = (buffer) => {
  if (buffer.byteLength < 9) {
    return null;
  }
  const iterator = getArrayBufferIterator({
    initialData: buffer,
    maxBytes: buffer.byteLength,
    logLevel: "error"
  });
  iterator.startReadingBits();
  const bits = iterator.getBits(12);
  if (bits !== 4095) {
    throw new Error("Invalid ADTS header ");
  }
  const id = iterator.getBits(1);
  if (id !== 0) {
    throw new Error("Only supporting MPEG-4 for .ts");
  }
  const layer = iterator.getBits(2);
  if (layer !== 0) {
    throw new Error("Only supporting layer 0 for .ts");
  }
  const protectionAbsent = iterator.getBits(1);
  const audioObjectType = iterator.getBits(2);
  const samplingFrequencyIndex = iterator.getBits(4);
  const sampleRate = getSampleRateFromSampleFrequencyIndex(samplingFrequencyIndex);
  iterator.getBits(1);
  const channelConfiguration = iterator.getBits(3);
  const codecPrivate2 = createAacCodecPrivate({
    audioObjectType,
    sampleRate,
    channelConfiguration,
    codecPrivate: null
  });
  iterator.getBits(1);
  iterator.getBits(1);
  iterator.getBits(1);
  iterator.getBits(1);
  const frameLength = iterator.getBits(13);
  iterator.getBits(11);
  iterator.getBits(2);
  if (!protectionAbsent) {
    iterator.getBits(16);
  }
  iterator.stopReadingBits();
  iterator.destroy();
  return {
    frameLength,
    codecPrivate: codecPrivate2,
    channelConfiguration,
    sampleRate,
    audioObjectType
  };
};

// src/containers/transport-stream/handle-aac-packet.ts
var handleAacPacket = async ({
  streamBuffer,
  programId,
  offset,
  sampleCallbacks,
  logLevel,
  onAudioTrack,
  transportStream,
  makeSamplesStartAtZero
}) => {
  const adtsHeader = readAdtsHeader(streamBuffer.getBuffer());
  if (!adtsHeader) {
    throw new Error("Invalid ADTS header - too short");
  }
  const { channelConfiguration, codecPrivate: codecPrivate2, sampleRate, audioObjectType } = adtsHeader;
  const isTrackRegistered = sampleCallbacks.tracks.getTracks().find((t) => {
    return t.trackId === programId;
  });
  if (!isTrackRegistered) {
    const startOffset = makeSamplesStartAtZero ? Math.min(streamBuffer.pesHeader.pts, streamBuffer.pesHeader.dts ?? Infinity) : 0;
    transportStream.startOffset.setOffset({
      trackId: programId,
      newOffset: startOffset
    });
    const track = {
      type: "audio",
      codecData: { type: "aac-config", data: codecPrivate2 },
      trackId: programId,
      originalTimescale: MPEG_TIMESCALE,
      codecEnum: "aac",
      codec: mapAudioObjectTypeToCodecString(audioObjectType),
      description: codecPrivate2,
      numberOfChannels: channelConfiguration,
      sampleRate,
      startInSeconds: 0,
      timescale: WEBCODECS_TIMESCALE,
      trackMediaTimeOffsetInTrackTimescale: 0
    };
    await registerAudioTrack({
      track,
      container: "transport-stream",
      registerAudioSampleCallback: sampleCallbacks.registerAudioSampleCallback,
      tracks: sampleCallbacks.tracks,
      logLevel,
      onAudioTrack
    });
  }
  const sample = {
    decodingTimestamp: (streamBuffer.pesHeader.dts ?? streamBuffer.pesHeader.pts) - transportStream.startOffset.getOffset(programId),
    timestamp: streamBuffer.pesHeader.pts - transportStream.startOffset.getOffset(programId),
    duration: undefined,
    data: streamBuffer.getBuffer(),
    type: "key",
    offset
  };
  const audioSample = convertAudioOrVideoSampleToWebCodecsTimestamps({
    sample,
    timescale: MPEG_TIMESCALE
  });
  await sampleCallbacks.onAudioSample({
    audioSample,
    trackId: programId
  });
  transportStream.lastEmittedSample.setLastEmittedSample(sample);
};

// src/containers/transport-stream/process-stream-buffers.ts
var makeTransportStreamPacketBuffer = ({
  buffers,
  pesHeader,
  offset
}) => {
  let currentBuf = buffers ? [buffers] : [];
  let subarrayIndex = null;
  const getBuffer = () => {
    if (currentBuf.length === 0) {
      return new Uint8Array;
    }
    if (currentBuf.length === 1) {
      return currentBuf[0];
    }
    currentBuf = [combineUint8Arrays(currentBuf)];
    return currentBuf[0];
  };
  let fastFind = null;
  return {
    pesHeader,
    offset,
    getBuffer,
    addBuffer: (buffer) => {
      currentBuf.push(buffer);
      subarrayIndex = null;
    },
    get2ndSubArrayIndex: () => {
      if (subarrayIndex === null) {
        const result = findNthSubarrayIndex({
          array: getBuffer(),
          subarray: new Uint8Array([0, 0, 1, 9]),
          n: 2,
          startIndex: fastFind?.index ?? 0,
          startCount: fastFind?.count ?? 0
        });
        if (result.type === "found") {
          subarrayIndex = result.index;
          fastFind = null;
        } else {
          fastFind = result;
          return -1;
        }
      }
      return subarrayIndex;
    }
  };
};
var processStreamBuffer = async ({
  streamBuffer,
  programId,
  structure,
  sampleCallbacks,
  logLevel,
  onAudioTrack,
  onVideoTrack,
  transportStream,
  makeSamplesStartAtZero,
  avcState
}) => {
  const stream = getStreamForId(structure, programId);
  if (!stream) {
    throw new Error("No stream found");
  }
  if (stream.streamType === 2) {
    throw new Error("H.262 video stream not supported");
  }
  if (stream.streamType === 27) {
    await handleAvcPacket({
      programId,
      streamBuffer,
      sampleCallbacks,
      logLevel,
      onVideoTrack,
      offset: streamBuffer.offset,
      transportStream,
      makeSamplesStartAtZero,
      avcState
    });
  } else if (stream.streamType === 15) {
    await handleAacPacket({
      streamBuffer,
      programId,
      offset: streamBuffer.offset,
      sampleCallbacks,
      logLevel,
      onAudioTrack,
      transportStream,
      makeSamplesStartAtZero
    });
  }
  if (!sampleCallbacks.tracks.hasAllTracks()) {
    const tracksRegistered = sampleCallbacks.tracks.getTracks().length;
    const { streams } = findProgramMapTableOrThrow(structure);
    if (filterStreamsBySupportedTypes(streams).length === tracksRegistered) {
      sampleCallbacks.tracks.setIsDone(logLevel);
    }
  }
};
var processFinalStreamBuffers = async ({
  structure,
  sampleCallbacks,
  logLevel,
  onAudioTrack,
  onVideoTrack,
  transportStream,
  makeSamplesStartAtZero,
  avcState
}) => {
  for (const [programId, buffer] of transportStream.streamBuffers) {
    if (buffer.getBuffer().byteLength > 0) {
      await processStreamBuffer({
        streamBuffer: buffer,
        programId,
        structure,
        sampleCallbacks,
        logLevel,
        onAudioTrack,
        onVideoTrack,
        transportStream,
        makeSamplesStartAtZero,
        avcState
      });
      transportStream.streamBuffers.delete(programId);
    }
  }
};

// src/containers/transport-stream/parse-stream-packet.ts
var parseStream = ({
  transportStreamEntry,
  programId,
  iterator,
  transportStream
}) => {
  const restOfPacket = getRestOfPacket(iterator);
  const offset = iterator.counter.getOffset();
  const { streamBuffers, nextPesHeaderStore: nextPesHeader } = transportStream;
  if (!streamBuffers.has(transportStreamEntry.pid)) {
    streamBuffers.set(programId, makeTransportStreamPacketBuffer({
      pesHeader: nextPesHeader.getNextPesHeader(),
      buffers: null,
      offset
    }));
  }
  const streamBuffer = streamBuffers.get(transportStreamEntry.pid);
  streamBuffer.addBuffer(restOfPacket);
};

// src/containers/transport-stream/parse-packet.ts
var parsePacket = ({
  iterator,
  structure,
  transportStream
}) => {
  const offset = iterator.counter.getOffset();
  const syncByte = iterator.getUint8();
  if (syncByte !== 71) {
    throw new Error("Invalid sync byte");
  }
  iterator.startReadingBits();
  iterator.getBits(1);
  const payloadUnitStartIndicator = iterator.getBits(1);
  iterator.getBits(1);
  const programId = iterator.getBits(13);
  iterator.getBits(2);
  const adaptationFieldControl1 = iterator.getBits(1);
  iterator.getBits(1);
  iterator.getBits(4);
  iterator.stopReadingBits();
  if (adaptationFieldControl1 === 1) {
    iterator.startReadingBits();
    const adaptationFieldLength = iterator.getBits(8);
    const headerOffset = iterator.counter.getOffset();
    if (adaptationFieldLength > 0) {
      iterator.getBits(1);
      iterator.getBits(1);
      iterator.getBits(1);
      iterator.getBits(1);
      iterator.getBits(1);
      iterator.getBits(1);
      iterator.getBits(1);
      iterator.getBits(1);
    }
    const remaining = adaptationFieldLength - (iterator.counter.getOffset() - headerOffset);
    iterator.stopReadingBits();
    const toDiscard = Math.max(0, remaining);
    iterator.discard(toDiscard);
  }
  const read = iterator.counter.getOffset() - offset;
  if (read === 188) {
    return null;
  }
  const pat = structure.boxes.find((b) => b.type === "transport-stream-pmt-box");
  const isPes = payloadUnitStartIndicator && pat?.streams.find((e) => e.pid === programId);
  if (isPes) {
    const packetPes = parsePes({ iterator, offset });
    transportStream.nextPesHeaderStore.setNextPesHeader(packetPes);
    transportStream.observedPesHeaders.addPesHeader(packetPes);
  } else if (payloadUnitStartIndicator === 1) {
    iterator.getUint8();
  }
  if (programId === 0) {
    return parsePat(iterator);
  }
  if (programId === 17) {
    return parseSdt(iterator);
  }
  const program = programId === 17 ? null : getProgramForId(structure, programId);
  if (program) {
    const pmt = parsePmt(iterator);
    return pmt;
  }
  const transportStreamEntry = getStreamForId(structure, programId);
  if (transportStreamEntry) {
    parseStream({
      transportStreamEntry,
      iterator,
      transportStream,
      programId
    });
    return null;
  }
  throw new Error("Unknown packet identifier");
};

// src/containers/transport-stream/process-audio.ts
var canProcessAudio = ({
  streamBuffer
}) => {
  const expectedLength = readAdtsHeader(streamBuffer.getBuffer())?.frameLength ?? null;
  if (expectedLength === null) {
    return false;
  }
  if (expectedLength > streamBuffer.getBuffer().length) {
    return false;
  }
  return true;
};
var processAudio = async ({
  transportStreamEntry,
  structure,
  offset,
  sampleCallbacks,
  logLevel,
  onAudioTrack,
  onVideoTrack,
  transportStream,
  makeSamplesStartAtZero,
  avcState
}) => {
  const { streamBuffers, nextPesHeaderStore: nextPesHeader } = transportStream;
  const streamBuffer = streamBuffers.get(transportStreamEntry.pid);
  if (!streamBuffer) {
    throw new Error("Stream buffer not found");
  }
  const expectedLength = readAdtsHeader(streamBuffer.getBuffer())?.frameLength ?? null;
  if (expectedLength === null) {
    throw new Error("Expected length is null");
  }
  if (expectedLength > streamBuffer.getBuffer().length) {
    throw new Error("Expected length is greater than stream buffer length");
  }
  await processStreamBuffer({
    streamBuffer: makeTransportStreamPacketBuffer({
      buffers: streamBuffer.getBuffer().slice(0, expectedLength),
      offset,
      pesHeader: streamBuffer.pesHeader
    }),
    programId: transportStreamEntry.pid,
    structure,
    sampleCallbacks,
    logLevel,
    onAudioTrack,
    onVideoTrack,
    transportStream,
    makeSamplesStartAtZero,
    avcState
  });
  const rest = streamBuffer.getBuffer().slice(expectedLength);
  streamBuffers.set(transportStreamEntry.pid, makeTransportStreamPacketBuffer({
    buffers: rest,
    pesHeader: nextPesHeader.getNextPesHeader(),
    offset
  }));
};

// src/containers/transport-stream/process-video.ts
var canProcessVideo = ({
  streamBuffer
}) => {
  const indexOfSeparator = streamBuffer.get2ndSubArrayIndex();
  if (indexOfSeparator === -1 || indexOfSeparator === 0) {
    return false;
  }
  return true;
};
var processVideo = async ({
  programId,
  structure,
  streamBuffer,
  sampleCallbacks,
  logLevel,
  onAudioTrack,
  onVideoTrack,
  transportStream,
  makeSamplesStartAtZero,
  avcState
}) => {
  const indexOfSeparator = streamBuffer.get2ndSubArrayIndex();
  if (indexOfSeparator === -1 || indexOfSeparator === 0) {
    throw new Error("cannot process avc stream");
  }
  const buf = streamBuffer.getBuffer();
  const packet = buf.slice(0, indexOfSeparator);
  const rest = buf.slice(indexOfSeparator);
  await processStreamBuffer({
    streamBuffer: makeTransportStreamPacketBuffer({
      offset: streamBuffer.offset,
      pesHeader: streamBuffer.pesHeader,
      buffers: packet
    }),
    programId,
    structure,
    sampleCallbacks,
    logLevel,
    onAudioTrack,
    onVideoTrack,
    transportStream,
    makeSamplesStartAtZero,
    avcState
  });
  return rest;
};

// src/containers/transport-stream/process-sample-if-possible.ts
var processSampleIfPossible = async (state) => {
  const programMap = findProgramMapOrNull(state.structure.getTsStructure());
  if (!programMap) {
    return;
  }
  let processed = false;
  for (const stream of programMap.streams) {
    const streamBuffer = state.transportStream.streamBuffers.get(stream.pid);
    if (!streamBuffer) {
      continue;
    }
    if (stream.streamType === 27) {
      if (canProcessVideo({ streamBuffer })) {
        const rest = await processVideo({
          programId: stream.pid,
          structure: state.structure.getTsStructure(),
          streamBuffer,
          sampleCallbacks: state.callbacks,
          logLevel: state.logLevel,
          onAudioTrack: state.onAudioTrack,
          onVideoTrack: state.onVideoTrack,
          transportStream: state.transportStream,
          makeSamplesStartAtZero: state.makeSamplesStartAtZero,
          avcState: state.avc
        });
        state.transportStream.streamBuffers.delete(stream.pid);
        state.transportStream.streamBuffers.set(stream.pid, makeTransportStreamPacketBuffer({
          pesHeader: state.transportStream.nextPesHeaderStore.getNextPesHeader(),
          buffers: rest,
          offset: state.iterator.counter.getOffset()
        }));
        processed = true;
        break;
      }
    }
    if (stream.streamType === 15) {
      if (canProcessAudio({ streamBuffer })) {
        await processAudio({
          structure: state.structure.getTsStructure(),
          offset: state.iterator.counter.getOffset(),
          sampleCallbacks: state.callbacks,
          logLevel: state.logLevel,
          onAudioTrack: state.onAudioTrack,
          onVideoTrack: state.onVideoTrack,
          transportStream: state.transportStream,
          makeSamplesStartAtZero: state.makeSamplesStartAtZero,
          transportStreamEntry: stream,
          avcState: state.avc
        });
        processed = true;
        break;
      }
    }
  }
  return processed;
};

// src/containers/transport-stream/parse-transport-stream.ts
var parseTransportStream = async (state) => {
  const structure = state.structure.getTsStructure();
  const processed = await processSampleIfPossible(state);
  if (processed) {
    return Promise.resolve(null);
  }
  const { iterator } = state;
  if (iterator.bytesRemaining() < 188) {
    return Promise.resolve(null);
  }
  const packet = parsePacket({
    iterator,
    structure,
    transportStream: state.transportStream
  });
  if (packet) {
    structure.boxes.push(packet);
  }
  if (iterator.bytesRemaining() === 0) {
    await processFinalStreamBuffers({
      transportStream: state.transportStream,
      structure,
      sampleCallbacks: state.callbacks,
      logLevel: state.logLevel,
      onAudioTrack: state.onAudioTrack,
      onVideoTrack: state.onVideoTrack,
      makeSamplesStartAtZero: state.makeSamplesStartAtZero,
      avcState: state.avc
    });
  }
  return Promise.resolve(null);
};

// src/containers/wav/parse-data.ts
var parseData = ({
  state
}) => {
  const { iterator } = state;
  const ckSize = iterator.getUint32Le();
  const box = {
    type: "wav-data",
    dataSize: ckSize
  };
  state.structure.getWavStructure().boxes.push(box);
  state.callbacks.tracks.setIsDone(state.logLevel);
  state.mediaSection.addMediaSection({
    size: ckSize,
    start: iterator.counter.getOffset()
  });
  if (maySkipVideoData({ state })) {
    return Promise.resolve(makeSkip(iterator.counter.getOffset() + ckSize));
  }
  return Promise.resolve(null);
};

// src/containers/wav/parse-fact.ts
var parseFact = ({
  state
}) => {
  const { iterator } = state;
  const size = iterator.getUint32Le();
  if (size !== 4) {
    throw new Error(`Expected size 4 for fact box, got ${size}`);
  }
  const numberOfSamplesPerChannel = iterator.getUint32Le();
  const factBox = {
    type: "wav-fact",
    numberOfSamplesPerChannel
  };
  state.structure.getWavStructure().boxes.push(factBox);
  return Promise.resolve(null);
};

// src/containers/wav/subformats.ts
var WMMEDIASUBTYPE_PCM = [
  1,
  0,
  0,
  0,
  0,
  0,
  16,
  0,
  128,
  0,
  0,
  170,
  0,
  56,
  155,
  113
];
var KSDATAFORMAT_SUBTYPE_IEEE_FLOAT = [
  3,
  0,
  0,
  0,
  0,
  0,
  16,
  0,
  128,
  0,
  0,
  170,
  0,
  56,
  155,
  113
];
var subformatIsPcm = (subformat) => {
  return subformat.every((value, index) => value === WMMEDIASUBTYPE_PCM[index]);
};
var subformatIsIeeeFloat = (subformat) => {
  return subformat.every((value, index) => value === KSDATAFORMAT_SUBTYPE_IEEE_FLOAT[index]);
};

// src/containers/wav/parse-fmt.ts
var CHANNELS = {
  0: "Front Left",
  1: "Front Right",
  2: "Front Center",
  3: "Low Frequency",
  4: "Back Left",
  5: "Back Right",
  6: "Front Left of Center",
  7: "Front Right of Center",
  8: "Back Center",
  9: "Side Left",
  10: "Side Right",
  11: "Top Center",
  12: "Top Front Left",
  13: "Top Front Center",
  14: "Top Front Right",
  15: "Top Back Left",
  16: "Top Back Center",
  17: "Top Back Right"
};
function getChannelsFromMask(channelMask) {
  const channels2 = [];
  for (let bit = 0;bit < 18; bit++) {
    if ((channelMask & 1 << bit) !== 0) {
      const channelName = CHANNELS[bit];
      if (channelName) {
        channels2.push(channelName);
      } else {
        channels2.push(`Unknown Channel (bit ${bit})`);
      }
    }
  }
  return channels2;
}
var parseFmt = async ({
  state
}) => {
  const { iterator } = state;
  const ckSize = iterator.getUint32Le();
  const box = iterator.startBox(ckSize);
  const audioFormat = iterator.getUint16Le();
  if (audioFormat !== 1 && audioFormat !== 65534) {
    throw new Error(`Only supporting WAVE with PCM audio format, but got ${audioFormat}`);
  }
  const numberOfChannels = iterator.getUint16Le();
  const sampleRate = iterator.getUint32Le();
  const byteRate = iterator.getUint32Le();
  const blockAlign = iterator.getUint16Le();
  const bitsPerSample = iterator.getUint16Le();
  const format = bitsPerSample === 16 ? "pcm-s16" : bitsPerSample === 32 ? "pcm-s32" : bitsPerSample === 24 ? "pcm-s24" : null;
  if (format === null) {
    throw new Error(`Unsupported bits per sample: ${bitsPerSample}`);
  }
  const wavHeader = {
    bitsPerSample,
    blockAlign,
    byteRate,
    numberOfChannels,
    sampleRate,
    type: "wav-fmt"
  };
  state.structure.getWavStructure().boxes.push(wavHeader);
  if (audioFormat === 65534) {
    const extraSize = iterator.getUint16Le();
    if (extraSize !== 22) {
      throw new Error(`Only supporting WAVE with 22 extra bytes, but got ${extraSize} bytes extra size`);
    }
    iterator.getUint16Le();
    const channelMask = iterator.getUint32Le();
    const subFormat = iterator.getSlice(16);
    if (subFormat.length !== 16) {
      throw new Error(`Only supporting WAVE with PCM audio format, but got ${subFormat.length}`);
    }
    if (subformatIsPcm(subFormat)) {} else if (subformatIsIeeeFloat(subFormat)) {} else {
      throw new Error(`Unsupported subformat: ${subFormat}`);
    }
    const channels2 = getChannelsFromMask(channelMask);
    wavHeader.numberOfChannels = channels2.length;
  }
  await registerAudioTrack({
    track: {
      type: "audio",
      codec: format,
      codecData: null,
      description: undefined,
      codecEnum: format,
      numberOfChannels,
      sampleRate,
      originalTimescale: 1e6,
      trackId: 0,
      startInSeconds: 0,
      timescale: WEBCODECS_TIMESCALE,
      trackMediaTimeOffsetInTrackTimescale: 0
    },
    container: "wav",
    registerAudioSampleCallback: state.callbacks.registerAudioSampleCallback,
    tracks: state.callbacks.tracks,
    logLevel: state.logLevel,
    onAudioTrack: state.onAudioTrack
  });
  box.expectNoMoreBytes();
  return Promise.resolve(null);
};

// src/containers/wav/parse-header.ts
var parseHeader = ({
  state
}) => {
  const fileSize = state.iterator.getUint32Le();
  const fileType = state.iterator.getByteString(4, false);
  if (fileType !== "WAVE") {
    throw new Error(`Expected WAVE, got ${fileType}`);
  }
  const header = {
    type: "wav-header",
    fileSize
  };
  state.structure.getWavStructure().boxes.push(header);
  return Promise.resolve(null);
};

// src/containers/wav/parse-id3.ts
var parseId32 = ({
  state
}) => {
  const { iterator } = state;
  const id3Size = iterator.getUint32Le();
  iterator.discard(id3Size);
  const id3Box = {
    type: "wav-id3"
  };
  state.structure.getWavStructure().boxes.push(id3Box);
  return Promise.resolve(null);
};

// src/containers/wav/parse-junk.ts
var parseJunk = ({
  state
}) => {
  const { iterator } = state;
  const ckSize = iterator.getUint32Le();
  Log.trace(state.logLevel, `Skipping JUNK chunk of size ${ckSize}`);
  iterator.discard(ckSize);
  return Promise.resolve(null);
};

// src/containers/wav/parse-list.ts
var parseList = ({
  state
}) => {
  const { iterator } = state;
  const ckSize = iterator.getUint32Le();
  const box = iterator.startBox(ckSize);
  const startOffset = iterator.counter.getOffset();
  const type = iterator.getByteString(4, false);
  if (type !== "INFO") {
    iterator.discard(ckSize - 4);
    return Promise.resolve(null);
  }
  const metadata = [];
  const remainingBytes = () => ckSize - (iterator.counter.getOffset() - startOffset);
  while (remainingBytes() > 0) {
    const byte = iterator.getUint8();
    if (byte === 0) {
      continue;
    }
    iterator.counter.decrement(1);
    const key = iterator.getByteString(4, false);
    const size = iterator.getUint32Le();
    const value = iterator.getByteString(size, true);
    metadata.push({
      key,
      trackId: null,
      value
    });
  }
  const wavList = {
    type: "wav-list",
    metadata
  };
  state.structure.getWavStructure().boxes.push(wavList);
  box.expectNoMoreBytes();
  return Promise.resolve(null);
};

// src/containers/wav/parse-media-section.ts
var parseMediaSection2 = async ({
  state
}) => {
  const { iterator } = state;
  const structure = state.structure.getWavStructure();
  const videoSection = state.mediaSection.getMediaSectionAssertOnlyOne();
  const maxOffset = videoSection.start + videoSection.size;
  const maxRead = maxOffset - iterator.counter.getOffset();
  const offset = iterator.counter.getOffset();
  const fmtBox = structure.boxes.find((box) => box.type === "wav-fmt");
  if (!fmtBox) {
    throw new Error("Expected fmt box");
  }
  const toRead = Math.min(maxRead, fmtBox.sampleRate * fmtBox.blockAlign / WAVE_SAMPLES_PER_SECOND);
  const duration2 = toRead / (fmtBox.sampleRate * fmtBox.blockAlign);
  const timestamp = (offset - videoSection.start) / (fmtBox.sampleRate * fmtBox.blockAlign);
  const data = iterator.getSlice(toRead);
  const audioSample = convertAudioOrVideoSampleToWebCodecsTimestamps({
    sample: {
      decodingTimestamp: timestamp,
      data,
      duration: duration2,
      timestamp,
      type: "key",
      offset
    },
    timescale: 1
  });
  await state.callbacks.onAudioSample({
    audioSample,
    trackId: 0
  });
  return null;
};

// src/containers/wav/parse-wav.ts
var parseWav = (state) => {
  const { iterator } = state;
  const insideMediaSection = state.mediaSection.isCurrentByteInMediaSection(iterator);
  if (insideMediaSection === "in-section") {
    return parseMediaSection2({ state });
  }
  const type = iterator.getByteString(4, false).toLowerCase();
  Log.trace(state.logLevel, `Processing box type ${type}`);
  if (type === "riff") {
    return parseHeader({ state });
  }
  if (type === "fmt") {
    return parseFmt({ state });
  }
  if (type === "data") {
    return parseData({ state });
  }
  if (type === "list") {
    return parseList({ state });
  }
  if (type === "id3") {
    return parseId32({ state });
  }
  if (type === "junk" || type === "fllr" || type === "bext" || type === "cue") {
    return parseJunk({ state });
  }
  if (type === "fact") {
    return parseFact({ state });
  }
  if (type === "\x00") {
    return Promise.resolve(null);
  }
  throw new Error(`Unknown WAV box type ${type}`);
};

// src/containers/webm/get-byte-for-cues.ts
var getByteForSeek = ({
  seekHeadSegment,
  offset
}) => {
  const value = seekHeadSegment.value.map((v) => {
    if (v.type !== "Seek") {
      return null;
    }
    const seekId2 = v.value.find((_v) => {
      return _v.type === "SeekID" && _v.value === matroskaElements.Cues;
    });
    if (!seekId2) {
      return null;
    }
    const seekPosition2 = v.value.find((_v) => {
      return _v.type === "SeekPosition";
    });
    if (!seekPosition2) {
      return false;
    }
    return seekPosition2.value;
  }).filter(truthy);
  if (value.length === 0) {
    return null;
  }
  return value[0].value + offset;
};

// src/containers/webm/segments/block-simple-block-flags.ts
var parseBlockFlags = (iterator, type) => {
  if (type === matroskaElements.Block) {
    iterator.startReadingBits();
    iterator.getBits(4);
    const invisible = Boolean(iterator.getBits(1));
    const lacing = iterator.getBits(2);
    iterator.getBits(1);
    iterator.stopReadingBits();
    return {
      invisible,
      lacing,
      keyframe: null
    };
  }
  if (type === matroskaElements.SimpleBlock) {
    iterator.startReadingBits();
    const keyframe = Boolean(iterator.getBits(1));
    iterator.getBits(3);
    const invisible = Boolean(iterator.getBits(1));
    const lacing = iterator.getBits(2);
    iterator.getBits(1);
    iterator.stopReadingBits();
    return {
      invisible,
      lacing,
      keyframe
    };
  }
  throw new Error("Unexpected type");
};

// src/containers/webm/get-sample-from-block.ts
var addAvcToTrackAndActivateTrackIfNecessary = async ({
  partialVideoSample,
  codec,
  structureState: structureState2,
  webmState,
  trackNumber: trackNumber2,
  logLevel,
  callbacks,
  onVideoTrack,
  avcState
}) => {
  if (codec !== "V_MPEG4/ISO/AVC") {
    return;
  }
  const missingTracks = getTracksFromMatroska({
    structureState: structureState2,
    webmState
  }).missingInfo;
  if (missingTracks.length === 0) {
    return;
  }
  const parsed = parseAvc(partialVideoSample.data, avcState);
  for (const parse of parsed) {
    if (parse.type === "avc-profile") {
      webmState.setAvcProfileForTrackNumber(trackNumber2, parse);
      const track = missingTracks.find((t) => t.trackId === trackNumber2);
      if (!track) {
        throw new Error("Could not find track " + trackNumber2);
      }
      const resolvedTracks = getTracksFromMatroska({
        structureState: structureState2,
        webmState
      }).resolved;
      const resolvedTrack = resolvedTracks.find((t) => t.trackId === trackNumber2);
      if (!resolvedTrack) {
        throw new Error("Could not find track " + trackNumber2);
      }
      await registerVideoTrack({
        track: resolvedTrack,
        container: "webm",
        logLevel,
        onVideoTrack,
        registerVideoSampleCallback: callbacks.registerVideoSampleCallback,
        tracks: callbacks.tracks
      });
    }
  }
};
var getSampleFromBlock = async ({
  ebml,
  webmState,
  offset,
  structureState: structureState2,
  callbacks,
  logLevel,
  onVideoTrack,
  avcState
}) => {
  const iterator = getArrayBufferIterator({
    initialData: ebml.value,
    maxBytes: ebml.value.length,
    logLevel: "error"
  });
  const trackNumber2 = iterator.getVint();
  if (trackNumber2 === null) {
    throw new Error("Not enough data to get track number, should not happen");
  }
  const timecodeRelativeToCluster = iterator.getInt16();
  const { keyframe } = parseBlockFlags(iterator, ebml.type === "SimpleBlock" ? matroskaElements.SimpleBlock : matroskaElements.Block);
  const { codec, trackTimescale } = webmState.getTrackInfoByNumber(trackNumber2);
  const clusterOffset = webmState.getTimestampOffsetForByteOffset(offset);
  const timescale = webmState.getTimescale();
  if (clusterOffset === undefined) {
    throw new Error("Could not find offset for byte offset " + offset);
  }
  const timecodeInNanoSeconds = (timecodeRelativeToCluster + clusterOffset) * timescale * (trackTimescale ?? 1);
  const timecodeInMicroseconds = timecodeInNanoSeconds / 1000;
  if (!codec) {
    throw new Error(`Could not find codec for track ${trackNumber2}`);
  }
  const remainingNow = ebml.value.length - iterator.counter.getOffset();
  if (codec.startsWith("V_")) {
    const partialVideoSample = {
      data: iterator.getSlice(remainingNow),
      decodingTimestamp: timecodeInMicroseconds,
      duration: undefined,
      timestamp: timecodeInMicroseconds,
      offset
    };
    if (keyframe === null) {
      iterator.destroy();
      return {
        type: "partial-video-sample",
        partialVideoSample,
        trackId: trackNumber2,
        timescale: WEBCODECS_TIMESCALE
      };
    }
    await addAvcToTrackAndActivateTrackIfNecessary({
      codec,
      partialVideoSample,
      structureState: structureState2,
      webmState,
      trackNumber: trackNumber2,
      callbacks,
      logLevel,
      onVideoTrack,
      avcState
    });
    const sample = {
      ...partialVideoSample,
      type: keyframe ? "key" : "delta"
    };
    iterator.destroy();
    return {
      type: "video-sample",
      videoSample: sample,
      trackId: trackNumber2,
      timescale: WEBCODECS_TIMESCALE
    };
  }
  if (codec.startsWith("A_")) {
    const audioSample = {
      data: iterator.getSlice(remainingNow),
      timestamp: timecodeInMicroseconds,
      type: "key",
      duration: undefined,
      decodingTimestamp: timecodeInMicroseconds,
      offset
    };
    iterator.destroy();
    return {
      type: "audio-sample",
      audioSample,
      trackId: trackNumber2,
      timescale: WEBCODECS_TIMESCALE
    };
  }
  iterator.destroy();
  return {
    type: "no-sample"
  };
};

// src/containers/webm/parse-ebml.ts
var parseEbml = async (iterator, statesForProcessing, logLevel) => {
  const hex = iterator.getMatroskaSegmentId();
  if (hex === null) {
    throw new Error("Not enough bytes left to parse EBML - this should not happen");
  }
  const off = iterator.counter.getOffset();
  const size = iterator.getVint();
  const minVintWidth = iterator.counter.getOffset() - off;
  if (size === null) {
    throw new Error("Not enough bytes left to parse EBML - this should not happen");
  }
  const hasInMap = ebmlMap[hex];
  if (!hasInMap) {
    Log.verbose(logLevel, `Unknown EBML hex ID ${JSON.stringify(hex)}`);
    iterator.discard(size);
    return null;
  }
  if (hasInMap.type === "uint") {
    const beforeUintOffset = iterator.counter.getOffset();
    const value = size === 0 ? 0 : iterator.getUint(size);
    const { name } = hasInMap;
    return {
      type: name,
      value: {
        value,
        byteLength: iterator.counter.getOffset() - beforeUintOffset
      },
      minVintWidth
    };
  }
  if (hasInMap.type === "string") {
    const value = iterator.getByteString(size, true);
    return {
      type: hasInMap.name,
      value,
      minVintWidth
    };
  }
  if (hasInMap.type === "float") {
    const value = size === 0 ? 0 : size === 4 ? iterator.getFloat32() : iterator.getFloat64();
    return {
      type: hasInMap.name,
      value: {
        value,
        size: size === 4 ? "32" : "64"
      },
      minVintWidth
    };
  }
  if (hasInMap.type === "hex-string") {
    return {
      type: hasInMap.name,
      value: "0x" + [...iterator.getSlice(size)].map((b) => b.toString(16).padStart(2, "0")).join("").replace(new RegExp("^" + hex), ""),
      minVintWidth
    };
  }
  if (hasInMap.type === "uint8array") {
    return {
      type: hasInMap.name,
      value: iterator.getSlice(size),
      minVintWidth
    };
  }
  if (hasInMap.type === "children") {
    const children = [];
    const startOffset = iterator.counter.getOffset();
    while (true) {
      if (size === 0) {
        break;
      }
      const offset = iterator.counter.getOffset();
      const value = await parseEbml(iterator, statesForProcessing, logLevel);
      if (value) {
        const remapped = statesForProcessing ? await postprocessEbml({
          offset,
          ebml: value,
          statesForProcessing
        }) : value;
        children.push(remapped);
      }
      const offsetNow = iterator.counter.getOffset();
      if (offsetNow - startOffset > size) {
        throw new Error(`Offset ${offsetNow - startOffset} is larger than the length of the hex ${size}`);
      }
      if (offsetNow - startOffset === size) {
        break;
      }
    }
    return { type: hasInMap.name, value: children, minVintWidth };
  }
  throw new Error(`Unknown segment type ${hasInMap.type}`);
};
var postprocessEbml = async ({
  offset,
  ebml,
  statesForProcessing: {
    webmState,
    callbacks,
    logLevel,
    onAudioTrack,
    onVideoTrack,
    structureState: structureState2,
    avcState
  }
}) => {
  if (ebml.type === "TimestampScale") {
    webmState.setTimescale(ebml.value.value);
  }
  if (ebml.type === "Tracks") {
    callbacks.tracks.setIsDone(logLevel);
  }
  if (ebml.type === "TrackEntry") {
    webmState.onTrackEntrySegment(ebml);
    const track = getTrack({
      track: ebml,
      timescale: webmState.getTimescale()
    });
    if (track && track.type === "audio") {
      await registerAudioTrack({
        track,
        container: "webm",
        registerAudioSampleCallback: callbacks.registerAudioSampleCallback,
        tracks: callbacks.tracks,
        logLevel,
        onAudioTrack
      });
    }
    if (track && track.type === "video") {
      if (track.codec !== NO_CODEC_PRIVATE_SHOULD_BE_DERIVED_FROM_SPS) {
        await registerVideoTrack({
          track,
          container: "webm",
          logLevel,
          onVideoTrack,
          registerVideoSampleCallback: callbacks.registerVideoSampleCallback,
          tracks: callbacks.tracks
        });
      }
    }
  }
  if (ebml.type === "Timestamp") {
    webmState.setTimestampOffset(offset, ebml.value.value);
  }
  if (ebml.type === "Block" || ebml.type === "SimpleBlock") {
    const sample = await getSampleFromBlock({
      ebml,
      webmState,
      offset,
      structureState: structureState2,
      callbacks,
      logLevel,
      onVideoTrack,
      avcState
    });
    if (sample.type === "video-sample") {
      await callbacks.onVideoSample({
        videoSample: sample.videoSample,
        trackId: sample.trackId
      });
      return {
        type: "Block",
        value: new Uint8Array([]),
        minVintWidth: ebml.minVintWidth
      };
    }
    if (sample.type === "audio-sample") {
      await callbacks.onAudioSample({
        audioSample: sample.audioSample,
        trackId: sample.trackId
      });
      return {
        type: "Block",
        value: new Uint8Array([]),
        minVintWidth: ebml.minVintWidth
      };
    }
    if (sample.type === "no-sample") {
      return {
        type: "Block",
        value: new Uint8Array([]),
        minVintWidth: ebml.minVintWidth
      };
    }
  }
  if (ebml.type === "BlockGroup") {
    const block2 = ebml.value.find((c) => c.type === "SimpleBlock" || c.type === "Block");
    if (!block2 || block2.type !== "SimpleBlock" && block2.type !== "Block") {
      throw new Error("Expected block segment");
    }
    const hasReferenceBlock = ebml.value.find((c) => c.type === "ReferenceBlock");
    const sample = block2.value.length === 0 ? null : await getSampleFromBlock({
      ebml: block2,
      webmState,
      offset,
      structureState: structureState2,
      callbacks,
      logLevel,
      onVideoTrack,
      avcState
    });
    if (sample && sample.type === "partial-video-sample") {
      const completeFrame = {
        ...sample.partialVideoSample,
        type: hasReferenceBlock ? "delta" : "key"
      };
      await callbacks.onVideoSample({
        videoSample: completeFrame,
        trackId: sample.trackId
      });
    }
    return {
      type: "BlockGroup",
      value: [],
      minVintWidth: ebml.minVintWidth
    };
  }
  return ebml;
};

// src/containers/webm/segments.ts
var expectSegment = async ({
  statesForProcessing,
  isInsideSegment,
  iterator,
  logLevel,
  mediaSectionState: mediaSectionState2
}) => {
  if (iterator.bytesRemaining() === 0) {
    throw new Error("has no bytes");
  }
  const offset = iterator.counter.getOffset();
  const { returnToCheckpoint } = iterator.startCheckpoint();
  const segmentId = iterator.getMatroskaSegmentId();
  if (segmentId === null) {
    returnToCheckpoint();
    return null;
  }
  const offsetBeforeVInt = iterator.counter.getOffset();
  const size = iterator.getVint();
  const offsetAfterVInt = iterator.counter.getOffset();
  if (size === null) {
    returnToCheckpoint();
    return null;
  }
  const bytesRemainingNow = iterator.bytesRemaining();
  Log.trace(logLevel, "Segment ID:", ebmlMap[segmentId]?.name, "Size:" + size, bytesRemainingNow);
  if (segmentId === matroskaElements.Segment) {
    if (!statesForProcessing) {
      throw new Error("States for processing are required");
    }
    statesForProcessing.webmState.addSegment({
      start: offset,
      size
    });
    const newSegment = {
      type: "Segment",
      minVintWidth: offsetAfterVInt - offsetBeforeVInt,
      value: []
    };
    return newSegment;
  }
  if (segmentId === matroskaElements.Cluster) {
    if (isInsideSegment === null) {
      throw new Error("Expected to be inside segment");
    }
    if (!statesForProcessing) {
      throw new Error("States for processing are required");
    }
    if (mediaSectionState2) {
      mediaSectionState2.addMediaSection({
        start: offset,
        size
      });
    }
    statesForProcessing.webmState.addCluster({
      start: offset,
      size: size + (offsetAfterVInt - offset),
      segment: isInsideSegment.index
    });
    const newSegment = {
      type: "Cluster",
      minVintWidth: offsetAfterVInt - offsetBeforeVInt,
      value: []
    };
    return newSegment;
  }
  if (bytesRemainingNow < size) {
    returnToCheckpoint();
    return null;
  }
  const segment = await parseSegment({
    segmentId,
    length: size,
    headerReadSoFar: iterator.counter.getOffset() - offset,
    statesForProcessing,
    iterator,
    logLevel
  });
  return segment;
};
var parseSegment = async ({
  segmentId,
  length,
  iterator,
  headerReadSoFar,
  statesForProcessing,
  logLevel
}) => {
  if (length < 0) {
    throw new Error(`Expected length of ${segmentId} to be greater or equal 0`);
  }
  iterator.counter.decrement(headerReadSoFar);
  const offset = iterator.counter.getOffset();
  const ebml = await parseEbml(iterator, statesForProcessing, logLevel);
  if (ebml === null) {
    return null;
  }
  if (!statesForProcessing) {
    return ebml;
  }
  const remapped = await postprocessEbml({
    offset,
    ebml,
    statesForProcessing
  });
  return remapped;
};

// src/containers/webm/state-for-processing.ts
var selectStatesForProcessing = ({
  callbacks,
  logLevel,
  onAudioTrack,
  onVideoTrack,
  structure,
  webm,
  avc
}) => {
  return {
    webmState: webm,
    callbacks,
    logLevel,
    onAudioTrack,
    onVideoTrack,
    structureState: structure,
    avcState: avc
  };
};

// src/containers/webm/parse-webm-header.ts
var parseWebm = async (state) => {
  const structure = state.structure.getMatroskaStructure();
  const { iterator } = state;
  const offset = iterator.counter.getOffset();
  const isInsideSegment = state.webm.isInsideSegment(iterator);
  const isInsideCluster = state.webm.isInsideCluster(offset);
  const results = await expectSegment({
    iterator,
    logLevel: state.logLevel,
    statesForProcessing: selectStatesForProcessing(state),
    isInsideSegment,
    mediaSectionState: state.mediaSection
  });
  if (results?.type === "SeekHead") {
    const position = getByteForSeek({ seekHeadSegment: results, offset });
    if (position !== null) {
      state.webm.cues.triggerLoad(position, offset);
    }
  }
  if (results === null) {
    return null;
  }
  if (isInsideCluster) {
    if (maySkipVideoData({ state })) {
      return makeSkip(Math.min(state.contentLength, isInsideCluster.size + isInsideCluster.start));
    }
    const segments = structure.boxes.filter((box) => box.type === "Segment");
    const segment = segments[isInsideCluster.segment];
    if (!segment) {
      throw new Error("Expected segment");
    }
    const clusters = segment.value.find((box) => box.type === "Cluster");
    if (!clusters) {
      throw new Error("Expected cluster");
    }
    if (results.type !== "Block" && results.type !== "SimpleBlock") {
      clusters.value.push(results);
    }
  } else if (isInsideSegment) {
    const segments = structure.boxes.filter((box) => box.type === "Segment");
    const segment = segments[isInsideSegment.index];
    if (!segment) {
      throw new Error("Expected segment");
    }
    segment.value.push(results);
  } else {
    structure.boxes.push(results);
  }
  return null;
};

// src/init-video.ts
var initVideo = async ({ state }) => {
  const fileType = state.iterator.detectFileType();
  const { mimeType, name, contentLength } = state;
  if (fileType.type === "riff") {
    Log.verbose(state.logLevel, "Detected RIFF container");
    state.structure.setStructure({
      type: "riff",
      boxes: []
    });
    return;
  }
  if (state.m3uPlaylistContext?.mp4HeaderSegment) {
    Log.verbose(state.logLevel, "Detected ISO Base Media segment");
    const moovAtom = getMoovFromFromIsoStructure(state.m3uPlaylistContext.mp4HeaderSegment);
    if (!moovAtom) {
      throw new Error("No moov box found");
    }
    const tracks2 = getTracksFromMoovBox(moovAtom);
    for (const track of tracks2.filter((t) => t.type === "video")) {
      await registerVideoTrack({
        track,
        container: "mp4",
        logLevel: state.logLevel,
        onVideoTrack: state.onVideoTrack,
        registerVideoSampleCallback: state.callbacks.registerVideoSampleCallback,
        tracks: state.callbacks.tracks
      });
    }
    for (const track of tracks2.filter((t) => t.type === "audio")) {
      await registerAudioTrack({
        track,
        container: "mp4",
        registerAudioSampleCallback: state.callbacks.registerAudioSampleCallback,
        tracks: state.callbacks.tracks,
        logLevel: state.logLevel,
        onAudioTrack: state.onAudioTrack
      });
    }
    state.callbacks.tracks.setIsDone(state.logLevel);
    state.structure.setStructure({
      type: "iso-base-media",
      boxes: []
    });
    return;
  }
  if (fileType.type === "iso-base-media") {
    Log.verbose(state.logLevel, "Detected ISO Base Media container");
    state.structure.setStructure({
      type: "iso-base-media",
      boxes: []
    });
    return;
  }
  if (fileType.type === "webm") {
    Log.verbose(state.logLevel, "Detected Matroska container");
    state.structure.setStructure({
      boxes: [],
      type: "matroska"
    });
    return;
  }
  if (fileType.type === "transport-stream") {
    Log.verbose(state.logLevel, "Detected MPEG-2 Transport Stream");
    state.mediaSection.addMediaSection({
      start: 0,
      size: contentLength
    });
    state.structure.setStructure({
      boxes: [],
      type: "transport-stream"
    });
    return;
  }
  if (fileType.type === "mp3") {
    Log.verbose(state.logLevel, "Detected MP3");
    const structure = {
      boxes: [],
      type: "mp3"
    };
    state.structure.setStructure(structure);
    return;
  }
  if (fileType.type === "wav") {
    Log.verbose(state.logLevel, "Detected WAV");
    const structure = {
      boxes: [],
      type: "wav"
    };
    state.structure.setStructure(structure);
    return;
  }
  if (fileType.type === "flac") {
    Log.verbose(state.logLevel, "Detected FLAC");
    const structure = {
      boxes: [],
      type: "flac"
    };
    state.structure.setStructure(structure);
    return;
  }
  if (fileType.type === "aac") {
    Log.verbose(state.logLevel, "Detected AAC");
    state.structure.setStructure({
      type: "aac",
      boxes: []
    });
    return;
  }
  if (fileType.type === "m3u") {
    Log.verbose(state.logLevel, "Detected M3U");
    state.structure.setStructure({
      type: "m3u",
      boxes: []
    });
    return;
  }
  if (fileType.type === "pdf") {
    return Promise.reject(new IsAPdfError({
      message: "GIF files are not supported",
      mimeType,
      sizeInBytes: contentLength,
      fileName: name
    }));
  }
  if (fileType.type === "bmp" || fileType.type === "jpeg" || fileType.type === "png" || fileType.type === "webp" || fileType.type === "gif") {
    return Promise.reject(new IsAnImageError({
      message: "Image files are not supported",
      imageType: fileType.type,
      dimensions: fileType.dimensions,
      mimeType,
      sizeInBytes: contentLength,
      fileName: name
    }));
  }
  if (fileType.type === "unknown") {
    return Promise.reject(new IsAnUnsupportedFileTypeError({
      message: "Unknown file format",
      mimeType,
      sizeInBytes: contentLength,
      fileName: name
    }));
  }
  return Promise.reject(new Error("Unknown video format " + fileType));
};

// src/run-parse-iteration.ts
var runParseIteration = async ({
  state
}) => {
  const structure = state.structure.getStructureOrNull();
  if (structure && structure.type === "m3u") {
    return parseM3u({ state });
  }
  if (structure === null) {
    await initVideo({
      state
    });
    return null;
  }
  if (structure.type === "riff") {
    return parseRiff(state);
  }
  if (structure.type === "mp3") {
    return parseMp3(state);
  }
  if (structure.type === "iso-base-media") {
    return parseIsoBaseMedia(state);
  }
  if (structure.type === "matroska") {
    return parseWebm(state);
  }
  if (structure.type === "transport-stream") {
    return parseTransportStream(state);
  }
  if (structure.type === "wav") {
    return parseWav(state);
  }
  if (structure.type === "aac") {
    return parseAac(state);
  }
  if (structure.type === "flac") {
    return parseFlac({ state, iterator: state.iterator });
  }
  return Promise.reject(new Error("Unknown video format " + structure));
};

// src/parse-loop.ts
var fetchMoreData = async (state) => {
  await state.controller._internals.checkForAbortAndPause();
  const result = await state.currentReader.getCurrent().reader.read();
  if (result.value) {
    state.iterator.addData(result.value);
  }
  return result.done;
};
var parseLoop = async ({
  state,
  throttledState,
  onError
}) => {
  let iterationWithThisOffset = 0;
  while (!await checkIfDone(state)) {
    await state.controller._internals.checkForAbortAndPause();
    await workOnSeekRequest(getWorkOnSeekRequestOptions(state));
    const offsetBefore = state.iterator.counter.getOffset();
    const readStart = Date.now();
    while (state.iterator.bytesRemaining() < 0) {
      const done = await fetchMoreData(state);
      if (done) {
        break;
      }
    }
    if (iterationWithThisOffset > 0 || state.iterator.bytesRemaining() <= 1e5) {
      await fetchMoreData(state);
    }
    state.timings.timeReadingData += Date.now() - readStart;
    throttledState.update?.(() => makeProgressObject(state));
    if (!state.errored) {
      Log.trace(state.logLevel, `Continuing parsing of file, currently at position ${state.iterator.counter.getOffset()}/${state.contentLength} (0x${state.iterator.counter.getOffset().toString(16)})`);
      if (iterationWithThisOffset > 300 && state.structure.getStructure().type !== "m3u") {
        throw new Error("Infinite loop detected. The parser is not progressing. This is likely a bug in the parser. You can report this at https://remotion.dev/report and we will fix it as soon as possible.");
      }
      try {
        await triggerInfoEmit(state);
        await state.controller._internals.checkForAbortAndPause();
        const parseLoopStart = Date.now();
        const result = await runParseIteration({
          state
        });
        state.timings.timeInParseLoop += Date.now() - parseLoopStart;
        if (result !== null && result.action === "fetch-more-data") {
          Log.verbose(state.logLevel, `Need to fetch ${result.bytesNeeded} more bytes before we can continue`);
          const startBytesRemaining = state.iterator.bytesRemaining();
          while (true) {
            const done = await fetchMoreData(state);
            if (done) {
              break;
            }
            if (state.iterator.bytesRemaining() - startBytesRemaining >= result.bytesNeeded) {
              break;
            }
          }
          continue;
        }
        if (result !== null && result.action === "skip") {
          state.increaseSkippedBytes(result.skipTo - state.iterator.counter.getOffset());
          if (result.skipTo === state.contentLength) {
            state.iterator.discard(result.skipTo - state.iterator.counter.getOffset());
            Log.verbose(state.logLevel, "Skipped to end of file, not fetching.");
            break;
          }
          const seekStart = Date.now();
          await performSeek({
            seekTo: result.skipTo,
            userInitiated: false,
            controller: state.controller,
            mediaSection: state.mediaSection,
            iterator: state.iterator,
            logLevel: state.logLevel,
            mode: state.mode,
            contentLength: state.contentLength,
            seekInfiniteLoop: state.seekInfiniteLoop,
            currentReader: state.currentReader,
            readerInterface: state.readerInterface,
            fields: state.fields,
            src: state.src,
            discardReadBytes: state.discardReadBytes,
            prefetchCache: state.prefetchCache,
            isoState: state.iso
          });
          state.timings.timeSeeking += Date.now() - seekStart;
        }
      } catch (e) {
        const err = await onError(e);
        if (!err.action) {
          throw new Error('onError was used but did not return an "action" field. See docs for this API on how to use onError.');
        }
        if (err.action === "fail") {
          throw e;
        }
        if (err.action === "download") {
          state.errored = e;
          Log.verbose(state.logLevel, "Error was handled by onError and deciding to continue.");
        }
      }
    }
    const timeFreeStart = Date.now();
    await state.discardReadBytes(false);
    state.timings.timeFreeingData += Date.now() - timeFreeStart;
    const didProgress = state.iterator.counter.getOffset() > offsetBefore;
    if (!didProgress) {
      iterationWithThisOffset++;
    } else {
      iterationWithThisOffset = 0;
    }
  }
  state.samplesObserved.setLastSampleObserved();
  await state.callbacks.callTracksDoneCallback();
  if (state.controller._internals.seekSignal.getSeek() !== null) {
    Log.verbose(state.logLevel, "Reached end of samples, but there is a pending seek. Trying to seek...");
    await workOnSeekRequest(getWorkOnSeekRequestOptions(state));
    if (state.controller._internals.seekSignal.getSeek() !== null) {
      throw new Error("Reached the end of the file even though a seek was requested. This is likely a bug in the parser. You can report this at https://remotion.dev/report and we will fix it as soon as possible.");
    }
    await parseLoop({
      onError,
      throttledState,
      state
    });
  }
};

// src/print-timings.ts
var printTimings = (state) => {
  Log.verbose(state.logLevel, `Time iterating over file: ${state.timings.timeIterating}ms`);
  Log.verbose(state.logLevel, `Time fetching data: ${state.timings.timeReadingData}ms`);
  Log.verbose(state.logLevel, `Time seeking: ${state.timings.timeSeeking}ms`);
  Log.verbose(state.logLevel, `Time checking if done: ${state.timings.timeCheckingIfDone}ms`);
  Log.verbose(state.logLevel, `Time freeing data: ${state.timings.timeFreeingData}ms`);
  Log.verbose(state.logLevel, `Time in parse loop: ${state.timings.timeInParseLoop}ms`);
};

// src/remotion-license-acknowledge.ts
var warningShown = false;
var warnIfRemotionLicenseNotAcknowledged = ({
  acknowledgeRemotionLicense,
  logLevel,
  apiName
}) => {
  if (acknowledgeRemotionLicense) {
    return;
  }
  if (warningShown) {
    return;
  }
  warningShown = true;
  Log.warn(logLevel, `Note: Some companies are required to obtain a license to use @remotion/media-parser. See: https://remotion.dev/license
Pass \`acknowledgeRemotionLicense: true\` to \`${apiName}\` function to make this message disappear.`);
};

// src/set-seeking-hints.ts
var setSeekingHints = ({
  hints,
  state
}) => {
  if (hints.type === "iso-base-media-seeking-hints") {
    setSeekingHintsForMp4({ hints, state });
    return;
  }
  if (hints.type === "wav-seeking-hints") {
    setSeekingHintsForWav({ hints, state });
    return;
  }
  if (hints.type === "transport-stream-seeking-hints") {
    setSeekingHintsForTransportStream({ hints, state });
    return;
  }
  if (hints.type === "webm-seeking-hints") {
    setSeekingHintsForWebm({ hints, state });
    return;
  }
  if (hints.type === "flac-seeking-hints") {
    setSeekingHintsForFlac({ hints, state });
    return;
  }
  if (hints.type === "riff-seeking-hints") {
    setSeekingHintsForRiff({ hints, state });
    return;
  }
  if (hints.type === "mp3-seeking-hints") {
    setSeekingHintsForMp3({ hints, state });
    return;
  }
  if (hints.type === "aac-seeking-hints") {
    setSeekingHintsForAac();
    return;
  }
  if (hints.type === "m3u8-seeking-hints") {
    return;
  }
  throw new Error(`Unknown seeking hints type: ${hints}`);
};

// src/get-fields-from-callbacks.ts
var getFieldsFromCallback = ({
  fields,
  callbacks
}) => {
  const newFields = {
    audioCodec: Boolean(callbacks.onAudioCodec),
    container: Boolean(callbacks.onContainer),
    dimensions: Boolean(callbacks.onDimensions),
    durationInSeconds: Boolean(callbacks.onDurationInSeconds),
    fps: Boolean(callbacks.onFps),
    internalStats: Boolean(callbacks.onInternalStats),
    isHdr: Boolean(callbacks.onIsHdr),
    location: Boolean(callbacks.onLocation),
    metadata: Boolean(callbacks.onMetadata),
    mimeType: Boolean(callbacks.onMimeType),
    name: Boolean(callbacks.onName),
    rotation: Boolean(callbacks.onRotation),
    size: Boolean(callbacks.onSize),
    slowStructure: Boolean(callbacks.onSlowStructure),
    tracks: Boolean(callbacks.onTracks),
    unrotatedDimensions: Boolean(callbacks.onUnrotatedDimensions),
    videoCodec: Boolean(callbacks.onVideoCodec),
    slowKeyframes: Boolean(callbacks.onSlowKeyframes),
    slowDurationInSeconds: Boolean(callbacks.onSlowDurationInSeconds),
    slowFps: Boolean(callbacks.onSlowFps),
    slowNumberOfFrames: Boolean(callbacks.onSlowNumberOfFrames),
    keyframes: Boolean(callbacks.onKeyframes),
    images: Boolean(callbacks.onImages),
    numberOfAudioChannels: Boolean(callbacks.onNumberOfAudioChannels),
    sampleRate: Boolean(callbacks.onSampleRate),
    slowAudioBitrate: Boolean(callbacks.onSlowAudioBitrate),
    slowVideoBitrate: Boolean(callbacks.onSlowVideoBitrate),
    m3uStreams: Boolean(callbacks.onM3uStreams),
    ...fields
  };
  return newFields;
};

// src/state/audio-sample-map.ts
var audioSampleMapState = () => {
  let map = [];
  const addSample = (audioSampleOffset) => {
    if (map.find((m) => m.offset === audioSampleOffset.offset)) {
      return;
    }
    map.push(audioSampleOffset);
  };
  return {
    addSample,
    getSamples: () => map,
    setFromSeekingHints: (newMap) => {
      map = newMap;
    }
  };
};

// src/state/aac-state.ts
var aacState = () => {
  const samples = [];
  const audioSamples = audioSampleMapState();
  return {
    addSample: ({ offset, size }) => {
      const index = samples.findIndex((s) => s.offset === offset);
      if (index !== -1) {
        return samples[index];
      }
      samples.push({ offset, index: samples.length, size });
      return samples[samples.length - 1];
    },
    getSamples: () => samples,
    audioSamples
  };
};

// src/containers/avc/max-buffer-size.ts
var maxMacroblocksByLevel = {
  10: 396,
  11: 900,
  12: 2376,
  13: 2376,
  20: 2376,
  21: 4752,
  22: 8100,
  30: 8100,
  31: 18000,
  32: 20480,
  40: 32768,
  41: 32768,
  42: 34816,
  50: 110400,
  51: 184320,
  52: 184320,
  60: 696320,
  61: 696320,
  62: 696320
};
var macroBlocksPerFrame = (sps) => {
  const { pic_width_in_mbs_minus1, pic_height_in_map_units_minus1 } = sps;
  return (pic_width_in_mbs_minus1 + 1) * (pic_height_in_map_units_minus1 + 1);
};
var maxMacroblockBufferSize = (sps) => {
  const { level } = sps;
  const maxMacroblocks = maxMacroblocksByLevel[level];
  if (maxMacroblocks === undefined) {
    throw new Error(`Unsupported level: ${level.toString(16)}`);
  }
  return maxMacroblocks;
};

// src/state/avc/avc-state.ts
var avcState = () => {
  let prevPicOrderCntLsb = 0;
  let prevPicOrderCntMsb = 0;
  let sps = null;
  let maxFramesInBuffer = null;
  return {
    getPrevPicOrderCntLsb() {
      return prevPicOrderCntLsb;
    },
    getPrevPicOrderCntMsb() {
      return prevPicOrderCntMsb;
    },
    setPrevPicOrderCntLsb(value) {
      prevPicOrderCntLsb = value;
    },
    setPrevPicOrderCntMsb(value) {
      prevPicOrderCntMsb = value;
    },
    setSps(value) {
      const macroblockBufferSize = macroBlocksPerFrame(value);
      const maxBufferSize = maxMacroblockBufferSize(value);
      const maxFrames = Math.min(16, Math.floor(maxBufferSize / macroblockBufferSize));
      maxFramesInBuffer = maxFrames;
      sps = value;
    },
    getSps() {
      return sps;
    },
    getMaxFramesInBuffer() {
      return maxFramesInBuffer;
    },
    clear() {
      maxFramesInBuffer = null;
      sps = null;
      prevPicOrderCntLsb = 0;
      prevPicOrderCntMsb = 0;
    }
  };
};

// src/state/current-reader.ts
var currentReader = (initialReader) => {
  let current = initialReader;
  return {
    getCurrent: () => current,
    setCurrent: (newReader) => {
      current = newReader;
    }
  };
};

// src/state/emitted-fields.ts
var emittedState = () => {
  const emittedFields = {
    audioCodec: false,
    container: false,
    dimensions: false,
    durationInSeconds: false,
    fps: false,
    internalStats: false,
    isHdr: false,
    location: false,
    metadata: false,
    mimeType: false,
    name: false,
    rotation: false,
    size: false,
    slowStructure: false,
    tracks: false,
    videoCodec: false,
    unrotatedDimensions: false,
    slowDurationInSeconds: false,
    slowFps: false,
    slowKeyframes: false,
    slowNumberOfFrames: false,
    keyframes: false,
    images: false,
    numberOfAudioChannels: false,
    sampleRate: false,
    slowAudioBitrate: false,
    slowVideoBitrate: false,
    m3uStreams: false
  };
  return emittedFields;
};

// src/state/flac-state.ts
var flacState = () => {
  let blockingBitStrategy;
  const audioSamples = audioSampleMapState();
  return {
    setBlockingBitStrategy: (strategy) => {
      blockingBitStrategy = strategy;
    },
    getBlockingBitStrategy: () => blockingBitStrategy,
    audioSamples
  };
};

// src/state/images.ts
var imagesState = () => {
  const images = [];
  const addImage = (image) => {
    images.push(image);
  };
  return {
    images,
    addImage
  };
};

// src/containers/iso-base-media/mfra/get-mfra-atom.ts
var getMfraAtom = async ({
  src,
  contentLength,
  readerInterface,
  controller,
  parentSize,
  logLevel,
  prefetchCache
}) => {
  const result = await readerInterface.read({
    controller,
    range: [contentLength - parentSize, contentLength - 1],
    src,
    logLevel,
    prefetchCache
  });
  const iterator = getArrayBufferIterator({
    initialData: new Uint8Array,
    maxBytes: parentSize,
    logLevel: "error"
  });
  while (true) {
    const res = await result.reader.reader.read();
    if (res.value) {
      iterator.addData(res.value);
    }
    if (res.done) {
      break;
    }
  }
  return iterator;
};

// src/containers/iso-base-media/mfra/get-mfro-atom.ts
var getMfroAtom = async ({
  src,
  contentLength,
  readerInterface,
  controller,
  logLevel,
  prefetchCache
}) => {
  const result = await readerInterface.read({
    controller,
    range: [contentLength - 16, contentLength - 1],
    src,
    logLevel,
    prefetchCache
  });
  const { value } = await result.reader.reader.read();
  if (!value) {
    return null;
  }
  result.reader.abort();
  const iterator = getArrayBufferIterator({
    initialData: value,
    maxBytes: value.length,
    logLevel: "error"
  });
  const size = iterator.getUint32();
  if (size !== 16) {
    iterator.destroy();
    return null;
  }
  const atom = iterator.getByteString(4, false);
  if (atom !== "mfro") {
    iterator.destroy();
    return null;
  }
  const version = iterator.getUint8();
  if (version !== 0) {
    iterator.destroy();
    return null;
  }
  iterator.discard(3);
  const parentSize = iterator.getUint32();
  iterator.destroy();
  return parentSize;
};

// src/containers/iso-base-media/get-mfra-seeking-box.ts
var getMfraSeekingBox = async ({
  contentLength,
  controller,
  readerInterface,
  src,
  logLevel,
  prefetchCache
}) => {
  const parentSize = await getMfroAtom({
    contentLength,
    controller,
    readerInterface,
    src,
    logLevel,
    prefetchCache
  });
  if (!parentSize) {
    return null;
  }
  const mfraAtom = await getMfraAtom({
    contentLength,
    controller,
    readerInterface,
    src,
    parentSize,
    logLevel,
    prefetchCache
  });
  mfraAtom.discard(8);
  return getIsoBaseMediaChildren({
    iterator: mfraAtom,
    logLevel,
    size: parentSize - 8,
    onlyIfMoovAtomExpected: null,
    contentLength
  });
};

// src/state/iso-base-media/lazy-mfra-load.ts
var lazyMfraLoad = ({
  contentLength,
  controller,
  readerInterface,
  src,
  logLevel,
  prefetchCache
}) => {
  let prom = null;
  let result = null;
  const triggerLoad = () => {
    if (prom) {
      return prom;
    }
    Log.verbose(logLevel, "Moof box found, trying to lazy load mfra");
    prom = getMfraSeekingBox({
      contentLength,
      controller,
      readerInterface,
      src,
      logLevel,
      prefetchCache
    }).then((boxes) => {
      Log.verbose(logLevel, boxes ? "Lazily found mfra atom." : "No mfra atom found.");
      result = boxes;
      return boxes;
    });
    return prom;
  };
  const getIfAlreadyLoaded = () => {
    if (result) {
      return result;
    }
    return null;
  };
  const setFromSeekingHints = (hints) => {
    result = hints.mfraAlreadyLoaded;
  };
  return {
    triggerLoad,
    getIfAlreadyLoaded,
    setFromSeekingHints
  };
};

// src/state/iso-base-media/moov-box.ts
var moovState = () => {
  let moovBox = null;
  return {
    setMoovBox: (moov) => {
      moovBox = moov;
    },
    getMoovBoxAndPrecomputed: () => moovBox
  };
};

// src/state/iso-base-media/timescale-state.ts
var movieTimeScaleState = () => {
  let trackTimescale = null;
  return {
    getTrackTimescale: () => trackTimescale,
    setTrackTimescale: (timescale) => {
      trackTimescale = timescale;
    }
  };
};

// src/state/iso-base-media/iso-state.ts
var isoBaseMediaState = ({
  contentLength,
  controller,
  readerInterface,
  src,
  logLevel,
  prefetchCache
}) => {
  return {
    flatSamples: cachedSamplePositionsState(),
    moov: moovState(),
    mfra: lazyMfraLoad({
      contentLength,
      controller,
      readerInterface,
      src,
      logLevel,
      prefetchCache
    }),
    moof: precomputedMoofState(),
    tfra: precomputedTfraState(),
    movieTimeScale: movieTimeScaleState()
  };
};

// src/state/keyframes.ts
var keyframesState = () => {
  const keyframes = [];
  const addKeyframe = (keyframe) => {
    if (keyframes.find((k) => k.positionInBytes === keyframe.positionInBytes)) {
      return;
    }
    keyframes.push(keyframe);
  };
  const getKeyframes2 = () => {
    keyframes.sort((a, b) => a.positionInBytes - b.positionInBytes);
    return keyframes;
  };
  const setFromSeekingHints = (keyframesFromHints) => {
    for (const keyframe of keyframesFromHints) {
      addKeyframe(keyframe);
    }
  };
  return {
    addKeyframe,
    getKeyframes: getKeyframes2,
    setFromSeekingHints
  };
};

// src/containers/m3u/sample-sorter.ts
var sampleSorter = ({
  logLevel,
  getAllChunksProcessedForPlaylist
}) => {
  const streamsWithTracks = [];
  const audioCallbacks = {};
  const videoCallbacks = {};
  let latestSample = {};
  return {
    clearSamples: () => {
      latestSample = {};
    },
    addToStreamWithTrack: (src) => {
      streamsWithTracks.push(src);
    },
    addVideoStreamToConsider: (src, callback) => {
      videoCallbacks[src] = callback;
    },
    addAudioStreamToConsider: (src, callback) => {
      audioCallbacks[src] = callback;
    },
    hasAudioStreamToConsider: (src) => {
      return Boolean(audioCallbacks[src]);
    },
    hasVideoStreamToConsider: (src) => {
      return Boolean(videoCallbacks[src]);
    },
    addAudioSample: async (src, sample) => {
      const callback = audioCallbacks[src];
      if (!callback) {
        throw new Error("No callback found for audio sample");
      }
      latestSample[src] = sample.decodingTimestamp;
      await callback(sample);
    },
    addVideoSample: async (src, sample) => {
      const callback = videoCallbacks[src];
      if (!callback) {
        throw new Error("No callback found for video sample.");
      }
      latestSample[src] = sample.decodingTimestamp;
      await callback(sample);
    },
    getNextStreamToRun: (streams) => {
      for (const stream of streams) {
        if (getAllChunksProcessedForPlaylist(stream)) {
          continue;
        }
        if (!streamsWithTracks.includes(stream)) {
          Log.trace(logLevel, `Did not yet detect track of ${stream}, working on that`);
          return stream;
        }
      }
      let smallestDts = Infinity;
      for (const stream of streams) {
        if (getAllChunksProcessedForPlaylist(stream)) {
          continue;
        }
        if ((latestSample[stream] ?? 0) < smallestDts) {
          smallestDts = latestSample[stream] ?? 0;
        }
      }
      for (const stream of streams) {
        if (getAllChunksProcessedForPlaylist(stream)) {
          continue;
        }
        if ((latestSample[stream] ?? 0) === smallestDts) {
          Log.trace(logLevel, `Working on ${stream} because it has the smallest DTS`);
          return stream;
        }
      }
      throw new Error("should be done with parsing now");
    }
  };
};

// src/state/m3u-state.ts
var m3uState = (logLevel) => {
  let selectedMainPlaylist = null;
  let associatedPlaylists = null;
  const hasEmittedVideoTrack = {};
  const hasEmittedAudioTrack = {};
  const hasEmittedDoneWithTracks = {};
  let hasFinishedManifest = false;
  const seekToSecondsToProcess = {};
  const nextSeekShouldSubtractChunks = {};
  let readyToIterateOverM3u = false;
  const allChunksProcessed = {};
  const m3uStreamRuns = {};
  const tracksDone = {};
  const getMainPlaylistUrl = () => {
    if (!selectedMainPlaylist) {
      throw new Error("No main playlist selected");
    }
    const playlistUrl = selectedMainPlaylist.type === "initial-url" ? selectedMainPlaylist.url : selectedMainPlaylist.stream.src;
    return playlistUrl;
  };
  const getSelectedPlaylists = () => {
    return [
      getMainPlaylistUrl(),
      ...(associatedPlaylists ?? []).map((p) => p.src)
    ];
  };
  const getAllChunksProcessedForPlaylist = (src) => allChunksProcessed[src];
  const mp4HeaderSegments = {};
  const setMp4HeaderSegment = (playlistUrl, structure) => {
    mp4HeaderSegments[playlistUrl] = structure;
  };
  const getMp4HeaderSegment = (playlistUrl) => {
    return mp4HeaderSegments[playlistUrl];
  };
  return {
    setSelectedMainPlaylist: (stream) => {
      selectedMainPlaylist = stream;
    },
    getSelectedMainPlaylist: () => selectedMainPlaylist,
    setHasEmittedVideoTrack: (src, callback) => {
      hasEmittedVideoTrack[src] = callback;
    },
    hasEmittedVideoTrack: (src) => {
      const value = hasEmittedVideoTrack[src];
      if (value === undefined) {
        return false;
      }
      return value;
    },
    setHasEmittedAudioTrack: (src, callback) => {
      hasEmittedAudioTrack[src] = callback;
    },
    hasEmittedAudioTrack: (src) => {
      const value = hasEmittedAudioTrack[src];
      if (value === undefined) {
        return false;
      }
      return value;
    },
    setHasEmittedDoneWithTracks: (src) => {
      hasEmittedDoneWithTracks[src] = true;
    },
    hasEmittedDoneWithTracks: (src) => hasEmittedDoneWithTracks[src] !== undefined,
    setReadyToIterateOverM3u: () => {
      readyToIterateOverM3u = true;
    },
    isReadyToIterateOverM3u: () => readyToIterateOverM3u,
    setAllChunksProcessed: (src) => {
      allChunksProcessed[src] = true;
    },
    clearAllChunksProcessed: () => {
      Object.keys(allChunksProcessed).forEach((key) => {
        delete allChunksProcessed[key];
      });
    },
    getAllChunksProcessedForPlaylist,
    getAllChunksProcessedOverall: () => {
      if (!selectedMainPlaylist) {
        return false;
      }
      const selectedPlaylists = getSelectedPlaylists();
      return selectedPlaylists.every((url) => allChunksProcessed[url]);
    },
    setHasFinishedManifest: () => {
      hasFinishedManifest = true;
    },
    hasFinishedManifest: () => hasFinishedManifest,
    setM3uStreamRun: (playlistUrl, run) => {
      if (!run) {
        delete m3uStreamRuns[playlistUrl];
        return;
      }
      m3uStreamRuns[playlistUrl] = run;
    },
    setTracksDone: (playlistUrl) => {
      tracksDone[playlistUrl] = true;
      const selectedPlaylists = getSelectedPlaylists();
      return selectedPlaylists.every((url) => tracksDone[url]);
    },
    getTrackDone: (playlistUrl) => {
      return tracksDone[playlistUrl];
    },
    clearTracksDone: () => {
      Object.keys(tracksDone).forEach((key) => {
        delete tracksDone[key];
      });
    },
    getM3uStreamRun: (playlistUrl) => m3uStreamRuns[playlistUrl] ?? null,
    abortM3UStreamRuns: () => {
      const values = Object.values(m3uStreamRuns);
      if (values.length === 0) {
        return;
      }
      Log.trace(logLevel, `Aborting ${values.length} M3U stream runs`);
      values.forEach((run) => {
        run.abort();
      });
    },
    setAssociatedPlaylists: (playlists) => {
      associatedPlaylists = playlists;
    },
    getAssociatedPlaylists: () => associatedPlaylists,
    getSelectedPlaylists,
    sampleSorter: sampleSorter({ logLevel, getAllChunksProcessedForPlaylist }),
    setMp4HeaderSegment,
    getMp4HeaderSegment,
    setSeekToSecondsToProcess: (playlistUrl, m3uSeek) => {
      seekToSecondsToProcess[playlistUrl] = m3uSeek;
    },
    getSeekToSecondsToProcess: (playlistUrl) => seekToSecondsToProcess[playlistUrl] ?? null,
    setNextSeekShouldSubtractChunks: (playlistUrl, chunks) => {
      nextSeekShouldSubtractChunks[playlistUrl] = chunks;
    },
    getNextSeekShouldSubtractChunks: (playlistUrl) => nextSeekShouldSubtractChunks[playlistUrl] ?? 0
  };
};

// src/containers/webm/seek/format-cues.ts
var formatCues = (cues) => {
  const matroskaCues = [];
  for (const cue of cues) {
    if (cue.type === "Crc32") {
      continue;
    }
    if (cue.type !== "CuePoint") {
      throw new Error("Expected CuePoint");
    }
    const cueTime = cue.value.find((_cue) => _cue.type === "CueTime");
    if (!cueTime) {
      throw new Error("Expected CueTime");
    }
    const cueTrackPositions = cue.value.find((c) => c.type === "CueTrackPositions");
    if (!cueTrackPositions) {
      throw new Error("Expected CueTrackPositions");
    }
    const cueTimeValue = cueTime.value.value;
    const cueTrack = cueTrackPositions.value.find((_c) => _c.type === "CueTrack");
    if (!cueTrack) {
      throw new Error("Expected CueTrack");
    }
    const cueClusterPosition = cueTrackPositions.value.find((_c) => _c.type === "CueClusterPosition");
    if (!cueClusterPosition) {
      throw new Error("Expected CueClusterPosition");
    }
    const cueRelativePosition = cueTrackPositions.value.find((_c) => _c.type === "CueRelativePosition");
    const matroskaCue = {
      trackId: cueTrack.value.value,
      timeInTimescale: cueTimeValue,
      clusterPositionInSegment: cueClusterPosition.value.value,
      relativePosition: cueRelativePosition?.value.value ?? 0
    };
    matroskaCues.push(matroskaCue);
  }
  return matroskaCues;
};

// src/containers/webm/seek/fetch-web-cues.ts
var fetchWebmCues = async ({
  src,
  readerInterface,
  controller,
  position,
  logLevel,
  prefetchCache
}) => {
  const result = await readerInterface.read({
    controller,
    range: position,
    src,
    logLevel,
    prefetchCache
  });
  const { value } = await result.reader.reader.read();
  if (!value) {
    return null;
  }
  result.reader.abort();
  const iterator = getArrayBufferIterator({
    initialData: value,
    maxBytes: value.length,
    logLevel: "error"
  });
  const segment = await expectSegment({
    iterator,
    logLevel,
    statesForProcessing: null,
    isInsideSegment: null,
    mediaSectionState: null
  });
  iterator.destroy();
  if (!segment?.value) {
    return null;
  }
  return formatCues(segment.value);
};

// src/state/matroska/lazy-cues-fetch.ts
var lazyCuesFetch = ({
  controller,
  logLevel,
  readerInterface,
  src,
  prefetchCache
}) => {
  let prom = null;
  let sOffset = null;
  let result = null;
  const triggerLoad = (position, segmentOffset) => {
    if (result) {
      return Promise.resolve(result);
    }
    if (prom) {
      return prom;
    }
    if (sOffset && sOffset !== segmentOffset) {
      throw new Error("Segment offset mismatch");
    }
    sOffset = segmentOffset;
    Log.verbose(logLevel, "Cues box found, trying to lazy load cues");
    prom = fetchWebmCues({
      controller,
      logLevel,
      position,
      readerInterface,
      src,
      prefetchCache
    }).then((cues) => {
      Log.verbose(logLevel, "Cues loaded");
      result = cues;
      return cues;
    });
    return prom;
  };
  const getLoadedCues = async () => {
    if (!prom) {
      return null;
    }
    if (result) {
      if (!sOffset) {
        throw new Error("Segment offset not set");
      }
      return {
        cues: result,
        segmentOffset: sOffset
      };
    }
    const cues = await prom;
    if (!cues) {
      return null;
    }
    if (!sOffset) {
      throw new Error("Segment offset not set");
    }
    return {
      cues,
      segmentOffset: sOffset
    };
  };
  const getIfAlreadyLoaded = () => {
    if (result) {
      if (sOffset === null) {
        throw new Error("Segment offset not set");
      }
      return {
        cues: result,
        segmentOffset: sOffset
      };
    }
    return null;
  };
  const setFromSeekingHints = (hints) => {
    result = hints.loadedCues?.cues ?? null;
    sOffset = hints.loadedCues?.segmentOffset ?? null;
  };
  return {
    triggerLoad,
    getLoadedCues,
    getIfAlreadyLoaded,
    setFromSeekingHints
  };
};

// src/state/matroska/webm.ts
var webmState = ({
  controller,
  logLevel,
  readerInterface,
  src,
  prefetchCache
}) => {
  const trackEntries = {};
  const onTrackEntrySegment = (trackEntry2) => {
    const trackId = getTrackId(trackEntry2);
    if (!trackId) {
      throw new Error("Expected track id");
    }
    if (trackEntries[trackId]) {
      return;
    }
    const codec = getTrackCodec(trackEntry2);
    if (!codec) {
      throw new Error("Expected codec");
    }
    const trackTimescale = getTrackTimestampScale(trackEntry2);
    trackEntries[trackId] = {
      codec: codec.value,
      trackTimescale: trackTimescale?.value ?? null
    };
  };
  let timestampMap = new Map;
  const getTimestampOffsetForByteOffset = (byteOffset) => {
    const entries = Array.from(timestampMap.entries());
    const sortedByByteOffset = entries.sort((a, b) => {
      return a[0] - b[0];
    }).reverse();
    for (const [offset, timestamp] of sortedByByteOffset) {
      if (offset >= byteOffset) {
        continue;
      }
      return timestamp;
    }
    return timestampMap.get(byteOffset);
  };
  const setTimestampOffset = (byteOffset, timestamp) => {
    timestampMap.set(byteOffset, timestamp);
  };
  let timescale = null;
  const setTimescale = (newTimescale) => {
    timescale = newTimescale;
  };
  const getTimescale = () => {
    if (timescale === null) {
      return 1e6;
    }
    return timescale;
  };
  const segments = [];
  const clusters = [];
  const avcProfilesMap = {};
  const setAvcProfileForTrackNumber = (trackNumber2, avcProfile) => {
    avcProfilesMap[trackNumber2] = avcProfile;
  };
  const getAvcProfileForTrackNumber = (trackNumber2) => {
    return avcProfilesMap[trackNumber2] ?? null;
  };
  const cues = lazyCuesFetch({
    controller,
    logLevel,
    readerInterface,
    src,
    prefetchCache
  });
  const getTimeStampMapForSeekingHints = () => {
    return timestampMap;
  };
  const setTimeStampMapForSeekingHints = (newTimestampMap) => {
    timestampMap = newTimestampMap;
  };
  return {
    cues,
    onTrackEntrySegment,
    getTrackInfoByNumber: (id) => trackEntries[id],
    setTimestampOffset,
    getTimestampOffsetForByteOffset,
    getTimeStampMapForSeekingHints,
    setTimeStampMapForSeekingHints,
    getTimescale,
    setTimescale,
    addSegment: (seg) => {
      const segment = {
        ...seg,
        index: segments.length
      };
      segments.push(segment);
    },
    addCluster: (cluster) => {
      const exists = clusters.some((existingCluster) => existingCluster.start === cluster.start);
      if (!exists) {
        clusters.push(cluster);
      }
    },
    getFirstCluster: () => {
      return clusters.find((cluster) => cluster.segment === 0);
    },
    isInsideSegment: (iterator) => {
      const offset = iterator.counter.getOffset();
      const insideClusters = segments.filter((cluster) => {
        return offset >= cluster.start && offset <= cluster.start + cluster.size;
      });
      if (insideClusters.length > 1) {
        throw new Error("Expected to only be inside 1 cluster");
      }
      return insideClusters[0] ?? null;
    },
    isInsideCluster: (offset) => {
      for (const cluster of clusters) {
        if (offset >= cluster.start && offset < cluster.start + cluster.size) {
          return cluster;
        }
      }
      return null;
    },
    setAvcProfileForTrackNumber,
    getAvcProfileForTrackNumber
  };
};

// src/state/mp3.ts
var makeMp3State = () => {
  let mp3Info = null;
  let bitrateInfo = null;
  const audioSamples = audioSampleMapState();
  return {
    getMp3Info: () => mp3Info,
    setMp3Info: (info) => {
      mp3Info = info;
    },
    getMp3BitrateInfo: () => bitrateInfo,
    setMp3BitrateInfo: (info) => {
      bitrateInfo = info;
    },
    audioSamples
  };
};

// src/containers/riff/seek/fetch-idx1.ts
var fetchIdx1 = async ({
  src,
  readerInterface,
  controller,
  position,
  logLevel,
  prefetchCache,
  contentLength
}) => {
  Log.verbose(logLevel, "Making request to fetch idx1 from ", src, "position", position);
  const result = await readerInterface.read({
    controller,
    range: position,
    src,
    logLevel,
    prefetchCache
  });
  if (result.contentLength === null) {
    throw new Error("Content length is null");
  }
  const iterator = getArrayBufferIterator({
    initialData: new Uint8Array,
    maxBytes: contentLength - position + 1,
    logLevel: "error"
  });
  while (true) {
    const res = await result.reader.reader.read();
    if (res.value) {
      iterator.addData(res.value);
    }
    if (res.done) {
      break;
    }
  }
  const box = await expectRiffBox({
    iterator,
    stateIfExpectingSideEffects: null
  });
  iterator.destroy();
  if (box === null || box.type !== "idx1-box") {
    throw new Error("Expected idx1-box");
  }
  return {
    entries: box.entries.filter((entry) => entry.id.endsWith("dc")),
    videoTrackIndex: box.videoTrackIndex
  };
};

// src/state/riff/lazy-idx1-fetch.ts
var lazyIdx1Fetch = ({
  controller,
  logLevel,
  readerInterface,
  src,
  prefetchCache,
  contentLength
}) => {
  let prom = null;
  let result = null;
  const triggerLoad = (position) => {
    if (result) {
      return Promise.resolve(result);
    }
    if (prom) {
      return prom;
    }
    prom = fetchIdx1({
      controller,
      logLevel,
      position,
      readerInterface,
      src,
      prefetchCache,
      contentLength
    }).then((entries) => {
      prom = null;
      result = entries;
      return entries;
    });
    return prom;
  };
  const getLoadedIdx1 = async () => {
    if (!prom) {
      return null;
    }
    const entries = await prom;
    return entries;
  };
  const getIfAlreadyLoaded = () => {
    if (result) {
      return result;
    }
    return null;
  };
  const setFromSeekingHints = (hints) => {
    if (hints.idx1Entries) {
      result = hints.idx1Entries;
    }
  };
  const waitForLoaded = () => {
    if (result) {
      return Promise.resolve(result);
    }
    if (prom) {
      return prom;
    }
    return Promise.resolve(null);
  };
  return {
    triggerLoad,
    getLoadedIdx1,
    getIfAlreadyLoaded,
    setFromSeekingHints,
    waitForLoaded
  };
};

// src/state/riff/queued-frames.ts
var queuedBFramesState = () => {
  const queuedFrames = [];
  const releasedFrames = [];
  const flush = () => {
    releasedFrames.push(...queuedFrames);
    queuedFrames.length = 0;
  };
  return {
    addFrame: ({
      frame,
      maxFramesInBuffer,
      trackId,
      timescale
    }) => {
      if (frame.type === "key") {
        flush();
        releasedFrames.push({ sample: frame, trackId, timescale });
        return;
      }
      queuedFrames.push({ sample: frame, trackId, timescale });
      if (queuedFrames.length > maxFramesInBuffer) {
        releasedFrames.push(queuedFrames.shift());
      }
    },
    flush,
    getReleasedFrame: () => {
      if (releasedFrames.length === 0) {
        return null;
      }
      return releasedFrames.shift();
    },
    hasReleasedFrames: () => {
      return releasedFrames.length > 0;
    },
    clear: () => {
      releasedFrames.length = 0;
      queuedFrames.length = 0;
    }
  };
};

// src/state/riff/riff-keyframes.ts
var riffKeyframesState = () => {
  const keyframes = [];
  const addKeyframe = (keyframe) => {
    if (keyframes.find((k) => k.positionInBytes === keyframe.positionInBytes)) {
      return;
    }
    keyframes.push(keyframe);
    keyframes.sort((a, b) => a.positionInBytes - b.positionInBytes);
  };
  const getKeyframes2 = () => {
    return keyframes;
  };
  const setFromSeekingHints = (keyframesFromHints) => {
    for (const keyframe of keyframesFromHints) {
      addKeyframe(keyframe);
    }
  };
  return {
    addKeyframe,
    getKeyframes: getKeyframes2,
    setFromSeekingHints
  };
};

// src/state/riff/sample-counter.ts
var riffSampleCounter = () => {
  const samplesForTrack = {};
  const pocsAtKeyframeOffset = {};
  const riffKeys = riffKeyframesState();
  const onAudioSample = (trackId, audioSample) => {
    if (typeof samplesForTrack[trackId] === "undefined") {
      samplesForTrack[trackId] = 0;
    }
    if (audioSample.data.length > 0) {
      samplesForTrack[trackId]++;
    }
    samplesForTrack[trackId]++;
  };
  const onVideoSample = ({
    trackId,
    videoSample
  }) => {
    if (typeof samplesForTrack[trackId] === "undefined") {
      samplesForTrack[trackId] = 0;
    }
    if (videoSample.type === "key") {
      riffKeys.addKeyframe({
        trackId,
        decodingTimeInSeconds: videoSample.decodingTimestamp / WEBCODECS_TIMESCALE,
        positionInBytes: videoSample.offset,
        presentationTimeInSeconds: videoSample.timestamp / WEBCODECS_TIMESCALE,
        sizeInBytes: videoSample.data.length,
        sampleCounts: { ...samplesForTrack }
      });
    }
    if (videoSample.data.length > 0) {
      samplesForTrack[trackId]++;
    }
  };
  const getSampleCountForTrack = ({ trackId }) => {
    return samplesForTrack[trackId] ?? 0;
  };
  const setSamplesFromSeek = (samples) => {
    for (const trackId in samples) {
      samplesForTrack[trackId] = samples[trackId];
    }
  };
  const setPocAtKeyframeOffset = ({
    keyframeOffset,
    poc
  }) => {
    if (typeof pocsAtKeyframeOffset[keyframeOffset] === "undefined") {
      pocsAtKeyframeOffset[keyframeOffset] = [];
    }
    if (pocsAtKeyframeOffset[keyframeOffset].includes(poc)) {
      return;
    }
    pocsAtKeyframeOffset[keyframeOffset].push(poc);
    pocsAtKeyframeOffset[keyframeOffset].sort((a, b) => a - b);
  };
  const getPocAtKeyframeOffset = ({
    keyframeOffset
  }) => {
    return pocsAtKeyframeOffset[keyframeOffset];
  };
  const getKeyframeAtOffset = (sample) => {
    if (sample.type === "key") {
      return sample.offset;
    }
    return riffKeys.getKeyframes().findLast((k) => k.positionInBytes <= sample.offset)?.positionInBytes ?? null;
  };
  return {
    onAudioSample,
    onVideoSample,
    getSampleCountForTrack,
    setSamplesFromSeek,
    riffKeys,
    setPocAtKeyframeOffset,
    getPocAtKeyframeOffset,
    getKeyframeAtOffset
  };
};

// src/state/riff.ts
var riffSpecificState = ({
  controller,
  logLevel,
  readerInterface,
  src,
  prefetchCache,
  contentLength
}) => {
  let avcProfile = null;
  let nextTrackIndex = 0;
  const profileCallbacks = [];
  const registerOnAvcProfileCallback = (callback) => {
    profileCallbacks.push(callback);
  };
  const onProfile = async (profile) => {
    avcProfile = profile;
    for (const callback of profileCallbacks) {
      await callback(profile);
    }
    profileCallbacks.length = 0;
  };
  const lazyIdx1 = lazyIdx1Fetch({
    controller,
    logLevel,
    readerInterface,
    src,
    prefetchCache,
    contentLength
  });
  const sampleCounter = riffSampleCounter();
  const queuedBFrames = queuedBFramesState();
  return {
    getAvcProfile: () => {
      return avcProfile;
    },
    onProfile,
    registerOnAvcProfileCallback,
    getNextTrackIndex: () => {
      return nextTrackIndex;
    },
    queuedBFrames,
    incrementNextTrackIndex: () => {
      nextTrackIndex++;
    },
    lazyIdx1,
    sampleCounter
  };
};

// src/state/sample-callbacks.ts
var callbacksState = ({
  controller,
  hasAudioTrackHandlers,
  hasVideoTrackHandlers,
  fields,
  keyframes,
  emittedFields,
  samplesObserved,
  structure,
  src,
  seekSignal,
  logLevel
}) => {
  const videoSampleCallbacks = {};
  const audioSampleCallbacks = {};
  const onTrackDoneCallback = {};
  const queuedAudioSamples = {};
  const queuedVideoSamples = {};
  const canSkipTracksState = makeCanSkipTracksState({
    hasAudioTrackHandlers,
    fields,
    hasVideoTrackHandlers,
    structure
  });
  const tracksState = makeTracksSectionState(canSkipTracksState, src);
  return {
    registerVideoSampleCallback: async (id, callback) => {
      if (callback === null) {
        delete videoSampleCallbacks[id];
        return;
      }
      videoSampleCallbacks[id] = callback;
      for (const queued of queuedVideoSamples[id] ?? []) {
        await callback(queued);
      }
      queuedVideoSamples[id] = [];
    },
    onAudioSample: async ({
      audioSample,
      trackId
    }) => {
      if (controller._internals.signal.aborted) {
        throw new Error("Aborted");
      }
      const callback = audioSampleCallbacks[trackId];
      if (audioSample.data.length > 0) {
        if (callback) {
          if (seekSignal.getSeek() !== null) {
            Log.trace(logLevel, "Not emitting sample because seek is processing");
          } else {
            const trackDoneCallback = await callback(audioSample);
            onTrackDoneCallback[trackId] = trackDoneCallback ?? null;
          }
        }
      }
      if (needsToIterateOverSamples({ emittedFields, fields })) {
        samplesObserved.addAudioSample(audioSample);
      }
    },
    onVideoSample: async ({
      trackId,
      videoSample
    }) => {
      if (controller._internals.signal.aborted) {
        throw new Error("Aborted");
      }
      if (videoSample.data.length > 0) {
        const callback = videoSampleCallbacks[trackId];
        if (callback) {
          if (seekSignal.getSeek() !== null) {
            Log.trace(logLevel, "Not emitting sample because seek is processing");
          } else {
            const trackDoneCallback = await callback(videoSample);
            onTrackDoneCallback[trackId] = trackDoneCallback ?? null;
          }
        }
      }
      if (videoSample.type === "key") {
        keyframes.addKeyframe({
          trackId,
          decodingTimeInSeconds: videoSample.decodingTimestamp / WEBCODECS_TIMESCALE,
          positionInBytes: videoSample.offset,
          presentationTimeInSeconds: videoSample.timestamp / WEBCODECS_TIMESCALE,
          sizeInBytes: videoSample.data.length
        });
      }
      if (needsToIterateOverSamples({
        fields,
        emittedFields
      })) {
        samplesObserved.addVideoSample(videoSample);
      }
    },
    canSkipTracksState,
    registerAudioSampleCallback: async (id, callback) => {
      if (callback === null) {
        delete audioSampleCallbacks[id];
        return;
      }
      audioSampleCallbacks[id] = callback;
      for (const queued of queuedAudioSamples[id] ?? []) {
        await callback(queued);
      }
      queuedAudioSamples[id] = [];
    },
    tracks: tracksState,
    audioSampleCallbacks,
    videoSampleCallbacks,
    hasAudioTrackHandlers,
    hasVideoTrackHandlers,
    callTracksDoneCallback: async () => {
      for (const callback of Object.values(onTrackDoneCallback)) {
        if (callback) {
          await callback();
        }
      }
    }
  };
};

// src/state/samples-observed/slow-duration-fps.ts
var samplesObservedState = () => {
  let smallestVideoSample;
  let largestVideoSample;
  let smallestAudioSample;
  let largestAudioSample;
  let lastSampleObserved = false;
  const videoSamples = new Map;
  const audioSamples = new Map;
  const getSlowVideoDurationInSeconds = () => {
    return (largestVideoSample ?? 0) - (smallestVideoSample ?? 0);
  };
  const getSlowAudioDurationInSeconds = () => {
    return (largestAudioSample ?? 0) - (smallestAudioSample ?? 0);
  };
  const getSlowDurationInSeconds = () => {
    const smallestSample = Math.min(smallestAudioSample ?? Infinity, smallestVideoSample ?? Infinity);
    const largestSample = Math.max(largestAudioSample ?? 0, largestVideoSample ?? 0);
    if (smallestSample === Infinity || largestSample === Infinity) {
      return 0;
    }
    return largestSample - smallestSample;
  };
  const addVideoSample = (videoSample) => {
    videoSamples.set(videoSample.timestamp, videoSample.data.byteLength);
    const presentationTimeInSeconds = videoSample.timestamp / WEBCODECS_TIMESCALE;
    const duration2 = (videoSample.duration ?? 0) / WEBCODECS_TIMESCALE;
    if (largestVideoSample === undefined || presentationTimeInSeconds > largestVideoSample) {
      largestVideoSample = presentationTimeInSeconds + duration2;
    }
    if (smallestVideoSample === undefined || presentationTimeInSeconds < smallestVideoSample) {
      smallestVideoSample = presentationTimeInSeconds;
    }
  };
  const addAudioSample = (audioSample) => {
    audioSamples.set(audioSample.timestamp, audioSample.data.byteLength);
    const presentationTimeInSeconds = audioSample.timestamp / WEBCODECS_TIMESCALE;
    const duration2 = (audioSample.duration ?? 0) / WEBCODECS_TIMESCALE;
    if (largestAudioSample === undefined || presentationTimeInSeconds > largestAudioSample) {
      largestAudioSample = presentationTimeInSeconds + duration2;
    }
    if (smallestAudioSample === undefined || presentationTimeInSeconds < smallestAudioSample) {
      smallestAudioSample = presentationTimeInSeconds;
    }
  };
  const getFps2 = () => {
    const videoDuration = (largestVideoSample ?? 0) - (smallestVideoSample ?? 0);
    if (videoDuration === 0) {
      return 0;
    }
    return (videoSamples.size - 1) / videoDuration;
  };
  const getSlowNumberOfFrames = () => videoSamples.size;
  const getAudioBitrate = () => {
    const audioDuration = getSlowAudioDurationInSeconds();
    if (audioDuration === 0 || audioSamples.size === 0) {
      return null;
    }
    const audioSizesInBytes = Array.from(audioSamples.values()).reduce((acc, size) => acc + size, 0);
    return audioSizesInBytes * 8 / audioDuration;
  };
  const getVideoBitrate = () => {
    const videoDuration = getSlowVideoDurationInSeconds();
    if (videoDuration === 0 || videoSamples.size === 0) {
      return null;
    }
    const videoSizesInBytes = Array.from(videoSamples.values()).reduce((acc, size) => acc + size, 0);
    return videoSizesInBytes * 8 / videoDuration;
  };
  const getLastSampleObserved = () => lastSampleObserved;
  const setLastSampleObserved = () => {
    lastSampleObserved = true;
  };
  return {
    addVideoSample,
    addAudioSample,
    getSlowDurationInSeconds,
    getFps: getFps2,
    getSlowNumberOfFrames,
    getAudioBitrate,
    getVideoBitrate,
    getLastSampleObserved,
    setLastSampleObserved,
    getAmountOfSamplesObserved: () => videoSamples.size + audioSamples.size
  };
};

// src/state/seek-infinite-loop.ts
var seekInfiniteLoopDetectionState = () => {
  let lastSeek = null;
  let firstSeekTime = null;
  return {
    registerSeek: (byte) => {
      const now = Date.now();
      if (!lastSeek || lastSeek.byte !== byte) {
        lastSeek = { byte, numberOfTimes: 1 };
        firstSeekTime = now;
        return;
      }
      lastSeek.numberOfTimes++;
      if (lastSeek.numberOfTimes >= 10 && firstSeekTime && now - firstSeekTime <= 2000) {
        throw new Error(`Seeking infinite loop detected: Seeked to byte 0x${byte.toString(16)} ${lastSeek.numberOfTimes} times in a row in the last 2 seconds. Check your usage of .seek().`);
      }
      if (now - firstSeekTime > 2000) {
        lastSeek = { byte, numberOfTimes: 1 };
        firstSeekTime = now;
      }
    },
    reset: () => {
      lastSeek = null;
      firstSeekTime = null;
    }
  };
};

// src/state/timings.ts
var timingsState = () => {
  return {
    timeIterating: 0,
    timeReadingData: 0,
    timeSeeking: 0,
    timeCheckingIfDone: 0,
    timeFreeingData: 0,
    timeInParseLoop: 0
  };
};

// src/state/transport-stream/last-emitted-sample.ts
var lastEmittedSampleState = () => {
  let lastEmittedSample = null;
  return {
    setLastEmittedSample: (sample) => {
      lastEmittedSample = sample;
    },
    getLastEmittedSample: () => lastEmittedSample,
    resetLastEmittedSample: () => {
      lastEmittedSample = null;
    }
  };
};

// src/state/transport-stream/next-pes-header-store.ts
var makeNextPesHeaderStore = () => {
  let nextPesHeader = null;
  return {
    setNextPesHeader: (pesHeader) => {
      nextPesHeader = pesHeader;
    },
    getNextPesHeader: () => {
      if (!nextPesHeader) {
        throw new Error("No next PES header found");
      }
      return nextPesHeader;
    }
  };
};

// src/state/transport-stream/pts-start-offset.ts
var ptsStartOffsetStore = () => {
  const offsets = {};
  return {
    getOffset: (trackId) => offsets[trackId] || 0,
    setOffset: ({ newOffset, trackId }) => {
      offsets[trackId] = newOffset;
    }
  };
};

// src/state/transport-stream/transport-stream.ts
var transportStreamState = () => {
  const streamBuffers = new Map;
  const startOffset = ptsStartOffsetStore();
  const lastEmittedSample = lastEmittedSampleState();
  const state = {
    nextPesHeaderStore: makeNextPesHeaderStore(),
    observedPesHeaders: makeObservedPesHeader(),
    streamBuffers,
    startOffset,
    resetBeforeSeek: () => {
      state.streamBuffers.clear();
      state.nextPesHeaderStore = makeNextPesHeaderStore();
    },
    lastEmittedSample
  };
  return state;
};

// src/state/parser-state.ts
var makeParserState = ({
  hasAudioTrackHandlers,
  hasVideoTrackHandlers,
  controller,
  onAudioTrack,
  onVideoTrack,
  contentLength,
  logLevel,
  mode,
  src,
  readerInterface,
  onDiscardedData,
  selectM3uStreamFn,
  selectM3uAssociatedPlaylistsFn,
  m3uPlaylistContext,
  contentType,
  name,
  callbacks,
  fieldsInReturnValue,
  mimeType,
  initialReaderInstance,
  makeSamplesStartAtZero,
  prefetchCache
}) => {
  let skippedBytes = 0;
  const returnValue = {};
  const iterator = getArrayBufferIterator({
    initialData: new Uint8Array([]),
    maxBytes: contentLength,
    logLevel
  });
  const increaseSkippedBytes = (bytes) => {
    skippedBytes += bytes;
  };
  const structure = structureState();
  const keyframes = keyframesState();
  const emittedFields = emittedState();
  const samplesObserved = samplesObservedState();
  const mp3 = makeMp3State();
  const images = imagesState();
  const timings = timingsState();
  const seekInfiniteLoop = seekInfiniteLoopDetectionState();
  const currentReaderState = currentReader(initialReaderInstance);
  const avc = avcState();
  const errored = null;
  const discardReadBytes = async (force) => {
    const { bytesRemoved, removedData } = iterator.removeBytesRead(force, mode);
    if (bytesRemoved) {
      Log.verbose(logLevel, `Freed ${bytesRemoved} bytes`);
    }
    if (removedData && onDiscardedData) {
      await onDiscardedData(removedData);
    }
  };
  const fields = getFieldsFromCallback({
    fields: fieldsInReturnValue,
    callbacks
  });
  const mediaSection = mediaSectionState();
  return {
    riff: riffSpecificState({
      controller,
      logLevel,
      readerInterface,
      src,
      prefetchCache,
      contentLength
    }),
    transportStream: transportStreamState(),
    webm: webmState({
      controller,
      logLevel,
      readerInterface,
      src,
      prefetchCache
    }),
    iso: isoBaseMediaState({
      contentLength,
      controller,
      readerInterface,
      src,
      logLevel,
      prefetchCache
    }),
    mp3,
    aac: aacState(),
    flac: flacState(),
    m3u: m3uState(logLevel),
    timings,
    callbacks: callbacksState({
      controller,
      hasAudioTrackHandlers,
      hasVideoTrackHandlers,
      fields,
      keyframes,
      emittedFields,
      samplesObserved,
      structure,
      src,
      seekSignal: controller._internals.seekSignal,
      logLevel
    }),
    getInternalStats: () => ({
      skippedBytes,
      finalCursorOffset: iterator.counter.getOffset() ?? 0
    }),
    getSkipBytes: () => skippedBytes,
    increaseSkippedBytes,
    keyframes,
    structure,
    onAudioTrack,
    onVideoTrack,
    emittedFields,
    fields,
    samplesObserved,
    contentLength,
    images,
    mediaSection,
    logLevel,
    iterator,
    controller,
    mode,
    src,
    readerInterface,
    discardReadBytes,
    selectM3uStreamFn,
    selectM3uAssociatedPlaylistsFn,
    m3uPlaylistContext,
    contentType,
    name,
    returnValue,
    callbackFunctions: callbacks,
    fieldsInReturnValue,
    mimeType,
    errored,
    currentReader: currentReaderState,
    seekInfiniteLoop,
    makeSamplesStartAtZero,
    prefetchCache,
    avc
  };
};

// src/throttled-progress.ts
var throttledStateUpdate = ({
  updateFn,
  everyMilliseconds,
  controller
}) => {
  let currentState = {
    bytes: 0,
    percentage: null,
    totalBytes: null
  };
  if (!updateFn) {
    return {
      get: () => currentState,
      update: null,
      stopAndGetLastProgress: () => {}
    };
  }
  let lastUpdated = null;
  const callUpdateIfChanged = () => {
    if (currentState === lastUpdated) {
      return;
    }
    updateFn(currentState);
    lastUpdated = currentState;
  };
  let cleanup = () => {};
  if (everyMilliseconds > 0) {
    const interval = setInterval(() => {
      callUpdateIfChanged();
    }, everyMilliseconds);
    const onAbort = () => {
      clearInterval(interval);
    };
    controller._internals.signal.addEventListener("abort", onAbort, {
      once: true
    });
    cleanup = () => {
      clearInterval(interval);
      controller._internals.signal.removeEventListener("abort", onAbort);
    };
  }
  return {
    get: () => currentState,
    update: (fn) => {
      currentState = fn(currentState);
      if (everyMilliseconds === 0) {
        callUpdateIfChanged();
      }
    },
    stopAndGetLastProgress: () => {
      cleanup();
      return currentState;
    }
  };
};

// src/internal-parse-media.ts
var internalParseMedia = async function({
  src,
  fields: _fieldsInReturnValue,
  reader: readerInterface,
  onAudioTrack,
  onVideoTrack,
  controller = mediaParserController(),
  logLevel,
  onParseProgress: onParseProgressDoNotCallDirectly,
  progressIntervalInMs,
  mode,
  onDiscardedData,
  onError,
  acknowledgeRemotionLicense,
  apiName,
  selectM3uStream: selectM3uStreamFn,
  selectM3uAssociatedPlaylists: selectM3uAssociatedPlaylistsFn,
  m3uPlaylistContext,
  makeSamplesStartAtZero,
  seekingHints,
  ...more
}) {
  if (!src) {
    throw new Error('No "src" provided');
  }
  controller._internals.markAsReadyToEmitEvents();
  warnIfRemotionLicenseNotAcknowledged({
    acknowledgeRemotionLicense,
    logLevel,
    apiName
  });
  Log.verbose(logLevel, `Reading ${typeof src === "string" ? src : src instanceof URL ? src.toString() : src instanceof File ? src.name : src.toString()}`);
  const prefetchCache = new Map;
  const {
    reader: readerInstance,
    contentLength,
    name,
    contentType,
    supportsContentRange,
    needsContentRange
  } = await readerInterface.read({
    src,
    range: null,
    controller,
    logLevel,
    prefetchCache
  });
  if (contentLength === null) {
    throw new Error(`Cannot read media ${src} without a content length. This is currently not supported. Ensure the media has a "Content-Length" HTTP header.`);
  }
  if (!supportsContentRange && needsContentRange) {
    throw new Error('Cannot read media without it supporting the "Content-Range" header. This is currently not supported. Ensure the media supports the "Content-Range" HTTP header.');
  }
  const hasAudioTrackHandlers = Boolean(onAudioTrack);
  const hasVideoTrackHandlers = Boolean(onVideoTrack);
  const state = makeParserState({
    hasAudioTrackHandlers,
    hasVideoTrackHandlers,
    controller,
    onAudioTrack: onAudioTrack ?? null,
    onVideoTrack: onVideoTrack ?? null,
    contentLength,
    logLevel,
    mode,
    readerInterface,
    src,
    onDiscardedData,
    selectM3uStreamFn,
    selectM3uAssociatedPlaylistsFn,
    m3uPlaylistContext,
    contentType,
    name,
    callbacks: more,
    fieldsInReturnValue: _fieldsInReturnValue ?? {},
    mimeType: contentType,
    initialReaderInstance: readerInstance,
    makeSamplesStartAtZero,
    prefetchCache
  });
  if (seekingHints) {
    setSeekingHints({ hints: seekingHints, state });
  }
  controller._internals.attachSeekingHintResolution(() => Promise.resolve(getSeekingHints({
    tracksState: state.callbacks.tracks,
    keyframesState: state.keyframes,
    webmState: state.webm,
    structureState: state.structure,
    m3uPlaylistContext: state.m3uPlaylistContext,
    mediaSectionState: state.mediaSection,
    isoState: state.iso,
    transportStream: state.transportStream,
    flacState: state.flac,
    samplesObserved: state.samplesObserved,
    riffState: state.riff,
    mp3State: state.mp3,
    contentLength: state.contentLength,
    aacState: state.aac
  })));
  controller._internals.attachSimulateSeekResolution((seek2) => {
    const {
      aacState: aacState2,
      avcState: avcState2,
      flacState: flacState2,
      isoState,
      iterator,
      keyframes,
      m3uState: m3uState2,
      mediaSection,
      mp3State,
      riffState,
      samplesObserved,
      structureState: structureState2,
      tracksState,
      transportStream,
      webmState: webmState2
    } = getWorkOnSeekRequestOptions(state);
    return turnSeekIntoByte({
      aacState: aacState2,
      seek: seek2,
      avcState: avcState2,
      contentLength,
      flacState: flacState2,
      isoState,
      iterator,
      keyframes,
      logLevel,
      m3uPlaylistContext,
      m3uState: m3uState2,
      mediaSectionState: mediaSection,
      mp3State,
      riffState,
      samplesObserved,
      structureState: structureState2,
      tracksState,
      transportStream,
      webmState: webmState2
    });
  });
  if (!hasAudioTrackHandlers && !hasVideoTrackHandlers && Object.values(state.fields).every((v) => !v) && mode === "query") {
    Log.warn(logLevel, new Error("Warning - No `fields` and no `on*` callbacks were passed to `parseMedia()`. Specify the data you would like to retrieve."));
  }
  const throttledState = throttledStateUpdate({
    updateFn: onParseProgressDoNotCallDirectly ?? null,
    everyMilliseconds: progressIntervalInMs ?? 100,
    controller,
    totalBytes: contentLength
  });
  await triggerInfoEmit(state);
  await parseLoop({ state, throttledState, onError });
  Log.verbose(logLevel, "Finished parsing file");
  await emitAllInfo(state);
  printTimings(state);
  state.currentReader.getCurrent().abort();
  state.iterator?.destroy();
  state.callbacks.tracks.ensureHasTracksAtEnd(state.fields);
  state.m3u.abortM3UStreamRuns();
  prefetchCache.clear();
  if (state.errored) {
    throw state.errored;
  }
  if (state.controller._internals.seekSignal.getSeek() !== null) {
    throw new Error("Should not finish while a seek is pending");
  }
  return state.returnValue;
};

// src/worker/forward-controller-to-worker.ts
var forwardMediaParserControllerToWorker = (controller) => {
  return (message) => {
    if (message.type === "request-pause") {
      controller.pause();
      return;
    }
    if (message.type === "request-seek") {
      controller.seek(message.payload);
      return;
    }
    if (message.type === "request-get-seeking-hints") {
      controller.getSeekingHints().then((hints) => {
        postMessage({
          type: "response-get-seeking-hints",
          payload: hints
        });
      }).catch((error) => {
        postMessage({
          type: "response-error",
          payload: error
        });
      });
      return;
    }
    if (message.type === "request-simulate-seek") {
      controller.simulateSeek(message.payload).then((resolution) => {
        postMessage({
          type: "response-simulate-seek",
          nonce: message.nonce,
          payload: resolution
        });
      }).catch((err) => {
        postMessage({
          type: "response-error",
          payload: err
        });
      });
      return;
    }
    if (message.type === "request-resume") {
      controller.resume();
      return;
    }
    if (message.type === "request-abort") {
      controller.abort();
      return;
    }
    const msg = `Unknown message type: ${message.type}`;
    Log.error(msg);
    throw new Error(msg);
  };
};

// src/worker/serialize-error.ts
var serializeError = ({
  error,
  logLevel,
  seekingHints
}) => {
  if (error instanceof IsAnImageError) {
    return {
      type: "response-error",
      errorName: "IsAnImageError",
      dimensions: error.dimensions,
      errorMessage: error.message,
      errorStack: error.stack ?? "",
      fileName: error.fileName,
      imageType: error.imageType,
      mimeType: error.mimeType,
      sizeInBytes: error.sizeInBytes
    };
  }
  if (error instanceof IsAPdfError) {
    return {
      type: "response-error",
      errorName: "IsAPdfError",
      errorMessage: error.message,
      errorStack: error.stack ?? "",
      mimeType: error.mimeType,
      sizeInBytes: error.sizeInBytes,
      fileName: error.fileName
    };
  }
  if (error instanceof MediaParserAbortError) {
    return {
      type: "response-error",
      errorName: "MediaParserAbortError",
      errorMessage: error.message,
      errorStack: error.stack ?? "",
      seekingHints
    };
  }
  if (error instanceof TypeError) {
    return {
      type: "response-error",
      errorName: "TypeError",
      errorMessage: error.message,
      errorStack: error.stack ?? ""
    };
  }
  if (error.name === "AbortError") {
    return {
      type: "response-error",
      errorName: "AbortError",
      errorMessage: error.message,
      errorStack: error.stack ?? ""
    };
  }
  if (error.name === "NotReadableError") {
    return {
      type: "response-error",
      errorName: "NotReadableError",
      errorMessage: error.message,
      errorStack: error.stack ?? ""
    };
  }
  if (error.name !== "Error") {
    Log.warn(logLevel, `Original error was of type ${error.name} did not properly propagate`);
  }
  return {
    type: "response-error",
    errorName: "Error",
    errorMessage: error.message,
    errorStack: error.stack ?? ""
  };
};

// src/worker-server.ts
var post = (message) => {
  postMessage(message);
};
var controller = mediaParserController();
var executeCallback = (payload) => {
  const nonce = String(Math.random());
  const { promise, resolve, reject } = withResolvers();
  const cb = (msg) => {
    const data = msg.data;
    if (data.type === "acknowledge-callback" && data.nonce === nonce) {
      const { nonce: _, ...pay } = data;
      controller._internals.checkForAbortAndPause().then(() => {
        resolve(pay);
      }).catch((err) => {
        reject(err);
      });
      removeEventListener("message", cb);
    }
    if (data.type === "signal-error-in-callback") {
      reject(new Error("Error in callback function"));
    }
  };
  addEventListener("message", cb);
  post({
    type: "response-on-callback-request",
    payload,
    nonce
  });
  return promise;
};
var startParsing = async (message, reader) => {
  const { payload, src } = message;
  const {
    fields,
    acknowledgeRemotionLicense,
    logLevel: userLogLevel,
    progressIntervalInMs,
    m3uPlaylistContext,
    seekingHints,
    makeSamplesStartAtZero
  } = payload;
  const {
    postAudioCodec,
    postContainer,
    postDimensions,
    postFps,
    postImages,
    postInternalStats,
    postIsHdr,
    postKeyframes,
    postLocation,
    postM3uStreams,
    postMetadata,
    postMimeType,
    postName,
    postNumberOfAudioChannels,
    postRotation,
    postSampleRate,
    postSlowAudioBitrate,
    postSlowNumberOfFrames,
    postSlowFps,
    postSlowDurationInSeconds,
    postSlowVideoBitrate,
    postSlowStructure,
    postTracks,
    postUnrotatedDimensions,
    postVideoCodec,
    postSize,
    postSlowKeyframes,
    postDurationInSeconds,
    postParseProgress,
    postM3uStreamSelection,
    postM3uAssociatedPlaylistsSelection,
    postOnAudioTrack,
    postOnVideoTrack
  } = message;
  const logLevel = userLogLevel ?? "info";
  try {
    const ret = await internalParseMedia({
      src,
      reader,
      acknowledgeRemotionLicense: Boolean(acknowledgeRemotionLicense),
      onError: () => ({ action: "fail" }),
      logLevel,
      fields: fields ?? null,
      apiName: "parseMediaInWorker()",
      controller,
      mode: "query",
      onAudioCodec: postAudioCodec ? async (codec) => {
        await executeCallback({
          callbackType: "audio-codec",
          value: codec
        });
      } : null,
      onContainer: postContainer ? async (container) => {
        await executeCallback({
          callbackType: "container",
          value: container
        });
      } : null,
      onDimensions: postDimensions ? async (dimensions) => {
        await executeCallback({
          callbackType: "dimensions",
          value: dimensions
        });
      } : null,
      onFps: postFps ? async (fps) => {
        await executeCallback({
          callbackType: "fps",
          value: fps
        });
      } : null,
      onImages: postImages ? async (images) => {
        await executeCallback({
          callbackType: "images",
          value: images
        });
      } : null,
      onInternalStats: postInternalStats ? async (internalStats) => {
        await executeCallback({
          callbackType: "internal-stats",
          value: internalStats
        });
      } : null,
      onIsHdr: postIsHdr ? async (isHdr) => {
        await executeCallback({
          callbackType: "is-hdr",
          value: isHdr
        });
      } : null,
      onKeyframes: postKeyframes ? async (keyframes) => {
        await executeCallback({
          callbackType: "keyframes",
          value: keyframes
        });
      } : null,
      onLocation: postLocation ? async (location) => {
        await executeCallback({
          callbackType: "location",
          value: location
        });
      } : null,
      onM3uStreams: postM3uStreams ? async (streams) => {
        await executeCallback({
          callbackType: "m3u-streams",
          value: streams
        });
      } : null,
      onMetadata: postMetadata ? async (metadata) => {
        await executeCallback({
          callbackType: "metadata",
          value: metadata
        });
      } : null,
      onMimeType: postMimeType ? async (mimeType) => {
        await executeCallback({
          callbackType: "mime-type",
          value: mimeType
        });
      } : null,
      onName: postName ? async (name) => {
        await executeCallback({
          callbackType: "name",
          value: name
        });
      } : null,
      onNumberOfAudioChannels: postNumberOfAudioChannels ? async (numberOfChannels) => {
        await executeCallback({
          callbackType: "number-of-audio-channels",
          value: numberOfChannels
        });
      } : null,
      onRotation: postRotation ? async (rotation) => {
        await executeCallback({
          callbackType: "rotation",
          value: rotation
        });
      } : null,
      onSampleRate: postSampleRate ? async (sampleRate) => {
        await executeCallback({
          callbackType: "sample-rate",
          value: sampleRate
        });
      } : null,
      onSize: postSize ? async (size) => {
        await executeCallback({
          callbackType: "size",
          value: size
        });
      } : null,
      onSlowAudioBitrate: postSlowAudioBitrate ? async (audioBitrate) => {
        await executeCallback({
          callbackType: "slow-audio-bitrate",
          value: audioBitrate
        });
      } : null,
      onSlowDurationInSeconds: postSlowDurationInSeconds ? async (durationInSeconds) => {
        await executeCallback({
          callbackType: "slow-duration-in-seconds",
          value: durationInSeconds
        });
      } : null,
      onSlowFps: postSlowFps ? async (fps) => {
        await executeCallback({
          callbackType: "slow-fps",
          value: fps
        });
      } : null,
      onSlowKeyframes: postSlowKeyframes ? async (keyframes) => {
        await executeCallback({
          callbackType: "slow-keyframes",
          value: keyframes
        });
      } : null,
      onSlowNumberOfFrames: postSlowNumberOfFrames ? async (numberOfFrames) => {
        await executeCallback({
          callbackType: "slow-number-of-frames",
          value: numberOfFrames
        });
      } : null,
      onSlowVideoBitrate: postSlowVideoBitrate ? async (videoBitrate) => {
        await executeCallback({
          callbackType: "slow-video-bitrate",
          value: videoBitrate
        });
      } : null,
      onSlowStructure: postSlowStructure ? async (structure) => {
        await executeCallback({
          callbackType: "slow-structure",
          value: structure
        });
      } : null,
      onTracks: postTracks ? async (tracks2) => {
        await executeCallback({
          callbackType: "tracks",
          value: tracks2
        });
      } : null,
      onUnrotatedDimensions: postUnrotatedDimensions ? async (dimensions) => {
        await executeCallback({
          callbackType: "unrotated-dimensions",
          value: dimensions
        });
      } : null,
      onVideoCodec: postVideoCodec ? async (codec) => {
        await executeCallback({
          callbackType: "video-codec",
          value: codec
        });
      } : null,
      onDurationInSeconds: postDurationInSeconds ? async (durationInSeconds) => {
        await executeCallback({
          callbackType: "duration-in-seconds",
          value: durationInSeconds
        });
      } : null,
      onParseProgress: postParseProgress ? async (progress) => {
        await executeCallback({
          callbackType: "parse-progress",
          value: progress
        });
      } : null,
      progressIntervalInMs: progressIntervalInMs ?? null,
      selectM3uStream: postM3uStreamSelection ? async (streamIndex) => {
        const res = await executeCallback({
          callbackType: "m3u-stream-selection",
          value: streamIndex
        });
        if (res.payloadType !== "m3u-stream-selection") {
          throw new Error("Invalid response from callback");
        }
        return res.value;
      } : defaultSelectM3uStreamFn,
      m3uPlaylistContext: m3uPlaylistContext ?? null,
      selectM3uAssociatedPlaylists: postM3uAssociatedPlaylistsSelection ? async (playlists) => {
        const res = await executeCallback({
          callbackType: "m3u-associated-playlists-selection",
          value: playlists
        });
        if (res.payloadType !== "m3u-associated-playlists-selection") {
          throw new Error("Invalid response from callback");
        }
        return res.value;
      } : defaultSelectM3uAssociatedPlaylists,
      onAudioTrack: postOnAudioTrack ? async (params) => {
        const res = await executeCallback({
          callbackType: "on-audio-track",
          value: params
        });
        if (res.payloadType !== "on-audio-track-response") {
          throw new Error("Invalid response from callback");
        }
        if (!res.registeredCallback) {
          return null;
        }
        return async (sample) => {
          const audioSampleRes = await executeCallback({
            callbackType: "on-audio-sample",
            value: sample,
            trackId: params.track.trackId
          });
          if (audioSampleRes.payloadType !== "on-sample-response") {
            throw new Error("Invalid response from callback");
          }
          if (!audioSampleRes.registeredTrackDoneCallback) {
            return;
          }
          return async () => {
            await executeCallback({
              callbackType: "track-done",
              trackId: params.track.trackId
            });
          };
        };
      } : null,
      onVideoTrack: postOnVideoTrack ? async (params) => {
        const res = await executeCallback({
          callbackType: "on-video-track",
          value: params
        });
        if (res.payloadType !== "on-video-track-response") {
          throw new Error("Invalid response from callback");
        }
        if (!res.registeredCallback) {
          return null;
        }
        return async (sample) => {
          const videoSampleRes = await executeCallback({
            callbackType: "on-video-sample",
            value: sample,
            trackId: params.track.trackId
          });
          if (videoSampleRes.payloadType !== "on-sample-response") {
            throw new Error("Invalid response from callback");
          }
          if (!videoSampleRes.registeredTrackDoneCallback) {
            return;
          }
          return async () => {
            await executeCallback({
              callbackType: "track-done",
              trackId: params.track.trackId
            });
          };
        };
      } : null,
      onDiscardedData: null,
      makeSamplesStartAtZero: makeSamplesStartAtZero ?? true,
      seekingHints: seekingHints ?? null
    });
    post({
      type: "response-done",
      payload: ret,
      seekingHints: await controller.getSeekingHints()
    });
  } catch (e) {
    let seekingHintsRes = null;
    try {
      seekingHintsRes = await controller.getSeekingHints();
    } catch {}
    post(serializeError({
      error: e,
      logLevel,
      seekingHints: seekingHintsRes
    }));
  }
};
var onMessageForWorker = forwardMediaParserControllerToWorker(controller);
var messageHandler = (message, readerInterface) => {
  const data = message.data;
  if (data.type === "request-worker") {
    startParsing(data, readerInterface);
    return;
  }
  if (data.type === "acknowledge-callback") {
    return;
  }
  if (data.type === "signal-error-in-callback") {
    return;
  }
  onMessageForWorker(data);
};

// src/worker-server-entry.ts
addEventListener("message", (message) => {
  messageHandler(message, universalReader);
});
