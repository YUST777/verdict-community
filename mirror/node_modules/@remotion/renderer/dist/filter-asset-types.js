"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onlyInlineAudio = exports.onlyArtifact = exports.onlyAudioAndVideoAssets = void 0;
const truthy_1 = require("./truthy");
const onlyAudioAndVideoAssets = (assets) => {
    return assets.filter((asset) => asset.type === 'audio' || asset.type === 'video');
};
exports.onlyAudioAndVideoAssets = onlyAudioAndVideoAssets;
const onlyArtifact = ({ assets, frameBuffer, }) => {
    const artifacts = assets.filter((asset) => asset.type === 'artifact');
    return artifacts
        .map((artifact) => {
        if (artifact.contentType === 'binary' ||
            artifact.contentType === 'text') {
            return {
                frame: artifact.frame,
                content: artifact.content,
                filename: artifact.filename,
                downloadBehavior: artifact.downloadBehavior,
            };
        }
        if (artifact.contentType === 'thumbnail') {
            if (frameBuffer === null) {
                // A thumbnail artifact was defined to be emitted, but the output was not a video.
                // Also, in Lambda, there are extra frames which are not video frames.
                // This could happen if a thumbnail is unconditionally emitted.
                return null;
            }
            return {
                frame: artifact.frame,
                content: new Uint8Array(frameBuffer),
                filename: artifact.filename,
                downloadBehavior: artifact.downloadBehavior,
            };
        }
        throw new Error('Unknown artifact type: ' + artifact);
    })
        .filter(truthy_1.truthy);
};
exports.onlyArtifact = onlyArtifact;
const onlyInlineAudio = (assets) => {
    return assets.filter((asset) => asset.type === 'inline-audio');
};
exports.onlyInlineAudio = onlyInlineAudio;
