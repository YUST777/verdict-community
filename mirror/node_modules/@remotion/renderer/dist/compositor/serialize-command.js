"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeCommand = void 0;
const make_nonce_1 = require("./make-nonce");
const serializeCommand = (command, params) => {
    return {
        nonce: (0, make_nonce_1.makeNonce)(),
        payload: {
            type: command,
            params,
        },
    };
};
exports.serializeCommand = serializeCommand;
