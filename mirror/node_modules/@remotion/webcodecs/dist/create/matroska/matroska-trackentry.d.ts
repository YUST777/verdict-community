import type { MediaParserAdvancedColor } from '@remotion/media-parser';
import type { MakeTrackAudio, MakeTrackVideo } from '../make-track-info';
export declare const makeMatroskaVideoBytes: ({ color, width, height, }: {
    color: MediaParserAdvancedColor;
    width: number;
    height: number;
}) => import("./matroska-utils").BytesAndOffset;
export declare const makeMatroskaAudioTrackEntryBytes: ({ trackNumber, codec, numberOfChannels, sampleRate, codecPrivate, }: MakeTrackAudio) => import("./matroska-utils").BytesAndOffset;
export declare const makeMatroskaVideoTrackEntryBytes: ({ color, width, height, trackNumber, codec, codecPrivate, }: MakeTrackVideo) => import("./matroska-utils").BytesAndOffset;
export declare const makeMatroskaTracks: (tracks: (MakeTrackAudio | MakeTrackVideo)[]) => import("./matroska-utils").BytesAndOffset[];
