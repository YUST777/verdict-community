"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.universalReader = void 0;
const from_fetch_1 = require("./from-fetch");
const from_node_1 = require("./from-node");
const from_web_file_1 = require("./from-web-file");
exports.universalReader = {
    read: (params) => {
        if (params.src instanceof Blob) {
            return (0, from_web_file_1.webFileReadContent)(params);
        }
        if (params.src.toString().startsWith('http') ||
            params.src.toString().startsWith('blob:')) {
            return (0, from_fetch_1.fetchReadContent)(params);
        }
        return (0, from_node_1.nodeReadContent)(params);
    },
    readWholeAsText: (src) => {
        if (src instanceof Blob) {
            return (0, from_web_file_1.webFileReadWholeAsText)(src);
        }
        if (src.toString().startsWith('http') ||
            src.toString().startsWith('blob:')) {
            return (0, from_fetch_1.fetchReadWholeAsText)(src);
        }
        return (0, from_node_1.nodeReadWholeAsText)(src);
    },
    createAdjacentFileSource: (relativePath, src) => {
        if (src instanceof Blob) {
            return (0, from_web_file_1.webFileCreateAdjacentFileSource)(relativePath, src);
        }
        if (src.toString().startsWith('http') ||
            src.toString().startsWith('blob:')) {
            return (0, from_fetch_1.fetchCreateAdjacentFileSource)(relativePath, src);
        }
        return (0, from_node_1.nodeCreateAdjacentFileSource)(relativePath, src);
    },
    preload: ({ src, range, logLevel, prefetchCache }) => {
        if (src instanceof Blob) {
            return;
        }
        if (src.toString().startsWith('http') ||
            src.toString().startsWith('blob:')) {
            return (0, from_fetch_1.fetchPreload)({ range, src, logLevel, prefetchCache });
        }
    },
};
