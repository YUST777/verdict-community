"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyToneFrequencyUsingFfmpeg = void 0;
const call_ffmpeg_1 = require("../call-ffmpeg");
const logger_1 = require("../logger");
const sample_rate_1 = require("../sample-rate");
const applyToneFrequencyUsingFfmpeg = async ({ input, output, toneFrequency, indent, logLevel, binariesDirectory, cancelSignal, }) => {
    const filter = `asetrate=${sample_rate_1.DEFAULT_SAMPLE_RATE}*${toneFrequency},aresample=${sample_rate_1.DEFAULT_SAMPLE_RATE},atempo=1/${toneFrequency}`;
    const args = [
        '-hide_banner',
        '-i',
        input,
        ['-ac', '2'],
        '-filter:a',
        filter,
        ['-c:a', 'pcm_s16le'],
        ['-ar', String(sample_rate_1.DEFAULT_SAMPLE_RATE)],
        '-y',
        output,
    ].flat(2);
    logger_1.Log.verbose({ indent, logLevel }, 'Changing tone frequency using FFmpeg:', JSON.stringify(args.join(' ')), 'Filter:', filter);
    const startTimestamp = Date.now();
    const task = (0, call_ffmpeg_1.callFf)({
        bin: 'ffmpeg',
        args,
        indent,
        logLevel,
        binariesDirectory,
        cancelSignal,
    });
    await task;
    logger_1.Log.verbose({ indent, logLevel }, 'Changed tone frequency using FFmpeg', `${Date.now() - startTimestamp}ms`);
};
exports.applyToneFrequencyUsingFfmpeg = applyToneFrequencyUsingFfmpeg;
