"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebRenderModalLicenseKeyDetails = exports.fetchLicenseKeyDetails = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const colors_1 = require("../../helpers/colors");
const check_circle_filled_1 = require("../../icons/check-circle-filled");
const ValidationMessage_1 = require("../NewComposition/ValidationMessage");
const textStyle = {
    color: colors_1.LIGHT_TEXT,
    fontSize: 14,
    fontFamily: 'sans-serif',
    lineHeight: 1.5,
    display: 'flex',
    alignItems: 'center',
};
const linkStyle = {
    fontSize: 14,
    fontFamily: 'sans-serif',
    lineHeight: 1.5,
    cursor: 'pointer',
};
const bulletStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
};
const icon = {
    width: 14,
    height: 14,
    flexShrink: 0,
};
const PRO_HOST = 'https://remotion.pro';
const fetchLicenseKeyDetails = async (licenseKey) => {
    const response = await fetch(`${PRO_HOST}/api/validate-license-key`, {
        method: 'POST',
        body: JSON.stringify({
            licenseKey,
        }),
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.json();
};
exports.fetchLicenseKeyDetails = fetchLicenseKeyDetails;
const WebRenderModalLicenseKeyDetails = ({ details }) => {
    return (jsx_runtime_1.jsxs("div", { children: [
            jsx_runtime_1.jsxs("div", { style: bulletStyle, children: [
                    jsx_runtime_1.jsx(check_circle_filled_1.CheckCircleFilled, { style: { ...icon, fill: colors_1.LIGHT_TEXT } }), jsx_runtime_1.jsxs("div", { style: textStyle, children: ["Belongs to\u00A0",
                            jsx_runtime_1.jsx("a", { href: `${PRO_HOST}/projects/${details.projectSlug}`, target: "_blank", style: linkStyle, children: details.projectName }),
                            "\u00A0-\u00A0",
                            jsx_runtime_1.jsx("a", { href: `${PRO_HOST}/projects/${details.projectSlug}/usage#client-renders-usage`, target: "_blank", style: linkStyle, children: "View usage" })
                        ] })
                ] }), details.hasActiveSubscription ? (jsx_runtime_1.jsxs("div", { style: bulletStyle, children: [
                    jsx_runtime_1.jsx(check_circle_filled_1.CheckCircleFilled, { style: { ...icon, fill: colors_1.LIGHT_TEXT } }), jsx_runtime_1.jsx("div", { style: textStyle, children: "Active Company License" })
                ] })) : (jsx_runtime_1.jsxs("div", { style: bulletStyle, children: [
                    jsx_runtime_1.jsx(ValidationMessage_1.WarningTriangle, { type: "warning", style: { ...icon, fill: colors_1.WARNING_COLOR } }), jsx_runtime_1.jsx("div", { style: textStyle, children: "No active Company License" })
                ] }))] }));
};
exports.WebRenderModalLicenseKeyDetails = WebRenderModalLicenseKeyDetails;
