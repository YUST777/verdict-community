"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAudioCodecFromTrack = exports.getAudioCodecStringFromTrak = exports.isTwosAudioCodec = exports.isIn24AudioCodec = exports.isLpcmAudioCodec = exports.getAudioCodecFromTrak = exports.getSampleRate = exports.getNumberOfChannelsFromTrak = exports.getCodecPrivateFromTrak = exports.hasAudioCodec = exports.getAudioCodec = void 0;
const traversal_1 = require("./containers/iso-base-media/traversal");
const get_tracks_1 = require("./get-tracks");
const getAudioCodec = (parserState) => {
    const tracks = (0, get_tracks_1.getTracks)(parserState, true);
    if (tracks.length === 0) {
        throw new Error('No tracks yet');
    }
    const audioTrack = tracks.find((t) => t.type === 'audio');
    if (!audioTrack) {
        return null;
    }
    if (audioTrack.type === 'audio') {
        return audioTrack.codecEnum;
    }
    return null;
};
exports.getAudioCodec = getAudioCodec;
const hasAudioCodec = (state) => {
    return (0, get_tracks_1.getHasTracks)(state, true);
};
exports.hasAudioCodec = hasAudioCodec;
const getCodecSpecificatorFromEsdsBox = ({ child, }) => {
    const descriptor = child.descriptors.find((d) => d.type === 'decoder-config-descriptor');
    if (!descriptor) {
        throw new Error('No decoder-config-descriptor');
    }
    if (descriptor.type !== 'decoder-config-descriptor') {
        throw new Error('Expected decoder-config-descriptor');
    }
    if (descriptor.asNumber !== 0x40) {
        return {
            primary: descriptor.asNumber,
            secondary: null,
            description: undefined,
        };
    }
    const audioSpecificConfig = descriptor.decoderSpecificConfigs.find((d) => {
        return d.type === 'mp4a-specific-config' ? d : null;
    });
    if (!audioSpecificConfig ||
        audioSpecificConfig.type !== 'mp4a-specific-config') {
        throw new Error('No audio-specific-config');
    }
    return {
        primary: descriptor.asNumber,
        secondary: audioSpecificConfig.audioObjectType,
        description: audioSpecificConfig.asBytes,
    };
};
const getCodecPrivateFromTrak = (trakBox) => {
    const stsdBox = (0, traversal_1.getStsdBox)(trakBox);
    if (!stsdBox) {
        return null;
    }
    const audioSample = stsdBox.samples.find((s) => s.type === 'audio');
    if (!audioSample || audioSample.type !== 'audio') {
        return null;
    }
    const esds = audioSample.children.find((b) => b.type === 'esds-box');
    if (!esds || esds.type !== 'esds-box') {
        return null;
    }
    const decoderConfigDescriptor = esds.descriptors.find((d) => d.type === 'decoder-config-descriptor');
    if (!decoderConfigDescriptor) {
        return null;
    }
    const mp4a = decoderConfigDescriptor.decoderSpecificConfigs.find((d) => d.type === 'mp4a-specific-config');
    if (!mp4a) {
        return null;
    }
    return { type: 'aac-config', data: mp4a.asBytes };
};
exports.getCodecPrivateFromTrak = getCodecPrivateFromTrak;
const onSample = (sample, children) => {
    const child = children.find((c) => c.type === 'esds-box');
    if (child && child.type === 'esds-box') {
        const ret = getCodecSpecificatorFromEsdsBox({ child });
        return {
            format: sample.format,
            primarySpecificator: ret.primary,
            secondarySpecificator: ret.secondary,
            description: ret.description,
        };
    }
    return {
        format: sample.format,
        primarySpecificator: null,
        secondarySpecificator: null,
        description: undefined,
    };
};
const getNumberOfChannelsFromTrak = (trak) => {
    const stsdBox = (0, traversal_1.getStsdBox)(trak);
    if (!stsdBox) {
        return null;
    }
    const sample = stsdBox.samples.find((s) => s.type === 'audio');
    if (!sample || sample.type !== 'audio') {
        return null;
    }
    return sample.numberOfChannels;
};
exports.getNumberOfChannelsFromTrak = getNumberOfChannelsFromTrak;
const getSampleRate = (trak) => {
    const stsdBox = (0, traversal_1.getStsdBox)(trak);
    if (!stsdBox) {
        return null;
    }
    const sample = stsdBox.samples.find((s) => s.type === 'audio');
    if (!sample || sample.type !== 'audio') {
        return null;
    }
    return sample.sampleRate;
};
exports.getSampleRate = getSampleRate;
const getAudioCodecFromTrak = (trak) => {
    const stsdBox = (0, traversal_1.getStsdBox)(trak);
    if (!stsdBox) {
        return null;
    }
    const sample = stsdBox.samples.find((s) => s.type === 'audio');
    if (!sample || sample.type !== 'audio') {
        return null;
    }
    const waveBox = sample.children.find((b) => b.type === 'regular-box' && b.boxType === 'wave');
    if (waveBox && waveBox.type === 'regular-box' && waveBox.boxType === 'wave') {
        const esdsSample = onSample(sample, waveBox.children);
        if (esdsSample) {
            return esdsSample;
        }
    }
    const ret = onSample(sample, sample.children);
    if (ret) {
        return ret;
    }
    return null;
};
exports.getAudioCodecFromTrak = getAudioCodecFromTrak;
const isLpcmAudioCodec = (trak) => {
    var _a;
    return ((_a = (0, exports.getAudioCodecFromTrak)(trak)) === null || _a === void 0 ? void 0 : _a.format) === 'lpcm';
};
exports.isLpcmAudioCodec = isLpcmAudioCodec;
const isIn24AudioCodec = (trak) => {
    var _a;
    return ((_a = (0, exports.getAudioCodecFromTrak)(trak)) === null || _a === void 0 ? void 0 : _a.format) === 'in24';
};
exports.isIn24AudioCodec = isIn24AudioCodec;
const isTwosAudioCodec = (trak) => {
    var _a;
    return ((_a = (0, exports.getAudioCodecFromTrak)(trak)) === null || _a === void 0 ? void 0 : _a.format) === 'twos';
};
exports.isTwosAudioCodec = isTwosAudioCodec;
const getAudioCodecStringFromTrak = (trak) => {
    const codec = (0, exports.getAudioCodecFromTrak)(trak);
    if (!codec) {
        throw new Error('Expected codec');
    }
    if (codec.format === 'lpcm') {
        return {
            codecString: 'pcm-s16',
            description: codec.description
                ? { type: 'unknown-data', data: codec.description }
                : undefined,
        };
    }
    if (codec.format === 'twos') {
        return {
            codecString: 'pcm-s16',
            description: codec.description
                ? { type: 'unknown-data', data: codec.description }
                : undefined,
        };
    }
    if (codec.format === 'in24') {
        return {
            codecString: 'pcm-s24',
            description: codec.description
                ? { type: 'unknown-data', data: codec.description }
                : undefined,
        };
    }
    const codecStringWithoutMp3Exception = [
        codec.format,
        codec.primarySpecificator ? codec.primarySpecificator.toString(16) : null,
        codec.secondarySpecificator
            ? codec.secondarySpecificator.toString().padStart(2, '0')
            : null,
    ].filter(Boolean).join('.');
    // Really, MP3? 😔
    const codecString = codecStringWithoutMp3Exception.toLowerCase() === 'mp4a.6b' ||
        codecStringWithoutMp3Exception.toLowerCase() === 'mp4a.69'
        ? 'mp3' // or "mp4a.6B" would also work, with the uppercasing, but mp3 is probably more obvious
        : codecStringWithoutMp3Exception;
    if (codecString === 'mp3') {
        return {
            codecString,
            description: codec.description
                ? {
                    type: 'unknown-data',
                    data: codec.description,
                }
                : undefined,
        };
    }
    if (codecString.startsWith('mp4a.')) {
        return {
            codecString,
            description: codec.description
                ? {
                    type: 'aac-config',
                    data: codec.description,
                }
                : undefined,
        };
    }
    return {
        codecString,
        description: codec.description
            ? {
                type: 'unknown-data',
                data: codec.description,
            }
            : undefined,
    };
};
exports.getAudioCodecStringFromTrak = getAudioCodecStringFromTrak;
const getAudioCodecFromAudioCodecInfo = (codec) => {
    if (codec.format === 'twos') {
        return 'pcm-s16';
    }
    if (codec.format === 'in24') {
        return 'pcm-s24';
    }
    if (codec.format === 'lpcm') {
        return 'pcm-s16';
    }
    if (codec.format === 'sowt') {
        return 'aiff';
    }
    if (codec.format === 'ac-3') {
        return 'ac3';
    }
    if (codec.format === 'Opus') {
        return 'opus';
    }
    if (codec.format === 'mp4a') {
        if (codec.primarySpecificator === 0x40) {
            return 'aac';
        }
        if (codec.primarySpecificator === 0x6b) {
            return 'mp3';
        }
        if (codec.primarySpecificator === null) {
            return 'aac';
        }
        throw new Error('Unknown mp4a codec: ' + codec.primarySpecificator);
    }
    throw new Error(`Unknown audio format: ${codec.format}`);
};
const getAudioCodecFromTrack = (track) => {
    const audioSample = (0, exports.getAudioCodecFromTrak)(track);
    if (!audioSample) {
        throw new Error('Could not find audio sample');
    }
    return getAudioCodecFromAudioCodecInfo(audioSample);
};
exports.getAudioCodecFromTrack = getAudioCodecFromTrack;
