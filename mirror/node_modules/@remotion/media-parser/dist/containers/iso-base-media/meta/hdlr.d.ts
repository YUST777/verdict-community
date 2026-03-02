import type { BufferIterator } from '../../../iterator/buffer-iterator';
import type { BaseBox } from '../base-type';
export interface HdlrBox extends BaseBox {
    type: 'hdlr-box';
    hdlrType: string;
    componentName: string;
}
export declare const parseHdlr: ({ iterator, size, offset, }: {
    iterator: BufferIterator;
    size: number;
    offset: number;
}) => Promise<HdlrBox>;
