"use strict";
// https://en.wikipedia.org/wiki/Program-specific_information
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSdt = exports.parsePat = void 0;
const discard_rest_of_packet_1 = require("./discard-rest-of-packet");
const parsePatTable = (iterator, tableId) => {
    iterator.getUint16(); // table ID extension
    iterator.startReadingBits();
    iterator.getBits(7); // reserved
    iterator.getBits(1); // current / next indicator;
    const sectionNumber = iterator.getBits(8);
    const lastSectionNumber = iterator.getBits(8);
    if (tableId !== 0) {
        throw new Error('Invalid table ID: ' + tableId);
    }
    const tables = [];
    for (let i = sectionNumber; i <= lastSectionNumber; i++) {
        const programNumber = iterator.getBits(16); // program number
        iterator.getBits(3); // reserved
        const programMapIdentifier = iterator.getBits(13); // program map PID
        tables.push({
            type: 'transport-stream-program-association-table',
            programNumber,
            programMapIdentifier,
        });
    }
    iterator.stopReadingBits();
    return {
        type: 'transport-stream-pat-box',
        tableId: tableId.toString(16),
        pat: tables,
    };
};
const parsePat = (iterator) => {
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
    const tables = parsePatTable(iterator, tableId);
    (0, discard_rest_of_packet_1.discardRestOfPacket)(iterator);
    return tables;
};
exports.parsePat = parsePat;
const parseSdt = (iterator) => {
    iterator.startReadingBits();
    iterator.getBits(8); // table ID
    iterator.getBits(1); // section syntax indicator
    iterator.getBits(1); // private bit
    iterator.getBits(2); // reserved
    const sectionLength = iterator.getBits(12);
    iterator.stopReadingBits();
    iterator.discard(sectionLength);
    (0, discard_rest_of_packet_1.discardRestOfPacket)(iterator);
    return {
        type: 'transport-stream-sdt-box',
    };
};
exports.parseSdt = parseSdt;
