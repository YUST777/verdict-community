"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performSeek = void 0;
const log_1 = require("./log");
const seek_backwards_1 = require("./seek-backwards");
const seek_forwards_1 = require("./seek-forwards");
const video_section_1 = require("./state/video-section");
const performSeek = async ({ seekTo, userInitiated, controller, mediaSection, iterator, seekInfiniteLoop, logLevel, mode, contentLength, currentReader, readerInterface, src, discardReadBytes, fields, prefetchCache, isoState, }) => {
    const byteInMediaSection = (0, video_section_1.isByteInMediaSection)({
        position: seekTo,
        mediaSections: mediaSection.getMediaSections(),
    });
    if (byteInMediaSection !== 'in-section' && userInitiated) {
        const sections = mediaSection.getMediaSections();
        const sectionStrings = sections.map((section) => {
            return `start: ${section.start}, end: ${section.size + section.start}`;
        });
        throw new Error(`Cannot seek to a byte that is not in the video section. Seeking to: ${seekTo}, sections: ${sectionStrings.join(' | ')}`);
    }
    seekInfiniteLoop.registerSeek(seekTo);
    if (seekTo <= iterator.counter.getOffset() && mode === 'download') {
        throw new Error(`Seeking backwards is not supported in parseAndDownloadMedia() mode. Current position: ${iterator.counter.getOffset()}, seekTo: ${seekTo}`);
    }
    if (seekTo > contentLength) {
        throw new Error(`Cannot seek beyond the end of the file: ${seekTo} > ${contentLength}`);
    }
    if (mode === 'download') {
        log_1.Log.verbose(logLevel, `Skipping over video data from position ${iterator.counter.getOffset()} -> ${seekTo}. Fetching but not reading all the data inbetween because in download mode`);
        iterator.discard(seekTo - iterator.counter.getOffset());
        return;
    }
    await controller._internals.checkForAbortAndPause();
    const alreadyAtByte = iterator.counter.getOffset() === seekTo;
    if (alreadyAtByte) {
        log_1.Log.verbose(logLevel, `Already at the desired position, seeking done`);
        controller._internals.performedSeeksSignal.markLastSeekAsUserInitiated();
        return;
    }
    const skippingForward = seekTo > iterator.counter.getOffset();
    controller._internals.performedSeeksSignal.recordSeek({
        from: iterator.counter.getOffset(),
        to: seekTo,
        type: userInitiated ? 'user-initiated' : 'internal',
    });
    if (skippingForward) {
        await (0, seek_forwards_1.seekForward)({
            seekTo,
            userInitiated,
            iterator,
            fields,
            logLevel,
            currentReader,
            readerInterface,
            src,
            controller,
            discardReadBytes,
            prefetchCache,
        });
    }
    else {
        await (0, seek_backwards_1.seekBackwards)({
            controller,
            seekTo,
            iterator,
            logLevel,
            currentReader,
            readerInterface,
            src,
            prefetchCache,
        });
    }
    if (userInitiated) {
        isoState.flatSamples.updateAfterSeek(seekTo);
    }
    await controller._internals.checkForAbortAndPause();
};
exports.performSeek = performSeek;
