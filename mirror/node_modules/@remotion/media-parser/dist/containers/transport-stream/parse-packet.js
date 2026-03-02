"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePacket = void 0;
const parse_pat_1 = require("./parse-pat");
const parse_pes_1 = require("./parse-pes");
const parse_pmt_1 = require("./parse-pmt");
const parse_stream_packet_1 = require("./parse-stream-packet");
const traversal_1 = require("./traversal");
const parsePacket = ({ iterator, structure, transportStream, }) => {
    const offset = iterator.counter.getOffset();
    const syncByte = iterator.getUint8();
    if (syncByte !== 0x47) {
        throw new Error('Invalid sync byte');
    }
    iterator.startReadingBits();
    iterator.getBits(1); // transport error indicator
    const payloadUnitStartIndicator = iterator.getBits(1);
    iterator.getBits(1); // transport priority
    const programId = iterator.getBits(13);
    iterator.getBits(2); // transport scrambling control
    const adaptationFieldControl1 = iterator.getBits(1); // adaptation field control 1
    iterator.getBits(1); // adaptation field control 2
    iterator.getBits(4); // continuity counter
    iterator.stopReadingBits();
    if (adaptationFieldControl1 === 1) {
        iterator.startReadingBits();
        const adaptationFieldLength = iterator.getBits(8);
        const headerOffset = iterator.counter.getOffset();
        if (adaptationFieldLength > 0) {
            iterator.getBits(1); // discontinuity indicator
            iterator.getBits(1); // random access indicator
            iterator.getBits(1); // elementary stream priority indicator
            iterator.getBits(1); // PCR flag
            iterator.getBits(1); // OPCR flag
            iterator.getBits(1); // splicing point flag
            iterator.getBits(1); // transport private data flag
            iterator.getBits(1); // adaptation field extension flag
        }
        const remaining = adaptationFieldLength - (iterator.counter.getOffset() - headerOffset);
        iterator.stopReadingBits();
        const toDiscard = Math.max(0, remaining);
        iterator.discard(toDiscard);
    }
    const read = iterator.counter.getOffset() - offset;
    if (read === 188) {
        return null;
    }
    const pat = structure.boxes.find((b) => b.type === 'transport-stream-pmt-box');
    const isPes = payloadUnitStartIndicator && (pat === null || pat === void 0 ? void 0 : pat.streams.find((e) => e.pid === programId));
    if (isPes) {
        const packetPes = (0, parse_pes_1.parsePes)({ iterator, offset });
        transportStream.nextPesHeaderStore.setNextPesHeader(packetPes);
        transportStream.observedPesHeaders.addPesHeader(packetPes);
    }
    else if (payloadUnitStartIndicator === 1) {
        iterator.getUint8(); // pointerField
    }
    if (programId === 0) {
        return (0, parse_pat_1.parsePat)(iterator);
    }
    if (programId === 17) {
        return (0, parse_pat_1.parseSdt)(iterator);
    }
    // PID 17 is SDT
    // https://de.wikipedia.org/wiki/MPEG-Transportstrom
    // Die Service Description Table nennt den Programmnamen (z. B. „ZDF“) und gibt weitere Informationen der einzelnen Programme (Services); sie wird auf PID 17 übertragen.
    const program = programId === 17 ? null : (0, traversal_1.getProgramForId)(structure, programId);
    if (program) {
        const pmt = (0, parse_pmt_1.parsePmt)(iterator);
        return pmt;
    }
    const transportStreamEntry = (0, traversal_1.getStreamForId)(structure, programId);
    if (transportStreamEntry) {
        (0, parse_stream_packet_1.parseStream)({
            transportStreamEntry,
            iterator,
            transportStream,
            programId,
        });
        return null;
    }
    throw new Error('Unknown packet identifier');
};
exports.parsePacket = parsePacket;
