"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMediaSection = void 0;
const get_tracks_1 = require("../../get-tracks");
const get_tracks_from_avi_1 = require("./get-tracks-from-avi");
const parse_movi_1 = require("./parse-movi");
const parseMediaSection = async (state) => {
    await (0, parse_movi_1.parseMovi)({
        state,
    });
    const tracks = (0, get_tracks_1.getTracks)(state, false);
    if (!tracks.some((t) => t.type === 'video' && t.codec === get_tracks_from_avi_1.TO_BE_OVERRIDDEN_LATER) &&
        !state.callbacks.tracks.getIsDone()) {
        state.callbacks.tracks.setIsDone(state.logLevel);
    }
};
exports.parseMediaSection = parseMediaSection;
