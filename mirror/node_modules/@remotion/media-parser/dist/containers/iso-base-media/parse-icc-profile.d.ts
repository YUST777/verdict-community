type Point = {
    x: number;
    y: number;
    z: number;
};
export type IccProfile = {
    size: number;
    preferredCMMType: string;
    profileVersion: string;
    profileDeviceClass: string;
    colorSpace: string;
    pcs: string;
    dateTime: Uint8Array;
    signature: string;
    primaryPlatform: string;
    profileFlags: number;
    deviceManufacturer: string;
    deviceModel: string;
    deviceAttributes: bigint;
    renderingIntent: number;
    pcsIlluminant: [number, number, number];
    profileCreator: string;
    profileId: string;
    entries: Entry[];
    rXYZ: Point | null;
    gXYZ: Point | null;
    bXYZ: Point | null;
    whitePoint: Point | null;
};
type Entry = {
    tag: string;
    size: number;
    offset: number;
};
export declare const parseIccProfile: (data: Uint8Array) => IccProfile;
export {};
