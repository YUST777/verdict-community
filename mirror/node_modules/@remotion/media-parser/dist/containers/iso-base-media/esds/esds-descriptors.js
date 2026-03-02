"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDescriptors = exports.processDescriptor = void 0;
const decoder_specific_config_1 = require("./decoder-specific-config");
const mapToObjectAudioIndicator = (num) => {
    // https://chromium.googlesource.com/chromium/src/media/+/master/formats/mp4/es_descriptor.h
    // http://netmedia.zju.edu.cn/multimedia2013/mpeg-4/ISO%20IEC%2014496-1%20MPEG-4%20System%20Standard.pdf
    // Page 42, table 8
    if (num === 0x40) {
        return 'aac';
    }
    if (num === 0x6b) {
        return 'mp3';
    }
    return 'unknown';
};
const processDescriptor = ({ iterator, }) => {
    const tag = iterator.getUint8();
    if (tag === 4) {
        const size = iterator.getPaddedFourByteNumber();
        const initialOffset = iterator.counter.getOffset();
        const objectTypeIndication = iterator.getUint8();
        iterator.startReadingBits();
        const streamType = iterator.getBits(6);
        const upStream = iterator.getBits(1);
        // reserved
        iterator.getBits(1);
        const bufferSizeDB = iterator.getBits(24);
        iterator.stopReadingBits();
        const maxBitrate = iterator.getUint32();
        const avgBitrate = iterator.getUint32();
        const decoderSpecificConfigs = [];
        while (size - (iterator.counter.getOffset() - initialOffset) > 0) {
            const decoderSpecificConfig = (0, decoder_specific_config_1.parseDecoderSpecificConfig)(iterator);
            decoderSpecificConfigs.push(decoderSpecificConfig);
        }
        return {
            descriptor: {
                type: 'decoder-config-descriptor',
                objectTypeIndication: mapToObjectAudioIndicator(objectTypeIndication),
                asNumber: objectTypeIndication,
                bufferSizeDB,
                streamType,
                upStream,
                avgBitrate,
                maxBitrate,
                decoderSpecificConfigs,
            },
        };
    }
    if (tag === 6) {
        const size = iterator.getPaddedFourByteNumber();
        iterator.discard(size);
        return {
            descriptor: {
                type: 'sl-config-descriptor',
            },
        };
    }
    return {
        descriptor: null,
    };
};
exports.processDescriptor = processDescriptor;
const parseDescriptors = (iterator, maxBytes) => {
    const descriptors = [];
    const initialOffset = iterator.counter.getOffset();
    while (iterator.bytesRemaining() > 0 &&
        iterator.counter.getOffset() - initialOffset < maxBytes) {
        const { descriptor } = (0, exports.processDescriptor)({
            iterator,
        });
        if (descriptor) {
            descriptors.push(descriptor);
        }
        else {
            break;
        }
    }
    return descriptors;
};
exports.parseDescriptors = parseDescriptors;
