"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTkhd = void 0;
const to_date_1 = require("./to-date");
function getRotationAngleFromMatrix(matrix) {
    // Extract elements from the matrix
    const [a, b, c, d] = matrix;
    if (a === 0 && b === 0 && c === 0 && d === 0) {
        return 0;
    }
    // Check if the matrix is a valid rotation matrix
    if (Math.round(a * a + b * b) !== 1 || Math.round(c * c + d * d) !== 1) {
        throw new Error('The provided matrix is not a valid rotation matrix.');
    }
    // Calculate the angle using the atan2 function
    const angleRadians = Math.atan2(c, a); // atan2(sin(θ), cos(θ))
    const angleDegrees = angleRadians * (180 / Math.PI); // Convert radians to degrees
    return angleDegrees;
}
const applyRotation = ({ matrix, width, height, }) => {
    const newWidth = matrix[0] * width + matrix[1] * height; // 0*3840 + 1*2160
    const newHeight = matrix[2] * width + matrix[3] * height; // -1*3840 + 0*2160
    return {
        width: Math.abs(newWidth),
        height: Math.abs(newHeight),
    };
};
const parseTkhd = ({ iterator, offset, size, }) => {
    const version = iterator.getUint8();
    // Flags, we discard them
    iterator.discard(3);
    const creationTime = version === 1 ? iterator.getUint64() : iterator.getUint32();
    const modificationTime = version === 1 ? iterator.getUint64() : iterator.getUint32();
    const trackId = iterator.getUint32();
    // reserved
    iterator.discard(4);
    const duration = version === 1 ? iterator.getUint64() : iterator.getUint32();
    // reserved 2
    iterator.discard(4);
    // reserved 3
    iterator.discard(4);
    const layer = iterator.getUint16();
    const alternateGroup = iterator.getUint16();
    const volume = iterator.getUint16();
    // reserved 4
    iterator.discard(2);
    const matrix = [
        iterator.getFixedPointSigned1616Number(),
        iterator.getFixedPointSigned1616Number(),
        iterator.getFixedPointSigned230Number(),
        iterator.getFixedPointSigned1616Number(),
        iterator.getFixedPointSigned1616Number(),
        iterator.getFixedPointSigned230Number(),
        iterator.getFixedPointSigned1616Number(),
        iterator.getFixedPointSigned1616Number(),
        iterator.getFixedPointSigned230Number(),
    ];
    const rotationMatrix = [matrix[0], matrix[1], matrix[3], matrix[4]];
    const widthWithoutRotationApplied = iterator.getFixedPointUnsigned1616Number();
    const heightWithoutRotationApplied = iterator.getFixedPointSigned1616Number();
    const { width, height } = applyRotation({
        matrix: rotationMatrix,
        width: widthWithoutRotationApplied,
        height: heightWithoutRotationApplied,
    });
    const rotation = getRotationAngleFromMatrix(rotationMatrix);
    return {
        offset,
        boxSize: size,
        type: 'tkhd-box',
        creationTime: (0, to_date_1.toUnixTimestamp)(Number(creationTime)),
        modificationTime: (0, to_date_1.toUnixTimestamp)(Number(modificationTime)),
        trackId,
        duration: Number(duration),
        layer,
        alternateGroup,
        volume,
        matrix: matrix,
        width,
        height,
        version,
        rotation,
        unrotatedWidth: widthWithoutRotationApplied,
        unrotatedHeight: heightWithoutRotationApplied,
    };
};
exports.parseTkhd = parseTkhd;
