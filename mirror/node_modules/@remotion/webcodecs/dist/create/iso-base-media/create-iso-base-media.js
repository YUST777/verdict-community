"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIsoBaseMedia = void 0;
const media_parser_1 = require("@remotion/media-parser");
const matroska_utils_1 = require("../matroska/matroska-utils");
const create_ftyp_1 = require("./create-ftyp");
const mp4_header_1 = require("./mp4-header");
const primitives_1 = require("./primitives");
const CONTAINER_TIMESCALE = 1000;
const createIsoBaseMedia = async ({ writer, onBytesProgress, onMillisecondsProgress, logLevel, filename, progressTracker, expectedDurationInSeconds, expectedFrameRate, }) => {
    const header = (0, create_ftyp_1.createIsoBaseMediaFtyp)({
        compatibleBrands: ['isom', 'iso2', 'avc1', 'mp42'],
        majorBrand: 'isom',
        minorBrand: 512,
    });
    const w = await writer.createContent({
        filename,
        mimeType: 'video/mp4',
        logLevel,
    });
    await w.write(header);
    let globalDurationInUnits = 0;
    const lowestTrackTimestamps = {};
    const trackDurations = {};
    const currentTracks = [];
    const samplePositions = [];
    const sampleChunkIndices = [];
    const moovOffset = w.getWrittenByteCount();
    const getPaddedMoovAtom = () => {
        return (0, mp4_header_1.createPaddedMoovAtom)({
            durationInUnits: globalDurationInUnits,
            trackInfo: currentTracks.map((track) => {
                return {
                    track,
                    durationInUnits: trackDurations[track.trackNumber] ?? 0,
                    samplePositions: samplePositions[track.trackNumber] ?? [],
                    timescale: track.timescale,
                };
            }),
            timescale: CONTAINER_TIMESCALE,
            expectedDurationInSeconds,
            logLevel,
            expectedFrameRate,
        });
    };
    await w.write(getPaddedMoovAtom());
    let mdatSize = 8;
    const mdatSizeOffset = w.getWrittenByteCount();
    await w.write((0, matroska_utils_1.combineUint8Arrays)([
        // size
        (0, primitives_1.numberTo32BitUIntOrInt)(mdatSize),
        // type
        (0, primitives_1.stringsToUint8Array)('mdat'),
    ]));
    const updateMdatSize = async () => {
        await w.updateDataAt(mdatSizeOffset, (0, primitives_1.numberTo32BitUIntOrInt)(mdatSize));
        onBytesProgress(w.getWrittenByteCount());
    };
    const operationProm = { current: Promise.resolve() };
    const updateMoov = async () => {
        await w.updateDataAt(moovOffset, getPaddedMoovAtom());
        onBytesProgress(w.getWrittenByteCount());
    };
    const addCodecPrivateToTrack = ({ trackNumber, codecPrivate, }) => {
        currentTracks.forEach((track) => {
            if (track.trackNumber === trackNumber) {
                track.codecPrivate = codecPrivate;
            }
        });
    };
    let lastChunkWasVideo = false;
    const addSample = async ({ chunk, trackNumber, isVideo, codecPrivate, }) => {
        const position = w.getWrittenByteCount();
        await w.write(chunk.data);
        mdatSize += chunk.data.length;
        onBytesProgress(w.getWrittenByteCount());
        progressTracker.setPossibleLowestTimestamp(Math.min(chunk.timestamp, chunk.decodingTimestamp ?? Infinity));
        progressTracker.updateTrackProgress(trackNumber, chunk.timestamp);
        if (codecPrivate) {
            addCodecPrivateToTrack({ trackNumber, codecPrivate });
        }
        const currentTrack = currentTracks.find((t) => t.trackNumber === trackNumber);
        if (!currentTrack) {
            throw new Error(`Tried to add sample to track ${trackNumber}, but it doesn't exist`);
        }
        if (!lowestTrackTimestamps[trackNumber] ||
            chunk.timestamp < lowestTrackTimestamps[trackNumber]) {
            lowestTrackTimestamps[trackNumber] = chunk.timestamp;
        }
        if (typeof lowestTrackTimestamps[trackNumber] !== 'number') {
            throw new Error(`Tried to add sample to track ${trackNumber}, but it has no timestamp`);
        }
        const newDurationInMicroSeconds = chunk.timestamp +
            (chunk.duration ?? 0) -
            lowestTrackTimestamps[trackNumber];
        const newDurationInTrackTimeUnits = Math.round(newDurationInMicroSeconds / (1000000 / currentTrack.timescale));
        trackDurations[trackNumber] = newDurationInTrackTimeUnits;
        // webcodecs returns frame duration in microseconds
        const newDurationInMilliseconds = Math.round((newDurationInMicroSeconds / 1000000) * CONTAINER_TIMESCALE);
        if (newDurationInMilliseconds > globalDurationInUnits) {
            globalDurationInUnits = newDurationInMilliseconds;
            onMillisecondsProgress(newDurationInMilliseconds);
        }
        if (!samplePositions[trackNumber]) {
            samplePositions[trackNumber] = [];
        }
        if (typeof sampleChunkIndices[trackNumber] === 'undefined') {
            sampleChunkIndices[trackNumber] = 0;
        }
        // For video, make a new chunk if it's a keyframe
        if (isVideo && chunk.type === 'key') {
            sampleChunkIndices[trackNumber]++;
        } // For audio, make a new chunk every 22 samples, that's how bbb.mp4 is encoded
        else if (!isVideo && samplePositions[trackNumber].length % 22 === 0) {
            sampleChunkIndices[trackNumber]++;
        }
        // Need to create a new chunk if the last chunk was a different type
        else if (lastChunkWasVideo !== isVideo) {
            sampleChunkIndices[trackNumber]++;
        }
        // media parser and EncodedVideoChunk returns timestamps in microseconds
        // need to normalize the timestamps to milliseconds
        const samplePositionToAdd = {
            isKeyframe: chunk.type === 'key',
            offset: position,
            chunk: sampleChunkIndices[trackNumber],
            timestamp: Math.round((chunk.timestamp / 1000000) * currentTrack.timescale),
            decodingTimestamp: Math.round((chunk.decodingTimestamp / 1000000) * currentTrack.timescale),
            duration: Math.round(((chunk.duration ?? 0) / 1000000) * currentTrack.timescale),
            size: chunk.data.length,
            bigEndian: false,
            chunkSize: null,
        };
        lastChunkWasVideo = isVideo;
        samplePositions[trackNumber].push(samplePositionToAdd);
    };
    const addTrack = (track) => {
        const trackNumber = currentTracks.length + 1;
        currentTracks.push({ ...track, trackNumber });
        progressTracker.registerTrack(trackNumber);
        return Promise.resolve({ trackNumber });
    };
    const waitForFinishPromises = [];
    return {
        getBlob: () => {
            return w.getBlob();
        },
        remove: async () => {
            await w.remove();
        },
        addSample: ({ chunk, trackNumber, isVideo, codecPrivate }) => {
            operationProm.current = operationProm.current.then(() => {
                return addSample({
                    chunk,
                    trackNumber,
                    isVideo,
                    codecPrivate,
                });
            });
            return operationProm.current;
        },
        addTrack: (track) => {
            operationProm.current = operationProm.current.then(() => addTrack(track));
            return operationProm.current;
        },
        updateTrackSampleRate: ({ sampleRate, trackNumber }) => {
            currentTracks.forEach((track) => {
                if (track.trackNumber === trackNumber) {
                    if (track.type !== 'audio') {
                        throw new Error(`Tried to update sample rate of track ${trackNumber}, but it's not an audio track`);
                    }
                    track.sampleRate = sampleRate;
                }
            });
        },
        addWaitForFinishPromise: (promise) => {
            waitForFinishPromises.push(promise);
        },
        async waitForFinish() {
            media_parser_1.MediaParserInternals.Log.verbose(logLevel, 'All write operations queued. Waiting for finish...');
            await Promise.all(waitForFinishPromises.map((p) => p()));
            media_parser_1.MediaParserInternals.Log.verbose(logLevel, 'Cleanup tasks executed');
            await operationProm.current;
            await updateMoov();
            await updateMdatSize();
            media_parser_1.MediaParserInternals.Log.verbose(logLevel, 'All write operations done. Waiting for finish...');
            await w.finish();
        },
    };
};
exports.createIsoBaseMedia = createIsoBaseMedia;
