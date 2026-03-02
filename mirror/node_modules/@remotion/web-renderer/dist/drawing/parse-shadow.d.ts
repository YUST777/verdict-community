export interface ShadowBase {
    offsetX: number;
    offsetY: number;
    blurRadius: number;
    color: string;
}
export declare const parseShadowValues: (shadowValue: string) => ShadowBase[];
