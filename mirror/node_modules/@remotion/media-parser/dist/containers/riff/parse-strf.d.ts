import type { BufferIterator } from '../../iterator/buffer-iterator';
import type { FccType, StrfBoxAudio, StrfBoxVideo } from './riff-box';
export declare const parseStrf: ({ iterator, size, fccType, }: {
    iterator: BufferIterator;
    size: number;
    fccType: FccType;
}) => StrfBoxAudio | StrfBoxVideo;
