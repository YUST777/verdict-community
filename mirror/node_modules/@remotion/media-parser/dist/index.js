"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WEBCODECS_TIMESCALE = exports.VERSION = exports.mediaParserController = exports.defaultSelectM3uStreamFn = exports.defaultSelectM3uAssociatedPlaylists = exports.MediaParserInternals = exports.downloadAndParseMedia = exports.MediaParserAbortError = exports.IsAPdfError = exports.IsAnUnsupportedFileTypeError = exports.IsAnImageError = exports.hasBeenAborted = exports.parseMedia = void 0;
const aac_codecprivate_1 = require("./aac-codecprivate");
const ftyp_1 = require("./containers/iso-base-media/ftyp");
const mvhd_1 = require("./containers/iso-base-media/moov/mvhd");
const samples_1 = require("./containers/iso-base-media/stsd/samples");
const stsd_1 = require("./containers/iso-base-media/stsd/stsd");
const tkhd_1 = require("./containers/iso-base-media/tkhd");
const parse_ebml_1 = require("./containers/webm/parse-ebml");
const all_segments_1 = require("./containers/webm/segments/all-segments");
const internal_parse_media_1 = require("./internal-parse-media");
const buffer_iterator_1 = require("./iterator/buffer-iterator");
const log_1 = require("./log");
const need_samples_for_fields_1 = require("./state/need-samples-for-fields");
const parser_state_1 = require("./state/parser-state");
var parse_media_1 = require("./parse-media");
Object.defineProperty(exports, "parseMedia", { enumerable: true, get: function () { return parse_media_1.parseMedia; } });
var errors_1 = require("./errors");
Object.defineProperty(exports, "hasBeenAborted", { enumerable: true, get: function () { return errors_1.hasBeenAborted; } });
Object.defineProperty(exports, "IsAnImageError", { enumerable: true, get: function () { return errors_1.IsAnImageError; } });
Object.defineProperty(exports, "IsAnUnsupportedFileTypeError", { enumerable: true, get: function () { return errors_1.IsAnUnsupportedFileTypeError; } });
Object.defineProperty(exports, "IsAPdfError", { enumerable: true, get: function () { return errors_1.IsAPdfError; } });
Object.defineProperty(exports, "MediaParserAbortError", { enumerable: true, get: function () { return errors_1.MediaParserAbortError; } });
var download_and_parse_media_1 = require("./download-and-parse-media");
Object.defineProperty(exports, "downloadAndParseMedia", { enumerable: true, get: function () { return download_and_parse_media_1.downloadAndParseMedia; } });
/**
 * @deprecated Dont use these yet.
 */
exports.MediaParserInternals = {
    Log: log_1.Log,
    createAacCodecPrivate: aac_codecprivate_1.createAacCodecPrivate,
    matroskaElements: all_segments_1.matroskaElements,
    ebmlMap: all_segments_1.ebmlMap,
    parseTkhd: tkhd_1.parseTkhd,
    getArrayBufferIterator: buffer_iterator_1.getArrayBufferIterator,
    parseStsd: stsd_1.parseStsd,
    makeParserState: parser_state_1.makeParserState,
    processSample: samples_1.processIsoFormatBox,
    parseFtyp: ftyp_1.parseFtyp,
    parseEbml: parse_ebml_1.parseEbml,
    parseMvhd: mvhd_1.parseMvhd,
    internalParseMedia: internal_parse_media_1.internalParseMedia,
    fieldsNeedSamplesMap: need_samples_for_fields_1.fieldsNeedSamplesMap,
};
var select_stream_1 = require("./containers/m3u/select-stream");
Object.defineProperty(exports, "defaultSelectM3uAssociatedPlaylists", { enumerable: true, get: function () { return select_stream_1.defaultSelectM3uAssociatedPlaylists; } });
Object.defineProperty(exports, "defaultSelectM3uStreamFn", { enumerable: true, get: function () { return select_stream_1.defaultSelectM3uStreamFn; } });
var media_parser_controller_1 = require("./controller/media-parser-controller");
Object.defineProperty(exports, "mediaParserController", { enumerable: true, get: function () { return media_parser_controller_1.mediaParserController; } });
var version_1 = require("./version");
Object.defineProperty(exports, "VERSION", { enumerable: true, get: function () { return version_1.VERSION; } });
var webcodecs_timescale_1 = require("./webcodecs-timescale");
Object.defineProperty(exports, "WEBCODECS_TIMESCALE", { enumerable: true, get: function () { return webcodecs_timescale_1.WEBCODECS_TIMESCALE; } });
