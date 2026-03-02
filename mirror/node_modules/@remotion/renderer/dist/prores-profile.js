"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSelectedCodecAndProResCombination = void 0;
const no_react_1 = require("remotion/no-react");
const validateSelectedCodecAndProResCombination = ({ codec, proResProfile, }) => {
    if (typeof proResProfile !== 'undefined' && codec !== 'prores') {
        throw new TypeError(`You have set a ProRes profile but the codec is "${codec}". Set the codec to "prores" or remove the ProRes profile.`);
    }
    if (proResProfile !== undefined &&
        !no_react_1.NoReactInternals.proResProfileOptions.includes(proResProfile)) {
        throw new TypeError(`The ProRes profile "${proResProfile}" is not valid. Valid options are ${no_react_1.NoReactInternals.proResProfileOptions
            .map((p) => `"${p}"`)
            .join(', ')}`);
    }
};
exports.validateSelectedCodecAndProResCombination = validateSelectedCodecAndProResCombination;
