"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAudioEncoder = void 0;
const media_parser_1 = require("@remotion/media-parser");
const io_synchronizer_1 = require("./io-manager/io-synchronizer");
const wav_audio_encoder_1 = require("./wav-audio-encoder");
const createAudioEncoder = ({ onChunk, onError, codec, controller, config: audioEncoderConfig, logLevel, onNewAudioSampleRate, }) => {
    if (controller._internals._mediaParserController._internals.signal.aborted) {
        throw new media_parser_1.MediaParserAbortError('Not creating audio encoder, already aborted');
    }
    const ioSynchronizer = (0, io_synchronizer_1.makeIoSynchronizer)({
        logLevel,
        label: 'Audio encoder',
        controller,
    });
    if (codec === 'wav') {
        return (0, wav_audio_encoder_1.getWaveAudioEncoder)({
            onChunk,
            controller,
            config: audioEncoderConfig,
            ioSynchronizer,
        });
    }
    const encoder = new AudioEncoder({
        output: async (chunk) => {
            try {
                await onChunk(chunk);
            }
            catch (err) {
                onError(err);
            }
            ioSynchronizer.onOutput(chunk.timestamp);
        },
        error(error) {
            onError(error);
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
    if (codec !== 'opus' && codec !== 'aac') {
        throw new Error('Only `codec: "opus"` and `codec: "aac"` is supported currently');
    }
    const wantedSampleRate = audioEncoderConfig.sampleRate;
    const encodeFrame = (audioData) => {
        if (encoder.state === 'closed') {
            return;
        }
        if (encoder.state === 'unconfigured') {
            if (audioData.sampleRate === wantedSampleRate) {
                encoder.configure(audioEncoderConfig);
            }
            else {
                encoder.configure({
                    ...audioEncoderConfig,
                    sampleRate: audioData.sampleRate,
                });
                onNewAudioSampleRate(audioData.sampleRate);
            }
        }
        encoder.encode(audioData);
        ioSynchronizer.inputItem(audioData.timestamp);
    };
    return {
        encode: (audioData) => {
            encodeFrame(audioData);
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
exports.createAudioEncoder = createAudioEncoder;
