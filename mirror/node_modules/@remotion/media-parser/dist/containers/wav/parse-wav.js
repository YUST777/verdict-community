"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseWav = void 0;
const log_1 = require("../../log");
const parse_data_1 = require("./parse-data");
const parse_fact_1 = require("./parse-fact");
const parse_fmt_1 = require("./parse-fmt");
const parse_header_1 = require("./parse-header");
const parse_id3_1 = require("./parse-id3");
const parse_junk_1 = require("./parse-junk");
const parse_list_1 = require("./parse-list");
const parse_media_section_1 = require("./parse-media-section");
const parseWav = (state) => {
    const { iterator } = state;
    const insideMediaSection = state.mediaSection.isCurrentByteInMediaSection(iterator);
    if (insideMediaSection === 'in-section') {
        return (0, parse_media_section_1.parseMediaSection)({ state });
    }
    const type = iterator.getByteString(4, false).toLowerCase();
    log_1.Log.trace(state.logLevel, `Processing box type ${type}`);
    if (type === 'riff') {
        return (0, parse_header_1.parseHeader)({ state });
    }
    if (type === 'fmt') {
        return (0, parse_fmt_1.parseFmt)({ state });
    }
    if (type === 'data') {
        return (0, parse_data_1.parseData)({ state });
    }
    if (type === 'list') {
        return (0, parse_list_1.parseList)({ state });
    }
    if (type === 'id3') {
        return (0, parse_id3_1.parseId3)({ state });
    }
    if (type === 'junk' || type === 'fllr' || type === 'bext' || type === 'cue') {
        return (0, parse_junk_1.parseJunk)({ state });
    }
    if (type === 'fact') {
        return (0, parse_fact_1.parseFact)({ state });
    }
    if (type === '\u0000') {
        return Promise.resolve(null);
    }
    throw new Error(`Unknown WAV box type ${type}`);
};
exports.parseWav = parseWav;
