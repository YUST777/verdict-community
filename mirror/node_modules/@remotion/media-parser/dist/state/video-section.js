"use strict";
/**
 * Keeps track of in which section of the file the video is playing
 * Usually this section is in a different format and it is the only section
 * that can be read partially
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaSectionState = exports.getCurrentMediaSection = exports.isByteInMediaSection = void 0;
const isByteInMediaSection = ({ position, mediaSections, }) => {
    if (mediaSections.length === 0) {
        return 'no-section-defined';
    }
    for (const section of mediaSections) {
        if (position >= section.start && position < section.start + section.size) {
            return 'in-section';
        }
    }
    return 'outside-section';
};
exports.isByteInMediaSection = isByteInMediaSection;
const getCurrentMediaSection = ({ offset, mediaSections, }) => {
    for (const section of mediaSections) {
        if (offset >= section.start && offset < section.start + section.size) {
            return section;
        }
    }
    return null;
};
exports.getCurrentMediaSection = getCurrentMediaSection;
const mediaSectionState = () => {
    const mediaSections = [];
    const addMediaSection = (section) => {
        // Check if section overlaps with any existing sections
        const overlaps = mediaSections.some((existingSection) => section.start < existingSection.start + existingSection.size &&
            section.start + section.size > existingSection.start);
        if (overlaps) {
            return;
        }
        // Remove any existing sections that are encompassed by the new section
        // Needed by Matroska because we need to define a 1 byte media section
        // when seeking into a Cluster we have not seen yet
        for (let i = mediaSections.length - 1; i >= 0; i--) {
            const existingSection = mediaSections[i];
            if (section.start <= existingSection.start &&
                section.start + section.size >=
                    existingSection.start + existingSection.size) {
                mediaSections.splice(i, 1);
            }
        }
        mediaSections.push(section);
    };
    const getMediaSections = () => {
        return mediaSections;
    };
    const isCurrentByteInMediaSection = (iterator) => {
        const offset = iterator.counter.getOffset();
        return (0, exports.isByteInMediaSection)({
            position: offset,
            mediaSections,
        });
    };
    const getMediaSectionAssertOnlyOne = () => {
        if (mediaSections.length !== 1) {
            throw new Error('Expected only one video section');
        }
        return mediaSections[0];
    };
    return {
        addMediaSection,
        getMediaSections,
        isCurrentByteInMediaSection,
        isByteInMediaSection: exports.isByteInMediaSection,
        getCurrentMediaSection: exports.getCurrentMediaSection,
        getMediaSectionAssertOnlyOne,
        mediaSections,
    };
};
exports.mediaSectionState = mediaSectionState;
