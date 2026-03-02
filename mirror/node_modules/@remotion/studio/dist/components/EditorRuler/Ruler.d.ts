import type { Size } from '@remotion/player';
import React from 'react';
interface Point {
    value: number;
    position: number;
}
interface RulerProps {
    readonly scale: number;
    readonly points: Point[];
    readonly originOffset: number;
    readonly startMarking: number;
    readonly markingGaps: number;
    readonly orientation: 'horizontal' | 'vertical';
    readonly size: Size;
}
declare const Ruler: React.FC<RulerProps>;
export default Ruler;
