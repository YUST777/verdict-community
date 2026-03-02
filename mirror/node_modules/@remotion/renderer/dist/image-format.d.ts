export declare const validVideoImageFormats: readonly ["png", "jpeg", "none"];
export declare const validStillImageFormats: readonly ["png", "jpeg", "pdf", "webp"];
export type VideoImageFormat = (typeof validVideoImageFormats)[number];
export type StillImageFormat = (typeof validStillImageFormats)[number];
/**
 * @deprecated Use VideoImageFormat or StillImageFormat instead
 */
export type ImageFormat = 'This type is deprecated, use VideoImageFormat or StillImageFormat instead';
export declare const DEFAULT_VIDEO_IMAGE_FORMAT: VideoImageFormat;
export declare const DEFAULT_STILL_IMAGE_FORMAT: StillImageFormat;
export declare const validateSelectedPixelFormatAndImageFormatCombination: (pixelFormat: "yuv420p" | "yuv420p10le" | "yuv422p" | "yuv422p10le" | "yuv444p" | "yuv444p10le" | "yuva420p" | "yuva444p10le" | undefined, videoImageFormat: "jpeg" | "none" | "png") => "none" | "valid";
export declare const validateStillImageFormat: (imageFormat: "jpeg" | "pdf" | "png" | "webp") => void;
