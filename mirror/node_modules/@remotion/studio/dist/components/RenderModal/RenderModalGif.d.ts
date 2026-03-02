import React from 'react';
export declare const RenderModalGif: React.FC<{
    readonly limitNumberOfGifLoops: boolean;
    readonly setLimitNumberOfGifLoops: (value: React.SetStateAction<boolean>) => void;
    readonly numberOfGifLoopsSetting: number;
    readonly setNumberOfGifLoopsSetting: React.Dispatch<React.SetStateAction<number>>;
    readonly everyNthFrame: number;
    readonly setEveryNthFrameSetting: React.Dispatch<React.SetStateAction<number>>;
}>;
