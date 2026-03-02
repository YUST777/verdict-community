"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setSeekingHints = void 0;
const seeking_hints_1 = require("./containers/aac/seeking-hints");
const seeking_hints_2 = require("./containers/flac/seeking-hints");
const seeking_hints_3 = require("./containers/iso-base-media/seeking-hints");
const seeking_hints_4 = require("./containers/mp3/seeking-hints");
const seeking_hints_5 = require("./containers/riff/seeking-hints");
const seeking_hints_6 = require("./containers/transport-stream/seeking-hints");
const seeking_hints_7 = require("./containers/wav/seeking-hints");
const seeking_hints_8 = require("./containers/webm/seek/seeking-hints");
const setSeekingHints = ({ hints, state, }) => {
    if (hints.type === 'iso-base-media-seeking-hints') {
        (0, seeking_hints_3.setSeekingHintsForMp4)({ hints, state });
        return;
    }
    if (hints.type === 'wav-seeking-hints') {
        (0, seeking_hints_7.setSeekingHintsForWav)({ hints, state });
        return;
    }
    if (hints.type === 'transport-stream-seeking-hints') {
        (0, seeking_hints_6.setSeekingHintsForTransportStream)({ hints, state });
        return;
    }
    if (hints.type === 'webm-seeking-hints') {
        (0, seeking_hints_8.setSeekingHintsForWebm)({ hints, state });
        return;
    }
    if (hints.type === 'flac-seeking-hints') {
        (0, seeking_hints_2.setSeekingHintsForFlac)({ hints, state });
        return;
    }
    if (hints.type === 'riff-seeking-hints') {
        (0, seeking_hints_5.setSeekingHintsForRiff)({ hints, state });
        return;
    }
    if (hints.type === 'mp3-seeking-hints') {
        (0, seeking_hints_4.setSeekingHintsForMp3)({ hints, state });
        return;
    }
    if (hints.type === 'aac-seeking-hints') {
        (0, seeking_hints_1.setSeekingHintsForAac)();
        return;
    }
    if (hints.type === 'm3u8-seeking-hints') {
        // TODO: Implement
        return;
    }
    throw new Error(`Unknown seeking hints type: ${hints}`);
};
exports.setSeekingHints = setSeekingHints;
