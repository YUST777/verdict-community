"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasMetadata = exports.getMetadata = void 0;
const get_metadata_from_flac_1 = require("../containers/flac/get-metadata-from-flac");
const get_metadata_from_mp3_1 = require("../containers/mp3/get-metadata-from-mp3");
const get_metadata_from_wav_1 = require("../containers/wav/get-metadata-from-wav");
const metadata_from_iso_1 = require("./metadata-from-iso");
const metadata_from_matroska_1 = require("./metadata-from-matroska");
const metadata_from_riff_1 = require("./metadata-from-riff");
const getMetadata = (state) => {
    var _a, _b;
    const structure = state.structure.getStructure();
    if (structure.type === 'matroska') {
        return (0, metadata_from_matroska_1.getMetadataFromMatroska)(structure);
    }
    if (structure.type === 'riff') {
        return (0, metadata_from_riff_1.getMetadataFromRiff)(structure);
    }
    if (structure.type === 'transport-stream' || structure.type === 'm3u') {
        return [];
    }
    if (structure.type === 'mp3') {
        const tags = (0, get_metadata_from_mp3_1.getMetadataFromMp3)(structure);
        // Not all MP3s file have this header.
        // Internal link: https://discord.com/channels/809501355504959528/1001500302375125055/1408880907602890752
        return tags !== null && tags !== void 0 ? tags : [];
    }
    if (structure.type === 'wav') {
        return (_a = (0, get_metadata_from_wav_1.getMetadataFromWav)(structure)) !== null && _a !== void 0 ? _a : [];
    }
    if (structure.type === 'aac') {
        return [];
    }
    if (structure.type === 'flac') {
        return (_b = (0, get_metadata_from_flac_1.getMetadataFromFlac)(structure)) !== null && _b !== void 0 ? _b : [];
    }
    if (structure.type === 'iso-base-media') {
        return (0, metadata_from_iso_1.getMetadataFromIsoBase)(state);
    }
    throw new Error('Unknown container ' + structure);
};
exports.getMetadata = getMetadata;
// TODO: This forces some containers to check the whole file
// we can do this better! skip over video data
const hasMetadata = (structure) => {
    if (structure.type === 'mp3') {
        return (0, get_metadata_from_mp3_1.getMetadataFromMp3)(structure) !== null;
    }
    if (structure.type === 'wav') {
        return (0, get_metadata_from_wav_1.getMetadataFromWav)(structure) !== null;
    }
    // M3U, Transport Stream, AAC cannot store any metadata
    if (structure.type === 'm3u' ||
        structure.type === 'transport-stream' ||
        structure.type === 'aac') {
        return true;
    }
    if (structure.type === 'flac') {
        return (0, get_metadata_from_flac_1.getMetadataFromFlac)(structure) !== null;
    }
    // The following containers (MP4, Matroska, AVI) all have mechanisms
    // to skip over video sections, and tests for it in read-metadata.test.ts
    if (structure.type === 'iso-base-media') {
        return false;
    }
    if (structure.type === 'matroska') {
        return false;
    }
    if (structure.type === 'riff') {
        return false;
    }
    throw new Error('Unknown container ' + structure);
};
exports.hasMetadata = hasMetadata;
