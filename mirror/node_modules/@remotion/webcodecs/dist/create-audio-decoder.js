"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAudioDecoder = exports.internalCreateAudioDecoder = void 0;
const flush_pending_1 = require("./flush-pending");
const get_wave_audio_decoder_1 = require("./get-wave-audio-decoder");
const io_synchronizer_1 = require("./io-manager/io-synchronizer");
const undecodable_error_1 = require("./undecodable-error");
const internalCreateAudioDecoder = async ({ onFrame, onError, controller, config, logLevel, }) => {
    if (controller &&
        controller._internals._mediaParserController._internals.signal.aborted) {
        throw new Error('Not creating audio decoder, already aborted');
    }
    const ioSynchronizer = (0, io_synchronizer_1.makeIoSynchronizer)({
        logLevel,
        label: 'Audio decoder',
        controller,
    });
    let mostRecentSampleReceived = null;
    if (config.codec === 'pcm-s16') {
        return (0, get_wave_audio_decoder_1.getWaveAudioDecoder)({
            onFrame,
            config,
            sampleFormat: 's16',
            logLevel,
            ioSynchronizer,
            onError,
        });
    }
    if (config.codec === 'pcm-s24') {
        return (0, get_wave_audio_decoder_1.getWaveAudioDecoder)({
            onFrame,
            config,
            sampleFormat: 's24',
            logLevel,
            ioSynchronizer,
            onError,
        });
    }
    const audioDecoder = new AudioDecoder({
        async output(frame) {
            try {
                await onFrame(frame);
            }
            catch (err) {
                frame.close();
                onError(err);
            }
            ioSynchronizer.onOutput(frame.timestamp + (frame.duration ?? 0));
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
        if (audioDecoder.state === 'closed') {
            return;
        }
        audioDecoder.close();
    };
    const onAbort = () => {
        close();
    };
    if (controller) {
        controller._internals._mediaParserController._internals.signal.addEventListener('abort', onAbort);
    }
    const isConfigSupported = await AudioDecoder.isConfigSupported(config);
    if (!isConfigSupported) {
        throw new undecodable_error_1.AudioUndecodableError({
            message: 'Audio cannot be decoded by this browser',
            config,
        });
    }
    audioDecoder.configure(config);
    const decode = async (audioSample) => {
        if (audioDecoder.state === 'closed') {
            return;
        }
        try {
            await controller?._internals._mediaParserController._internals.checkForAbortAndPause();
        }
        catch (err) {
            onError(err);
            return;
        }
        mostRecentSampleReceived = audioSample.timestamp;
        // Don't flush, it messes up the audio
        const chunk = audioSample instanceof EncodedAudioChunk
            ? audioSample
            : new EncodedAudioChunk(audioSample);
        audioDecoder.decode(chunk);
        // https://test-streams.mux.dev/x36xhzz/url_0/url_525/193039199_mp4_h264_aac_hd_7.ts
        // has a 16 byte audio sample at the end which chrome does not decode
        // Might be empty audio
        // For now only reporting chunks that are bigger than that
        // 16 was chosen arbitrarily, can be improved
        if (chunk.byteLength > 16) {
            ioSynchronizer.inputItem(chunk.timestamp);
        }
    };
    let flushPending = null;
    const lastReset = null;
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
                return audioDecoder.flush();
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
            audioDecoder.reset();
            audioDecoder.configure(config);
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
exports.internalCreateAudioDecoder = internalCreateAudioDecoder;
const createAudioDecoder = ({ track, onFrame, onError, controller, logLevel, }) => {
    return (0, exports.internalCreateAudioDecoder)({
        onFrame,
        onError,
        controller: controller ?? null,
        config: track,
        logLevel: logLevel ?? 'error',
    });
};
exports.createAudioDecoder = createAudioDecoder;
