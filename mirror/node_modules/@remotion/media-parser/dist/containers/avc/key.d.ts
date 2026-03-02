import type { AvcInfo } from './parse-avc';
export declare const getKeyFrameOrDeltaFromAvcInfo: (infos: AvcInfo[]) => "key" | "delta" | "bidirectional";
