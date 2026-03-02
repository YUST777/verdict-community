"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seekForward = void 0;
const disallow_forward_seek_if_samples_are_needed_1 = require("./disallow-forward-seek-if-samples-are-needed");
const log_1 = require("./log");
const seekForward = async ({ seekTo, userInitiated, iterator, fields, logLevel, currentReader, readerInterface, src, controller, discardReadBytes, prefetchCache, }) => {
    if (userInitiated) {
        (0, disallow_forward_seek_if_samples_are_needed_1.disallowForwardSeekIfSamplesAreNeeded)({
            fields,
            seekTo,
            previousPosition: iterator.counter.getOffset(),
        });
    }
    const alreadyHasBuffer = iterator.bytesRemaining() >= seekTo - iterator.counter.getOffset();
    log_1.Log.verbose(logLevel, `Performing seek from ${iterator.counter.getOffset()} to ${seekTo}`);
    // (a) starting byte has already been fetched
    if (alreadyHasBuffer) {
        iterator.skipTo(seekTo);
        log_1.Log.verbose(logLevel, `Already read ahead enough, skipping forward`);
        return;
    }
    // (b) starting byte has not been fetched yet, making new reader
    const time = Date.now();
    log_1.Log.verbose(logLevel, `Skipping over video data from position ${iterator.counter.getOffset()} -> ${seekTo}. Re-reading because this portion is not available`);
    await currentReader.getCurrent().abort();
    const { reader: newReader } = await readerInterface.read({
        src,
        range: seekTo,
        controller,
        logLevel,
        prefetchCache,
    });
    iterator.skipTo(seekTo);
    await discardReadBytes(true);
    log_1.Log.verbose(logLevel, `Re-reading took ${Date.now() - time}ms. New position: ${iterator.counter.getOffset()}`);
    currentReader.setCurrent(newReader);
};
exports.seekForward = seekForward;
