"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetadataFromMatroska = void 0;
const traversal_1 = require("../containers/webm/traversal");
const removeEndZeroes = (value) => {
    return value.endsWith('\u0000') ? removeEndZeroes(value.slice(0, -1)) : value;
};
const parseSimpleTagIntoEbml = (children, trackId) => {
    const tagName = children.find((c) => c.type === 'TagName');
    const tagString = children.find((c) => c.type === 'TagString');
    if (!tagName || !tagString) {
        return null;
    }
    return {
        trackId,
        key: tagName.value.toLowerCase(),
        value: removeEndZeroes(tagString.value),
    };
};
const getMetadataFromMatroska = (structure) => {
    var _a;
    const entries = [];
    for (const segment of structure.boxes) {
        if (segment.type !== 'Segment') {
            continue;
        }
        const tags = segment.value.filter((s) => s.type === 'Tags');
        for (const tag of tags) {
            for (const child of tag.value) {
                if (child.type !== 'Tag') {
                    continue;
                }
                let trackId = null;
                const target = child.value.find((c) => c.type === 'Targets');
                if (target) {
                    const tagTrackId = (_a = target.value.find((c) => c.type === 'TagTrackUID')) === null || _a === void 0 ? void 0 : _a.value;
                    if (tagTrackId) {
                        trackId = (0, traversal_1.getTrackWithUid)(segment, tagTrackId);
                    }
                }
                const simpleTags = child.value.filter((s) => s.type === 'SimpleTag');
                for (const simpleTag of simpleTags) {
                    const parsed = parseSimpleTagIntoEbml(simpleTag.value, trackId);
                    if (parsed) {
                        entries.push(parsed);
                    }
                }
            }
        }
    }
    return entries;
};
exports.getMetadataFromMatroska = getMetadataFromMatroska;
