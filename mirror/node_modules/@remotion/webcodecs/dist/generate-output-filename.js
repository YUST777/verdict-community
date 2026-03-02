"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOutputFilename = void 0;
const generateOutputFilename = (source, container) => {
    const filename = typeof source === 'string'
        ? source
        : source instanceof File
            ? source.name
            : 'converted';
    const behindSlash = filename.split('/').pop();
    const withoutExtension = behindSlash.split('.').slice(0, -1).join('.');
    return `${withoutExtension}.${container}`;
};
exports.generateOutputFilename = generateOutputFilename;
