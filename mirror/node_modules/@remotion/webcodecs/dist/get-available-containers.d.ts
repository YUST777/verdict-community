export declare const availableContainers: readonly ["webm", "mp4", "wav"];
export type ConvertMediaContainer = (typeof availableContainers)[number];
export declare const getAvailableContainers: () => readonly ("mp4" | "wav" | "webm")[];
