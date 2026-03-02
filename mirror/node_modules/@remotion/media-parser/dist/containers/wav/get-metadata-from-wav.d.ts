import type { MediaParserMetadataEntry } from '../../metadata/get-metadata';
import type { WavStructure } from './types';
export declare const getMetadataFromWav: (structure: WavStructure) => MediaParserMetadataEntry[] | null;
