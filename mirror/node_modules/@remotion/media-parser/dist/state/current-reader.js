"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currentReader = void 0;
const currentReader = (initialReader) => {
    let current = initialReader;
    return {
        getCurrent: () => current,
        setCurrent: (newReader) => {
            current = newReader;
        },
    };
};
exports.currentReader = currentReader;
