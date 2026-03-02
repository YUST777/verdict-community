"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMetaBlock = void 0;
const parse_metadata_1 = require("./parse-metadata");
const parse_streaminfo_1 = require("./parse-streaminfo");
const parse_unknown_block_1 = require("./parse-unknown-block");
const flacTypes = {
    streaminfo: 0,
    vorbisComment: 4,
};
const parseMetaBlock = ({ iterator, state, }) => {
    iterator.startReadingBits();
    const isLastMetadata = iterator.getBits(1);
    const metaBlockType = iterator.getBits(7);
    iterator.stopReadingBits();
    const size = iterator.getUint24();
    if (isLastMetadata) {
        state.mediaSection.addMediaSection({
            start: iterator.counter.getOffset() + size,
            size: state.contentLength - iterator.counter.getOffset() - size,
        });
    }
    if (metaBlockType === flacTypes.streaminfo) {
        return (0, parse_streaminfo_1.parseStreamInfo)({ iterator, state });
    }
    if (metaBlockType === flacTypes.vorbisComment) {
        return (0, parse_metadata_1.parseVorbisComment)({ iterator, state, size });
    }
    return (0, parse_unknown_block_1.parseFlacUnkownBlock)({ iterator, state, size });
};
exports.parseMetaBlock = parseMetaBlock;
