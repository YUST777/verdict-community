"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFfmpegArgs = void 0;
const crf_1 = require("./crf");
const get_codec_name_1 = require("./get-codec-name");
const logger_1 = require("./logger");
const color_space_1 = require("./options/color-space");
const truthy_1 = require("./truthy");
const firstEncodingStepOnly = ({ hasPreencoded, proResProfileName, pixelFormat, x264Preset, codec, crf, videoBitrate, encodingMaxRate, encodingBufferSize, hardwareAcceleration, }) => {
    if (hasPreencoded || codec === 'gif') {
        return [];
    }
    return [
        proResProfileName ? ['-profile:v', proResProfileName] : null,
        ['-pix_fmt', pixelFormat],
        // Without explicitly disabling auto-alt-ref,
        // transparent WebM generation doesn't work
        pixelFormat === 'yuva420p' ? ['-auto-alt-ref', '0'] : null,
        x264Preset ? ['-preset', x264Preset] : null,
        // Apply a fixed a timescale across all environments:
        // https://discord.com/channels/809501355504959528/817306238811111454/1437471619089170613
        ['-video_track_timescale', '90000'],
        (0, crf_1.validateQualitySettings)({
            crf,
            videoBitrate,
            codec,
            encodingMaxRate,
            encodingBufferSize,
            hardwareAcceleration,
        }),
    ].filter(truthy_1.truthy);
};
const generateFfmpegArgs = ({ hasPreencoded, proResProfileName, pixelFormat, x264Preset, codec, crf, videoBitrate, encodingMaxRate, encodingBufferSize, colorSpace, hardwareAcceleration, indent, logLevel, }) => {
    const encoderSettings = (0, get_codec_name_1.getCodecName)({
        codec,
        encodingMaxRate,
        encodingBufferSize,
        crf,
        hardwareAcceleration,
        indent,
        logLevel,
    });
    if (encoderSettings === null) {
        throw new TypeError(`encoderSettings is null: ${JSON.stringify(codec)} (hwaccel = ${hardwareAcceleration})`);
    }
    const { encoderName, hardwareAccelerated } = encoderSettings;
    if (!hardwareAccelerated && hardwareAcceleration === 'required') {
        throw new Error(`Codec ${codec} does not support hardware acceleration on ${process.platform}, but "hardwareAcceleration" is set to "required"`);
    }
    logger_1.Log.verbose({ indent, logLevel, tag: 'stitchFramesToVideo()' }, `Encoder: ${encoderName}, hardware accelerated: ${hardwareAccelerated}`);
    const resolvedColorSpace = codec === 'gif' ? 'bt601' : (colorSpace !== null && colorSpace !== void 0 ? colorSpace : color_space_1.DEFAULT_COLOR_SPACE);
    const colorSpaceOptions = resolvedColorSpace === 'bt709'
        ? [
            ['-colorspace:v', 'bt709'],
            ['-color_primaries:v', 'bt709'],
            ['-color_trc:v', 'bt709'],
            ['-color_range', 'tv'],
            hasPreencoded
                ? []
                : // https://www.canva.dev/blog/engineering/a-journey-through-colour-space-with-ffmpeg/
                    // "Color range" section
                    ['-vf', 'zscale=matrix=709:matrixin=709:range=limited'],
        ]
        : resolvedColorSpace === 'bt2020-ncl'
            ? [
                ['-colorspace:v', 'bt2020nc'],
                ['-color_primaries:v', 'bt2020'],
                ['-color_trc:v', 'arib-std-b67'],
                ['-color_range', 'tv'],
                hasPreencoded
                    ? []
                    : [
                        '-vf',
                        // ChatGPT: Therefore, just like BT.709, BT.2020 also uses the limited range where the digital code value for black is at 16,16,16 and not 0,0,0 in an 8-bit video system.
                        'zscale=matrix=2020_ncl:matrixin=2020_ncl:range=limited',
                    ],
            ]
            : [];
    return [
        ['-c:v', hasPreencoded ? 'copy' : encoderName],
        codec === 'h264-ts' ? ['-f', 'mpegts'] : null,
        // -c:v is the same as -vcodec as -codec:video
        // and specified the video codec.
        ...colorSpaceOptions,
        ...firstEncodingStepOnly({
            codec,
            crf,
            hasPreencoded,
            pixelFormat,
            proResProfileName,
            videoBitrate,
            encodingMaxRate,
            encodingBufferSize,
            x264Preset,
            hardwareAcceleration,
        }),
    ].filter(truthy_1.truthy);
};
exports.generateFfmpegArgs = generateFfmpegArgs;
