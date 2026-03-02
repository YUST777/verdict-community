/**
 * Keeps track of in which section of the file the video is playing
 * Usually this section is in a different format and it is the only section
 * that can be read partially
 */
import type { BufferIterator } from '../iterator/buffer-iterator';
export type MediaSection = {
    start: number;
    size: number;
};
export declare const isByteInMediaSection: ({ position, mediaSections, }: {
    position: number;
    mediaSections: MediaSection[];
}) => "no-section-defined" | "in-section" | "outside-section";
export declare const getCurrentMediaSection: ({ offset, mediaSections, }: {
    offset: number;
    mediaSections: MediaSection[];
}) => MediaSection | null;
export declare const mediaSectionState: () => {
    addMediaSection: (section: MediaSection) => void;
    getMediaSections: () => MediaSection[];
    isCurrentByteInMediaSection: (iterator: BufferIterator) => "no-section-defined" | "in-section" | "outside-section";
    isByteInMediaSection: ({ position, mediaSections, }: {
        position: number;
        mediaSections: MediaSection[];
    }) => "no-section-defined" | "in-section" | "outside-section";
    getCurrentMediaSection: ({ offset, mediaSections, }: {
        offset: number;
        mediaSections: MediaSection[];
    }) => MediaSection | null;
    getMediaSectionAssertOnlyOne: () => MediaSection;
    mediaSections: MediaSection[];
};
export type MediaSectionState = ReturnType<typeof mediaSectionState>;
