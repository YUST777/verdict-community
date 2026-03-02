"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seekBackwards = void 0;
const log_1 = require("./log");
const seekBackwards = async ({ iterator, seekTo, readerInterface, src, controller, logLevel, currentReader, prefetchCache, }) => {
    // (a) data has not been discarded yet
    const howManyBytesWeCanGoBack = iterator.counter.getDiscardedOffset();
    if (iterator.counter.getOffset() - howManyBytesWeCanGoBack <= seekTo) {
        log_1.Log.verbose(logLevel, `Seeking back to ${seekTo}`);
        iterator.skipTo(seekTo);
        return;
    }
    // (b) data has been discarded, making new reader
    const time = Date.now();
    log_1.Log.verbose(logLevel, `Seeking in video from position ${iterator.counter.getOffset()} -> ${seekTo}. Re-reading because this portion is not available.`);
    await currentReader.getCurrent().abort();
    const { reader: newReader } = await readerInterface.read({
        src,
        range: seekTo,
        controller,
        logLevel,
        prefetchCache,
    });
    iterator.replaceData(new Uint8Array([]), seekTo);
    log_1.Log.verbose(logLevel, `Re-reading took ${Date.now() - time}ms. New position: ${iterator.counter.getOffset()}`);
    currentReader.setCurrent(newReader);
};
exports.seekBackwards = seekBackwards;
