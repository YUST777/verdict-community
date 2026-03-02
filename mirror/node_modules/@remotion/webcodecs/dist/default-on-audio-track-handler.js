"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultOnAudioTrackHandler = void 0;
const media_parser_1 = require("@remotion/media-parser");
const can_reencode_audio_track_1 = require("./can-reencode-audio-track");
const DEFAULT_BITRATE = 128000;
const defaultOnAudioTrackHandler = async ({ track, defaultAudioCodec, logLevel, canCopyTrack, }) => {
    const bitrate = DEFAULT_BITRATE;
    if (canCopyTrack) {
        media_parser_1.MediaParserInternals.Log.verbose(logLevel, `Track ${track.trackId} (audio): Can copy track, therefore copying`);
        return Promise.resolve({ type: 'copy' });
    }
    // The idea is that for example for GIFs, we will return defaultAudioCodec = null
    if (defaultAudioCodec === null) {
        media_parser_1.MediaParserInternals.Log.verbose(logLevel, `Track ${track.trackId} (audio): Container does not support audio, dropping audio`);
        return Promise.resolve({ type: 'drop' });
    }
    const canReencode = await (0, can_reencode_audio_track_1.canReencodeAudioTrack)({
        audioCodec: defaultAudioCodec,
        track,
        bitrate,
        sampleRate: null,
    });
    if (canReencode) {
        media_parser_1.MediaParserInternals.Log.verbose(logLevel, `Track ${track.trackId} (audio): Cannot copy, but re-encode, therefore re-encoding`);
        return Promise.resolve({
            type: 'reencode',
            bitrate,
            audioCodec: defaultAudioCodec,
            sampleRate: null,
        });
    }
    media_parser_1.MediaParserInternals.Log.verbose(logLevel, `Track ${track.trackId} (audio): Can neither re-encode nor copy, failing render`);
    return Promise.resolve({ type: 'fail' });
};
exports.defaultOnAudioTrackHandler = defaultOnAudioTrackHandler;
