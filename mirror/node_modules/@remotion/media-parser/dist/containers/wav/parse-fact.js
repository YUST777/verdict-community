"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFact = void 0;
const parseFact = ({ state, }) => {
    const { iterator } = state;
    const size = iterator.getUint32Le();
    if (size !== 4) {
        throw new Error(`Expected size 4 for fact box, got ${size}`);
    }
    const numberOfSamplesPerChannel = iterator.getUint32Le();
    const factBox = {
        type: 'wav-fact',
        numberOfSamplesPerChannel,
    };
    state.structure.getWavStructure().boxes.push(factBox);
    return Promise.resolve(null);
};
exports.parseFact = parseFact;
