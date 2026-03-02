import type { Reader } from '../readers/reader';
export declare const currentReader: (initialReader: Reader) => {
    getCurrent: () => Reader;
    setCurrent: (newReader: Reader) => void;
};
export type CurrentReader = ReturnType<typeof currentReader>;
