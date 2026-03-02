"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalExtractFrames = void 0;
const media_parser_1 = require("@remotion/media-parser");
const create_video_decoder_1 = require("./create-video-decoder");
const with_resolvers_1 = require("./create/with-resolvers");
const log_1 = require("./log");
const internalExtractFrames = ({ src, onFrame, signal, timestampsInSeconds, acknowledgeRemotionLicense, logLevel, parseMediaImplementation, }) => {
    const controller = (0, media_parser_1.mediaParserController)();
    const expectedFrames = [];
    const resolvers = (0, with_resolvers_1.withResolvers)();
    const abortListener = () => {
        controller.abort();
        resolvers.reject(new media_parser_1.MediaParserAbortError('Aborted by user'));
    };
    signal?.addEventListener('abort', abortListener, { once: true });
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
            const timestampTargetsUnsorted = typeof timestampsInSeconds === 'function'
                ? await timestampsInSeconds({
                    track,
                    container,
                    durationInSeconds: dur,
                })
                : timestampsInSeconds;
            const timestampTargets = timestampTargetsUnsorted.sort((a, b) => a - b);
            if (timestampTargets.length === 0) {
                throw new Error('expected at least one timestamp to extract but found zero');
            }
            controller.seek(timestampTargets[0]);
            const decoder = await (0, create_video_decoder_1.createVideoDecoder)({
                onFrame: (frame) => {
                    log_1.Log.trace(logLevel, 'Received frame with timestamp', frame.timestamp);
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
                    // A WebM might have a timestamp of 67000 but we request 66666
                    // See a test with this problem in it-tests/rendering/frame-accuracy.test.ts
                    // Solution: We allow a 10.000ms - 3.333ms = 6.667ms difference between the requested timestamp and the actual timestamp
                    if (expectedFrames[0] + 6667 < frame.timestamp &&
                        lastFrame &&
                        lastFrame !== lastFrameEmitted) {
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
                    }
                    catch {
                        // Ignore
                    }
                    resolvers.reject(e);
                },
                track,
            });
            const queued = [];
            const doProcess = async () => {
                expectedFrames.push(timestampTargets.shift() * media_parser_1.WEBCODECS_TIMESCALE);
                while (queued.length > 0) {
                    const sam = queued.shift();
                    if (!sam) {
                        throw new Error('Sample is undefined');
                    }
                    await decoder.waitForQueueToBeLessThan(20);
                    log_1.Log.trace(logLevel, 'Decoding sample', sam.timestamp);
                    await decoder.decode(sam);
                }
            };
            return async (sample) => {
                const nextTimestampWeWant = timestampTargets[0];
                log_1.Log.trace(logLevel, `Received ${sample.type} sample with dts`, sample.decodingTimestamp, 'and cts', sample.timestamp);
                if (sample.type === 'key') {
                    await decoder.flush();
                    queued.length = 0;
                }
                queued.push(sample);
                if (sample.decodingTimestamp >=
                    timestampTargets[timestampTargets.length - 1] * media_parser_1.WEBCODECS_TIMESCALE) {
                    await doProcess();
                    await decoder.flush();
                    controller.abort();
                    return;
                }
                if (nextTimestampWeWant === undefined) {
                    throw new Error('this should not happen');
                }
                if (sample.decodingTimestamp >=
                    nextTimestampWeWant * media_parser_1.WEBCODECS_TIMESCALE) {
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
        },
    })
        .then(() => {
        resolvers.resolve();
    })
        .catch((e) => {
        if (!(0, media_parser_1.hasBeenAborted)(e)) {
            resolvers.reject(e);
        }
        else {
            resolvers.resolve();
        }
    })
        .finally(() => {
        if (lastFrame && lastFrameEmitted !== lastFrame) {
            lastFrame.close();
        }
        signal?.removeEventListener('abort', abortListener);
    });
    return resolvers.promise;
};
exports.internalExtractFrames = internalExtractFrames;
