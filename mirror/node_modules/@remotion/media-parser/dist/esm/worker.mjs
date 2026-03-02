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
var hasBeenAborted = (error) => {
  return error instanceof MediaParserAbortError || error.name === "MediaParserAbortError" || error.name === "AbortError";
};

// src/worker/serialize-error.ts
var deserializeError = (error) => {
  switch (error.errorName) {
    case "IsAnImageError":
      return new IsAnImageError({
        dimensions: error.dimensions,
        fileName: error.fileName,
        imageType: error.imageType,
        mimeType: error.mimeType,
        sizeInBytes: error.sizeInBytes,
        message: error.errorMessage
      });
    case "IsAPdfError":
      return new IsAPdfError({
        fileName: error.fileName,
        mimeType: error.mimeType,
        sizeInBytes: error.sizeInBytes,
        message: error.errorMessage
      });
    case "IsAnUnsupportedFileTypeError":
      return new IsAnUnsupportedFileTypeError({
        fileName: error.fileName,
        mimeType: error.mimeType,
        sizeInBytes: error.sizeInBytes,
        message: error.errorMessage
      });
    case "MediaParserAbortError":
      return new MediaParserAbortError(error.errorMessage);
    case "Error":
      return new Error(error.errorMessage);
    case "AbortError":
      return new Error(error.errorMessage);
    case "NotReadableError":
      return new Error(error.errorMessage);
    case "TypeError":
      return new TypeError(error.errorMessage);
    default:
      throw new Error(`Unknown error name: ${error}`);
  }
};

// src/parse-media-on-worker-entry.ts
var convertToWorkerPayload = (payload) => {
  const {
    onAudioCodec,
    onContainer,
    onDimensions,
    onUnrotatedDimensions,
    onVideoCodec,
    onFps,
    onAudioTrack,
    onDurationInSeconds,
    onImages,
    onInternalStats,
    onIsHdr,
    onKeyframes,
    onLocation,
    onM3uStreams,
    onMetadata,
    onMimeType,
    onName,
    onNumberOfAudioChannels,
    onParseProgress,
    onRotation,
    onSampleRate,
    onSlowAudioBitrate,
    onSize,
    onSlowDurationInSeconds,
    onSlowFps,
    onSlowKeyframes,
    onSlowNumberOfFrames,
    onSlowVideoBitrate,
    onSlowStructure,
    onTracks,
    onVideoTrack,
    selectM3uStream,
    selectM3uAssociatedPlaylists,
    src,
    ...others
  } = payload;
  return {
    type: "request-worker",
    payload: others,
    postAudioCodec: Boolean(onAudioCodec),
    postContainer: Boolean(onContainer),
    postDimensions: Boolean(onDimensions),
    postDurationInSeconds: Boolean(onDurationInSeconds),
    postFps: Boolean(onFps),
    postImages: Boolean(onImages),
    postInternalStats: Boolean(onInternalStats),
    postIsHdr: Boolean(onIsHdr),
    postKeyframes: Boolean(onKeyframes),
    postLocation: Boolean(onLocation),
    postM3uStreams: Boolean(onM3uStreams),
    postMetadata: Boolean(onMetadata),
    postMimeType: Boolean(onMimeType),
    postName: Boolean(onName),
    postNumberOfAudioChannels: Boolean(onNumberOfAudioChannels),
    postRotation: Boolean(onRotation),
    postSampleRate: Boolean(onSampleRate),
    postSlowAudioBitrate: Boolean(onSlowAudioBitrate),
    postSlowDurationInSeconds: Boolean(onSlowDurationInSeconds),
    postSlowFps: Boolean(onSlowFps),
    postSlowKeyframes: Boolean(onSlowKeyframes),
    postSlowNumberOfFrames: Boolean(onSlowNumberOfFrames),
    postSlowVideoBitrate: Boolean(onSlowVideoBitrate),
    postSlowStructure: Boolean(onSlowStructure),
    postTracks: Boolean(onTracks),
    postUnrotatedDimensions: Boolean(onUnrotatedDimensions),
    postVideoCodec: Boolean(onVideoCodec),
    postSize: Boolean(onSize),
    postParseProgress: Boolean(onParseProgress),
    postM3uStreamSelection: Boolean(selectM3uStream),
    postM3uAssociatedPlaylistsSelection: Boolean(selectM3uAssociatedPlaylists),
    postOnAudioTrack: Boolean(onAudioTrack),
    postOnVideoTrack: Boolean(onVideoTrack),
    src: src instanceof URL ? src.toString() : src
  };
};
var post = (worker, payload) => {
  worker.postMessage(payload);
};
var parseMediaOnWorkerImplementation = async ({ controller, reader, ...params }, worker, apiName) => {
  if (reader) {
    throw new Error(`\`reader\` should not be provided to \`${apiName}\`. If you want to use it in the browser, use parseMediaOnWorker(). If you also want to read files from the file system, use parseMediaOnServerWorker().`);
  }
  post(worker, convertToWorkerPayload(params));
  let workerTerminated = false;
  const { promise, resolve, reject } = withResolvers();
  const onAbort = () => {
    post(worker, { type: "request-abort" });
  };
  const onResume = () => {
    post(worker, { type: "request-resume" });
  };
  const onPause = () => {
    post(worker, { type: "request-pause" });
  };
  const onSeek = ({ detail: { seek } }) => {
    post(worker, { type: "request-seek", payload: seek });
    controller?._internals.seekSignal.clearSeekIfStillSame(seek);
  };
  const seekingHintPromises = [];
  let finalSeekingHints = null;
  controller?._internals.attachSeekingHintResolution(() => {
    if (finalSeekingHints) {
      return Promise.resolve(finalSeekingHints);
    }
    if (workerTerminated) {
      return Promise.reject(new Error("Worker terminated"));
    }
    const prom = withResolvers();
    post(worker, { type: "request-get-seeking-hints" });
    seekingHintPromises.push(prom);
    return prom.promise;
  });
  const simulateSeekPromises = {};
  controller?._internals.attachSimulateSeekResolution((seek) => {
    const prom = withResolvers();
    const nonce = String(Math.random());
    post(worker, { type: "request-simulate-seek", payload: seek, nonce });
    simulateSeekPromises[nonce] = prom;
    return prom.promise;
  });
  const callbacks = {};
  const trackDoneCallbacks = {};
  function onMessage(message) {
    const data = message.data;
    if (data.type === "response-done") {
      resolve(data.payload);
      if (data.seekingHints) {
        finalSeekingHints = data.seekingHints;
        for (const prom of seekingHintPromises) {
          prom.resolve(finalSeekingHints);
        }
      }
      return;
    }
    if (data.type === "response-error") {
      cleanup();
      const error = deserializeError(data);
      error.stack = data.errorStack;
      reject(error);
      if (data.errorName === "MediaParserAbortError") {
        finalSeekingHints = data.seekingHints;
        for (const prom of seekingHintPromises) {
          prom.resolve(finalSeekingHints);
        }
      } else {
        for (const prom of seekingHintPromises) {
          prom.reject(error);
        }
      }
      return;
    }
    if (data.type === "response-on-callback-request") {
      Promise.resolve().then(async () => {
        if (data.payload.callbackType === "audio-codec") {
          await params.onAudioCodec?.(data.payload.value);
          return { payloadType: "void" };
        }
        if (data.payload.callbackType === "container") {
          await params.onContainer?.(data.payload.value);
          return { payloadType: "void" };
        }
        if (data.payload.callbackType === "dimensions") {
          await params.onDimensions?.(data.payload.value);
          return { payloadType: "void" };
        }
        if (data.payload.callbackType === "unrotated-dimensions") {
          await params.onUnrotatedDimensions?.(data.payload.value);
          return { payloadType: "void" };
        }
        if (data.payload.callbackType === "video-codec") {
          await params.onVideoCodec?.(data.payload.value);
          return { payloadType: "void" };
        }
        if (data.payload.callbackType === "tracks") {
          await params.onTracks?.(data.payload.value);
          return { payloadType: "void" };
        }
        if (data.payload.callbackType === "rotation") {
          await params.onRotation?.(data.payload.value);
          return { payloadType: "void" };
        }
        if (data.payload.callbackType === "sample-rate") {
          await params.onSampleRate?.(data.payload.value);
          return { payloadType: "void" };
        }
        if (data.payload.callbackType === "slow-audio-bitrate") {
          await params.onSlowAudioBitrate?.(data.payload.value);
          return { payloadType: "void" };
        }
        if (data.payload.callbackType === "slow-duration-in-seconds") {
          await params.onSlowDurationInSeconds?.(data.payload.value);
          return { payloadType: "void" };
        }
        if (data.payload.callbackType === "slow-fps") {
          await params.onSlowFps?.(data.payload.value);
          return { payloadType: "void" };
        }
        if (data.payload.callbackType === "slow-keyframes") {
          await params.onSlowKeyframes?.(data.payload.value);
          return { payloadType: "void" };
        }
        if (data.payload.callbackType === "slow-number-of-frames") {
          await params.onSlowNumberOfFrames?.(data.payload.value);
          return { payloadType: "void" };
        }
        if (data.payload.callbackType === "slow-video-bitrate") {
          await params.onSlowVideoBitrate?.(data.payload.value);
          return { payloadType: "void" };
        }
        if (data.payload.callbackType === "slow-structure") {
          await params.onSlowStructure?.(data.payload.value);
          return { payloadType: "void" };
        }
        if (data.payload.callbackType === "fps") {
          await params.onFps?.(data.payload.value);
          return { payloadType: "void" };
        }
        if (data.payload.callbackType === "images") {
          await params.onImages?.(data.payload.value);
          return { payloadType: "void" };
        }
        if (data.payload.callbackType === "internal-stats") {
          await params.onInternalStats?.(data.payload.value);
          return { payloadType: "void" };
        }
        if (data.payload.callbackType === "is-hdr") {
          await params.onIsHdr?.(data.payload.value);
          return { payloadType: "void" };
        }
        if (data.payload.callbackType === "keyframes") {
          await params.onKeyframes?.(data.payload.value);
          return { payloadType: "void" };
        }
        if (data.payload.callbackType === "location") {
          await params.onLocation?.(data.payload.value);
          return { payloadType: "void" };
        }
        if (data.payload.callbackType === "m3u-streams") {
          await params.onM3uStreams?.(data.payload.value);
          return { payloadType: "void" };
        }
        if (data.payload.callbackType === "metadata") {
          await params.onMetadata?.(data.payload.value);
          return { payloadType: "void" };
        }
        if (data.payload.callbackType === "mime-type") {
          await params.onMimeType?.(data.payload.value);
          return { payloadType: "void" };
        }
        if (data.payload.callbackType === "name") {
          await params.onName?.(data.payload.value);
          return { payloadType: "void" };
        }
        if (data.payload.callbackType === "number-of-audio-channels") {
          await params.onNumberOfAudioChannels?.(data.payload.value);
          return { payloadType: "void" };
        }
        if (data.payload.callbackType === "size") {
          await params.onSize?.(data.payload.value);
          return { payloadType: "void" };
        }
        if (data.payload.callbackType === "duration-in-seconds") {
          await params.onDurationInSeconds?.(data.payload.value);
          return { payloadType: "void" };
        }
        if (data.payload.callbackType === "parse-progress") {
          await params.onParseProgress?.(data.payload.value);
          return { payloadType: "void" };
        }
        if (data.payload.callbackType === "m3u-stream-selection") {
          const selection = await params.selectM3uStream(data.payload.value);
          return { payloadType: "m3u-stream-selection", value: selection };
        }
        if (data.payload.callbackType === "m3u-associated-playlists-selection") {
          const selection = await params.selectM3uAssociatedPlaylists(data.payload.value);
          return {
            payloadType: "m3u-associated-playlists-selection",
            value: selection
          };
        }
        if (data.payload.callbackType === "on-audio-track") {
          const possibleCallback = await params.onAudioTrack?.(data.payload.value);
          if (possibleCallback) {
            callbacks[data.payload.value.track.trackId] = possibleCallback;
          }
          return {
            payloadType: "on-audio-track-response",
            registeredCallback: Boolean(possibleCallback)
          };
        }
        if (data.payload.callbackType === "on-video-track") {
          const possibleCallback = await params.onVideoTrack?.(data.payload.value);
          if (possibleCallback) {
            callbacks[data.payload.value.track.trackId] = possibleCallback;
          }
          return {
            payloadType: "on-video-track-response",
            registeredCallback: Boolean(possibleCallback)
          };
        }
        if (data.payload.callbackType === "on-audio-sample") {
          const callback = callbacks[data.payload.trackId];
          if (!callback) {
            throw new Error(`No callback registered for track ${data.payload.trackId}`);
          }
          const trackDoneCallback = await callback(data.payload.value);
          if (trackDoneCallback) {
            trackDoneCallbacks[data.payload.trackId] = trackDoneCallback;
          }
          return {
            payloadType: "on-sample-response",
            registeredTrackDoneCallback: Boolean(trackDoneCallback)
          };
        }
        if (data.payload.callbackType === "on-video-sample") {
          const callback = callbacks[data.payload.trackId];
          if (!callback) {
            throw new Error(`No callback registered for track ${data.payload.trackId}`);
          }
          const trackDoneCallback = await callback(data.payload.value);
          if (trackDoneCallback) {
            trackDoneCallbacks[data.payload.trackId] = trackDoneCallback;
          }
          return {
            payloadType: "on-sample-response",
            registeredTrackDoneCallback: Boolean(trackDoneCallback)
          };
        }
        if (data.payload.callbackType === "track-done") {
          const trackDoneCallback = trackDoneCallbacks[data.payload.trackId];
          if (!trackDoneCallback) {
            throw new Error(`No track done callback registered for track ${data.payload.trackId}`);
          }
          trackDoneCallback();
          return { payloadType: "void" };
        }
        throw new Error(`Unknown callback type: ${data.payload}`);
      }).then((payload) => {
        post(worker, {
          type: "acknowledge-callback",
          nonce: data.nonce,
          ...payload
        });
      }).catch((err) => {
        reject(err);
        post(worker, {
          type: "signal-error-in-callback",
          nonce: data.nonce
        });
      });
      return;
    }
    if (data.type === "response-get-seeking-hints") {
      const firstPromise = seekingHintPromises.shift();
      if (!firstPromise) {
        throw new Error("No seeking hint promise found");
      }
      firstPromise.resolve(data.payload);
      return;
    }
    if (data.type === "response-simulate-seek") {
      const prom = simulateSeekPromises[data.nonce];
      if (!prom) {
        throw new Error("No simulate seek promise found");
      }
      prom.resolve(data.payload);
      delete simulateSeekPromises[data.nonce];
      return;
    }
    throw new Error(`Unknown response type: ${JSON.stringify(data)}`);
  }
  worker.addEventListener("message", onMessage);
  controller?.addEventListener("abort", onAbort);
  controller?.addEventListener("resume", onResume);
  controller?.addEventListener("pause", onPause);
  controller?.addEventListener("seek", onSeek);
  function cleanup() {
    worker.removeEventListener("message", onMessage);
    controller?.removeEventListener("abort", onAbort);
    controller?.removeEventListener("resume", onResume);
    controller?.removeEventListener("pause", onPause);
    controller?.removeEventListener("seek", onSeek);
    workerTerminated = true;
    worker.terminate();
  }
  controller?._internals.markAsReadyToEmitEvents();
  const val = await promise;
  cleanup();
  return val;
};

// src/worker.module.ts
var parseMediaOnWebWorker = (params) => {
  if (typeof Worker === "undefined") {
    throw new Error('"Worker" is not available. Cannot call parseMediaOnWebWorker()');
  }
  if (import.meta.url.includes(".vite/deps")) {
    const err = [
      "Detected Vite pre-bundling, which will break the worker.",
      "Please add the following to your vite.config.js:",
      "  optimizeDeps: {",
      '    exclude: ["@remotion/media-parser/worker"]',
      "  }"
    ].join(`
`);
    throw new Error(err);
  }
  const worker = new Worker(new URL("./worker-web-entry.mjs", import.meta.url));
  return parseMediaOnWorkerImplementation(params, worker, "parseMediaOnWebWorker");
};
export {
  parseMediaOnWebWorker,
  hasBeenAborted,
  MediaParserAbortError,
  IsAnUnsupportedFileTypeError,
  IsAnImageError,
  IsAPdfError
};
