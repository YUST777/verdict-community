import type { RenderType } from '../components/RenderModal/RenderModalAdvanced';
type Section = 'general' | 'picture' | 'advanced' | 'data' | 'gif' | 'audio';
export declare const useRenderModalSections: (renderMode: RenderType, codec: "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav") => {
    tab: Section;
    setTab: import("react").Dispatch<import("react").SetStateAction<Section>>;
    shownTabs: Section[];
};
export {};
