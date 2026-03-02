"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeSimpleBlock = exports.createClusterSegment = exports.CLUSTER_MIN_VINT_WIDTH = void 0;
const matroska_utils_1 = require("./matroska-utils");
exports.CLUSTER_MIN_VINT_WIDTH = 8;
const createClusterSegment = (timestamp) => {
    return (0, matroska_utils_1.makeMatroskaBytes)({
        type: 'Cluster',
        value: [
            {
                type: 'Timestamp',
                minVintWidth: null,
                value: {
                    value: timestamp,
                    byteLength: null,
                },
            },
        ],
        minVintWidth: exports.CLUSTER_MIN_VINT_WIDTH,
    });
};
exports.createClusterSegment = createClusterSegment;
const makeSimpleBlock = ({ bytes, trackNumber, timecodeRelativeToCluster, keyframe, invisible, lacing, }) => {
    const simpleBlockHeader = (0, matroska_utils_1.matroskaToHex)('0xa3');
    const headerByte = (Number(keyframe) << 7) | (Number(invisible) << 3) | (lacing << 1);
    const body = (0, matroska_utils_1.combineUint8Arrays)([
        (0, matroska_utils_1.getVariableInt)(trackNumber, null),
        (0, matroska_utils_1.serializeUint16)(timecodeRelativeToCluster),
        new Uint8Array([headerByte]),
        bytes,
    ]);
    return (0, matroska_utils_1.combineUint8Arrays)([
        simpleBlockHeader,
        (0, matroska_utils_1.getVariableInt)(body.length, null),
        body,
    ]);
};
exports.makeSimpleBlock = makeSimpleBlock;
