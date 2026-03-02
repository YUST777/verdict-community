export declare const canConcatAudioSeamlessly: (audioCodec: "aac" | "mp3" | "opus" | "pcm-16" | null, chunkDurationInFrames: number) => boolean;
export declare const canConcatVideoSeamlessly: (codec: "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav") => codec is "h264";
