import React from 'react';
type WebRenderModalLicenseProps = {
    readonly licenseKey: string | null;
    readonly setLicenseKey: React.Dispatch<React.SetStateAction<string | null>>;
    readonly initialPublicLicenseKey: string | null;
};
export declare const row: React.CSSProperties;
export declare const WebRenderModalLicense: React.FC<WebRenderModalLicenseProps>;
export {};
