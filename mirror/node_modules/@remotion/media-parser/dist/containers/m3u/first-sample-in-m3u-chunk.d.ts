import type { MediaParserController } from '../../controller/media-parser-controller';
import type { M3uState } from '../../state/m3u-state';
import type { MediaParserOnVideoSample, MediaParserVideoSample } from '../../webcodec-sample-types';
export declare const considerSeekBasedOnChunk: ({ sample, parentController, childController, callback, m3uState, playlistUrl, subtractChunks, chunkIndex, }: {
    sample: MediaParserVideoSample;
    callback: MediaParserOnVideoSample;
    parentController: MediaParserController;
    childController: MediaParserController;
    playlistUrl: string;
    m3uState: M3uState;
    subtractChunks: number;
    chunkIndex: number | null;
}) => Promise<void>;
