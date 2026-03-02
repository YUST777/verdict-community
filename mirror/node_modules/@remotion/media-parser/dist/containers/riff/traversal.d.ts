import type { AvihBox, ListBox, RiffBox, RiffStructure, StrhBox } from './riff-box';
export declare const isRiffAvi: (structure: RiffStructure) => boolean;
export declare const getHdlrBox: (structure: RiffStructure) => ListBox | null;
export declare const getAvihBox: (structure: RiffStructure) => AvihBox | null;
export declare const getStrlBoxes: (structure: RiffStructure) => ListBox[];
export declare const getStrhBox: (strlBoxChildren: RiffBox[]) => StrhBox | null;
