"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMediaOnWebWorker = exports.MediaParserAbortError = exports.IsAPdfError = exports.IsAnUnsupportedFileTypeError = exports.IsAnImageError = exports.hasBeenAborted = void 0;
var errors_1 = require("./errors");
Object.defineProperty(exports, "hasBeenAborted", { enumerable: true, get: function () { return errors_1.hasBeenAborted; } });
Object.defineProperty(exports, "IsAnImageError", { enumerable: true, get: function () { return errors_1.IsAnImageError; } });
Object.defineProperty(exports, "IsAnUnsupportedFileTypeError", { enumerable: true, get: function () { return errors_1.IsAnUnsupportedFileTypeError; } });
Object.defineProperty(exports, "IsAPdfError", { enumerable: true, get: function () { return errors_1.IsAPdfError; } });
Object.defineProperty(exports, "MediaParserAbortError", { enumerable: true, get: function () { return errors_1.MediaParserAbortError; } });
const parseMediaOnWebWorker = () => {
    throw new Error('parseMediaOnWebWorker is not available in CJS mode. Load this function using ESM to use it.');
};
exports.parseMediaOnWebWorker = parseMediaOnWebWorker;
