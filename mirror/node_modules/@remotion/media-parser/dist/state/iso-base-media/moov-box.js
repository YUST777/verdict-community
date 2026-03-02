"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moovState = void 0;
const moovState = () => {
    let moovBox = null;
    return {
        setMoovBox: (moov) => {
            moovBox = moov;
        },
        getMoovBoxAndPrecomputed: () => moovBox,
    };
};
exports.moovState = moovState;
