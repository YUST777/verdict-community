"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getElstBox = exports.getTrakBoxByTrackId = exports.getTfraBoxes = exports.getTfraBoxesFromMfraBoxChildren = exports.getTrexBoxes = exports.getMvexBox = exports.getTrunBoxes = exports.getTfhdBox = exports.getTfdtBox = exports.getStssBox = exports.getStscBox = exports.getStszBox = exports.getCttsBox = exports.getSttsBox = exports.getStcoBox = exports.getVideoDescriptors = exports.getStsdBox = exports.getStblBox = exports.getMdhdBox = exports.getMdiaBox = exports.getTkhdBox = exports.getTraks = exports.getMvhdBox = exports.getMoofBoxes = exports.getMoovBoxFromState = exports.getMoovFromFromIsoStructure = exports.getFtypBox = void 0;
const precomputed_moof_1 = require("../../state/iso-base-media/precomputed-moof");
const getFtypBox = (segments) => {
    const ftypBox = segments.find((s) => s.type === 'ftyp-box');
    if (!ftypBox || ftypBox.type !== 'ftyp-box') {
        return null;
    }
    return ftypBox;
};
exports.getFtypBox = getFtypBox;
const getMoovFromFromIsoStructure = (structure) => {
    const moovBox = structure.boxes.find((s) => s.type === 'moov-box');
    if (!moovBox || moovBox.type !== 'moov-box') {
        return null;
    }
    return moovBox;
};
exports.getMoovFromFromIsoStructure = getMoovFromFromIsoStructure;
const getMoovBoxFromState = ({ structureState, isoState, mp4HeaderSegment, mayUsePrecomputed, }) => {
    const got = isoState.moov.getMoovBoxAndPrecomputed();
    if (got && (mayUsePrecomputed || !got.precomputed)) {
        return got.moovBox;
    }
    if (mp4HeaderSegment) {
        return (0, exports.getMoovFromFromIsoStructure)(mp4HeaderSegment);
    }
    const structure = structureState.getIsoStructure();
    return (0, exports.getMoovFromFromIsoStructure)(structure);
};
exports.getMoovBoxFromState = getMoovBoxFromState;
const getMoofBoxes = (main) => {
    const moofBoxes = main.filter((s) => s.type === 'regular-box' && s.boxType === 'moof');
    return moofBoxes.map((m) => (0, precomputed_moof_1.toMoofBox)(m));
};
exports.getMoofBoxes = getMoofBoxes;
const getMvhdBox = (moovBox) => {
    const mvHdBox = moovBox.children.find((s) => s.type === 'mvhd-box');
    if (!mvHdBox || mvHdBox.type !== 'mvhd-box') {
        return null;
    }
    return mvHdBox;
};
exports.getMvhdBox = getMvhdBox;
const getTraks = (moovBox) => {
    return moovBox.children.filter((s) => s.type === 'trak-box');
};
exports.getTraks = getTraks;
const getTkhdBox = (trakBox) => {
    const tkhdBox = trakBox.children.find((s) => s.type === 'tkhd-box');
    return tkhdBox;
};
exports.getTkhdBox = getTkhdBox;
const getMdiaBox = (trakBox) => {
    const mdiaBox = trakBox.children.find((s) => s.type === 'regular-box' && s.boxType === 'mdia');
    if (!mdiaBox || mdiaBox.type !== 'regular-box') {
        return null;
    }
    return mdiaBox;
};
exports.getMdiaBox = getMdiaBox;
const getMdhdBox = (trakBox) => {
    const mdiaBox = (0, exports.getMdiaBox)(trakBox);
    if (!mdiaBox) {
        return null;
    }
    const mdhdBox = mdiaBox.children.find((c) => c.type === 'mdhd-box');
    return mdhdBox;
};
exports.getMdhdBox = getMdhdBox;
const getStblBox = (trakBox) => {
    const mdiaBox = (0, exports.getMdiaBox)(trakBox);
    if (!mdiaBox) {
        return null;
    }
    const minfBox = mdiaBox.children.find((s) => s.type === 'regular-box' && s.boxType === 'minf');
    if (!minfBox || minfBox.type !== 'regular-box') {
        return null;
    }
    const stblBox = minfBox.children.find((s) => s.type === 'regular-box' && s.boxType === 'stbl');
    if (!stblBox || stblBox.type !== 'regular-box') {
        return null;
    }
    return stblBox;
};
exports.getStblBox = getStblBox;
const getStsdBox = (trakBox) => {
    const stblBox = (0, exports.getStblBox)(trakBox);
    if (!stblBox || stblBox.type !== 'regular-box') {
        return null;
    }
    const stsdBox = stblBox.children.find((s) => s.type === 'stsd-box');
    return stsdBox;
};
exports.getStsdBox = getStsdBox;
const getVideoDescriptors = (trakBox) => {
    var _a;
    const stsdBox = (0, exports.getStsdBox)(trakBox);
    if (!stsdBox) {
        return null;
    }
    const descriptors = stsdBox.samples.map((s) => {
        return s.type === 'video'
            ? s.descriptors.map((d) => {
                return d.type === 'avcc-box'
                    ? d.privateData
                    : d.type === 'hvcc-box'
                        ? d.privateData
                        : null;
            })
            : [];
    });
    return (_a = descriptors.flat(1).filter(Boolean)[0]) !== null && _a !== void 0 ? _a : null;
};
exports.getVideoDescriptors = getVideoDescriptors;
const getStcoBox = (trakBox) => {
    const stblBox = (0, exports.getStblBox)(trakBox);
    if (!stblBox || stblBox.type !== 'regular-box') {
        return null;
    }
    const stcoBox = stblBox.children.find((s) => s.type === 'stco-box');
    return stcoBox;
};
exports.getStcoBox = getStcoBox;
const getSttsBox = (trakBox) => {
    const stblBox = (0, exports.getStblBox)(trakBox);
    if (!stblBox || stblBox.type !== 'regular-box') {
        return null;
    }
    const sttsBox = stblBox.children.find((s) => s.type === 'stts-box');
    return sttsBox;
};
exports.getSttsBox = getSttsBox;
const getCttsBox = (trakBox) => {
    const stblBox = (0, exports.getStblBox)(trakBox);
    if (!stblBox || stblBox.type !== 'regular-box') {
        return null;
    }
    const cttsBox = stblBox.children.find((s) => s.type === 'ctts-box');
    return cttsBox;
};
exports.getCttsBox = getCttsBox;
const getStszBox = (trakBox) => {
    const stblBox = (0, exports.getStblBox)(trakBox);
    if (!stblBox || stblBox.type !== 'regular-box') {
        return null;
    }
    const stszBox = stblBox.children.find((s) => s.type === 'stsz-box');
    return stszBox;
};
exports.getStszBox = getStszBox;
const getStscBox = (trakBox) => {
    const stblBox = (0, exports.getStblBox)(trakBox);
    if (!stblBox || stblBox.type !== 'regular-box') {
        return null;
    }
    const stcoBox = stblBox.children.find((b) => b.type === 'stsc-box');
    return stcoBox;
};
exports.getStscBox = getStscBox;
const getStssBox = (trakBox) => {
    const stblBox = (0, exports.getStblBox)(trakBox);
    if (!stblBox || stblBox.type !== 'regular-box') {
        return null;
    }
    const stssBox = stblBox.children.find((b) => b.type === 'stss-box');
    return stssBox;
};
exports.getStssBox = getStssBox;
const getTfdtBox = (segment) => {
    if (segment.type !== 'regular-box' || segment.boxType !== 'traf') {
        throw new Error('Expected traf-box');
    }
    const tfhdBox = segment.children.find((c) => c.type === 'tfdt-box');
    if (!tfhdBox || tfhdBox.type !== 'tfdt-box') {
        throw new Error('Expected tfhd-box');
    }
    return tfhdBox;
};
exports.getTfdtBox = getTfdtBox;
const getTfhdBox = (segment) => {
    if (segment.type !== 'regular-box' || segment.boxType !== 'traf') {
        throw new Error('Expected traf-box');
    }
    const tfhdBox = segment.children.find((c) => c.type === 'tfhd-box');
    if (!tfhdBox || tfhdBox.type !== 'tfhd-box') {
        throw new Error('Expected tfhd-box');
    }
    return tfhdBox;
};
exports.getTfhdBox = getTfhdBox;
const getTrunBoxes = (segment) => {
    if (segment.type !== 'regular-box' || segment.boxType !== 'traf') {
        throw new Error('Expected traf-box');
    }
    const trunBoxes = segment.children.filter((c) => c.type === 'trun-box');
    return trunBoxes;
};
exports.getTrunBoxes = getTrunBoxes;
const getMvexBox = (moovAtom) => {
    const mvexBox = moovAtom.children.find((s) => s.type === 'regular-box' && s.boxType === 'mvex');
    if (!mvexBox || mvexBox.type !== 'regular-box') {
        return null;
    }
    return mvexBox;
};
exports.getMvexBox = getMvexBox;
const getTrexBoxes = (moovAtom) => {
    const mvexBox = (0, exports.getMvexBox)(moovAtom);
    if (!mvexBox) {
        return [];
    }
    const trexBoxes = mvexBox.children.filter((c) => c.type === 'trex-box');
    return trexBoxes;
};
exports.getTrexBoxes = getTrexBoxes;
const getTfraBoxesFromMfraBoxChildren = (mfraBoxChildren) => {
    const tfraBoxes = mfraBoxChildren.filter((b) => b.type === 'tfra-box');
    return tfraBoxes;
};
exports.getTfraBoxesFromMfraBoxChildren = getTfraBoxesFromMfraBoxChildren;
const getTfraBoxes = (structure) => {
    const mfraBox = structure.find((b) => b.type === 'regular-box' && b.boxType === 'mfra');
    if (!mfraBox) {
        return [];
    }
    return (0, exports.getTfraBoxesFromMfraBoxChildren)(mfraBox.children);
};
exports.getTfraBoxes = getTfraBoxes;
const getTrakBoxByTrackId = (moovBox, trackId) => {
    var _a;
    const trakBoxes = (0, exports.getTraks)(moovBox);
    return ((_a = trakBoxes.find((t) => {
        const tkhd = (0, exports.getTkhdBox)(t);
        if (!tkhd) {
            return false;
        }
        return tkhd.trackId === trackId;
    })) !== null && _a !== void 0 ? _a : null);
};
exports.getTrakBoxByTrackId = getTrakBoxByTrackId;
const getElstBox = (trakBox) => {
    const edtsBox = trakBox.children.find((s) => s.type === 'regular-box' && s.boxType === 'edts');
    if (!edtsBox || edtsBox.type !== 'regular-box') {
        return null;
    }
    const elstBox = edtsBox.children.find((s) => s.type === 'elst-box');
    return elstBox;
};
exports.getElstBox = getElstBox;
