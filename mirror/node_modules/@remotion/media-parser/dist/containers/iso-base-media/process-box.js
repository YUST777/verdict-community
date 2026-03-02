"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processBox = void 0;
const log_1 = require("../../log");
const register_track_1 = require("../../register-track");
const skip_1 = require("../../skip");
const elst_1 = require("./elst");
const esds_1 = require("./esds/esds");
const ftyp_1 = require("./ftyp");
const get_children_1 = require("./get-children");
const make_track_1 = require("./make-track");
const get_editlist_1 = require("./mdat/get-editlist");
const mdhd_1 = require("./mdhd");
const hdlr_1 = require("./meta/hdlr");
const ilst_1 = require("./meta/ilst");
const tfra_1 = require("./mfra/tfra");
const moov_1 = require("./moov/moov");
const mvhd_1 = require("./moov/mvhd");
const trex_1 = require("./moov/trex");
const av1c_1 = require("./stsd/av1c");
const avcc_1 = require("./stsd/avcc");
const colr_1 = require("./stsd/colr");
const ctts_1 = require("./stsd/ctts");
const hvcc_1 = require("./stsd/hvcc");
const keys_1 = require("./stsd/keys");
const mebx_1 = require("./stsd/mebx");
const pasp_1 = require("./stsd/pasp");
const stco_1 = require("./stsd/stco");
const stsc_1 = require("./stsd/stsc");
const stsd_1 = require("./stsd/stsd");
const stss_1 = require("./stsd/stss");
const stsz_1 = require("./stsd/stsz");
const stts_1 = require("./stsd/stts");
const vpcc_1 = require("./stsd/vpcc");
const tfdt_1 = require("./tfdt");
const tfhd_1 = require("./tfhd");
const tkhd_1 = require("./tkhd");
const trak_1 = require("./trak/trak");
const trun_1 = require("./trun");
const processBox = async ({ iterator, logLevel, onlyIfMoovAtomExpected, onlyIfMdatAtomExpected, contentLength, }) => {
    var _a, _b;
    const fileOffset = iterator.counter.getOffset();
    const { returnToCheckpoint } = iterator.startCheckpoint();
    const bytesRemaining = iterator.bytesRemaining();
    const startOff = iterator.counter.getOffset();
    const boxSizeRaw = iterator.getFourByteNumber();
    if (boxSizeRaw === 0) {
        return {
            type: 'box',
            box: {
                type: 'void-box',
                boxSize: 0,
            },
        };
    }
    // If `boxSize === 1`, the 8 bytes after the box type are the size of the box.
    if ((boxSizeRaw === 1 && iterator.bytesRemaining() < 12) ||
        iterator.bytesRemaining() < 4) {
        iterator.counter.decrement(iterator.counter.getOffset() - fileOffset);
        throw new Error(`Expected box size of ${bytesRemaining}, got ${boxSizeRaw}. Incomplete boxes are not allowed.`);
    }
    const maxSize = contentLength - startOff;
    const boxType = iterator.getByteString(4, false);
    const boxSizeUnlimited = boxSizeRaw === 1 ? iterator.getEightByteNumber() : boxSizeRaw;
    const boxSize = Math.min(boxSizeUnlimited, maxSize);
    const headerLength = iterator.counter.getOffset() - startOff;
    if (boxType === 'mdat') {
        if (!onlyIfMdatAtomExpected) {
            return { type: 'nothing' };
        }
        const { mediaSectionState } = onlyIfMdatAtomExpected;
        mediaSectionState.addMediaSection({
            size: boxSize - headerLength,
            start: iterator.counter.getOffset(),
        });
        return { type: 'nothing' };
    }
    if (bytesRemaining < boxSize) {
        returnToCheckpoint();
        return {
            type: 'fetch-more-data',
            bytesNeeded: (0, skip_1.makeFetchMoreData)(boxSize - bytesRemaining),
        };
    }
    if (boxType === 'ftyp') {
        return {
            type: 'box',
            box: (0, ftyp_1.parseFtyp)({ iterator, size: boxSize, offset: fileOffset }),
        };
    }
    if (boxType === 'elst') {
        return {
            type: 'box',
            box: (0, elst_1.parseElst)({
                iterator,
                size: boxSize,
                offset: fileOffset,
            }),
        };
    }
    if (boxType === 'colr') {
        return {
            type: 'box',
            box: (0, colr_1.parseColorParameterBox)({
                iterator,
                size: boxSize,
            }),
        };
    }
    if (boxType === 'mvhd') {
        const mvhdBox = (0, mvhd_1.parseMvhd)({
            iterator,
            offset: fileOffset,
            size: boxSize,
        });
        if (!onlyIfMoovAtomExpected) {
            throw new Error('State is required');
        }
        onlyIfMoovAtomExpected.movieTimeScaleState.setTrackTimescale(mvhdBox.timeScale);
        return {
            type: 'box',
            box: mvhdBox,
        };
    }
    if (boxType === 'tkhd') {
        return {
            type: 'box',
            box: (0, tkhd_1.parseTkhd)({ iterator, offset: fileOffset, size: boxSize }),
        };
    }
    if (boxType === 'trun') {
        return {
            type: 'box',
            box: (0, trun_1.parseTrun)({ iterator, offset: fileOffset, size: boxSize }),
        };
    }
    if (boxType === 'tfdt') {
        return {
            type: 'box',
            box: (0, tfdt_1.parseTfdt)({ iterator, size: boxSize, offset: fileOffset }),
        };
    }
    if (boxType === 'stsd') {
        return {
            type: 'box',
            box: await (0, stsd_1.parseStsd)({
                offset: fileOffset,
                size: boxSize,
                iterator,
                logLevel,
                contentLength,
            }),
        };
    }
    if (boxType === 'stsz') {
        return {
            type: 'box',
            box: (0, stsz_1.parseStsz)({
                iterator,
                offset: fileOffset,
                size: boxSize,
            }),
        };
    }
    if (boxType === 'stco' || boxType === 'co64') {
        return {
            type: 'box',
            box: (0, stco_1.parseStco)({
                iterator,
                offset: fileOffset,
                size: boxSize,
                mode64Bit: boxType === 'co64',
            }),
        };
    }
    if (boxType === 'pasp') {
        return {
            type: 'box',
            box: (0, pasp_1.parsePasp)({
                iterator,
                offset: fileOffset,
                size: boxSize,
            }),
        };
    }
    if (boxType === 'stss') {
        return {
            type: 'box',
            box: (0, stss_1.parseStss)({
                iterator,
                offset: fileOffset,
                boxSize,
            }),
        };
    }
    if (boxType === 'ctts') {
        return {
            type: 'box',
            box: (0, ctts_1.parseCtts)({
                iterator,
                offset: fileOffset,
                size: boxSize,
            }),
        };
    }
    if (boxType === 'stsc') {
        return {
            type: 'box',
            box: (0, stsc_1.parseStsc)({
                iterator,
                offset: fileOffset,
                size: boxSize,
            }),
        };
    }
    if (boxType === 'mebx') {
        return {
            type: 'box',
            box: await (0, mebx_1.parseMebx)({
                offset: fileOffset,
                size: boxSize,
                iterator,
                logLevel,
                contentLength,
            }),
        };
    }
    if (boxType === 'hdlr') {
        return {
            type: 'box',
            box: await (0, hdlr_1.parseHdlr)({ iterator, size: boxSize, offset: fileOffset }),
        };
    }
    if (boxType === 'keys') {
        return {
            type: 'box',
            box: await (0, keys_1.parseKeys)({ iterator, size: boxSize, offset: fileOffset }),
        };
    }
    if (boxType === 'ilst') {
        return {
            type: 'box',
            box: await (0, ilst_1.parseIlstBox)({
                iterator,
                offset: fileOffset,
                size: boxSize,
            }),
        };
    }
    if (boxType === 'tfra') {
        return {
            type: 'box',
            box: await (0, tfra_1.parseTfraBox)({
                iterator,
                offset: fileOffset,
                size: boxSize,
            }),
        };
    }
    if (boxType === 'moov') {
        if (!onlyIfMoovAtomExpected) {
            throw new Error('State is required');
        }
        const { tracks, isoState } = onlyIfMoovAtomExpected;
        if (tracks.hasAllTracks()) {
            iterator.discard(boxSize - 8);
            return { type: 'nothing' };
        }
        if (isoState &&
            isoState.moov.getMoovBoxAndPrecomputed() &&
            !((_a = isoState.moov.getMoovBoxAndPrecomputed()) === null || _a === void 0 ? void 0 : _a.precomputed)) {
            log_1.Log.verbose(logLevel, 'Moov box already parsed, skipping');
            iterator.discard(boxSize - 8);
            return { type: 'nothing' };
        }
        const box = await (0, moov_1.parseMoov)({
            offset: fileOffset,
            size: boxSize,
            onlyIfMoovAtomExpected,
            iterator,
            logLevel,
            contentLength,
        });
        tracks.setIsDone(logLevel);
        return { type: 'box', box };
    }
    if (boxType === 'trak') {
        if (!onlyIfMoovAtomExpected) {
            throw new Error('State is required');
        }
        const { tracks, onAudioTrack, onVideoTrack } = onlyIfMoovAtomExpected;
        const trakBox = await (0, trak_1.parseTrak)({
            size: boxSize,
            offsetAtStart: fileOffset,
            iterator,
            logLevel,
            contentLength,
        });
        const movieTimeScale = onlyIfMoovAtomExpected.movieTimeScaleState.getTrackTimescale();
        if (movieTimeScale === null) {
            throw new Error('Movie timescale is not set');
        }
        const editList = (0, get_editlist_1.findTrackStartTimeInSeconds)({ movieTimeScale, trakBox });
        const transformedTrack = (0, make_track_1.makeBaseMediaTrack)(trakBox, editList);
        if (transformedTrack && transformedTrack.type === 'video') {
            await (0, register_track_1.registerVideoTrack)({
                track: transformedTrack,
                container: 'mp4',
                logLevel,
                onVideoTrack,
                registerVideoSampleCallback: onlyIfMoovAtomExpected.registerVideoSampleCallback,
                tracks,
            });
        }
        if (transformedTrack && transformedTrack.type === 'audio') {
            await (0, register_track_1.registerAudioTrack)({
                track: transformedTrack,
                container: 'mp4',
                registerAudioSampleCallback: onlyIfMoovAtomExpected.registerAudioSampleCallback,
                tracks,
                logLevel,
                onAudioTrack,
            });
        }
        return { type: 'box', box: trakBox };
    }
    if (boxType === 'stts') {
        return {
            type: 'box',
            box: (0, stts_1.parseStts)({
                data: iterator,
                size: boxSize,
                fileOffset,
            }),
        };
    }
    if (boxType === 'avcC') {
        return {
            type: 'box',
            box: (0, avcc_1.parseAvcc)({
                data: iterator,
                size: boxSize,
            }),
        };
    }
    if (boxType === 'vpcC') {
        return {
            type: 'box',
            box: (0, vpcc_1.parseVpcc)({ data: iterator, size: boxSize }),
        };
    }
    if (boxType === 'av1C') {
        return {
            type: 'box',
            box: (0, av1c_1.parseAv1C)({
                data: iterator,
                size: boxSize,
            }),
        };
    }
    if (boxType === 'hvcC') {
        return {
            type: 'box',
            box: (0, hvcc_1.parseHvcc)({
                data: iterator,
                size: boxSize,
                offset: fileOffset,
            }),
        };
    }
    if (boxType === 'tfhd') {
        return {
            type: 'box',
            box: (0, tfhd_1.getTfhd)({
                iterator,
                offset: fileOffset,
                size: boxSize,
            }),
        };
    }
    if (boxType === 'mdhd') {
        return {
            type: 'box',
            box: (0, mdhd_1.parseMdhd)({
                data: iterator,
                size: boxSize,
                fileOffset,
            }),
        };
    }
    if (boxType === 'esds') {
        return {
            type: 'box',
            box: (0, esds_1.parseEsds)({
                data: iterator,
                size: boxSize,
                fileOffset,
            }),
        };
    }
    if (boxType === 'trex') {
        return {
            type: 'box',
            box: (0, trex_1.parseTrex)({ iterator, offset: fileOffset, size: boxSize }),
        };
    }
    if (boxType === 'moof') {
        await ((_b = onlyIfMoovAtomExpected === null || onlyIfMoovAtomExpected === void 0 ? void 0 : onlyIfMoovAtomExpected.isoState) === null || _b === void 0 ? void 0 : _b.mfra.triggerLoad());
    }
    if (boxType === 'mdia' ||
        boxType === 'minf' ||
        boxType === 'stbl' ||
        boxType === 'udta' ||
        boxType === 'moof' ||
        boxType === 'dims' ||
        boxType === 'meta' ||
        boxType === 'wave' ||
        boxType === 'traf' ||
        boxType === 'mfra' ||
        boxType === 'edts' ||
        boxType === 'mvex' ||
        boxType === 'stsb') {
        const children = await (0, get_children_1.getIsoBaseMediaChildren)({
            iterator,
            size: boxSize - 8,
            logLevel,
            onlyIfMoovAtomExpected,
            contentLength,
        });
        return {
            type: 'box',
            box: {
                type: 'regular-box',
                boxType,
                boxSize,
                children,
                offset: fileOffset,
            },
        };
    }
    iterator.discard(boxSize - 8);
    log_1.Log.verbose(logLevel, 'Unknown ISO Base Media Box:', boxType);
    return {
        type: 'box',
        box: {
            type: 'regular-box',
            boxType,
            boxSize,
            children: [],
            offset: fileOffset,
        },
    };
};
exports.processBox = processBox;
