"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMedia = void 0;
const create_iso_base_media_1 = require("./create/iso-base-media/create-iso-base-media");
const create_matroska_media_1 = require("./create/matroska/create-matroska-media");
const create_wav_1 = require("./create/wav/create-wav");
const createMedia = (params) => {
    if (params.container === 'mp4') {
        return (0, create_iso_base_media_1.createIsoBaseMedia)(params);
    }
    if (params.container === 'wav') {
        return (0, create_wav_1.createWav)(params);
    }
    if (params.container === 'webm') {
        return (0, create_matroska_media_1.createMatroskaMedia)(params);
    }
    throw new Error(`Unsupported container: ${params.container}`);
};
exports.createMedia = createMedia;
