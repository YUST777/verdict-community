"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVideoDecoder = exports.internalCreateVideoDecoder = void 0;
const flush_pending_1 = require("./flush-pending");
const io_synchronizer_1 = require("./io-manager/io-synchronizer");
const undecodable_error_1 = require("./undecodable-error");
const internalCreateVideoDecoder = async ({ onFrame, onError, controller, config, logLevel, }) => {
    if (controller &&
        controller._internals._mediaParserController._internals.signal.aborted) {
        throw new Error('Not creating audio decoder, already aborted');
    }
    const ioSynchronizer = (0, io_synchronizer_1.makeIoSynchronizer)({
        logLevel,
        label: 'Video decoder',
        controller,
    });
    let mostRecentSampleReceived = null;
    const videoDecoder = new VideoDecoder({
        async output(frame) {
            try {
                await onFrame(frame);
            }
            catch (err) {
                onError(err);
                frame.close();
            }
            ioSynchronizer.onOutput(frame.timestamp);
        },
        error(error) {
            onError(error);
        },
    });
    const close = () => {
        if (controller) {
            controller._internals._mediaParserController._internals.signal.removeEventListener('abort', 
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            onAbort);
        }
        if (videoDecoder.state === 'closed') {
            return;
        }
        videoDecoder.close();
    };
    const onAbort = () => {
        close();
    };
    if (controller) {
        controller._internals._mediaParserController._internals.signal.addEventListener('abort', onAbort);
    }
    const isConfigSupported = await VideoDecoder.isConfigSupported(config);
    if (!isConfigSupported) {
        throw new undecodable_error_1.VideoUndecodableError({
            message: 'Video cannot be decoded by this browser',
            config,
        });
    }
    videoDecoder.configure(config);
    const decode = async (sample) => {
        if (videoDecoder.state === 'closed') {
            return;
        }
        try {
            await controller?._internals._mediaParserController._internals.checkForAbortAndPause();
        }
        catch (err) {
            onError(err);
            return;
        }
        mostRecentSampleReceived = sample.timestamp;
        const encodedChunk = sample instanceof EncodedVideoChunk
            ? sample
            : new EncodedVideoChunk(sample);
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
                throw new Error('Flush already pending');
            }
            const pendingFlush = (0, flush_pending_1.makeFlushPending)();
            flushPending = pendingFlush;
            Promise.resolve()
                .then(() => {
                return videoDecoder.flush();
            })
                .catch(() => {
                // Firefox might throw "Needs to be configured first"
            })
                .finally(() => {
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
                wasReset: () => lastReset !== null && lastReset > initTime,
            };
        },
        getMostRecentSampleInput() {
            return mostRecentSampleReceived;
        },
    };
};
exports.internalCreateVideoDecoder = internalCreateVideoDecoder;
const createVideoDecoder = ({ onFrame, onError, controller, track, logLevel, }) => {
    return (0, exports.internalCreateVideoDecoder)({
        onFrame,
        onError,
        controller: controller ?? null,
        config: track,
        logLevel: logLevel ?? 'info',
    });
};
exports.createVideoDecoder = createVideoDecoder;
