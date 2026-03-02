"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWaveAudioEncoder = void 0;
const convert_audiodata_1 = require("./convert-audiodata");
const getWaveAudioEncoder = ({ onChunk, controller, config, ioSynchronizer, }) => {
    return {
        close: () => {
            return Promise.resolve();
        },
        encode: (unconvertedAudioData) => {
            if (controller._internals._mediaParserController._internals.signal.aborted) {
                return Promise.resolve();
            }
            const audioData = (0, convert_audiodata_1.convertAudioData)({
                audioData: unconvertedAudioData,
                newSampleRate: config.sampleRate,
                format: 's16',
            });
            unconvertedAudioData.close();
            const chunk = {
                timestamp: audioData.timestamp,
                duration: audioData.duration,
                type: 'key',
                copyTo: (destination) => audioData.copyTo(destination, { planeIndex: 0 }),
                byteLength: audioData.allocationSize({ planeIndex: 0 }),
            };
            return onChunk(chunk);
        },
        flush: () => Promise.resolve(),
        waitForFinish: () => Promise.resolve(),
        ioSynchronizer,
    };
};
exports.getWaveAudioEncoder = getWaveAudioEncoder;
