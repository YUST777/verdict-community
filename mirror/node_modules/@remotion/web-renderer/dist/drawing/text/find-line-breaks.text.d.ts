type Token = {
    text: string;
    rect: DOMRect;
};
export declare const findWords: (span: HTMLSpanElement) => Token[];
export {};
