// src/extract-frames-on-web-worker.ts
import { parseMediaOnWebWorker } from "@remotion/media-parser/worker";

// src/internal-extract-frames.ts
import {
  MediaParserAbortError,
  WEBCODECS_TIMESCALE,
  hasBeenAborted,
  mediaParserController
} from "@remotion/media-parser";

// src/create/with-resolvers.ts
var withResolvers = function() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};
var withResolversAndWaitForReturn = () => {
  const { promise, reject, resolve } = withResolvers();
  const { promise: returnPromise, resolve: resolveReturn } = withResolvers();
  return {
    getPromiseToImmediatelyReturn: () => {
      resolveReturn(undefined);
      return promise;
    },
    reject: (reason) => {
      returnPromise.then(() => reject(reason));
    },
    resolve
  };
};

// src/flush-pending.ts
var makeFlushPending = () => {
  const { promise, resolve, reject } = withResolvers();
  return {
    promise,
    resolve,
    reject
  };
};

// src/create/event-emitter.ts
class IoEventEmitter {
  listeners = {
    input: [],
    output: [],
    processed: [],
    progress: []
  };
  addEventListener(name, callback) {
    this.listeners[name].push(callback);
  }
  removeEventListener(name, callback) {
    this.listeners[name] = this.listeners[name].filter((l) => l !== callback);
  }
  dispatchEvent(dispatchName, context) {
    this.listeners[dispatchName].forEach((callback) => {
      callback({ detail: context });
    });
  }
}

// src/log.ts
import { MediaParserInternals } from "@remotion/media-parser";
var { Log } = MediaParserInternals;

// src/io-manager/make-timeout-promise.ts
var makeTimeoutPromise = ({
  label,
  ms,
  controller
}) => {
  const { promise, reject, resolve } = withResolvers();
  let timeout = null;
  const set = () => {
    timeout = setTimeout(() => {
      reject(new Error(`${label()} (timed out after ${ms}ms)`));
    }, ms);
  };
  set();
  const onPause = () => {
    if (timeout) {
      clearTimeout(timeout);
    }
  };
  const onResume = () => {
    set();
  };
  if (controller) {
    controller.addEventListener("pause", onPause);
    controller.addEventListener("resume", onResume);
  }
  return {
    timeoutPromise: promise,
    clear: () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      resolve();
      if (controller) {
        controller.removeEventListener("pause", onPause);
        controller.removeEventListener("resume", onResume);
      }
    }
  };
};

// src/io-manager/io-synchronizer.ts
var makeIoSynchronizer = ({
  logLevel,
  label,
  controller
}) => {
  const eventEmitter = new IoEventEmitter;
  let lastInput = 0;
  let lastOutput = 0;
  let inputsSinceLastOutput = 0;
  let inputs = [];
  let resolvers = [];
  const getQueuedItems = () => {
    inputs = inputs.filter((input) => Math.floor(input) > Math.floor(lastOutput) + 1);
    return inputs.length;
  };
  const printState = (prefix) => {
    Log.trace(logLevel, `[${label}] ${prefix}, state: Last input = ${lastInput} Last output = ${lastOutput} Inputs since last output = ${inputsSinceLastOutput}, Queue = ${getQueuedItems()}`);
  };
  const inputItem = (timestamp) => {
    lastInput = timestamp;
    inputsSinceLastOutput++;
    inputs.push(timestamp);
    eventEmitter.dispatchEvent("input", {
      timestamp
    });
    printState("Input item");
  };
  const onOutput = (timestamp) => {
    lastOutput = timestamp;
    inputsSinceLastOutput = 0;
    eventEmitter.dispatchEvent("output", {
      timestamp
    });
    printState("Got output");
  };
  const waitForOutput = () => {
    const { promise, resolve } = withResolvers();
    const on = () => {
      eventEmitter.removeEventListener("output", on);
      resolve();
      resolvers = resolvers.filter((resolver) => resolver !== resolve);
    };
    eventEmitter.addEventListener("output", on);
    resolvers.push(resolve);
    return promise;
  };
  const makeErrorBanner = () => {
    return [
      `Waited too long for ${label} to finish:`,
      `${getQueuedItems()} queued items`,
      `inputs: ${JSON.stringify(inputs)}`,
      `last output: ${lastOutput}`
    ];
  };
  const waitForQueueSize = async (queueSize) => {
    if (getQueuedItems() <= queueSize) {
      return Promise.resolve();
    }
    const { timeoutPromise, clear } = makeTimeoutPromise({
      label: () => [
        ...makeErrorBanner(),
        `wanted: <${queueSize} queued items`,
        `Report this at https://remotion.dev/report`
      ].join(`
`),
      ms: 1e4,
      controller
    });
    if (controller) {
      controller._internals._mediaParserController._internals.signal.addEventListener("abort", clear);
    }
    await Promise.race([
      timeoutPromise,
      (async () => {
        while (getQueuedItems() > queueSize) {
          await waitForOutput();
        }
      })()
    ]).finally(() => clear());
    if (controller) {
      controller._internals._mediaParserController._internals.signal.removeEventListener("abort", clear);
    }
  };
  const clearQueue = () => {
    inputs.length = 0;
    lastInput = 0;
    lastOutput = 0;
    inputsSinceLastOutput = 0;
    resolvers.forEach((resolver) => {
      return resolver();
    });
    resolvers.length = 0;
    inputs.length = 0;
  };
  return {
    inputItem,
    onOutput,
    waitForQueueSize,
    clearQueue
  };
};

// src/undecodable-error.ts
class VideoUndecodableError extends Error {
  config;
  constructor({
    message,
    config
  }) {
    super(message);
    this.name = "VideoUndecodableError";
    this.config = config;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, VideoUndecodableError);
    }
  }
}

class AudioUndecodableError extends Error {
  config;
  constructor({
    message,
    config
  }) {
    super(message);
    this.name = "AudioUndecodableError";
    this.config = config;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AudioUndecodableError);
    }
  }
}

// src/create-video-decoder.ts
var internalCreateVideoDecoder = async ({
  onFrame,
  onError,
  controller,
  config,
  logLevel
}) => {
  if (controller && controller._internals._mediaParserController._internals.signal.aborted) {
    throw new Error("Not creating audio decoder, already aborted");
  }
  const ioSynchronizer = makeIoSynchronizer({
    logLevel,
    label: "Video decoder",
    controller
  });
  let mostRecentSampleReceived = null;
  const videoDecoder = new VideoDecoder({
    async output(frame) {
      try {
        await onFrame(frame);
      } catch (err) {
        onError(err);
        frame.close();
      }
      ioSynchronizer.onOutput(frame.timestamp);
    },
    error(error) {
      onError(error);
    }
  });
  const close = () => {
    if (controller) {
      controller._internals._mediaParserController._internals.signal.removeEventListener("abort", onAbort);
    }
    if (videoDecoder.state === "closed") {
      return;
    }
    videoDecoder.close();
  };
  const onAbort = () => {
    close();
  };
  if (controller) {
    controller._internals._mediaParserController._internals.signal.addEventListener("abort", onAbort);
  }
  const isConfigSupported = await VideoDecoder.isConfigSupported(config);
  if (!isConfigSupported) {
    throw new VideoUndecodableError({
      message: "Video cannot be decoded by this browser",
      config
    });
  }
  videoDecoder.configure(config);
  const decode = async (sample) => {
    if (videoDecoder.state === "closed") {
      return;
    }
    try {
      await controller?._internals._mediaParserController._internals.checkForAbortAndPause();
    } catch (err) {
      onError(err);
      return;
    }
    mostRecentSampleReceived = sample.timestamp;
    const encodedChunk = sample instanceof EncodedVideoChunk ? sample : new EncodedVideoChunk(sample);
    videoDecoder.decode(encodedChunk);
    ioSynchronizer.inputItem(sample.timestamp);
  };
  let flushPending = null;
  let lastReset = null;
  return {
    decode,
    close,
    flush: () => {
      if (flushPending) {
        throw new Error("Flush already pending");
      }
      const pendingFlush = makeFlushPending();
      flushPending = pendingFlush;
      Promise.resolve().then(() => {
        return videoDecoder.flush();
      }).catch(() => {}).finally(() => {
        pendingFlush.resolve();
        flushPending = null;
      });
      return pendingFlush.promise;
    },
    waitForQueueToBeLessThan: ioSynchronizer.waitForQueueSize,
    reset: () => {
      lastReset = Date.now();
      flushPending?.resolve();
      ioSynchronizer.clearQueue();
      videoDecoder.reset();
      videoDecoder.configure(config);
    },
    checkReset: () => {
      const initTime = Date.now();
      return {
        wasReset: () => lastReset !== null && lastReset > initTime
      };
    },
    getMostRecentSampleInput() {
      return mostRecentSampleReceived;
    }
  };
};
var createVideoDecoder = ({
  onFrame,
  onError,
  controller,
  track,
  logLevel
}) => {
  return internalCreateVideoDecoder({
    onFrame,
    onError,
    controller: controller ?? null,
    config: track,
    logLevel: logLevel ?? "info"
  });
};

// src/internal-extract-frames.ts
var internalExtractFrames = ({
  src,
  onFrame,
  signal,
  timestampsInSeconds,
  acknowledgeRemotionLicense,
  logLevel,
  parseMediaImplementation
}) => {
  const controller = mediaParserController();
  const expectedFrames = [];
  const resolvers = withResolvers();
  const abortListener = () => {
    controller.abort();
    resolvers.reject(new MediaParserAbortError("Aborted by user"));
  };
  signal?.addEventListener("abort", abortListener, { once: true });
  let dur = null;
  let lastFrame;
  let lastFrameEmitted;
  parseMediaImplementation({
    src: new URL(src, window.location.href),
    acknowledgeRemotionLicense,
    controller,
    logLevel,
    onDurationInSeconds(durationInSeconds) {
      dur = durationInSeconds;
    },
    onVideoTrack: async ({ track, container }) => {
      const timestampTargetsUnsorted = typeof timestampsInSeconds === "function" ? await timestampsInSeconds({
        track,
        container,
        durationInSeconds: dur
      }) : timestampsInSeconds;
      const timestampTargets = timestampTargetsUnsorted.sort((a, b) => a - b);
      if (timestampTargets.length === 0) {
        throw new Error("expected at least one timestamp to extract but found zero");
      }
      controller.seek(timestampTargets[0]);
      const decoder = await createVideoDecoder({
        onFrame: (frame) => {
          Log.trace(logLevel, "Received frame with timestamp", frame.timestamp);
          if (expectedFrames.length === 0) {
            frame.close();
            return;
          }
          if (frame.timestamp < expectedFrames[0] - 1) {
            if (lastFrame) {
              lastFrame.close();
            }
            lastFrame = frame;
            return;
          }
          if (expectedFrames[0] + 6667 < frame.timestamp && lastFrame && lastFrame !== lastFrameEmitted) {
            onFrame(lastFrame);
            lastFrameEmitted = lastFrame;
            expectedFrames.shift();
            lastFrame = frame;
            return;
          }
          expectedFrames.shift();
          onFrame(frame);
          if (lastFrame && lastFrame !== lastFrameEmitted) {
            lastFrame.close();
          }
          lastFrameEmitted = frame;
          lastFrame = frame;
        },
        onError: (e) => {
          controller.abort();
          try {
            decoder.close();
          } catch {}
          resolvers.reject(e);
        },
        track
      });
      const queued = [];
      const doProcess = async () => {
        expectedFrames.push(timestampTargets.shift() * WEBCODECS_TIMESCALE);
        while (queued.length > 0) {
          const sam = queued.shift();
          if (!sam) {
            throw new Error("Sample is undefined");
          }
          await decoder.waitForQueueToBeLessThan(20);
          Log.trace(logLevel, "Decoding sample", sam.timestamp);
          await decoder.decode(sam);
        }
      };
      return async (sample) => {
        const nextTimestampWeWant = timestampTargets[0];
        Log.trace(logLevel, `Received ${sample.type} sample with dts`, sample.decodingTimestamp, "and cts", sample.timestamp);
        if (sample.type === "key") {
          await decoder.flush();
          queued.length = 0;
        }
        queued.push(sample);
        if (sample.decodingTimestamp >= timestampTargets[timestampTargets.length - 1] * WEBCODECS_TIMESCALE) {
          await doProcess();
          await decoder.flush();
          controller.abort();
          return;
        }
        if (nextTimestampWeWant === undefined) {
          throw new Error("this should not happen");
        }
        if (sample.decodingTimestamp >= nextTimestampWeWant * WEBCODECS_TIMESCALE) {
          await doProcess();
          if (timestampTargets.length === 0) {
            await decoder.flush();
            controller.abort();
          }
        }
        return async () => {
          await doProcess();
          await decoder.flush();
          if (lastFrame && lastFrameEmitted !== lastFrame) {
            lastFrame.close();
          }
        };
      };
    }
  }).then(() => {
    resolvers.resolve();
  }).catch((e) => {
    if (!hasBeenAborted(e)) {
      resolvers.reject(e);
    } else {
      resolvers.resolve();
    }
  }).finally(() => {
    if (lastFrame && lastFrameEmitted !== lastFrame) {
      lastFrame.close();
    }
    signal?.removeEventListener("abort", abortListener);
  });
  return resolvers.promise;
};

// src/extract-frames-on-web-worker.ts
var extractFramesOnWebWorker = (options) => {
  return internalExtractFrames({
    ...options,
    signal: options.signal ?? null,
    acknowledgeRemotionLicense: options.acknowledgeRemotionLicense ?? false,
    logLevel: options.logLevel ?? "info",
    parseMediaImplementation: parseMediaOnWebWorker
  });
};
export {
  extractFramesOnWebWorker
};
