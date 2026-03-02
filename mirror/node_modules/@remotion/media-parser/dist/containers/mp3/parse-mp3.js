"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMp3 = void 0;
const id3_1 = require("./id3");
const id3_v1_1 = require("./id3-v1");
const parse_mpeg_header_1 = require("./parse-mpeg-header");
const wait_until_syncword_1 = require("./seek/wait-until-syncword");
const parseMp3 = async (state) => {
    const { iterator } = state;
    if (iterator.bytesRemaining() < 3) {
        return null;
    }
    // When coming from a seek, we need to discard until the syncword
    if (state.mediaSection.isCurrentByteInMediaSection(iterator) === 'in-section') {
        (0, wait_until_syncword_1.discardUntilSyncword)({ iterator });
        await (0, parse_mpeg_header_1.parseMpegHeader)({
            state,
        });
        return null;
    }
    const { returnToCheckpoint } = iterator.startCheckpoint();
    const bytes = iterator.getSlice(3);
    returnToCheckpoint();
    // ID3 v1
    if (bytes[0] === 0x54 && bytes[1] === 0x41 && bytes[2] === 0x47) {
        (0, id3_v1_1.parseID3V1)(iterator);
        return null;
    }
    // ID3 v2 or v3
    if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
        (0, id3_1.parseId3)({ state });
        return null;
    }
    if (bytes[0] === 0xff) {
        await (0, parse_mpeg_header_1.parseMpegHeader)({
            state,
        });
        return null;
    }
    throw new Error('Unknown MP3 header ' + JSON.stringify(bytes));
};
exports.parseMp3 = parseMp3;
