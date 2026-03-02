"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webReader = void 0;
const from_fetch_1 = require("./from-fetch");
const from_web_file_1 = require("./from-web-file");
exports.webReader = {
    read: (params) => {
        if (params.src instanceof Blob) {
            return (0, from_web_file_1.webFileReadContent)(params);
        }
        return (0, from_fetch_1.fetchReadContent)(params);
    },
    createAdjacentFileSource: (relativePath, src) => {
        if (src instanceof Blob) {
            return (0, from_web_file_1.webFileCreateAdjacentFileSource)(relativePath, src);
        }
        return (0, from_fetch_1.fetchCreateAdjacentFileSource)(relativePath, src);
    },
    readWholeAsText: (src) => {
        if (src instanceof Blob) {
            return (0, from_web_file_1.webFileReadWholeAsText)(src);
        }
        return (0, from_fetch_1.fetchReadWholeAsText)(src);
    },
    preload: ({ range, src, logLevel, prefetchCache }) => {
        if (src instanceof Blob) {
            return;
        }
        return (0, from_fetch_1.fetchPreload)({ range, src, logLevel, prefetchCache });
    },
};
