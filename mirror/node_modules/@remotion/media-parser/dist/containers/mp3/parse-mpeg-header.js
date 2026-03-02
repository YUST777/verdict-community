"use strict";
// spec: http://www.mp3-tech.org/programmer/frame_header.html
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMpegHeader = void 0;
const log_1 = require("../../log");
const register_track_1 = require("../../register-track");
const webcodecs_timescale_1 = require("../../webcodecs-timescale");
const parse_packet_header_1 = require("./parse-packet-header");
const parse_xing_1 = require("./parse-xing");
const audio_sample_from_cbr_1 = require("./seek/audio-sample-from-cbr");
const audio_sample_from_vbr_1 = require("./seek/audio-sample-from-vbr");
const parseMpegHeader = async ({ state, }) => {
    const { iterator } = state;
    const initialOffset = iterator.counter.getOffset();
    if (iterator.bytesRemaining() < 32) {
        return;
    }
    // parse header
    const { frameLength, bitrateInKbit, layer, mpegVersion, numberOfChannels, sampleRate, samplesPerFrame, } = (0, parse_packet_header_1.parseMp3PacketHeader)(iterator);
    const cbrMp3Info = state.mp3.getMp3BitrateInfo();
    if (cbrMp3Info && cbrMp3Info.type === 'constant') {
        if (bitrateInKbit !== cbrMp3Info.bitrateInKbit) {
            throw new Error(`Bitrate mismatch at offset ${initialOffset}: ${bitrateInKbit} !== ${cbrMp3Info.bitrateInKbit}`);
        }
    }
    const offsetNow = iterator.counter.getOffset();
    iterator.counter.decrement(offsetNow - initialOffset);
    const data = iterator.getSlice(frameLength);
    if (state.callbacks.tracks.getTracks().length === 0) {
        const info = {
            layer,
            mpegVersion,
            sampleRate,
        };
        const asText = new TextDecoder().decode(data);
        if (asText.includes('VBRI')) {
            throw new Error('MP3 files with VBRI are currently unsupported because we have no sample file. Submit this file at remotion.dev/report if you would like us to support this file.');
        }
        if (asText.includes('Info')) {
            return;
        }
        const isVbr = asText.includes('Xing');
        if (isVbr) {
            const xingData = (0, parse_xing_1.parseXing)(data);
            log_1.Log.verbose(state.logLevel, 'MP3 has variable bit rate. Requiring whole file to be read');
            state.mp3.setMp3BitrateInfo({
                type: 'variable',
                xingData,
            });
            return;
        }
        if (!state.mp3.getMp3BitrateInfo()) {
            state.mp3.setMp3BitrateInfo({
                bitrateInKbit,
                type: 'constant',
            });
        }
        state.mp3.setMp3Info(info);
        await (0, register_track_1.registerAudioTrack)({
            container: 'mp3',
            track: {
                type: 'audio',
                codec: 'mp3',
                codecData: null,
                codecEnum: 'mp3',
                description: undefined,
                numberOfChannels,
                sampleRate,
                originalTimescale: 1000000,
                trackId: 0,
                startInSeconds: 0,
                timescale: webcodecs_timescale_1.WEBCODECS_TIMESCALE,
                trackMediaTimeOffsetInTrackTimescale: 0,
            },
            registerAudioSampleCallback: state.callbacks.registerAudioSampleCallback,
            tracks: state.callbacks.tracks,
            logLevel: state.logLevel,
            onAudioTrack: state.onAudioTrack,
        });
        state.callbacks.tracks.setIsDone(state.logLevel);
        state.mediaSection.addMediaSection({
            start: initialOffset,
            size: state.contentLength - initialOffset,
        });
    }
    const bitrateInfo = state.mp3.getMp3BitrateInfo();
    if (!bitrateInfo) {
        throw new Error('No bitrate info');
    }
    const sample = bitrateInfo.type === 'constant'
        ? (0, audio_sample_from_cbr_1.getAudioSampleFromCbr)({
            bitrateInKbit,
            data,
            initialOffset,
            layer,
            sampleRate,
            samplesPerFrame,
            state,
        })
        : (0, audio_sample_from_vbr_1.getAudioSampleFromVbr)({
            data,
            info: bitrateInfo,
            mp3Info: state.mp3.getMp3Info(),
            position: initialOffset,
        });
    const { audioSample, timeInSeconds, durationInSeconds } = sample;
    state.mp3.audioSamples.addSample({
        timeInSeconds,
        offset: initialOffset,
        durationInSeconds,
    });
    await state.callbacks.onAudioSample({
        audioSample,
        trackId: 0,
    });
};
exports.parseMpegHeader = parseMpegHeader;
