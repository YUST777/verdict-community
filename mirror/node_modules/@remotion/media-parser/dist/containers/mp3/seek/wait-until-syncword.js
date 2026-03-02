"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.discardUntilSyncword = void 0;
const parse_packet_header_1 = require("../parse-packet-header");
const discardUntilSyncword = ({ iterator, }) => {
    while (true) {
        const next2Bytes = iterator.getUint8();
        if (next2Bytes !== 0xff) {
            continue;
        }
        if (iterator.bytesRemaining() === 0) {
            break;
        }
        const nextByte = iterator.getUint8();
        const mask = 0xe0; // 1110 0000
        if ((nextByte & mask) !== mask) {
            continue;
        }
        iterator.counter.decrement(2);
        if ((0, parse_packet_header_1.isMp3PacketHeaderHereAndInNext)(iterator)) {
            break;
        }
        else {
            iterator.counter.increment(2);
        }
    }
};
exports.discardUntilSyncword = discardUntilSyncword;
