"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultOnLog = void 0;
const logger_1 = require("./logger");
const defaultOnLog = ({ logLevel, tag, previewString }) => {
    logger_1.Log[logLevel]({ logLevel, tag, indent: false }, previewString);
};
exports.defaultOnLog = defaultOnLog;
