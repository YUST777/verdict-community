"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultOnVideoTrackHandler = void 0;
const media_parser_1 = require("@remotion/media-parser");
const can_reencode_video_track_1 = require("./can-reencode-video-track");
const defaultOnVideoTrackHandler = async ({ track, defaultVideoCodec, logLevel, rotate, canCopyTrack, resizeOperation, }) => {
    if (canCopyTrack) {
        media_parser_1.MediaParserInternals.Log.verbose(logLevel, `Track ${track.trackId} (video): Can copy, therefore copying`);
        return Promise.resolve({ type: 'copy' });
    }
    if (defaultVideoCodec === null) {
        media_parser_1.MediaParserInternals.Log.verbose(logLevel, `Track ${track.trackId} (video): Is audio container, therefore dropping video`);
        return Promise.resolve({ type: 'drop' });
    }
    const canReencode = await (0, can_reencode_video_track_1.canReencodeVideoTrack)({
        videoCodec: defaultVideoCodec,
        track,
        resizeOperation,
        rotate,
    });
    if (canReencode) {
        media_parser_1.MediaParserInternals.Log.verbose(logLevel, `Track ${track.trackId} (video): Cannot copy, but re-enconde, therefore re-encoding`);
        return Promise.resolve({
            type: 'reencode',
            videoCodec: defaultVideoCodec,
            // By default, will remove rotation when re-encoding
            rotate: undefined,
            resize: resizeOperation,
        });
    }
    media_parser_1.MediaParserInternals.Log.verbose(logLevel, `Track ${track.trackId} (video): Can neither copy nor re-encode, therefore failing`);
    return Promise.resolve({ type: 'fail' });
};
exports.defaultOnVideoTrackHandler = defaultOnVideoTrackHandler;
