import type { Codec } from './codec';
import type { FileExtension } from './file-extensions';
export declare const getFileExtensionFromCodec: <T extends "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav">(codec: T, audioCodec: "aac" | "mp3" | "opus" | "pcm-16" | null) => FileExtension;
export declare const makeFileExtensionMap: () => Record<string, ("aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav")[]>;
export declare const defaultCodecsForFileExtension: Record<FileExtension, Codec>;
