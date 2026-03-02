"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeMetadataArgs = void 0;
const version_1 = require("remotion/version");
const makeMetadataArgs = (metadata) => {
    const defaultComment = `Made with Remotion ${version_1.VERSION}`;
    const newMetadata = {
        comment: defaultComment,
    };
    Object.keys(metadata).forEach((key) => {
        const lowercaseKey = key.toLowerCase();
        if (lowercaseKey === 'comment') {
            newMetadata[lowercaseKey] = `${defaultComment}; ${metadata[key]}`;
        }
        else {
            newMetadata[lowercaseKey] = metadata[key];
        }
    });
    const metadataArgs = Object.entries(newMetadata).map(([key, value]) => ['-metadata', `${key}=${value}`]);
    return metadataArgs.flat(1);
};
exports.makeMetadataArgs = makeMetadataArgs;
