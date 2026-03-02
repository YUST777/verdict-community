"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeCluster = exports.canFitInCluster = exports.timestampToClusterTimestamp = void 0;
const media_parser_1 = require("@remotion/media-parser");
const log_1 = require("../../log");
const cluster_segment_1 = require("./cluster-segment");
const matroska_utils_1 = require("./matroska-utils");
const maxClusterTimestamp = 2 ** 15;
const timestampToClusterTimestamp = (timestamp, timescale) => {
    return Math.round((timestamp / timescale) * 1000);
};
exports.timestampToClusterTimestamp = timestampToClusterTimestamp;
const canFitInCluster = ({ clusterStartTimestamp, chunk, timescale, }) => {
    const timecodeRelativeToCluster = (0, exports.timestampToClusterTimestamp)(chunk.timestamp, timescale) -
        (0, exports.timestampToClusterTimestamp)(clusterStartTimestamp, timescale);
    if (timecodeRelativeToCluster < 0) {
        throw new Error(`timecodeRelativeToCluster is negative, tried to add ${chunk.timestamp} to ${clusterStartTimestamp}`);
    }
    return timecodeRelativeToCluster <= maxClusterTimestamp;
};
exports.canFitInCluster = canFitInCluster;
const makeCluster = async ({ writer, clusterStartTimestamp, timescale, logLevel, }) => {
    log_1.Log.verbose(logLevel, `Making new Matroska cluster with timestamp ${clusterStartTimestamp}`);
    const cluster = (0, cluster_segment_1.createClusterSegment)((0, exports.timestampToClusterTimestamp)(clusterStartTimestamp, timescale));
    const clusterVIntPosition = writer.getWrittenByteCount() +
        cluster.offsets.offset +
        (0, matroska_utils_1.matroskaToHex)(media_parser_1.MediaParserInternals.matroskaElements.Cluster).byteLength;
    let clusterSize = cluster.bytes.byteLength -
        (0, matroska_utils_1.matroskaToHex)(media_parser_1.MediaParserInternals.matroskaElements.Cluster).byteLength -
        cluster_segment_1.CLUSTER_MIN_VINT_WIDTH;
    await writer.write(cluster.bytes);
    const addSample = async (chunk, trackNumber) => {
        const timecodeRelativeToCluster = (0, exports.timestampToClusterTimestamp)(chunk.timestamp, timescale) -
            (0, exports.timestampToClusterTimestamp)(clusterStartTimestamp, timescale);
        if (!(0, exports.canFitInCluster)({ clusterStartTimestamp, chunk, timescale })) {
            throw new Error(`timecodeRelativeToCluster is too big: ${timecodeRelativeToCluster} > ${maxClusterTimestamp}`);
        }
        const keyframe = chunk.type === 'key';
        const simpleBlock = (0, cluster_segment_1.makeSimpleBlock)({
            bytes: chunk.data,
            invisible: false,
            keyframe,
            lacing: 0,
            trackNumber,
            timecodeRelativeToCluster,
        });
        clusterSize += simpleBlock.byteLength;
        await writer.updateDataAt(clusterVIntPosition, (0, matroska_utils_1.getVariableInt)(clusterSize, cluster_segment_1.CLUSTER_MIN_VINT_WIDTH));
        await writer.write(simpleBlock);
        return { timecodeRelativeToCluster };
    };
    const shouldMakeNewCluster = ({ isVideo, chunk, newT, }) => {
        const newTimestamp = (0, exports.timestampToClusterTimestamp)(newT, timescale);
        const oldTimestamp = (0, exports.timestampToClusterTimestamp)(clusterStartTimestamp, timescale);
        const canFit = (0, exports.canFitInCluster)({
            chunk,
            clusterStartTimestamp,
            timescale,
        });
        if (!canFit) {
            // We must create a new cluster
            // This is for example if we have an audio-only file
            log_1.Log.verbose(logLevel, `Cannot fit ${chunk.timestamp} in cluster ${clusterStartTimestamp}. Creating new cluster`);
            return true;
        }
        const keyframe = chunk.type === 'key';
        // TODO: Timestamp falls apart when video only
        return newTimestamp - oldTimestamp >= 2000 && keyframe && isVideo;
    };
    return {
        addSample,
        shouldMakeNewCluster,
        startTimestamp: clusterStartTimestamp,
    };
};
exports.makeCluster = makeCluster;
