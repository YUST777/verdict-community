"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expectSegment = void 0;
const log_1 = require("../../log");
const parse_ebml_1 = require("./parse-ebml");
const all_segments_1 = require("./segments/all-segments");
const expectSegment = async ({ statesForProcessing, isInsideSegment, iterator, logLevel, mediaSectionState, }) => {
    var _a;
    if (iterator.bytesRemaining() === 0) {
        throw new Error('has no bytes');
    }
    const offset = iterator.counter.getOffset();
    const { returnToCheckpoint } = iterator.startCheckpoint();
    const segmentId = iterator.getMatroskaSegmentId();
    if (segmentId === null) {
        returnToCheckpoint();
        return null;
    }
    const offsetBeforeVInt = iterator.counter.getOffset();
    const size = iterator.getVint();
    const offsetAfterVInt = iterator.counter.getOffset();
    if (size === null) {
        returnToCheckpoint();
        return null;
    }
    const bytesRemainingNow = iterator.bytesRemaining();
    log_1.Log.trace(logLevel, 'Segment ID:', (_a = all_segments_1.ebmlMap[segmentId]) === null || _a === void 0 ? void 0 : _a.name, 'Size:' + size, bytesRemainingNow);
    if (segmentId === all_segments_1.matroskaElements.Segment) {
        if (!statesForProcessing) {
            throw new Error('States for processing are required');
        }
        statesForProcessing.webmState.addSegment({
            start: offset,
            size,
        });
        const newSegment = {
            type: 'Segment',
            minVintWidth: offsetAfterVInt - offsetBeforeVInt,
            value: [],
        };
        return newSegment;
    }
    if (segmentId === all_segments_1.matroskaElements.Cluster) {
        if (isInsideSegment === null) {
            throw new Error('Expected to be inside segment');
        }
        if (!statesForProcessing) {
            throw new Error('States for processing are required');
        }
        if (mediaSectionState) {
            mediaSectionState.addMediaSection({
                start: offset,
                size,
            });
        }
        statesForProcessing.webmState.addCluster({
            start: offset,
            size: size + (offsetAfterVInt - offset),
            segment: isInsideSegment.index,
        });
        const newSegment = {
            type: 'Cluster',
            minVintWidth: offsetAfterVInt - offsetBeforeVInt,
            value: [],
        };
        return newSegment;
    }
    if (bytesRemainingNow < size) {
        returnToCheckpoint();
        return null;
    }
    const segment = await parseSegment({
        segmentId,
        length: size,
        headerReadSoFar: iterator.counter.getOffset() - offset,
        statesForProcessing,
        iterator,
        logLevel,
    });
    return segment;
};
exports.expectSegment = expectSegment;
const parseSegment = async ({ segmentId, length, iterator, headerReadSoFar, statesForProcessing, logLevel, }) => {
    if (length < 0) {
        throw new Error(`Expected length of ${segmentId} to be greater or equal 0`);
    }
    iterator.counter.decrement(headerReadSoFar);
    const offset = iterator.counter.getOffset();
    const ebml = await (0, parse_ebml_1.parseEbml)(iterator, statesForProcessing, logLevel);
    if (ebml === null) {
        return null;
    }
    if (!statesForProcessing) {
        return ebml;
    }
    const remapped = await (0, parse_ebml_1.postprocessEbml)({
        offset,
        ebml,
        statesForProcessing,
    });
    return remapped;
};
