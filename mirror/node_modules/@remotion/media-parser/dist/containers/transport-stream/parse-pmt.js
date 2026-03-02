"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePmt = void 0;
const discard_rest_of_packet_1 = require("./discard-rest-of-packet");
const parsePmtTable = ({ iterator, tableId, sectionLength, }) => {
    const start = iterator.counter.getOffset();
    iterator.getUint16(); // table ID extension
    iterator.startReadingBits();
    iterator.getBits(7); // reserved
    iterator.getBits(1); // current / next indicator;
    const sectionNumber = iterator.getBits(8);
    const lastSectionNumber = iterator.getBits(8);
    const tables = [];
    iterator.getBits(3); // reserved
    iterator.getBits(13); // PCR PID
    iterator.getBits(4); // reserved
    const programInfoLength = iterator.getBits(12);
    iterator.getBits(programInfoLength * 8); // program descriptor
    for (let i = sectionNumber; i <= lastSectionNumber; i++) {
        const streams = [];
        while (true) {
            const streamType = iterator.getBits(8);
            iterator.getBits(3); // reserved
            const elementaryPid = iterator.getBits(13);
            iterator.getBits(4); // reserved
            const esInfoLength = iterator.getBits(12);
            iterator.getBits(esInfoLength * 8);
            streams.push({ streamType, pid: elementaryPid });
            const remaining = sectionLength - (iterator.counter.getOffset() - start);
            if (remaining <= 4) {
                break;
            }
        }
        tables.push({
            type: 'transport-stream-program-map-table',
            streams,
        });
    }
    if (tables.length !== 1) {
        throw new Error('Does not PMT table with more than 1 entry, uncommon');
    }
    iterator.stopReadingBits();
    return {
        type: 'transport-stream-pmt-box',
        tableId,
        streams: tables[0].streams,
    };
};
const parsePmt = (iterator) => {
    iterator.startReadingBits();
    const tableId = iterator.getBits(8);
    iterator.getBits(1); // syntax indicator
    iterator.getBits(1); // private bit
    iterator.getBits(4);
    const sectionLength = iterator.getBits(10);
    if (sectionLength > 1021) {
        throw new Error('Invalid section length');
    }
    iterator.stopReadingBits();
    const tables = parsePmtTable({ iterator, tableId, sectionLength });
    (0, discard_rest_of_packet_1.discardRestOfPacket)(iterator);
    return tables;
};
exports.parsePmt = parsePmt;
