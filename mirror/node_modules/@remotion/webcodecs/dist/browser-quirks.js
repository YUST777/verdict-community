"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isChrome = exports.isSafari = exports.isFirefox = void 0;
const isFirefox = () => {
    return navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
};
exports.isFirefox = isFirefox;
const isSafari = () => {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};
exports.isSafari = isSafari;
const isChrome = () => {
    return navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
};
exports.isChrome = isChrome;
