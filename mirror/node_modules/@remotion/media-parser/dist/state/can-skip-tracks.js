"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeCanSkipTracksState = exports.needsTracksForField = void 0;
const needsTracksForField = ({ field, structure, }) => {
    if (field === 'dimensions') {
        if ((structure === null || structure === void 0 ? void 0 : structure.type) === 'riff') {
            return false;
        }
        return true;
    }
    if (field === 'audioCodec' ||
        field === 'durationInSeconds' ||
        field === 'slowDurationInSeconds' ||
        field === 'slowFps' ||
        field === 'fps' ||
        field === 'isHdr' ||
        field === 'rotation' ||
        field === 'slowStructure' ||
        field === 'tracks' ||
        field === 'unrotatedDimensions' ||
        field === 'videoCodec' ||
        field === 'metadata' ||
        field === 'location' ||
        field === 'slowKeyframes' ||
        field === 'slowNumberOfFrames' ||
        field === 'keyframes' ||
        field === 'images' ||
        field === 'sampleRate' ||
        field === 'numberOfAudioChannels' ||
        field === 'slowAudioBitrate' ||
        field === 'slowVideoBitrate' ||
        field === 'm3uStreams') {
        return true;
    }
    if (field === 'container' ||
        field === 'internalStats' ||
        field === 'mimeType' ||
        field === 'name' ||
        field === 'size') {
        return false;
    }
    throw new Error(`field not implemeted ${field}`);
};
exports.needsTracksForField = needsTracksForField;
const makeCanSkipTracksState = ({ hasAudioTrackHandlers, fields, hasVideoTrackHandlers, structure, }) => {
    const doFieldsNeedTracks = () => {
        const keys = Object.keys(fields !== null && fields !== void 0 ? fields : {});
        const selectedKeys = keys.filter((k) => fields[k]);
        return selectedKeys.some((k) => (0, exports.needsTracksForField)({
            field: k,
            structure: structure.getStructureOrNull(),
        }));
    };
    return {
        doFieldsNeedTracks,
        canSkipTracks: () => {
            if (hasAudioTrackHandlers || hasVideoTrackHandlers) {
                return false;
            }
            return !doFieldsNeedTracks();
        },
    };
};
exports.makeCanSkipTracksState = makeCanSkipTracksState;
