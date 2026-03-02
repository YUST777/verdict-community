"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDisplayAspectRatio = exports.applyAspectRatios = exports.applyTkhdBox = exports.getColrBox = exports.getSampleAspectRatio = exports.getHvccBox = exports.getPaspBox = exports.getAv1CBox = exports.getVpccBox = exports.getAvccBox = exports.getStsdVideoConfig = void 0;
const traversal_1 = require("./containers/iso-base-media/traversal");
const getStsdVideoConfig = (trakBox) => {
    const stsdBox = (0, traversal_1.getStsdBox)(trakBox);
    if (!stsdBox) {
        return null;
    }
    const videoConfig = stsdBox.samples.find((s) => s.type === 'video');
    if (!videoConfig || videoConfig.type !== 'video') {
        return null;
    }
    return videoConfig;
};
exports.getStsdVideoConfig = getStsdVideoConfig;
const getAvccBox = (trakBox) => {
    const videoConfig = (0, exports.getStsdVideoConfig)(trakBox);
    if (!videoConfig) {
        return null;
    }
    const avccBox = videoConfig.descriptors.find((c) => c.type === 'avcc-box');
    if (!avccBox || avccBox.type !== 'avcc-box') {
        return null;
    }
    return avccBox;
};
exports.getAvccBox = getAvccBox;
const getVpccBox = (trakBox) => {
    const videoConfig = (0, exports.getStsdVideoConfig)(trakBox);
    if (!videoConfig) {
        return null;
    }
    const vpccBox = videoConfig.descriptors.find((c) => c.type === 'vpcc-box');
    if (!vpccBox || vpccBox.type !== 'vpcc-box') {
        return null;
    }
    return vpccBox;
};
exports.getVpccBox = getVpccBox;
const getAv1CBox = (trakBox) => {
    const videoConfig = (0, exports.getStsdVideoConfig)(trakBox);
    if (!videoConfig) {
        return null;
    }
    const av1cBox = videoConfig.descriptors.find((c) => c.type === 'av1C-box');
    if (!av1cBox || av1cBox.type !== 'av1C-box') {
        return null;
    }
    return av1cBox;
};
exports.getAv1CBox = getAv1CBox;
const getPaspBox = (trakBox) => {
    const videoConfig = (0, exports.getStsdVideoConfig)(trakBox);
    if (!videoConfig) {
        return null;
    }
    const paspBox = videoConfig.descriptors.find((c) => c.type === 'pasp-box');
    if (!paspBox || paspBox.type !== 'pasp-box') {
        return null;
    }
    return paspBox;
};
exports.getPaspBox = getPaspBox;
const getHvccBox = (trakBox) => {
    const videoConfig = (0, exports.getStsdVideoConfig)(trakBox);
    if (!videoConfig) {
        return null;
    }
    const hvccBox = videoConfig.descriptors.find((c) => c.type === 'hvcc-box');
    if (!hvccBox || hvccBox.type !== 'hvcc-box') {
        return null;
    }
    return hvccBox;
};
exports.getHvccBox = getHvccBox;
const getSampleAspectRatio = (trakBox) => {
    const paspBox = (0, exports.getPaspBox)(trakBox);
    if (!paspBox) {
        return {
            numerator: 1,
            denominator: 1,
        };
    }
    return {
        numerator: paspBox.hSpacing,
        denominator: paspBox.vSpacing,
    };
};
exports.getSampleAspectRatio = getSampleAspectRatio;
const getColrBox = (videoSample) => {
    const colrBox = videoSample.descriptors.find((c) => c.type === 'colr-box');
    if (!colrBox || colrBox.type !== 'colr-box') {
        return null;
    }
    return colrBox;
};
exports.getColrBox = getColrBox;
const applyTkhdBox = (aspectRatioApplied, tkhdBox) => {
    if (tkhdBox === null || tkhdBox.rotation === 0) {
        return {
            displayAspectWidth: aspectRatioApplied.width,
            displayAspectHeight: aspectRatioApplied.height,
            width: aspectRatioApplied.width,
            height: aspectRatioApplied.height,
            rotation: 0,
        };
    }
    return {
        width: tkhdBox.width,
        height: tkhdBox.height,
        rotation: tkhdBox.rotation,
        displayAspectWidth: aspectRatioApplied.width,
        displayAspectHeight: aspectRatioApplied.height,
    };
};
exports.applyTkhdBox = applyTkhdBox;
const applyAspectRatios = ({ dimensions, sampleAspectRatio, displayAspectRatio, }) => {
    if (displayAspectRatio.numerator === 0) {
        return dimensions;
    }
    if (displayAspectRatio.denominator === 0) {
        return dimensions;
    }
    const newWidth = Math.round((dimensions.width * sampleAspectRatio.numerator) /
        sampleAspectRatio.denominator);
    const newHeight = Math.floor(newWidth / (displayAspectRatio.numerator / displayAspectRatio.denominator));
    return {
        width: Math.floor(newWidth),
        height: newHeight,
    };
};
exports.applyAspectRatios = applyAspectRatios;
function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}
function reduceFraction(numerator, denominator) {
    const greatestCommonDivisor = gcd(Math.abs(numerator), Math.abs(denominator));
    return {
        numerator: numerator / greatestCommonDivisor,
        denominator: denominator / greatestCommonDivisor,
    };
}
const getDisplayAspectRatio = ({ sampleAspectRatio, nativeDimensions, }) => {
    const num = Math.round(nativeDimensions.width * sampleAspectRatio.numerator);
    const den = Math.round(nativeDimensions.height * sampleAspectRatio.denominator);
    return reduceFraction(num, den);
};
exports.getDisplayAspectRatio = getDisplayAspectRatio;
