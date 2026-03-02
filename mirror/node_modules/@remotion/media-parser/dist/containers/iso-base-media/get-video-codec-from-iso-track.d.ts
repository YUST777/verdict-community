import type { TrakBox } from './trak/trak';
export declare const getVideoCodecFromIsoTrak: (trakBox: TrakBox) => "h264" | "vp9" | "av1" | "h265" | "prores";
