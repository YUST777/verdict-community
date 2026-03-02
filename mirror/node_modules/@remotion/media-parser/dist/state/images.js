"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imagesState = void 0;
const imagesState = () => {
    const images = [];
    const addImage = (image) => {
        images.push(image);
    };
    return {
        images,
        addImage,
    };
};
exports.imagesState = imagesState;
