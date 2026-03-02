"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeNextPesHeaderStore = void 0;
const makeNextPesHeaderStore = () => {
    let nextPesHeader = null;
    return {
        setNextPesHeader: (pesHeader) => {
            nextPesHeader = pesHeader;
        },
        getNextPesHeader: () => {
            if (!nextPesHeader) {
                throw new Error('No next PES header found');
            }
            return nextPesHeader;
        },
    };
};
exports.makeNextPesHeaderStore = makeNextPesHeaderStore;
