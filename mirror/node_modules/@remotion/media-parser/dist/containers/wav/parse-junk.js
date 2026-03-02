"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseJunk = void 0;
const log_1 = require("../../log");
const parseJunk = ({ state, }) => {
    const { iterator } = state;
    const ckSize = iterator.getUint32Le(); // chunkSize
    log_1.Log.trace(state.logLevel, `Skipping JUNK chunk of size ${ckSize}`);
    iterator.discard(ckSize);
    return Promise.resolve(null);
};
exports.parseJunk = parseJunk;
