import type { MediaParserMetadataEntry } from '../../metadata/get-metadata';
import type { Mp3Structure } from '../../parse-result';
export declare const getMetadataFromMp3: (mp3Structure: Mp3Structure) => MediaParserMetadataEntry[] | null;
