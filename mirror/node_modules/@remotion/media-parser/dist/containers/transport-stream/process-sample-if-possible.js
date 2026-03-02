"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processSampleIfPossible = void 0;
const process_audio_1 = require("./process-audio");
const process_stream_buffers_1 = require("./process-stream-buffers");
const process_video_1 = require("./process-video");
const traversal_1 = require("./traversal");
const processSampleIfPossible = async (state) => {
    const programMap = (0, traversal_1.findProgramMapOrNull)(state.structure.getTsStructure());
    if (!programMap) {
        return;
    }
    let processed = false;
    for (const stream of programMap.streams) {
        const streamBuffer = state.transportStream.streamBuffers.get(stream.pid);
        if (!streamBuffer) {
            continue;
        }
        if (stream.streamType === 27) {
            if ((0, process_video_1.canProcessVideo)({ streamBuffer })) {
                const rest = await (0, process_video_1.processVideo)({
                    programId: stream.pid,
                    structure: state.structure.getTsStructure(),
                    streamBuffer,
                    sampleCallbacks: state.callbacks,
                    logLevel: state.logLevel,
                    onAudioTrack: state.onAudioTrack,
                    onVideoTrack: state.onVideoTrack,
                    transportStream: state.transportStream,
                    makeSamplesStartAtZero: state.makeSamplesStartAtZero,
                    avcState: state.avc,
                });
                state.transportStream.streamBuffers.delete(stream.pid);
                state.transportStream.streamBuffers.set(stream.pid, (0, process_stream_buffers_1.makeTransportStreamPacketBuffer)({
                    pesHeader: state.transportStream.nextPesHeaderStore.getNextPesHeader(),
                    buffers: rest,
                    offset: state.iterator.counter.getOffset(),
                }));
                processed = true;
                break;
            }
        }
        if (stream.streamType === 15) {
            if ((0, process_audio_1.canProcessAudio)({ streamBuffer })) {
                await (0, process_audio_1.processAudio)({
                    structure: state.structure.getTsStructure(),
                    offset: state.iterator.counter.getOffset(),
                    sampleCallbacks: state.callbacks,
                    logLevel: state.logLevel,
                    onAudioTrack: state.onAudioTrack,
                    onVideoTrack: state.onVideoTrack,
                    transportStream: state.transportStream,
                    makeSamplesStartAtZero: state.makeSamplesStartAtZero,
                    transportStreamEntry: stream,
                    avcState: state.avc,
                });
                processed = true;
                break;
            }
        }
    }
    return processed;
};
exports.processSampleIfPossible = processSampleIfPossible;
