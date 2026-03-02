import type { MediaParserAudioCodec, MediaParserAudioTrack, MediaParserVideoTrack } from '../../get-tracks';
import type { TrackEntry } from './segments/all-segments';
export declare const NO_CODEC_PRIVATE_SHOULD_BE_DERIVED_FROM_SPS = "no-codec-private-should-be-derived-from-sps";
export declare const getMatroskaAudioCodecEnum: ({ track, }: {
    track: TrackEntry;
}) => MediaParserAudioCodec;
export declare const getTrack: ({ timescale, track, }: {
    timescale: number;
    track: TrackEntry;
}) => MediaParserVideoTrack | MediaParserAudioTrack | null;
