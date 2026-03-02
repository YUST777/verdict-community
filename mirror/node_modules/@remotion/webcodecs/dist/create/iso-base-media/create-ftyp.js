"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIsoBaseMediaFtyp = exports.createFtyp = void 0;
const matroska_utils_1 = require("../matroska/matroska-utils");
const primitives_1 = require("./primitives");
const createFtyp = ({ majorBrand, minorBrand, compatibleBrands, }) => {
    const type = (0, primitives_1.stringsToUint8Array)('ftyp');
    const majorBrandArr = (0, primitives_1.stringsToUint8Array)(majorBrand);
    const minorBrandArr = (0, primitives_1.numberTo32BitUIntOrInt)(minorBrand);
    const compatibleBrandsArr = (0, matroska_utils_1.combineUint8Arrays)(compatibleBrands.map((b) => (0, primitives_1.stringsToUint8Array)(b)));
    return (0, primitives_1.addSize)((0, matroska_utils_1.combineUint8Arrays)([
        type,
        majorBrandArr,
        minorBrandArr,
        compatibleBrandsArr,
    ]));
};
exports.createFtyp = createFtyp;
const createIsoBaseMediaFtyp = ({ majorBrand, minorBrand, compatibleBrands, }) => {
    return (0, exports.createFtyp)({ compatibleBrands, majorBrand, minorBrand });
};
exports.createIsoBaseMediaFtyp = createIsoBaseMediaFtyp;
