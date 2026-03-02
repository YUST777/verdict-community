"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVideoEncoder = void 0;
const media_parser_1 = require("@remotion/media-parser");
const convert_to_correct_videoframe_1 = require("./convert-to-correct-videoframe");
const io_synchronizer_1 = require("./io-manager/io-synchronizer");
const log_1 = require("./log");
const createVideoEncoder = ({ onChunk, onError, controller, config, logLevel, outputCodec, keyframeInterval, }) => {
    if (controller._internals._mediaParserController._internals.signal.aborted) {
        throw new media_parser_1.MediaParserAbortError('Not creating video encoder, already aborted');
    }
    const ioSynchronizer = (0, io_synchronizer_1.makeIoSynchronizer)({
        logLevel,
        label: 'Video encoder',
        controller,
    });
    const encoder = new VideoEncoder({
        error(error) {
            onError(error);
        },
        async output(chunk, metadata) {
            const timestamp = chunk.timestamp + (chunk.duration ?? 0);
            try {
                await onChunk(chunk, metadata ?? null);
            }
            catch (err) {
                onError(err);
            }
            ioSynchronizer.onOutput(timestamp);
        },
    });
    const close = () => {
        controller._internals._mediaParserController._internals.signal.removeEventListener('abort', 
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        onAbort);
        if (encoder.state === 'closed') {
            return;
        }
        encoder.close();
    };
    const onAbort = () => {
        close();
    };
    controller._internals._mediaParserController._internals.signal.addEventListener('abort', onAbort);
    log_1.Log.verbose(logLevel, 'Configuring video encoder', config);
    encoder.configure(config);
    let framesProcessed = 0;
    const encodeFrame = (frame) => {
        if (encoder.state === 'closed') {
            return;
        }
        const keyFrame = framesProcessed % keyframeInterval === 0;
        encoder.encode((0, convert_to_correct_videoframe_1.convertToCorrectVideoFrame)({ videoFrame: frame, outputCodec }), {
            keyFrame,
            // @ts-expect-error
            vp9: {
                quantizer: 36,
            },
        });
        ioSynchronizer.inputItem(frame.timestamp);
        framesProcessed++;
    };
    return {
        encode: (frame) => {
            encodeFrame(frame);
        },
        waitForFinish: async () => {
            await encoder.flush();
            await ioSynchronizer.waitForQueueSize(0);
        },
        close,
        flush: async () => {
            await encoder.flush();
        },
        ioSynchronizer,
    };
};
exports.createVideoEncoder = createVideoEncoder;
