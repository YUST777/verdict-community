"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMatroskaMedia = void 0;
const media_parser_1 = require("@remotion/media-parser");
const cluster_1 = require("./cluster");
const make_duration_with_padding_1 = require("./make-duration-with-padding");
const matroska_cues_1 = require("./matroska-cues");
const matroska_header_1 = require("./matroska-header");
const matroska_info_1 = require("./matroska-info");
const matroska_seek_1 = require("./matroska-seek");
const matroska_segment_1 = require("./matroska-segment");
const matroska_trackentry_1 = require("./matroska-trackentry");
const matroska_utils_1 = require("./matroska-utils");
const { matroskaElements } = media_parser_1.MediaParserInternals;
const timescale = 1000000;
const createMatroskaMedia = async ({ writer, onBytesProgress, onMillisecondsProgress, filename, logLevel, progressTracker, }) => {
    const header = (0, matroska_header_1.makeMatroskaHeader)();
    const w = await writer.createContent({
        filename,
        mimeType: 'video/webm',
        logLevel,
    });
    await w.write(header.bytes);
    const matroskaInfo = (0, matroska_info_1.makeMatroskaInfo)({
        timescale,
    });
    const currentTracks = [];
    const seeks = [];
    const cues = [];
    const trackNumbers = [];
    const matroskaSegment = (0, matroska_segment_1.createMatroskaSegment)([
        ...(0, matroska_seek_1.createMatroskaSeekHead)(seeks),
        matroskaInfo,
        ...(0, matroska_trackentry_1.makeMatroskaTracks)(currentTracks),
    ]);
    const infoSegment = matroskaSegment.offsets.children.find((o) => o.field === 'Info');
    const durationOffset = (infoSegment?.children.find((c) => c.field === 'Duration')?.offset ?? 0) +
        w.getWrittenByteCount();
    const tracksOffset = (matroskaSegment.offsets.children.find((o) => o.field === 'Tracks')
        ?.offset ?? 0) + w.getWrittenByteCount();
    const seekHeadOffset = (matroskaSegment.offsets.children.find((o) => o.field === 'SeekHead')
        ?.offset ?? 0) + w.getWrittenByteCount();
    const infoOffset = (infoSegment?.offset ?? 0) + w.getWrittenByteCount();
    if (!seekHeadOffset) {
        throw new Error('could not get seek offset');
    }
    if (!durationOffset) {
        throw new Error('could not get duration offset');
    }
    if (!tracksOffset) {
        throw new Error('could not get tracks offset');
    }
    if (!infoOffset) {
        throw new Error('could not get tracks offset');
    }
    seeks.push({
        hexString: matroskaElements.Info,
        byte: infoOffset - seekHeadOffset,
    });
    seeks.push({
        hexString: matroskaElements.Tracks,
        byte: tracksOffset - seekHeadOffset,
    });
    const updateSeekWrite = async () => {
        const updatedSeek = (0, matroska_seek_1.createMatroskaSeekHead)(seeks);
        await w.updateDataAt(seekHeadOffset, (0, matroska_utils_1.combineUint8Arrays)(updatedSeek.map((b) => b.bytes)));
        onBytesProgress(w.getWrittenByteCount());
    };
    const segmentOffset = w.getWrittenByteCount();
    const updateSegmentSize = async (size) => {
        const data = (0, matroska_utils_1.getVariableInt)(size, matroska_segment_1.MATROSKA_SEGMENT_MIN_VINT_WIDTH);
        await w.updateDataAt(segmentOffset + (0, matroska_utils_1.matroskaToHex)(matroskaElements.Segment).byteLength, data);
        onBytesProgress(w.getWrittenByteCount());
    };
    await w.write(matroskaSegment.bytes);
    const clusterOffset = w.getWrittenByteCount();
    let currentCluster = await (0, cluster_1.makeCluster)({
        writer: w,
        clusterStartTimestamp: 0,
        timescale,
        logLevel,
    });
    seeks.push({
        hexString: matroskaElements.Cluster,
        byte: clusterOffset - seekHeadOffset,
    });
    const getClusterOrMakeNew = async ({ chunk, isVideo, }) => {
        // In Safari, samples can arrive out of order, e.g public/bigbuckbunny.mp4
        // Therefore, only updating track number progress if it is a keyframe
        // to allow for timestamps to be lower than the previous one
        progressTracker.setPossibleLowestTimestamp(Math.min(chunk.timestamp, chunk.decodingTimestamp ?? Infinity));
        const smallestProgress = progressTracker.getSmallestProgress();
        if (!currentCluster.shouldMakeNewCluster({
            newT: smallestProgress,
            isVideo,
            chunk,
        })) {
            return {
                cluster: currentCluster,
                isNew: false,
                smallestProgress,
            };
        }
        currentCluster = await (0, cluster_1.makeCluster)({
            writer: w,
            clusterStartTimestamp: smallestProgress,
            timescale,
            logLevel,
        });
        return {
            cluster: currentCluster,
            isNew: true,
            smallestProgress,
        };
    };
    const updateDuration = async (newDuration) => {
        const blocks = (0, make_duration_with_padding_1.makeDurationWithPadding)(newDuration);
        await w.updateDataAt(durationOffset, blocks.bytes);
        onBytesProgress(w.getWrittenByteCount());
    };
    const addSample = async ({ chunk, trackNumber, isVideo, }) => {
        const offset = w.getWrittenByteCount();
        const { cluster, isNew, smallestProgress } = await getClusterOrMakeNew({
            chunk,
            isVideo,
        });
        const newDuration = Math.round((chunk.timestamp + (chunk.duration ?? 0)) / 1000);
        await updateDuration(newDuration);
        const { timecodeRelativeToCluster } = await cluster.addSample(chunk, trackNumber);
        if (isNew) {
            if (offset === null) {
                throw new Error('offset is null');
            }
            cues.push({
                time: (0, cluster_1.timestampToClusterTimestamp)(smallestProgress, timescale) +
                    timecodeRelativeToCluster,
                clusterPosition: offset - seekHeadOffset,
                trackNumber,
            });
        }
        if (chunk.type === 'key') {
            progressTracker.updateTrackProgress(trackNumber, chunk.timestamp);
        }
        onBytesProgress(w.getWrittenByteCount());
        onMillisecondsProgress(newDuration);
    };
    const addTrack = async (track) => {
        currentTracks.push(track);
        const newTracks = (0, matroska_trackentry_1.makeMatroskaTracks)(currentTracks);
        progressTracker.registerTrack(track.trackNumber);
        await w.updateDataAt(tracksOffset, (0, matroska_utils_1.combineUint8Arrays)(newTracks.map((b) => b.bytes)));
    };
    const operationProm = { current: Promise.resolve() };
    const waitForFinishPromises = [];
    return {
        updateTrackSampleRate: ({ sampleRate, trackNumber }) => {
            currentTracks.forEach((track) => {
                if (track.trackNumber === trackNumber) {
                    if (track.type !== 'audio') {
                        throw new Error('track is not audio');
                    }
                    track.sampleRate = sampleRate;
                }
            });
        },
        getBlob: () => {
            return w.getBlob();
        },
        remove: async () => {
            await w.remove();
        },
        addSample: ({ chunk, trackNumber, isVideo }) => {
            operationProm.current = operationProm.current.then(() => addSample({ chunk, trackNumber, isVideo }));
            return operationProm.current;
        },
        addTrack: (track) => {
            const trackNumber = currentTracks.length + 1;
            operationProm.current = operationProm.current.then(() => addTrack({ ...track, trackNumber }));
            trackNumbers.push(trackNumber);
            return operationProm.current.then(() => ({ trackNumber }));
        },
        addWaitForFinishPromise: (promise) => {
            waitForFinishPromises.push(promise);
        },
        async waitForFinish() {
            await Promise.all(waitForFinishPromises.map((p) => p()));
            await operationProm.current;
            const cuesBytes = (0, matroska_cues_1.createMatroskaCues)(cues);
            if (cuesBytes) {
                seeks.push({
                    hexString: matroskaElements.Cues,
                    byte: w.getWrittenByteCount() - seekHeadOffset,
                });
                await w.write(cuesBytes.bytes);
            }
            await updateSeekWrite();
            const segmentSize = w.getWrittenByteCount() -
                segmentOffset -
                (0, matroska_utils_1.matroskaToHex)(matroskaElements.Segment).byteLength -
                matroska_segment_1.MATROSKA_SEGMENT_MIN_VINT_WIDTH;
            await updateSegmentSize(segmentSize);
            await w.finish();
        },
    };
};
exports.createMatroskaMedia = createMatroskaMedia;
