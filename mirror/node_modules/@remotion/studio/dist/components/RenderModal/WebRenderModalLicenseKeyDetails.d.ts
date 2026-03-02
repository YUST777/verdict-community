import React from 'react';
export type LicenseKeyDetails = {
    readonly isValid: boolean;
    readonly hasActiveSubscription: boolean;
    readonly projectName: string;
    readonly projectSlug: string;
};
type WebRenderModalLicenseKeyDetailsProps = {
    readonly details: LicenseKeyDetails;
};
export declare const fetchLicenseKeyDetails: (licenseKey: string) => Promise<LicenseKeyDetails>;
export declare const WebRenderModalLicenseKeyDetails: React.FC<WebRenderModalLicenseKeyDetailsProps>;
export {};
