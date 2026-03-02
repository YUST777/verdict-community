"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseVorbisComment = void 0;
const parseVorbisComment = ({ state, iterator, size, }) => {
    const { expectNoMoreBytes } = iterator.startBox(size);
    const box = {
        type: 'flac-vorbis-comment',
        fields: [],
    };
    const vendorLength = iterator.getUint32Le();
    const vendorString = iterator.getByteString(vendorLength, true);
    const numberOfFields = iterator.getUint32Le();
    box.fields.push({ key: 'vendor', value: vendorString, trackId: null });
    for (let i = 0; i < numberOfFields; i++) {
        const fieldLength = iterator.getUint32Le();
        const field = iterator.getByteString(fieldLength, true);
        const [key, value] = field.split('=');
        box.fields.push({ key: key.toLowerCase(), value, trackId: null });
    }
    state.structure.getFlacStructure().boxes.push(box);
    expectNoMoreBytes();
    return Promise.resolve(null);
};
exports.parseVorbisComment = parseVorbisComment;
