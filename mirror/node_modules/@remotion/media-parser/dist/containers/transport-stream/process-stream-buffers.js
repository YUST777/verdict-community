"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processFinalStreamBuffers = exports.processStreamBuffer = exports.makeTransportStreamPacketBuffer = void 0;
const combine_uint8_arrays_1 = require("../../combine-uint8-arrays");
const find_separator_1 = require("./find-separator");
const get_tracks_1 = require("./get-tracks");
const handle_aac_packet_1 = require("./handle-aac-packet");
const handle_avc_packet_1 = require("./handle-avc-packet");
const traversal_1 = require("./traversal");
const makeTransportStreamPacketBuffer = ({ buffers, pesHeader, offset, }) => {
    let currentBuf = buffers ? [buffers] : [];
    let subarrayIndex = null;
    const getBuffer = () => {
        if (currentBuf.length === 0) {
            return new Uint8Array();
        }
        if (currentBuf.length === 1) {
            return currentBuf[0];
        }
        currentBuf = [(0, combine_uint8_arrays_1.combineUint8Arrays)(currentBuf)];
        return currentBuf[0];
    };
    let fastFind = null;
    return {
        pesHeader,
        offset,
        getBuffer,
        addBuffer: (buffer) => {
            currentBuf.push(buffer);
            subarrayIndex = null;
        },
        get2ndSubArrayIndex: () => {
            var _a, _b;
            if (subarrayIndex === null) {
                const result = (0, find_separator_1.findNthSubarrayIndex)({
                    array: getBuffer(),
                    subarray: new Uint8Array([0, 0, 1, 9]),
                    n: 2,
                    startIndex: (_a = fastFind === null || fastFind === void 0 ? void 0 : fastFind.index) !== null && _a !== void 0 ? _a : 0,
                    startCount: (_b = fastFind === null || fastFind === void 0 ? void 0 : fastFind.count) !== null && _b !== void 0 ? _b : 0,
                });
                if (result.type === 'found') {
                    subarrayIndex = result.index;
                    fastFind = null;
                }
                else {
                    fastFind = result;
                    return -1;
                }
            }
            return subarrayIndex;
        },
    };
};
exports.makeTransportStreamPacketBuffer = makeTransportStreamPacketBuffer;
const processStreamBuffer = async ({ streamBuffer, programId, structure, sampleCallbacks, logLevel, onAudioTrack, onVideoTrack, transportStream, makeSamplesStartAtZero, avcState, }) => {
    const stream = (0, traversal_1.getStreamForId)(structure, programId);
    if (!stream) {
        throw new Error('No stream found');
    }
    // 2 = ITU-T Rec. H.262 | ISO/IEC 13818-2 Video or ISO/IEC 11172-2 constrained parameter video stream
    if (stream.streamType === 2) {
        throw new Error('H.262 video stream not supported');
    }
    // 27 = AVC / H.264 Video
    if (stream.streamType === 27) {
        await (0, handle_avc_packet_1.handleAvcPacket)({
            programId,
            streamBuffer,
            sampleCallbacks,
            logLevel,
            onVideoTrack,
            offset: streamBuffer.offset,
            transportStream,
            makeSamplesStartAtZero,
            avcState,
        });
    }
    // 15 = AAC / ADTS
    else if (stream.streamType === 15) {
        await (0, handle_aac_packet_1.handleAacPacket)({
            streamBuffer,
            programId,
            offset: streamBuffer.offset,
            sampleCallbacks,
            logLevel,
            onAudioTrack,
            transportStream,
            makeSamplesStartAtZero,
        });
    }
    if (!sampleCallbacks.tracks.hasAllTracks()) {
        const tracksRegistered = sampleCallbacks.tracks.getTracks().length;
        const { streams } = (0, traversal_1.findProgramMapTableOrThrow)(structure);
        if ((0, get_tracks_1.filterStreamsBySupportedTypes)(streams).length === tracksRegistered) {
            sampleCallbacks.tracks.setIsDone(logLevel);
        }
    }
};
exports.processStreamBuffer = processStreamBuffer;
const processFinalStreamBuffers = async ({ structure, sampleCallbacks, logLevel, onAudioTrack, onVideoTrack, transportStream, makeSamplesStartAtZero, avcState, }) => {
    for (const [programId, buffer] of transportStream.streamBuffers) {
        if (buffer.getBuffer().byteLength > 0) {
            await (0, exports.processStreamBuffer)({
                streamBuffer: buffer,
                programId,
                structure,
                sampleCallbacks,
                logLevel,
                onAudioTrack,
                onVideoTrack,
                transportStream,
                makeSamplesStartAtZero,
                avcState,
            });
            transportStream.streamBuffers.delete(programId);
        }
    }
};
exports.processFinalStreamBuffers = processFinalStreamBuffers;
